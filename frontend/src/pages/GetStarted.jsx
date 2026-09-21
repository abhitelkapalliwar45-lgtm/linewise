import { useNavigate } from 'react-router-dom'

function AdminIcon() {
  return (
    <svg
      className="h-7 w-7"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
      />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg
      className="h-7 w-7"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  )
}

const portals = [
  {
    roleTag: 'Counter Desk & Staff',
    title: 'Admin Panel',
    description:
      'Set up a new service counter, generate live queue QR codes, call waiting customers, verify 4-digit QVC OTPs, and monitor real-time ML wait-time analytics.',
    icon: AdminIcon,
    path: '/admin-portal',
    actionText: 'Open Admin Panel',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    iconBgClass: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  {
    roleTag: 'Customer & Visitor',
    title: 'User Panel',
    description:
      'Scan the counter QR code with your camera or manually enter the Queue ID to take your digital token, check your position in line, and track live wait times.',
    icon: UserIcon,
    path: '/user-portal',
    actionText: 'Open User Panel',
    badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    iconBgClass: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400',
    buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
]

function GetStarted() {
  const navigate = useNavigate()

  return (
    <section className="bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 px-6 py-20 transition-colors duration-200 min-h-screen">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-4xl">
          Select Your Portal
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-600 dark:text-slate-400">
          Choose whether you are setting up and managing a counter desk or joining a queue as a customer.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {portals.map((portal) => {
            const Icon = portal.icon
            return (
              <div
                key={portal.title}
                onClick={() => navigate(portal.path)}
                className="group relative flex flex-col justify-between rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${portal.iconBgClass} transition-transform group-hover:scale-105`}
                    >
                      <Icon />
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${portal.badgeClass}`}
                    >
                      {portal.roleTag}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {portal.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-slate-400">
                    {portal.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center gap-1.5 transition-colors">
                    {portal.actionText} <span>&rarr;</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(portal.path)
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-colors ${portal.buttonClass}`}
                  >
                    Proceed
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default GetStarted
