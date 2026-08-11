import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rit AI — Sign In',
  description: 'Sign in or create your Rit AI account to access AI-powered classrooms.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
