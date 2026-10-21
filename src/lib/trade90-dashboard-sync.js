export function sanitizeDashboard(value,symbols){
 if(value?.version!==1||!Array.isArray(value.pairs))return null;
 const pairs=[...new Set(value.pairs.filter(s=>symbols.includes(s)))];
 const view=value.view?.version===1&&value.view.pairs&&value.view.banks&&Number.isFinite(Date.parse(value.view.viewedAt))?value.view:null;
 return {version:1,pairs,view};
}
export async function loadDashboard(client,userId){
 const {data,error}=await client.from('member_workspaces').select('daily_dashboard,workspace_version').eq('user_id',userId).maybeSingle();
 if(error)throw error;return data;
}
export async function saveDashboard(client,userId,version,value){
 // Optimistic concurrency: never silently replace changes made on another device.
 const query=version==null?client.from('member_workspaces').insert({user_id:userId,daily_dashboard:value}):client.from('member_workspaces').update({daily_dashboard:value}).eq('user_id',userId).eq('workspace_version',version);
 const {data,error}=await query.select('workspace_version').maybeSingle();
 if(error)throw error;if(!data)throw Error('Your dashboard changed on another device. Reload before saving.');return data.workspace_version;
}
