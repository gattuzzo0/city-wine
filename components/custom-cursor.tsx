'use client'
import { useEffect, useState } from 'react'
export function CustomCursor() { const [p, setP] = useState({ x: -20, y: -20 }); useEffect(() => { const move = (e: MouseEvent) => setP({ x: e.clientX, y: e.clientY }); window.addEventListener('mousemove', move); return () => window.removeEventListener('mousemove', move) }, []); return <span aria-hidden className="cursor-dot" style={{ transform: `translate(${p.x}px, ${p.y}px)` }} /> }
