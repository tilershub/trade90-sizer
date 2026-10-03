<script>
  import { onMount } from 'svelte';
  import { supabase } from '../lib/supabase';
  import { getMemberSession, syncWorkspace } from '../lib/member-workspace';

  let session = null;
  let mode = 'signin';
  let email = '';
  let password = '';
  let busy = false;
  let message = '';
  let error = '';
  let syncStatus = 'Checking account…';
  let lastSynced = '';

  function readableSync(detail) {
    if (detail?.status === 'syncing') return 'Syncing workspace…';
    if (detail?.status === 'synced') {
      lastSynced = detail?.at ? new Date(detail.at).toLocaleString() : new Date().toLocaleString();
      return 'Workspace synced';
    }
    if (detail?.status === 'error') return detail?.message ? `Sync issue: ${detail.message}` : 'Workspace sync issue';
    return 'Local-only until you sign in';
  }

  async function refreshSession() {
    try {
      session = await getMemberSession();
      syncStatus = session ? 'Ready to sync' : 'Local-only until you sign in';
    } catch {
      session = null;
      syncStatus = 'Could not check account right now';
    }
  }

  async function submit() {
    error = '';
    message = '';
    busy = true;
    try {
      if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({ email: email.trim(), password });
        if (authError) throw authError;
        session = data.session;
        if (session) {
          await syncWorkspace();
          message = 'Account created and workspace synced.';
        } else {
          message = 'Account created. Check your email to confirm it, then return here and sign in.';
        }
      } else {
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (authError) throw authError;
        session = data.session;
        await syncWorkspace();
        message = 'Signed in. Your workspace is synced across devices.';
      }
      password = '';
    } catch (e) {
      error = e?.message || 'Account request failed. Please try again.';
    } finally {
      busy = false;
    }
  }

  async function syncNow() {
    busy = true;
    error = '';
    try {
      await syncWorkspace();
      message = 'Workspace sync complete.';
    } catch (e) {
      error = e?.message || 'Workspace sync failed.';
    } finally {
      busy = false;
    }
  }

  async function signOut() {
    busy = true;
    error = '';
    try {
      const { error: authError } = await supabase.auth.signOut();
      if (authError) throw authError;
      session = null;
      message = 'Signed out. Your browser copy remains available locally.';
      syncStatus = 'Local-only until you sign in';
    } catch (e) {
      error = e?.message || 'Could not sign out.';
    } finally {
      busy = false;
    }
  }

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'signup') mode = 'signup';

    refreshSession();

    const statusHandler = (event) => { syncStatus = readableSync(event.detail); };
    const authHandler = (event) => {
      if (!event.detail?.signedIn) session = null;
      else refreshSession();
    };
    window.addEventListener('trade90-member-sync-status', statusHandler);
    window.addEventListener('trade90-auth-state', authHandler);

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      session = nextSession;
    });

    return () => {
      window.removeEventListener('trade90-member-sync-status', statusHandler);
      window.removeEventListener('trade90-auth-state', authHandler);
      data.subscription.unsubscribe();
    };
  });
</script>

