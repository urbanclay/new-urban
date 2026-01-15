export type Provider = 'gemini' | 'deepseek';

export interface AnalyzePayload {
  title: string;
  content: string;
  url?: string;
  provider?: Provider;
}

export interface AnalysisResult {
  summary: string;
  keywords: string[];
  suggested_type: 'promotional' | 'meeting_minutes' | 'policy_application' | 'project_proposal';
  extracted_tasks: string[];
}

export async function analyzeWorkContentAPI(body: AnalyzePayload, apiBase = import.meta.env.VITE_PUBLIC_API_BASE || ''): Promise<AnalysisResult> {
  const res = await fetch(`${apiBase}/api/ai/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Analyze API failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function generateMonthlyReportAPI(records: any[], month: string, provider: Provider = 'gemini', apiBase = import.meta.env.VITE_PUBLIC_API_BASE || ''): Promise<string> {
  const res = await fetch(`${apiBase}/api/ai/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ records, month, provider }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Report API failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.report as string;
}
