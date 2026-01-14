
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

// 初始化 AI 引擎。遵循安全规范，通过环境变量 process.env.API_KEY 获取授权
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * AI 工作内容分析接口
 * 实现：内容提炼、分类建议、关键词提取及任务识别
 */
export const analyzeWorkContent = async (title: string, content: string, url?: string): Promise<AIAnalysisResult> => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    请作为业务专家，对以下工作数据进行深度提炼与概括：
    
    [事项标题]: ${title || '未命名'}
    [参考资源]: ${url || '无'}
    [原始内容]: ${content || '无'}
    
    要求：
    1. 提炼 50 字以内的核心摘要。
    2. 提取 3-5 个业务关键词。
    3. 识别其中潜藏的待办事项（Action Items）。
    4. 自动匹配最符合的分类：'promotional', 'meeting_minutes', 'policy_application', 'project_proposal'。
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "你是一个高效的行政与内容专家。你擅长从杂乱的信息中提取结构化的业务情报。请确保返回的 JSON 数据结构完整且逻辑清晰。",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggested_type: { 
              type: Type.STRING, 
              enum: ['promotional', 'meeting_minutes', 'policy_application', 'project_proposal'] 
            },
            extracted_tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["summary", "keywords", "suggested_type", "extracted_tasks"]
        }
      }
    });

    return JSON.parse(response.text.trim()) as AIAnalysisResult;
  } catch (error) {
    console.error("AI 引擎分析失败:", error);
    throw new Error("AI 提炼失败，请检查网络或配置。");
  }
};

/**
 * 智能项目健康度分析
 */
export const analyzeProjectStatus = async (projectName: string, description: string, progress: number): Promise<string> => {
  const prompt = `
    项目名称: ${projectName}
    当前进度: ${progress}%
    描述: ${description}
    
    请简要分析该项目的健康度，并给出一句核心建议。
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: "你是一个项目管理专家（PMP）。请给出精炼的、批判性的分析结果。字数控制在 40 字以内。"
    }
  });

  return response.text || "暂无 AI 分析反馈。";
};

/**
 * 生成月度复盘报告
 */
export const generateMonthlyReport = async (records: any[], month: string): Promise<string> => {
  const prompt = `
    请基于 ${month} 的 ${records.length} 条真实记录，撰写一份具备专业深度的月度复盘。
    
    数据集: ${JSON.stringify(records)}
    
    请包含：总体趋势、核心突破点、效能瓶颈以及下月执行策略。
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: "你是一个企业的首席运营官（COO）。你的报告风格稳重、客观、充满前瞻性。请使用 Markdown 格式。"
    }
  });
  
  return response.text || "报告生成失败。";
};
