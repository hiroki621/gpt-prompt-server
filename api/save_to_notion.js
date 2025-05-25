// api/save_to_notion_article.js

import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_API_KEY  // ← Vercelの Environment Variables に登録したトークン名
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;  // ← Vercelに登録したデータベースID

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { notion_horse_name, notion_race_name, notion_category, content } = req.body;

  if (!notion_horse_name || !notion_race_name || !notion_category || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        Title: {
          title: [
            {
              text: {
                content: `${notion_race_name}｜${notion_horse_name}`,
              },
            },
          ],
        },
        notion_horse_name: {
          rich_text: [{ text: { content: notion_horse_name } }],
        },
        notion_race_name: {
          rich_text: [{ text: { content: notion_race_name } }],
        },
        notion_category: {
          select: { name: notion_category },
        },
        content: {
          rich_text: [{ text: { content } }],
        },
      },
    });

    res.status(200).json({ message: 'Notion page created', pageId: response.id });
  } catch (error) {
    console.error('Error saving to Notion:', error);
    res.status(500).json({ error: 'Failed to save to Notion', detail: error.message });
  }
}
