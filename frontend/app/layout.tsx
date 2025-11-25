import Header from '@/app/components/(ui)/Header';
import './globals.css';

export const metadata = {
  title: 'Assist & Share',
  description: 'Sistema de gestión de eventos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}