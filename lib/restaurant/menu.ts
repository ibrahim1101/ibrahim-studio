export const DISHES = [
  {id:'burrata',name:'Burrata & Heirloom',type:'Starters',price:480,detail:'Creamy burrata, seasonal tomatoes, basil oil.',allergen:'Milk',diet:'Vegetarian',image:'photo-1515543904379-3d757afe72e4'},
  {id:'risotto',name:'Wild Mushroom Risotto',type:'Mains',price:780,detail:'Arborio rice, forest mushrooms, aged parmesan.',allergen:'Milk',diet:'Vegetarian',image:'photo-1473093295043-cdd812d0e601'},
  {id:'sea-bass',name:'Wood-fired Sea Bass',type:'Mains',price:1150,detail:'Sea bass, charred lemon, garden vegetables.',allergen:'Fish',diet:'Pescatarian',image:'photo-1467003909585-2f8a72700288'},
  {id:'cremeux',name:'Dark Chocolate Crémeux',type:'Desserts',price:420,detail:'70% cocoa, sea salt, vanilla cream.',allergen:'Milk, eggs',diet:'Vegetarian',image:'photo-1578985545062-69928b1d9587'},
  {id:'pumpkin',name:'Roasted Pumpkin & Sage',type:'Starters',price:390,detail:'Slow-roasted pumpkin, sage butter, toasted pumpkin seeds.',allergen:'Milk',diet:'Vegetarian',image:'photo-1473093295043-cdd812d0e601'},
  {id:'aubergine',name:'Ember-roasted Aubergine',type:'Mains',price:690,detail:'Smoked aubergine, tahini yoghurt, pomegranate, warm flatbread.',allergen:'Milk, sesame, wheat',diet:'Vegetarian',image:'photo-1515543904379-3d757afe72e4'},
  {id:'chicken',name:'Herb-roasted Chicken',type:'Mains',price:940,detail:'Fire-finished chicken, potato fondant, rosemary jus.',allergen:'Milk',diet:'Non-vegetarian',image:'photo-1467003909585-2f8a72700288'},
  {id:'panna-cotta',name:'Vanilla Panna Cotta',type:'Desserts',price:360,detail:'Vanilla cream, berry compote, delicate almond crumble.',allergen:'Milk, almonds',diet:'Contains gelatin',image:'photo-1578985545062-69928b1d9587'},
];
export type Dish = typeof DISHES[number];
// Board plane is mounted on the back wall beside the dining room bar.
export const MENU_WALL = {position:[-5.85,2.95,-17.48], width:3.25,height:3.75};
export const MENU_CAMERA = {position:[-4.4,2.45,-11.7],target:[-5.85,2.8,-17.48]};
export function menuRowCenter(index:number){return [-5.85,3.78-Math.max(0,Math.min(3,index))*.59,-17.35]}

export const MENU_PAGE_SIZE=4;
export function menuPageCount(){return Math.ceil(DISHES.length/MENU_PAGE_SIZE)}
export function normalizeMenuPage(page:number){const count=menuPageCount();return ((Math.trunc(page)%count)+count)%count}
export function menuPageItems(page:number){const start=normalizeMenuPage(page)*MENU_PAGE_SIZE;return DISHES.slice(start,start+MENU_PAGE_SIZE)}
export function nextDishIndex(index:number,delta:number){return ((index+delta)%DISHES.length+DISHES.length)%DISHES.length}
