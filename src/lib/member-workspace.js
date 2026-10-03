import { supabase } from './supabase';

const WATCHLIST_KEY = 'trade90-watchlist-v1';
const WATCHLIST_UPDATED_KEY = 'trade90-watchlist-updated-at-v1';
const HISTORY_KEY = 'trade90-research-history-v1';
const HISTORY_UPDATED_KEY = 'trade90-research-history-updated-at-v1';
const JOURNAL_KEY = 't90.journal';
const JOURNAL_UPDATED_KEY = 't90.journal-updated-at';
const PLAN_KEY = 't90.research-plan.v2';
const RISK_KEY = 't90.risk-budget-pct';
const PREFERENCES_UPDATED_KEY = 't90.preferences-updated-at';
const CHECK_PREFIX = 't90.checklist.';
const CHECK_META_PREFIX = 't90.checklist-meta.';
const MARKETS = new Set(['USD/JPY','EUR/USD','GBP/USD','USD/CHF','USD/CAD','AUD/USD','NZD/USD','XAU/USD','BTC/USD']);

let syncTimer = null;
let currentUserId = null;
let syncing = false;

function parse(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function object(value, fallback = {}) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback;
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function validStamp(value) {
  if (typeof value !== 'string') return '';
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : '';
}

function newer(localStamp, remoteStamp) {
  const localTime = localStamp ? Date.parse(localStamp) : NaN;
  const remoteTime = remoteStamp ? Date.parse(remoteStamp) : NaN;
  if (Number.isFinite(localTime) && Number.isFinite(remoteTime)) return localTime >= remoteTime ? 'local' : 'remote';
  if (Number.isFinite(localTime)) return 'local';
  if (Number.isFinite(remoteTime)) return 'remote';
  return '';
}

function uniqueStrings(values) {
  return [...new Set(array(values).filter((value) => typeof value === 'string'))];
}

function sanitizeWatchlist(value) {
  return uniqueStrings(value).filter((symbol) => MARKETS.has(symbol)).slice(0, 9);
}

function checklistObject() {
  const result = {};
  const keys = Object.keys(localStorage)
    .filter((key) => key.startsWith(CHECK_PREFIX) && /^t90\.checklist\.\d{4}-\d{2}-\d{2}$/.test(key))
    .sort()
    .slice(-30);
  for (const key of keys) result[key.slice(CHECK_PREFIX.length)] = uniqueStrings(parse(key, []));
  return result;
}

function checklistStamps() {
  const result = {};
  for (const key of Object.keys(localStorage).filter((key) => key.startsWith(CHECK_META_PREFIX))) {
    const day = key.slice(CHECK_META_PREFIX.length);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) continue;
    const stamp = validStamp(localStorage.getItem(key));
    if (stamp) result[day] = stamp;
  }
  return result;
}

function historyStamps() {
  const raw = object(parse(HISTORY_UPDATED_KEY, {}));
  const result = {};
  for (const [market, stamp] of Object.entries(raw)) {
    const safe = validStamp(stamp);
    if (MARKETS.has(market) && safe) result[market] = safe;
  }
  return result;
}

function planHasContent(plan) {
  const value = object(plan);
  if (typeof value.evidence === 'string' && value.evidence.trim()) return true;
  return Object.values(object(value.fields)).some((entry) => typeof entry === 'string' && entry.trim());
}

function readLocalWorkspace() {
  const risk = Number(localStorage.getItem(RISK_KEY));
  const plan = object(parse(PLAN_KEY, {}));
  return {
    data: {
      watchlist: sanitizeWatchlist(parse(WATCHLIST_KEY, [])),
      research_history: object(parse(HISTORY_KEY, {})),
      journal: array(parse(JOURNAL_KEY, [])),
      research_plan: plan,
      daily_checklists: checklistObject(),
      preferences: Number.isFinite(risk) && risk >= 0.1 && risk <= 10 ? { riskBudgetPct: risk } : {},
    },
    stamps: {
      watchlist: validStamp(localStorage.getItem(WATCHLIST_UPDATED_KEY)),
      research_history: historyStamps(),
      journal: validStamp(localStorage.getItem(JOURNAL_UPDATED_KEY)),
      research_plan: validStamp(plan.updatedAt),
      daily_checklists: checklistStamps(),
      preferences: validStamp(localStorage.getItem(PREFERENCES_UPDATED_KEY)),
    },
  };
}

