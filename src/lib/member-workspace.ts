import { supabase } from './supabase';
import { normalizePlan } from './research-plan.js';

const MARKETS = new Set(['USD/JPY','EUR/USD','GBP/USD','USD/CHF','USD/CAD','AUD/USD','NZD/USD','XAU/USD','BTC/USD']);

const KEYS = {
  watchlist: 'trade90-watchlist-v1',
  watchlistUpdated: 'trade90-watchlist-updated-at-v1',
  history: 'trade90-research-history-v1',
  historyUpdated: 'trade90-research-history-updated-at-v1',
  journal: 't90.journal',
  journalUpdated: 't90.journal-updated-at',
  plan: 't90.research-plan.v2',
  riskBudget: 't90.risk-budget-pct',
  preferencesUpdated: 't90.preferences-updated-at',
  checklistPrefix: 't90.checklist.',
  checklistMetaPrefix: 't90.checklist-meta.',
};

const isObject = (value: unknown): value is Record<string, any> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

function readJson(key: string, fallback: any) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function validIso(value: unknown) {
  if (typeof value !== 'string') return '';
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : '';
}

function newer(a: string, b: string) {
  const at = a ? Date.parse(a) : NaN;
  const bt = b ? Date.parse(b) : NaN;
  if (Number.isFinite(at) && Number.isFinite(bt)) return at >= bt ? 'a' : 'b';
  if (Number.isFinite(at)) return 'a';
  if (Number.isFinite(bt)) return 'b';
  return '';
}

function safeWatchlist(value: any) {
  const raw = Array.isArray(value) ? value : Array.isArray(value?.items) ? value.items : [];
  return [...new Set(raw.filter((item: unknown) => typeof item === 'string' && MARKETS.has(item)))].slice(0, 9);
}

function safeHistoryMarkets(value: any) {
  const source = isObject(value?.markets) ? value.markets : isObject(value) ? value : {};
  const out: Record<string, any[]> = {};
  for (const [market, entries] of Object.entries(source)) {
    if (!MARKETS.has(market) || !Array.isArray(entries)) continue;
    out[market] = entries
      .filter(isObject)
      .map((entry) => ({
        recordedAt: validIso(entry.recordedAt),
        researchAt: validIso(entry.researchAt),
        price: typeof entry.price === 'number' && Number.isFinite(entry.price) ? entry.price : null,
        trend: typeof entry.trend === 'string' ? entry.trend.slice(0, 80) : 'Unavailable',
        eventRisk: typeof entry.eventRisk === 'string' ? entry.eventRisk.slice(0, 40) : 'Unavailable',
        historyDate: typeof entry.historyDate === 'string' ? entry.historyDate.slice(0, 40) : null,
      }))
      .filter((entry) => entry.recordedAt)
      .slice(0, 30);
  }
  return out;
}

function safeHistoryUpdated(value: any) {
  const source = isObject(value?.updatedAtByMarket) ? value.updatedAtByMarket : {};
  const out: Record<string, string> = {};
  for (const [market, stamp] of Object.entries(source)) {
    if (MARKETS.has(market)) {
      const iso = validIso(stamp);
      if (iso) out[market] = iso;
    }
  }
  return out;
}

function safeJournal(value: any) {
  const raw = Array.isArray(value) ? value : Array.isArray(value?.items) ? value.items : [];
  return raw
    .filter(isObject)
    .slice(-2000)
    .map((trade, index) => ({
      id: Number.isFinite(Number(trade.id)) ? Number(trade.id) : index + 1,
      date: typeof trade.date === 'string' ? trade.date.slice(0, 10) : '',
      symbol: typeof trade.symbol === 'string' ? trade.symbol.slice(0, 24) : '',
      dir: trade.dir === 'short' ? 'short' : 'long',
      riskPct: Number.isFinite(Number(trade.riskPct)) ? Number(trade.riskPct) : 0,
      r: Number.isFinite(Number(trade.r)) ? Number(trade.r) : 0,
      adhered: Boolean(trade.adhered),
      note: typeof trade.note === 'string' ? trade.note.slice(0, 2000) : '',
    }))
    .filter((trade) => trade.date && trade.symbol);
}

function planHasContent(plan: any) {
  if (!isObject(plan)) return false;
  if (typeof plan.evidence === 'string' && plan.evidence.trim()) return true;
  return isObject(plan.fields) && Object.values(plan.fields).some((value) => typeof value === 'string' && value.trim());
}

function safePlan(value: any) {
  return normalizePlan(value);
}

