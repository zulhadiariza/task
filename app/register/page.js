'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../login/page.module.css';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (json.success) {
        router.push('/login');
      } else {
        setError(json.error || 'Failed to register');
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
        <h2 className={styles.quote}>"Focus on being productive instead of busy."</h2>
        <p className={styles.author}>— Tim Ferriss</p>
      </div>
      <div className={styles.formPane}>
        <div className={styles.authCard}>
        <div>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Sign up to start organizing tasks</p>
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
            <label>Email</label>
            <input
              type="email"
              required
              className={styles.input}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
            <UserPlus size={18} />
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className={styles.link}>
          Already have an account? <Link href="/login">Sign in here</Link>
        </p>
      </div>
      </div>
    </div>
  );
}
