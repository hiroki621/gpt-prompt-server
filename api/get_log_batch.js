export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { type, horses } = req.body;

  if (!type || !horses || !Array.isArray(horses)) {
    res.status(400).json({ error: 'Missing or invalid parameters' });
    return;
  }

  const logs = {};

  for (const horse of horses) {
    try {
      const response = await fetch(`https://gpt-prompt-server.vercel.app/api/get_log?type=${type}&horse=${encodeURIComponent(horse)}`);
      const text = await response.text();

      // 空ファイルまたはエラー時には null を返すように調整
      logs[horse] = {
        text: text.trim().length > 0 ? text : null
      };
    } catch (err) {
      logs[horse] = { text: null };
    }
  }

  res.status(200).json({ logs });
}
