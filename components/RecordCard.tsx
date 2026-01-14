
import React from 'react';
import { WorkRecord } from '../types';
import { ExternalLink, FileText, Tag, Clock, ArrowUpRight, Trash2, Sparkles, BrainCircuit } from 'lucide-react';

interface RecordCardProps {
  record: WorkRecord;
  onDelete?: () => void;
}

const RecordCard: React.FC<RecordCardProps> = ({ record, onDelete }) => {
  const typeMap: Record<string, string> = {
    promotional: '宣传内容',
    meeting_minutes: '会议纪要',
    policy_application: '政策申报',
    project_proposal: '项目方案'
  };

  const isDeleted = record.status === 'deleted';

  return (
    <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 p-6 hover:shadow-xl hover:border-blue-100 transition-all group/card duration-300 relative overflow-hidden flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-black text-lg text-slate-900 line-clamp-1 group-hover/card:text-blue-600 transition-colors">
          {record.title}
        </h3>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-lg tracking-widest ${
            record.priority === 'high' ? 'bg-red-50 text-red-500 border border-red-100' : 
            record.priority === 'medium' ? 'bg-amber-50 text-amber-500 border border-amber-100' : 'bg-slate-50 text-slate-500 border border-slate-100'
          }`}>
            {record.priority === 'high' ? 'High' : record.priority === 'medium' ? 'Med' : 'Low'}
          </span>
          {!isDeleted && onDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed font-medium">{record.description}</p>

      {record.link_url && (
        <a 
          href={record.link_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-2 text-xs bg-slate-50 text-slate-700 p-3 rounded-xl border border-slate-100 group/link hover:bg-blue-50 hover:border-blue-100 hover:text-blue-600 transition-all mb-4"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <ExternalLink size={14} className="flex-shrink-0" />
            <span className="truncate font-bold tracking-tight">访问外部链接</span>
          </div>
          <ArrowUpRight size={14} className="opacity-0 group-hover/link:opacity-100 transition-all" />
        </a>
      )}

      {record.ai_summary && (
        <div className="bg-blue-50/40 p-4 rounded-2xl mb-5 border border-blue-100/50 relative group/ai">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
              <div className="p-1 bg-blue-100 rounded-lg">
                <Tag size={12} />
              </div>
              AI Analysis
            </div>
            <BrainCircuit size={14} className="text-blue-400 opacity-50" />
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed font-bold italic">
            "{record.ai_summary}"
          </p>
          <div className="absolute -right-1 -top-1 opacity-0 group-hover/ai:opacity-100 transition-opacity">
             <Sparkles size={14} className="text-blue-400 animate-pulse" />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-auto pt-4 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <FileText size={12} />
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg font-bold">{typeMap[record.record_type] || record.record_type}</span>
        </div>
        <div className="flex items-center gap-1 font-bold">
          <Clock size={12} />
          <span>{new Date(record.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default RecordCard;
