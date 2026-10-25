import {notFound} from 'next/navigation';
import {getWorld} from '../../../../../../lib/collection/data';
import WorldSite from '../../../../../collection/world';
export default async function Page({params}:{params:Promise<{category:string,tier:string,section:string,id:string}>}){const {category,tier,section,id}=await params;const world=getWorld(category);if(!world||!['essential','interactive','3d'].includes(tier)||section!=='collection'||!world.items.some(i=>i.id===id))notFound();return <WorldSite key={category+tier+id} category={category} tier={tier} section="detail" itemId={id}/>}
