import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillGraph",
  description: "Explore people, skills, projects, and technology connections.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
