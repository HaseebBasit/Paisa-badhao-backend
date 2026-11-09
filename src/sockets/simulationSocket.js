const HistoricalMarketData = require('../models/HistoricalMarketData');
const Stock = require('../models/Stock');

let ioInstance = null;
let simulationInterval = null;
let isPlaying = true;
let playbackSpeed = 1; // 1x, 2x, 5x, 10x
let currentTickIndex = 0;
let historicalDataset = [];
const activeStocks = ['MEBL', 'LUCK', 'FFC', 'SAZEW', 'PSO', 'KSE100'];

const initSimulationEngine = async (io) => {
  ioInstance = io;

  // Load all unique dates in chronological order
  const dates = await HistoricalMarketData.distinct('date');
  dates.sort();

  if (dates.length === 0) {
    console.log('Simulation engine: No historical dates found in DB yet.');
    return;
  }

  // Pre-load grouped historical records by date
  historicalDataset = [];
  for (const d of dates) {
    const candles = await HistoricalMarketData.find({ date: d });
    const candleMap = {};
    candles.forEach((c) => {
      candleMap[c.symbol] = {
        symbol: c.symbol,
        date: c.date,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
      };
    });
    historicalDataset.push({ date: d, data: candleMap });
  }

  console.log(`Simulation Engine initialized with ${historicalDataset.length} sequential historical sessions.`);

  io.on('connection', (socket) => {
    // Send current status to newly connected client
    socket.emit('simulation:init', {
      isPlaying,
      playbackSpeed,
      currentIndex: currentTickIndex,
      totalTicks: historicalDataset.length,
      currentDate: historicalDataset[currentTickIndex]?.date || null,
      datasetType: 'HISTORICAL SIMULATION (PSX August 2026 Dataset)',
    });

    socket.on('simulation:play', () => {
      isPlaying = true;
      startOrUpdateInterval();
      io.emit('simulation:status', {
        isPlaying,
        playbackSpeed,
        currentIndex: currentTickIndex,
        currentDate: historicalDataset[currentTickIndex]?.date,
      });
    });

    socket.on('simulation:pause', () => {
      isPlaying = false;
      stopInterval();
      io.emit('simulation:status', {
        isPlaying,
        playbackSpeed,
        currentIndex: currentTickIndex,
        currentDate: historicalDataset[currentTickIndex]?.date,
      });
    });

    socket.on('simulation:set_speed', (speed) => {
      const parsedSpeed = parseInt(speed, 10);
      if ([1, 2, 5, 10].includes(parsedSpeed)) {
        playbackSpeed = parsedSpeed;
        if (isPlaying) {
          startOrUpdateInterval();
        }
        io.emit('simulation:status', {
          isPlaying,
          playbackSpeed,
          currentIndex: currentTickIndex,
          currentDate: historicalDataset[currentTickIndex]?.date,
        });
      }
    });

    socket.on('simulation:seek', (index) => {
      const idx = parseInt(index, 10);
      if (idx >= 0 && idx < historicalDataset.length) {
        currentTickIndex = idx;
        broadcastCurrentTick();
      }
    });

    socket.on('simulation:reset', () => {
      currentTickIndex = 0;
      isPlaying = true;
      startOrUpdateInterval();
      broadcastCurrentTick();
      io.emit('simulation:status', {
        isPlaying,
        playbackSpeed,
        currentIndex: 0,
        currentDate: historicalDataset[0]?.date,
      });
    });
  });

  // Start active playback loop
  startOrUpdateInterval();
};

const startOrUpdateInterval = () => {
  stopInterval();
  if (!isPlaying) return;

  // Interval dynamically scales with speed (e.g. 2000ms at 1x, 1000ms at 2x, 400ms at 5x)
  const intervalMs = Math.max(400, Math.round(2000 / playbackSpeed));

  simulationInterval = setInterval(async () => {
    if (historicalDataset.length === 0) return;

    currentTickIndex++;
    if (currentTickIndex >= historicalDataset.length) {
      // Loop back to start smoothly so simulator never freezes or dies
      currentTickIndex = 0;
      if (ioInstance) {
        ioInstance.emit('simulation:loop', {
          message: 'Historical simulation cycle complete. Restarting sequential August 2026 playback.',
          currentDate: historicalDataset[0].date,
        });
      }
    }

    await broadcastCurrentTick();
  }, intervalMs);
};

const stopInterval = () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
};

const broadcastCurrentTick = async () => {
  if (!ioInstance || !historicalDataset[currentTickIndex]) return;

  const session = historicalDataset[currentTickIndex];
  const ticks = [];

  for (const [symbol, candle] of Object.entries(session.data)) {
    const change = Number((candle.close - candle.open).toFixed(2));
    const changePercent = Number(((change / candle.open) * 100).toFixed(2));

    // Update in-memory / database current price for stock
    await Stock.findOneAndUpdate(
      { symbol },
      {
        currentPrice: candle.close,
        previousClose: candle.open,
        change,
        changePercent,
        high24h: candle.high,
        low24h: candle.low,
        volume: candle.volume || 0,
      }
    );

    ticks.push({
      symbol,
      date: session.date,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume,
      change,
      changePercent,
      isPositive: change >= 0,
    });
  }

  ioInstance.emit('market:tick', {
    date: session.date,
    index: currentTickIndex,
    total: historicalDataset.length,
    datasetType: 'HISTORICAL SIMULATION',
    ticks,
  });
};

const getCurrentSimulationIndex = () => currentTickIndex;

module.exports = { initSimulationEngine, getCurrentSimulationIndex };
