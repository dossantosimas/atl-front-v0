import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quality - Micro - View",
  description: "Quality micro view page",
};

export default function QualityMicroViewLayout({
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

