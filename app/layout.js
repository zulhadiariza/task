import './globals.css';

export const metadata = {
  title: 'TaskMaster Pro',
  description: 'A premium daily task management application.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
