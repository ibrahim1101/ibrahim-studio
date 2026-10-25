# Validation — 23 October 2026

Passed: TypeScript `tsc --noEmit` (exit 0); production Vinext build (exit 0).

Actual desktop browser interaction via internal preview:
- Agency homepage renders, restaurant flagship link opens.
- 6 guests filters to 6- and 8-seat tables; default selection becomes T5.
- Date selected through native date input, create demo reservation: successful status and record displayed.
- Reload: same saved record restored.
- Modify: changed 19:00 to 20:00, same ID and updated feedback displayed.
- Cancel: record removed and cancellation feedback displayed.
- Dessert filter: starter/main dishes removed.
- WebGL renderer creation failed in preview browser; fallback displayed, and business form remained usable.

Bugs found and corrected: locale-dependent date comparison, randomUUID unavailable on HTTP preview. Stage links now use one deterministic scroll target rather than two competing smooth scroll operations.

Not verified: actual 3D appearance/camera interpolation (WebGL unavailable), mobile viewport, all keyboard interactions, performance metrics, automated Playwright/Vitest suite. Production delivery, Pages deployment and twelve other demos do not exist yet. No Lighthouse scores claimed.

## Restaurant visual rebuild — 23 October 2026

Replaced scene geometry/materials and the old four-pose jumping camera with a continuous constrained tour, pointer table selection, explicit table inspection, and gentle horizontal inspection drag. Shared table coordinates now drive both the scene and reservations. Render setup/frame/context-loss failures are caught; first-frame pixel diversity guards against displaying only the background clear colour. Dimensions have nonzero viewport fallbacks. Photographic mode is explicitly labelled and collapses the long scroll region.

Automated `node --experimental-strip-types --test tests/restaurant-tour.test.mjs`: 4 passed. Checks finite camera paths through centre doorway, clamped progress, six unique accurate table targets, and bounded inspection positions. TypeScript check passed.

Browser: revised photo fallback composition visually inspected. Browser console explicitly reports GL_VENDOR=Disabled and GL_RENDERER=Disabled, so actual GPU rendering and final 3D visual quality remain unverified here. No claim that photography is real-time 3D.

## Menu wall and model refinement

Added a real framed menu board to the rear restaurant wall, dedicated camera target, readable projected DOM labels tied to the board's 3D row positions, and hover/focus/tap dish cards using the same data as the standard menu. Menu camera begins after the centre-aisle tour reaches the dining room. Added doors, banquettes, facade detail, plaster artwork and layered planting screens. Printed 3D labels remain visible outside interactive menu mode.

Browser interaction checks: Menu wall opens the four-item board in labelled non-WebGL fallback; selecting risotto shows correct price/description/diet/allergens; Tab from risotto changes the card to sea bass; Dish details opens native modal with fish allergen; Escape returns; dessert selection updates the card. Image naturalWidth=640 verified for the risotto photo. Actual GPU camera pan and projected-label alignment still require a WebGL-capable device; this preview browser has GPU disabled.

Automated test suite extended with physical menu-camera/board consistency, unique dish IDs, prices/allergen data and ordered row targets. Five tests pass. Photography is illustrative and explicitly labelled, not a claim about exact dish appearance.

## Menu navigation regression fix

Wall-menu details now expand in a dedicated in-scene dock instead of calling the document-level dialog. The dock has a fixed header/image and a separately scrollable detail body, with previous/next dish controls always visible in a footer above all tour controls. Menu interaction holds document scroll and preserves camera progress. Leaving the menu no longer scrolls to the exterior. Standard non-spatial dish dialogs also preserve document scroll on focus/close.

Eight dishes across two four-item pages. Menu-wall previous/next arrows wrap and update the printed 3D board textures and projected labels together. Card arrows update the page when crossing page boundaries.

Actual browser observations in GPU-disabled fallback: details expanded with scrollY=124, camera progress=3.000 and view=menu unchanged; next dish after expanded details moved to page 2 with the same scroll/camera state; previous menu page returned to page 1 at scrollY=124; Leave menu wall retained scrollY=124 and progress=3.000 while changing view to tour. Found/fixed footer overlap that previously intercepted the next-dish click. Six logic tests pass; TypeScript passes. Actual WebGL model visual acceptance remains unverified because browser GPU is disabled.

