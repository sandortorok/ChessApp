// src/components/Layout.jsx

import Header from "./header";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-teal-950 flex">
      {/* Bal oldali sidebar header */}
      <Header />
      
      {/* Spacer a mobile header alá */}
      <div className="lg:hidden h-14 w-full fixed top-0 left-0 -z-10" />
      
      {/* Főtartalom jobb oldalon */}
      <main className="flex-1 pt-14 lg:pt-0">{children}</main>
    </div>
  );
}
