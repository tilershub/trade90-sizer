import {createClient} from '@supabase/supabase-js';
// Public project configuration. Row-level policies protect all member data.
export const authUrl='https://rdcxqgsfrqmwbrfqablz.supabase.co';
export const publicKey='sb_publishable_xUWarmB8lfGewlBZ1Y_z9w_rBTg4_YF';
let client;
export function getAuthClient(){
 if(typeof window==='undefined')return null;
 return client ||= createClient(authUrl,publicKey,{auth:{flowType:'pkce',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
}
export async function googleAvailable(){
 const response=await fetch(authUrl+'/auth/v1/settings',{headers:{apikey:publicKey},signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('Sign-in settings could not be checked. Please try again.');
 const settings=await response.json();return settings.external?.google===true&&!settings.disable_signup;
}
export async function signInWithGoogle(){
 const {error}=await getAuthClient().auth.signInWithOAuth({provider:'google',options:{redirectTo:'https://tradeninety.com/sign-in/',queryParams:{prompt:'select_account'}}});
 if(error)throw error;
}
