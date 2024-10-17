"use client";
import { StarknetProvider } from "@/components/starknet-provider";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import Header from "@/components/Header";
import { MarketProvider } from "./context/MarketProvider";
import { SnackbarProvider } from "notistack";
import CustomToastWrapper from "@/components/Toast/Wrapper";
import HeaderMobile from "@/components/Header/HeaderMobile";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <head>
        <title>ForeCast</title>
        <meta
          name='ForeCast'
          content= 'India’s Primary Prediction Market - built on Base.'
        />
      </head>
      <body>
        <NextTopLoader showSpinner={false} color='#F5841F' />
        <StarknetProvider>
          <Header />
          <HeaderMobile />
          <MarketProvider>
            <SnackbarProvider
              maxSnack={2}
              Components={{
                //@ts-ignore
                custom: CustomToastWrapper,
              }}
            >
              <main
                style={{
                  flex: "1",
                  width: "100%",
                  height: "100%",
                  overflowY: "scroll",
                }}
              >
                {children}
              </main>
            </SnackbarProvider>
          </MarketProvider>
        </StarknetProvider>
      </body>
    </html>
  );
}
