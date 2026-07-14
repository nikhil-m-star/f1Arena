import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
 
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import Link from "next/link";

export const metadata: Metadata = {
  title: "F1 Arena | F1 Prediction League",
  description: "Predict F1 results, earn points, and dominate your friends in private Arenas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50">
        <ClerkProvider>
          <header className="sticky top-0 z-50 flex h-16 items-center justify-between bg-zinc-950/80 px-6 backdrop-blur-md">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center font-black tracking-wider text-xl text-white">
                <span className="bg-f1-cyan px-2 py-0.5 rounded italic text-zinc-950 font-extrabold mr-1">F1</span>
                <span className="font-extrabold">ARENA</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-zinc-400">
                <Link href="/calendar" className="hover:text-white transition-colors duration-150">Calendar</Link>
                <Link href="/leaderboard" className="hover:text-white transition-colors duration-150">Leaderboard</Link>
                <Link href="/arenas" className="hover:text-white transition-colors duration-150">Arenas</Link>
                <Link href="/profile" className="hover:text-white transition-colors duration-150">Profile</Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="px-4 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-sm font-semibold transition text-zinc-200 cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-1.5 rounded bg-f1-cyan hover:bg-f1-cyan-hover text-sm font-semibold transition text-zinc-950 cursor-pointer">
                    Sign Up
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </div>
          </header>
          
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          
          <footer className="bg-zinc-950 py-6 text-center text-sm text-zinc-500">
            <p>&copy; {new Date().getFullYear()} F1 Arena. Not affiliated with Formula 1 or the FIA.</p>
          </footer>
        </ClerkProvider>
      </body>
    </html>
  );
}