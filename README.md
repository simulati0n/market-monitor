A project that allows users to search for stocks to display their info and uses linear regression to predict future prices.  
It will eventually incorporate more advanced machine learning for the price prediction.  
  
Environment setup instructions:  
Install Node.js  
Download the repo and unzip it  
Navigate to market-monitor folder then run these commands:  
  
cd backend  
source venv/Scripts/activate  
pip install -r  requirements.txt  
uvicorn main:app --reload  

cd frontend  
npm install  
npm start  
