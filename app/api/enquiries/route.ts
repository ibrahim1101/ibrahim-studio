import {env} from 'cloudflare:workers';
import {mailPublicConfig,submitEnquiry,type MailConfig} from '../../../lib/enquiry-delivery';
export const dynamic='force-dynamic';
export async function GET(){return Response.json(mailPublicConfig(env as MailConfig),{headers:{'Cache-Control':'no-store'}})}
export async function POST(request:Request){return submitEnquiry(request,env as MailConfig)}
