import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { createQueue } from '../services/api'

const STORAGE_KEY = 'linewise_phone_base_url'

function normalizeBaseUrl(value) {
  const trimmed = (value || '').trim().replace(/\/$/, '')
  if (!trimmed) return ''
  try {
    const url = new URL(trimmed)
    return url.origin
  } catch {
    return trimmed
  }
}

function getDefaultBaseUrl() {
  const currentOrigin = window.location.origin
  const hostname = window.location.hostname
  if (hostname && !['localhost', '127.0.0.1', '::1'].includes(hostname)) {
    return currentOrigin
  }

  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) return normalizeBaseUrl(saved)

  return ''
}

function GenerateCode() {
  const navigate = useNavigate()
  const [name, setName] = useState('Counter 1 - Service Desk')
  const [category, setCategory] = useState('General Services')
  const [avgTime, setAvgTime] = useState(300)
  const [loading, setLoading] = useState(false)
  const [queueData, setQueueData] = useState(null)
  const [error, setError] = useState('')
  const [baseUrl, setBaseUrl] = useState(getDefaultBaseUrl())

  useEffect(() => {
    if (!baseUrl) return
    localStorage.setItem(STORAGE_KEY, baseUrl)
  }, [baseUrl])

  const handleCreateQueue = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await createQueue({
        name,
        category,
        avgServiceTimeSeconds: avgTime,
      })
      setQueueData(res.queue)
    } catch (err) {
      setError(err.message || 'Error creating queue')
    } finally {
      setLoading(false)
    }
  }

  const resolvedBaseUrl = normalizeBaseUrl(baseUrl || getDefaultBaseUrl() || window.location.origin)
  const joinUrl = queueData ? `${resolvedBaseUrl}/join/${queueData.id}` : ''

  return (
    <section className="bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 px-6 py-16 min-h-screen transition-colors duration-200">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
          Queue & QR Code Generator
        </h1>
        <p className="mt-3 text-gray-600 dark:text-slate-400">
          Create a live digital queue for your counter. Users scan the QR code to join remotely.
        </p>

        {!queueData ? (
          <form
            onSubmit={handleCreateQueue}
            className="mt-8 text-left bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-blue-100 dark:border-slate-800 space-y-6"
          >
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 rounded-xl text-sm font-medium border border-red-200 dark:border-red-900">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                Counter / Service Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Counter 1 - General Enquiries"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="General Services">Bank / Financial Services</option>
                <option value="Hospital & Clinic">Hospital / Healthcare</option>
                <option value="Government Office">Government Service Desk</option>
                <option value="College Admin">College / University Office</option>
                <option value="Railway & Transport">Railway Ticket Counter</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                Initial Avg Service Time per Customer
              </label>
              <select
                value={avgTime}
                onChange={(e) => setAvgTime(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={120}>2 Minutes (Fast service)</option>
                <option value={300}>5 Minutes (Standard service)</option>
                <option value={600}>10 Minutes (Detailed service)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-md shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition"
            >
              {loading ? 'Starting Queue...' : 'Activate Queue & Generate QR Code'}
            </button>
          </form>
        ) : (
          <div className="mt-8 rounded-2xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm text-center space-y-6">
            <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-xl bg-white p-4 border border-gray-100 shadow-inner">
              <QRCodeSVG
                value={joinUrl}
                size={224}
                fgColor="#1d4ed8"
                bgColor="#ffffff"
                level="H"
              />
            </div>

            <div>
              <label className="block text-left text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-2">
                Phone Access URL
              </label>
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://192.168.1.50:5173"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-2 text-left text-xs text-amber-700 dark:text-amber-300">
                Use your PC/Laptop local network IP like http://192.168.1.50:5173 so a phone on the same Wi-Fi can scan the QR and join the queue.
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                Active Queue ID
              </span>
              <p className="font-mono text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                {queueData.id}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                {queueData.name} ({queueData.category})
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-slate-800/80 rounded-xl text-left text-xs font-mono text-blue-900 dark:text-blue-300 break-all">
              <span className="font-semibold text-blue-700 dark:text-blue-400">QR Customer URL: </span>
              {joinUrl}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/admin/${queueData.id}`)}
                className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition"
              >
                Open Admin Control Dashboard
              </button>
              <button
                type="button"
                onClick={() => navigate(`/join/${queueData.id}`)}
                className="w-full sm:w-auto px-6 py-3.5 border border-blue-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-semibold rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 transition"
              >
                Test Customer View
              </button>
              <button
                type="button"
                onClick={() => setQueueData(null)}
                className="w-full sm:w-auto px-4 py-3.5 text-gray-500 dark:text-slate-400 text-sm hover:text-gray-700 dark:hover:text-white"
              >
                New Queue
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default GenerateCode
