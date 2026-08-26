// Groww Demat Integration & API Management Service

export const DEFAULT_GROWW_DEMAT = {
  isConnected: true,
  clientId: "GRW-782491",
  accountName: "Arjun Trader",
  email: "arjun.trader@groww.in",
  broker: "Groww (Nextbillion Technology Pvt. Ltd.)",
  dematNumber: "1208160019284729",
  balance: 250000.00, // ₹2,50,000 Initial Buying Power
  initialBalance: 250000.00,
  marginUsed: 0.00,
  realizedPnL: 3450.00,
  mode: "SANDBOX_SYNC", // "SANDBOX_SYNC" or "LIVE_BROKER"
  apiKey: "",
  apiSecret: "",
  totp: "",
  holdings: [
    { symbol: "RELIANCE", name: "Reliance Industries", qty: 25, avgPrice: 2920.00, ltp: 2985.50 },
    { symbol: "TATAMOTORS", name: "Tata Motors Ltd", qty: 100, avgPrice: 980.00, ltp: 1048.20 },
    { symbol: "HDFCBANK", name: "HDFC Bank Ltd", qty: 50, avgPrice: 1590.00, ltp: 1642.80 }
  ]
};

export function loadGrowwAccount() {
  try {
    const saved = localStorage.getItem("trade_groww_account");
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn("Failed to load saved Groww session", e);
  }
  return DEFAULT_GROWW_DEMAT;
}

export function saveGrowwAccount(account) {
  try {
    localStorage.setItem("trade_groww_account", JSON.stringify(account));
  } catch (e) {
    console.error("Failed to save Groww session", e);
  }
}
