import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { League_Spartan } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

const robotoFont =  League_Spartan({
  weight: ["700"],
  subsets: [],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>){
  return (
    <html lang="en">
      <body className="bg-gradient-to-b scroll-smooth from-[#3795BD] min-h-screen">
        <SessionProvider>
          <div className={robotoFont.className}>
            <Navbar />
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
