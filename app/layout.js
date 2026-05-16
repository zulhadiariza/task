import './globals.css';
import Providers from './providers';

export const viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  title: 'TaskMaster Pro | Premium Task Management',
  description: 'Boost your productivity with TaskMaster Pro. Organize tasks, manage your workflow with our Kanban board, and stay focused with built-in Pomodoro timers.',
  keywords: ['task management', 'kanban board', 'pomodoro timer', 'productivity app', 'to-do list', 'TaskMaster Pro'],
  authors: [{ name: 'TaskMaster Team' }],
  creator: 'TaskMaster Team',
  openGraph: {
    title: 'TaskMaster Pro | Elevate Your Productivity',
    description: 'Boost your productivity with TaskMaster Pro. Organize tasks, manage your workflow with our Kanban board, and stay focused with built-in Pomodoro timers.',
    url: 'https://taskmasterpro.app',
    siteName: 'TaskMaster Pro',
    images: [
      {
        url: '/illustration.png',
        width: 1200,
        height: 630,
        alt: 'TaskMaster Pro Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TaskMaster Pro | Premium Task Management',
    description: 'Boost your productivity with TaskMaster Pro. Organize tasks and stay focused.',
    images: ['/illustration.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
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
