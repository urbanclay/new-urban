
import React, { useState } from 'react';
import { Memo, Priority } from '../types';
import { StickyNote, Calendar as CalendarIcon, Clock, Bell, Video, Save } from 'lucide-react';

interface MemoFormProps {
  onSuccess: (memo: Memo) => void;
  userId: string;
}

const MemoForm: React.FC<MemoFormProps> = ({ onSuccess, userId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    type: 'reminder' as 'meeting' | 'reminder' | 'memo',
    priority: 'medium' as Priority,
    is_notified: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMemo: Memo = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      user_id: userId
    };
    onSuccess(newMemo);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-8 shadow-2xl border border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
          <StickyNote size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">新建备忘录</h2>
          <p className="text-sm text-gray-500">记录会议安排、灵感或重要提醒。</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">事项名称</label>
          <input
            type="text"
            required
            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-purple-100 outline-none transition-all font-semibold"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="例如：下午2点 品牌升级讨论会"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <CalendarIcon size={14} className="text-purple-500" /> 日期
            </label>
            <input
              type="date"
              required
              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Clock size={14} className="text-purple-500" /> 时间
            </label>
            <input
              type="time"
              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none"
              value={formData.time}
              onChange={e => setFormData({ ...formData, time: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">类型</label>
            <div className="flex gap-2">
              {(['meeting', 'reminder', 'memo'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData({...formData, type: t})}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-xl border transition-all ${
                    formData.type === t ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-100' : 'bg-white border-gray-100 text-gray-400 hover:border-purple-200'
                  }`}
                >
                  {t === 'meeting' ? '会议' : t === 'reminder' ? '提醒' : '备忘'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">同步提醒</label>
            <button
              type="button"
              onClick={() => setFormData({...formData, is_notified: !formData.is_notified})}
              className={`w-full py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                formData.is_notified ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-400'
              }`}
            >
              <Bell size={14} />
              {formData.is_notified ? '提醒已开启' : '提醒已关闭'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">详细说明</label>
          <textarea
            rows={3}
            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none resize-none"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="补充会议链接、地点或待办重点..."
          />
        </div>
      </div>

      <div className="mt-8">
        <button
          type="submit"
          className="w-full py-4 bg-purple-600 text-white font-black rounded-2xl hover:bg-purple-700 shadow-xl shadow-purple-100 transition-all flex items-center justify-center gap-2"
        >
          <Save size={20} />
          存入日程
        </button>
      </div>
    </form>
  );
};

export default MemoForm;
