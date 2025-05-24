const express = require('express');

const app = express();
const PORT = 3000;

// あなたのGistの「Raw URL」をここに貼ってください
const PROMPT_URLS = {
  prospect: 'https://gist.githubusercontent.com/hiroki621/cffe8d790344126ae4eef668d605290e/raw/ed48585c8b9ce458cbf3b8c2f71ce08fbee08791/Processor_Prospect_netkeibaStyle.txt'
};


app.get('/get_prompt', async (req, res) => {
  const type = req.query.type;
  const url = PROMPT_URLS[type];

  if (!url) {
    return res.status(400).json({ error: 'Invalid type' });
  }

  try {
    const response = await fetch(url);
    const text = await response.text();
    res.send(text);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch prompt' });
  }
});

app.listen(PORT, () => {
  console.log(`Prompt server running at http://localhost:${PORT}`);
});
