export type Review={id:string,dish:string,stars:number,name:string,text:string,date:string,sample?:boolean};
export type Ticket={id:string,category:string,dish:string,text:string,date:string};
const names=['Demo guest A','Demo guest B','Demo guest C'];
export function sampleReviews(id:string):Review[]{return [5,4,5].map((stars,i)=>({id:`sample-${id}-${i}`,dish:id,stars,name:names[i],text:['A lovely balance of flavour and a memorable finish.','Enjoyed this plate. A slightly warmer serving would make it even better.','A favourite from our imagined evening. Would choose it again.'][i],date:'2026-10-'+(20-i),sample:true}))}
export function ratingSummary(reviews:Review[]){return {count:reviews.length,average:reviews.length?reviews.reduce((n,r)=>n+r.stars,0)/reviews.length:0,distribution:[5,4,3,2,1].map(stars=>reviews.filter(r=>r.stars===stars).length)}}
export function reviewError(stars:number,text:string){if(!Number.isInteger(stars)||stars<1||stars>5)return 'Choose a rating from 1 to 5 stars.';if(text.trim().length<10)return 'Write at least 10 characters about your experience.';if(text.trim().length>500)return 'Keep your review under 500 characters.';return ''}
