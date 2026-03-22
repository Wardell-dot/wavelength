import { useRef } from 'react'

function ScrollRow({ children }) {
  const ref = useRef(null)

  const scroll = (dir) => {
    if (ref.current) {
      ref.current.scrollBy({ left: dir * 500, behavior: 'smooth' })
    }
  }

  return (
    <div className="scroll-row-wrap">
      <button className="scroll-btn scroll-btn--left" onClick={() => scroll(-1)} aria-label="Scroll left">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <div className="genre-row-scroll" ref={ref}>
        {children}
      </div>
      <button className="scroll-btn scroll-btn--right" onClick={() => scroll(1)} aria-label="Scroll right">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>
  )
}

export default ScrollRow