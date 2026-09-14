import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata = {
  title: "My Shop",
  description: "Minimal shop",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}