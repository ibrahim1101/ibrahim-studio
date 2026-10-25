import {notFound} from 'next/navigation';
import Essential from '../../../../restaurant-variants/essential';
import Interactive from '../../../../restaurant-variants/interactive';
const sections=['menu','story','experiences','gallery','visit','reserve','reviews'];
export default async function Page({params}:{params:Promise<{tier:string,section:string}>}){const {tier,section}=await params;if(!['essential','interactive'].includes(tier)||!sections.includes(section))notFound();return tier==='essential'?<Essential section={section}/>:<Interactive section={section}/>}
