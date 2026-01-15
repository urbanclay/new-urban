
import React from 'react';
import { Project } from '../types';
import { Calendar, Layers, FileIcon, AlertCircle, CheckCircle2, Clock, PlayCircle, Trash2 } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onDelete?: () => void;
  onOpen?: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const statusConfig = {
    planned: { icon: <Clock size={14} />, text: '计划中', color: 'text-slate-400', bg: 'bg-slate-50' },
    in_progress: { icon: <PlayCircle size={14} />, text: '进行中', color: 'text-blue-600', bg: 'bg-blue-50' },
    completed: { icon: <CheckCircle2 size={14} />, text: '已完成', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    delayed: { icon: <AlertCircle size={14} />, text: '已延误', color: 'text-red-500', bg: 'bg-red-50' },
    deleted: { icon: <Trash2 size={14} />, text: '已删除', color: 'text-slate-300', bg: 'bg-slate-100' }
  };

  const config = statusConfig[project.status] || statusConfig.planned;
  const isDeleted = project.status === 'deleted';

  return (
    <div onClick={() => onOpen && onOpen(project)} className="cursor-pointer bg-white rounded-[2rem] border border-slate-100 p-8 hover:shadow-2xl hover:border-blue-100 transition-all duration-300 group/card relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border border-slate-100 text-[9px] font-black uppercase tracking-widest ${config.bg} ${config.color}`}>
          {config.icon}
          {config.text}
        </div>
        <div className="flex items-center gap-2">
          {!isDeleted && onDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 size={16} />
            </button>
          )}
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
            <Calendar size={12} />
            {project.target_date || 'TBD'}
          </div>
        </div>
      </div>

      <h3 className="font-black text-xl text-slate-900 mb-3 leading-tight group-hover/card:text-blue-600 transition-colors">{project.name}</h3>
      <p className="text-sm text-slate-500 line-clamp-2 mb-8 font-medium leading-relaxed">{project.description}</p>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
            <span>Execution Progress</span>
            <span className="text-slate-900">{project.progress}%</span>
          </div>
          <div className="bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                project.status === 'completed' ? 'bg-emerald-500' : 
                project.status === 'delayed' ? 'bg-red-500' : isDeleted ? 'bg-slate-300' : 'bg-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
              }`}
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                <Layers size={14} className="text-slate-400" />
                <span>{project.linked_record_ids.length} Links</span>
             </div>
             {project.file_name && (
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                  <FileIcon size={14} className="text-amber-500" />
                  <span className="truncate max-w-[80px]">Assets</span>
               </div>
             )}
          </div>
          <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">Monitor</button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
