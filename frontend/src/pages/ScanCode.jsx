import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'

function ScanCode() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef(null)

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop()
        }
      } catch (err) {
        console.error('Error stopping scanner:', err)
      } finally {
        scannerRef.current = null
        setIsScanning(false)
      }
    }
  }

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  const getQueueId = (value) => {
    const scannedValue = (value || '').trim()
    const match = scannedValue.match(/LW-[A-Z0-9]+/i)
    if (match) return match[0].toUpperCase()

    try {
      const url = new URL(scannedValue)
      const pathMatch = url.pathname.match(/([^/?#]+)$/i)
      if (pathMatch && pathMatch[1].toUpperCase().startsWith('LW-')) {
        return pathMatch[1].toUpperCase()
      }
    } catch {
      // not a url
    }
    return ''
  }

  const handleScanResult = async (decodedText) => {
    const queueId = getQueueId(decodedText)
    if (!queueId) {
      setError('Scanned code is not a valid LineWise queue code (expected format: LW-XXXX).')
      return
    }
    await stopScanner()
    navigate(`/join/${queueId}`)
  }

  const startScanner = async () => {
    setError('')
    setIsScanning(true)

    setTimeout(async () => {
      try {
        const qrScanner = new Html5Qrcode('qr-reader')
        scannerRef.current = qrScanner

        await qrScanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            handleScanResult(decodedText)
          },
          () => {
            // Frame scan failure is normal during scanning
          }
        )
      } catch (err) {
        console.error('Camera access error:', err)
        setError(
          'Unable to access camera. Please allow camera permissions in your browser or enter the Queue ID below.'
        )
        setIsScanning(false)
      }
    }, 100)
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    const cleanCode = getQueueId(code) || code.trim().toUpperCase()
    if (!cleanCode) {
      setError('Please enter a Queue ID (e.g. LW-8181A820)')
      return
    }
    navigate(`/join/${cleanCode}`)
  }

  return (
    <section className="bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 min-h-screen px-6 py-16 transition-colors duration-200">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Scan or Enter Queue Code
        </h1>
        <p className="mt-2 text-gray-600 dark:text-slate-400">
          Scan the counter QR code with your smartphone camera, or enter the Queue ID manually.
        </p>

        {/* Scanner Card */}
        <div className="mt-8 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-blue-100 dark:border-slate-800 space-y-4">
          {isScanning ? (
            <div className="space-y-4">
              <div id="qr-reader" className="w-full overflow-hidden rounded-xl bg-black aspect-square" />
              <button
                type="button"
                onClick={stopScanner}
                className="w-full py-3 border border-gray-300 dark:border-slate-700 rounded-xl font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                Stop Camera
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={startScanner}
              className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition cursor-pointer"
            >
              📷 Scan Queue QR Code
            </button>
          )}
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Works universally on iPhone Safari, Android Chrome, mobile browsers, and webcams.
          </p>
        </div>

        {/* Manual Input Form */}
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
              placeholder="e.g. LW-8181A820"
              className="w-full px-4 py-3 font-mono text-lg rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition cursor-pointer"
          >
            Find Queue &amp; Join Line
          </button>
        </form>
      </div>
    </section>
  )
}

export default ScanCode
