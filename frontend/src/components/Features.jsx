const features = [
  {
    title: 'QR Queue Registration',
    description:
      'Scan a QR code to join a queue instantly — no paperwork, no standing in line.',
  },
  {
    title: 'Live Queue Status',
    description:
      'See your current position and queue movement updated in real time.',
  },
  {
    title: 'AI Wait Time Prediction',
    description:
      'Machine learning estimates your wait time so you can plan your visit.',
  },
]

function Features() {
  return (
    <section id="about" className="px-6 py-20 bg-white dark:bg-slate-950 transition-colors duration-200">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
          Features
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-gray-600 dark:text-slate-400">
          Everything you need for a smarter, stress-free queue experience.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
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
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-slate-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
