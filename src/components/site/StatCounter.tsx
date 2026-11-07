'use client'

import { useEffect, useRef, useState } from 'react'
import { useLang } from '@/content'

/**
 * Animated number counter — counts up when scrolled into view.
 * Re-animates when the language changes so digits switch bn/en smoothly.
 */
export default function StatCounter({ target }: { target: number }) {
  const { dig, lang } = useLang()
  const ref = useRef<HTMLSpanElement>(null)
  const [val, setVal] = useState(target)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let raf = 0
    let started = false

    const animate = () => {
      const dur = 1300
      const t0 = performance.now()
      const tick = (t: number) => {
        const p = Math.min((t - t0) / dur, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setVal(Math.round(target * eased))
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }

    if (!('IntersectionObserver' in window)) {
      // very old browser: keep the final value (initial state) — nothing to animate
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started) {
            started = true
            animate()
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.5 }
    )
    io.observe(el)

    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [target, lang])

  return (
    <span ref={ref} data-count={target}>
      {dig(val)}
    </span>
  )
}
