export type MailConfig={RESEND_API_KEY?:string,ENQUIRY_FROM?:string,TURNSTILE_SITE_KEY?:string,TURNSTILE_SECRET_KEY?:string};
const ORIGINS=['https://services.ibrahimshaik.com'];
const LIMITS:Record<string,number>={Name:100,Email:200,Business:120,Industry:80,Service:80,Budget:80,Timeline:120,Assets:150,Location:150,Project:3000,Estimate:250};
const email=(s:string)=>s.length<=200&&/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(s)&&!/[\r\n]/.test(s);
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export function mailReady(env:MailConfig){return Boolean(env.RESEND_API_KEY&&env.ENQUIRY_FROM&&env.TURNSTILE_SITE_KEY&&env.TURNSTILE_SECRET_KEY&&/^[^\r\n]+<[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+>$/.test(env.ENQUIRY_FROM))}
export function mailPublicConfig(env:MailConfig){return {enabled:mailReady(env),siteKey:mailReady(env)?env.TURNSTILE_SITE_KEY:null}}
export async function submitEnquiry(request:Request,env:MailConfig,send:typeof fetch=fetch){
 const origin=request.headers.get('Origin')||'';
 if(!ORIGINS.includes(origin))return json({error:'Please submit from the Ibrahim Studio contact page.'},403);
 if(!mailReady(env))return json({error:'Website email delivery is not configured yet. Use the email-app option below.'},503);
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Unsupported request format.'},415);
 // Bound the streamed body, even when Content-Length is missing or untrusted.
 let raw='';try{const reader=request.body?.getReader();if(!reader)return json({error:'Your enquiry is empty.'},400);let bytes=0;const decoder=new TextDecoder();while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>16000){await reader.cancel();return json({error:'Your enquiry is too long.'},413)}raw+=decoder.decode(value,{stream:true})}raw+=decoder.decode()}catch{return json({error:'Your enquiry could not be read.'},400)}
 let data:any;try{data=JSON.parse(raw)}catch{return json({error:'Invalid enquiry format.'},400)}
 if(!data||typeof data!=='object'||data.consent!==true||data.website||typeof data.token!=='string'||data.token.length>2048||!data.token||typeof data.requestId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.requestId))return json({error:'Please review the form and complete the security check.'},400);
 const fields:Record<string,string>={};if(!data.fields||typeof data.fields!=='object')return json({error:'Missing project details.'},400);
 for(const [key,max] of Object.entries(LIMITS)){const v=data.fields[key];if(v!==undefined&&(typeof v!=='string'||v.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v)))return json({error:'Please shorten or correct your project details.'},400);if(v?.trim())fields[key]=v.trim()}
 if(!fields.Name||!email(fields.Email||'')||!fields.Timeline||!fields.Service||!fields.Industry||!fields.Project||fields.Project.length<20)return json({error:'Please provide your name, valid email, service, industry, launch window and project goals (at least 20 characters).'},400);
 try{
  const check=await send('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:env.TURNSTILE_SECRET_KEY,response:data.token}),signal:AbortSignal.timeout(10000)});
  const result=await check.json() as {success?:boolean,hostname?:string,action?:string};
  if(!check.ok||!result.success||result.action!=='enquiry'||result.hostname!==new URL(origin).hostname)return json({error:'Security check expired or failed. Complete it again and retry.'},400);
  const reference='IS-'+data.requestId;
  const response=await send('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'enquiry/'+data.requestId},body:JSON.stringify({from:env.ENQUIRY_FROM,to:['contact@ibrahimshaik.com'],reply_to:fields.Email,subject:'Ibrahim Studio project enquiry · '+fields.Service.replace(/[\r\n]/g,' '),text:'Project enquiry\nReference: '+reference+'\n\n'+Object.entries(fields).map(([k,v])=>k+': '+v).join('\n\n')+'\n\nConsent: visitor requested email delivery to Ibrahim Studio.'}),signal:AbortSignal.timeout(15000)});
  const receipt=await response.json() as {id?:string};if(!response.ok||!receipt.id)return json({error:'The mail service did not accept your enquiry. Your brief is still on this page; retry or use your email app.'},502);
  return json({reference,message:'Your enquiry was accepted by our email service. Please keep this reference; acceptance does not guarantee inbox delivery.'});
 }catch{return json({error:'Email delivery could not be confirmed. Your brief is still on this page. Retry with the same brief or use your email app.'},502)}
}
