import Icon from './Icon'

const styles = {
  success: 'bg-emerald-600',
  error: 'bg-rose-600',
  info: 'bg-slate-900',
}

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null
  return (
    <div
      role="status"
      className={`fixed right-4 top-4 z-[70] flex max-w-sm items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${styles[type] || styles.info}`}
    >
      <Icon name={type === 'error' ? 'alert' : 'check'} className="h-4 w-4 shrink-0" />
      <span className="min-w-0 flex-1">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="shrink-0 rounded-md p-1 text-white/80 transition hover:bg-white/20 hover:text-white"
        >
          <Icon name="x" className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