Model improvements: rounded/bevelled box geometry, reflected room environment, bump relief on stone/walnut, softer floor contact shadows, pleated curtain layers and continued frame-health checks after navigation. These are original procedural assets, not a claim of photorealistic final art.

## Edition revision — 23 October 2026
TypeScript and 8 Node tests pass, covering camera paths, paging, four-corner menu homography and reservation constraints. Browser QA confirmed distinct homepage designs; Essential dessert filtering and modal; Interactive search, vegetarian filtering, grid/list switch, tasting selection total and reservation request prefill; six-person table eligibility; local reservation creation, modification and cancellation; gallery filter/lightbox next/close; story chapter switch and celebration filter. Cloud browser has GPU disabled: actual WebGL visual acceptance remains outstanding. Responsive rules were implemented but mobile browser viewport was not exercised.

## Guestbook revision
Nine Node tests pass including rating aggregation/distribution and review validation; TypeScript passes. Browser confirmed 2-star review changes Burrata average 4.7 to 4.0, persists on reload, editing to 5 stars changes average to 4.8 without duplicate review; helpful toggle; complaint creates DEMO reference/history and persists; same review available in Essential guestbook; menu opens dish-level review section. Fixed crypto.randomUUID unsupported in HTTP preview by using crypto.getRandomValues. Larger navbar and feedback styling captured in docs/restaurant-feedback-design-20261023.jpg. Actual 3D CanvasTexture text remains unverified visually because browser GPU unavailable.

## All-category batch — 23 October 2026
13 Node tests and TypeScript pass. Added continuous camera velocity test at both chapter boundaries, unique catalogue checks, calendar-night arithmetic and discounted cart delivery checks. Browser checked all 12 newly implemented demo entry pages. Hotel 3-night Garden request correctly shows ₹25,500; property saved/compared two records, search and viewing save; automotive Ember + wheels total ₹79,35,000 passed into and saved with test-drive request; FORM10 reduces ₹12,500 to ₹11,600 including ₹350 delivery and checkout records that exact total; gallery changes 1/5 to 2/5; contact saves local enquiry. Header alignment DOM measurement: all five targets 48px high with identical vertical centre. No GPU/mobile visual acceptance claimed. Attempted localhost HTTP smoke check was unavailable across the managed preview boundary; browser checks are the recorded route verification.

## Stillwater photographic walkthrough
14 Node tests pass. Added clamped scroll range and consecutive crossfade checks. Browser verified eight tour photos loaded with naturalWidth=2000, lobby view, Family Residence selection jumps to suite, reservation URL and form preserve family, bathroom rendering, reduced-motion toggle, room-only detail has 5 chapters and no world-scene nodes. Screenshot stillwater-bathroom-final-20261023.jpg records the photographic bathroom. A waitFor heading check hit the browser's short selector deadline during smooth chapter travel; subsequent DOM/screenshot confirmed chapter 7 and correct scroll position. No WebGL required for this experience.

## Connected resort correction
15 tests pass, including four distinct suite entrance coordinates, common lobby, finite continuous path samples at 0.01 increments, standing camera height, room-only mapping and terrace coordinates. Browser confirms zero resort-photo-layer elements and one resort-connected-canvas host. WebGL is unavailable in managed browser, so actual 3D rendering is explicitly unverified; fallback and catalogue navigation pass.

## Interactive stay planner
16 tests pass; added package-room and once-per-guest experience total tests. Browser: Together mood changes home story and passes family/Together to planner; party4 filters out smaller rooms; Nov17–20 Family Residence room ₹66,000 + spa ₹9,600 = ₹75,600. Save confirmation and reload persistence verified. Reservation handoff retains family, start/end dates, guests4 and selected experience/package notes. Desktop screenshot confirms hero intro copy is separate from photo and no longer overlaps.

### Automotive inspection studio
TypeScript check passed. Full Node suite: 18/18 passed, including powertrain/cabin applicability, unique component IDs and finite/distinct camera poses for narrow/wide viewports. Browser verified model changes, Eon EV engine information, Terra third row, Sprint absence of rear seating controls, pinning infotainment details, model-detail routing and GPU-unavailable fallback. Browser WebGL is unavailable: actual rendering, surface raycast alignment and animation quality are not visually verified. `automotive-inspector-qa.jpg` shows fallback interface only.

