import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const user = await register(form);
      navigate(user.role === 'instructor' ? '/instructor' : '/my-learning', { replace: true });
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="stack">
      <h1>Create your account</h1>
      {error && <div className="error">{error}</div>}
      <form className="form" onSubmit={submit}>
        <label>Full name<input name="name" value={form.name} onChange={change} required /></label>
        <label>Email<input name="email" type="email" value={form.email} onChange={change} required /></label>
        <label>Password (min 6 characters)<input name="password" type="password" minLength={6} value={form.password} onChange={change} required /></label>
        <label>I want to
          <select name="role" value={form.role} onChange={change}>
            <option value="student">Learn (student)</option>
            <option value="instructor">Teach (instructor)</option>
          </select>
        </label>
        <button className="btn" disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
      </form>
      <p>Already registered? <Link to="/login">Log in</Link></p>
    </div>
  );
}