function remoteState(row) {
  const preferences = object(row?.preferences);
  const sync = object(preferences.__sync);
  const cleanPreferences = { ...preferences };
  delete cleanPreferences.__sync;
  return {
    data: {
      watchlist: sanitizeWatchlist(row?.watchlist),
      research_history: object(row?.research_history),
      journal: array(row?.journal),
      research_plan: object(row?.research_plan),
      daily_checklists: object(row?.daily_checklists),
      preferences: cleanPreferences,
    },
    stamps: {
      watchlist: validStamp(sync.watchlist),
      research_history: object(sync.research_history),
      journal: validStamp(sync.journal),
      research_plan: validStamp(sync.research_plan || row?.research_plan?.updatedAt),
      daily_checklists: object(sync.daily_checklists),
      preferences: validStamp(sync.preferences),
    },
  };
}

function writeLocalWorkspace(state) {
  const workspace = state.data;
  const stamps = state.stamps;

  try { localStorage.setItem(WATCHLIST_KEY, JSON.stringify(sanitizeWatchlist(workspace.watchlist))); } catch {}
  if (stamps.watchlist) {
    try { localStorage.setItem(WATCHLIST_UPDATED_KEY, stamps.watchlist); } catch {}
  }

  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(object(workspace.research_history))); } catch {}
  try { localStorage.setItem(HISTORY_UPDATED_KEY, JSON.stringify(object(stamps.research_history))); } catch {}

  try { localStorage.setItem(JOURNAL_KEY, JSON.stringify(array(workspace.journal))); } catch {}
  if (stamps.journal) {
    try { localStorage.setItem(JOURNAL_UPDATED_KEY, stamps.journal); } catch {}
  }

  try { localStorage.setItem(PLAN_KEY, JSON.stringify(object(workspace.research_plan))); } catch {}

  const incomingDays = object(workspace.daily_checklists);
  const existingChecklistKeys = Object.keys(localStorage)
    .filter((key) => key.startsWith(CHECK_PREFIX) && /^t90\.checklist\.\d{4}-\d{2}-\d{2}$/.test(key));
  for (const key of existingChecklistKeys) {
    const day = key.slice(CHECK_PREFIX.length);
    if (!(day in incomingDays)) {
      try { localStorage.removeItem(key); } catch {}
    }
  }
  for (const [date, items] of Object.entries(incomingDays)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    try { localStorage.setItem(CHECK_PREFIX + date, JSON.stringify(uniqueStrings(items))); } catch {}
  }
  for (const key of Object.keys(localStorage).filter((key) => key.startsWith(CHECK_META_PREFIX))) {
    const day = key.slice(CHECK_META_PREFIX.length);
    if (!(day in object(stamps.daily_checklists))) {
      try { localStorage.removeItem(key); } catch {}
    }
  }
  for (const [date, stamp] of Object.entries(object(stamps.daily_checklists))) {
    const safe = validStamp(stamp);
    if (safe) {
      try { localStorage.setItem(CHECK_META_PREFIX + date, safe); } catch {}
    }
  }

  const risk = Number(object(workspace.preferences).riskBudgetPct);
  if (Number.isFinite(risk) && risk >= 0.1 && risk <= 10) {
    try { localStorage.setItem(RISK_KEY, String(risk)); } catch {}
  }
  if (stamps.preferences) {
    try { localStorage.setItem(PREFERENCES_UPDATED_KEY, stamps.preferences); } catch {}
  }

  window.dispatchEvent(new CustomEvent('trade90-workspace-applied'));
}

