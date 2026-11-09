const LearningModule = require('../models/LearningModule');
const Expert = require('../models/Expert');
const { loadHistoricalCSV } = require('./csvLoader');

const seedLearningModules = async () => {
  // If modules exist, clear and re-seed to ensure all 10 modules are present
  const existingCount = await LearningModule.countDocuments();
  if (existingCount >= 10) {
    console.log(`All 10 learning modules already seeded.`);
    return;
  }

  await LearningModule.deleteMany({});

  const modules = [
    {
      slug: 'psx-basics-stock-market',
      title: 'PSX Basics & Stock Market Fundamentals',
      description: 'Master the Pakistan Stock Exchange, how equity ownership works, market trading sessions, and the KSE-100 index.',
      category: 'Stock Market',
      level: 'Beginner',
      icon: 'Building2',
      estimatedTime: '15 mins',
      order: 1,
      lessons: [
        {
          id: 'intro-psx',
          title: 'Introduction to the Pakistan Stock Exchange (PSX)',
          order: 1,
          content: `The Pakistan Stock Exchange (PSX) was formed through the integration of the Karachi, Lahore, and Islamabad stock exchanges. It represents the primary capital market for Pakistani enterprises to raise equity capital and for individuals to purchase fractional ownership (shares) in businesses.

When you purchase a share of Meezan Bank (MEBL) or Lucky Cement (LUCK), you become a shareholder entitled to a proportionate share of the company's operating profits, distributed as cash dividends or bonus shares.

Key terms:
1. Share / Stock: A unit of equity ownership in a listed corporation.
2. Bull Market: When equity indices are generally trending upwards.
3. Bear Market: When market indices decline by 20% or more over a sustained period.
4. KSE-100: The benchmark index tracking the top 100 capitalized companies in Pakistan.`,
          keyTakeaways: [
            'PSX is the unified national equity exchange of Pakistan.',
            'Owning a stock grants fractional ownership and dividend eligibility.',
            'The KSE-100 index tracks market health across core sectors.',
          ],
        },
        {
          id: 'market-mechanics',
          title: 'How Stock Trading & Orders Work',
          order: 2,
          content: `Stock markets match buyers and sellers through an electronic matching engine known as the Karachi Automated Trading System (KATS).

Orders can be:
- Market Orders: Execute immediately at the best available current market price.
- Limit Orders: Execute only at a specified price or better.

Trading hours on PSX run Monday through Friday from 09:15 AM to 03:30 PM (with a Friday prayer break). Regular equity settlements follow the T+2 standard settlement cycle.`,
          keyTakeaways: [
            'KATS matches buyers and sellers electronically in real time.',
            'Market orders execute immediately; limit orders provide price control.',
            'Regular equity settlements follow the T+2 standard cycle.',
          ],
        },
      ],
      quiz: [
        {
          question: 'What does the KSE-100 Index represent in Pakistan?',
          options: [
            'The 100 oldest companies in Karachi',
            'The benchmark index reflecting the largest and most liquid 100 companies',
            'The 100 highest dividend paying bonds',
            'A fixed government interest rate',
          ],
          correctAnswerIndex: 1,
          explanation: 'The KSE-100 is the benchmark index representing top companies by market capitalization and liquidity across sectors.',
        },
        {
          question: 'In PAISA BADHAO, what virtual currency do you trade with?',
          options: ['US Dollars', 'Pakistani Rupee', 'TROIX', 'Bitcoins'],
          correctAnswerIndex: 2,
          explanation: 'PAISA BADHAO uses TROIX as its virtual educational currency.',
        },
      ],
    },
    {
      slug: 'smart-investing-tips',
      title: 'Smart Investing Tips & Disciplined Capital',
      description: 'Learn proven principles of wealth preservation, asset allocation, and avoiding emotional FOMO.',
      category: 'Investing Strategy',
      level: 'Beginner',
      icon: 'TrendingUp',
      estimatedTime: '20 mins',
      order: 2,
      lessons: [
        {
          id: 'investing-vs-gambling',
          title: 'Investing vs Speculating vs Gambling',
          order: 1,
          content: `Investing is the process of committing capital to productive assets based on thorough research of fundamentals, business revenue, management quality, and reasonable valuation.

Speculating is buying on rumors or short-term momentum without fundamental analysis. Disciplined investors focus on multi-year capital compounding, not overnight get-rich-quick schemes.`,
          keyTakeaways: [
            'Investing requires fundamental understanding of underlying corporate health.',
            'Emotional chasing of hot tips often leads to capital loss.',
            'Compound growth rewards patient, consistent capital allocation.',
          ],
        },
      ],
      quiz: [
        {
          question: 'Which behavior is characteristic of disciplined long-term investing?',
          options: [
            'Buying whatever stock is trending on social media that morning',
            'Analyzing company financial health, dividends, and earnings reports',
            'Putting 100% of savings into one penny stock',
            'Selling everything every time the market dips 1%',
          ],
          correctAnswerIndex: 1,
          explanation: 'Disciplined investing relies on verifiable corporate fundamentals, earnings quality, and steady horizon.',
        },
      ],
    },
    {
      slug: 'inflation-purchasing-power',
      title: 'Inflation & Protecting Your Purchasing Power',
      description: 'Understand how inflation erodes cash and how equity investments help beat the rising cost of living.',
      category: 'Macroeconomics',
      level: 'Intermediate',
      icon: 'Percent',
      estimatedTime: '15 mins',
      order: 3,
      lessons: [
        {
          id: 'inflation-mechanism',
          title: 'The Silent Tax: Understanding Inflation in Pakistan',
          order: 1,
          content: `Inflation is the rate at which the general level of prices for goods and services rises, eroding purchasing power.

For instance, if inflation averages 15% annually in Pakistan, 100,000 PKR kept in an unyielding safe will only buy roughly half the goods and services 5 years later!

To preserve purchasing power, capital must be deployed in assets that grow faster than inflation—such as productive equity shares, real estate, or inflation-indexed instruments.`,
          keyTakeaways: [
            'Holding uninvested cash guarantees a loss in purchasing power during high inflation.',
            'Productive equities have historically outpaced inflation over multi-decade cycles.',
            'Compound inflation operates in reverse to compound interest.',
          ],
        },
      ],
      quiz: [
        {
          question: 'If annual inflation is 12%, what happens to cash stored in a safe without interest?',
          options: [
            'Its nominal amount increases',
            'Its purchasing power decreases each year',
            'It stays equally valuable forever',
            'It automatically converts into gold',
          ],
          correctAnswerIndex: 1,
          explanation: 'While the paper note amount remains the same, its real purchasing power drops by the inflation rate.',
        },
      ],
    },
    {
      slug: 'personal-finance-guide',
      title: 'Personal Finance Guide & Wealth Blueprint',
      description: 'Establish sound personal balance sheets, cash flow tracking, and systematic wealth accumulation.',
      category: 'Personal Finance',
      level: 'Beginner',
      icon: 'ShieldCheck',
      estimatedTime: '18 mins',
      order: 4,
      lessons: [
        {
          id: 'personal-balance-sheet',
          title: 'Building Your Personal Financial Statement',
          order: 1,
          content: `Your financial health begins with understanding Assets vs Liabilities:
- Assets: Productive equities, emergency funds, income-producing real estate.
- Liabilities: High-interest credit debt, unpaid consumer loans.

Net Worth equals Assets minus Liabilities. Growing your Net Worth requires systematically channeling monthly surplus income into productive PSX shares and liquid reserves.`,
          keyTakeaways: [
            'Track your monthly net income and recurring cash outflows.',
            'Differentiate between productive appreciating assets and depreciating liabilities.',
          ],
        },
      ],
      quiz: [
        {
          question: 'How is personal Net Worth calculated?',
          options: [
            'Total Annual Salary multiplied by 10',
            'Total Assets minus Total Liabilities',
            'Total Cash in Checking Account',
            'Monthly Expenses divided by Income',
          ],
          correctAnswerIndex: 1,
          explanation: 'Net Worth is the value of all assets owned minus all liabilities owed.',
        },
      ],
    },
    {
      slug: 'saving-and-budgeting',
      title: 'Saving and Budgeting Systems',
      description: 'Master the 50/30/20 rule, emergency funds, debt management, and cash flow control.',
      category: 'Budgeting',
      level: 'Beginner',
      icon: 'PiggyBank',
      estimatedTime: '18 mins',
      order: 5,
      lessons: [
        {
          id: 'budgeting-rule',
          title: 'The 50/30/20 Budgeting Rule',
          order: 1,
          content: `A simple, robust budgeting model divides monthly post-tax income into:
- 50% Needs: Housing, groceries, utilities, basic transportation.
- 30% Wants: Dining out, leisure, subscriptions.
- 20% Savings & Investments: Emergency fund, PSX stock portfolio, long-term wealth building.`,
          keyTakeaways: [
            'Categorize spending into Needs, Wants, and Savings.',
            'Build an emergency fund covering 3 to 6 months of basic living costs before aggressive investing.',
          ],
        },
      ],
      quiz: [
        {
          question: 'In the 50/30/20 budgeting framework, what does the 20% represent?',
          options: ['Luxury dining', 'Savings, debt reduction, and investments', 'Utility bills', 'Vacations'],
          correctAnswerIndex: 1,
          explanation: '20% of income is allocated toward emergency savings, retirement, and long-term investing.',
        },
      ],
    },
    {
      slug: 'compound-growth',
      title: 'Compound Growth & Time Horizon',
      description: 'The mathematics of exponential compounding: why starting early creates generational wealth.',
      category: 'Compounding',
      level: 'Beginner',
      icon: 'TrendingUp',
      estimatedTime: '16 mins',
      order: 6,
      lessons: [
        {
          id: 'compound-interest-formula',
          title: 'The Rule of 72 and Exponential Compounding',
          order: 1,
          content: `Compound interest occurs when earnings on an investment begin earning their own returns.

The Rule of 72 provides a mental shortcut for estimating how long an investment takes to double:
$$\\text{Years to Double} \\approx \\frac{72}{\\text{Annual Rate of Return}}$$

At an average PSX equity return of 16%, capital doubles approximately every 4.5 years:
$$72 \\div 16 = 4.5 \\text{ years}$$`,
          keyTakeaways: [
            'Reinvesting dividends accelerates portfolio compounding.',
            'Time in the market matters significantly more than timing the market.',
          ],
        },
      ],
      quiz: [
        {
          question: 'According to the Rule of 72, how many years does an investment take to double at a 12% annual return?',
          options: ['12 years', '6 years', '10 years', '2 years'],
          correctAnswerIndex: 1,
          explanation: '72 divided by 12 equals 6 years.',
        },
      ],
    },
    {
      slug: 'risk-management',
      title: 'Risk Management & Capital Preservation',
      description: 'Protect your capital using stop-losses, position sizing, and drawdown management.',
      category: 'Risk Management',
      level: 'Intermediate',
      icon: 'ShieldCheck',
      estimatedTime: '20 mins',
      order: 7,
      lessons: [
        {
          id: 'position-sizing',
          title: 'Position Sizing and the 2% Capital Rule',
          order: 1,
          content: `The first rule of successful investing is capital preservation.

Professional portfolio managers rarely risk more than 1% to 2% of their total portfolio capital on any single position. If an unexpected corporate earnings disappointment occurs, the portfolio remains solvent and capable of recovery.`,
          keyTakeaways: [
            'Never commit all portfolio funds to a single equity.',
            'Establish an exit thesis and stop-loss before entering an equity trade.',
          ],
        },
      ],
      quiz: [
        {
          question: 'What is the primary objective of position sizing?',
          options: [
            'To maximize brokerage commissions',
            'To ensure no single adverse trade threatens total portfolio solvency',
            'To avoid paying taxes',
            'To trade as fast as possible',
          ],
          correctAnswerIndex: 1,
          explanation: 'Position sizing caps exposure to prevent any single loss from critically impairing total capital.',
        },
      ],
    },
    {
      slug: 'diversification',
      title: 'Diversification & Non-Correlated Assets',
      description: 'The mathematics of sector diversification across Banking, Cement, Energy, and Fertilizers.',
      category: 'Diversification',
      level: 'Intermediate',
      icon: 'Building2',
      estimatedTime: '18 mins',
      order: 8,
      lessons: [
        {
          id: 'sector-correlation',
          title: 'Spreading Exposure Across PSX Sectors',
          order: 1,
          content: `In the Pakistan Stock Exchange, different sectors react differently to macroeconomic developments:
- Banking (e.g. MEBL): Benefits from prevailing interest rate margins.
- Fertilizer (e.g. FFC): Enjoys steady domestic agricultural demand and resilient dividend payouts.
- Cement (e.g. LUCK): Correlated with infrastructure expenditure and construction cycles.
- Energy (e.g. PSO): Driven by industrial fuel consumption and global oil price dynamics.

A diversified portfolio holding positions across these 4 distinct sectors reduces overall volatility.`,
          keyTakeaways: [
            'Non-correlated sectors cushion portfolio drawdowns.',
            'Maintain at least 3 to 5 distinct sectors in your equity allocation.',
          ],
        },
      ],
      quiz: [
        {
          question: 'Why does holding MEBL, LUCK, and FFC offer diversification benefits?',
          options: [
            'Because they belong to the same parent corporation',
            'Because they operate in distinct economic sectors with different drivers',
            'Because their stock prices are always identical',
            'Because they do not trade on the PSX',
          ],
          correctAnswerIndex: 1,
          explanation: 'They represent Commercial Banking, Construction Materials, and Agribusiness Chemicals respectively.',
        },
      ],
    },
    {
      slug: 'fundamental-analysis',
      title: 'Fundamental Analysis & Financial Statements',
      description: 'Learn how to read corporate balance sheets, P/E ratios, EPS, and dividend payout history.',
      category: 'Analysis',
      level: 'Advanced',
      icon: 'Percent',
      estimatedTime: '25 mins',
      order: 9,
      lessons: [
        {
          id: 'financial-metrics',
          title: 'Core Valuation Multiples: P/E and Dividend Yield',
          order: 1,
          content: `Fundamental analysis evaluates an equity based on underlying business economics:
1. Price-to-Earnings (P/E) Ratio: Stock Price divided by Earnings Per Share (EPS). Indicates how much investors are paying for every 1 PKR of annual corporate earnings.
2. Dividend Yield: Annual dividend per share divided by stock price.
3. Return on Equity (ROE): Measures profitability generated from shareholder capital.`,
          keyTakeaways: [
            'A low P/E combined with consistent profit growth indicates potential valuation discount.',
            'Examine historical dividend consistency across multi-year cycles.',
          ],
        },
      ],
      quiz: [
        {
          question: 'If a stock trades at 300 PKR and earns 30 PKR per share annually, what is its P/E ratio?',
          options: ['30x', '10x', '100x', '3x'],
          correctAnswerIndex: 1,
          explanation: '300 divided by 30 equals 10x.',
        },
      ],
    },
    {
      slug: 'technical-analysis',
      title: 'Technical Analysis & Candlestick Structures',
      description: 'Understand support, resistance, moving averages, and volume confirmation on PSX charts.',
      category: 'Technical',
      level: 'Advanced',
      icon: 'TrendingUp',
      estimatedTime: '25 mins',
      order: 10,
      lessons: [
        {
          id: 'candlestick-reading',
          title: 'Reading Japanese Candlesticks and Volume',
          order: 1,
          content: `Every candlestick on the PAISA BADHAO Trading Terminal reveals four data points: Open, High, Low, and Close (OHLC).
- Green Candle: Close is higher than Open (bullish buying pressure).
- Red Candle: Close is lower than Open (bearish selling pressure).
- Wicks (Shadows): Depict intra-day price extremes rejected by the market.
- Volume: Confirms institutional participation. Breakouts on high volume carry higher statistical validity.`,
          keyTakeaways: [
            'Candlesticks convey price action and battle between buyers and sellers.',
            'Volume confirms the reliability of chart patterns and trend breakouts.',
          ],
        },
      ],
      quiz: [
        {
          question: 'What does a green candlestick indicate on a standard chart?',
          options: [
            'The market was closed that day',
            'The closing price was higher than the opening price',
            'The stock had zero volume',
            'The government intervened in the trade',
          ],
          correctAnswerIndex: 1,
          explanation: 'A green candle indicates bullish price movement where the session closed above the open.',
        },
      ],
    },
  ];

  await LearningModule.insertMany(modules);
  console.log(`Seeded all ${modules.length} comprehensive learning modules.`);
};