### Ferrari replacement
19 tests pass, including real-car two-seat/powertrain data, finish variants without shared-catalogue mutation, mobile framing, rear-engine target and valid >300k-triangle GLB semantic parts. TypeScript passes. The actual Three GLTFLoader parsed the new asset (98 semantic mesh nodes; original 358,788 triangles) without a GPU. Original/adapted assets and attribution are local. Browser checks cover Ferrari labels, V8 specification card, two-seat cabin controls, finish changes retaining Interior mode, details/configuration and a truthful WebGL-unavailable fallback. Software-rendered geometry previews were inspected; they do not verify runtime shaders or motion. GPU verification remains unavailable here.

### Automotive Interactive showroom + Signature controls
22/22 Node tests pass; TypeScript passes. New meaningful tests cover strict combined matching/no matches, option-price arithmetic, zero and nonzero-rate payments, and rejecting malformed saved builds. Browser: model switch, live Eon option total ₹63,95,000, save/restore across navigation, model/configuration handoff to request form, empty state, three-car comparison cap, zero-rate payment, Essential separation and Signature next/reset controls preserving paint. Screenshot automotive-interactive-studio.jpg records the new builder. GPU-rendered animation remains unverified because cloud WebGL is unavailable.

### AURA Estates
TypeScript and full 26-test suite pass. New tests verify camera stations and clamping, finite continuous movement, crossings at actual doorway planes, avoiding major furniture/pool footprints, combined property matching and floor-area parsing. Browser verified floor-plan opening and Bedroom navigation, property selection updating sample data/viewing link, filter empty/reset and four-bedroom villa match, three-property comparison and cap, shared shortlist reflected on saved page, interactive bedroom details, and selected Loft passed to viewing form. Cloud GPU/WebGL remains unavailable, so actual 3D rendering, raycast alignment and motion quality are unverified. Essential uses the unchanged baseline; other categories were preserved.

### AURA licensed furniture upgrade
- 26 existing tests pass, including room route and expanded furniture footprints.
- TypeScript noEmit passes.
- Actual GLTFLoader geometry parse of both shipped GLBs succeeds; verifies positive bounds, normalized dimensions and >10 cm walking-route clearance around their fitted footprints. Textures are excluded only from this Node structural diagnostic, not from runtime rendering.
- Browser: Living navigation, licensed-material detail card and visible credits work; no route change on room details. This cloud browser has no WebGL, so final GPU/material appearance cannot be visually confirmed here. Do not treat the fallback UI screenshot as a 3D render proof.

### Complete AURA residence + mouse look
- 27 tests pass: finite/clamped camera path, continuous stair ascent, 360-degree look, pitch limits, direction, fixed camera location, orbit radius/floor safety and existing category tests.
- Actual GLTFLoader parses the 63-mesh prepared asset; embedded attribution and 24 self-contained textures verified.
- Guided route from living through bathroom has zero surface crossings at camera, chest and lower-body heights (1,000 route samples × 3 heights). Balcony sliding panel is in its runtime open position. Floor support checked: sampled eye height 1.39–2.29 m; five samples fall over the bounded gaps between the artist's open stair treads and are treated as the continuous stair ramp. No other unsupported samples.
- Browser confirms model credit, actual floor diagrams, room selections remaining on the same URL, detail cards and dollhouse controls. The GPU fallback is labelled as a static artist preview. WebGL unavailable in the cloud browser, so live drag/render output is not visually verified here. Offline actual-geometry software previews are stored separately and labelled.

### Hover feedback and enclosed arrival correction
32 tests pass, including repeated canvas→card pointer handoff, noisy raycast candidates, pinned card lifecycle, cleanup, facade-only finish selection and descending exterior entry. Existing model diagnostic now checks approach segment 0→1 as well as all interior segments: no camera/chest/lower-body surface crossings. Browser detail card remains present after moving/clicking onto its heading; navigation remains in the tour. WebGL canvas hover cannot be exercised in this cloud browser; controller timing and lifecycle are tested with a deterministic clock. A software source-geometry render confirms the full enclosed facade/roof and exact existing openings; this does not substitute for GPU visual QA.

