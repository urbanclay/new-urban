
import React, { useState } from 'react';
// import { analyzeWorkContent } from '../services/geminiService';
import { analyzeWorkContentAPI, type Provider } from '../services/aiClient';
import { RecordType, Priority } from '../types';
import { Loader2, Link as LinkIcon, Wand2, CheckCircle2, AlertCircle } from 'lucide-react';

interface RecordFormProps {
  onSuccess: (newRecord: any) => void;
  userId: string;
  provider: Provider;
}

const RecordForm: React.FC<RecordFormProps> = ({ onSuccess, userId, provider }) => {
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link_url: '',
    record_type: 'promotional' as RecordType,
    priority: 'medium' as Priority,
    content: ''
  });

  const handleAnalyze = async () => {
    if (!formData.title && !formData.link_url && !formData.content) return;
    setLoading(true);
    setAnalyzed(false);
    try {
      const analysis = await analyzeWorkContentAPI({ title: formData.title, content: formData.content, url: formData.link_url, provider });
      setFormData(prev => ({
        ...prev,
        description: analysis.summary,
        record_type: (analysis.suggested_type as RecordType) || prev.record_type,
        title: prev.title || (analysis.keywords[0] ? `关于 ${analysis.keywords[0]} 的记录` : prev.title)
      }));
      setAnalyzed(true);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      user_id: userId,
      created_at: new Date().toISOString(),
      ai_summary: formData.description,
      status: 'active',
      progress: 0
    };
    onSuccess(newRecord);
    setFormData({ title: '', description: '', link_url: '', record_type: 'promotional', priority: 'medium', content: '' });
    setAnalyzed(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-8 shadow-2xl border border-slate-100">
      <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
        <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Wand2 size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">智能数据录入</h2>
          <p className="text-sm text-slate-400 font-medium">利用 AI 神经网路提炼核心摘要。</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">事项标识标题</label>
            <input
              type="text"
              required
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-slate-900"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="输入任务或文档标题..."
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">数据分类</label>
            <select
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white transition-all font-bold appearance-none text-slate-700"
              value={formData.record_type}
              onChange={e => setFormData({ ...formData, record_type: e.target.value as RecordType })}
            >
              <option value="promotional">宣传内容</option>
              <option value="meeting_minutes">会议纪要</option>
              <option value="policy_application">政策申报</option>
              <option value="project_proposal">项目方案</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">运行优先级</label>
            <select
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white transition-all font-bold appearance-none text-slate-700"
              value={formData.priority}
              onChange={e => setFormData({ ...formData, priority: e.target.value as Priority })}
            >
              <option value="high">Critical / 高</option>
              <option value="medium">Normal / 中</option>
              <option value="low">Standard / 低</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <LinkIcon size={12} className="text-blue-500" /> 资源定位符 (URL)
          </label>
          <input
            type="url"
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white transition-all text-sm font-medium"
            value={formData.link_url}
            onChange={e => setFormData({ ...formData, link_url: e.target.value })}
            placeholder="粘贴参考链接..."
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">原始内容负载</label>
          <textarea
            rows={4}
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none resize-none focus:bg-white transition-all text-sm font-medium"
            value={formData.content}
            onChange={e => setFormData({ ...formData, content: e.target.value })}
            placeholder="在此处粘贴文本内容，供 AI 深入分析..."
          />
        </div>

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading || (!formData.content && !formData.link_url)}
          className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-black transition-all shadow-lg ${
            analyzed 
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
              : 'bg-slate-900 text-white hover:bg-black'
          } disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none uppercase tracking-widest text-xs`}
        >
          {loading ? (
            <><Loader2 className="animate-spin" size={18} /> Model Processing...</>
          ) : analyzed ? (
            <><CheckCircle2 size={18} /> Content Extracted</>
          ) : (
            <><Wand2 size={18} /> Initialize AI Extraction</>
          )}
        </button>

        <div className={`pt-2 transition-all duration-300 ${formData.description ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none h-0'}`}>
          <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2">
             AI Data Summary
          </label>
          <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-5 text-blue-900 font-bold italic text-xs leading-relaxed">
            {formData.description}
          </div>
        </div>
      </div>

      <div className="mt-10">
        <button
          type="submit"
          className="w-full py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all uppercase tracking-[0.2em] text-xs"
        >
          Commit & Sync Data
        </button>
      </div>
    </form>
  );
};

export default RecordForm;
