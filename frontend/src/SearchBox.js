import React, { useEffect, useState } from 'react';
import axios from 'axios';

function SearchBox() {
  const [symbol, setSymbol] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const fetchPrice = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/price/${symbol}`);
      setData(res.data);
      setError('');
    } catch (err) {
      setError('Error fetching stock data');
      setData(null);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <input
        type="text"
        placeholder="Enter symbol (e.g. AAPL)"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
      />
      <button onClick={fetchPrice}>Get Price</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {data && (
        <div>
          <h2>{data.symbol}</h2>
          <p>Price: ${data.price.toFixed(2)}</p>
          <p>Previous Close: ${data.previous_close.toFixed(2)}</p>
          <p>Change: ${data.change_percent.toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
}


export default SearchBox;
