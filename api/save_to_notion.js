// api/save_to_notion.js
import { Client } from "@notionhq/client";

// ✅ Notion初期化
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = "1fee5bd087a980528c40dc22697aad8c"; // ← 必要に応じて書き換え

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { notion_horse_name, notion_race_name, notion_category, content } = req.body;

  if (!notion_horse_name || !notion_race_name || !notion_category || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // ✅ 本文を段落ごとに分割してchildrenとして渡す
  const contentBlocks = content
    .split(/\n{2,}/) // 2つ以上の改行で段落分割
    .filter(p => p.trim() !== "")
    .map(paragraph => ({
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            type: "text",
            text: {
              content: paragraph,
            },
          },
        ],
      },
    }));

  try {
    const response = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
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
      children: contentBlocks, // ✅ 本文をここに渡す
    });

    res.status(200).json({ success: true, notionPageId: response.id });
  } catch (error) {
    console.error("❌ Notion API Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
