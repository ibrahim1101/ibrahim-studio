import './globals.css';
import './collection/form.css';
import './studio.css';
import './restaurant-variants.css';
import './restaurant-feedback.css';
import './collection/world.css';
import './collection/resort-tour.css';
import './collection/hotel-interactive.css';
import './collection/automotive-experience.css';
import './collection/automotive-interactive.css';
import './collection/aura.css';
import './mobile-scenes.css';
export const metadata={title:'Ibrahim Studio — Websites worth experiencing',description:'Minimal by design. Immersive by nature. Explore bespoke digital experiences.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to content</a><div id="main-content" tabIndex={-1}>{children}</div><nav className="studio-utility" aria-label="Studio information"><a href="/demo-guide">Demo guide</a><a href="/resources">Presentations & PDF</a><a href="/terms">Project terms</a><a href="/privacy">Privacy</a><a href="/accessibility">Accessibility</a><a href="/contact">Contact Ibrahim</a></nav></body></html>}
