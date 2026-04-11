import { useState } from "react";
import { Star, MoreVertical, Play, Edit2, Share, Trash2, FileJson, TrendingUp, BarChart3, Users } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function SavedViewsPage() {
  const [activeTab, setActiveTab] = useState<'starred' | 'all'>('starred');

  // Mocked saved views for UI rewrite display
  const savedViews = [
    {
      id: 1,
      title: "Q3 Financial Performance Core Metrics",
      author: "Alex B.",
      date: "2 hrs ago",
      icon: TrendingUp,
      color: "text-primary",
      type: "chart",
      isStarred: true
    },
    {
      id: 2,
      title: "Active Users Heatmap (Global)",
      author: "Alex B.",
      date: "Yesterday",
      icon: Users,
      color: "text-indigo-500",
      type: "map",
      isStarred: true
    },
    {
      id: 3,
      title: "Churn Analysis Breakdown v2",
      author: "System",
      date: "12 Oct 2026",
      icon: BarChart3,
      color: "text-error",
      type: "dashboard",
      isStarred: false
    },
    {
      id: 4,
      title: "Raw JSON Export - Q2 Data",
      author: "Alex B.",
      date: "10 Oct 2026",
      icon: FileJson,
      color: "text-outline",
      type: "data",
      isStarred: false
    }
  ];

  const filteredViews = activeTab === 'starred' ? savedViews.filter(v => v.isStarred) : savedViews;

  return (
    <div className="flex-1 px-12 py-12 overflow-y-auto">
      <header className="mb-12 flex justify-between items-end">
        <div className="max-w-2xl">
          <p className="text-secondary font-bold tracking-[0.2em] uppercase text-[11px] mb-4">Saved Artifacts</p>
          <h1 className="text-5xl font-bold tracking-tight text-on-surface font-headline mb-6">Saved Views</h1>
          <p className="text-outline text-lg font-body leading-relaxed max-w-lg">
            Your personalized collection of pinned queries, dashboards, and reports. Fast access without reprocessing AI context.
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-outline-variant/20 mb-12">
        <button 
          onClick={() => setActiveTab('starred')}
          className={`pb-4 text-sm font-semibold transition-colors ${
            activeTab === 'starred' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-outline hover:text-on-surface'
          }`}
        >
          Starred Views
        </button>
        <button 
          onClick={() => setActiveTab('all')}
          className={`pb-4 text-sm font-semibold transition-colors ${
            activeTab === 'all' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-outline hover:text-on-surface'
          }`}
        >
          All Artifacts
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {filteredViews.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-6">
              <Star className="w-10 h-10 text-outline" />
            </div>
            <h3 className="text-xl font-bold font-headline text-on-surface mb-2">No saved views found</h3>
            <p className="text-outline max-w-sm">You haven't saved any views here yet. Ask the AI to generate a report and pin it.</p>
          </div>
        ) : (
          filteredViews.map((view) => (
            <GlassCard key={view.id} className="p-6 relative group hover:border-primary/30 transition-all duration-300">
              <div className="flex justify-between items-start mb-12">
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center">
                  <view.icon className={`w-5 h-5 ${view.color}`} />
                </div>
                
                <div className="flex items-center gap-2">
                  {view.isStarred && <Star className="w-4 h-4 text-primary fill-primary" />}
                  <button className="text-outline hover:text-on-surface p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-on-surface mb-2 font-headline line-clamp-2">{view.title}</h3>
              <div className="flex items-center gap-2 text-xs text-outline font-medium">
                <span>{view.author}</span>
                <span>•</span>
                <span>{view.date}</span>
              </div>

              {/* Hover Actions Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-background via-background/80 to-transparent opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all rounded-b-xl flex justify-between gap-2 border-t border-outline-variant/10 backdrop-blur-sm">
                <button className="flex-1 bg-surface-container-highest hover:bg-primary/10 hover:text-primary text-on-surface flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-colors">
                  <Play className="w-4 h-4" /> Open
                </button>
                <div className="flex gap-1">
                  <button className="p-2 rounded-lg text-outline hover:bg-surface-container-highest hover:text-on-surface transition-colors">
                    <Share className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg text-outline hover:bg-error/10 hover:text-error transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
