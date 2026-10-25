export const STUDIO={name:'Ibrahim Studio',contact:'Shaik Ibrahim',email:'contact@ibrahimshaik.com',portfolio:'https://portfolio.ibrahimshaik.com',plannedDomain:'https://services.ibrahimshaik.com',reviewed:'25 October 2026'};
export const PACKAGES=[
{id:'essential',name:'Essential',price:14999,time:'2–3 weeks',scope:'Up to 5 pages, supplied content, responsive design, SEO foundations and an email enquiry handoff.',includes:['One design direction','Two consolidated revision rounds','Contact brief and launch handover','30 days of in-scope defect fixes']},
{id:'interactive',name:'Interactive',price:34999,time:'3–5 weeks',scope:'Up to 8 pages and one scoped customer journey such as a finder, planner or configurator.',includes:['Everything in Essential','Search, filters or comparison as scoped','Browser-local proof of the core flow','Live integrations quoted separately']},
{id:'viewer',name:'3D Product',price:79999,time:'4–6 weeks',scope:'Up to 5 pages, one supplied web-ready model, three camera views and up to five product hotspots.',includes:['Orbit and close-up inspection','Lighting and material presentation','Reduced-motion and non-3D alternatives','Model creation and licenses excluded']},
{id:'spatial',name:'3D Spatial',price:149999,time:'6–10 weeks',scope:'Up to 8 pages and one supplied connected environment with up to five guided zones.',includes:['Continuous camera journey','Room or zone navigation','One scoped enquiry journey','Capture, reconstruction and travel excluded']},
{id:'bespoke',name:'3D Bespoke',price:299999,time:'10–16+ weeks',scope:'Complex environments, detailed product interiors or multi-part configuration, scoped after asset review.',includes:['Custom interaction specification','Agreed performance and device targets','Staged prototype and asset approval','Specialist production quoted separately']}
];
export const CATEGORY_PRICES=[
{id:'restaurant',name:'Restaurant',brand:'Ember Table',essential:14999,interactive:34999,signature:149999,reason:'One supplied venue model, up to five zones, wall-menu interaction and one enquiry flow.'},
{id:'hotel',name:'Hotel & Resort',brand:'Stillwater',essential:19999,interactive:49999,signature:199999,reason:'One supplied environment, up to five zones and one representative suite type. Extra rooms are scoped separately.'},
{id:'real-estate',name:'Architecture & Real Estate',brand:'AURA Estates',essential:19999,interactive:49999,signature:174999,reason:'One supplied furnished residence, up to five zones, guided walk and dollhouse overview.'},
{id:'commerce',name:'Premium E-commerce',brand:'FORM Objects',essential:19999,interactive:44999,signature:99999,reason:'One supplied product model with material options and inspection. Store platform, payments and inventory are additional.'},
{id:'automotive',name:'Automotive',brand:'VELOCE',essential:19999,interactive:49999,signature:174999,reason:'One supplied vehicle with usable cabin and engine geometry, up to five hotspots and three inspection views.'}
];
export const ADDONS=[
['3D feasibility review','₹7,500','Asset inventory, a capture plan and a written scope. Credited against a 3D build commissioned within 30 days. No capture included.'],
['Half-day location visit','₹7,500','Up to 4 hours on site. Reference photos and capture coordination. Travel and equipment are separate.'],
['Full-day location visit','₹12,500','Up to 8 hours on site. Subject to access, location readiness and a written capture plan.'],
['Simple product model','₹10,000–₹30,000','Indicative studio allowance per asset, confirmed after references and required detail are reviewed.'],
['Detailed product / vehicle model','₹40,000–₹2,00,000+','Indicative asset allowance. Cabin, engine, topology and moving parts change scope substantially.'],
['Furnished room reconstruction','₹25,000–₹75,000','Indicative allowance per room. A reference visit does not automatically produce a finished model.'],
['Whole venue reconstruction','₹1,00,000–₹4,00,000+','Indicative allowance. Area, room variety, access and accuracy requirements determine the quote.'],
['Essential care','From ₹1,999 / month','Up to 1 hour of small content updates and a monthly health check. No hosting, redesign or new features.'],
['Interactive care','From ₹3,999 / month','Up to 2 hours of updates plus core-flow checks. Provider fees and major fixes outside agreed scope are separate.'],
['3D care','From ₹6,999 / month','Up to 3 hours of updates and agreed scene/device checks. New models, rescans and scene rebuilds are separate.']
];
export const PRICING_SOURCES=[
{title:'Web Designer India: published website packages',url:'https://www.webdesignerindia.in/packages/website-design-plans/',note:'Advertises ₹15,000, ₹25,000 and ₹45,000 packages with different page counts and inclusions.'},
{title:'LaunchRoom: public package pricing',url:'https://launchroom.in/pricing',note:'Advertises ₹14,999 one-page, ₹24,999 five-page and ₹44,999 broader packages. These are asking prices, not verified transactions.'},
{title:'studiokalex: 3D website cost guide',url:'https://www.studiokalex.com/blog/3d-website-cost-india-2026-pricing-guide',note:'One agency guide describes ₹1–3 lakh for a product viewer and ₹3–10 lakh for a scroll-led 3D site. Scope differs from our starter offers.'},
{title:'studiokalex: product modelling cost guide',url:'https://www.studiokalex.com/blog/3d-product-rendering-cost-india-2026-pricing-guide',note:'Separates modelling from rendered images and cites complexity-dependent product-model ranges. Supports quoting asset production separately.'},
{title:'MeitY: Digital Personal Data Protection Rules, 2025',url:'https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf',note:'Rule 1 sets phased commencement. Avoid blanket claims that every provision is already operational.'},
{title:'Consumer Protection (E-Commerce) Rules, 2020',url:'https://thc.nic.in/Central%20Governmental%20Rules/Consumer%20Protection%20(E-Commerce)%20Rules,%202020.pdf',note:'Live commerce requires merchant disclosures, consumer information and a suitable grievance process.'},
{title:'Ministry of Housing and Urban Affairs: RERA',url:'https://rera.mohua.gov.in/',note:'Real property marketing must follow applicable central and state requirements. Fictional demo listings are not offers.'}
];
export function estimateBuild(category:string,tier:string,assetWork:number,visit:'none'|'half'|'full',days:number){const p=CATEGORY_PRICES.find(p=>p.id===category)||CATEGORY_PRICES[0];const base=tier==='essential'?p.essential:tier==='interactive'?p.interactive:p.signature;const is3d=tier==='3d',asset=is3d&&Number.isFinite(assetWork)?Math.max(0,assetWork):0,visitCost=is3d?(visit==='half'?7500:visit==='full'?12500:0)*Math.max(1,Math.min(10,Math.floor(days)||1)):0;return {base,assets:asset,visit:visitCost,total:base+asset+visitCost}}
export function enquiryText(data:Record<string,string>){return Object.entries(data).filter(([,v])=>v.trim()).map(([k,v])=>k+': '+v.trim()).join('\n\n')}