function localChecklistDays() {
  const out: Record<string, { items: string[]; updatedAt: string }> = {};
  const keys = Object.keys(localStorage)
    .filter((key) => key.startsWith(KEYS.checklistPrefix) && !key.startsWith(KEYS.checklistMetaPrefix))
    .sort()
    .slice(-30);
  for (const key of keys) {
    const day = key.slice(KEYS.checklistPrefix.length);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) continue;
    const items = readJson(key, []);
    out[day] = {
      items: Array.isArray(items) ? items.filter((item) => typeof item === 'string').slice(0, 40) : [],
      updatedAt: validIso(localStorage.getItem(KEYS.checklistMetaPrefix + day)),
    };
  }
  return out;
}

function safeChecklistDays(value: any) {
  const source = isObject(value?.days) ? value.days : {};
  const out: Record<string, { items: string[]; updatedAt: string }> = {};
  for (const [day, data] of Object.entries(source)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !isObject(data)) continue;
    out[day] = {
      items: Array.isArray(data.items) ? data.items.filter((item) => typeof item === 'string').slice(0, 40) : [],
      updatedAt: validIso(data.updatedAt),
    };
  }
  return Object.fromEntries(Object.entries(out).sort(([a],[b]) => a.localeCompare(b)).slice(-30));
}

function safePreferences(value: any) {
  if (!isObject(value)) return { riskBudgetPct: null, updatedAt: '' };
  const n = Number(value.riskBudgetPct);
  return {
    riskBudgetPct: Number.isFinite(n) && n >= 0.1 && n <= 10 ? n : null,
    updatedAt: validIso(value.updatedAt),
  };
}

export function captureLocalWorkspace() {
  const watchlistRaw = readJson(KEYS.watchlist, []);
  const historyRaw = readJson(KEYS.history, {});
  const historyUpdatedRaw = readJson(KEYS.historyUpdated, {});
  const journalRaw = readJson(KEYS.journal, []);
  const planRaw = readJson(KEYS.plan, null);
  const riskBudget = Number(localStorage.getItem(KEYS.riskBudget));

  return {
    watchlist: {
      items: safeWatchlist(watchlistRaw),
      updatedAt: validIso(localStorage.getItem(KEYS.watchlistUpdated)),
    },
    research_history: {
      markets: safeHistoryMarkets(historyRaw),
      updatedAtByMarket: isObject(historyUpdatedRaw)
        ? Object.fromEntries(Object.entries(historyUpdatedRaw).map(([k,v]) => [k, validIso(v)]).filter(([k,v]) => MARKETS.has(k) && v))
        : {},
    },
    journal: {
      items: safeJournal(journalRaw),
      updatedAt: validIso(localStorage.getItem(KEYS.journalUpdated)),
    },
    research_plan: safePlan(planRaw),
    daily_checklists: { days: localChecklistDays() },
    preferences: {
      riskBudgetPct: Number.isFinite(riskBudget) && riskBudget >= 0.1 && riskBudget <= 10 ? riskBudget : null,
      updatedAt: validIso(localStorage.getItem(KEYS.preferencesUpdated)),
    },
  };
}

function normalizeRemote(row: any) {
  return {
    watchlist: {
      items: safeWatchlist(row?.watchlist),
      updatedAt: validIso(row?.watchlist?.updatedAt),
    },
    research_history: {
      markets: safeHistoryMarkets(row?.research_history),
      updatedAtByMarket: safeHistoryUpdated(row?.research_history),
    },
    journal: {
      items: safeJournal(row?.journal),
      updatedAt: validIso(row?.journal?.updatedAt),
    },
    research_plan: safePlan(row?.research_plan),
    daily_checklists: { days: safeChecklistDays(row?.daily_checklists) },
    preferences: safePreferences(row?.preferences),
  };
}

function chooseLww<T>(local: T, remote: T, localStamp: string, remoteStamp: string, localHas: boolean, remoteHas: boolean) {
  const winner = newer(localStamp, remoteStamp);
  if (winner === 'a') return local;
  if (winner === 'b') return remote;
  if (localHas && !remoteHas) return local;
  if (remoteHas && !localHas) return remote;
  return remoteHas ? remote : local;
}

