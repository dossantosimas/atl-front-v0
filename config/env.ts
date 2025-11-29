const isServer = typeof window === "undefined";

export const env = {
  BASE_URL: isServer
    ? process.env.NEXT_PUBLIC_BASE_URL ?? ""
    : process.env.NEXT_PUBLIC_BASE_URL ?? "",
};

