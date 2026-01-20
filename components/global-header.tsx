"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { Home, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GlobalHeader() {
  return (
    <header className="w-full border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 flex-shrink-0">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 lg:px-6 xl:px-8 gap-2 sm:gap-4">
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity min-w-0">
          <Image
            src="/logo_azul.png"
            alt="Cervecería del Atlántico"
            width={32}
            height={32}
            className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0"
            priority
          />
          <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
            Cervecería del Atlántico
          </h1>
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
              <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Inicio</span>
            </Button>
          </Link>
          <Link href="/config-global">
            <Button variant="ghost" size="sm" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
              <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Configuración</span>
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

