// api/save_to_notion.js

import { Client } from "@notionhq/client";

// Notionクライアント初期化（トークンは環境変数から、DB IDは直書き）
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// ✅ Notion Database ID をここに直書き
const DATABASE_ID = "1fee5bd087a980528c40dc22697aad8c"; // ← あなたのDB IDに置き換えてOK

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { notion_horse_name, notion_race_name, notion_category, content } = req.body;

  if (!notion_horse_name || !notion_race_name || !notion_category || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

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
