'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid username or password');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.illustrationPane}>
        <img src="/illustration.png" alt="Productivity Illustration" className={styles.illustrationImage} />
        <h2 className={styles.quote}>"The secret of getting ahead is getting started."</h2>
        <p className={styles.author}>— Mark Twain</p>
      </div>
      <div className={styles.formPane}>
        <div className={styles.authCard}>
        <div>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to access your tasks</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Username</label>
            <input
              type="text"
              required
              className={styles.input}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              required
              className={styles.input}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button type="submit" disabled={loading} className={styles.button} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <LogIn size={18} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className={styles.link}>
          Don't have an account? <Link href="/register">Sign up here</Link>
        </p>
      </div>
      </div>
    </div>
  );
}
