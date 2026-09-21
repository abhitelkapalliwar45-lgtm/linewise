import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function QrScanIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6.75V4.875A1.125 1.125 0 014.875 3.75H6.75M17.25 3.75h1.875c.621 0 1.125.504 1.125 1.125V6.75M20.25 17.25v1.875A1.125 1.125 0 0119.125 20.25H17.25M6.75 20.25H4.875A1.125 1.125 0 013.75 19.125V17.25M3 12h18"
      />
    </svg>
  )
}

function DirectInputIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
      />
    </svg>
  )
}

function UserPortal() {
  const navigate = useNavigate()
  const [manualCode, setManualCode] = useState('')
  const [error, setError] = useState('')

  const handleManualJoin = (e) => {
    e.preventDefault()
    const clean = manualCode.trim().toUpperCase()
    if (!clean) {
      setError('Please enter a Queue ID')
      return
    }
    navigate(`/join/${clean}`)
  }

  return (
    <section className="bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 px-6 py-20 transition-colors duration-200 min-h-screen">
      <div className="mx-auto max-w-4xl">
        
        {/* Breadcrumb navigation */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
          <Link to="/get-started" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            &larr; Back to Portals
          </Link>
          <span>/</span>
          <span className="font-semibold text-gray-800 dark:text-slate-200">User Panel</span>
        </div>

        <div className="text-center mb-12">
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 mb-3">
            Customer &amp; Visitor Portal
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            User Panel
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-gray-600 dark:text-slate-400">
            Scan the counter QR code or enter your Queue ID to join the line and monitor your wait time.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Primary Action Card: Scan Code */}
          <button
            type="button"
            onClick={() => navigate('/scan')}
            className="group flex flex-col justify-between rounded-3xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl cursor-pointer"
          >
            <div>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-105">
                <QrScanIcon />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Scan Code
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-slate-400">
                Scan a QR code to join a queue remotely and see your estimated waiting time.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                Open Camera Scanner &rarr;
              </span>
            </div>
          </button>

          {/* Secondary Action Card: Manual Queue ID Entry */}
          <div className="flex flex-col justify-between rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-left shadow-sm">
            <div>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                <DirectInputIcon />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Enter Queue ID Directly
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-slate-400">
                Have a queue code displayed on the counter screen? Type it below to claim your ticket immediately.
              </p>
            </div>

            <form onSubmit={handleManualJoin} className="mt-6 space-y-3">
              {error && (
                <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => {
                    setManualCode(e.target.value)
                    setError('')
                  }}
                  placeholder="e.g. LW-8181A820"
                  className="flex-1 px-4 py-2.5 font-mono text-sm uppercase rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition"
                >
                  Join Queue
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </section>
  )
}

export default UserPortal
