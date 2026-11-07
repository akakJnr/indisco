import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "styles/globals.css"

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "Indisco Supermarket",
    template: "%s | Indisco Supermarket",
  },
  description:
    "Fresh groceries, household essentials and laboratory supplies, delivered across Nigeria.",
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className={fontSans.variable}>
      <head>
        <link rel="ucp" href="/.well-known/ucp" />
      </head>
      <body className="font-sans bg-[#fbfaf6] text-grey-80">
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
