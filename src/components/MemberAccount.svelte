<script>
  import { onMount } from 'svelte';
  import { supabase } from '../lib/supabase';
  import { syncWorkspace, deleteCloudWorkspace } from '../lib/member-workspace';

  let user = null;
  let status = 'Checking your account…';
  let lastSync = null;
  let busy = false;
  let counts = { watchlist: 0, history: 0, journal: 0, plan: false };

  function localCounts() {
    try {
      const watchlist = JSON.parse(localStorage.getItem('trade90-watchlist-v1') || '[]');
      const history = JSON.parse(localStorage.getItem('trade90-research-history-v1') || '{}');
      const journal = JSON.parse(localStorage.getItem('t90.journal') || '[]');
      const plan = JSON.parse(localStorage.getItem('t90.research-plan.v2') || '{}');
      counts = {
        watchlist: Array.isArray(watchlist) ? watchlist.length : 0,
        history: history && typeof history === 'object' ? Object.values(history).reduce((sum, rows) => sum + (Array.isArray(rows) ? rows.length : 0), 0) : 0,
        journal: Array.isArray(journal) ? journal.length : 0,
        plan: Boolean(plan && typeof plan === 'object' && (plan.updatedAt || plan.evidence || Object.values(plan.fields || {}).some(Boolean))),
      };
    } catch {}
  }

  async function syncNow() {
    busy = true;
    status = 'Syncing…';
    try {
      const row = await syncWorkspace({ forcePush: true });
      lastSync = row?.updated_at ?? new Date().toISOString();
      status = 'Cloud sync is up to date.';
      localCounts();
    } catch (e) {
      status = e instanceof Error ? e.message : 'Sync failed.';
    } finally {
      busy = false;
    }
  }

  async function signOut() {
    busy = true;
    await supabase.auth.signOut();
    window.location.assign('/login/');
  }

  async function removeCloudCopy() {
    if (!confirm('Delete your synced TRADE90 workspace from the cloud? Your data on this browser will remain.')) return;
    busy = true;
    try {
      await deleteCloudWorkspace();
      await supabase.auth.signOut();
      window.location.assign('/login/');
    } catch (e) {
      status = e instanceof Error ? e.message : 'Could not delete the cloud workspace.';
    } finally {
      busy = false;
    }
  }

  onMount(async () => {
    localCounts();
    const { data } = await supabase.auth.getSession();
    user = data.session?.user ?? null;
    if (!user) {
      status = 'Sign in to use cloud sync.';
      return;
    }
    await syncNow();
  });
</script>

<div class="account">
  <div class="head">
    <div>
      <p class="eyebrow">Member Workspace</p>
      <h1>My TRADE90</h1>
      <p>{user?.email ?? 'Not signed in'}</p>
    </div>
    <span class:active={Boolean(user)}>{user ? 'Signed in' : 'Local only'}</span>
  </div>

  {#if user}
    <section class="status">
      <div>
        <strong>{status}</strong>
        <small>{lastSync ? 'Last sync: ' + new Date(lastSync).toLocaleString() : 'Sync has not completed yet.'}</small>
      </div>
      <button type="button" on:click={syncNow} disabled={busy}>{busy ? 'Syncing…' : 'Sync now'}</button>
    </section>

    <section class="grid">
      <article><span>My Markets</span><strong>{counts.watchlist}</strong><small>watched instruments</small></article>
      <article><span>Research History</span><strong>{counts.history}</strong><small>saved observations</small></article>
      <article><span>Journal</span><strong>{counts.journal}</strong><small>logged trades</small></article>
      <article><span>Research Plan</span><strong>{counts.plan ? 'Saved' : 'Empty'}</strong><small>latest browser plan</small></article>
    </section>

    <nav>
      <a href="/today/">Open Today</a>
      <a href="/#terminal">Research Terminal</a>
      <a href="/journal/">Journal</a>
      <a href="/tools/trading-plan-builder/">Research Plan</a>
    </nav>

    <div class="actions">
      <button type="button" class="secondary" on:click={signOut} disabled={busy}>Sign out</button>
      <button type="button" class="danger" on:click={removeCloudCopy} disabled={busy}>Delete cloud workspace & sign out</button>
    </div>
  {:else}
    <section class="signed-out">
      <p>{status}</p>
      <a href="/login/">Sign in</a>
      <a href="/join/">Create account</a>
    </section>
  {/if}

  <p class="note">Cloud sync stores your TRADE90 workspace data. It does not connect to your broker, execute trades, or store brokerage credentials.</p>
</div>

<style>
.account{max-width:900px;margin:auto;color:#e5e7eb}.head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:22px}.eyebrow{margin:0 0 6px;color:#34d399;font-size:.68rem;font-weight:900;letter-spacing:.18em;text-transform:uppercase}.head h1{margin:0;color:#fff;font-size:2.4rem;letter-spacing:-.05em}.head p{margin:6px 0 0;color:#94a3b8}.head>span{border:1px solid #475569;border-radius:999px;padding:7px 10px;color:#94a3b8;font-size:.65rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.head>span.active{border-color:#166534;background:#052e16;color:#86efac}.status{display:flex;align-items:center;justify-content:space-between;gap:15px;background:#0f172a;border:1px solid #263449;border-radius:14px;padding:18px}.status strong,.status small{display:block}.status small{margin-top:4px;color:#94a3b8;font-size:.72rem}.status button,.actions button{min-height:42px;border-radius:9px;padding:0 14px;font-weight:900;cursor:pointer}.status button{border:0;background:#10b981;color:#03120d}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:14px 0}.grid article{background:#0f172a;border:1px solid #263449;border-radius:12px;padding:16px}.grid span,.grid small{display:block;color:#94a3b8;font-size:.65rem}.grid strong{display:block;margin:6px 0;color:#fff;font-size:1.6rem}nav{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin:16px 0}nav a,.signed-out a{display:flex;min-height:44px;align-items:center;justify-content:center;border:1px solid #334155;border-radius:9px;color:#d1fae5;text-decoration:none;font-size:.78rem;font-weight:800;background:#111827}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}.secondary{background:#111827;color:#e5e7eb;border:1px solid #475569}.danger{background:#2b1115;color:#fecaca;border:1px solid #7f1d1d}.signed-out{background:#0f172a;border:1px solid #263449;border-radius:14px;padding:20px;display:flex;flex-wrap:wrap;align-items:center;gap:10px}.signed-out p{flex:1 1 100%;color:#94a3b8}.signed-out a{padding:0 14px}.note{margin-top:18px;padding-top:16px;border-top:1px solid #263449;color:#94a3b8;font-size:.75rem;line-height:1.5}@media(max-width:700px){.grid{grid-template-columns:1fr 1fr}nav{grid-template-columns:1fr 1fr}.status,.head{align-items:flex-start;flex-direction:column}}@media(max-width:440px){.grid,nav{grid-template-columns:1fr}}
</style>
