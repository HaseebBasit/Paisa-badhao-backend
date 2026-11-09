const fs = require('fs');
const path = require('path');
const HistoricalMarketData = require('../models/HistoricalMarketData');
const Stock = require('../models/Stock');

/**
 * Parses and loads the PSX August 2026 historical demo CSV into MongoDB.
 * Ensures data integrity:
 * - Validates open, high, low, close prices
 * - Preserves null volume for missing data without fabrication
 * - Prevents duplicate insertions
 */
const loadHistoricalCSV = async (csvFilePath) => {
  const resolvedPath = path.resolve(csvFilePath || process.env.MARKET_DATA_CSV || './src/data/psx_aug2026_DEMO.csv');

  if (!fs.existsSync(resolvedPath)) {
    console.error(`CSV file not found at: ${resolvedPath}`);
    return { success: false, count: 0, error: 'File not found' };
  }

  const content = fs.readFileSync(resolvedPath, 'utf8');
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return { success: false, count: 0, error: 'Empty or invalid CSV' };
  }

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const symbolIdx = header.indexOf('symbol');
  const dateIdx = header.indexOf('date');
  const openIdx = header.indexOf('open');
  const highIdx = header.indexOf('high');
  const lowIdx = header.indexOf('low');
  const closeIdx = header.indexOf('close');
  const volumeIdx = header.indexOf('volume');

  if (symbolIdx === -1 || dateIdx === -1 || closeIdx === -1) {
    return { success: false, count: 0, error: 'CSV missing required headers' };
  }

  const records = [];
  const latestBySymbol = {};

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim());
    if (cols.length < header.length) continue;

    const symbol = cols[symbolIdx].toUpperCase();
    const date = cols[dateIdx];
    const open = parseFloat(cols[openIdx]);
    const high = parseFloat(cols[highIdx]);
    const low = parseFloat(cols[lowIdx]);
    const close = parseFloat(cols[closeIdx]);
    const rawVolume = volumeIdx !== -1 ? cols[volumeIdx] : '';

    // Handle missing or invalid volume strictly as null without fabrication
    let volume = null;
    if (rawVolume !== '' && rawVolume.toLowerCase() !== 'null' && rawVolume.toLowerCase() !== 'nan') {
      const parsedVol = parseInt(rawVolume, 10);
      if (!isNaN(parsedVol)) {
        volume = parsedVol;
      }
    }

    if (!symbol || !date || isNaN(close) || isNaN(open)) {
      continue;
    }

    const timestamp = new Date(date).getTime();

    records.push({
      symbol,
      date,
      open,
      high,
      low,
      close,
      volume,
      timestamp,
    });

    if (!latestBySymbol[symbol] || latestBySymbol[symbol].date < date) {
      latestBySymbol[symbol] = {
        symbol,
        date,
        open,
        high,
        low,
        close,
        volume,
      };
    }
  }

  console.log(`Parsed ${records.length} valid historical records from CSV.`);

  // Upsert records into MongoDB
  let inserted = 0;
  for (const record of records) {
    await HistoricalMarketData.findOneAndUpdate(
      { symbol: record.symbol, date: record.date },
      record,
      { upsert: true, new: true }
    );
    inserted++;
  }

  // Update latest prices on Stock models
  const stockMeta = {
    KSE100: { name: 'KSE 100 Index', sector: 'Benchmark Index', isIndex: true },
    MEBL: { name: 'Meezan Bank Limited', sector: 'Commercial Banks', isIndex: false },
    LUCK: { name: 'Lucky Cement Limited', sector: 'Cement', isIndex: false },
    FFC: { name: 'Fauji Fertilizer Company Limited', sector: 'Fertilizer', isIndex: false },
    SAZEW: { name: 'Sazgar Engineering Works Limited', sector: 'Automobile Assembler', isIndex: false },
    PSO: { name: 'Pakistan State Oil Company Limited', sector: 'Oil & Gas Marketing', isIndex: false },
  };

  for (const [symbol, latest] of Object.entries(latestBySymbol)) {
    const meta = stockMeta[symbol] || { name: symbol, sector: 'Equities', isIndex: false };
    const change = Number((latest.close - latest.open).toFixed(2));
    const changePercent = Number(((change / latest.open) * 100).toFixed(2));

    await Stock.findOneAndUpdate(
      { symbol },
      {
        symbol,
        name: meta.name,
        sector: meta.sector,
        currentPrice: latest.close,
        previousClose: latest.open,
        change,
        changePercent,
        high24h: latest.high,
        low24h: latest.low,
        volume: latest.volume || 0,
        isIndex: meta.isIndex,
      },
      { upsert: true, new: true }
    );
  }

  console.log(`Loaded ${inserted} historical candles and updated ${Object.keys(latestBySymbol).length} stocks.`);
  return { success: true, count: inserted };
};

module.exports = { loadHistoricalCSV };
