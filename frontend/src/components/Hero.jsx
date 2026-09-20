import { Link } from 'react-router-dom'

function Hero() {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 px-6 py-24 transition-colors duration-200">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-6xl">
          LineWise
        </h1>
        <p className="mt-4 text-lg font-medium text-blue-600 dark:text-blue-400 md:text-xl">
          AI-Based Smart Service Flow Management &amp; Waiting Time Prediction
          System
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-slate-300 md:text-lg">
          Skip the physical wait. Join queues remotely from your phone, track
          your position in real time, and get AI-powered estimates of how long
          you&apos;ll wait before you even arrive.
        </p>
        <Link
          to="/get-started"
          className="mt-10 inline-block rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-md transition-all"
        >
          Get Started Now
        </Link>
      </div>
    </section>
  )
}

export default Hero
