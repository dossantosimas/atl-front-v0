"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { FlaskConical, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GlobalHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <FlaskConical className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Cervecería del Atlántico
          </h1>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              Inicio
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

