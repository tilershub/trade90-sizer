<script>
  import { onMount } from 'svelte';
  import { supabase } from '../lib/supabase';

  let busy = false;
  let error = '';

  function authErrorFromUrl() {
    try {
      const search = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      return search.get('error_description') || hash.get('error_description') || '';
    } catch {
      return '';
    }
  }

  async function continueWithGoogle() {
    error = '';
    busy = true;
    try {
      const redirectTo = new URL('/account/', window.location.origin).toString();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (authError) throw authError;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Google sign-in could not be started.';
      busy = false;
    }
  }

  onMount(async () => {
    error = authErrorFromUrl();
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) window.location.replace('/account/');
  });
</script>

<div class="auth-card">
  <p class="eyebrow">TRADE90 Member Workspace</p>
  <h1>Continue with Google</h1>
  <p class="intro">Use your Google account to create or sign in to your TRADE90 workspace. Your watchlist, research history, journal and research plan can then sync across your devices.</p>

  <button class="google" type="button" on:click={continueWithGoogle} disabled={busy}>
    <span class="google-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" role="img">
        <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.23c1.89-1.74 2.98-4.31 2.98-7.37Z"/>
        <path fill="#34A853" d="M12 22c2.7 0 4.97-.89 6.62-2.4l-3.23-2.51c-.9.6-2.04.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.05v2.59A10 10 0 0 0 12 22Z"/>
        <path fill="#FBBC05" d="M6.39 13.92A6.02 6.02 0 0 1 6.08 12c0-.67.11-1.32.31-1.92V7.49H3.05A10 10 0 0 0 2 12c0 1.61.38 3.14 1.05 4.51l3.34-2.59Z"/>
        <path fill="#EA4335" d="M12 5.95c1.47 0 2.79.51 3.83 1.49l2.87-2.87A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.95 5.49l3.34 2.59C7.18 7.71 9.39 5.95 12 5.95Z"/>
      </svg>
    </span>
    <span>{busy ? 'Opening Google…' : 'Continue with Google'}</span>
  </button>

  {#if error}
    <p class="msg error" role="alert">{error}</p>
  {/if}

  <div class="benefits" aria-label="Google authentication benefits">
    <span>One sign-in method</span>
    <span>No TRADE90 password</span>
    <span>Cross-device workspace sync</span>
  </div>

  <p class="privacy">Authentication is handled by Supabase Auth with Google. TRADE90 does not receive or store your Google password and does not need access to your brokerage account.</p>
</div>

<style>
  .auth-card{max-width:500px;margin:auto;background:#0f172a;border:1px solid #263449;border-radius:18px;padding:30px;color:#e5e7eb;box-shadow:0 24px 60px rgba(0,0,0,.22)}
  .eyebrow{margin:0 0 8px;color:#34d399;font-size:.68rem;font-weight:900;letter-spacing:.18em;text-transform:uppercase}
  h1{margin:0;color:#fff;font-size:2rem;font-weight:900;letter-spacing:-.04em}
  .intro{margin:10px 0 22px;color:#aeb9c8;line-height:1.6}
  .google{display:flex;align-items:center;justify-content:center;gap:11px;width:100%;min-height:50px;border:1px solid #cbd5e1;border-radius:11px;background:#fff;color:#111827;font:inherit;font-weight:900;cursor:pointer}
  .google:hover{background:#f8fafc}.google:focus-visible{outline:3px solid #34d399;outline-offset:3px}.google:disabled{opacity:.65;cursor:wait}
  .google-mark{display:grid;place-items:center;width:22px;height:22px}.google-mark svg{width:21px;height:21px}
  .msg{margin:14px 0 0;padding:11px 12px;border-radius:9px;font-size:.82rem;line-height:1.45}.error{background:#451a1a;color:#fecaca;border:1px solid #7f1d1d}
  .benefits{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:16px}.benefits span{padding:9px;border:1px solid #263449;border-radius:9px;background:#111827;color:#94a3b8;text-align:center;font-size:.65rem;line-height:1.35}
  .privacy{margin:18px 0 0;padding-top:15px;border-top:1px solid #263449;color:#94a3b8;font-size:.76rem;line-height:1.55}
  @media(max-width:520px){.auth-card{padding:22px 18px}.benefits{grid-template-columns:1fr}.benefits span{text-align:left}}
</style>
