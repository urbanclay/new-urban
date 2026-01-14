
import React, { useState } from 'react';
import { Project, WorkRecord, ProjectStatus, Priority } from '../types';
import { FolderPlus, FileUp, Link as LinkIcon, CheckCircle2, X } from 'lucide-react';

interface ProjectFormProps {
  onSuccess: (project: Project) => void;
  availableRecords: WorkRecord[];
  userId: string;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSuccess, availableRecords, userId }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planned' as ProjectStatus,
    priority: 'medium' as Priority,
    progress: 0,
    start_date: new Date().toISOString().split('T')[0],
    target_date: '',
    file_name: '',
    linked_record_ids: [] as string[]
  });

  const toggleRecord = (id: string) => {
    setFormData(prev => ({
      ...prev,
      linked_record_ids: prev.linked_record_ids.includes(id)
        ? prev.linked_record_ids.filter(rid => rid !== id)
        : [...prev.linked_record_ids, id]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file_name: e.target.files[0].name });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      user_id: userId,
      project_type: 'general'
    };
    onSuccess(newProject);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-8 shadow-2xl border border-gray-100 max-h-[85vh] overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
          <FolderPlus size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">启动新项目</h2>
          <p className="text-sm text-gray-500">定义项目目标并关联现有的工作任务。</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">项目名称</label>
          <input
            type="text"
            required
            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-semibold"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="例如：2024 年度品牌升级工程"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">初始状态</label>
            <select
              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
            >
              <option value="planned">⚪ 计划开始</option>
              <option value="in_progress">🔵 进行中</option>
              <option value="completed">🟢 已完成</option>
              <option value="delayed">🔴 已延误</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">目标完成日</label>
            <input
              type="date"
              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none"
              value={formData.target_date}
              onChange={e => setFormData({ ...formData, target_date: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">项目背景与说明</label>
          <textarea
            rows={3}
            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none resize-none"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="详细描述项目的目标、受众及预期结果..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">上传附件</label>
          <div className="relative">
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-full px-5 py-4 bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-2xl flex items-center justify-center gap-2 text-blue-600 font-medium">
              <FileUp size={18} />
              {formData.file_name || "选择项目计划书或相关附件"}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <LinkIcon size={14} /> 关联工作记录 ({formData.linked_record_ids.length})
          </label>
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            {availableRecords.map(record => (
              <div 
                key={record.id}
                onClick={() => toggleRecord(record.id)}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.linked_record_ids.includes(record.id) 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                    : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="truncate text-sm font-medium">{record.title}</span>
                </div>
                {formData.linked_record_ids.includes(record.id) && <CheckCircle2 size={16} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          type="submit"
          className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all"
        >
          保存并立项
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
