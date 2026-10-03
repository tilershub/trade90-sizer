import { supabase } from './supabase';

const WATCHLIST_KEY = 'trade90-watchlist-v1';
const HISTORY_KEY = 'trade90-research-history-v1';
const JOURNAL_KEY = 't90.journal';
const PLAN_KEY = 't90.research-plan.v2';
const RISK_KEY = 't90.risk-budget-pct';
const CHECK_PREFIX = 't90.checklist.';
const SYNC_META_PREFIX = 'trade90-workspace-sync-meta-v1:';
const DIRTY_PREFIX = 'trade90-workspace-dirty-v1:';

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

function checklistObject() {
  const result = {};
  const keys = Object.keys(localStorage).filter((key) => key.startsWith(CHECK_PREFIX)).sort().slice(-30);
  for (const key of keys) result[key.slice(CHECK_PREFIX.length)] = array(parse(key, []));
  return result;
}

function readLocalWorkspace() {
  const risk = Number(localStorage.getItem(RISK_KEY));
  return {
    watchlist: array(parse(WATCHLIST_KEY, [])).filter((v) => typeof v === 'string'),
    research_history: object(parse(HISTORY_KEY, {})),
    journal: array(parse(JOURNAL_KEY, [])),
    research_plan: object(parse(PLAN_KEY, {})),
    daily_checklists: checklistObject(),
    preferences: Number.isFinite(risk) ? { riskBudgetPct: risk } : {},
  };
}

function writeLocalWorkspace(workspace) {
  try { localStorage.setItem(WATCHLIST_KEY, JSON.stringify(array(workspace.watchlist))); } catch {}
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(object(workspace.research_history))); } catch {}
  try { localStorage.setItem(JOURNAL_KEY, JSON.stringify(array(workspace.journal))); } catch {}
  try { localStorage.setItem(PLAN_KEY, JSON.stringify(object(workspace.research_plan))); } catch {}

  const checklists = object(workspace.daily_checklists);
  for (const [date, items] of Object.entries(checklists)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      try { localStorage.setItem(CHECK_PREFIX + date, JSON.stringify(array(items))); } catch {}
    }
  }

  const risk = Number(object(workspace.preferences).riskBudgetPct);
  if (Number.isFinite(risk) && risk > 0 && risk <= 100) {
    try { localStorage.setItem(RISK_KEY, String(risk)); } catch {}
  }

  window.dispatchEvent(new CustomEvent('trade90-workspace-applied'));
}