const seedExperts = async () => {
  const count = await Expert.countDocuments();
  if (count > 0) {
    console.log(`Experts already seeded (${count} found).`);
    return;
  }

  const experts = [
    {
      name: 'Ali Raza Khan',
      designation: 'SECP Licensed Advisor',
      experience: '12+ Years',
      rating: 4.8,
      reviewsCount: 250,
      feePerSession: 5000,
      feeCurrency: 'PKR',
      specialties: ['PSX Equity Research', 'Shariah Compliant Portfolios', 'Corporate Financial Analysis'],
      bio: 'Former head of research at a leading Karachi brokerage house. Specialized in value equity screening and dividend reinvestment plans across PSX blue chips.',
      isVerified: true,
      avatarUrl: '/images/expert-ali.png',
      availableDays: ['Monday', 'Wednesday', 'Friday'],
      availableTimeSlots: ['04:00 PM - 05:00 PM', '06:00 PM - 07:00 PM', '08:00 PM - 09:00 PM'],
    },
    {
      name: 'Sara Ahmed',
      designation: 'Portfolio Manager & CFA',
      experience: '9+ Years',
      rating: 4.7,
      reviewsCount: 180,
      feePerSession: 4000,
      feeCurrency: 'PKR',
      specialties: ['Asset Allocation', 'Retirement Planning', 'Fixed Income & Mutual Funds'],
      bio: 'Certified financial analyst advising institutional and retail clients on strategic asset allocation, risk-adjusted returns, and macroeconomic hedges.',
      isVerified: true,
      avatarUrl: '/images/expert-sara.png',
      availableDays: ['Tuesday', 'Thursday', 'Saturday'],
      availableTimeSlots: ['03:00 PM - 04:00 PM', '05:00 PM - 06:00 PM', '07:00 PM - 08:00 PM'],
    },
    {
      name: 'Usman Tariq',
      designation: 'Senior Market Analyst',
      experience: '14+ Years',
      rating: 4.9,
      reviewsCount: 320,
      feePerSession: 5000,
      feeCurrency: 'PKR',
      specialties: ['Technical Chart Analysis', 'Risk Management', 'Volume Profile & Momentum'],
      bio: 'Veteran market strategist focused on multi-timeframe price action, candlestick structure, and algorithmic trend identification on the Pakistan Stock Exchange.',
      isVerified: true,
      avatarUrl: '/images/expert-usman.png',
      availableDays: ['Monday', 'Tuesday', 'Thursday'],
      availableTimeSlots: ['02:00 PM - 03:00 PM', '05:00 PM - 06:00 PM', '08:00 PM - 09:00 PM'],
    },
  ];

  await Expert.insertMany(experts);
  console.log(`Seeded ${experts.length} verified expert mentors.`);
};

const seedAll = async () => {
  console.log('--- Initializing PAISA BADHAO Data Seeding ---');
  await loadHistoricalCSV();
  await seedLearningModules();
  await seedExperts();
  console.log('--- Data Seeding Completed Successfully ---');
};

module.exports = { seedAll, seedLearningModules, seedExperts };
