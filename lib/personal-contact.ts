import {mailReady,type MailConfig} from './enquiry-delivery.ts';

const ALLOWED_ORIGINS=new Set([
 'https://ibrahimshaik.com',
 'https://www.ibrahimshaik.com',
 'https://ibrahim-personal-dashboard.rockyox34.chatgpt.site'
]);
const baseHeaders={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Vary':'Origin'};
function response(origin:string,body:unknown,status=200){return Response.json(body,{status,headers:{...baseHeaders,...(ALLOWED_ORIGINS.has(origin)?{'Access-Control-Allow-Origin':origin}:{})}})}
export function personalContactOptions(request:Request){
 const origin=request.headers.get('Origin')||'';
 if(!ALLOWED_ORIGINS.has(origin))return response(origin,{error:'Origin not allowed.'},403);
 if(request.headers.get('Access-Control-Request-Method')!=='POST')return response(origin,{error:'Method not allowed.'},405);
 const requested=(request.headers.get('Access-Control-Request-Headers')||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
 if(requested.some(header=>header!=='content-type'))return response(origin,{error:'Headers not allowed.'},403);
 return new Response(null,{status:204,headers:{...baseHeaders,'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600'}});
}
export async function submitPersonalContact(request:Request,env:MailConfig,send:typeof fetch=fetch){
 const origin=request.headers.get('Origin')||'';
 if(!ALLOWED_ORIGINS.has(origin))return response(origin,{error:'Please send this message from Ibrahim’s website.'},403);
 if(!mailReady(env))return response(origin,{error:'Message delivery is being set up. Please email contact@ibrahimshaik.com.'},503);
 if(!/^application\/json(?:\s*;|\s*$)/i.test(request.headers.get('Content-Type')||''))return response(origin,{error:'Unsupported request format.'},415);
 let raw='';try{const reader=request.body?.getReader();if(!reader)return response(origin,{error:'Your message is empty.'},400);const decoder=new TextDecoder();let bytes=0;while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>12000){await reader.cancel();return response(origin,{error:'Your message is too long.'},413)}raw+=decoder.decode(value,{stream:true})}raw+=decoder.decode()}catch{return response(origin,{error:'Your message could not be read.'},400)}
 let data:unknown;try{data=JSON.parse(raw)}catch{return response(origin,{error:'Invalid message format.'},400)}
 if(!data||typeof data!=='object'||Array.isArray(data))return response(origin,{error:'Invalid message format.'},400);
 const input=data as Record<string,unknown>;
 if(input.consent!==true||input.website||typeof input.token!=='string'||!input.token||input.token.length>2048||typeof input.requestId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.requestId))return response(origin,{error:'Please complete the form and security check.'},400);
 const limits={name:100,email:200,subject:120,message:3000} as const;const fields:Record<string,string>={};
 for(const [key,max] of Object.entries(limits)){const value=input[key];if(typeof value!=='string'||value.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)||(key!=='message'&&/[\r\n]/.test(value)))return response(origin,{error:'Please check your details and try again.'},400);fields[key]=value.trim()}
 if(!fields.name||!fields.subject||fields.message.length<10||!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(fields.email))return response(origin,{error:'Please add your name, a valid email, a subject, and a message of at least 10 characters.'},400);
 try{
  const check=await send('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:env.TURNSTILE_SECRET_KEY,response:input.token}),signal:AbortSignal.timeout(10000)});
  const verification=await check.json() as {success?:boolean,hostname?:string,action?:string};
  if(!check.ok||!verification.success||verification.action!=='personal_contact'||verification.hostname!==new URL(origin).hostname)return response(origin,{error:'Security check expired or failed. Please try again.'},400);
  const reference='SI-'+input.requestId;
  const sent=await send('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'personal-contact/'+input.requestId},body:JSON.stringify({from:env.ENQUIRY_FROM,to:['contact@ibrahimshaik.com'],reply_to:fields.email,subject:'Website message · '+fields.subject,text:'Personal website message\nReference: '+reference+'\n\nName: '+fields.name+'\nEmail: '+fields.email+'\nSubject: '+fields.subject+'\n\nMessage:\n'+fields.message+'\n\nConsent: visitor requested a reply to this message.'}),signal:AbortSignal.timeout(15000)});
  const receipt=await sent.json() as {id?:string};if(!sent.ok||!receipt.id)return response(origin,{error:'The email service could not accept your message. Please try again.'},502);
  return response(origin,{reference,message:'Your message was accepted for delivery. Please keep this reference.'});
 }catch{return response(origin,{error:'Delivery could not be confirmed. Please try again or send an email directly.'},502)}
}
