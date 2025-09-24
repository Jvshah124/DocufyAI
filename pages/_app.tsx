// pages/_app.tsx
import type { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";
import Script from "next/script"; // 🟢 import Script
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* 🟢 Razorpay Checkout script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="beforeInteractive"
      />

      <ThemeProvider attribute="class" defaultTheme="light">
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
