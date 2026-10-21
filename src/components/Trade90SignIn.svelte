<script>
 import {onMount} from 'svelte';
 import {getAuthClient,googleAvailable,signInWithGoogle} from '../lib/trade90-auth.js';
 let checking=true,available=false,busy=false,message='',signedIn=false;
 onMount(()=>{let active=true;(async()=>{
 try{
  const {data,error}=await getAuthClient().auth.getSession();
  if(error)throw error;
  if(data.session){signedIn=true;history.replaceState(null,'','/sign-in/');window.location.replace('/daily/');return;}
  const params=new URLSearchParams(location.search);const hash=new URLSearchParams(location.hash.slice(1));
  if(params.has('error')||hash.has('error')){message='Google sign-in was cancelled or could not be completed. Please try again.';history.replaceState(null,'','/sign-in/');}
  if(params.has('code')){message='This sign-in link has expired or was opened in a different browser. Please start again.';history.replaceState(null,'','/sign-in/');}
  const enabled=await googleAvailable();if(active)available=enabled;
 }catch{if(active)message='Sign-in could not be completed. Please try again in the same browser.';}
 finally{if(active)checking=false;}
 })();return()=>{active=false};});
 async function login(){busy=true;message='';try{await signInWithGoogle();}catch{message='Google sign-in could not start. Please try again.';busy=false;}}
</script>
<div class="login">
 <h2>One Google account. Your daily research.</h2>
 <p>New here? Your first successful Google sign-in creates your TRADE90 account. Returning traders use the same button.</p>
 <ul><li>Save your followed currency pairs across devices.</li><li>Compare research with your previous signed-in dashboard visit.</li><li>Keep public research available without an account.</li></ul>
 {#if checking}<p role="status">Checking sign-in…</p>{:else if signedIn}<p role="status">Signed in. Opening your dashboard…</p>{:else if available}<button on:click={login} disabled={busy}>{busy?'Opening Google…':'Continue with Google'}</button>{:else}<p class="notice">Google sign-in is awaiting activation. You can use the daily dashboard without an account in the meantime.</p>{/if}
 {#if message}<p role="alert">{message}</p>{/if}
 <p><a href="/daily/">Continue without an account →</a></p>
 <p class="small">Google shares your basic profile and email with Supabase to authenticate your account. We do not request access to Gmail or Google Drive. <a href="/privacy/">Privacy policy</a></p>
</div>
<style>
.login{max-width:640px;margin:15px auto;padding:26px;border:1px solid #475569;border-radius:14px;background:#111c30;color:#e2e8f0}.login p,.login li{line-height:1.7}.login a{color:#6ee7b7}.login button{padding:13px 22px;background:#fff;color:#172033;border:1px solid #94a3b8;border-radius:8px;font-weight:700;cursor:pointer}.small{font-size:.83rem}.notice{padding:14px;border:1px solid #94a3b8;border-radius:8px}:global(html[data-theme='light']) .login{background:#fff;color:#102033;border-color:#cbd5e1}:global(html[data-theme='light']) .login a{color:#065f46}
</style>
