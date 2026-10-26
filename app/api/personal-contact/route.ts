import {env} from 'cloudflare:workers';
import {personalContactOptions,submitPersonalContact} from '../../../lib/personal-contact';
import type {MailConfig} from '../../../lib/enquiry-delivery';
export const dynamic='force-dynamic';
export function OPTIONS(request:Request){return personalContactOptions(request)}
export async function POST(request:Request){return submitPersonalContact(request,env as MailConfig)}
