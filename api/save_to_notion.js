// api/save_to_notion.js

import { Client } from "@notionhq/client";

// ✅ Notionクライアント初期化
const notion = new Client({ auth: process.env.NOTION_TOKEN });

// ✅ あなたのNotion Database IDに置き換えてください（環境変数化してもOK）
const DATABASE_ID = "1fee5bd087a980528c40dc22697aad8c";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { notion_horse_name, notion_race_name, notion_category, content } = req.body;

  if (!notion_horse_name || !notion_race_name || !notion_category || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // ✅ 本文を段落に分ける（2つ以上の改行で分割）
  const contentBlocks = content
    .split(/\n{2,}/)
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
    // ✅ Step 1：レース名をタイトルにしたページを作成
    const page = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        "レース名": {
          title: [
            {
              text: {
                content: notion_race_name,
              },
            },
          ],
        },
        "馬名": {
          rich_text: [
            {
              text: {
                content: notion_horse_name,
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
    });

    // ✅ Step 2：本文段落をchildrenとしてページに追加
    await notion.blocks.children.append({
      block_id: page.id,
      children: contentBlocks,
    });

    res.status(200).json({ success: true, notionPageId: page.id });
  } catch (error) {
    console.error("❌ Notion保存エラー:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