## FORM and remaining-page completion
35 Node tests pass (finder intersection/empty state, saved edit validation, review validation/averages added). TypeScript passes. Browser verified FORM edit save/restore, Forest chair quantity 2 → shared bag ₹57,000 with free delivery, no-result finder/reset, three-object comparison cap/specifications, local 4-star review average/restoration, local concern history, Signature model switch/Craft notes and WebGL fallback. Work directory and services/process routes were inspected. All fifteen demo entry routes were opened; some lazy headings were absent from immediate snapshots, so this is an entry-route smoke check rather than exhaustive workflow coverage. Existing detailed AURA/Ferrari/resort/restaurant tests remain passing. Cloud Chrome cannot create WebGL: actual atelier shading, model visual quality, orbit and camera animation remain GPU-device QA limits. Original local seating GLBs have embedded textures with no external image dependencies. Screenshot `docs/form-interactive-complete.jpg` shows the interactive shop UI, not a 3D render.

## Studio final demo and pricing kit
37 tests pass, including estimate line-item separation and brief formatting; TypeScript passes. Production build passes (existing bundle-size/route-classification notices). Browser checks confirmed hotel estimator ₹1,99,999 + ₹75,000 assets + 2 × ₹12,500 visits = ₹2,99,999, category/service/estimate prefill after hydration, conditional asset/location fields, and a reviewable local enquiry with correct mailto address. No email was sent. Resources links point to all six packaged files. Browser download-event verification timed out; do not claim that check passed. The screenshot in docs records the resource page. All 35 slides and 15 PDF pages were rendered and visually inspected; PPTX package/layout/native-table/import checks passed, and PDF character bounds were checked. Cloud WebGL is unavailable, so the new resort sofa's live GPU appearance and all scene motion still need representative hardware QA. Existing camera tests remain unchanged and pass.
Final entry-route review opened all 15 editions. Dedicated hotel/property/commerce/automotive Interactive experiences were separately confirmed after lazy loading. AURA fallback retained its actual-model preview and room controls. Review found that resort fallback hid its only main heading; added a dedicated visible fallback heading. All six dist/client/downloads files match validated original bytes. The generic role-only heading probe is a smoke check, not proof of complete rendered scene quality.

## Contact contrast correction
Light contact surface now sets its own dark foreground, labels, input/select/textarea text, placeholders, options, caret, focus and autofill presentation. Browser computed styles: text rgb(28,48,38), field rgb(250,248,242), placeholder rgb(89,102,82) at opacity 1. Visually checked fields, select values, placeholders and focus ring; screenshot contact-contrast-fixed.jpg. Production build passes. CSS-only correction scoped to .contact-final.

## Mobile overlay/menu corrections and resort route
38 Node tests pass; TypeScript noEmit passes. Additional resort tests sample the front portal, suite corridor doorway and terrace glazing opening, assert a distant elevated ocean target and retain continuous finite motion through all four suites. The denser continuity sampling is 0.001 chapter units with a 20 cm maximum step, including the new longer exterior approach.
390×844 browser iframe QA: wall menu opens on the same restaurant route; details expand inline; food-card body scrolls to scrollTop 1327 (clientHeight 507 / scrollHeight 1835); Next changes Burrata to Risotto; Back restores list; second page shows remaining four dishes; Exit removes sheet. Resort options and suite selector open/close and chapter buttons work. AURA phone layout has compact caption, one-row chapter and tool controls, no mouse-only hint. Ferrari explicit part selection pins below canvas (detail top 511.75 > canvas bottom 298.47 at sampled scroll), with no card/canvas overlap. Found and corrected long automotive brand overflow.
This browser cannot render WebGL. These checks verify DOM/CSS controls and fallback, not live GPU model appearance or native Android touch behavior. No claim of photorealistic resort capture.

## Server enquiry preparation
43 Node tests pass. Five new enquiry tests use injected mock HTTP; no real Resend email or Turnstile challenge is sent. Verify missing configuration gives 503; public config omits secrets; malformed consent/fields/CRLF emails, foreign origins and >16 KB streamed bodies cannot call providers; invalid challenge/hostname/action cannot send; recipient is fixed and Reply-To matches visitor; stable provider key deduplicates identical retry payloads; provider failures never report acceptance. Actual inbox delivery is blocked by missing mail API key/sender verification and Turnstile configuration.
Browser verified form preparation using sample@example.com and sample text only; separated consent checkbox works independently from privacy link. Reviewed brief renders with explicit 'delivery is being configured' notice and mailto/copy/download alternatives. No direct-send button is exposed without configuration. Fixed UUID generation for non-secure local preview using Web Crypto getRandomValues when randomUUID is absent. TypeScript and production build pass. No inbox delivery test performed.