<section class="account-shell">
  {#if session}
    <div class="account-card">
      <p class="eyebrow">TRADE90 Member Workspace</p>
      <h1>Your workspace follows you.</h1>
      <p class="lead">Signed in as <strong>{session.user.email}</strong>. TRADE90 keeps an offline browser copy and synchronizes your workspace when you are online.</p>

      <div class="status-card" aria-live="polite">
        <span class="dot"></span>
        <div>
          <strong>{syncStatus}</strong>
          {#if lastSynced}<small>Last synced {lastSynced}</small>{/if}
        </div>
      </div>

      <div class="sync-grid">
        <div><strong>My Markets</strong><span>Watchlist</span></div>
        <div><strong>Research history</strong><span>Condition changes</span></div>
        <div><strong>Journal</strong><span>Trades & review</span></div>
        <div><strong>Research plan</strong><span>Evidence & decisions</span></div>
        <div><strong>Daily checklist</strong><span>Recent sessions</span></div>
        <div><strong>Risk preference</strong><span>Daily budget setting</span></div>
      </div>

      {#if message}<p class="message" role="status">{message}</p>{/if}
      {#if error}<p class="error" role="alert">{error}</p>{/if}

      <div class="actions">
        <button class="primary" type="button" on:click={syncNow} disabled={busy}>{busy ? 'Working…' : 'Sync now'}</button>
        <button class="secondary" type="button" on:click={signOut} disabled={busy}>Sign out</button>
      </div>

      <p class="privacy">Cloud data is stored in a private row owned by your authenticated user ID. Other signed-in users cannot read or change your workspace through the public API.</p>
    </div>
  {:else}
    <div class="account-card">
      <p class="eyebrow">TRADE90 Member Workspace</p>
      <h1>{mode === 'signup' ? 'Create your account.' : 'Sign in to sync your workspace.'}</h1>
      <p class="lead">Your tools continue to work without an account. Signing in adds cross-device synchronization for My Markets, research history, journal, plans, checklists and your daily risk setting.</p>

      <div class="mode-tabs" aria-label="Account mode">
        <button class:active={mode === 'signin'} type="button" on:click={() => { mode='signin'; error=''; message=''; }}>Sign in</button>
        <button class:active={mode === 'signup'} type="button" on:click={() => { mode='signup'; error=''; message=''; }}>Create account</button>
      </div>

      <form on:submit|preventDefault={submit}>
        <label>Email
          <input type="email" bind:value={email} required autocomplete="email" inputmode="email" />
        </label>
        <label>Password
          <input type="password" bind:value={password} required minlength="8" autocomplete={mode === 'signup' ? 'new-password' : 'current-password'} />
        </label>
        <button class="primary submit" type="submit" disabled={busy}>{busy ? 'Working…' : mode === 'signup' ? 'Create account' : 'Sign in'}</button>
      </form>

      {#if message}<p class="message" role="status">{message}</p>{/if}
      {#if error}<p class="error" role="alert">{error}</p>{/if}

      <p class="privacy">TRADE90 does not upload your local workspace until you sign in. After the first sync, the newest version of each workspace section is reconciled with your private cloud copy.</p>
    </div>
  {/if}
</section>

<style>
  .account-shell{max-width:760px;margin:0 auto;padding:64px 20px 80px;color:#e2e8f0}.account-card{background:#0f172a;border:1px solid #1e293b;border-radius:24px;padding:clamp(24px,5vw,44px);box-shadow:0 24px 70px rgba(0,0,0,.24)}.eyebrow{margin:0 0 10px;color:#34d399;font-size:.68rem;font-weight:900;letter-spacing:.2em;text-transform:uppercase}h1{margin:0;color:#fff;font-size:clamp(2rem,6vw,3.25rem);line-height:1;letter-spacing:-.045em;font-weight:900}.lead{margin:18px 0 26px;color:#94a3b8;line-height:1.65}.lead strong{color:#e2e8f0}.mode-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:22px;background:#020617;padding:5px;border-radius:12px}.mode-tabs button{min-height:44px;border:0;border-radius:9px;background:transparent;color:#94a3b8;font-weight:800;cursor:pointer}.mode-tabs button.active{background:#064e3b;color:#ecfdf5}form{display:grid;gap:16px}label{display:grid;gap:7px;color:#cbd5e1;font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em}input{width:100%;min-height:48px;border:1px solid #334155;border-radius:10px;background:#020617;color:#fff;padding:0 14px;font-size:16px;outline:none}input:focus{border-color:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,.15)}button.primary,button.secondary{min-height:46px;border-radius:10px;padding:0 16px;font-weight:900;cursor:pointer}button.primary{border:1px solid #10b981;background:#10b981;color:#022c22}.submit{width:100%;margin-top:4px}button.secondary{border:1px solid #475569;background:#020617;color:#e2e8f0}button:disabled{opacity:.55;cursor:wait}.actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}.status-card{display:flex;align-items:center;gap:12px;background:#020617;border:1px solid #1e293b;border-radius:14px;padding:14px 16px;margin:22px 0}.dot{width:9px;height:9px;border-radius:50%;background:#10b981;box-shadow:0 0 0 5px rgba(16,185,129,.12)}.status-card strong,.status-card small{display:block}.status-card strong{color:#f8fafc;font-size:.82rem}.status-card small{color:#64748b;margin-top:3px}.sync-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.sync-grid div{border:1px solid #1e293b;background:#111827;border-radius:12px;padding:13px}.sync-grid strong,.sync-grid span{display:block}.sync-grid strong{font-size:.78rem;color:#e2e8f0}.sync-grid span{font-size:.68rem;color:#64748b;margin-top:3px}.message,.error{border-radius:10px;padding:11px 13px;font-size:.78rem;line-height:1.5;margin:16px 0 0}.message{background:#052e16;border:1px solid #166534;color:#bbf7d0}.error{background:#450a0a;border:1px solid #991b1b;color:#fecaca}.privacy{margin:22px 0 0;padding-top:18px;border-top:1px solid #1e293b;color:#64748b;font-size:.72rem;line-height:1.55}@media(max-width:520px){.account-shell{padding:34px 12px 56px}.sync-grid{grid-template-columns:1fr}.actions button{flex:1}}
</style>
