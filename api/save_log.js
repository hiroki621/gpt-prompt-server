// api/save_log.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  let { gist_id, filename, content, horse, type } = req.body;

  if (!gist_id || !content) {
    return res.status(400).json({ error: 'Missing required parameters (gist_id or content)' });
  }

  // filename が指定されていない場合、自動生成
  if (!filename && horse && type) {
    const prefixMap = { rl: 'rl-', hcl: 'hcl-' };
    const safeHorse = horse.replace(/\s+/g, '_'); // スペースをアンダーバーに
    filename = `${prefixMap[type] || ''}${safeHorse}.txt`;
  }

  if (!filename) {
    return res.status(400).json({ error: 'Filename could not be determined' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  try {
    const gistUrl = `https://api.github.com/gists/${gist_id}`;

    // Gistファイル取得
    const getResponse = await fetch(gistUrl, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json'
      }
    });

    const gistData = await getResponse.json();
    const existingContent = gistData.files[filename]?.content || '';

    const updatedContent = existingContent + '\n' + content;

    // PATCHで更新
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
      const error = await patchResponse.text();
      return res.status(500).json({ error: 'Failed to update Gist', detail: error });
    }

    return res.status(200).json({ message: 'Gist updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected error', detail: error.message });
  }
}
