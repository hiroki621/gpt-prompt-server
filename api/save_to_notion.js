// api/save_to_notion.js
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = "1fee5bd087a980528c40dc22697aad8c";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { notion_horse_name, notion_race_name, notion_category, content } = req.body;

  if (!notion_horse_name || !notion_race_name || !notion_category || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // 段落ごとに本文を分割（2つ以上の改行で区切る）
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
    // Step 1: ページ作成（プロパティのみ）
    const page = await notion.pages.create({
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
    });

    // Step 2: 本文ブロックをページに追加
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
