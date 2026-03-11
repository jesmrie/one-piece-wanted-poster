export default function Controls({ pirateName, onNameChange, nameScale, onNameScaleChange }) {
  const sizeLabel = nameScale <= 0.7 ? 'XS' : nameScale <= 0.9 ? 'S' : nameScale <= 1.2 ? 'M' : nameScale <= 1.5 ? 'L' : 'XL'

  return (
    <div className="space-y-3">
      {/* Pirate Name Input */}
      <div>
        <label className="block text-parchment-dark text-xs font-medium mb-1.5 uppercase tracking-wider">
          Pirate Name
        </label>
        <input
          type="text"
          value={pirateName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="YOUR NAME HERE"
          maxLength={30}
          className="w-full bg-navy-light border border-gold/30 focus:border-gold rounded-xl px-4 py-3 text-parchment font-[var(--font-poster)] text-lg uppercase tracking-wide placeholder:text-parchment-dark/40 outline-none transition-colors"
        />
        {pirateName && (
          <p className="mt-1 text-parchment-dark/50 text-[10px] tracking-wide">
            Displays as: {pirateName.toUpperCase().replace(/\s+/g, '•')}
          </p>
        )}
      </div>

      {/* Font Size Slider */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-parchment-dark text-xs font-medium uppercase tracking-wider">
            Name Size
          </label>
          <span className="text-gold text-xs font-semibold tracking-wider">{sizeLabel}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-parchment-dark/60 text-[10px] font-bold select-none">A</span>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={nameScale}
            onChange={(e) => onNameScaleChange(parseFloat(e.target.value))}
            className="name-size-slider flex-1 h-1.5 bg-navy rounded-full appearance-none cursor-pointer accent-gold"
          />
          <span className="text-parchment-dark/60 text-base font-bold select-none">A</span>
        </div>
      </div>
    </div>
  )
}
