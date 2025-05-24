export default async function handler(req, res) {
  const { type, horse } = req.query;

  if (!type || type !== 'rl' || !horse) {
    return res.status(400).json({ error: 'Missing or invalid parameters' });
  }

  const gistId = '81d3d0662dc08dfd9aee87c6c9b61299'; // RL専用Gist ID（固定）
  const safeHorseName = horse.replace(/\s+/g, '_'); // スペースをアンダースコアに変換
  const filename = `rl-${safeHorseName}.txt`;
  const rawUrl = `https://gist.githubusercontent.com/hiroki621/${gistId}/raw/${filename}`;

  try {
    const response = await fetch(rawUrl);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch file from Gist' });
    }

    const text = await response.text();
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(text);
  } catch (err) {
    res.status(500).json({ error: 'Unexpected error', detail: err.message });
  }
}