function mergeWorkspaces(local: any, remoteRow: any) {
  const remote = normalizeRemote(remoteRow);

  let watchlist;
  const localWatchHas = local.watchlist.items.length > 0;
  const remoteWatchHas = remote.watchlist.items.length > 0;
  if (!local.watchlist.updatedAt && !remote.watchlist.updatedAt && localWatchHas && remoteWatchHas) {
    watchlist = { items: [...new Set([...remote.watchlist.items, ...local.watchlist.items])].slice(0, 9), updatedAt: new Date().toISOString() };
  } else {
    watchlist = chooseLww(local.watchlist, remote.watchlist, local.watchlist.updatedAt, remote.watchlist.updatedAt, localWatchHas, remoteWatchHas);
  }

  const research_history = { markets: {} as Record<string, any[]>, updatedAtByMarket: {} as Record<string,string> };
  for (const market of MARKETS) {
    const localStamp = validIso(local.research_history.updatedAtByMarket?.[market]);
    const remoteStamp = validIso(remote.research_history.updatedAtByMarket?.[market]);
    const localEntries = local.research_history.markets?.[market] ?? [];
    const remoteEntries = remote.research_history.markets?.[market] ?? [];
    const winner = newer(localStamp, remoteStamp);
    if (winner === 'a') {
      if (localEntries.length) research_history.markets[market] = localEntries;
      if (localStamp) research_history.updatedAtByMarket[market] = localStamp;
    } else if (winner === 'b') {
      if (remoteEntries.length) research_history.markets[market] = remoteEntries;
      if (remoteStamp) research_history.updatedAtByMarket[market] = remoteStamp;
    } else {
      const combined = [...localEntries, ...remoteEntries];
      const seen = new Set<string>();
      const deduped = combined.filter((entry) => {
        const sig = [entry.recordedAt, entry.trend, entry.eventRisk, entry.historyDate].join('|');
        if (seen.has(sig)) return false;
        seen.add(sig);
        return true;
      }).sort((a,b) => Date.parse(b.recordedAt) - Date.parse(a.recordedAt)).slice(0, 30);
      if (deduped.length) research_history.markets[market] = deduped;
    }
  }

  const localJournalHas = local.journal.items.length > 0;
  const remoteJournalHas = remote.journal.items.length > 0;
  let journal = chooseLww(local.journal, remote.journal, local.journal.updatedAt, remote.journal.updatedAt, localJournalHas, remoteJournalHas);
  if (!local.journal.updatedAt && !remote.journal.updatedAt && localJournalHas && remoteJournalHas) {
    const combined = [...remote.journal.items, ...local.journal.items];
    const seen = new Set<string>();
    const items = combined.filter((trade) => {
      const sig = JSON.stringify([trade.date,trade.symbol,trade.dir,trade.riskPct,trade.r,trade.adhered,trade.note]);
      if (seen.has(sig)) return false;
      seen.add(sig);
      return true;
    });
    journal = { items, updatedAt: new Date().toISOString() };
  }

  const localPlanHas = planHasContent(local.research_plan);
  const remotePlanHas = planHasContent(remote.research_plan);
  const research_plan = chooseLww(
    local.research_plan,
    remote.research_plan,
    validIso(local.research_plan.updatedAt),
    validIso(remote.research_plan.updatedAt),
    localPlanHas,
    remotePlanHas
  );

  const daily_checklists = { days: {} as Record<string, any> };
  const allDays = new Set([...Object.keys(local.daily_checklists.days), ...Object.keys(remote.daily_checklists.days)]);
  for (const day of allDays) {
    const l = local.daily_checklists.days[day] ?? { items: [], updatedAt: '' };
    const r = remote.daily_checklists.days[day] ?? { items: [], updatedAt: '' };
    const chosen = chooseLww(l, r, l.updatedAt, r.updatedAt, l.items.length > 0, r.items.length > 0);
    daily_checklists.days[day] = chosen;
  }
  daily_checklists.days = Object.fromEntries(Object.entries(daily_checklists.days).sort(([a],[b]) => a.localeCompare(b)).slice(-30));

  const localPrefHas = local.preferences.riskBudgetPct != null;
  const remotePrefHas = remote.preferences.riskBudgetPct != null;
  const preferences = chooseLww(local.preferences, remote.preferences, local.preferences.updatedAt, remote.preferences.updatedAt, localPrefHas, remotePrefHas);

  return { watchlist, research_history, journal, research_plan, daily_checklists, preferences };
}

