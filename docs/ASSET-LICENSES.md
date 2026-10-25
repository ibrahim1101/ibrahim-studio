# Assets

Restaurant 3D geometry: original procedural source in app/scene.tsx. No third-party models.
Photography: externally loaded Unsplash images by photo ID in app/page.tsx and app/globals.css. Unsplash license https://unsplash.com/license . Attribution/photographer identification and production self-hosting audit remain before release. No ownership claim.
Fonts: DM Sans and Manrope from Google Fonts, with local system fallbacks. Audit and self-host font files for final production.
Three.js: MIT license; installed dependency 0.180.0.

Menu card illustrative Unsplash photography is identified by photo IDs in lib/restaurant/menu.ts, under the same Unsplash license. Cards explicitly label illustrative photography. Verify final exact dish assets before production.

All additional hotel/property/product/automotive photos are external Unsplash photo IDs in lib/collection/data.ts under the same license; illustrative assets do not establish actual product or property claims. Additional 3D geometry in app/collection/scene.tsx is original procedural source. No third-party model downloads. Production self-hosting/attribution audit remains.

## Stillwater photographic journey
Stillwater Signature now uses a cinematic composite of illustrative photographs, not a procedural model. The tour explicitly states that the spaces are from different locations. Existing arrival/bedroom/lounge photography is reused from the category catalogue. New sources verified as free Unsplash photos:
- Lobby: Brian Kairuz — https://unsplash.com/photos/spacious-modern-hotel-lobby-with-high-ceilings-and-lush-plants-IIU65YTvX54 (photo-1779965650586-68d17438e117)
- Corridor: Sam — https://unsplash.com/photos/modern-hotel-corridor-with-natural-light-and-minimalist-decor-NZk99Lcd8QA (photo-1755444918089-47647e5006e0)
- Bathroom: Illumination Marketing — https://unsplash.com/photos/a-bathroom-with-a-bathtub-sink-and-mirror-LbLSqPbnjRw (photo-1677553512940-f79af72efd1b)
No Google Photos account, private photos or unlicensed Google image results were accessed. Production venue needs a coherent commissioned photo/360 set.

Connected resort correction: the photographic journey has been removed from active tour rendering. Resort architecture, furniture, procedural PBR texture canvases and camera paths are original source in resort-scene.tsx and resort-tour.ts. Stock photos remain only in catalogue and suite-picker thumbnails. No real resort scan supplied or claimed.

Automotive inspection studio geometry is original procedural Three.js geometry. No third-party vehicle mesh or manufacturer specifications were imported. Existing illustrative Unsplash vehicle photos are used only in the labelled GPU fallback and existing catalogue. All Veloce performance/details are fictional concept data.

## Ferrari 458 Italia replacement
- Model: Ferrari 458 Italia by vicent091036, https://sketchfab.com/models/57bf6cc56931426e87494f554df1dab6
- Source distribution: https://github.com/mrdoob/three.js/blob/dev/examples/models/gltf/ferrari.glb
- CC BY 4.0, recorded in the upstream media inventory https://github.com/mrdoob/three.js/issues/23089 and credited in https://threejs.org/examples/webgl_materials_car.html.
- Original preserved in public/models/automotive/ferrari-458-original.glb. Adapted inspection GLB bakes transforms and segments the original 358,788 triangles. Modified PBR materials, curved coupe roof adaptation, rear-cover hinge, roof cutaway, illustrative V8/cooling assembly and derived software-rendered finish previews are identified in the visible credit and public/models/automotive/LICENSE.txt.
- Manufacturer data: https://www.ferrari.com/en-EN/auto/458-italia ; tyre reference https://www.ferrari.com/en-EN/auto/genuine/458-italia/summer-tires . CV remains CV; it is not relabelled as mechanical horsepower. All prices are demo estimates, not researched market prices.

## AURA spatial study
The connected home, furniture, planting, materials, floor-plan diagrams and fictional neighbourhood diagram are original procedural geometry/CSS/canvas textures. No scanned property, exact listing floor plan, third-party building mesh or map data was imported. Existing Unsplash listing photographs remain illustrative; they appear as clearly labelled fallback photography when WebGL is unavailable and in the finder catalogue. All property addresses, dimensions and prices remain fictional sample data.

## AURA detailed furniture upgrade
The lounge now loads locally hosted GlamVelvetSofa (Eric Chadwick / Wayfair 2021, CC BY 4.0) and SheenChair (Eric Chadwick / Wayfair 2020, CC0) from Khronos glTF Sample Assets. Sources and full attribution are in public/models/aura/LICENSE.txt, linked visibly in the tour. Meshes, UVs, normal/AO maps and sheen/specular materials are preserved, with runtime placement/scaling and source studio lights disabled. Sofa: 4,196 indexed triangles; chair: 39,936. Combined download about 7 MiB. Architecture, kitchen, bedroom, bathroom, terrace and other furniture remain procedural concepts; this is not a complete artist-authored building or a property scan. This entry supersedes the earlier claim that every furnishing is original geometry.

## Complete AURA residence replacement (supersedes the prior furniture-only upgrade)
The active AURA 3D scene now uses the entire "VR Apartment" by FDU_oficial, CC BY 4.0, as recorded in the original GLB's asset.extras and the creator's public Sketchfab API response. Source https://sketchfab.com/3d-models/vr-apartment-fb1b717d457540129c6bf45315aa2612 ; licensed distribution https://huggingface.co/datasets/allenai/objaverse/resolve/main/glbs/000-139/fb1b717d457540129c6bf45315aa2612.glb . Original in assets/source/aura/vr-apartment.glb; prepared self-contained runtime model in public/models/aura/residence.glb. City backdrop omitted, transforms baked, a balcony panel split for sliding, original residence geometry/UVs and all 24 embedded textures retained. 63 runtime meshes, 76,854 triangles, approximately 15 MB. The author's source thumbnail is the static GPU fallback, credited visibly. Floor diagrams are derived from actual geometry. No original procedural room shell or separately added sofa/chair is active now.

ReplicaCAD was investigated but NOT included: its landing page advertised CC BY while the actual downloaded license says CC BY-NC. No ReplicaCAD files or other rejected candidates are shipped. The source VR Apartment is an architectural visualization, not a real listing scan; the UI states this clearly. All original copyright and source attribution are in the visible model license link.

Exterior correction: runtime separates outward-facing triangles of the original shell for a daylight stone finish (the original exterior baked maps are black/unlit). No vertices, dimensions, roof, openings or room layouts are changed; inward-facing authored finishes are preserved. Closed-shell view is now the normal walk/arrival mode; cutaways are explicitly limited to Dollhouse.

## FORM material atelier
The FORM Signature home and chair-detail atelier now actively use the preserved SheenChair (CC0) and GlamVelvetSofa (CC BY 4.0) assets listed above. Original geometry and textured glTF materials are retained, with uniform centering/scaling, studio illumination, environment lighting and orbit/view controls. Visible credit and license link are provided. These independent artist studies are explicitly not exact meshes of the fictional commerce catalogue. Other object-detail 3D studies remain labelled procedural concepts. No new external asset downloads or dependencies were added.

## Stillwater sofa upgrade
The conceptual connected resort now loads GlamVelvetSofa (Eric Chadwick / Wayfair 2021, CC BY 4.0) once and shares its original textured geometry/materials across lobby, suite and terrace sofa placements. Uniform normalization stays within the original sofa footprint. Procedural fallback sofas remain visible if loading fails. Visible credits link to the existing license file. Architecture and room camera routes are unchanged. Artist source lights are disabled; existing resort lighting is used. No claim that the whole resort is scanned or photorealistic is made.
