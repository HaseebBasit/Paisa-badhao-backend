require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { connectDB } = require('./config/db');
const { seedAll } = require('./utils/seedData');
const { initSimulationEngine } = require('./sockets/simulationSocket');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect Database
    await connectDB();

    // 2. Seed initial market CSV and educational resources
    await seedAll();

    // 3. Create HTTP & Socket.IO server
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    // 4. Initialize real-time historical market simulation engine
    await initSimulationEngine(io);

    // 5. Start listening
    server.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`PAISA BADHAO Server running on http://localhost:${PORT}`);
      console.log(`Platform: PAISA BADHAO | Currency: TROIX`);
      console.log(`Simulated Stocks: MEBL, LUCK, FFC, SAZEW, PSO, KSE100`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Fatal server startup failure:', err);
    process.exit(1);
  }
};

startServer();
