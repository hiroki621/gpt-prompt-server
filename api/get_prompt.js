export default async function handler(req, res) {
  const { type } = req.query;

  const PROMPT_URLS = {
    prospect: 'https://gist.githubusercontent.com/hiroki621/cffe8d790344126ae4eef668d605290e/raw/ed48585c8b9ce458cbf3b8c2f71ce08fbee08791/Processor_Prospect_netkeibaStyle.txt'
  };

  const url = PROMPT_URLS[type];

  if (!url) {
    return res.status(400).json({ error: 'Invalid type' });
  }

  try {
    const response = await fetch(url);
    const text = await response.text();
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(text);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch prompt' });
  }
}
