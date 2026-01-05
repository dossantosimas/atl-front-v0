"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          success: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
          error: "bg-[#E00030]/10 dark:bg-[#E00030]/20 border-[#E00030] dark:border-[#E00030]",
          info: "bg-[#F4F3FF] dark:bg-[#050F5C] border-[#091EB7] dark:border-[#0ADDD7]",
          warning: "bg-[#F6DB99] dark:bg-[#EBA600]/20 border-[#EBA600] dark:border-[#FE941E]",
          loading: "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
