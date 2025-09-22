import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function StockTicker() {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/ticker");
        setStocks(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStocks();
    const interval = setInterval(fetchStocks, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ticker-container">
      <div className="ticker-scroll">
        {stocks.map((stock, idx) => {
          const isPositive = stock.change_percent > 0;
          return (
            <div key={idx} className="ticker-item">
              <span className="symbol">{stock.symbol}</span>
              <span
                className={`change ${isPositive ? "positive" : "negative"}`}
              >
                {isPositive ? "▲" : "▼"} {stock.change_percent}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}