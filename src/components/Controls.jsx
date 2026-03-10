export default function Controls({ pirateName, onNameChange }) {
  return (
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
    </div>
  )
}
