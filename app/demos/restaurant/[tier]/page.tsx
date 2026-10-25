import {notFound} from 'next/navigation';
import Restaurant from '../../../restaurant';
import Essential from '../../../restaurant-variants/essential';
import Interactive from '../../../restaurant-variants/interactive';
export default async function Page({params}:{params:Promise<{tier:string}>}){const {tier}=await params;if(!['essential','interactive','3d'].includes(tier))notFound();return tier==='essential'?<Essential/>:tier==='interactive'?<Interactive/>:<Restaurant tier={tier}/>}
