import {notFound} from 'next/navigation';
import {getWorld} from '../../../../lib/collection/data';
import WorldSite from '../../../collection/world';
export default async function Page({params}:{params:Promise<{category:string,tier:string}>}){const {category,tier}=await params;if(!getWorld(category)||!['essential','interactive','3d'].includes(tier))notFound();return <WorldSite key={category+tier} category={category} tier={tier}/>}
