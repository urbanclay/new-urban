
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Bell, Video, Clipboard, Briefcase, X, Edit2, ExternalLink, Clock } from 'lucide-react';
import { WorkRecord, Project, Memo } from '../types';

interface CalendarProps {
  records: WorkRecord[];
  projects: Project[];
  memos: Memo[];
  onUpdateMemoDate?: (id: string, newDate: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ records, projects, memos, onUpdateMemoDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<{ type: string, data: any } | null>(null);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [newDateValue, setNewDateValue] = useState('');

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - startDay + 1;
    return day > 0 && day <= totalDays ? day : null;
  });

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayRecords = records.filter(r => r.created_at.startsWith(dateStr));
    const dayMemos = memos.filter(m => m.date === dateStr);
    const dayProjects = projects.filter(p => p.start_date === dateStr || p.target_date === dateStr);
    return { dayRecords, dayMemos, dayProjects };
  };

  const handleSaveDate = () => {
    if (selectedEvent && selectedEvent.type === 'memo' && onUpdateMemoDate) {
      onUpdateMemoDate(selectedEvent.data.id, newDateValue);
      setSelectedEvent({ ...selectedEvent, data: { ...selectedEvent.data, date: newDateValue } });
      setIsEditingDate(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">{year}年 {month + 1}月</h2>
          <p className="text-sm text-gray-400 font-medium">您的个人智能日程一览</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><ChevronLeft size={20} /></button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl">今天</button>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {['日', '一', '二', '三', '四', '五', '六'].map(d => (
          <div key={d} className="bg-gray-50 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">{d}</div>
        ))}
        {calendarDays.map((day, i) => {
          const { dayRecords, dayMemos, dayProjects } = day ? getEventsForDay(day) : { dayRecords: [], dayMemos: [], dayProjects: [] };
          const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

          return (
            <div key={i} className={`bg-white min-h-[120px] p-2 transition-all hover:bg-gray-50/50 group relative ${!day ? 'bg-gray-50/30' : ''}`}>
              {day && (
                <>
                  <span className={`inline-flex items-center justify-center w-7 h-7 text-sm font-bold rounded-lg ${isToday ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-700'}`}>{day}</span>
                  <div className="mt-2 space-y-1">
                    {dayProjects.map(p => (
                      <div key={p.id} onClick={() => setSelectedEvent({ type: 'project', data: p })} className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-md font-bold truncate flex items-center gap-1 cursor-pointer"><Briefcase size={8} /> {p.name}</div>
                    ))}
                    {dayRecords.map(r => (
                      <div key={r.id} onClick={() => setSelectedEvent({ type: 'record', data: r })} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-md font-bold truncate flex items-center gap-1 cursor-pointer"><Clipboard size={8} /> {r.title}</div>
                    ))}
                    {dayMemos.map(m => (
                      <div key={m.id} onClick={() => setSelectedEvent({ type: 'memo', data: m })} className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 border border-purple-100 rounded-md font-bold truncate flex items-center gap-1 cursor-pointer">{m.type === 'meeting' ? <Video size={8} /> : <Bell size={8} />} {m.title}</div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-[2rem] p-8 shadow-2xl relative">
            <button onClick={() => setSelectedEvent(null)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
            <div className="mb-6">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                selectedEvent.type === 'project' ? 'bg-amber-100 text-amber-600' : 
                selectedEvent.type === 'record' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
              }`}>
                {selectedEvent.type === 'project' ? '项目' : selectedEvent.type === 'record' ? '工作记录' : '日程备忘'}
              </span>
              <h3 className="text-2xl font-black mt-4">{selectedEvent.data.title || selectedEvent.data.name}</h3>
              <div className="flex items-center gap-4 mt-4">
                 <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                   <Clock size={16} />
                   {isEditingDate ? (
                     <div className="flex items-center gap-2">
                       <input type="date" value={newDateValue || selectedEvent.data.date || ''} onChange={(e) => setNewDateValue(e.target.value)} className="px-2 py-1 border rounded" />
                       <button onClick={handleSaveDate} className="text-blue-600">保存</button>
                     </div>
                   ) : (
                     <div className="flex items-center gap-2">
                       <span>{selectedEvent.data.date || new Date(selectedEvent.data.created_at).toLocaleDateString() || selectedEvent.data.target_date}</span>
                       {selectedEvent.type === 'memo' && <button onClick={() => { setIsEditingDate(true); setNewDateValue(selectedEvent.data.date); }}><Edit2 size={12} /></button>}
                     </div>
                   )}
                 </div>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium mb-8">
              {selectedEvent.data.description || "暂无详细说明。"}
            </p>
            <div className="flex gap-4">
               <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all">
                  <ExternalLink size={18} /> 查看详情
               </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 flex items-center gap-6 justify-center text-xs font-bold text-gray-400">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span> 工作记录</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span> 项目里程碑</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-purple-500 rounded-full"></span> 备忘录/会议</div>
      </div>
    </div>
  );
};

export default Calendar;