function journalSignature(item) {
  if (!item || typeof item !== 'object') return '';
  return JSON.stringify([
    item.date ?? '', item.symbol ?? '', item.dir ?? '',
    Number(item.riskPct) || 0, Number(item.r) || 0,
    Boolean(item.adhered), item.note ?? ''
  ]);
}

function mergeJournal(remote, local) {
  const result = [];
  const seen = new Set();
  for (const item of [...array(local), ...array(remote)]) {
    const sig = journalSignature(item);
    if (!sig || seen.has(sig)) continue;
    seen.add(sig);
    result.push(item);
  }
  return result.sort((a, b) => String(a?.date ?? '').localeCompare(String(b?.date ?? '')));
}

function mergeHistoryRows(remote, local) {
  const rows = [...array(local), ...array(remote)];
  const seen = new Set();
  return rows
    .filter((row) => {
      const sig = JSON.stringify([row?.recordedAt ?? '', row?.trend ?? '', row?.eventRisk ?? '', row?.historyDate ?? '']);
      if (seen.has(sig)) return false;
      seen.add(sig);
      return true;
    })
    .sort((a, b) => Date.parse(b?.recordedAt ?? 0) - Date.parse(a?.recordedAt ?? 0))
    .slice(0, 30);
}

function chooseValue(localValue, remoteValue, localStamp, remoteStamp, localHas, remoteHas, mergeFallback) {
  const winner = newer(localStamp, remoteStamp);
  if (winner === 'local') return { value: localValue, stamp: localStamp };
  if (winner === 'remote') return { value: remoteValue, stamp: remoteStamp };
  if (typeof mergeFallback === 'function' && localHas && remoteHas) {
    return { value: mergeFallback(remoteValue, localValue), stamp: new Date().toISOString() };
  }
  if (localHas && !remoteHas) return { value: localValue, stamp: localStamp };
  if (remoteHas && !localHas) return { value: remoteValue, stamp: remoteStamp };
  return { value: remoteHas ? remoteValue : localValue, stamp: remoteStamp || localStamp };
}

