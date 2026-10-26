import test from 'node:test';
import assert from 'node:assert/strict';
import {personalContactOptions,submitPersonalContact} from '../lib/personal-contact.ts';
const origin='https://ibrahimshaik.com';
const env={RESEND_API_KEY:'test_secret',ENQUIRY_FROM:'Ibrahim Studio <enquiries@notify.ibrahimshaik.com>',TURNSTILE_SITE_KEY:'public',TURNSTILE_SECRET_KEY:'test_challenge_secret'};
const fields={name:'Test Visitor',email:'visitor@example.com',subject:'Hello',message:'This is a test message.',consent:true,website:'',token:'token',requestId:'7e7e1e42-780f-4fea-960d-0a9a6b2dccf9'};
const req=(body=fields,from=origin)=>new Request('https://services.ibrahimshaik.com/api/personal-contact',{method:'POST',headers:{Origin:from,'Content-Type':'application/json'},body:typeof body==='string'?body:JSON.stringify(body)});
const ok=(value)=>new Response(JSON.stringify(value),{status:200,headers:{'Content-Type':'application/json'}});
test('CORS permits exact site origins and rejects arbitrary origins and headers',()=>{
 const preflight=(from,headers='content-type')=>new Request('https://services.ibrahimshaik.com/api/personal-contact',{method:'OPTIONS',headers:{Origin:from,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':headers}});
 const allowed=personalContactOptions(preflight(origin));assert.equal(allowed.status,204);assert.equal(allowed.headers.get('access-control-allow-origin'),origin);assert.equal(personalContactOptions(preflight('https://evil.example')).status,403);assert.equal(personalContactOptions(preflight(origin,'authorization')).status,403);
});
test('missing config, invalid origin, malformed fields, consent and oversized messages cannot send email',async()=>{
 let calls=0;const send=async()=>{calls++;return ok({success:true})};
 const cases=[[req(),{},503],[req(fields,'https://evil.example'),env,403],[req({...fields,consent:false}),env,400],[req({...fields,email:'bad\r\nTo: x@y.com'}),env,400],[req({...fields,website:'bot'}),env,400],[req({...fields,message:'short'}),env,400],[req('x'.repeat(13000)),env,413]];
 for(const [request,config,status] of cases)assert.equal((await submitPersonalContact(request,config,send)).status,status);
 assert.equal(calls,0);
});
test('failed challenge, wrong action or wrong hostname never send mail',async()=>{
 for(const verification of [{success:false},{success:true,action:'enquiry',hostname:'ibrahimshaik.com'},{success:true,action:'personal_contact',hostname:'services.ibrahimshaik.com'}]){let calls=0;const result=await submitPersonalContact(req(),env,async()=>{calls++;return ok(verification)});assert.equal(result.status,400);assert.equal(calls,1)}
});
test('accepted message uses fixed recipient, visitor reply-to, correct origin, and idempotency',async()=>{
 let mail;const result=await submitPersonalContact(req(),env,async(url,options)=>{if(String(url).includes('siteverify'))return ok({success:true,action:'personal_contact',hostname:'ibrahimshaik.com'});mail=options;return ok({id:'message-id'})});
 assert.equal(result.status,200);assert.equal(result.headers.get('access-control-allow-origin'),origin);const body=JSON.parse(mail.body);assert.deepEqual(body.to,['contact@ibrahimshaik.com']);assert.equal(body.reply_to,'visitor@example.com');assert.equal(mail.headers['Idempotency-Key'],'personal-contact/'+fields.requestId);assert.match(body.text,/This is a test message/);assert.match((await result.json()).reference,/^SI-/);
});
test('preview is accepted only with matching challenge hostname',async()=>{let calls=0;const result=await submitPersonalContact(req(fields,'https://ibrahim-personal-dashboard.rockyox34.chatgpt.site'),env,async()=>{calls++;return ok(calls===1?{success:true,action:'personal_contact',hostname:'ibrahim-personal-dashboard.rockyox34.chatgpt.site'}:{id:'message-id'})});assert.equal(result.status,200)});
test('mail provider and network failures do not report success',async()=>{for(const mode of ['bad','throw']){const result=await submitPersonalContact(req(),env,async(url)=>{if(String(url).includes('siteverify'))return ok({success:true,action:'personal_contact',hostname:'ibrahimshaik.com'});if(mode==='throw')throw Error('network');return new Response('{}',{status:502})});assert.equal(result.status,502)}});
