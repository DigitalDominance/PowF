declare module 'next-themes' {
  import type { ReactNode } from 'react'

  interface ThemeProviderProps {
    children: ReactNode
    attribute?: string
    defaultTheme?: string
    enableSystem?: boolean
    disableTransitionOnChange?: boolean
    themes?: string[]
    value?: { [key: string]: string }
  }

  export const ThemeProvider: React.FC<ThemeProviderProps>
  export const useTheme: () => {
    theme: string | undefined
    setTheme: (theme: string) => void
    resolvedTheme: string | undefined
    systemTheme: string | undefined
    themes: string[]
  }
} 