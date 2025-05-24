export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, horses } = req.body;

  if (!type || type !== 'hcl' || !Array.isArray(horses)) {
    return res.status(400).json({ error: 'Invalid or missing parameters' });
  }

  const gistId = 'd8d3bad3b0efc66db657ee17b14c46da';
  const filename = 'hcl-master.txt';

  try {
    const response = await fetch(`https://api.github.com/gists/${gistId}`);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch Gist metadata' });
    }

    const gistData = await response.json();
    const fileContent = gistData.files[filename]?.content;

    if (!fileContent) {
      return res.status(404).json({ error: 'hcl-master.txt not found in Gist' });
    }

    const logs = {};
    horses.forEach(horse => {
      const regex = new RegExp(`^【${horse}】\\n騎手：.*\\n調教師：.*`, 'm');
      const match = fileContent.match(regex);
      logs[horse] = { text: match ? match[0] : null };
    });

    res.status(200).json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Unexpected error', detail: err.message });
  }
}
