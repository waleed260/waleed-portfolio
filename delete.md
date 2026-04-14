# Deleted Code Archive

This file contains all code that was removed during cleanup. Nothing was changed visually — only dead/unused code was deleted.

---

## 1. LaserFlowShowcase Component (App.jsx — ~120 lines, NEVER RENDERED)

```jsx
/* ──────────── LightRays Showcase Section ──────────── */
function LaserFlowShowcase() {
  const [ref, vis] = useInView()
  const revealRef = useRef(null)
  const [mousePos, setMousePos] = useState({ x: -9999, y: -9999 })

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setMousePos({ x, y: y + rect.height * 0.5 })
    if (revealRef.current) {
      revealRef.current.style.setProperty('--mx', `${x}px`)
      revealRef.current.style.setProperty('--my', `${y + rect.height * 0.5}px`)
    }
  }

  const handleMouseLeave = () => {
    setMousePos({ x: -9999, y: -9999 })
    if (revealRef.current) {
      revealRef.current.style.setProperty('--mx', '-9999px')
      revealRef.current.style.setProperty('--my', '-9999px')
    }
  }

  return (
    <Section id="interactive">
      <div className="section-inner" ref={ref}>
        <p className="section-label">Interactive 3D</p>
        <h2 className="section-heading">Experience the <span className="gradient-text">LightRays</span> effect</h2>
        <div className={`laserflow-showcase ${vis ? 'in-view' : ''}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ position: 'relative', height: '400px', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}
        >
          <LightRays
            raysOrigin="top-center"
            raysColor="#ffffff"
            raysSpeed={0.8}
            lightSpread={0.5}
            rayLength={3}
            followMouse={true}
            mouseInfluence={0.2}
            noiseAmount={0}
            distortion={0}
            pulsating={true}
            fadeDistance={1.2}
            saturation={1.0}
          />
          <div
            ref={revealRef}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 5,
              pointerEvents: 'none',
              '--mx': '-9999px',
              '--my': '-9999px',
              WebkitMaskImage: 'radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 60px, rgba(255,255,255,0.6) 120px, rgba(255,255,255,0.25) 180px, rgba(255,255,255,0) 240px)',
              maskImage: 'radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 60px, rgba(255,255,255,0.6) 120px, rgba(255,255,255,0.25) 180px, rgba(255,255,255,0) 240px)',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(200,200,200,0.1), rgba(255,255,255,0.1))',
              mixBlendMode: 'screen',
            }}
          />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '86%',
            height: '60%',
            backgroundColor: 'rgba(6, 0, 16, 0.85)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '2px solid rgba(255,255,255,0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            zIndex: 6,
            padding: '1.5rem',
            boxShadow: '0 0 40px rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', textAlign: 'center' }}>
              <span className="gradient-text">Move your mouse</span> to reveal
            </h3>
            <p style={{ fontSize: '1.125rem', color: '#9a96b0', textAlign: 'center', maxWidth: '600px' }}>
              Interactive LightRays reveal effect with radial mask. The hidden layer appears as you hover, creating a futuristic reveal animation.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '0.875rem', color: '#ffffff' }}>WebGL Shader</div>
              <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '0.875rem', color: '#ffffff' }}>OGL</div>
              <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '0.875rem', color: '#ffffff' }}>React</div>
            </div>
          </div>
          <div style={{
            position: 'absolute',
            left: mousePos.x - 20,
            top: mousePos.y - 20,
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '2px solid #ffffff',
            boxShadow: '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.25)',
            pointerEvents: 'none',
            zIndex: 10,
            opacity: mousePos.x > 0 ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }} />
        </div>
      </div>
    </Section>
  )
}
```

**Reason:** Defined but never rendered in App(). Dead code.

---

## 2. Unused Imports Removed

### `useCallback` — Never used anywhere in App.jsx
### `Suspense` — Robot3D is synchronous, no React.lazy() used

---

## 3. Duplicate CSS Rules Removed

### .hero-visual (duplicate at line ~338)
```css
/* Duplicate of lines 218-227 — removed */
.hero-visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
```

### .glow-divider (duplicate at line ~2046)
```css
/* Duplicate — removed */
.glow-divider {
  height: 2px;
  background: linear-gradient(90deg, transparent, #00e5ff, #a855f7, #f472b6, transparent);
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.5), 0 0 40px rgba(168, 85, 247, 0.3);
  animation: dividerGlow 3s ease-in-out infinite;
}
@keyframes dividerGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(0, 229, 255, 0.5), 0 0 40px rgba(168, 85, 247, 0.3); }
  50% { box-shadow: 0 0 30px rgba(0, 229, 255, 0.8), 0 0 60px rgba(168, 85, 247, 0.5); }
}
```

### .collab-area (duplicate at line ~2219 — conflicting with 1894)
```css
/* Duplicate with conflicting values — removed */
.collab-area {
  display: inline-flex;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  font-size: 0.85rem;
}
```

### .collab-area duplicate (line ~1894 area — consolidated)

### @media (prefers-reduced-motion: reduce) duplicate block
```css
/* Duplicate media query block — removed */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; ... }
}
```

### Unused CSS Classes (defined in CSS, never used in JSX)
```css
.hero-name { ... }
.techstack-logos { ... }
.tech-logo-card { ... }
.techstack-grid { ... }
.techstack-group { ... }
.glassmorphism { ... }
.gradient-animate { ... }
.gpu-accelerated { ... }
.contact-form input, .contact-form textarea { ... }
.nav-links a::after { ... } /* conflicts with .nav-link-3d::after */
.laserflow-showcase { ... } /* only used in dead LaserFlowShowcase component */
```

### .section duplicate definitions (6 → consolidated to 1)
### .section-inner duplicate definitions (4 → consolidated to 1)
### .navbar duplicate definitions (4 → consolidated to 1)
### .nav-links duplicate definitions (3 → consolidated to 1)
### .btn duplicate definitions (3 → consolidated to 1)
### .scroll-indicator duplicate definitions (3 → consolidated to 1)
### .skill-group duplicate definitions (5+ → consolidated)

---

## 4. Dead/Unused Files (not deleted from project, but not imported)

- `/src/LaserFlow.jsx` — Replaced by LightRays, never imported
- `/src/LaserFlow.css` — Accompanying styles, never imported
- `/src/data/index.js` — Exports skillsData, projectsData, timelineData, collabAreas — never imported (data duplicated inline in App.jsx)
- `/src/hooks/index.js` — Exports useInView, useMouseParallax, useScrollProgress — never imported (hooks duplicated inline in App.jsx)

---

## 5. Unused npm Dependencies (in package.json, never imported)

- `react-router-dom` — No routing used, all anchor-based navigation
- `@iconify/react` — All icons are inline SVGs
- `lucide-react` — All icons are inline SVGs

---

## Summary

| Category | Lines/Items Removed |
|----------|-------------------|
| LaserFlowShowcase component | ~120 lines |
| Unused imports | 2 items |
| Duplicate CSS rules | ~15 rules |
| Unused CSS class definitions | ~10 classes |
| **Total code reduction** | **~200+ lines** |

---

## 6. Spacing Adjustments (Hero to Toolkit gap reduced)

### Original values (too much spacing):

```css
/* Hero section - line ~190 */
.hero-section {
  padding: 6rem 2rem 4rem; /* 4rem bottom padding */
}

