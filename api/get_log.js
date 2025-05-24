// api/get_log.js
export default async function handler(req, res) {
  const { type, horse } = req.query;

  // ✅ バリデーション：RL専用
  if (!type || type !== 'rl') {
    return res.status(400).json({ error: 'Invalid type: get_log supports only type=rl. Use get_log_batch for HCL.' });
  }

  if (!horse) {
    return res.status(400).json({ error: 'Missing required parameter: horse' });
  }

  // ✅ ファイル構成：RL専用（1馬＝1ファイル）
  const gistId = '81d3d0662dc08dfd9aee87c6c9b61299'; // RL専用Gist ID
  const safeHorseName = horse.replace(/\s+/g, '_');
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
