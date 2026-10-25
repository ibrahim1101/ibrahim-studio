import {notFound} from 'next/navigation';
import {getWorld} from '../../../../../lib/collection/data';
import WorldSite from '../../../../collection/world';
export default async function Page({params}:{params:Promise<{category:string,tier:string,section:string}>}){const {category,tier,section}=await params;if(!getWorld(category)||!['essential','interactive','3d'].includes(tier)||!['collection','about','experiences','gallery','contact','book','saved','cart','planner'].includes(section)||section==='cart'&&category!=='commerce'||section==='planner'&&(category!=='hotel'||tier!=='interactive'))notFound();return <WorldSite key={category+tier+section} category={category} tier={tier} section={section}/>}
