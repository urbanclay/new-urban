import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
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
    const { records, month } = req.body || {};
    const provider = getProvider(req);
    if (!Array.isArray(records) || !month) return res.status(400).send('Missing records or month');

    const prompt = `你是一位资深的职场导师和项目分析师。请根据以下 ${month} 月份的工作记录，生成一份专业、有深度的月度复盘报告。\n工作记录包含：宣传内容、会议纪要、政策申报和项目方案四大类。\n\n工作记录数据: ${JSON.stringify(records)}\n\n要求报告包含以下板块：\n1. 本月工作综述\n2. 分类成果复盘 (按宣传、会议、申报、方案分类)\n3. 核心效能分析\n4. 存在问题与改进建议\n5. 下一步计划事项\n\n请使用 Markdown 格式。`;

    if (provider === 'deepseek') {
      const apiKey = process.env.DEEPSEEK_API_KEY;
      const baseURL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
      if (!apiKey) return res.status(500).send('DEEPSEEK_API_KEY not set');
      const client = new OpenAI({ apiKey, baseURL });
      const r = await client.chat.completions.create({
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一个专业的报告撰写助手，用中文输出 Markdown。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
      });
      const text = r.choices?.[0]?.message?.content || '报告生成失败。';
      return res.status(200).json({ report: text });
    } else {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
      if (!apiKey) return res.status(500).send('GEMINI_API_KEY not set');
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return res.status(200).json({ report: response.text || '报告生成失败。' });
    }
  } catch (err: any) {
    return res.status(500).send(err?.message || 'Internal Error');
  }
}
