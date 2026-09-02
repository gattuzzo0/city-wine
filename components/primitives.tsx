'use client'
import { motion } from 'framer-motion'
export function Eyebrow({ children }: { children: React.ReactNode }) { return <p className="eyebrow">{children}</p> }
export function WordReveal({ children, play = true }: { children: string; play?: boolean }) { return <motion.span initial="hidden" animate={play ? 'show' : 'hidden'} variants={{ show: { transition: { staggerChildren: .06 } } }}>{children.split(' ').map((word, i) => <motion.span className="inline-block mr-[.22em]" key={`${word}-${i}`} variants={{ hidden: { y: '100%', opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: .65 } } }}>{word}</motion.span>)}</motion.span> }
export function MagneticButton({ children, dark = false, onClick }: { children: React.ReactNode; dark?: boolean; onClick?: () => void }) { return <button onClick={onClick} className={`magnetic ${dark ? 'magnetic-dark' : ''}`}>{children}</button> }
