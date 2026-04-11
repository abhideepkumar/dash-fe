import { useState } from "react";
import { Database, Filter, RefreshCw, User, ShoppingBag, Package, FileText, Verified } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function SchemaExplorerPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mocked for UI rewrite
  const tables = [
    {
      name: "users",
      icon: User,
      color: "text-primary",
      bgClass: "bg-primary/5 group-hover:bg-primary/10",
      rowCount: "1.2M",
      columns: [
        { name: "id", type: "uuid" },
        { name: "email", type: "varchar" },
        { name: "created_at", type: "timestamp" },
      ]
    },
    {
      name: "orders",
      icon: ShoppingBag,
      color: "text-secondary",
      bgClass: "bg-secondary/5 group-hover:bg-secondary/10",
      rowCount: "840K",
      columns: [
        { name: "id", type: "bigint" },
        { name: "user_id", type: "f-key" },
        { name: "total_amount", type: "decimal" },
      ]
    },
    {
      name: "products",
      icon: Package,
      color: "text-indigo-500", // using indigo mapped to tertiary equivalent
      bgClass: "bg-indigo-500/5 group-hover:bg-indigo-500/10",
      rowCount: "12.5K",
      columns: [
        { name: "sku", type: "varchar" },
        { name: "metadata", type: "jsonb" },
        { name: "price_cents", type: "integer" },
      ]
    },
    {
      name: "audit_logs",
      icon: FileText,
      color: "text-outline",
      bgClass: "bg-outline/5 group-hover:bg-outline/10",
      rowCount: "15.2M",
      columns: [
        { name: "event_id", type: "uuid" },
        { name: "action", type: "varchar" },
        { name: "timestamp", type: "timestamptz" },
      ]
    }
  ];

  return (
    <div className="flex-1 px-12 py-12 overflow-y-auto">
      <header className="mb-16 flex justify-between items-end">
        <div className="max-w-2xl">
          <p className="text-primary font-bold tracking-[0.2em] uppercase text-[11px] mb-4">Architecture / Data Sources</p>
          <h1 className="text-5xl font-bold tracking-tight text-on-surface font-headline mb-6">Schema Explorer</h1>
          <p className="text-outline text-lg font-body leading-relaxed max-w-lg">
            Visualize and manage your relational structures. Our AI-driven engine has indexed 14 active tables across your production environment.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="bg-surface-container-lowest border border-outline-variant/20 px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 text-on-surface hover:bg-surface-container-low transition-colors shadow-sm">
            <Filter className="w-5 h-5 text-outline" />
            Filter Views
          </button>
          <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-3 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-transform active:scale-95">
            <RefreshCw className="w-5 h-5" />
            Re-Sync Schema
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-20">
        {tables.map((table) => (
          <GlassCard key={table.name} className="p-8 hover:scale-[1.02] transition-all duration-300 group cursor-pointer border-outline-variant/20">
            <div className="flex justify-between items-start mb-8">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${table.bgClass}`}>
                <table.icon className={`w-6 h-6 ${table.color}`} />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-outline aspect-square uppercase tracking-widest mb-1">Row Count</p>
                <h4 className="text-2xl font-bold font-headline text-on-surface">{table.rowCount}</h4>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-on-surface mb-6 font-headline">{table.name}</h3>
            
            <div className="space-y-4">
              {table.columns.map((col) => (
                <div key={col.name} className="flex justify-between items-center text-sm py-2 border-b border-outline-variant/10">
                  <span className="font-mono text-outline">{col.name}</span>
                  <span className="bg-surface-container text-on-surface px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors group-hover:bg-surface-container-highest">
                    {col.type}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        ))}

        {/* Workspace Health Card */}
        <GlassCard className="xl:col-span-1 p-8 bg-gradient-to-br from-white/80 to-primary/5 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-on-surface mb-2 font-headline">Workspace Health</h3>
            <p className="text-outline text-sm mb-6">Real-time indexing status & storage.</p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-on-surface">Storage Used</span>
                    <span className="text-xs text-outline">72%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[72%]"></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-secondary"></div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-on-surface">Index Latency</span>
                    <span className="text-xs text-outline">12ms</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full w-[15%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-outline-variant/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Verified className="text-primary w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-tighter text-outline">Schema Synchronized</span>
            </div>
            <span className="text-[10px] font-bold uppercase text-outline">v2.4.1-alpha</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
