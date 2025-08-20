"use client";
import React from 'react';
import { motion } from 'framer-motion';

interface Point { label: string; value: number }
interface RadarProps { data: Point[]; max?: number; size?: number }

export const Radar: React.FC<RadarProps> = ({ data, max, size=200 }) => {
  if (!data.length) return null;
  const hasAnimated = React.useRef(false);
  const m = max || Math.max(...data.map(d=>d.value), 1);
  const radius = size/2 - 18;
  const center = { x: size/2, y: size/2 };
  const angleStep = (Math.PI*2)/data.length;
  function coord(i: number, v: number) {
    const angle = -Math.PI/2 + i*angleStep;
    return { x: center.x + Math.cos(angle)*radius*(v/m), y: center.y + Math.sin(angle)*radius*(v/m) };
  }
  const points = data.map((d,i)=>coord(i,d.value));
  const path = points.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
  return (
    <svg width={size} height={size} className="text-xs">
      <defs>
        <linearGradient id="radarFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--color-brand-primary))" stopOpacity={0.5} />
          <stop offset="100%" stopColor="hsl(var(--color-brand-accent))" stopOpacity={0.2} />
        </linearGradient>
      </defs>
      {[1,0.75,0.5,0.25].map((f,i)=> (
        <circle key={i} cx={center.x} cy={center.y} r={radius*f} fill="none" stroke="currentColor" strokeOpacity={0.15} />
      ))}
      {data.map((d,i)=>{
        const c = coord(i,m);
        return <line key={d.label} x1={center.x} y1={center.y} x2={c.x} y2={c.y} stroke="currentColor" strokeOpacity={0.12} />;
      })}
      <motion.g initial={hasAnimated.current? false : { scale: 0.9, opacity: 0 }} animate={hasAnimated.current? { } : { scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} onAnimationComplete={()=>{ hasAnimated.current = true; }}>
        <motion.path d={path} fill="url(#radarFill)" stroke="hsl(var(--color-brand-primary))" strokeWidth={1.5}
          initial={hasAnimated.current? false : { pathLength: 0 }} animate={hasAnimated.current? { pathLength: 1 } : { pathLength: 1 }} transition={{ duration: 0.8, ease: 'easeOut' }} />
        {data.map((d,i)=>{
          const p = coord(i,d.value);
          return <g key={d.label}> <circle cx={p.x} cy={p.y} r={3} fill="hsl(var(--color-brand-primary))" /> <text x={p.x} y={p.y-6} textAnchor="middle" className="fill-current opacity-80" fontSize={10}>{d.label}</text> </g>;
        })}
      </motion.g>
    </svg>
  );
};

export default Radar;
