import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Search, History, ChevronRight, Clock, Zap, CheckCircle2, AlertCircle, PlayCircle, Code2, MessageSquareReply, Calendar } from 'lucide-react';

interface ActivityLog {
  requestId: string;
  status: 'completed' | 'error' | 'processing';
  query: string;
  sql: string;
  isFollowUp: boolean;
  stepCount: number;
  historyDepth: number;
  totalDurationMs: number;
  createdAt: string;
  error?: string;
}

export function HistoryPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewingLog, setViewingLog] = useState<ActivityLog | null>(null);

  const handleReRun = (query: string) => {
    navigate('/', { state: { prefillQuery: query } });
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.logs.getAll(50);
        if (response.success) {
          setLogs(response.logs);
        }
      } catch (err) {
        console.error("Failed to fetch logs", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Filter and Search Logic
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.query.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           log.requestId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || log.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [logs, searchQuery, filterStatus]);

  // Group by Date Utility
  const groupedLogs = useMemo(() => {
    const groups: { [key: string]: ActivityLog[] } = {};
    filteredLogs.forEach(log => {
      const date = new Date(log.createdAt).toLocaleDateString(undefined, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const label = date === today ? 'Today' : date;
      
      if (!groups[label]) groups[label] = [];
      groups[label].push(log);
    });
    return groups;
  }, [filteredLogs]);

  // Statistics
  const stats = useMemo(() => {
    const total = logs.length;
    const success = logs.filter(l => l.status === 'completed').length;
    const avgTime = logs.length > 0 
      ? logs.reduce((acc, curr) => acc + (curr.totalDurationMs || 0), 0) / logs.length 
      : 0;
    
    return {
      total,
      successRate: total > 0 ? Math.round((success / total) * 100) : 0,
      avgTime: (avgTime / 1000).toFixed(2)
    };
  }, [logs]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed': return { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', label: 'Success' };
      case 'error': return { icon: <AlertCircle className="w-4 h-4" />, color: 'text-rose-600 bg-rose-50 border-rose-100', label: 'Failed' };
      default: return { icon: <Clock className="w-4 h-4" />, color: 'text-amber-600 bg-amber-50 border-amber-100', label: 'Processing' };
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-8 py-12">
        
        {/* Header Section */}
        <header className="mb-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-primary mb-1">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <History className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold uppercase tracking-widest text-primary/60">Audit Workspace</span>
              </div>
              <h1 className="text-5xl font-bold tracking-tight text-slate-900 font-headline">Query History</h1>
              <p className="text-slate-500 max-w-xl text-lg leading-relaxed">
                A high-fidelity trace of every conversational turn, reasoning step, and analytical execution in your workspace.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 min-w-[140px]">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Total</div>
                  <div className="text-xl font-bold font-headline">{stats.total}</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 min-w-[140px]">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Success</div>
                  <div className="text-xl font-bold font-headline">{stats.successRate}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center bg-white/60 backdrop-blur-xl p-2 rounded-[1.5rem] border border-slate-200 shadow-sm">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search history by query text or Request ID..."
                className="w-full bg-transparent border-none focus:ring-0 pl-11 pr-4 py-3 text-sm placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="h-8 w-[1px] bg-slate-200 hidden md:block" />
            <div className="flex items-center gap-2 p-1">
              {['all', 'completed', 'error'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                    filterStatus === status 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Timeline Content */}
        <div className="space-y-12 relative">
          
          {/* Vertical Timeline Thread Line */}
          <div className="absolute left-[21px] top-4 bottom-4 w-[2px] bg-slate-200 pointer-events-none" />

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
              <p className="text-slate-400 font-medium">Reconstructing timeline...</p>
            </div>
          ) : Object.keys(groupedLogs).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                <History className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900 font-headline">No activities found</h3>
                <p className="text-slate-500 max-w-xs transition-opacity">Adjust your filters or start a new conversation to see history here.</p>
              </div>
            </div>
          ) : Object.entries(groupedLogs).map(([date, items]) => (
            <div key={date} className="relative space-y-6">
              {/* Date Header */}
              <div className="flex items-center gap-4 sticky top-4 z-10">
                <div className="w-11 h-11 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-400 shadow-sm group">
                  <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <div className="px-5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">{date}</span>
                </div>
              </div>

              {/* Items in Day */}
              <div className="pl-14 space-y-4">
                {items.map((log) => {
                  const config = getStatusConfig(log.status);
                  return (
                    <motion.div 
                      key={log.requestId}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group bg-white rounded-[2rem] border border-slate-200 p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Hover subtle background accent */}
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="flex flex-col md:flex-row gap-6">
                        
                        {/* Main Content */}
                        <div className="flex-1 space-y-4">
                          <div className="flex flex-wrap items-center gap-3">
                            {/* New Query / Follow-up pill */}
                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              log.isFollowUp 
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                                : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            }`}>
                              {log.isFollowUp ? <MessageSquareReply className="w-3 h-3" /> : <PlayCircle className="w-3 h-3" />}
                              {log.isFollowUp ? `Follow-up (${log.historyDepth || 0})` : 'New Query'}
                            </span>

                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config.color}`}>
                              {config.icon}
                              {config.label}
                            </div>

                            <span className="text-[10px] font-mono text-slate-400 px-2 py-1 bg-slate-50 border border-slate-100 rounded-md">
                              ID: {log.requestId.substring(0, 12)}...
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors">
                            {log.query}
                          </h3>

                          <div className="flex flex-wrap items-center gap-5 text-slate-400">
                            <div className="flex items-center gap-1.5 text-xs font-medium">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-medium">
                              <Zap className="w-3.5 h-3.5" />
                              {log.totalDurationMs ? `${(log.totalDurationMs / 1000).toFixed(2)}s` : '-'}
                            </div>
                            {log.stepCount > 0 && (
                              <div className="flex items-center gap-1.5 text-xs font-medium">
                                <ChevronRight className="w-3.5 h-3.5" />
                                {log.stepCount} reasoning steps
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col gap-2 items-center justify-center shrink-0 border-l border-slate-100 pl-6">
                           <button 
                             onClick={() => setViewingLog(log)}
                             className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all font-body active:scale-95"
                           >
                             <Code2 className="w-4 h-4" />
                             View SQL
                           </button>
                           <button 
                             onClick={() => handleReRun(log.query)}
                             className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 border border-transparent transition-all font-body active:scale-95"
                           >
                             <PlayCircle className="w-4 h-4" />
                             Re-Run
                           </button>
                        </div>
                      </div>

                      {/* Thread connecting line for follow-ups (Visual only) */}
                      {log.isFollowUp && (
                        <div className="absolute left-[-2px] top-[50%] -translate-y-[50%] w-6 h-[40px] border-l-2 border-b-2 border-slate-200 rounded-bl-xl pointer-events-none" style={{ left: '-28px' }} />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;
