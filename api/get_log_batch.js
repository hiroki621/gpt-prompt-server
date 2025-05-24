export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, horses } = req.body;

  if (!type || !Array.isArray(horses) || type !== 'hcl') {
    return res.status(400).json({ error: 'Invalid or missing parameters' });
  }

  const gistId = '81d3d0662dc08dfd9aee87c6c9b61299'; // 共通Gist ID
  const filename = 'hcl-master.txt'; // HCLは1ファイルで全頭管理
  const rawUrl = `https://gist.githubusercontent.com/hiroki621/${gistId}/raw/${filename}`;

  try {
    const response = await fetch(rawUrl);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch file from Gist' });
    }

    const fullText = await response.text();
    const logs = {};

    horses.forEach(horse => {
      // 馬ごとのHCL構文を正規表現で抽出（3行構成）
      const regex = new RegExp(`^【${horse}】\\n騎手：.*\\n調教師：.*`, 'm');
      const match = fullText.match(regex);
      logs[horse] = { text: match ? match[0] : null };
    });

    res.status(200).json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Unexpected error', detail: err.message });
  }
}
