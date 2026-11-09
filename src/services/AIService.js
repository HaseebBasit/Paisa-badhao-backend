const OpenAI = require('openai');
const AIConversation = require('../models/AIConversation');
const AIMessage = require('../models/AIMessage');
const Wallet = require('../models/Wallet');
const PortfolioHolding = require('../models/PortfolioHolding');
const LearningProgress = require('../models/LearningProgress');

let openaiClient = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '' && !process.env.OPENAI_API_KEY.includes('your_openai_api_key')) {
  openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

class AIService {
  async getOrCreateConversation(userId, conversationId = null) {
    if (conversationId) {
      const conv = await AIConversation.findOne({ _id: conversationId, user: userId });
      if (conv) return conv;
    }

    const conv = await AIConversation.create({
      user: userId,
      title: 'New Financial Consultation',
    });
    return conv;
  }

  async getUserConversations(userId) {
    return await AIConversation.find({ user: userId }).sort({ updatedAt: -1 });
  }

  async getConversationMessages(userId, conversationId) {
    return await AIMessage.find({ user: userId, conversationId }).sort({ createdAt: 1 });
  }

  async deleteConversation(userId, conversationId) {
    await AIMessage.deleteMany({ user: userId, conversationId });
    return await AIConversation.findOneAndDelete({ _id: conversationId, user: userId });
  }

  async generateFallbackResponse(userPrompt, userContext = null) {
    const prompt = (userPrompt || '').toLowerCase();

    // Check for Urdu / Roman Urdu greetings and topics
    const isRomanUrdu = /kya|kaise|karo|batao|apna|paisa|mujhe|hain|hai|salam|shukriya|barhao|seekhna/.test(prompt);

    if (prompt.includes('troix') || prompt.includes('coin') || prompt.includes('balance') || prompt.includes('starting')) {
      if (isRomanUrdu) {
        return `PAISA BADHAO par har naye user ko registration par bilkul muft 100,000 TROIX starting virtual capital milta hai. Is virtual currency se aap bina kisi real-money risk ke PSX (Pakistan Stock Exchange) ke stocks jaise MEBL, LUCK, FFC, SAZEW, aur PSO par trading ki practice kar sakte hain!`;
      }
      return `On PAISA BADHAO, every newly registered user receives exactly 100,000 TROIX as virtual trading capital. You can practice buying and selling Pakistan Stock Exchange (PSX) stocks including MEBL, LUCK, FFC, SAZEW, and PSO without risking real money!`;
    }

    if (prompt.includes('psx') || prompt.includes('stock') || prompt.includes('share') || prompt.includes('mebl') || prompt.includes('kse')) {
      if (isRomanUrdu) {
        return `Pakistan Stock Exchange (PSX) Pakistan ka markazi stock exchange hai jahan mulk ki bari companies list hoti hain. KSE-100 index market ki overall health ko zahir karta hai. PAISA BADHAO par aap Virtual Trading terminal khol kar historical simulation ke zariye live chart playback dekh sakte hain aur orders place kar sakte hain.`;
      }
      return `The Pakistan Stock Exchange (PSX) is the primary equity market of Pakistan. The KSE-100 index serves as the benchmark for market capitalization and liquidity. On PAISA BADHAO, you can practice reading candlestick charts, analyzing volume, and executing risk-managed virtual trades in our dark-themed Trading Terminal.`;
    }

    if (prompt.includes('inflation') || prompt.includes('mehangai') || prompt.includes('purchasing power')) {
      if (isRomanUrdu) {
        return `Mehangai (Inflation) aapke cash ki purchasing power ko waqt ke sath kam kar deti hai. Agar aapka paisa sirf tijori ya regular current account mein para rahega, toh 15% inflation par 5 saal mein uski qeemat aadhi reh jayegi. Hamara Inflation Calculator zaroor istemal karein taake aap dekh sakein ke stocks aur compound growth mehangai ko kaise beat karte hain!`;
      }
      return `Inflation acts as a silent tax that erodes purchasing power over time. If money sits idle in cash during a 15% inflation environment, its real purchasing capacity drops significantly within 5 years. Check our interactive Inflation Calculator to compare Cash vs Bank Savings vs Productive Equities!`;
    }

    if (prompt.includes('portfolio') || prompt.includes('holdings') || prompt.includes('balance') || prompt.includes('meri trading')) {
      if (userContext && userContext.walletBalance !== undefined) {
        if (isRomanUrdu) {
          return `Aapka current available balance ${userContext.walletBalance.toLocaleString()} TROIX hai. Aapke portfolio mein is waqt ${userContext.holdingsCount} stocks hain. Samajhdari se invest karein aur portfolio ko hamesha mukhtalif sectors mein diversify rakhein!`;
        }
        return `Your current available balance is ${userContext.walletBalance.toLocaleString()} TROIX with ${userContext.holdingsCount} active stock holding(s). Remember to maintain disciplined position sizing and risk management!`;
      }
    }

    if (isRomanUrdu) {
      return `Main Paisa Dost hoon — PAISA BADHAO ka smart AI financial assistant! Main PSX stock market, financial literacy, TROIX virtual trading, inflation calculator aur portfolio diversification mein aapki madad kar sakta hoon. Aap mujh se kisi bhi financial concept ya platform feature ke bare mein pooch sakte hain!`;
    }

    return `Hello! I am Paisa Dost, your dedicated AI financial mentor on PAISA BADHAO. I can guide you through the Pakistan Stock Exchange (PSX), virtual trading with TROIX, financial literacy modules, inflation protection, and portfolio diversification. How can I assist your financial journey today?`;
  }

  async processMessage({ userId, conversationId, message }) {
    if (!message || message.trim() === '') {
      const err = new Error('Message content cannot be empty.');
      err.statusCode = 400;
      throw err;
    }

    const conv = await this.getOrCreateConversation(userId, conversationId);

    // Save user message
    const userMsg = await AIMessage.create({
      conversationId: conv._id,
      user: userId,
      role: 'user',
      content: message,
    });

    // Fetch authorized user financial context
    let userContext = null;
    if (userId) {
      const wallet = await Wallet.findOne({ user: userId });
      const holdings = await PortfolioHolding.find({ user: userId });
      const completedModules = await LearningProgress.countDocuments({ user: userId, isCompleted: true });

      userContext = {
        walletBalance: wallet ? wallet.balance : 100000,
        currency: 'TROIX',
        holdingsCount: holdings.length,
        holdingsSummary: holdings.map((h) => `${h.symbol}: ${h.quantity} shares`).join(', ') || 'No current holdings',
        completedModulesCount: completedModules,
      };
    }

    let assistantReply = '';

    if (openaiClient) {
      try {
        const recentMessages = await AIMessage.find({ conversationId: conv._id })
          .sort({ createdAt: -1 })
          .limit(8);

        const formattedHistory = recentMessages.reverse().map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const systemPrompt = `You are "Paisa Dost", the friendly, expert, and encouraging AI Financial Mentor and Platform Assistant for "PAISA BADHAO" (Apna Paisa Barhao, Samajhdari Se Lagao).
Your mission is to help Pakistanis achieve financial literacy, understand the Pakistan Stock Exchange (PSX), learn disciplined investing, and master virtual stock trading using TROIX virtual currency.

Key platform facts:
- Platform name: PAISA BADHAO
- Tagline: Apna Paisa Barhao, Samajhdari Se Lagao. Brand message: Invest. Learn. Grow.
- Virtual currency: TROIX (Every registered user gets exactly 100,000 TROIX starting balance).
- Initial stock universe: MEBL (Meezan Bank), LUCK (Lucky Cement), FFC (Fauji Fertilizer), SAZEW (Sazgar Engineering), PSO (Pakistan State Oil), KSE-100 benchmark index.
- Core features: Learn & Financial Literacy, Virtual Trading Simulator, Inflation Calculator, Verified Experts, Aaj Ka Jaiza (daily performance review).
- Language support: You fluently understand and reply in English, Urdu (اردو), and Roman Urdu based on whichever language the user addresses you in.

Authorized user context:
${userContext ? `- TROIX Balance: ${userContext.walletBalance} TROIX\n- Holdings: ${userContext.holdingsSummary}\n- Completed Learning Modules: ${userContext.completedModulesCount}` : '- Guest/Public visitor'}

Guidelines:
- Be clear, educational, and respectful.
- Emphasize financial literacy, risk management, and diversification.
- Do not promise guaranteed returns or give illegal financial advice.
- When answering general or non-financial questions, be helpful and polite while retaining your friendly Paisa Dost identity.`;

        const response = await openaiClient.chat.completions.create({
          model: process.env.AI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...formattedHistory,
          ],
          temperature: 0.7,
          max_tokens: 600,
        });

        assistantReply = response.choices[0]?.message?.content || 'I am thinking... please ask me anything about PSX, TROIX, or financial literacy!';
      } catch (openAiError) {
        console.warn('OpenAI API call failed or unconfigured, using intelligent local engine:', openAiError.message);
        assistantReply = await this.generateFallbackResponse(message, userContext);
      }
    } else {
      assistantReply = await this.generateFallbackResponse(message, userContext);
    }

    // Save assistant message
    const assistantMsg = await AIMessage.create({
      conversationId: conv._id,
      user: userId,
      role: 'assistant',
      content: assistantReply,
    });

    // Update conversation title if default
    if (conv.title === 'New Financial Consultation') {
      conv.title = message.slice(0, 32) + (message.length > 32 ? '...' : '');
      conv.lastMessageAt = new Date();
      await conv.save();
    }

    return {
      conversationId: conv._id,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
    };
  }
}

module.exports = new AIService();
