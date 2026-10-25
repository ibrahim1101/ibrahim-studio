# Complete residence evidence

The images in this directory are offline software rasterizations of the actual prepared residence GLB and its embedded baked textures, at the tour's room camera poses and dollhouse floor cuts. They confirm room placement and source geometry; they are **not WebGL screenshots or GPU material-quality verification**. Simple software rendering omits transparent glazing and uses nearest texture sampling. No generated or stock-photo room image is substituted for geometry.

The model is VR Apartment by FDU_oficial, CC BY 4.0; see public/models/aura/LICENSE.txt. The visible browser fallback is the author's static preview, explicitly labelled. The full 3D experience requires WebGL.

Preparation is reproducible with `node scripts/prepare-aura-residence.mjs` from assets/source/aura/vr-apartment.glb. Geometry, three camera/body-height ray checks, floor support and open-riser gap bounds are verified with `node --experimental-strip-types scripts/inspect-aura-assets.mjs`.
