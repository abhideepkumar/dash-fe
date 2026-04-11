import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export function HistoryPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.logs.getAll(10);
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

  const formatTimeAgo = (dateStr: string) => {
    const d = new Date(dateStr);
    const diffMatch = Date.now() - d.getTime();
    if (diffMatch < 60000) return 'just now';
    if (diffMatch < 3600000) return `${Math.floor(diffMatch / 60000)}m ago`;
    if (diffMatch < 86400000) return `${Math.floor(diffMatch / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="w-full h-full overflow-y-auto px-8 md:px-12 py-12 flex flex-col gap-12">
      {/* Hero Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight text-on-surface font-headline">Query History</h1>
          <p className="text-on-surface-variant max-w-lg leading-relaxed">
            A comprehensive log of all natural language queries and background analytical jobs executed in your workspace.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 rounded-full border border-outline-variant/20 bg-white/50 backdrop-blur-sm text-on-surface-variant text-sm font-semibold hover:bg-white transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Sort by Recent
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="glass-canvas rounded-xl overflow-hidden border border-outline-variant/20 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant/10">
                <th className="px-8 py-4 text-[10px] font-label font-bold uppercase tracking-widest text-outline">Query Status</th>
                <th className="px-8 py-4 text-[10px] font-label font-bold uppercase tracking-widest text-outline">Definition</th>
                <th className="px-8 py-4 text-[10px] font-label font-bold uppercase tracking-widest text-outline">Type</th>
                <th className="px-8 py-4 text-[10px] font-label font-bold uppercase tracking-widest text-outline">Runtime</th>
                <th className="px-8 py-4 text-[10px] font-label font-bold uppercase tracking-widest text-outline text-right">Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 bg-white/40 backdrop-blur-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-outline text-sm">
                    Loading query history...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-outline text-sm">
                    No query history found
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.requestId} className="hover:bg-white/60 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        {log.status === 'completed' ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-sm font-semibold capitalize">{log.status}</span>
                          </>
                        ) : log.status === 'error' ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-error animate-pulse"></div>
                            <span className="text-sm font-bold text-error capitalize">{log.status}</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                            <span className="text-sm font-semibold text-amber-600 capitalize">{log.status}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-start gap-2">
                        {/* Follow-up indent indicator */}
                        {log.isFollowUp && (
                          <span className="material-symbols-outlined text-[16px] text-primary/50 mt-0.5 shrink-0">subdirectory_arrow_right</span>
                        )}
                        <div>
                          <div className="text-sm font-medium truncate w-[360px]">{log.query}</div>
                          <div className="text-xs text-on-surface-variant flex gap-3 mt-1 flex-wrap">
                            <span>Request ID: <span className="font-mono">{log.requestId.substring(0, 8)}...</span></span>
                            {log.stepCount > 0 && <span>Steps: {log.stepCount}</span>}
                            {log.historyDepth > 0 && (
                              <span className="flex items-center gap-1 text-primary">
                                <span className="material-symbols-outlined text-[11px]">history</span>
                                {log.historyDepth} prior turn{log.historyDepth !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {log.isFollowUp ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-primary/8 text-primary border border-primary/15">
                          <span className="material-symbols-outlined text-[11px]">reply</span>
                          Follow-up
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/8 text-emerald-700 border border-emerald-500/15">
                          <span className="material-symbols-outlined text-[11px]">add_circle</span>
                          New Query
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-sm font-medium ${log.totalDurationMs > 10000 ? 'text-error font-bold' : ''}`}>
                        {log.totalDurationMs ? `${(log.totalDurationMs / 1000).toFixed(2)}s` : '-'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-xs font-label font-bold text-outline uppercase tracking-wider">
                        {formatTimeAgo(log.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default HistoryPage;
