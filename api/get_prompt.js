export default async function handler(req, res) {
  const { type } = req.query;

  const PROMPT_URLS = {
    prospect: 'https://gist.githubusercontent.com/hiroki621/cffe8d790344126ae4eef668d605290e/raw/Processor_Prospect_netkeibaStyle.txt',
    recap: 'https://gist.githubusercontent.com/hiroki621/b2b4620eefaeae5765fcf3407ad142a3/raw/Processor_Recap.txt',
    racelog: 'https://gist.githubusercontent.com/hiroki621/fb055d7ff8413d292b15d5bfd0627bc5/raw/Processor_RaceLog.txt',
    horseconnectionslog: 'https://gist.githubusercontent.com/hiroki621/d8d3bad3b0efc66db657ee17b14c46da/raw/Processor_HorseConnectionsLog.txt'
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
