// app/layout.tsx
"use client";

import "@/styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import "sanitize.css";

import Layout from "./(base)/Layout";
import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <head />
      <body>
        <SessionProvider>
          <Layout>
            <div id="portal-root" />
            {children}
          </Layout>
        </SessionProvider>
      </body>
    </html>
  );
}