/* Tablet - line ~484 */
.hero-section {
  padding: 5rem 1rem 3rem;
}

/* Mobile - line ~681 */
.hero-section {
  padding: 4rem 0.75rem 2rem;
}

/* Section spacing - line ~1593 */
.section {
  padding: 3rem 0; /* 3rem top + 3rem bottom = 6rem */
}

/* GlowDivider - line ~1596 */
.glow-divider {
  margin: 1.5rem 2rem; /* 1.5rem top + bottom */
}
```

**Total gap from Hero to Toolkit: ~10rem (way too much)**

### New values (tighter spacing):

```css
.hero-section {
  padding: 6rem 2rem 2rem; /* Reduced from 4rem to 2rem */
}

/* Tablet */
.hero-section {
  padding: 5rem 1rem 1.5rem; /* Reduced from 3rem to 1.5rem */
}

/* Mobile */
.hero-section {
  padding: 4rem 0.75rem 1rem; /* Reduced from 2rem to 1rem */
}

.section {
  padding: 1.5rem 0; /* Reduced from 3rem to 1.5rem */
}

.glow-divider {
  margin: 1rem 2rem; /* Reduced from 1.5rem to 1rem */
}
```

**New total gap: ~5rem (much tighter and cleaner)**

**Reason:** The gap between Hero intro and Toolkit section was too large (~10rem). Reduced spacing by ~50% for a more compact, professional layout.
