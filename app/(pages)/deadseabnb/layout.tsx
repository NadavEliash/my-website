import type { Metadata } from "next"

export const metadata: Metadata = {
  icons: {
    icon: "/sun-umbrella.svg",
  },
}

export default function DeadSeaBnbLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>
}
