import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quality - Micro",
  description: "Quality micro page",
};

export default function QualityMicroLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen w-full overflow-hidden">
      {children}
    </div>
  );
}

