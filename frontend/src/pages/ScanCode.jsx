import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function ScanCode() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleManualSubmit = (e) => {
    e.preventDefault()
    const cleanCode = code.trim().toUpperCase()
    if (!cleanCode) {
      setError('Please enter a Queue ID')
      return
    }
    // Navigate to Join Queue page
    navigate(`/join/${cleanCode}`)
  }

  return (
    <section className="bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 min-h-screen px-6 py-16 transition-colors duration-200">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Scan or Enter Queue Code
        </h1>
        <p className="mt-2 text-gray-600 dark:text-slate-400">
          Enter the Queue ID from the counter display to join the line from your phone.
        </p>

        <form
          onSubmit={handleManualSubmit}
          className="mt-8 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-blue-100 dark:border-slate-800 space-y-4 text-left"
        >
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-2">
              Queue ID / Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. LW-7A8B9C"
              className="w-full px-4 py-3 font-mono text-lg rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition"
          >
            Find Queue & Join Line
          </button>
        </form>
      </div>
    </section>
  )
}

export default ScanCode
