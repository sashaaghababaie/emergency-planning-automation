import { Kanit } from "next/font/google";
import "./globals.css";

const k = Kanit({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "900"],
});

export const metadata = {
  title: "Emergency Design",
  description: "Emergency design automation by Arsham Aghababaie",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={k.className}>{children}</body>
    </html>
  );
}
