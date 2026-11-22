import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const user = await login(form.email, form.password);
      const home = { student: '/my-learning', instructor: '/instructor', admin: '/admin' }[user.role];
      navigate(location.state?.from?.pathname || home, { replace: true });
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="stack">
      <h1>Log in</h1>
      {error && <div className="error">{error}</div>}
      <form className="form" onSubmit={submit}>
        <label>Email<input name="email" type="email" value={form.email} onChange={change} required /></label>
        <label>Password<input name="password" type="password" value={form.password} onChange={change} required /></label>
        <button className="btn" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      </form>
      <p>New here? <Link to="/register">Create an account</Link></p>
    </div>
  );
}
