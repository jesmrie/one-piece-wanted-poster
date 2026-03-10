import { useRef, useState, useCallback, useEffect } from 'react'

// Frame dimensions: 1191 x 1684 px
// Black rectangle (photo cutout) - measured from actual frame pixels:
const PHOTO_AREA = {
  top: 20.49,
  left: 10.33,
  width: 79.35,
  height: 40.92,
}

// Name position (between DEAD OR ALIVE at ~69% and bounty at ~82%)
const NAME_AREA = {
  top: 71,
  left: 10,
  width: 80,
  height: 9,
}


// Format name: uppercase + replace spaces with bullet •
function formatPirateName(name) {
  return (name || 'YOUR NAME HERE').toUpperCase().replace(/\s+/g, '•')
}

export default function WantedPoster({
  photo,
  photoPosition,
  onPhotoPositionChange,
  pirateName,
  nameScale = 1.0,
  appState,
}) {
  const photoAreaRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 })

  const handlePointerDown = useCallback((e) => {
    if (!photo) return
    e.preventDefault()
    setIsDragging(true)
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    dragStart.current = {
      x: clientX,
      y: clientY,
      posX: photoPosition.x,
      posY: photoPosition.y,
    }
  }, [photo, photoPosition])

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return
    e.preventDefault()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const dx = clientX - dragStart.current.x
    const dy = clientY - dragStart.current.y
    onPhotoPositionChange(prev => ({
      ...prev,
      x: dragStart.current.posX + dx,
      y: dragStart.current.posY + dy,
    }))
  }, [isDragging, onPhotoPositionChange])

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleWheel = useCallback((e) => {
    if (!photo) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.05 : 0.05
    onPhotoPositionChange(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(3, prev.scale + delta)),
    }))
  }, [photo, onPhotoPositionChange])

  const lastPinchDist = useRef(null)
  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      if (lastPinchDist.current !== null) {
        const delta = (dist - lastPinchDist.current) * 0.005
        onPhotoPositionChange(prev => ({
          ...prev,
          scale: Math.max(0.5, Math.min(3, prev.scale + delta)),
        }))
      }
      lastPinchDist.current = dist
    } else if (e.touches.length === 1 && isDragging) {
      handlePointerMove(e)
    }
  }, [isDragging, handlePointerMove, onPhotoPositionChange])

  const handleTouchEnd = useCallback(() => {
    lastPinchDist.current = null
    setIsDragging(false)
  }, [])

  useEffect(() => {
    const el = photoAreaRef.current
    if (!el) return
    const opts = { passive: false }
    el.addEventListener('wheel', handleWheel, opts)
    return () => el.removeEventListener('wheel', handleWheel, opts)
  }, [handleWheel])

  return (
    <div
      className="relative w-full mx-auto select-none"
      style={{ aspectRatio: '1191 / 1684' }}
      id="wanted-poster"
    >
      {/* Layer 1: Frame image (base) */}
      <img
        src="/images/wanted-poster-frame.png"
        alt="Wanted poster frame"
        className="absolute inset-0 w-full h-full pointer-events-none"
        draggable={false}
      />

      {/* Layer 2: Photo - ON TOP of frame, covering the black rectangle */}
      <div
        ref={photoAreaRef}
        className="absolute overflow-hidden z-10"
        style={{
          top: `${PHOTO_AREA.top}%`,
          left: `${PHOTO_AREA.left}%`,
          width: `${PHOTO_AREA.width}%`,
          height: `${PHOTO_AREA.height}%`,
          cursor: photo ? (isDragging ? 'grabbing' : 'grab') : 'default',
        }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {photo ? (
          <img
            src={photo}
            alt="Your photo"
            className="absolute w-full h-full object-cover pointer-events-none"
            style={{
              transform: `translate(${photoPosition.x}px, ${photoPosition.y}px) scale(${photoPosition.scale})`,
            }}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1a1008]/90">
            <div className="text-center text-[#c4b394] opacity-70">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 md:w-14 md:h-14 mx-auto mb-2 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <p className="text-xs md:text-sm font-medium">Your photo here</p>
            </div>
          </div>
        )}

        {photo && appState === 'adjust' && (
          <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
            <span className="bg-black/60 text-white text-[10px] md:text-xs px-2.5 py-1 rounded-full">
              Drag to reposition | Scroll to zoom
            </span>
          </div>
        )}
      </div>

      {/* Layer 3: Texture overlay with darken blend mode */}
      <img
        src="/images/texture-layer.png"
        alt=""
        className="absolute inset-0 w-full h-full pointer-events-none z-15"
        style={{ mixBlendMode: 'darken' }}
        draggable={false}
      />

      {/* Layer 4: Name text overlay */}
      <div
        className="absolute flex items-center justify-center pointer-events-none z-30"
        style={{
          top: `${NAME_AREA.top}%`,
          left: `${NAME_AREA.left}%`,
          width: `${NAME_AREA.width}%`,
          height: `${NAME_AREA.height}%`,
        }}
      >
        <span
          className="poster-name text-center leading-none w-full block truncate px-2"
          style={{
            fontSize: `clamp(${0.7 * nameScale}rem, ${3.5 * nameScale}vw, ${1.8 * nameScale}rem)`,
          }}
        >
          {formatPirateName(pirateName)}
        </span>
      </div>

    </div>
  )
}
