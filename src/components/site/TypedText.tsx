'use client'

import { useEffect, useState } from 'react'

/** Typewriter effect for the hero phrases — restarts when the language changes. */
export default function TypedText({ phrases }: { phrases: string[] }) {
  const safe = phrases.length ? phrases : ['Web Developer']
  const [text, setText] = useState(safe[0])

  useEffect(() => {
    setText(safe[0])
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let pi = 0
    let ci = safe[0].length
    let deleting = false
    let timer: ReturnType<typeof setTimeout>

    const type = () => {
      const word = safe[pi]
      setText(word.slice(0, ci))

      if (!deleting && ci < word.length) {
        ci++
        timer = setTimeout(type, 75)
      } else if (deleting && ci > 0) {
        ci--
        timer = setTimeout(type, 40)
      } else if (!deleting) {
        deleting = true
        timer = setTimeout(type, 1700)
      } else {
        deleting = false
        pi = (pi + 1) % safe.length
        timer = setTimeout(type, 350)
      }
    }

    type()
    return () => clearTimeout(timer)
  }, [safe.join('|')])

  return (
    <>
      <span className="typed">{text}</span>
      <span className="cursor" />
    </>
  )
}
