import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/courses/${id}`).then(setData).catch((e) => setError(e.message));
  }, [id, user]);

  const enroll = async () => {
    if (!user) return navigate('/login');
    try {
      await api(`/courses/${id}/enroll`, { method: 'POST' });
      navigate(`/learn/${id}`);
    } catch (e) { setError(e.message); }
  };

  if (error && !data) return <div className="error">{error}</div>;
  if (!data) return <p className="muted">Loading…</p>;
  const { course, lessons, enrolled, isOwner } = data;

  return (
    <div className="stack">
      <div className="row"><span className="tag">{course.category}</span>
        {course.status !== 'approved' && <span className={`tag ${course.status}`}>{course.status}</span>}</div>
      <h1>{course.title}</h1>
      <p className="muted">Taught by {course.instructor?.name}</p>
      <p>{course.description}</p>
      {error && <div className="error">{error}</div>}
      <div className="row">
        {enrolled && <Link className="btn" to={`/learn/${id}`}>Continue learning</Link>}
        {!enrolled && user?.role === 'student' && <button className="btn" onClick={enroll}>Enrol for free</button>}
        {!user && <button className="btn" onClick={enroll}>Log in to enrol</button>}
        {isOwner && user?.role === 'instructor' && <Link className="btn" to={`/instructor/courses/${id}`}>Manage course</Link>}
      </div>
      <h2>What you will learn</h2>
      {course.modules.length === 0 ? <p className="muted">The instructor hasn’t added modules yet.</p> : (
        <div className="stack">
          {course.modules.map((m) => (
            <div key={m._id} className="card">
              <h3>{m.title}</h3>
              <ul>{lessons.filter((l) => l.module === m._id).map((l) => <li key={l._id}>{l.title}</li>)}</ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