function mergeStates(localState, remoteStateValue) {
  const local = localState.data;
  const remote = remoteStateValue.data;
  const ls = localState.stamps;
  const rs = remoteStateValue.stamps;

  const watch = chooseValue(
    sanitizeWatchlist(local.watchlist),
    sanitizeWatchlist(remote.watchlist),
    ls.watchlist, rs.watchlist,
    sanitizeWatchlist(local.watchlist).length > 0,
    sanitizeWatchlist(remote.watchlist).length > 0,
    (r, l) => sanitizeWatchlist([...array(r), ...array(l)])
  );

  const journal = chooseValue(
    array(local.journal), array(remote.journal),
    ls.journal, rs.journal,
    array(local.journal).length > 0,
    array(remote.journal).length > 0,
    mergeJournal
  );

  const localPlan = object(local.research_plan);
  const remotePlan = object(remote.research_plan);
  const plan = chooseValue(
    localPlan, remotePlan,
    ls.research_plan || validStamp(localPlan.updatedAt),
    rs.research_plan || validStamp(remotePlan.updatedAt),
    planHasContent(localPlan), planHasContent(remotePlan)
  );

  const localPrefs = object(local.preferences);
  const remotePrefs = object(remote.preferences);
  const prefs = chooseValue(
    localPrefs, remotePrefs,
    ls.preferences, rs.preferences,
    Number.isFinite(Number(localPrefs.riskBudgetPct)),
    Number.isFinite(Number(remotePrefs.riskBudgetPct))
  );

  const history = {};
  const historyMeta = {};
  const historyKeys = new Set([
    ...Object.keys(object(local.research_history)),
    ...Object.keys(object(remote.research_history)),
    ...Object.keys(object(ls.research_history)),
    ...Object.keys(object(rs.research_history)),
  ]);
  for (const market of historyKeys) {
    if (!MARKETS.has(market)) continue;
    const lrows = array(object(local.research_history)[market]);
    const rrows = array(object(remote.research_history)[market]);
    const chosen = chooseValue(
      lrows, rrows,
      validStamp(object(ls.research_history)[market]),
      validStamp(object(rs.research_history)[market]),
      lrows.length > 0, rrows.length > 0,
      mergeHistoryRows
    );
    if (chosen.value.length) history[market] = chosen.value;
    if (chosen.stamp) historyMeta[market] = chosen.stamp;
  }

  const checklists = {};
  const checklistMeta = {};
  const checklistKeys = new Set([
    ...Object.keys(object(local.daily_checklists)),
    ...Object.keys(object(remote.daily_checklists)),
    ...Object.keys(object(ls.daily_checklists)),
    ...Object.keys(object(rs.daily_checklists)),
  ]);
  for (const day of checklistKeys) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) continue;
    const litems = uniqueStrings(object(local.daily_checklists)[day]);
    const ritems = uniqueStrings(object(remote.daily_checklists)[day]);
    const chosen = chooseValue(
      litems, ritems,
      validStamp(object(ls.daily_checklists)[day]),
      validStamp(object(rs.daily_checklists)[day]),
      true, true,
      (r, l) => uniqueStrings([...array(r), ...array(l)])
    );
    checklists[day] = uniqueStrings(chosen.value);
    if (chosen.stamp) checklistMeta[day] = chosen.stamp;
  }

  const trimmedChecklistEntries = Object.entries(checklists).sort(([a],[b]) => a.localeCompare(b)).slice(-30);
  const trimmedChecklists = Object.fromEntries(trimmedChecklistEntries);
  const trimmedChecklistMeta = Object.fromEntries(
    trimmedChecklistEntries
      .map(([day]) => [day, checklistMeta[day]])
      .filter(([, stamp]) => Boolean(stamp))
  );

  return {
    data: {
      watchlist: watch.value,
      research_history: history,
      journal: journal.value,
      research_plan: plan.value,
      daily_checklists: trimmedChecklists,
      preferences: prefs.value,
    },
    stamps: {
      watchlist: watch.stamp,
      research_history: historyMeta,
      journal: journal.stamp,
      research_plan: plan.stamp,
      daily_checklists: trimmedChecklistMeta,
      preferences: prefs.stamp,
    },
  };
}

function syncMetadata(state) {
  return {
    watchlist: state.stamps.watchlist || '',
    research_history: object(state.stamps.research_history),
    journal: state.stamps.journal || '',
    research_plan: state.stamps.research_plan || '',
    daily_checklists: object(state.stamps.daily_checklists),
    preferences: state.stamps.preferences || '',
  };
}

function rowPayload(userId, state) {
  return {
    user_id: userId,
    schema_version: 1,
    watchlist: sanitizeWatchlist(state.data.watchlist),
    research_history: object(state.data.research_history),
    journal: array(state.data.journal),
    research_plan: object(state.data.research_plan),
    daily_checklists: object(state.data.daily_checklists),
    preferences: { ...object(state.data.preferences), __sync: syncMetadata(state) },
  };
}

function comparableRemote(row) {
  if (!row) return null;
  const state = remoteState(row);
  return rowPayload(row.user_id, state);
}

function status(detail) {
  window.dispatchEvent(new CustomEvent('trade90-workspace-state', { detail }));
  window.dispatchEvent(new CustomEvent('trade90-member-sync-status', {
    detail: {
      status: detail.error ? 'error' : detail.syncing ? 'syncing' : detail.signedIn ? 'synced' : 'signed-out',
      at: detail.lastSync ?? null,
      message: detail.error ?? null,
    }
  }));
}

async function sessionUser() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session?.user ?? null;
}

