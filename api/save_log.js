// api/save_log.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  let { gist_id, filename, content, horse, type } = req.body;

  // ✅ Gist ID のバリデーション & 強制補正
  const FIXED_GIST_ID = '81d3d0662dc08dfd9aee87c6c9b61299';
  if (!gist_id || !/^[a-f0-9]{32}$/.test(gist_id)) {
    gist_id = FIXED_GIST_ID;
  }

  if (!content) {
    return res.status(400).json({ error: 'Missing required parameter: content' });
  }

  // ✅ filename 自動生成（スペースはアンダースコアに）
  if (!filename && horse && type) {
    const prefixMap = { rl: 'rl-', hcl: 'hcl-' };
    const safeHorse = horse.replace(/\s+/g, '_');
    filename = `${prefixMap[type] || ''}${safeHorse}.txt`;
  }

  if (!filename) {
    return res.status(400).json({ error: 'Filename could not be determined' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  try {
    const gistUrl = `https://api.github.com/gists/${gist_id}`;

    // ✅ Gistファイルの取得
    const getResponse = await fetch(gistUrl, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json'
      }
    });

    const gistData = await getResponse.json();

    // ✅ 新規ファイルも許容：既存コンテンツがなければ空扱い
    const existingContent = gistData.files[filename]?.content || '';
    const updatedContent = existingContent.trimEnd() + '\n' + content.trim() + '\n';

    // ✅ PATCH リクエストでファイルを更新または新規作成
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
