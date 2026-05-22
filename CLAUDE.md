# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

## Architecture

This is a React 19 + Vite portfolio site with custom WebGL/Canvas visual effects.

### Key Technologies
- **React 19.2.4** with hooks (useRef, useEffect, useMemo, useState)
- **Vite 8.0.4** as build tool
- **Three.js** for WebGL effects (LaserFlow, LightRays)
- **OGL** for lightweight WebGL rendering
- **GSAP** for complex animations
- **React Router DOM** for navigation

### Project Structure
```
src/
├── components/
│   ├── Robot3D.jsx          # Animated 3D robot companion
│   ├── sections/            # Page sections (empty - sections in App.jsx)
│   └── layout/              # Layout components (empty)
├── data/
│   └── index.js             # Shared data (skills, timeline, collab areas)
├── hooks/                   # Custom hooks
├── App.jsx                  # Main app with all sections
├── main.jsx                 # Entry point
├── LaserFlow.jsx            # WebGL particle flow effect
├── LightRays.jsx            # WebGL light rays effect
├── MagicBento.jsx           # Bento card grid with particles
├── Robot3D.jsx              # 3D robot component
└── *.css                    # Theme and effect styles
```

### Custom Hooks (App.jsx)
- `useInView(threshold)` - Detect element visibility for scroll animations
- `useMouseParallax(strength)` - Mouse position for parallax effects
- `Cursor` - Custom cursor with hover states (disabled on mobile)
- `Particles` - Canvas-based particle system with connecting lines
- `FloatingOrbs` - Parallax background orbs

### Visual Effects
- **LaserFlow**: Fragment shader-based particle flow with mouse interaction
- **LightRays**: OGL-based light ray effect with pulsating animation
- **MagicBento**: Bento grid with particle effects, spotlight, and tilt
- **Robot3D**: CSS 3D robot that changes emotion based on scroll position

### Styling Approach
- CSS custom properties in `:root` for colors, spacing, animations
- Mobile-first responsive design in `mobile-fixes.css`
- Separate CSS files for each major effect
- Glassmorphism and neon aesthetics with cyan/emerald/pink accents

### Mobile Handling
- Mobile detection via `window.innerWidth <= 768`
- Animations disabled on mobile in interactive components
- Different grid layouts (1 column on mobile, 2-4 on desktop)
- Touch target sizing (min 44px)
