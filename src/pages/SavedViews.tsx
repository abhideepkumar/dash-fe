export function SavedViewsPage() {
  return (
    <div className="w-full h-full overflow-y-auto px-8 md:px-12 py-12 flex flex-col gap-12">
      {/* Hero Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight text-on-surface font-headline">Saved Views</h1>
          <p className="text-on-surface-variant max-w-lg leading-relaxed">
            Manage your curated analytical perspectives. These views are synchronized across your team's conversational environment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 rounded-full border border-outline-variant/20 bg-white/50 backdrop-blur-sm text-on-surface-variant text-sm font-semibold hover:bg-white transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Sort by Recent
          </button>
          <button className="px-6 py-2.5 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary text-sm font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all flex items-center gap-2 active:scale-95">
            <span className="material-symbols-outlined text-sm">download</span>
            Export to CSV
          </button>
        </div>
      </section>

      {/* Dashboards Gallery (Asymmetric Grid) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Card 1 */}
        <div className="lg:col-span-2 group relative overflow-hidden rounded-xl border border-outline-variant/10 bg-white/40 backdrop-blur-xl p-8 hover:bg-white/60 transition-all duration-300 shadow-sm">
          <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-emerald-600 cursor-pointer">open_in_new</span>
          </div>
          <div className="flex flex-col h-full">
            <div className="mb-8">
              <span className="px-3 py-1 rounded-full bg-emerald-100/50 text-emerald-800 text-[10px] font-bold uppercase tracking-widest font-label mb-4 inline-block">High Traffic</span>
              <h3 className="text-2xl font-bold font-headline mb-2">Active Session Growth</h3>
              <p className="text-on-surface-variant text-sm">Real-time monitoring of concurrent user sessions across all regional edge nodes.</p>
            </div>
            <div className="mt-auto">
              <div className="w-full h-40 rounded-lg bg-surface-container-low flex items-end p-4 gap-2 overflow-hidden relative">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <img alt="Graph" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrsOKGW5yZu4VkO8ae3-Ga15YYbaWTjkngATOY0ie3fpMV6tpg9BpQYKoTThKmtVWfe90_B3jbkSHa1hfEWJWjSc5njmZ9XsN8XTBpLGwo2Cg0k5M_1Zl52NccWUrhdlp7BEOXvJlB0_vNBpK9Ss6KEx_2DMnd8Boj60A-ibcnPrD8Ug87O3DdmYax7ECj-2Hkj3JE8gm3WXXb0r7FE4DtxMnjQWw0FpyFEdR-Ns920Y2snzKpmcX7Yw--Ekn_ANKm2waqniPpX9o9" />
                </div>
                <div className="w-full h-2 rounded-full bg-emerald-100 relative">
                  <div className="absolute inset-0 w-[78%] bg-emerald-600 rounded-full"></div>
                </div>
                <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">+12.4%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="group relative overflow-hidden rounded-xl border border-outline-variant/10 bg-white/40 backdrop-blur-xl p-8 hover:bg-white/60 transition-all duration-300 shadow-sm flex flex-col">
          <div className="mb-6">
            <span className="px-3 py-1 rounded-full bg-blue-100/50 text-blue-800 text-[10px] font-bold uppercase tracking-widest font-label mb-4 inline-block">Geography</span>
            <h3 className="text-xl font-bold font-headline mb-2">Region Distribution</h3>
            <p className="text-on-surface-variant text-xs">Query: SELECT region, count(*) FROM sessions GROUP BY 1</p>
          </div>
          <div className="flex-1 flex items-center justify-center py-4">
            <div className="w-32 h-32 rounded-full border-[12px] border-emerald-500/10 border-t-emerald-600 border-l-emerald-400 rotate-45 relative flex items-center justify-center">
              <span className="text-sm font-bold -rotate-45">NA/EU</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center text-[10px] font-label font-bold text-outline uppercase tracking-widest">
            <span>Updated 2m ago</span>
            <span className="text-emerald-600">Public</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="group relative overflow-hidden rounded-xl border border-outline-variant/10 bg-white/40 backdrop-blur-xl p-8 hover:bg-white/60 transition-all duration-300 shadow-sm flex flex-col">
          <div className="mb-6">
            <span className="px-3 py-1 rounded-full bg-amber-100/50 text-amber-800 text-[10px] font-bold uppercase tracking-widest font-label mb-4 inline-block">Performance</span>
            <h3 className="text-xl font-bold font-headline mb-2">Latency Anomalies</h3>
            <p className="text-on-surface-variant text-xs">Threshold monitoring for P99 latency spikes in checkout flows.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 my-auto">
            <div className="p-4 rounded-2xl bg-surface-container-low text-center">
              <div className="text-[10px] font-label uppercase tracking-widest text-outline mb-1">Average</div>
              <div className="text-xl font-bold font-headline">142ms</div>
            </div>
            <div className="p-4 rounded-2xl bg-surface-container-low text-center">
              <div className="text-[10px] font-label uppercase tracking-widest text-outline mb-1">Current</div>
              <div className="text-xl font-bold font-headline text-emerald-600">128ms</div>
            </div>
          </div>
          <div className="mt-6 flex justify-between items-center">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white"></div>
              <div className="w-6 h-6 rounded-full bg-emerald-400 border-2 border-white"></div>
            </div>
            <span className="material-symbols-outlined text-outline">more_horiz</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="group relative overflow-hidden rounded-xl border border-outline-variant/10 bg-white/40 backdrop-blur-xl p-8 hover:bg-white/60 transition-all duration-300 shadow-sm flex flex-col lg:col-span-2">
          <div className="flex justify-between items-start mb-8">
            <div>
              <span className="px-3 py-1 rounded-full bg-slate-100/50 text-slate-800 text-[10px] font-bold uppercase tracking-widest font-label mb-4 inline-block">Revenue</span>
              <h3 className="text-2xl font-bold font-headline mb-2">Churn Risk Predictor</h3>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-emerald-600 mb-1">Confidence Score</div>
              <div className="text-3xl font-bold font-headline">94.2%</div>
            </div>
          </div>
          <div className="flex items-center gap-8 py-4">
            <div className="flex-1 space-y-4">
              <div className="h-3 w-full bg-surface-container-low rounded-full overflow-hidden">
                <div className="h-full w-[45%] bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
              </div>
              <div className="h-3 w-full bg-surface-container-low rounded-full overflow-hidden">
                <div className="h-full w-[72%] bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
              </div>
              <div className="h-3 w-full bg-surface-container-low rounded-full overflow-hidden">
                <div className="h-full w-[28%] bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
              </div>
            </div>
            <div className="w-32 text-xs text-on-surface-variant font-body">
              Aggregated data from 12 separate customer interaction nodes.
            </div>
          </div>
        </div>

      </section>

      {/* Anomalous Queries / Recent Activity */}
      <section className="mt-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-headline flex items-center gap-3">
            Recent Analytical Activity
            <span className="px-2 py-0.5 rounded bg-error/10 text-error text-[10px] font-bold tracking-widest uppercase">3 Alerts</span>
          </h2>
          <a className="text-emerald-600 text-sm font-semibold hover:underline" href="#">View detailed logs</a>
        </div>
        
        <div className="glass-canvas rounded-xl overflow-hidden border border-outline-variant/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-4 text-[10px] font-label font-bold uppercase tracking-widest text-outline">Query Status</th>
                <th className="px-8 py-4 text-[10px] font-label font-bold uppercase tracking-widest text-outline">Definition</th>
                <th className="px-8 py-4 text-[10px] font-label font-bold uppercase tracking-widest text-outline">Operator</th>
                <th className="px-8 py-4 text-[10px] font-label font-bold uppercase tracking-widest text-outline">Runtime</th>
                <th className="px-8 py-4 text-[10px] font-label font-bold uppercase tracking-widest text-outline text-right">Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              
              {/* Row 1 */}
              <tr className="hover:bg-white/40 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-sm font-semibold">Active</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="text-sm font-medium">customer_ltv_prediction_v2</div>
                  <div className="text-xs text-on-surface-variant truncate w-64">SELECT id, ltv FROM machine_learning.predictions...</div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                    <span className="text-sm">sarah.j</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-sm font-medium">1.2s</span>
                </td>
                <td className="px-8 py-5 text-right">
                  <span className="text-xs font-label font-bold text-outline">4m ago</span>
                </td>
              </tr>
              
              {/* Row 2 (Anomaly) */}
              <tr className="bg-error/5 hover:bg-error/10 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-error"></div>
                    <span className="text-sm font-bold text-error">Anomalous</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="text-sm font-medium">bulk_export_global_events</div>
                  <div className="text-xs text-on-surface-variant truncate w-64">SELECT * FROM raw.events WHERE timestamp &gt;...</div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                    <span className="text-sm">system.root</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-sm font-bold text-error">45.8s</span>
                </td>
                <td className="px-8 py-5 text-right">
                  <span className="text-xs font-label font-bold text-error">12m ago</span>
                </td>
              </tr>

              {/* Row 3 */}
              <tr className="hover:bg-white/40 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                    <span className="text-sm font-semibold">Cached</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="text-sm font-medium">daily_active_users_summary</div>
                  <div className="text-xs text-on-surface-variant truncate w-64">SELECT date, count(distinct user_id)...</div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                    <span className="text-sm">marcus.dev</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-sm font-medium">0.1s</span>
                </td>
                <td className="px-8 py-5 text-right">
                  <span className="text-xs font-label font-bold text-outline">1h ago</span>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default SavedViewsPage;
