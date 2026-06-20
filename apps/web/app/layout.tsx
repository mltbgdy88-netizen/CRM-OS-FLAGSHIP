import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CRM OS',
  description: 'CRM OS web bootstrap',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
