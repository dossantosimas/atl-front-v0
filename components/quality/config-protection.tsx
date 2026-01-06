"use client";

import { useState, useEffect, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";
import { Lock } from "lucide-react";

const CONFIG_PASSWORD = "Siemens1234";
const STORAGE_KEY = "config_access_granted";
const STORAGE_TIMESTAMP_KEY = "config_access_timestamp";
const SESSION_DURATION = 60 * 60 * 1000; // 1 hora en milisegundos

interface ConfigProtectionProps {
  children: ReactNode;
}

export function ConfigProtection({ children }: ConfigProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const { showError } = useToast();

  useEffect(() => {
    // Verificar si ya está autenticado y si la sesión sigue vigente
    const accessGranted = sessionStorage.getItem(STORAGE_KEY) === "true";
    const timestamp = sessionStorage.getItem(STORAGE_TIMESTAMP_KEY);
    
    if (accessGranted && timestamp) {
      const now = Date.now();
      const sessionTime = parseInt(timestamp, 10);
      const timeElapsed = now - sessionTime;
      
      // Si ha pasado menos de 1 hora, mantener autenticado
      if (timeElapsed < SESSION_DURATION) {
        setIsAuthenticated(true);
        return;
      } else {
        // Si ha expirado, limpiar el storage
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_TIMESTAMP_KEY);
      }
    }
    
    // Si no está autenticado o la sesión expiró, mostrar el modal
    setIsOpen(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password === CONFIG_PASSWORD) {
      const now = Date.now();
      sessionStorage.setItem(STORAGE_KEY, "true");
      sessionStorage.setItem(STORAGE_TIMESTAMP_KEY, String(now));
      setIsAuthenticated(true);
      setIsOpen(false);
      setPassword("");
    } else {
      setError("Clave incorrecta. Por favor, intente nuevamente.");
      showError("Acceso denegado", "La clave ingresada es incorrecta.");
      setPassword("");
    }
  };

  const handleCancel = () => {
    // Si cancela, redirigir a la página anterior o a micro
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  // Si no está autenticado, mostrar el modal de autenticación
  if (!isAuthenticated) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => {
        // No permitir cerrar el modal sin autenticarse
        if (!open && !isAuthenticated) {
          handleCancel();
        }
      }}>
        <DialogContent 
          className="sm:max-w-md" 
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          showCloseButton={false}
        >
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-5 w-5 text-[#091EB7]" />
              <DialogTitle>Acceso Restringido</DialogTitle>
            </div>
            <DialogDescription>
              Esta sección requiere autenticación. Por favor, ingrese la clave de acceso.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Clave de Acceso
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Ingrese la clave"
                className={error ? "border-red-500" : ""}
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="submit">
                Ingresar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // Si está autenticado, mostrar el contenido
  return <>{children}</>;
}

