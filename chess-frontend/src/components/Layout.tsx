// src/components/Layout.jsx

import Header from "./header";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-teal-950 relative">
      <Header />
      <main >{children}</main>
    </div>
  );
}
