import "@/styles/globals.css"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata } from "next"
import { Geist, Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { ErrorBoundary } from "@/components/custom/error-boundary"
import { Toaster } from "@/components/ui/sonner"
import { TRPCReactProvider } from "@/trpc/react"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
	title: "Kurio",
	description: "Kurio is a platform for creating and sharing kurios",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
}

const _geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
})

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html className={inter.variable} lang="en" suppressHydrationWarning>
			<body>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<ErrorBoundary>
						<TRPCReactProvider>{children}</TRPCReactProvider>
					</ErrorBoundary>
					<Toaster />
					<Analytics />
					<SpeedInsights />
				</ThemeProvider>
			</body>
		</html>
	)
}
