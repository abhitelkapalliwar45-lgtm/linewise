import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

function Navbar() {
  const { isDarkMode, toggleDarkMode } = useTheme()

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Get Started', to: '/get-started' },
    { label: 'Generate QR', to: '/generate-code' },
    { label: 'Scan Code', to: '/scan' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-blue-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm transition-colors duration-200">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-2">
          <span>⚡</span> LineWise
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                to={link.to}
                className="text-sm font-medium text-gray-600 dark:text-slate-300 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label="Toggle Theme"
            className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-amber-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
          >
            {isDarkMode ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                ☀️ Light
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                🌙 Dark
              </span>
            )}
          </button>

          <Link
            to="/get-started"
            className="rounded-xl bg-blue-600 dark:bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 dark:hover:bg-blue-600 shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
