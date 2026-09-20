import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({
  isDarkMode: false,
  toggleDarkMode: () => {},
})

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('linewise_theme')
    if (saved) {
      return saved === 'dark'
    }
    return false
  })

  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    if (isDarkMode) {
      root.classList.add('dark')
      body.classList.add('dark')
      localStorage.setItem('linewise_theme', 'dark')
    } else {
      root.classList.remove('dark')
      body.classList.remove('dark')
      localStorage.setItem('linewise_theme', 'light')
    }
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev)
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
