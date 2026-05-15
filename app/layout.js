import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'TaskMaster Pro',
  description: 'A premium daily task management application.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
