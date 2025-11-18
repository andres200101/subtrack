// ==============================================
// PLAID BANK INTEGRATION - BACKEND SETUP
// ==============================================
// Install dependencies first:
// npm install plaid express cors dotenv

// Create .env file with your Plaid credentials:
/*
PLAID_CLIENT_ID=your_client_id_here
PLAID_SECRET=your_sandbox_secret_here
PLAID_ENV=sandbox
*/

const express = require('express');
const cors = require('cors');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// Store access tokens (in production, use a database)
const accessTokens = new Map();

// ==============================================
// ENDPOINT 1: Create Link Token
// ==============================================
// This generates a token to initialize Plaid Link on frontend
app.post('/api/create_link_token', async (req, res) => {
  try {
    const request = {
      user: {
        client_user_id: req.body.user_id || 'user-id',
      },
      client_name: 'SubTrack',
      products: ['transactions'],
      country_codes: ['US'],
      language: 'en',
    };

    const createTokenResponse = await plaidClient.linkTokenCreate(request);
    
    res.json(createTokenResponse.data);
  } catch (error) {
    console.error('Error creating link token:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==============================================
// ENDPOINT 2: Exchange Public Token
// ==============================================
// Exchange the temporary public token for a permanent access token
app.post('/api/exchange_public_token', async (req, res) => {
  try {
    const { public_token } = req.body;

    const response = await plaidClient.itemPublicTokenExchange({
      public_token: public_token,
    });

    const { access_token, item_id } = response.data;

    // Store access token (in production, save to database with user_id)
    accessTokens.set(item_id, access_token);

    res.json({
      access_token: access_token,
      item_id: item_id,
    });
  } catch (error) {
    console.error('Error exchanging token:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==============================================
// ENDPOINT 3: Get Transactions
// ==============================================
// Fetch transactions from the bank account
app.post('/api/transactions', async (req, res) => {
  try {
    const { access_token, start_date, end_date } = req.body;

    const request = {
      access_token: access_token,
      start_date: start_date,
      end_date: end_date,
    };

    const response = await plaidClient.transactionsGet(request);
    let transactions = response.data.transactions;

    // Handle pagination
    while (transactions.length < response.data.total_transactions) {
      const paginatedRequest = {
        access_token: access_token,
        start_date: start_date,
        end_date: end_date,
        options: {
          offset: transactions.length,
        },
      };
      const paginatedResponse = await plaidClient.transactionsGet(paginatedRequest);
      transactions = transactions.concat(paginatedResponse.data.transactions);
    }

    res.json({
      transactions: transactions,
      accounts: response.data.accounts,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==============================================
// ENDPOINT 4: Detect Subscriptions (AI-Powered)
// ==============================================
// Advanced subscription detection with pattern recognition
app.post('/api/detect_subscriptions', async (req, res) => {
  try {
    const { transactions } = req.body;

    const subscriptionKeywords = [
      'netflix', 'spotify', 'hulu', 'disney', 'amazon prime', 
      'apple', 'youtube', 'hbo', 'paramount', 'peacock',
      'adobe', 'microsoft', 'google', 'dropbox', 'zoom',
      'gym', 'fitness', 'audible', 'kindle', 'scribd',
      'patreon', 'onlyfans', 'substack', 'medium'
    ];

    // Group transactions by merchant
    const merchantGroups = {};
    
    transactions.forEach(txn => {
      const merchant = txn.merchant_name || txn.name;
      const amount = Math.abs(txn.amount);
      
      // Filter likely subscriptions
      const isSubscription = subscriptionKeywords.some(keyword => 
        merchant.toLowerCase().includes(keyword)
      );
      
      // Include if matches keyword OR is small recurring charge
      if (isSubscription || (amount < 100 && amount > 0.99)) {
        if (!merchantGroups[merchant]) {
          merchantGroups[merchant] = [];
        }
        merchantGroups[merchant].push(txn);
      }
    });

    // Analyze patterns to detect subscriptions
    const detectedSubs = Object.entries(merchantGroups)
      .filter(([merchant, txns]) => txns.length >= 2) // At least 2 transactions
      .map(([merchant, txns]) => {
        // Calculate average amount
        const amounts = txns.map(t => Math.abs(t.amount));
        const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const stdDev = Math.sqrt(
          amounts.reduce((sq, n) => sq + Math.pow(n - avgAmount, 2), 0) / amounts.length
        );
        
        // Calculate frequency
        const dates = txns.map(t => new Date(t.date)).sort((a, b) => b - a);
        const daysBetween = dates.length > 1 
          ? Math.round((dates[0] - dates[dates.length - 1]) / (1000 * 60 * 60 * 24) / (dates.length - 1))
          : 30;
        
        // Determine billing cycle
        let billingCycle = 'Monthly';
        if (daysBetween < 10) billingCycle = 'Weekly';
        else if (daysBetween > 25 && daysBetween < 35) billingCycle = 'Monthly';
        else if (daysBetween > 80 && daysBetween < 100) billingCycle = 'Quarterly';
        else if (daysBetween > 330) billingCycle = 'Yearly';
        
        // Confidence score
        let confidence = 'low';
        if (txns.length >= 3 && stdDev < avgAmount * 0.1) {
          confidence = 'high';
        } else if (txns.length >= 2) {
          confidence = 'medium';
        }
        
        return {
          name: merchant,
          cost: avgAmount.toFixed(2),
          billing_cycle: billingCycle,
          category: categorizeSubscription(merchant),
          transaction_count: txns.length,
          last_transaction: dates[0].toISOString().split('T')[0],
          next_billing_estimate: estimateNextBilling(dates[0], daysBetween),
          confidence: confidence,
          yearly_cost: calculateYearlyCost(avgAmount, billingCycle),
          transaction_ids: txns.map(t => t.transaction_id)
        };
      })
      .sort((a, b) => b.transaction_count - a.transaction_count);

    res.json({
      detected_subscriptions: detectedSubs,
      total_monthly_cost: detectedSubs.reduce((sum, sub) => {
        const monthly = sub.billing_cycle === 'Weekly' ? parseFloat(sub.cost) * 4.33 :
                       sub.billing_cycle === 'Quarterly' ? parseFloat(sub.cost) / 3 :
                       sub.billing_cycle === 'Yearly' ? parseFloat(sub.cost) / 12 :
                       parseFloat(sub.cost);
        return sum + monthly;
      }, 0).toFixed(2),
      total_yearly_cost: detectedSubs.reduce((sum, sub) => sum + sub.yearly_cost, 0).toFixed(2),
    });
  } catch (error) {
    console.error('Error detecting subscriptions:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==============================================
// HELPER FUNCTIONS
// ==============================================

function categorizeSubscription(merchant) {
  const categories = {
    'Streaming': ['netflix', 'hulu', 'disney', 'hbo', 'paramount', 'peacock', 'youtube', 'plex'],
    'Music': ['spotify', 'apple music', 'pandora', 'tidal', 'soundcloud'],
    'Software': ['adobe', 'microsoft', 'google', 'dropbox', 'zoom', 'slack', 'notion'],
    'Fitness': ['gym', 'fitness', 'peloton', 'classpass', 'strava'],
    'Gaming': ['xbox', 'playstation', 'nintendo', 'steam', 'epic'],
    'News': ['nytimes', 'wsj', 'washington post', 'medium', 'substack'],
    'Cloud Storage': ['dropbox', 'icloud', 'google drive', 'onedrive']
  };
  
  const merchantLower = merchant.toLowerCase();
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(k => merchantLower.includes(k))) {
      return category;
    }
  }
  return 'Other';
}

function estimateNextBilling(lastDate, daysBetween) {
  const next = new Date(lastDate);
  next.setDate(next.getDate() + daysBetween);
  return next.toISOString().split('T')[0];
}

function calculateYearlyCost(amount, billingCycle) {
  const multipliers = {
    'Weekly': 52,
    'Monthly': 12,
    'Quarterly': 4,
    'Yearly': 1
  };
  return (amount * (multipliers[billingCycle] || 12)).toFixed(2);
}

// ==============================================
// ENDPOINT 5: Get Account Balance
// ==============================================
app.post('/api/balance', async (req, res) => {
  try {
    const { access_token } = req.body;

    const response = await plaidClient.accountsBalanceGet({
      access_token: access_token,
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==============================================
// START SERVER
// ==============================================
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Plaid integration server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.PLAID_ENV || 'sandbox'}`);
});

