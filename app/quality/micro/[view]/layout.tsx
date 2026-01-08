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
    <div className="h-full w-full flex flex-col min-h-0">
      {children}
    </div>
  );
}

