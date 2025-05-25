// /api/save_to_notion.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { notion_horse_name, notion_race_name, notion_category, content } = req.body;

  if (!notion_horse_name || !notion_race_name || !notion_category || !content) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // ここでは仮にNotion APIのエミュレーションとして保存ログを返します。
    // 本番では Notion API v1 との統合が必要になります。

    const notionPageId = `notion-${Date.now()}`; // 仮のページID（デモ用）

    return res.status(200).json({
      success: true,
      notionPageId,
      message: `Article for ${notion_horse_name} saved successfully.`
    });
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected error', detail: error.message });
  }
}
