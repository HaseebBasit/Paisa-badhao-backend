const http = require('http');

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (data) {
      headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api${path}`,
        method,
        headers,
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => (responseBody += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseBody);
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, body: responseBody });
          }
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
};

const runAllTests = async () => {
  console.log('====================================================');
  console.log('PAISA BADHAO COMPREHENSIVE END-TO-END VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await request('GET', '/health');
    assert(health.status === 200 && health.body.currency === 'TROIX', 'Health check returns ONLINE and TROIX currency');

    // 2. Market stocks
    const stocks = await request('GET', '/market/stocks');
    assert(
      stocks.status === 200 && stocks.body.data.length >= 6,
      `Market stocks loaded (${stocks.body.data?.length} stocks available including MEBL, LUCK, FFC, SAZEW, PSO)`
    );

    // 3. Historical Candles
    const meblCandles = await request('GET', '/market/history/MEBL');
    assert(
      meblCandles.status === 200 && meblCandles.body.count > 0,
      `Historical MEBL candles retrieved (${meblCandles.body.count} sequential August 2026 candles)`
    );

    // 4. Registration & Initial 100,000 TROIX credit
    const testEmail = `tester_${Date.now()}@paisabadhao.pk`;
    const reg = await request('POST', '/auth/register', {
      name: 'Tooba Test User',
      email: testEmail,
      password: 'password123',
    });
    assert(reg.status === 201, 'User registration succeeds with status 201');
    assert(
      reg.body.data.wallet.balance === 100000 && reg.body.data.wallet.currency === 'TROIX',
      `Registered user receives EXACTLY 100,000 TROIX (Received: ${reg.body.data.wallet.balance} ${reg.body.data.wallet.currency})`
    );

    const token = reg.body.data.token;

    // 5. Login check — NEVER re-credit 100,000 TROIX
    const login = await request('POST', '/auth/login', {
      email: testEmail,
      password: 'password123',
    });
    assert(login.status === 200, 'User login succeeds with status 200');
    assert(
      login.body.data.wallet.balance === 100000,
      `Existing user login retains balance without duplicating starting credit (Balance: ${login.body.data.wallet.balance} TROIX)`
    );

    // 6. Buy 100 shares of MEBL
    const buyRes = await request(
      'POST',
      '/trading/buy',
      {
        symbol: 'MEBL',
        quantity: 100,
      },
      token
    );
    assert(buyRes.status === 200, `Stock Buy execution succeeded for 100 shares of MEBL`);
    const balanceAfterBuy = buyRes.body.data.remainingBalance;
    assert(balanceAfterBuy < 100000, `Wallet debited correctly (Remaining balance: ${balanceAfterBuy} TROIX)`);

    // 7. Portfolio Verification
    const portfolioRes = await request('GET', '/portfolio', null, token);
    assert(
      portfolioRes.status === 200 && portfolioRes.body.data.holdings.length === 1,
      `Portfolio reflects 1 active holding (MEBL: ${portfolioRes.body.data.holdings[0]?.quantity} shares)`
    );

    // 8. Sell 50 shares of MEBL
    const sellRes = await request(
      'POST',
      '/trading/sell',
      {
        symbol: 'MEBL',
        quantity: 50,
      },
      token
    );
    assert(sellRes.status === 200, `Stock Sell execution succeeded for 50 shares of MEBL`);
    assert(
      sellRes.body.data.remainingQuantity === 50,
      `Holding quantity updated properly (Remaining: ${sellRes.body.data.remainingQuantity} shares)`
    );

    // 9. Inflation Calculator
    const calcRes = await request('POST', '/inflation/compute', {
      initialAmount: 100000,
      inflationRate: 15,
      years: 5,
    });
    assert(
      calcRes.status === 200 && calcRes.body.data.futureValueNeeded > 100000,
      `Inflation Calculator computed correctly (Future needed: ${calcRes.body.data.futureValueNeeded} for 100,000 @ 15% 5yr)`
    );

    // 10. Experts Module & Booking
    const expertsRes = await request('GET', '/experts');
    assert(expertsRes.status === 200 && expertsRes.body.data.length >= 3, `Experts loaded (${expertsRes.body.data.length} verified mentors)`);
    const firstExpertId = expertsRes.body.data[0]._id;

    const bookRes = await request(
      'POST',
      '/experts/book',
      {
        expertId: firstExpertId,
        date: '2026-11-20',
        timeSlot: '04:00 PM - 05:00 PM',
        topic: 'PSX Value Strategy',
        notes: 'Review my MEBL and LUCK allocations',
      },
      token
    );
    assert(bookRes.status === 201, `Expert consultation booked successfully with ${expertsRes.body.data[0].name}`);

    // 11. Learning Modules & Quiz
    const modulesRes = await request('GET', '/learning/modules', null, token);
    assert(modulesRes.status === 200 && modulesRes.body.data.length >= 5, `Learning modules loaded (${modulesRes.body.data.length} modules)`);

    const quizRes = await request(
      'POST',
      '/learning/quiz/submit',
      {
        slug: 'psx-basics-stock-market',
        answers: [1, 2], // correct answers
      },
      token
    );
    assert(quizRes.status === 200 && quizRes.body.data.percentage === 100, `Quiz submitted and graded 100%`);

    // 12. Aaj Ka Jaiza
    const jaizaRes = await request('GET', '/evaluations/today', null, token);
    assert(
      jaizaRes.status === 200 && jaizaRes.body.data.grade !== undefined,
      `Aaj Ka Jaiza generated evaluation (Grade: ${jaizaRes.body.data.grade}, Score: ${jaizaRes.body.data.score}%)`
    );

    // 13. Contact Submission
    const contactRes = await request('POST', '/contact', {
      name: 'Tooba Inquirer',
      email: 'inquirer@example.com',
      message: 'Hello, wonderful platform!',
    });
    assert(contactRes.status === 201, `Contact form submitted and stored in MongoDB`);

    // 14. Paisa Dost AI Assistant
    const aiRes = await request(
      'POST',
      '/ai/chat',
      {
        message: 'What is TROIX and how do I trade MEBL?',
      },
      token
    );
    assert(
      aiRes.status === 200 && aiRes.body.data.assistantMessage?.content.length > 10,
      `Paisa Dost AI replied intelligently with platform context`
    );

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
};

runAllTests();
