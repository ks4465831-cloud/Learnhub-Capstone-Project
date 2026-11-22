import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const out = async () => { await logout(); navigate('/'); };

  return (
    <header className="nav">
      <Link to="/" className="brand">LearnHub</Link>
      <nav>
        <NavLink to="/">Courses</NavLink>
        {user?.role === 'student' && <NavLink to="/my-learning">My learning</NavLink>}
        {user?.role === 'instructor' && <NavLink to="/instructor">Instructor</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        {user ? (
          <>
            <span className="who">{user.name} ({user.role})</span>
            <button className="btn ghost" onClick={out}>Log out</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log in</NavLink>
            <Link to="/register" className="btn">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
