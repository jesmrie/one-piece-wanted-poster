import { useState, useCallback, useRef } from 'react'
import WantedPoster from './components/WantedPoster'
import CameraCapture from './components/CameraCapture'
import Controls from './components/Controls'
import { exportPoster } from './utils/exportPoster'

const APP_STATES = {
  LANDING: 'landing',
  CAMERA: 'camera',
  ADJUST: 'adjust',
}

function App() {
  const [appState, setAppState] = useState(APP_STATES.LANDING)
  const [photo, setPhoto] = useState(null)
  const [photoPosition, setPhotoPosition] = useState({ x: 0, y: 0, scale: 1 })
  const [pirateName, setPirateName] = useState('')
  const [nameScale, setNameScale] = useState(1.0)
  const [isExporting, setIsExporting] = useState(false)
  const [showStamp, setShowStamp] = useState(false)
  const posterRef = useRef(null)

  const handlePhotoCapture = useCallback((dataUrl) => {
    setPhoto(dataUrl)
    setPhotoPosition({ x: 0, y: 0, scale: 1 })
    setAppState(APP_STATES.ADJUST)
    setShowStamp(true)
    setTimeout(() => setShowStamp(false), 600)
  }, [])

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be under 10MB. Please choose a smaller file.')
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please upload a JPG, PNG, or WebP image.')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      handlePhotoCapture(ev.target.result)
    }
    reader.readAsDataURL(file)
  }, [handlePhotoCapture])

  const handleDownload = useCallback(async () => {
    if (!posterRef.current) return
    setIsExporting(true)
    try {
      await exportPoster(posterRef.current, pirateName, photo, photoPosition, nameScale)
    } catch (err) {
      console.error('Export failed:', err)
      alert('Failed to export poster. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }, [pirateName, photo, photoPosition, nameScale])

  const handleReset = useCallback(() => {
    setPhoto(null)
    setPhotoPosition({ x: 0, y: 0, scale: 1 })
    setNameScale(1.0)
    setAppState(APP_STATES.LANDING)
    setShowStamp(false)
  }, [])

  return (
    <div className="min-h-dvh flex flex-col items-center px-3.5 pt-5 pb-3 sm:px-5 sm:pt-8 md:px-8 md:pt-14">
      {/* Header — Logo */}
      <header className="mb-5 sm:mb-8 animate-fade-in">
        <img
          src="/images/one-piece-logo-white.png"
          alt="One Piece"
          className="h-12 sm:h-20 md:h-24 w-auto object-contain"
          draggable={false}
        />
      </header>

      {/* Main content */}
      <main className="w-full max-w-sm sm:max-w-md md:max-w-lg flex flex-col items-center">
        {/* Poster preview */}
        <div
          className={`w-full ${showStamp ? 'animate-stamp' : ''}`}
          ref={posterRef}
        >
          <WantedPoster
            photo={photo}
            photoPosition={photoPosition}
            onPhotoPositionChange={setPhotoPosition}
            pirateName={pirateName}
            nameScale={nameScale}
            appState={appState}
          />
        </div>

        {/* Camera mode */}
        {appState === APP_STATES.CAMERA && (
          <div className="w-full mt-3 sm:mt-5">
            <CameraCapture
              onCapture={handlePhotoCapture}
              onCancel={() => setAppState(APP_STATES.LANDING)}
            />
          </div>
        )}

        {/* Landing buttons */}
        {appState === APP_STATES.LANDING && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full mt-3 sm:mt-5 animate-fade-in">
            <button
              onClick={() => setAppState(APP_STATES.CAMERA)}
              className="btn-press flex-1 flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-navy font-semibold py-3 px-5 rounded-xl transition-all duration-200 shadow-lg shadow-gold/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
              Take Photo
            </button>

            <label className="btn-press flex-1 flex items-center justify-center gap-2 bg-navy-light hover:bg-[#3a2815] text-parchment font-semibold py-3 px-5 rounded-xl border border-gold/30 hover:border-gold/60 transition-all duration-200 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload Photo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Adjust mode: controls */}
        {appState === APP_STATES.ADJUST && (
          <div className="w-full mt-3 sm:mt-5 space-y-3 animate-fade-in">
            <Controls
              pirateName={pirateName}
              onNameChange={setPirateName}
              nameScale={nameScale}
              onNameScaleChange={setNameScale}
            />

            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={handleDownload}
                disabled={isExporting}
                className="btn-press flex-1 flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-navy font-bold py-3 px-5 rounded-xl transition-all duration-200 shadow-lg shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download Poster
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                className="btn-press flex items-center justify-center gap-2 bg-navy-light hover:bg-[#3a2815] text-parchment font-semibold py-3 px-5 rounded-xl border border-red-500/30 hover:border-red-500/60 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10"/>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                </svg>
                Retake
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto pt-8 pb-2 text-center text-parchment-dark/40 text-xs">
        One Piece Wanted Poster Photobooth by{' '}
        <a
          href="https://www.instagram.com/jes.logs"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold/60 hover:text-gold transition-colors"
        >
          @jes.logs
        </a>
      </footer>
    </div>
  )
}

export default App
