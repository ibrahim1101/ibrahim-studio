'use client';
import {DishRating,DishReviews} from './restaurant-reviews';
import {useState} from 'react';
import {DISHES,nextDishIndex} from '../lib/restaurant/menu';
export default function FoodCard({index,onSelect,onClose,cardId='wall-food-card'}:{index:number,onSelect:(index:number)=>void,onClose:()=>void,cardId?:string}) {
  const [expanded,setExpanded]=useState(false);
  const dish=DISHES[index];
  function move(delta:number){onSelect(nextDishIndex(index,delta));setExpanded(false)}
  return <aside id={cardId} className="wall-food-card menu-card-v2" aria-label={dish.name} onKeyDown={e=>{
    if(e.key==='Escape'){e.stopPropagation();onClose()}
    if((e.target as HTMLElement).closest('input,textarea,select'))return;
    if(e.key==='ArrowRight'){e.preventDefault();move(1)}
    if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}
  }}>
    <div className="food-card-topline"><span>THE SEASONAL COLLECTION</span><button type="button" aria-label="Close food card" onClick={onClose}>×</button></div>
    <img key={dish.image} src={'https://images.unsplash.com/'+dish.image+'?auto=format&fit=crop&w=640&q=80'} alt="Illustrative food photography"/>
    <div className="food-card-body">
      <span className="eyebrow">{dish.type} · {String(index+1).padStart(2,'0')} / {String(DISHES.length).padStart(2,'0')}</span>
      <h3>{dish.name}</h3><p>{dish.detail}</p><div className="diet-label">{dish.diet}</div><DishRating id={dish.id}/>
      <div className="food-card-actions"><span>₹{dish.price}</span><button type="button" aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>{expanded?'Hide details −':'Dish details +'}</button></div>
      {expanded&&<section className="inline-food-details" aria-label="Dish information"><h4>At a glance</h4><dl><dt>Allergens</dt><dd>{dish.allergen}</dd><dt>Dietary information</dt><dd>{dish.diet}</dd><dt>Preparation</dt><dd>Made to order. Ask about ingredient substitutions when booking a real venue.</dd></dl><p>Fictional demonstration menu. Photography is illustrative.</p></section>}{expanded&&<DishReviews id={dish.id}/>}
    </div>
    <div className="food-card-pager"><button type="button" aria-label="Previous dish" onClick={()=>move(-1)}>←</button><span>DISCOVER THE NEXT DISH</span><button type="button" aria-label="Next dish" onClick={()=>move(1)}>→</button></div>
  </aside>
}
