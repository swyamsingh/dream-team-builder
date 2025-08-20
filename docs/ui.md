````markdown
# UI & Animation Guidelines

## Principles
1. Motion should clarify, not distract.
2. Prefer transform + opacity for GPU acceleration.
3. Disable or limit motion for large lists / reduced-motion users.

## Implemented
| Component | Animation |
|-----------|-----------|
| PersonCard | Hover scale, staged fade/slide for first 12 items |
| ProfileDrawer | Slide-in (spring) + tab content fade/slide |
| Radar | One-time scale + stroke draw |
| Strength Bars | Width transition on first mount |
| Compare Panel | Expand/collapse fade/slide |
| Toast | Slide in/out (spring) |

## Performance Guards
- Stagger limited to initial 12 items.
- One-time animations guarded with refs.
- No continuous looping animations.

## Adding New Animations
1. Consider `prefers-reduced-motion` media query.
2. Use `motion.div` only around elements that need it.
3. Avoid animating layout properties (width/height) directly; measure & transform if needed.

## Reduced Motion Hook (Future)
```ts
export function useReducedMotionPref() {
  const [pref, setPref] = useState(false);
  useEffect(()=>{
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const l = () => setPref(mq.matches);
    l(); mq.addEventListener('change', l); return ()=>mq.removeEventListener('change', l);
  },[]);
  return pref;
}
```

Use to early-return static variants.
````
