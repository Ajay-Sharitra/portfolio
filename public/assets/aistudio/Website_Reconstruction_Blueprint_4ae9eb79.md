# Interactive Portfolio — Reverse Engineering and Reconstruction Blueprint

## Evidence and limitations
Source archive: `Testing IDM Grabber.zip`. Inspected `herasymenkox_default.html` (3,829 bytes), `style.css` (1,062 lines), `main.js` (984 lines), `transition.js`, `gsap.min.js`, favicon, noise texture, and three WOFF2 fonts. The archive is incomplete: imported modules (`clock.js`, `config.js`, `data.js`, `gallery.js`, `gl.js`, `orbit.js`, `preloader.js`, `scroll.js`, `work.js`, etc.), Three.js, and project image/video assets are absent. Thus the original site cannot run as supplied, and shader details, exact project data, sounds, and complete motion cannot be verified. Do not claim a pixel-perfect replica without original media and a working reference.

## Design specification
- Fullscreen, fixed-height dark presentation with `html, body {height:100%; overflow:hidden; background:#0b0b0b}` on desktop.
- Primary accent `#cee49f`; translucent accent `rgba(206,228,159,.12)`; high-contrast overlay labels use `mix-blend-mode:difference`.
- Typography: `PP Neue Montreal` Bold for uppercase UI and titles, `PP Neue Montreal Mono` Medium for labels/numbers, `FH Phemister` Light for display elements where applicable. Use properly licensed fonts or metrically similar alternatives. Source files must not be redistributed without rights.
- Responsive scaling based on `--design-width:1440; --container:clamp(1440px,100vw,2560px); --px:calc(var(--container)/var(--design-width))`; mobile <=600px uses `--design-width:375; --container:100vw`.
- Fixed top-left identity, centered top pill navigation (`Work (05)`, `Profile`, `Connect`), top-right three-mode switch (`01 || 02 || 03`), bottom-left live timezone clock, bottom-center project stepper and ruler, bottom-right copyright.
- UI pills: mono uppercase, subtle green translucent fill, lime active/hover, very small corner radii. Desktop menu pills width `120 * --px`, height `16 * --px`, gap `4 * --px`.
- Two fullscreen canvases: `[data-gl]` for project media and `[data-orbit]` for orbit scene. Layer dynamic title/meta DOM over canvases.
- Mobile: move nav to bottom; hide orbit mode, bottom clock/copyright, ruler, stepper, custom cursor, work progress; project detail becomes vertically scrollable.

## Required routes and content
1. `/` Work landing: five featured projects, each with title lines, category/year metadata, image or muted looping video, detailed case-study content and optional outbound URL.
2. `/profile`: biography, services/capabilities, tools, experience, CV link, profile image.
3. `/connect`: contact email, social links, availability, accessible contact CTA.
4. Case-study overlay/page: large title, hero cover, additional project images, overview, role, services, year, tools, external link, close button, scroll progress.
5. 404 page with return link.

## Interaction and animation specification
- On first visit, show fullscreen preloader with percentage and background; preload critical media; remove or skip on eligible internal navigations. Provide timeout/fallback.
- Initial title/meta reveal: `gsap.fromTo(...,{yPercent:140},{yPercent:0,duration:1.5,ease:'expo.out',stagger:.04-.05})`.
- Exit text: `yPercent:-110`, duration `.7s`, custom easing. Enter next project: `yPercent:110 -> 0`, duration `1.4s`, stagger `.04-.05`, delay `.8s`.
- Cursor: `gsap.quickTo` for x/y; scale from 0 to 1 on interactive media; label `VIEW CASE`; hide on mobile and reduced motion.
- Slider mode: one featured project at a time; wheel, touch, keyboard navigation; debounced/inertial scrolling; update stepper/ruler/title/media together; wrap project index modulo count.
- Gallery mode: show several cards; draggable horizontal gallery; interpolate from fullscreen project to card geometry and back; preserve active index.
- Orbit mode: desktop-only 3D/card constellation; lazy-load rendering module; animated morph from gallery or slider and reverse morph; hover picking and click-to-open; graceful WebGL fallback.
- Project case study: animated overlay entry and exit, accessible close/escape/back, media lazy loading and scroll progress.
- Internal route transition: overlay veil fade out `0.4s`, navigate, fade in `1s` with `power2.out`; skip for external links, modified clicks, and reduced-motion users; respect browser back/forward.
- Optional sound effects must be muted by default and user-activated.
- All animations must have teardown/cleanup and must not cause memory leaks.

## Recommended implementation architecture
Use Vite + TypeScript + React for DOM and application state, GSAP for timelines, Three.js for WebGL. Do not rely on ScrollTrigger for the main fixed-screen slider unless it adds value; use a dedicated wheel/touch controller. React Router for `/profile` and `/connect`. Alternative: vanilla JS modules if closer to original architecture.

```
src/
  app/App.tsx
  data/projects.ts
  components/SiteShell.tsx
  components/Navigation.tsx
  components/ViewSwitcher.tsx
  components/Clock.tsx
  components/Stepper.tsx
  components/Ruler.tsx
  components/Preloader.tsx
  components/CustomCursor.tsx
  components/ProjectTitle.tsx
  components/ProjectOverlay.tsx
  views/SliderView.tsx
  views/GalleryView.tsx
  views/OrbitView.tsx
  graphics/WebGLRenderer.ts
  graphics/MediaTransitionShader.ts
  animations/timelines.ts
  hooks/useSlideController.ts
  hooks/useReducedMotion.ts
  styles/tokens.css
  styles/layout.css
  styles/responsive.css
public/assets/projects/...
public/assets/textures/distortion-noise.jpg
```