function applyLocalWorkspace(workspace: any) {
  localStorage.setItem(KEYS.watchlist, JSON.stringify(workspace.watchlist.items));
  if (workspace.watchlist.updatedAt) localStorage.setItem(KEYS.watchlistUpdated, workspace.watchlist.updatedAt);

  localStorage.setItem(KEYS.history, JSON.stringify(workspace.research_history.markets));
  localStorage.setItem(KEYS.historyUpdated, JSON.stringify(workspace.research_history.updatedAtByMarket));

  localStorage.setItem(KEYS.journal, JSON.stringify(workspace.journal.items));
  if (workspace.journal.updatedAt) localStorage.setItem(KEYS.journalUpdated, workspace.journal.updatedAt);

  localStorage.setItem(KEYS.plan, JSON.stringify(workspace.research_plan));

  for (const [day, data] of Object.entries(workspace.daily_checklists.days) as [string, any][]) {
    localStorage.setItem(KEYS.checklistPrefix + day, JSON.stringify(data.items));
    if (data.updatedAt) localStorage.setItem(KEYS.checklistMetaPrefix + day, data.updatedAt);
  }

  if (workspace.preferences.riskBudgetPct != null) {
    localStorage.setItem(KEYS.riskBudget, String(workspace.preferences.riskBudgetPct));
    if (workspace.preferences.updatedAt) localStorage.setItem(KEYS.preferencesUpdated, workspace.preferences.updatedAt);
  }

  window.dispatchEvent(new CustomEvent('trade90-workspace-applied'));
}

function remotePayload(userId: string, workspace: any) {
  return {
    user_id: userId,
    schema_version: 1,
    watchlist: workspace.watchlist,
    research_history: workspace.research_history,
    journal: workspace.journal,
    research_plan: workspace.research_plan,
    daily_checklists: workspace.daily_checklists,
    preferences: workspace.preferences,
  };
}

function emitStatus(status: string, detail: Record<string, unknown> = {}) {
  window.dispatchEvent(new CustomEvent('trade90-member-sync-status', { detail: { status, ...detail } }));
}

let syncing: Promise<any> | null = null;

export async function syncWorkspace() {
  if (syncing) return syncing;
  syncing = (async () => {
    emitStatus('syncing');
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      emitStatus('signed-out');
      return { signedIn: false };
    }

    const { data: row, error: readError } = await supabase
      .from('member_workspaces')
      .select('user_id,watchlist,research_history,journal,research_plan,daily_checklists,preferences,workspace_version,updated_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (readError) throw readError;

    const local = captureLocalWorkspace();
    const merged = row ? mergeWorkspaces(local, row) : local;
    applyLocalWorkspace(merged);

    const { data: saved, error: writeError } = await supabase
      .from('member_workspaces')
      .upsert(remotePayload(user.id, merged), { onConflict: 'user_id' })
      .select('workspace_version,updated_at')
      .single();

    if (writeError) throw writeError;
    emitStatus('synced', { at: saved?.updated_at ?? new Date().toISOString(), version: saved?.workspace_version ?? null });
    return { signedIn: true, workspace: merged, saved };
  })().catch((error) => {
    emitStatus('error', { message: error instanceof Error ? error.message : 'Workspace sync failed' });
    throw error;
  }).finally(() => {
    syncing = null;
  });
  return syncing;
}

export async function getMemberSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function startMemberWorkspaceSync() {
  let lastFingerprint = '';
  let stopped = false;

  const run = async () => {
    if (stopped) return;
    try {
      const session = await getMemberSession();
      window.dispatchEvent(new CustomEvent('trade90-auth-state', { detail: { signedIn: Boolean(session), email: session?.user?.email ?? null } }));
      if (!session) return;
      const fingerprint = JSON.stringify(captureLocalWorkspace());
      if (fingerprint !== lastFingerprint) {
        await syncWorkspace();
        lastFingerprint = JSON.stringify(captureLocalWorkspace());
      }
    } catch {
      // Status is emitted by syncWorkspace; a network interruption should not block local tools.
    }
  };

  const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
    window.dispatchEvent(new CustomEvent('trade90-auth-state', { detail: { signedIn: Boolean(session), email: session?.user?.email ?? null } }));
    if (session) {
      lastFingerprint = '';
      setTimeout(run, 0);
    } else {
      emitStatus('signed-out');
    }
  });

  const timer = window.setInterval(run, 15000);
  const visible = () => { if (document.visibilityState === 'visible') run(); };
  const applied = () => { lastFingerprint = JSON.stringify(captureLocalWorkspace()); };
  document.addEventListener('visibilitychange', visible);
  window.addEventListener('trade90-workspace-applied', applied);
  run();

  return () => {
    stopped = true;
    window.clearInterval(timer);
    document.removeEventListener('visibilitychange', visible);
    window.removeEventListener('trade90-workspace-applied', applied);
    authListener.subscription.unsubscribe();
  };
}