async function fetchRemote(userId) {
  const { data, error } = await supabase
    .from('member_workspaces')
    .select('user_id,watchlist,research_history,journal,research_plan,daily_checklists,preferences,workspace_version,updated_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function saveRemote(userId, state) {
  const { data, error } = await supabase
    .from('member_workspaces')
    .upsert(rowPayload(userId, state), { onConflict: 'user_id' })
    .select('user_id,watchlist,research_history,journal,research_plan,daily_checklists,preferences,workspace_version,updated_at')
    .single();
  if (error) throw error;
  return data;
}

export async function syncWorkspace() {
  if (typeof window === 'undefined' || syncing) return null;
  syncing = true;
  status({ signedIn: Boolean(currentUserId), syncing: true });

  try {
    const user = await sessionUser();
    currentUserId = user?.id ?? null;
    if (!user) {
      status({ signedIn: false, syncing: false, user: null });
      return null;
    }

    const local = readLocalWorkspace();
    const remoteRow = await fetchRemote(user.id);
    const merged = remoteRow ? mergeStates(local, remoteState(remoteRow)) : local;
    const payload = rowPayload(user.id, merged);
    const existing = comparableRemote(remoteRow);

    let saved = remoteRow;
    if (!existing || JSON.stringify(existing) !== JSON.stringify(payload)) {
      saved = await saveRemote(user.id, merged);
    }

    const resolved = saved ? remoteState(saved) : merged;
    writeLocalWorkspace(resolved);

    status({
      signedIn: true,
      syncing: false,
      user: { id: user.id, email: user.email ?? null },
      lastSync: saved?.updated_at ?? new Date().toISOString(),
      workspaceVersion: saved?.workspace_version ?? null,
    });
    return saved;
  } catch (error) {
    status({
      signedIn: Boolean(currentUserId),
      syncing: false,
      error: error instanceof Error ? error.message : 'Workspace sync failed',
    });
    throw error;
  } finally {
    syncing = false;
  }
}

export function scheduleWorkspaceSync(delay = 800) {
  if (typeof window === 'undefined') return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncWorkspace().catch(() => {});
  }, Math.max(0, delay));
}

export async function deleteCloudWorkspace() {
  const user = await sessionUser();
  if (!user) throw new Error('Sign in first.');
  const { error } = await supabase.from('member_workspaces').delete().eq('user_id', user.id);
  if (error) throw error;
  status({ signedIn: true, syncing: false, user: { id: user.id, email: user.email ?? null }, cloudWorkspaceDeleted: true });
}

export function initWorkspaceSync() {
  if (typeof window === 'undefined' || window.trade90Workspace) return;

  window.trade90Workspace = {
    syncNow: syncWorkspace,
    scheduleSync: scheduleWorkspaceSync,
    getUser: sessionUser,
    deleteCloudWorkspace,
  };

  supabase.auth.onAuthStateChange((_event, session) => {
    currentUserId = session?.user?.id ?? null;
    status({
      signedIn: Boolean(session?.user),
      syncing: false,
      user: session?.user ? { id: session.user.id, email: session.user.email ?? null } : null,
    });
    if (session?.user) setTimeout(() => syncWorkspace().catch(() => {}), 0);
  });

  const refresh = () => {
    if (document.visibilityState === 'visible' && currentUserId) syncWorkspace().catch(() => {});
  };
  document.addEventListener('visibilitychange', refresh);
  setInterval(() => {
    if (currentUserId && document.visibilityState === 'visible') syncWorkspace().catch(() => {});
  }, 30000);

  sessionUser()
    .then((user) => {
      currentUserId = user?.id ?? null;
      status({
        signedIn: Boolean(user),
        syncing: false,
        user: user ? { id: user.id, email: user.email ?? null } : null,
      });
      if (user) return syncWorkspace();
      return null;
    })
    .catch((error) => status({ signedIn: false, syncing: false, error: error instanceof Error ? error.message : 'Authentication unavailable' }));
}
