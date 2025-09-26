 import React, { useState } from 'react';
import axios from 'axios';


function SearchBox() {
  const [symbol, setSymbol] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
 
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [predictError, setPredictError] = useState('');

  const handleSymbolChange = (e) => {
    let input = e.target.value;
   
    // Allow only letters, dots, and limit length during typing
    input = input.replace(/[^A-Za-z-]/g, '').substring(0, 5);
   
    setSymbol(input);
   
    // Clear errors when user starts typing again
    if (error) setError('');
    if (predictError) setPredictError('');
  };

  const fetchPrice = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/price/${symbol}`);
      setData(res.data);
      setError('');
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Ticker not found. Please check the symbol for typos.');
      } else {
        setError('Error fetching stock data');
      }
      setData(null);
    }
  };

  const predictPrice = async () => {
    setPredicting(true);
    setPredictError('');
   
    try {
      const res = await axios.get(`http://127.0.0.1:8000/predict/${symbol}`);
      setPrediction(res.data.predicted_price);
    } catch (err) {
      if (err.response?.status === 404) {
        setPredictError('Ticker not found. Please check the symbol for typos.');
      } else {
        setPredictError('Error predicting stock price');
      }
      setPrediction(null);
    }
   
    setPredicting(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <input
        type="text"
        placeholder="Enter ticker symbol (e.g. AAPL)"
        value={symbol}
        onChange={handleSymbolChange}
        maxLength={5}
        style={{
          padding: '8px',
          border: error || predictError ? '2px solid red' : '1px solid #ccc',
          borderRadius: '4px',
          textTransform: 'uppercase'
        }}
      />
     
      {/* Button container */}
      <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
        <button
          onClick={fetchPrice}
          disabled={!symbol.trim()}
          style={{
            padding: '8px 16px',
            backgroundColor: !symbol.trim() ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !symbol.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          Get Price
        </button>
        <button
          onClick={predictPrice}
          disabled={predicting || !symbol.trim()}
          style={{
            backgroundColor: predicting || !symbol.trim() ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: predicting || !symbol.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          {predicting ? 'Predicting...' : 'Predict Price'}
        </button>
      </div>

      {/* Error messages */}
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      {predictError && <p style={{ color: 'red', marginTop: '10px' }}>{predictError}</p>}

       {/* Tooltip */}
      <p style={{
        fontSize: '12px',
        color: '#666',
        marginTop: '5px',
        fontStyle: 'italic'
      }}>
        Tip: Use a dash (-) instead of a dot (.) for tickers. Ex: "BRK-A" instead of "BRK.A"
      </p>

      {/* Current price data */}
      {data && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h2>{data.symbol}</h2>
          <p>Price: ${data.price.toFixed(2)}</p>
          <p>Previous Close: ${data.previous_close.toFixed(2)}</p>
          <p>Change: ${data.change_percent.toFixed(2)}%</p>
        </div>
      )}

      {/* Prediction display */}
      {prediction && (
        <div style={{
          marginTop: '20px',
          padding: '10px',
          border: '2px solid #28a745',
          borderRadius: '5px',
          backgroundColor: '#f8f9fa'
        }}>
          <h3 style={{ color: '#28a745', margin: '0 0 10px 0' }}>
            🤖 ML Prediction
          </h3>
          <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0' }}>
            Predicted Price (Next Day): ${prediction}
          </p>
          <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>
            Based on 3 months of historical data using Linear Regression
          </p>
        </div>
      )}
     
    </div>
  );
}



export default SearchBox;