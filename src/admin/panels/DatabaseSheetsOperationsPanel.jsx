import React, { useState, useEffect, useRef } from 'react';
import {
  FileSpreadsheet, Database, RefreshCw, ExternalLink, Download, 
  CheckCircle2, XCircle, AlertCircle, HardDrive, Terminal, 
  Search, Sliders, Play, Settings, ShieldCheck, Check, Copy,
  FolderOpen, Layers, ArrowUpRight, Clock, Sparkles, Filter, ChevronRight
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Sales & Billing',
  'Students & Access',
  'Support & Mentorship',
  'Ambassadors',
  'Marketing & CMS',
  'System & Config'
];

export default function DatabaseSheetsOperationsPanel({ themeMode = 'dark' }) {
  const isDark = themeMode === 'dark';

  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState([]);
  const [stats, setStats] = useState({ total_tables: 20, accessible_tables: 20, total_records: 0 });
  const [config, setConfig] = useState({
    account: 'th3orymasterclass@gmail.com',
    gdrive_folder_id: '1DoY9B2SnUePocY7y4CAf1Z-uWMAcdPSM',
    gdrive_folder_url: 'https://drive.google.com/drive/project/1DoY9B2SnUePocY7y4CAf1Z-uWMAcdPSM?usp=sharing',
    sheet_url: '',
    webhook_url: '',
    sync_enabled: true,
    last_sync_all_at: null
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingTable, setSyncingTable] = useState(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentSyncTask, setCurrentSyncTask] = useState('');

  // Terminal logs state
  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), text: '⚡ TH3ORY GDrive Sheets Operations System initialized.', type: 'info' }
  ]);
  const logContainerRef = useRef(null);

  // Settings Modal State
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [tempSheetUrl, setTempSheetUrl] = useState('');
  const [tempWebhookUrl, setTempWebhookUrl] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copiedScript, setCopiedScript] = useState(false);

  const addLog = (text, type = 'info') => {
    setLogs(prev => [...prev.slice(-150), { time: new Date().toLocaleTimeString(), text, type }]);
  };

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Initial fetch of tables catalog and config
  const fetchInventory = async () => {
    setLoading(true);
    try {
      addLog('📡 Connecting to /api/sync-database-sheets to fetch Supabase table catalog...');
      const res = await fetch('/api/sync-database-sheets');
      const data = await res.json();
      if (data.success) {
        setTables(data.tables || []);
        if (data.stats) setStats(data.stats);
        if (data.config) {
          setConfig(data.config);
          setTempSheetUrl(data.config.sheet_url || '');
          setTempWebhookUrl(data.config.webhook_url || '');
        }
        addLog(`✅ Catalog loaded: ${data.tables?.length || 0} tables audited (${data.stats?.total_records || 0} active records).`, 'success');
      } else {
        addLog(`❌ Failed to fetch catalog: ${data.error}`, 'error');
      }
    } catch (err) {
      addLog(`❌ Network error while loading catalog: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Save Settings
  const handleSaveConfig = async (e) => {
    if (e) e.preventDefault();
    setSavingConfig(true);
    addLog('💾 Committing GDrive spreadsheet & webhook configurations to Supabase...');
    try {
      const res = await fetch('/api/sync-database-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_config',
          sheet_url: tempSheetUrl,
          webhook_url: tempWebhookUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        addLog('✅ Configuration saved successfully to Supabase site_settings.', 'success');
        setIsConfigOpen(false);
      } else {
        addLog(`❌ Save error: ${data.error}`, 'error');
      }
    } catch (err) {
      addLog(`❌ Save failed: ${err.message}`, 'error');
    } finally {
      setSavingConfig(false);
    }
  };

  // Test Webhook
  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    setTestResult(null);
    addLog('📡 Dispatching test verification ping to Google Apps Script webhook...');
    try {
      const res = await fetch('/api/sync-database-sheets?action=test_webhook');
      const data = await res.json();
      setTestResult(data);
      if (data.success) {
        addLog('✅ Google Apps Script Webhook responded successfully! Connection verified.', 'success');
      } else {
        addLog(`❌ Webhook test failed: ${data.error}`, 'error');
      }
    } catch (err) {
      addLog(`❌ Webhook unreachable: ${err.message}`, 'error');
      setTestResult({ success: false, error: err.message });
    } finally {
      setTestingWebhook(false);
    }
  };

  // Sync Single Table
  const handleSyncSingleTable = async (tableName) => {
    setSyncingTable(tableName);
    addLog(`🔄 Initiating table synchronization for "${tableName}"...`);
    try {
      const res = await fetch('/api/sync-database-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync_table',
          table: tableName
        })
      });
      const data = await res.json();
      if (data.success) {
        addLog(`✅ "${tableName}" synchronized successfully! Processed ${data.rowCount} records into tab "${data.tabName}".`, 'success');
        // Update local table timestamp
        setTables(prev => prev.map(t => t.table === tableName ? { ...t, lastSyncedAt: data.syncedAt } : t));
      } else {
        addLog(`❌ Failed to sync "${tableName}": ${data.error}`, 'error');
      }
    } catch (err) {
      addLog(`❌ Network error while syncing "${tableName}": ${err.message}`, 'error');
    } finally {
      setSyncingTable(null);
    }
  };

  // Sync All Tables
  const handleSyncAllTables = async () => {
    if (syncingAll) return;
    setSyncingAll(true);
    setProgressPercent(5);
    setCurrentSyncTask('Preparing multi-table synchronization pipeline...');
    addLog('🚀 STARTING FULL MASTER DATABASE REPLICATION TO GDRIVE SHEETS...');

    try {
      const total = tables.length;
      let completed = 0;

      for (let i = 0; i < tables.length; i++) {
        const item = tables[i];
        setCurrentSyncTask(`Syncing [${i + 1}/${total}] ${item.label} (${item.table})...`);
        setProgressPercent(Math.round(((i) / total) * 100));

        try {
          const res = await fetch('/api/sync-database-sheets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'sync_table',
              table: item.table
            })
          });
          const data = await res.json();
          if (data.success) {
            completed++;
            addLog(`  ↳ [${i + 1}/${total}] Tab "${data.tabName}": ${data.rowCount} rows processed cleanly.`);
            setTables(prev => prev.map(t => t.table === item.table ? { ...t, lastSyncedAt: data.syncedAt } : t));
          } else {
            addLog(`  ↳ ⚠️ [${i + 1}/${total}] Error on "${item.table}": ${data.error}`, 'warning');
          }
        } catch (itemErr) {
          addLog(`  ↳ ❌ [${i + 1}/${total}] Failed "${item.table}": ${itemErr.message}`, 'error');
        }
      }

      setProgressPercent(100);
      setCurrentSyncTask('Finalizing synchronization state...');
      addLog(`🎉 FULL REPLICATION COMPLETE: ${completed}/${total} tables successfully synchronized to Google Drive Sheet!`, 'success');
      fetchInventory();
    } catch (err) {
      addLog(`❌ Master sync execution encountered an error: ${err.message}`, 'error');
    } finally {
      setTimeout(() => {
        setSyncingAll(false);
        setProgressPercent(0);
        setCurrentSyncTask('');
      }, 2000);
    }
  };

  // Download CSV
  const handleDownloadCsv = (tableName) => {
    addLog(`📥 Generating CSV export for table "${tableName}"...`);
    window.open(`/api/sync-database-sheets?action=download_csv&table=${tableName}`, '_blank');
  };

  // Filter tables
  const filteredTables = tables.filter(t => {
    const matchesSearch = t.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.table?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.tabName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
                            t.category?.toLowerCase() === selectedCategory.toLowerCase() ||
                            (selectedCategory === 'Marketing & CMS' && (t.category === 'Marketing' || t.category === 'CMS & Editorial' || t.category === 'Tarot Flow'));
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`p-4 md:p-8 space-y-8 min-h-screen ${isDark ? 'text-slate-100 bg-slate-950' : 'text-slate-900 bg-slate-50'}`}>
      
      {/* ─── 1. EXECUTIVE HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  GDrive & Sheets Operations System
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  OPERATIONAL
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                <span>Autonomous Supabase Database Replication Engine to Google Drive</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-indigo-400">{config.account}</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-purple-400">Project: qngzfcpnjpabaornddau</span>
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsConfigOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs md:text-sm font-medium transition shadow-sm"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Configure Engine</span>
          </button>

          <a
            href={config.gdrive_folder_url || 'https://drive.google.com/drive/project/1DoY9B2SnUePocY7y4CAf1Z-uWMAcdPSM?usp=sharing'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs md:text-sm font-medium transition shadow-sm"
          >
            <FolderOpen className="w-4 h-4 text-amber-400" />
            <span>Master GDrive Folder</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </a>

          {config.sheet_url && (
            <a
              href={config.sheet_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 text-xs md:text-sm font-medium transition shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Open Spreadsheet</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={handleSyncAllTables}
            disabled={syncingAll}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm text-white shadow-lg transition ${
              syncingAll
                ? 'bg-indigo-700/60 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/30 active:scale-95'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${syncingAll ? 'animate-spin' : ''}`} />
            <span>{syncingAll ? 'Syncing All Tables...' : 'Sync All Tables to GDrive'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar for Sync All */}
      {syncingAll && (
        <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-4 space-y-2 shadow-xl shadow-indigo-950/30 animate-pulse">
          <div className="flex items-center justify-between text-xs md:text-sm">
            <span className="font-semibold text-indigo-300 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
              {currentSyncTask}
            </span>
            <span className="font-mono text-purple-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* ─── 2. KPI METRICS CARDS ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monitored Tables</span>
            <Database className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{stats.total_tables || 20}</span>
            <span className="text-xs text-emerald-400 font-medium">100% Schema Mapped</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>20 Individual Sheet Tabs</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition"></div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Database Records</span>
            <Layers className="w-5 h-5 text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{stats.total_records || 0}</span>
            <span className="text-xs text-purple-300 font-medium">Active Rows</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Ready for 2-Way Sync</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition"></div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Google Drive Account</span>
            <HardDrive className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-sm font-bold text-white truncate">{config.account}</div>
            <div className="text-xs font-mono text-amber-400/90 mt-0.5 truncate">Folder: {config.gdrive_folder_id}</div>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Executive Storage Bound</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition"></div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sync Pipeline Health</span>
            <Clock className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">
                {config.webhook_url ? 'Webhook Linked' : 'Manual / REST'}
              </span>
              <span className={`w-2 h-2 rounded-full ${config.webhook_url ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            </div>
            <div className="text-xs text-slate-400 mt-1 truncate">
              Last Full: {config.last_sync_all_at ? new Date(config.last_sync_all_at).toLocaleTimeString() : 'Ready'}
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Hourly Auto-Trigger Capable</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition"></div>
        </div>

      </div>

      {/* ─── 3. SEARCH & CATEGORY FILTER BAR ────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search tables or sheet tabs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* ─── 4. TABLE MATRIX / CARDS GRID ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTables.map((item) => {
          const isTableSyncing = syncingTable === item.table;
          return (
            <div
              key={item.table}
              className="p-5 rounded-2xl border border-slate-800/90 bg-slate-900/70 hover:border-slate-700 transition flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div>
                {/* Header line */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                      {item.category || 'General'}
                    </span>
                    <h3 className="font-bold text-base text-white mt-1.5 group-hover:text-indigo-300 transition">
                      {item.label}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-0.5">
                      <span>public.{item.table}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                    item.count > 0 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {item.count} {item.count === 1 ? 'record' : 'records'}
                  </span>
                </div>

                {/* Tab mapping block */}
                <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Target GDrive Sheet Tab:</span>
                    <span className="font-mono font-medium text-slate-200">{item.tabName}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Last Synchronized:</span>
                    <span className="font-mono text-slate-400">
                      {item.lastSyncedAt ? new Date(item.lastSyncedAt).toLocaleString() : 'Never'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleDownloadCsv(item.table)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium transition"
                  title="Export raw CSV file"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>CSV</span>
                </button>

                <button
                  onClick={() => handleSyncSingleTable(item.table)}
                  disabled={isTableSyncing || syncingAll}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white transition ${
                    isTableSyncing
                      ? 'bg-indigo-700/60 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-600/20 active:scale-95'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTableSyncing ? 'animate-spin' : ''}`} />
                  <span>{isTableSyncing ? 'Syncing...' : 'Sync to Sheet'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTables.length === 0 && (
        <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl">
          <Database className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-300">No tables matched query</h4>
          <p className="text-xs text-slate-500 mt-1">Try refining your search keyword or selected category filter.</p>
        </div>
      )}

      {/* ─── 5. LIVE TERMINAL EXECUTION LOG ──────────────────────────────── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-200 tracking-wide uppercase">
              Operations System Terminal & Replication Stream
            </span>
          </div>
          <button
            onClick={() => setLogs([{ time: new Date().toLocaleTimeString(), text: 'Console cleared.', type: 'info' }])}
            className="text-[11px] text-slate-500 hover:text-slate-300 transition"
          >
            Clear Log
          </button>
        </div>

        <div
          ref={logContainerRef}
          className="p-4 font-mono text-xs space-y-1.5 max-h-56 overflow-y-auto bg-slate-950 scrollbar-thin scrollbar-thumb-slate-800"
        >
          {logs.map((l, idx) => (
            <div key={idx} className="flex items-start gap-2.5 leading-relaxed">
              <span className="text-slate-600 select-none">[{l.time}]</span>
              <span
                className={
                  l.type === 'error'
                    ? 'text-rose-400'
                    : l.type === 'success'
                    ? 'text-emerald-400 font-semibold'
                    : l.type === 'warning'
                    ? 'text-amber-400'
                    : 'text-slate-300'
                }
              >
                {l.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 6. CONFIGURATION MODAL / DRAWER ─────────────────────────────── */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-400" />
                  Google Drive & Sheets Engine Configuration
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Connect your Google Spreadsheet to Supabase using Google Apps Script.
                </p>
              </div>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-5">
              
              {/* Field 1: Account & GDrive Folder */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                    Google Drive Account
                  </label>
                  <input
                    type="text"
                    disabled
                    value={config.account}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs cursor-not-allowed opacity-80"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                    Master GDrive Folder ID
                  </label>
                  <input
                    type="text"
                    disabled
                    value={config.gdrive_folder_id}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs cursor-not-allowed opacity-80"
                  />
                </div>
              </div>

              {/* Field 2: Sheet URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Google Drive Spreadsheet URL
                </label>
                <input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/1.../edit"
                  value={tempSheetUrl}
                  onChange={(e) => setTempSheetUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs md:text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Paste the shareable URL of the master spreadsheet inside your Google Drive folder.
                </p>
              </div>

              {/* Field 3: Webhook URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Google Apps Script Webhook URL (Deployed Web App)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={tempWebhookUrl}
                    onChange={(e) => setTempWebhookUrl(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs md:text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleTestWebhook}
                    disabled={testingWebhook || !tempWebhookUrl}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition disabled:opacity-50 whitespace-nowrap"
                  >
                    {testingWebhook ? 'Pinging...' : 'Test Ping'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Generated when you deploy <code>TH3ORY_Supabase_Master_Sheets_Sync.gs</code> as a Web App (Execute as: Me, Access: Anyone).
                </p>
              </div>

              {/* Test Result Message */}
              {testResult && (
                <div className={`p-3 rounded-xl border text-xs ${
                  testResult.success 
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
                    : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                }`}>
                  {testResult.success ? '✅ Webhook ping verified!' : `❌ Ping failed: ${testResult.error || testResult.message}`}
                </div>
              )}

              {/* Embedded Apps Script Helper */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400">
                    Master Apps Script Code Location:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('google-sheets/TH3ORY_Supabase_Master_Sheets_Sync.gs');
                      setCopiedScript(true);
                      setTimeout(() => setCopiedScript(false), 2000);
                    }}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? 'Path Copied!' : 'Copy File Path'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Open <code>google-sheets/TH3ORY_Supabase_Master_Sheets_Sync.gs</code> in this repository, paste it into your Google Spreadsheet under <strong>Extensions &gt; Apps Script</strong>, then deploy as Web App.
                </p>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition disabled:opacity-50"
                >
                  {savingConfig ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
