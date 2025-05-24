import fetch from 'node-fetch';

export default async function handler(req, res) {
  let { gist_id, filename, content, horse, type } = req.body;

  if (!content || !type) {
    return res.status(400).json({ error: 'Missing required parameters: type or content' });
  }

  // ✅ Gist ID を type に応じて固定化
  const GIST_IDS = {
    rl: '81d3d0662dc08dfd9aee87c6c9b61299',  // RL用Gist ID
    hcl: 'd8d3bad3b0efc66db657ee17b14c46da'  // 実際のHCL Gist IDに差し替え
  };

  gist_id = GIST_IDS[type];
  if (!gist_id) {
    return res.status(400).json({ error: 'Invalid type or missing Gist ID' });
  }

  // ✅ ファイル名の自動生成
  if (!filename) {
    if (type === 'hcl') {
      filename = 'hcl-master.txt';
    } else if (type === 'rl' && horse) {
      const safeHorse = horse.replace(/\s+/g, '_');
      filename = `rl-${safeHorse}.txt`;
    } else {
      return res.status(400).json({ error: 'Filename could not be determined' });
    }
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  try {
    const gistUrl = `https://api.github.com/gists/${gist_id}`;

    // ✅ 既存ファイル取得
    const getResponse = await fetch(gistUrl, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json'
      }
    });

    const gistData = await getResponse.json();

    // ✅ 既存内容に追記
    const existingContent = gistData.files[filename]?.content || '';
    const updatedContent = existingContent.trimEnd() + '\n' + content.trim() + '\n';

    // ✅ 更新リクエスト
    const patchResponse = await fetch(gistUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json'
      },
      body: JSON.stringify({
        files: {
          [filename]: {
            content: updatedContent
          }
        }
      })
    });

    if (!patchResponse.ok) {
      const errorText = await patchResponse.text();
      return res.status(500).json({ error: 'Failed to update Gist', detail: errorText });
    }

    return res.status(200).json({ message: 'Gist updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected error', detail: error.message });
  }
}
