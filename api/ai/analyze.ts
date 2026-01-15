import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';
import OpenAI from 'openai';

function getProvider(req: VercelRequest): 'gemini' | 'deepseek' {
  const p = (req.body?.provider || req.query.provider || '').toString().toLowerCase();
  return p === 'deepseek' ? 'deepseek' : 'gemini';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { title, content, url } = req.body || {};
    const provider = getProvider(req);

    if (!title && !content && !url) {
      return res.status(400).send('Missing input');
    }

    if (provider === 'deepseek') {
      const apiKey = process.env.DEEPSEEK_API_KEY;
      const baseURL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
      if (!apiKey) return res.status(500).send('DEEPSEEK_API_KEY not set');
      const client = new OpenAI({ apiKey, baseURL });

      const system = '你是一个专业的职场分析助手。对输入内容进行摘要、提取关键词、判断类型，并抽取任务列表。用 JSON 输出。';
      const user = `标题: ${title || '未命名'}\n链接: ${url || '无'}\n文本内容: ${content || '无'}\n\n返回 JSON，字段: summary(string), keywords(string[]), suggested_type(one of promotional|meeting_minutes|policy_application|project_proposal), extracted_tasks(string[])`;
      const r = await client.chat.completions.create({
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.3,
      });
      const text = r.choices?.[0]?.message?.content || '{}';
      try {
        const parsed = JSON.parse(text);
        return res.status(200).json(parsed);
      } catch {
        return res.status(200).json({ raw: text });
      }
    } else {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
      if (!apiKey) return res.status(500).send('GEMINI_API_KEY not set');
      const ai = new GoogleGenAI({ apiKey });
      const model = 'gemini-3-flash-preview';

      const prompt = `请分析以下工作记录内容或提供的链接。\n如果提供了 URL，请尽可能利用搜索功能提炼其核心摘要。\n请提供一个简洁的摘要、关键词，并将其分类为以下类型之一：'promotional','meeting_minutes','policy_application','project_proposal'。\n\n标题: ${title || '未命名'}\n链接: ${url || '无'}\n文本内容: ${content || '无'}`;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggested_type: { type: Type.STRING, enum: ['promotional','meeting_minutes','policy_application','project_proposal'] },
              extracted_tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['summary','keywords','suggested_type','extracted_tasks']
          }
        }
      });

      const text = response.text.trim();
      const parsed = JSON.parse(text);
      return res.status(200).json(parsed);
    }
  } catch (err: any) {
    return res.status(500).send(err?.message || 'Internal Error');
  }
}