## Project data schema
```
type Project = {
 id: string; slug: string; titleLines: string[]; category: string;
 year: string; services: string[]; role: string; tools: string[];
 summary: string; overview: string; cover: string;
 media: Array<{src:string; type:'image'|'video'; alt:string}>;
 externalUrl?: string;
 layout?: {title:number; meta:number}; zoom?:number;
};
```
Use five editable entries, no hardcoded sample client claims. A separate site configuration holds name, location/timezone, social links, availability, and email.

## Implementation milestones
1. Recreate typography, fixed positioning, pills, title masking and mobile breakpoints.
2. Build data-driven slider with keyboard/wheel/touch, pagination and titles.
3. Build image/video WebGL texture rendering and distortion transition with fallback to CSS.
4. Add gallery cards and zoom/morph transitions.
5. Add orbit scene and desktop pointer interactions.
6. Add project detail, profile, connect and route veil.
7. Add preloader, audio opt-in, loading failures, accessibility and performance tuning.
8. Test Chrome, Firefox, Safari, iOS and Android; audit keyboard navigation, reduced motion, WebGL disabled, media failure, memory use and layout overflow.

## Acceptance criteria
- Five projects render from data without editing view code.
- Slider, gallery and orbit preserve the selected project during switches.
- Every case study opens/closes correctly; links and routes work.
- Mobile has no orbit controls, is touch-friendly and scrolls case-study content.
- No broken asset imports, 404s or console errors.
- First load and internal navigation behave differently as designed.
- Reduced-motion preference removes large transforms and 3D motion while preserving content.
- Asset preloading is bounded and page remains usable on failure.
- GPU memory, event listeners and GSAP timelines are cleaned up.

## Master prompt for AI coding agent
You are a senior creative frontend engineer specializing in award-winning interactive portfolio websites, GSAP, Three.js/WebGL, TypeScript, responsive design and accessible UI. Build a complete, production-ready PERSONAL portfolio website using the attached reverse-engineering blueprint and source ZIP as a reference. This is a reimplementation for my own identity and projects, not a republishing of the original designer's branding or work.

DESIGN: Match the supplied reference's design language closely: fullscreen near-black `#0b0b0b` backdrop, pale lime `#cee49f`, fixed overlay navigation and corner metadata, tiny uppercase pill labels, bold editorial project typography, masking and clipping for text reveals, difference-blend labels, numbered mode selector, progress stepper/ruler and custom cursor. Use legally licensed font assets if supplied; otherwise choose suitable alternatives. Build precise mobile layout using the 600px breakpoint as a starting point.

FUNCTIONALITY: Implement 3 portfolio modes: (01) immersive slider, (02) multi-card draggable gallery, (03) desktop-only interactive 3D orbit. Transition between modes with coherent geometry-based morphs, not abrupt unmounts. Use GSAP for intro, staggered masked text, project navigation, gallery zoom, hover, cursor and page veil. Use Three.js and shaders for image/video rendering and subtle displacement texture effects; implement a robust CSS fallback if WebGL is unavailable. Honor reduced motion.

PAGES: Work homepage with 5 configurable projects; Profile; Connect; rich project detail with image gallery, overview, role, services, tools, year and outbound links. Add accessible close/back, navigation, keyboard/touch support, lazy loading and progress UI. Add a timezone-aware clock, copyright, optional muted-by-default sounds and first-visit preloader with timeout.

ARCHITECTURE: Vite + React + TypeScript, GSAP, Three.js and React Router. Organize files into data, components, views, graphics, animations, hooks and styles. Keep content in typed config, not embedded in components. All assets use local relative paths. Include package.json, full source, styles, asset manifest, setup README and deployment instructions. Do not leave placeholder function bodies, non-working controls, or undefined imports.

SOURCE INSPECTION: Read the supplied HTML/CSS/JS carefully. Source ZIP is incomplete: it lacks `data.js`, `gallery.js`, `gl.js`, `orbit.js`, `scroll.js`, `work.js` and other imports. Reconstruct their behavior; do not claim they are available or simply import them. If exact shader or orbit behavior cannot be recovered, implement an original equivalent and document the difference. Use my own project images and copy, not the original portfolio's copyrighted media.

MOTION TARGETS: Intro `yPercent:140 -> 0`, `1.5s`, `expo.out`, stagger `.04-.05`; text exit `-110%` in `.7s`; text enter `110% -> 0` in `1.4s`, delay `.8s`; page veil `.4s` out and `1s` in. Make timings configurable. Smooth interactions should not block user input indefinitely.

DELIVERY: First output a concise architecture and asset checklist. Then implement the working site file by file, including all code. Run build/typecheck/lint and fix errors. Provide screenshots or a testing procedure for desktop and mobile. Do not stop after a static mockup. Completion means the site works end-to-end with all three presentation modes, case studies, responsive behavior, accessibility and graceful failure handling.

PERSONALIZATION: Ask for my preferred name/brand, short role description, 5 project entries with images, about copy, email/socials, city/timezone, and font licensing if these are not supplied. Use clearly marked editable sample data meanwhile.
