import fetch from 'node-fetch';

export default async function handler(req, res) {
  let { gist_id, filename, content, horse, type } = req.body;

  if (!content || !type) {
    return res.status(400).json({ error: 'Missing required parameters: type or content' });
  }

  // ✅ Gist ID を type に応じて固定化
  const GIST_IDS = {
    rl: '81d3d0662dc08dfd9aee87c6c9b61299',  // RL用Gist ID（固定）
    hcl: 'd8d3bad3b0efc66db657ee17b14c46da'  // HCL用Gist ID（固定）
  };

  gist_id = GIST_IDS[type];
  if (!gist_id) {
    return res.status(400).json({ error: 'Invalid type or missing Gist ID' });
  }

  // ✅ ファイル名の自動生成（filename省略時）
  if (!filename) {
    if (type === 'hcl') {
      filename = 'hcl-master.txt';
    } else if (type === 'rl' && horse) {
      const safeHorse = horse.replace(/\s+/g, '_').replace(/[^\w\-一-龯ぁ-んァ-ンー]/g, '');
      filename = `rl-${safeHorse}.txt`;
    } else {
      return res.status(400).json({ error: 'Filename could not be determined' });
    }
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  try {
    const gistUrl = `https://api.github.com/gists/${gist_id}`;

    // ✅ Gistの既存情報取得（他ファイルを保持するため）
    const getResponse = await fetch(gistUrl, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json'
      }
    });

    const gistData = await getResponse.json();

    // ✅ 対象ファイルのみ新しい内容に差し替え（上書き）
    gistData.files[filename] = {
      content: content.trim() + '\n'  // 最後に1改行を追加して整える
    };

    // ✅ Gist全体を更新（他のファイルを壊さない）
    const patchResponse = await fetch(gistUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json'
      },
      body: JSON.stringify({
        files: gistData.files
      })
    });

    if (!patchResponse.ok) {
      const errorText = await patchResponse.text();
      return res.status(500).json({ error: 'Failed to update Gist', detail: errorText });
    }

    return res.status(200).json({ message: `Gist updated: ${filename}` });
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected error', detail: error.message });
  }
}
