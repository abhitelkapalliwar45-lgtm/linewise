function Footer() {
  return (
    <footer id="contact" className="border-t border-blue-100 dark:border-slate-800 bg-blue-50 dark:bg-slate-900 px-6 py-8 transition-colors duration-200">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-sm text-gray-600 dark:text-slate-400">
          &copy; {new Date().getFullYear()} LineWise. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
