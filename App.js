// =============== BACKEND + FRONTEND IN ONE FILE ===============
const express = require('express');
const fetch = require('node-fetch');
const app = express();

// Serve static files
app.use(express.static('public'));

// 1. AI Search API
app.get('/api/search', async (req, res) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: req.query.q }]
      })
    });
    const data = await response.json();
    res.json({ answer: data.choices[0].message.content });
  } catch (error) {
    res.json({ answer: "⚠️ AI service overloaded. Try again later." });
  }
});

// 2. Serve Frontend
app.get('*', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>n.ai.in - Smarter Search</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      text-align: center;
    }
    #search-box {
      margin: 50px 0;
      display: flex;
      gap: 10px;
    }
    #query {
      flex: 1;
      padding: 12px;
      font-size: 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    button {
      background: #1a73e8;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 4px;
      cursor: pointer;
    }
    #result {
      margin-top: 30px;
      padding: 20px;
      border: 1px solid #eee;
      border-radius: 8px;
      text-align: left;
    }
  </style>
</head>
<body>
  <h1>n.ai.in 🔍</h1>
  <div id="search-box">
    <input type="text" id="query" placeholder="Ask anything..." autofocus>
    <button onclick="search()">Search</button>
  </div>
  <div id="result"></div>

  <script>
    async function search() {
      const query = document.getElementById("query").value;
      if (!query) return;
      
      document.getElementById("result").innerHTML = "🔍 Searching...";
      
      try {
        const response = await fetch('/api/search?q=' + encodeURIComponent(query));
        const data = await response.json();
        document.getElementById("result").innerHTML = data.answer;
      } catch {
        document.getElementById("result").innerHTML = "⚠️ Service unavailable";
      }
    }
    
    // Search when pressing Enter
    document.getElementById("query").addEventListener("keypress", (e) => {
      if (e.key === "Enter") search();
    });
  </script>
</body>
</html>
  `);
});

module.exports = app;
