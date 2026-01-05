const isServer = typeof window === "undefined";

// Obtener BASE_URL según el contexto
// En el servidor, podemos usar variables de entorno normales (no NEXT_PUBLIC_*)
// En el cliente, necesitamos NEXT_PUBLIC_* porque se inyecta en build time
const getBaseUrl = (): string => {
  if (isServer) {
    // En el servidor, intentar primero BASE_URL (runtime), luego NEXT_PUBLIC_BASE_URL
    const serverUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
    console.log("[env] Server-side BASE_URL:", serverUrl || "NOT CONFIGURED");
    console.log("[env] BASE_URL env:", process.env.BASE_URL || "NOT SET");
    console.log("[env] NEXT_PUBLIC_BASE_URL env:", process.env.NEXT_PUBLIC_BASE_URL || "NOT SET");
    return serverUrl;
  } else {
    // En el cliente, solo NEXT_PUBLIC_* está disponible
    const clientUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    return clientUrl;
  }
};

export const env = {
  BASE_URL: getBaseUrl(),
};

