import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function QrGenerateIcon() {
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
        d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 19.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z"
      />
    </svg>
  )
}

function DashboardIcon() {
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
        d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
      />
    </svg>
  )
}

function AdminPortal() {
  const navigate = useNavigate()
  const [existingQueueId, setExistingQueueId] = useState('')
  const [error, setError] = useState('')

  const handleOpenExistingQueue = (e) => {
    e.preventDefault()
    const cleanId = existingQueueId.trim().toUpperCase()
    if (!cleanId) {
      setError('Please enter a Queue ID')
      return
    }
    navigate(`/admin/${cleanId}`)
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
          <span className="font-semibold text-gray-800 dark:text-slate-200">Admin Panel</span>
        </div>

        <div className="text-center mb-12">
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 mb-3">
            Counter Desk &amp; Staff Administration
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            Admin Panel
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-gray-600 dark:text-slate-400">
            Create a new service counter queue or access an already active counter dashboard.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Primary Action Card: Generate Code */}
          <button
            type="button"
            onClick={() => navigate('/generate-code')}
            className="group flex flex-col justify-between rounded-3xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl cursor-pointer"
          >
            <div>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-105">
                <QrGenerateIcon />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Generate Code
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-slate-400">
                Create a QR code for your service so customers can join the queue from their phone.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                Configure Counter &amp; Generate QR &rarr;
              </span>
            </div>
          </button>

          {/* Secondary Action Card: Manage Existing Queue */}
          <div className="flex flex-col justify-between rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-left shadow-sm">
            <div>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <DashboardIcon />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Manage Active Queue
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-slate-400">
                Already created a queue earlier? Enter your Queue ID to jump directly to your live counter desk.
              </p>
            </div>

            <form onSubmit={handleOpenExistingQueue} className="mt-6 space-y-3">
              {error && (
                <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={existingQueueId}
                  onChange={(e) => {
                    setExistingQueueId(e.target.value)
                    setError('')
                  }}
                  placeholder="e.g. LW-8181A820"
                  className="flex-1 px-4 py-2.5 font-mono text-sm uppercase rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition"
                >
                  Open Desk
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </section>
  )
}

export default AdminPortal
