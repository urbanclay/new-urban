
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  FolderKanban, 
  BarChart3, 
  Plus, 
  Search,
  Bell,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Calendar as CalendarIcon,
  X,
  Sparkles,
  Clock,
  Video,
  Trash2,
  RotateCcw,
  ShieldAlert,
  Megaphone,
  Mic,
  Gavel,
  Lightbulb,
  LogOut
} from 'lucide-react';
import RecordForm from './components/RecordForm';
import RecordCard from './components/RecordCard';
import ProjectForm from './components/ProjectForm';
import ProjectCard from './components/ProjectCard';
import Calendar from './components/Calendar';
import MemoForm from './components/MemoForm';
import AuthScreen from './components/AuthScreen';
import { WorkRecord, Project, Memo, RecordType, User as UserType } from './types';
// import { generateMonthlyReport } from './services/geminiService';
import { generateMonthlyReportAPI, type Provider } from './services/aiClient';
import { fetchRecords, fetchProjects, fetchMemos, insertRecord, insertProject, insertMemo, subscribeTable, deleteMemo as deleteMemoApi } from './services/dataService';

const UrbanClayLogo = () => (
  <div className="flex items-center gap-3 px-2 group cursor-default">
    <div className="relative w-10 h-10 flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full shadow-sm rounded-xl">
        <defs>
          <linearGradient id="techGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="#1E293B" />
        <path d="M30 30 Q50 10 70 30 T70 70" fill="none" stroke="url(#techGradient)" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
        <path d="M40 40 Q50 30 60 40 T60 60" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
      </svg>
    </div>
    <span className="font-sans text-xl tracking-tighter lowercase font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 drop-shadow-sm">urbanclay</span>
  </div>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    const saved = localStorage.getItem('urbanclay_current_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'records' | 'projects' | 'reports' | 'schedule' | 'trash'>('dashboard');
  const [activeRecordCategory, setActiveRecordCategory] = useState<RecordType>('promotional');
  const [records, setRecords] = useState<WorkRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [memos, setMemos] = useState<Memo[]>([]);
  
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isMemoFormOpen, setIsMemoFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [provider, setProvider] = useState<Provider>('deepseek');
  const clearLocalCacheAndSync = async () => {
    try {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith('urbanclay_')) localStorage.removeItem(k);
      });
      try {
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
      } catch (e) { /* noop */ }
      if (!currentUser) return;
      const [rs, ps, ms] = await Promise.all([
        fetchRecords(currentUser.id),
        fetchProjects(currentUser.id),
        fetchMemos(currentUser.id),
      ]);
      setRecords(rs); setProjects(ps); setMemos(ms);
    } catch (err) {
      console.error('clear/sync failed', err);
    }
  };
  
  const [searchQuery, setSearchQuery] = useState('');

  // Report State
  const [reportMonth, setReportMonth] = useState('2024-02');
  const [reportContent, setReportContent] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  // Load from Supabase when user changes
  useEffect(() => {
    if (!currentUser) return;
    const load = async () => {
      const [rs, ps, ms] = await Promise.all([
        fetchRecords(currentUser.id),
        fetchProjects(currentUser.id),
        fetchMemos(currentUser.id),
      ]);
      setRecords(rs);
      setProjects(ps);
      setMemos(ms);
    };
    load();
    const unsub1 = subscribeTable(currentUser.id, 'work_records', load);
    const unsub2 = subscribeTable(currentUser.id, 'projects', load);
    const unsub3 = subscribeTable(currentUser.id, 'memos', load);
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [currentUser]);

  const handleLogin = (user: UserType) => {
    setCurrentUser(user);
    localStorage.setItem('urbanclay_current_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('urbanclay_current_session');
    setRecords([]);
    setProjects([]);
    setMemos([]);
    setActiveTab('dashboard');
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'deleted' } : r));
  };
  const restoreRecord = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'active' } : r));
  };
  const permanentDeleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'deleted' } : p));
  };
  const restoreProject = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'in_progress' } : p));
  };
  const permanentDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const removeMemo = async (id: string) => {
    try {
      await deleteMemoApi(id);
    } catch(e){ console.error(e);}
  };

  const handleAddRecord = async (newRecord: WorkRecord) => {
    try {
      await insertRecord(newRecord);
    } finally {
      setIsRecordFormOpen(false);
    }
  };

  const handleAddProject = async (newProject: Project) => {
    try {
      await insertProject(newProject);
    } finally {
      setIsProjectFormOpen(false);
    }
  };

  const handleAddMemo = async (newMemo: Memo) => {
    try {
      await insertMemo(newMemo);
    } finally {
      setIsMemoFormOpen(false);
    }
  };

  const handleBackToDashboard = () => {
    setActiveTab('dashboard');
  };

  const activeRecords = useMemo(() => records.filter(r => r.status === 'active'), [records]);
  const activeProjects = useMemo(() => projects.filter(p => p.status !== 'deleted'), [projects]);
  const trashRecords = useMemo(() => records.filter(r => r.status === 'deleted'), [records]);
  const trashProjects = useMemo(() => projects.filter(p => p.status === 'deleted'), [projects]);

  const filteredRecordsByCategory = useMemo(() => {
    return activeRecords.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           r.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = r.record_type === activeRecordCategory;
      return matchesSearch && matchesCategory;
    });
  }, [activeRecords, searchQuery, activeRecordCategory]);

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const monthRecords = activeRecords.filter(r => r.created_at.startsWith(reportMonth));
      const report = await generateMonthlyReportAPI(monthRecords, reportMonth, provider);
      setReportContent(report);
    } catch (error) {
      console.error("Report generation failed", error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const recordCategories: { id: RecordType; label: string; icon: React.ReactNode }[] = [
    { id: 'promotional', label: '宣传内容', icon: <Megaphone size={16} /> },
    { id: 'meeting_minutes', label: '会议纪要', icon: <Mic size={16} /> },
    { id: 'policy_application', label: '政策申报', icon: <Gavel size={16} /> },
    { id: 'project_proposal', label: '项目方案', icon: <Lightbulb size={16} /> },
  ];

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 p-6 flex-shrink-0 flex flex-col h-screen overflow-y-auto sticky top-0 z-50 shadow-2xl border-r border-white/5">
        <div className="mb-10 bg-white/5 p-4 rounded-2xl border border-white/10">
          <UrbanClayLogo />
        </div>

        <nav className="space-y-1 flex-1">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="控制台" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<FileText size={20} />} 
            label="工作记录" 
            active={activeTab === 'records'} 
            onClick={() => setActiveTab('records')} 
          />
          <NavItem 
            icon={<CalendarIcon size={20} />} 
            label="日程安排" 
            active={activeTab === 'schedule'} 
            onClick={() => setActiveTab('schedule')} 
          />
          <NavItem 
            icon={<FolderKanban size={20} />} 
            label="项目进度" 
            active={activeTab === 'projects'} 
            onClick={() => setActiveTab('projects')} 
          />
          <NavItem 
            icon={<BarChart3 size={20} />} 
            label="智能报告" 
            active={activeTab === 'reports'} 
            onClick={() => setActiveTab('reports')} 
          />
          <div className="pt-4 border-t border-white/5 mt-4">
            <NavItem 
              icon={<Trash2 size={20} />} 
              label="回收站" 
              active={activeTab === 'trash'} 
              onClick={() => setActiveTab('trash')} 
            />
          </div>
        </nav>

        <div className="mt-auto space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">AI Processor</p>
            </div>
            <p className="text-sm font-bold">系统算力充足</p>
            <p className="text-[10px] mt-2 text-blue-50 leading-tight">已加密连接，数据同步中...</p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all font-bold group"
          >
            <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="text-sm">安全注销</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            {activeTab !== 'dashboard' && (
              <button 
                onClick={handleBackToDashboard}
                className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-bold text-sm border border-transparent hover:border-blue-100"
              >
                <ChevronLeft size={20} />
                <span>返回主页</span>
              </button>
            )}
            
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="安全检索..." 
                className="w-full pl-12 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Model</label>
                <select value={provider} onChange={(e) => setProvider(e.target.value as Provider)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold">
                  <option value="deepseek">DeepSeek</option>
                  <option value="gemini">Gemini</option>
                </select>
              </div>
              <button onClick={clearLocalCacheAndSync} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-50">清除本地缓存并同步</button>
            <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all relative border border-transparent">
              <Bell size={20} />
              {memos.some(m => m.is_notified) && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            
            <div className="flex items-center gap-3 pl-2 group cursor-default">
              <div className="w-10 h-10 rounded-xl border-2 border-white shadow-md flex items-center justify-center bg-blue-50 ring-2 ring-slate-100 text-2xl">
                🧑🏾‍🦱
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-black text-slate-900 leading-none">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Verified Admin</p>
              </div>
            </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50/50">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && (
              <div className="space-y-10 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Terminal.</h1>
                    <p className="text-slate-500 mt-2 text-lg">欢迎回来，以下是您当前的实时业务概览。</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsMemoFormOpen(true)}
                      className="px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                      <Plus size={18} /> 记录备忘
                    </button>
                    <button 
                      onClick={() => setIsRecordFormOpen(true)}
                      className="flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all"
                    >
                      <Plus size={20} /> 快速录入
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatsCard label="已录入事项" value={String(activeRecords.length)} icon={<CheckCircle2 />} color="blue" />
                  <StatsCard label="监控中项目" value={String(activeProjects.filter(p => p.status === 'in_progress').length)} icon={<FolderKanban />} color="cyan" />
                  <StatsCard label="待办提醒" value={String(memos.length)} icon={<Bell />} color="indigo" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                        今日执行序列
                      </h2>
                      <button onClick={() => setActiveTab('schedule')} className="text-sm font-bold text-blue-600 hover:underline">管理调度</button>
                    </div>
                    <div className="space-y-3">
                      {memos.length > 0 ? memos.slice(0, 3).map(m => (
                        <div key={m.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100">
                              {m.type === 'meeting' ? <Video size={20} /> : <Clock size={20} />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{m.title}</p>
                              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{m.date} {m.time}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                              <button onClick={(e)=>{e.stopPropagation(); removeMemo(m.id);}} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition" title="删除">
                                <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-trash-2'><path d='M3 6h18'/><path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6'/><path d='M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'/><line x1='10' x2='10' y1='11' y2='17'/><line x1='14' x2='14' y1='11' y2='17'/></svg>
                              </button>
                              <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-all" />
                            </div>
                        </div>
                      )) : (
                        <div className="py-12 text-center bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold">
                          无活动指令
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h2 className="text-xl font-black tracking-tight">快速映射</h2>
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm space-y-3">
                      <QuickLink label="生成月度智能报告" color="blue" onClick={() => setActiveTab('reports')} />
                      <QuickLink label="项目健康度分析" color="cyan" onClick={() => setActiveTab('projects')} />
                      <QuickLink label="切换至全景日程" color="indigo" onClick={() => setActiveTab('schedule')} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedProject && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
                <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-[2rem] p-8 border border-slate-200 shadow-2xl">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">项目详情</h2>
                      <p className="text-slate-500 text-sm mt-1">{selectedProject.name}</p>
                    </div>
                    <button onClick={() => setSelectedProject(null)} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full border border-slate-200">
                      <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M18 6 6 18'/><path d='m6 6 12 12'/></svg>
                    </button>
                  </div>
                  <div className="space-y-4 text-sm text-slate-700">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">描述</div>
                      <div className="whitespace-pre-wrap">{selectedProject.description || '—'}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">起止</div>
                        <div>开始：{selectedProject.start_date || '—'}</div>
                        <div>目标：{selectedProject.target_date || '—'}</div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">进度</div>
                        <div>{selectedProject.progress}% · 状态：{selectedProject.status}</div>
                      </div>
                    </div>
                    {Array.isArray(selectedProject.linked_record_ids) && selectedProject.linked_record_ids.length > 0 && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">关联记录</div>
                        <div className="text-slate-600 text-xs">{selectedProject.linked_record_ids.join(', ')}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
    

            {activeTab === 'schedule' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                 <h1 className="text-3xl font-black">调度中心</h1>
                 <Calendar records={activeRecords} projects={activeProjects} memos={memos} />
              </div>
            )}

            {selectedProject && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
                <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-[2rem] p-8 border border-slate-200 shadow-2xl">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">项目详情</h2>
                      <p className="text-slate-500 text-sm mt-1">{selectedProject.name}</p>
                    </div>
                    <button onClick={() => setSelectedProject(null)} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full border border-slate-200">
                      <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M18 6 6 18'/><path d='m6 6 12 12'/></svg>
                    </button>
                  </div>
                  <div className="space-y-4 text-sm text-slate-700">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">描述</div>
                      <div className="whitespace-pre-wrap">{selectedProject.description || '—'}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">起止</div>
                        <div>开始：{selectedProject.start_date || '—'}</div>
                        <div>目标：{selectedProject.target_date || '—'}</div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">进度</div>
                        <div>{selectedProject.progress}% · 状态：{selectedProject.status}</div>
                      </div>
                    </div>
                    {Array.isArray(selectedProject.linked_record_ids) && selectedProject.linked_record_ids.length > 0 && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">关联记录</div>
                        <div className="text-slate-600 text-xs">{selectedProject.linked_record_ids.join(', ')}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
    

            {activeTab === 'records' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                 <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-black">记录矩阵</h1>
                    <button onClick={() => setIsRecordFormOpen(true)} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200">
                      <Plus size={18} /> 录入新数据
                    </button>
                 </div>

                 <div className="flex flex-wrap gap-2 bg-white/50 p-1.5 rounded-2xl border border-slate-100 backdrop-blur-sm">
                    {recordCategories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveRecordCategory(cat.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          activeRecordCategory === cat.id 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                            : 'text-slate-500 hover:bg-white hover:text-slate-900'
                        }`}
                      >
                        {cat.icon}
                        {cat.label}
                        <span className={`ml-1.5 text-[10px] px-1.5 rounded-md ${activeRecordCategory === cat.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {activeRecords.filter(r => r.record_type === cat.id).length}
                        </span>
                      </button>
                    ))}
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredRecordsByCategory.length > 0 ? filteredRecordsByCategory.map(record => (
                      <RecordCard key={record.id} record={record} onDelete={() => deleteRecord(record.id)} />
                    )) : (
                      <div className="md:col-span-3 py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold">
                        当前分类下暂无已归档数据
                      </div>
                    )}
                 </div>
              </div>
            )}

            {selectedProject && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
                <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-[2rem] p-8 border border-slate-200 shadow-2xl">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">项目详情</h2>
                      <p className="text-slate-500 text-sm mt-1">{selectedProject.name}</p>
                    </div>
                    <button onClick={() => setSelectedProject(null)} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full border border-slate-200">
                      <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M18 6 6 18'/><path d='m6 6 12 12'/></svg>
                    </button>
                  </div>
                  <div className="space-y-4 text-sm text-slate-700">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">描述</div>
                      <div className="whitespace-pre-wrap">{selectedProject.description || '—'}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">起止</div>
                        <div>开始：{selectedProject.start_date || '—'}</div>
                        <div>目标：{selectedProject.target_date || '—'}</div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">进度</div>
                        <div>{selectedProject.progress}% · 状态：{selectedProject.status}</div>
                      </div>
                    </div>
                    {Array.isArray(selectedProject.linked_record_ids) && selectedProject.linked_record_ids.length > 0 && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">关联记录</div>
                        <div className="text-slate-600 text-xs">{selectedProject.linked_record_ids.join(', ')}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
    

            {activeTab === 'projects' && (
               <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-black">项目流</h1>
                    <button onClick={() => setIsProjectFormOpen(true)} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2">
                      <Plus size={18} /> 初始化项目
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {activeProjects.map(project => (
                      <ProjectCard key={project.id} project={project} onDelete={() => deleteProject(project.id)} onOpen={(p)=> setSelectedProject(p)} />
                    ))}
                  </div>
               </div>
            )}

            {activeTab === 'reports' && (activeRecords.length > 0 ? (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-3xl font-black">智能审计</h1>
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                   <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-slate-100">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">选择周期</span>
                      <input type="month" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                    </div>
                    <button onClick={handleGenerateReport} disabled={isGeneratingReport} className="mt-auto px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-100">
                      {isGeneratingReport ? 'AI 模型运算中...' : '生成智能复盘报告'}
                    </button>
                   </div>
                   {reportContent && <div className="prose prose-slate max-w-none text-slate-700 bg-slate-50 p-8 rounded-2xl border border-slate-100 leading-relaxed font-medium">{reportContent}</div>}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
                <ShieldAlert size={64} className="mb-4 opacity-20" />
                <p className="text-xl font-bold">暂无活动记录，无法生成审计报告</p>
              </div>
            ))}

            {activeTab === 'trash' && (
              <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h1 className="text-3xl font-black mb-2">回收站</h1>
                  <p className="text-slate-400 text-sm font-medium">您可以恢复误删的内容，或在此彻底清除它们。</p>
                </div>

                <div className="space-y-8">
                  <section>
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                      <FileText size={16} /> 已删除的记录 ({trashRecords.length})
                    </h2>
                    {trashRecords.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trashRecords.map(record => (
                          <div key={record.id} className="relative group">
                            <RecordCard record={record} />
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 rounded-[1.5rem] transition-all flex items-center justify-center gap-4 backdrop-blur-sm">
                              <button 
                                onClick={() => restoreRecord(record.id)}
                                className="p-3 bg-white text-blue-600 rounded-full hover:scale-110 transition-transform shadow-lg"
                                title="恢复"
                              >
                                <RotateCcw size={20} />
                              </button>
                              <button 
                                onClick={() => permanentDeleteRecord(record.id)}
                                className="p-3 bg-red-600 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                                title="彻底删除"
                              >
                                <X size={20} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-10 text-center border border-dashed rounded-2xl text-slate-300 font-bold">暂无记录</div>
                    )}
                  </section>

                  <section>
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                      <FolderKanban size={16} /> 已删除的项目 ({trashProjects.length})
                    </h2>
                    {trashProjects.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trashProjects.map(project => (
                          <div key={project.id} className="relative group">
                            <ProjectCard project={project} />
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 rounded-[2rem] transition-all flex items-center justify-center gap-4 backdrop-blur-sm">
                              <button 
                                onClick={() => restoreProject(project.id)}
                                className="p-3 bg-white text-blue-600 rounded-full hover:scale-110 transition-transform shadow-lg"
                                title="恢复"
                              >
                                <RotateCcw size={20} />
                              </button>
                              <button 
                                onClick={() => permanentDeleteProject(project.id)}
                                className="p-3 bg-red-600 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                                title="彻底删除"
                              >
                                <X size={20} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-10 text-center border border-dashed rounded-2xl text-slate-300 font-bold">暂无项目</div>
                    )}
                  </section>
                </div>
              </div>
            )}

            {selectedProject && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
                <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-[2rem] p-8 border border-slate-200 shadow-2xl">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">项目详情</h2>
                      <p className="text-slate-500 text-sm mt-1">{selectedProject.name}</p>
                    </div>
                    <button onClick={() => setSelectedProject(null)} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full border border-slate-200">
                      <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M18 6 6 18'/><path d='m6 6 12 12'/></svg>
                    </button>
                  </div>
                  <div className="space-y-4 text-sm text-slate-700">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">描述</div>
                      <div className="whitespace-pre-wrap">{selectedProject.description || '—'}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">起止</div>
                        <div>开始：{selectedProject.start_date || '—'}</div>
                        <div>目标：{selectedProject.target_date || '—'}</div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">进度</div>
                        <div>{selectedProject.progress}% · 状态：{selectedProject.status}</div>
                      </div>
                    </div>
                    {Array.isArray(selectedProject.linked_record_ids) && selectedProject.linked_record_ids.length > 0 && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">关联记录</div>
                        <div className="text-slate-600 text-xs">{selectedProject.linked_record_ids.join(', ')}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
    
          </div>
        </div>
      </main>

      {/* Modals */}
      {isRecordFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[95vh] overflow-y-auto animate-in zoom-in-95">
            <RecordForm onSuccess={handleAddRecord} userId={currentUser.id} provider={provider} />
            <button onClick={() => setIsRecordFormOpen(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full shadow-lg">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {isProjectFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[95vh] overflow-y-auto animate-in zoom-in-95">
            <ProjectForm onSuccess={handleAddProject} availableRecords={activeRecords} userId={currentUser.id} />
            <button onClick={() => setIsProjectFormOpen(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full shadow-lg">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {isMemoFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[95vh] overflow-y-auto animate-in zoom-in-95">
            <MemoForm onSuccess={handleAddMemo} userId={currentUser.id} />
            <button onClick={() => setIsMemoFormOpen(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full shadow-lg">
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${active ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 translate-x-1' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
    <div className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>{icon}</div>
    <span className="text-sm tracking-tight">{label}</span>
  </button>
);

const StatsCard: React.FC<{ label: string, value: string, icon: React.ReactNode, color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center gap-5 shadow-sm hover:border-blue-100 transition-all">
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-${color}-50 text-${color}-600 border border-${color}-100`}>{icon}</div>
    <div>
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{label}</p>
      <p className="text-3xl font-black text-slate-900 mt-0.5">{value}</p>
    </div>
  </div>
);

const QuickLink: React.FC<{ label: string, color: string, onClick: () => void }> = ({ label, color, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:bg-slate-50 hover:border-slate-200 transition-all text-left group">
    <span className="text-sm font-bold text-slate-700 tracking-tight">{label}</span>
    <ChevronRight size={16} className={`text-${color}-500 group-hover:translate-x-1 transition-transform`} />
  </button>
);

export default App;
