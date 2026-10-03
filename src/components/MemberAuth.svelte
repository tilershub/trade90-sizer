<script>
  import { supabase } from '../lib/supabase';
  import { syncWorkspace } from '../lib/member-workspace';

  export let mode = 'login';

  let email = '';
  let password = '';
  let busy = false;
  let message = '';
  let error = '';

  async function submit() {
    error = '';
    message = '';
    busy = true;
    try {
      if (!email || !password) throw new Error('Enter your email and password.');
      if (password.length < 8) throw new Error('Use at least 8 characters for your password.');

      if (mode === 'join') {
        const { data, error: authError } = await supabase.auth.signUp({ email: email.trim(), password });
        if (authError) throw authError;
        if (data.session) {
          await syncWorkspace();
          window.location.assign('/account/');
        } else {
          message = 'Account created. Check your email to confirm your address, then sign in.';
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (authError) throw authError;
        await syncWorkspace();
        window.location.assign('/account/');
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Authentication failed.';
    } finally {
      busy = false;
    }
  }
</script>

<div class="auth-card">
  <p class="eyebrow">TRADE90 Member Workspace</p>
  <h1>{mode === 'join' ? 'Create your account' : 'Sign in'}</h1>
  <p class="intro">
    {mode === 'join'
      ? 'Sync your watchlist, research history, journal, plan and daily workspace across your devices.'
      : 'Open your saved TRADE90 workspace on this device.'}
  </p>

  <form on:submit|preventDefault={submit}>
    <label>
      Email
      <input type="email" bind:value={email} autocomplete="email" required />
    </label>
    <label>
      Password
      <input type="password" bind:value={password} autocomplete={mode === 'join' ? 'new-password' : 'current-password'} minlength="8" required />
    </label>
    <button type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'join' ? 'Create account' : 'Sign in'}</button>
  </form>

  {#if error}<p class="msg error" role="alert">{error}</p>{/if}
  {#if message}<p class="msg success" role="status">{message}</p>{/if}

  <p class="switch">
    {#if mode === 'join'}
      Already have an account? <a href="/login/">Sign in</a>
    {:else}
      New to TRADE90? <a href="/join/">Create an account</a>
    {/if}
  </p>
  <p class="privacy">Your market notes and journal are private to your authenticated workspace. TRADE90 does not need your broker password or brokerage account access.</p>
</div>

<style>
  .auth-card{max-width:480px;margin:auto;background:#0f172a;border:1px solid #263449;border-radius:18px;padding:28px;color:#e5e7eb;box-shadow:0 24px 60px rgba(0,0,0,.22)}
  .eyebrow{margin:0 0 8px;color:#34d399;font-size:.68rem;font-weight:900;letter-spacing:.18em;text-transform:uppercase}
  h1{margin:0;color:#fff;font-size:2rem;font-weight:900;letter-spacing:-.04em}
  .intro{margin:10px 0 22px;color:#aeb9c8;line-height:1.55}
  form{display:grid;gap:14px}
  label{display:grid;gap:7px;color:#cbd5e1;font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em}
  input{width:100%;box-sizing:border-box;background:#020617;border:1px solid #475569;border-radius:10px;padding:12px 13px;color:#fff;font:inherit;font-size:16px;outline:none}
  input:focus{border-color:#34d399;box-shadow:0 0 0 3px rgba(52,211,153,.14)}
  button{min-height:46px;border:0;border-radius:10px;background:#10b981;color:#02130d;font-weight:900;text-transform:uppercase;letter-spacing:.08em;cursor:pointer}
  button:disabled{opacity:.6;cursor:wait}
  .msg{margin:14px 0 0;padding:11px 12px;border-radius:9px;font-size:.82rem;line-height:1.45}
  .error{background:#451a1a;color:#fecaca;border:1px solid #7f1d1d}.success{background:#052e16;color:#bbf7d0;border:1px solid #166534}
  .switch,.privacy{font-size:.78rem;color:#94a3b8;line-height:1.5}.switch{margin:20px 0 0}.switch a{color:#6ee7b7;font-weight:800}.privacy{margin:14px 0 0;padding-top:14px;border-top:1px solid #263449}
</style>
