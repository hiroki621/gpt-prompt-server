// api/save_to_notion.js

import { Client } from "@notionhq/client";

// ✅ Notionクライアント初期化
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// ✅ Notion Database ID を直接指定（もしくは process.env.NOTION_DATABASE_ID でもOK）
const DATABASE_ID = "1fee5bd087a980528c40dc22697aad8c";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { notion_horse_name, notion_race_name, notion_category, content } = req.body;

  if (!notion_horse_name || !notion_race_name || !notion_category || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // ✅ 長文を分割（Notionのrich_text制限への対策）
  const contentBlocks = content.match(/(.|[\r\n]){1,1000}/g).map(text => ({
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [
        {
          type: "text",
          text: {
            content: text,
          },
        },
      ],
    },
  }));

  try {
    const response = await notion.pages.create({
      parent: {
        database_id: DATABASE_ID,
      },
      properties: {
        "馬名": {
          title: [
            {
              text: {
                content: notion_horse_name,
              },
            },
          ],
        },
        "レース名": {
          rich_text: [
            {
              text: {
                content: notion_race_name,
              },
            },
          ],
        },
        "カテゴリ": {
          select: {
            name: notion_category,
          },
        },
        "作成日": {
          date: {
            start: new Date().toISOString(),
          },
        },
      },
      children: contentBlocks,
    });

    res.status(200).json({ success: true, notionPageId: response.id });
  } catch (error) {
    console.error("❌ Notion API Error:", error); // ← エラー詳細出力
    res.status(500).json({ success: false, error: error.message });
  }
}
