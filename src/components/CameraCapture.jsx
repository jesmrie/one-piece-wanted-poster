import { useRef, useState, useCallback, useEffect } from 'react'
import Webcam from 'react-webcam'

export default function CameraCapture({ onCapture, onCancel }) {
  const webcamRef = useRef(null)
  const [hasPermission, setHasPermission] = useState(null)
  const [facingMode, setFacingMode] = useState('user')

  useEffect(() => {
    // Check if camera is available
    if (!navigator.mediaDevices?.getUserMedia) {
      setHasPermission(false)
    }
  }, [])

  const handleCapture = useCallback(() => {
    const screenshot = webcamRef.current?.getScreenshot()
    if (screenshot) {
      onCapture(screenshot)
    }
  }, [onCapture])

  const handleUserMediaError = useCallback(() => {
    setHasPermission(false)
  }, [])

  const handleUserMedia = useCallback(() => {
    setHasPermission(true)
  }, [])

  const toggleFacing = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }, [])

  if (hasPermission === false) {
    return (
      <div className="w-full bg-navy-light rounded-xl p-6 text-center border border-gold/20 animate-fade-in">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-3 text-gold/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z"/>
        </svg>
        <p className="text-parchment mb-2 font-semibold">Camera access denied</p>
        <p className="text-parchment-dark text-sm mb-4">
          Please allow camera access in your browser settings, or upload a photo instead.
        </p>
        <button
          onClick={onCancel}
          className="btn-press bg-gold hover:bg-gold-light text-navy font-semibold py-2.5 px-6 rounded-xl transition-all"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="w-full space-y-3 animate-fade-in">
      <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.95}
          videoConstraints={{
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 960 },
          }}
          onUserMediaError={handleUserMediaError}
          onUserMedia={handleUserMedia}
          mirrored={facingMode === 'user'}
          className="w-full h-full object-cover"
        />

        {hasPermission === null && (
          <div className="absolute inset-0 flex items-center justify-center bg-navy-light">
            <div className="text-center">
              <svg className="animate-spin w-8 h-8 mx-auto mb-2 text-gold" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <p className="text-parchment-dark text-sm">Starting camera...</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="btn-press flex-none bg-navy-light hover:bg-[#252542] text-parchment font-semibold py-3 px-5 rounded-xl border border-gold/20 transition-all"
        >
          Cancel
        </button>

        <button
          onClick={handleCapture}
          disabled={!hasPermission}
          className="btn-press flex-1 flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-navy font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-gold/20 disabled:opacity-50"
        >
          <div className="w-6 h-6 rounded-full border-3 border-navy bg-transparent flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-navy"/>
          </div>
          Capture
        </button>

        <button
          onClick={toggleFacing}
          className="btn-press flex-none bg-navy-light hover:bg-[#252542] text-parchment font-semibold py-3 px-5 rounded-xl border border-gold/20 transition-all"
          title="Switch camera"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/>
            <path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5"/>
            <polyline points="16 3 19 6 16 9"/>
            <polyline points="8 21 5 18 8 15"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