function uniqueStrings(values) {
  return [...new Set(array(values).filter((v) => typeof v === 'string'))];
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

function mergeHistory(remote, local) {
  const result = {};
  const keys = new Set([...Object.keys(object(remote)), ...Object.keys(object(local))]);
  for (const key of keys) {
    const rows = [...array(object(local)[key]), ...array(object(remote)[key])];
    const seen = new Set();
    result[key] = rows
      .filter((row) => {
        const sig = JSON.stringify([row?.recordedAt ?? '', row?.trend ?? '', row?.eventRisk ?? '', row?.historyDate ?? '']);
        if (seen.has(sig)) return false;
        seen.add(sig);
        return true;
      })
      .sort((a, b) => Date.parse(b?.recordedAt ?? 0) - Date.parse(a?.recordedAt ?? 0))
      .slice(0, 30);
  }
  return result;
}

function mergeChecklists(remote, local) {
  const result = {};
  const keys = new Set([...Object.keys(object(remote)), ...Object.keys(object(local))]);
  for (const key of keys) result[key] = uniqueStrings([...array(object(remote)[key]), ...array(object(local)[key])]);
  return result;
}

function planTime(plan) {
  const time = Date.parse(object(plan).updatedAt ?? '');
  return Number.isFinite(time) ? time : 0;
}

function mergeWorkspace(remote, local) {
  const r = object(remote);
  const l = object(local);
  return {
    watchlist: uniqueStrings([...array(r.watchlist), ...array(l.watchlist)]),
    research_history: mergeHistory(r.research_history, l.research_history),
    journal: mergeJournal(r.journal, l.journal),
    research_plan: planTime(l.research_plan) >= planTime(r.research_plan) ? object(l.research_plan) : object(r.research_plan),
    daily_checklists: mergeChecklists(r.daily_checklists, l.daily_checklists),
    preferences: { ...object(r.preferences), ...object(l.preferences) },
  };
}

function localMeta(userId) {
  return object(parse(SYNC_META_PREFIX + userId, {}));
}

function setMeta(userId, updatedAt, version) {
  try {
    localStorage.setItem(SYNC_META_PREFIX + userId, JSON.stringify({ updatedAt: updatedAt ?? null, version: version ?? null }));
    localStorage.removeItem(DIRTY_PREFIX + userId);
  } catch {}
}

function isDirty(userId) {
  return localStorage.getItem(DIRTY_PREFIX + userId) === '1';
}

function markDirty(userId) {
  if (!userId) return;
  try { localStorage.setItem(DIRTY_PREFIX + userId, '1'); } catch {}
}

function status(detail) {
  window.dispatchEvent(new CustomEvent('trade90-workspace-state', { detail }));
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

async function saveRemote(userId, workspace) {
  const { data, error } = await supabase
    .from('member_workspaces')
    .upsert({
      user_id: userId,
      watchlist: array(workspace.watchlist),
      research_history: object(workspace.research_history),
      journal: array(workspace.journal),
      research_plan: object(workspace.research_plan),
      daily_checklists: object(workspace.daily_checklists),
      preferences: object(workspace.preferences),
    }, { onConflict: 'user_id' })
    .select('user_id,watchlist,research_history,journal,research_plan,daily_checklists,preferences,workspace_version,updated_at')
    .single();
  if (error) throw error;
  return data;
}

export async function syncWorkspace({ forcePush = false } = {}) {
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
    const remote = await fetchRemote(user.id);
    const meta = localMeta(user.id);
    const dirty = forcePush || isDirty(user.id);

    let saved;
    if (!remote) {
      saved = await saveRemote(user.id, local);
      writeLocalWorkspace(saved);
    } else if (!meta.updatedAt) {
      const merged = mergeWorkspace(remote, local);
      saved = await saveRemote(user.id, merged);
      writeLocalWorkspace(saved);
    } else {
      const remoteChanged = remote.updated_at !== meta.updatedAt;
      if (dirty && remoteChanged) {
        const merged = mergeWorkspace(remote, local);
        saved = await saveRemote(user.id, merged);
        writeLocalWorkspace(saved);
      } else if (dirty) {
        saved = await saveRemote(user.id, local);
        writeLocalWorkspace(saved);
      } else if (remoteChanged) {
        saved = remote;
        writeLocalWorkspace(remote);
      } else {
        saved = remote;
      }
    }

    setMeta(user.id, saved?.updated_at ?? remote?.updated_at, saved?.workspace_version ?? remote?.workspace_version);
    status({
      signedIn: true,
      syncing: false,
      user: { id: user.id, email: user.email ?? null },
      lastSync: saved?.updated_at ?? remote?.updated_at ?? new Date().toISOString(),
      workspaceVersion: saved?.workspace_version ?? remote?.workspace_version ?? null,
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

export function scheduleWorkspaceSync(delay = 1200) {
  if (typeof window === 'undefined') return;
  if (currentUserId) markDirty(currentUserId);
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncWorkspace({ forcePush: true }).catch(() => {});
  }, Math.max(0, delay));
}

export async function deleteCloudWorkspace() {
  const user = await sessionUser();
  if (!user) throw new Error('Sign in first.');
  const { error } = await supabase.from('member_workspaces').delete().eq('user_id', user.id);
  if (error) throw error;
  try {
    localStorage.removeItem(SYNC_META_PREFIX + user.id);
    localStorage.removeItem(DIRTY_PREFIX + user.id);
  } catch {}
  status({ signedIn: true, syncing: false, user: { id: user.id, email: user.email ?? null }, cloudWorkspaceDeleted: true });
}

export function initWorkspaceSync() {
  if (typeof window === 'undefined' || window.trade90Workspace) return;

  window.trade90Workspace = {
    syncNow: () => syncWorkspace({ forcePush: true }),
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
