# DepthForge

> **Transform 2D images into interactive 3D relief models entirely in your browser.**  
> Zero server uploads, zero external APIs, zero backend. 100% private and client-side.

---

## 🎨 Overview & Design

DepthForge is built with a warm glassmorphic design system featuring frosted glass surfaces, subtle backdrops, and responsive touch/mouse controls.

- **Client-Side AI Depth Estimation:** Powered by `@huggingface/transformers` running the `Xenova/depth-anything-small-hf` model inside a dedicated Web Worker.
- **3D Procedural Mesh Generation:** Pure function mesh displacement pipeline mapping depth heightmaps onto 3D geometries with solid-body bevels and custom textures.
- **Local Storage:** Models, textures, and depth maps are preserved offline in IndexedDB via `idb`.
- **Exports:** Direct browser downloads of `.glb` (GLTF binary), `.obj`, and `.png` snapshots.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## 🧭 Routes

- `/` — **Landing Page:** Hero banner, live auto-rotating procedural 3D relief demo, how-it-works guide, feature grid, and limitations.
- `/convert` — **Converter Studio:** 3D viewport with OrbitControls (70% desktop / top 55vh mobile) + scrollable controls panel / mobile bottom sheet.
- `/library` — **My Models:** Responsive grid of locally saved 3D models with search, sorting, renaming, and exports.
- `/model/:id` — **Model Detail:** Inspect, interact, rotate, rename, export, or reload a saved model back into the studio.
- `/about` — **About & Privacy:** Depth-based relief guide, photography tips, privacy guarantee, and technical specs.

---

## 🖐️ Interaction & Controls

- **Desktop (Mouse):**
  - Left click + drag: Rotate model
  - Scroll wheel: Zoom in/out
  - Right click + drag: Pan
  - Double-click: Reset camera frame
- **Mobile (Touch):**
  - Single finger drag: Rotate
  - Pinch: Zoom
  - Two finger drag: Pan
  - Double-tap: Reset camera frame

