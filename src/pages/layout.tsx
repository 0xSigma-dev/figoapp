
import { Inter } from "next/font/google";
//import '../styles/globals.css';
import AppWalletProvider from "../components/AppWalletProvider";


const inter = Inter({ subsets: ["latin"] });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AppWalletProvider><body className={inter.className}>{children}</body></AppWalletProvider>
    </html>
  );
}
