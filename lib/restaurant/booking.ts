import {TABLES} from './tour.ts';
export type Reservation={id:string,date:string,time:string,guests:number,table:string,requests:string};
export const TIMES=['18:00','18:30','19:00','19:30','20:00','20:30','21:00'];
export function todayISO(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export function bookingError(b:Omit<Reservation,'id'>,saved:Reservation[],editing:string|null,today=todayISO()){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(b.date)||b.date<today)return 'Choose today or a future date.';
  const date=new Date(b.date+'T12:00:00');if(Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==b.date)return 'Choose a valid date.';
  if(date.getDay()===1)return 'The restaurant is closed on Mondays.';
  if(!TIMES.includes(b.time))return 'Choose an available dinner time.';
  if(!Number.isInteger(b.guests)||b.guests<1||b.guests>8)return 'Choose between 1 and 8 guests.';
  const table=TABLES.find(t=>t.id===b.table);if(!table||table.capacity<b.guests)return 'Choose a table with enough seats.';
  if(saved.some(r=>r.id!==editing&&r.table===b.table&&r.date===b.date&&r.time===b.time))return 'That table is already reserved for this demo time. Try another time or table.';
  return '';
}
