import { useNavigate } from 'react-router-dom'

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

const options = [
  {
    title: 'Generate Code',
    description:
      'Create a QR code for your service so customers can join the queue from their phone.',
    icon: QrGenerateIcon,
    path: '/generate-code',
  },
  {
    title: 'Scan Code',
    description:
      'Scan a QR code to join a queue remotely and see your estimated waiting time.',
    icon: QrScanIcon,
    path: '/scan',
  },
]

function GetStarted() {
  const navigate = useNavigate()

  return (
    <section className="bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 px-6 py-20 transition-colors duration-200 min-h-screen">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
          How would you like to start?
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-600 dark:text-slate-400">
          Choose whether you want to generate a queue QR code or scan one to join
          a line.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {options.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.title}
                type="button"
                onClick={() => {
                  if (option.path) navigate(option.path)
                }}
                className="rounded-2xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-left shadow-sm transition-all hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Icon />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {option.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-slate-400">
                  {option.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default GetStarted
