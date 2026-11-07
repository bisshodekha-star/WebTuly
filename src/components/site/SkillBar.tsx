'use client'

import { useEffect, useRef, useState } from 'react'

/** Skill progress bar — fills to the target level when scrolled into view. */
export default function SkillBar({ name, level }: { name: string; level: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (!('IntersectionObserver' in window)) {
      // very old browser: show the full bar without animation (async to avoid cascading render)
      const id = requestAnimationFrame(() => setWidth(level))
      return () => cancelAnimationFrame(id)
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setWidth(level)
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [level])

  return (
    <div className="skill">
      <div className="row">
        <span>{name}</span>
        <span className="pct">{level}%</span>
      </div>
      <div className="track">
        <div ref={ref} className="fill" data-level={level} style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}
