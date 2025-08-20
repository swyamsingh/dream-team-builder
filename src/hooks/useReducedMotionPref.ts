"use client";
import { useEffect, useState } from 'react';

export function useReducedMotionPref() {
  const [pref, setPref] = useState(false);
  useEffect(()=>{
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPref(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  },[]);
  return pref;
}
