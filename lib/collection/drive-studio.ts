import type {Item} from './data';
export const DRIVE_FINISHES=[{name:'Pearl',hex:'#d4d1c8',price:0},{name:'Forest',hex:'#243d30',price:25000},{name:'Ember',hex:'#a43d2d',price:45000}];
export function driveTotal(base:number,finish:string,wheels:boolean,care:boolean){return base+(DRIVE_FINISHES.find(f=>f.name===finish)?.price||0)+(wheels?90000:0)+(care?60000:0)}
export function demoPayment(total:number,depositPercent:number,years:number,annualRate:number){const principal=Math.max(0,total)*(1-Math.max(0,Math.min(100,depositPercent))/100),months=Math.max(1,years*12),rate=Math.max(0,annualRate)/1200;return rate===0?principal/months:principal*rate/(1-Math.pow(1+rate,-months))}
export function findCars(items:Item[],budget:number,seats:number,power:string){return items.filter(i=>i.price<=budget&&i.capacity>=seats&&(power==='Any'||i.feature===power))}
export function validDriveConfig(value:unknown,ids:string[]){if(!value||typeof value!=='object')return false;const v=value as Record<string,unknown>;return ids.includes(String(v.model))&&DRIVE_FINISHES.some(f=>f.name===v.finish)&&typeof v.wheels==='boolean'&&typeof v.care==='boolean'}
