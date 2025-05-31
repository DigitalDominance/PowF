"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { useEffect, useState } from "react"

interface ThemeSwitchProps {
  size?: "sm" | "default" // Add size prop
}

export function ThemeSwitch({ size = "default" }: ThemeSwitchProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const iconSizeClass = size === "sm" ? "h-[1rem] w-[1rem]" : "h-[1.2rem] w-[1.2rem]"
  const switchScaleClass = size === "sm" ? "scale-90" : "" // For Switch component

  if (!mounted) {
    const placeholderHeight = size === "sm" ? "h-[1rem]" : "h-[1.2rem]"
    const placeholderWidth = size === "sm" ? "w-[calc(1rem*2+18px+0.5rem*2)]" : "w-[calc(1.2rem*2+24px+0.5rem*2)]"
    return <div className={`flex items-center space-x-1.5 ${placeholderHeight} ${placeholderWidth}`} />
  }

  const isDarkMode = theme === "dark"

  const toggleTheme = () => {
    setTheme(isDarkMode ? "light" : "dark")
  }

  const sunAnimationClasses = `${iconSizeClass} transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
    isDarkMode ? "text-muted-foreground scale-75 rotate-12" : "text-accent scale-100 rotate-0"
  }`
  const moonAnimationClasses = `${iconSizeClass} transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
    !isDarkMode ? "text-muted-foreground scale-75 rotate-12" : "text-accent scale-100 rotate-0"
  }`
  const switchAnimationClasses = "transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110"

  return (
    <div className={`flex items-center ${size === "sm" ? "space-x-1.5" : "space-x-2"}`}>
      <Sun
        className={sunAnimationClasses}
        onClick={() => setTheme("light")}
        aria-label="Switch to light mode"
        role="button"
      />
      <Switch
        checked={isDarkMode}
        onCheckedChange={toggleTheme}
        aria-label="Toggle theme"
        className={`${switchAnimationClasses} ${switchScaleClass} data-[state=checked]:bg-accent data-[state=unchecked]:bg-muted-foreground/30 focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-background`}
      />
      <Moon
        className={moonAnimationClasses}
        onClick={() => setTheme("dark")}
        aria-label="Switch to dark mode"
        role="button"
      />
    </div>
  )
}
