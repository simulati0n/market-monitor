from fastapi import FastAPI, HTTPException
import yfinance as yf
from cachetools import TTLCache
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

app = FastAPI()
#This app caches prices for 15 seconds to avoid API limits.
#For live-trading, this would be replaced by a real-time paid data feed.

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev only, will restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

cache = TTLCache(maxsize=100, ttl=10)

@app.get("/api/price/{symbol}")
def get_price(symbol: str):
    if symbol in cache:
        return cache[symbol]

    ticker = yf.Ticker(symbol.upper())
    data = ticker.history(period="2d", interval="1d")

    if data.empty or len(data) < 2:
        raise HTTPException(status_code=404, detail="Ticker not found")

    # Get previous close and latest close
    previous_close = data["Close"].iloc[-2]
    last_price = data["Close"].iloc[-1]

    change_percent = ((last_price - previous_close) / previous_close) * 100

    result = {
        "symbol": symbol.upper(),
        "price": float(last_price),  # don’t round here if frontend will format
        "previous_close": float(previous_close),
        "change_percent": change_percent
    }

    cache[symbol] = result
    return result

@app.get("/api/history/{symbol}")
def get_history(symbol: str, period: str = "1mo", interval: str = "1d"):
    ticker = yf.Ticker(symbol.upper())
    data = ticker.history(period=period, interval=interval)
    return {
        "symbol": symbol.upper(),
        "history": [{"date": str(i), "close": round(v, 2)} for i, v in data["Close"].items()]
    }

@app.get("/api/ticker")
def get_ticker_data():
    symbols = ["^GSPC", "^DJI", "^IXIC", "VTI", "NVDA", "AMD", "AAPL", "GOOGL"]
    data = []
    for symbol in symbols:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="2d")
        if len(hist) >= 2:
            prev_close = hist['Close'][-2]
            latest_close = hist['Close'][-1]
            change_percent = ((latest_close - prev_close) / prev_close) * 100
            data.append({
                "symbol": symbol,
                "change_percent": round(change_percent, 2)
            })
    return data  

def predict_price(ticker: str):
    # Fetch last 6 months of daily data
    data = yf.download(ticker, period="3mo", interval="1d")
    if data.empty:
        return None
   
    data = data.reset_index()
    data["Day"] = np.arange(len(data))
   
    X = data[["Day"]]
    y = data["Close"]
    model = LinearRegression()
    model.fit(X, y)

    next_day = [[len(data)]]
    predicted_price = model.predict(next_day)[0]
    return round(float(predicted_price), 2)

@app.get("/predict/{ticker}")
def get_prediction(ticker: str):
    price = predict_price(ticker)
    if price is None:
        raise HTTPException(status_code=404, detail="Ticker not found")
    return {"ticker": ticker.upper(), "predicted_price": price}

@app.get("/api/validate/{ticker}")
def validate_ticker(ticker: str):
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
       
        if not info or 'symbol' not in info:
            raise HTTPException(status_code=404, detail="Ticker not found")
           
        return {"valid": True, "symbol": ticker.upper()}
    except:
        raise HTTPException(status_code=404, detail="Ticker not found")
