import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [report, setReport] = useState([]);
  const [form, setForm] = useState({ title: '', category: '', description: '' });
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => {
    api('/courses/mine/list').then((d) => setCourses(d.courses)).catch((e) => setError(e.message));
    api('/analytics/instructor').then((d) => setReport(d.report)).catch(() => {});
  };
  useEffect(load, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const create = async (e) => {
    e.preventDefault();
    setError(''); setMsg('');
    try {
      await api('/courses', { method: 'POST', body: form });
      setForm({ title: '', category: '', description: '' });
      setMsg('Course created. Add modules and lessons, then wait for admin approval.');
      load();
    } catch (err) { setError(err.message); }
  };
  const remove = async (id) => {
    if (!confirm('Delete this course and all its lessons, quizzes and enrolments?')) return;
    try { await api(`/courses/${id}`, { method: 'DELETE' }); load(); } catch (err) { setError(err.message); }
  };

  return (
    <div className="stack">
      <h1>Instructor dashboard</h1>
      {error && <div className="error">{error}</div>}
      {msg && <div className="success">{msg}</div>}

      <h2>Analytics</h2>
      {report.length === 0 ? <p className="muted">Create a course to see enrolments and quiz scores here.</p> : (
        <div className="tablewrap"><table>
          <thead><tr><th>Course</th><th>Status</th><th>Enrolments</th><th>Quiz attempts</th><th>Average score</th><th>Pass rate</th></tr></thead>
          <tbody>{report.map((r) => (
            <tr key={r.courseId}><td>{r.title}</td><td><span className={`tag ${r.status}`}>{r.status}</span></td>
              <td>{r.enrolments}</td><td>{r.attempts}</td>
              <td>{r.averageScore === null ? '—' : `${r.averageScore}%`}</td>
              <td>{r.passRate === null ? '—' : `${r.passRate}%`}</td></tr>
          ))}</tbody>
        </table></div>
      )}

      <h2>My courses</h2>
      {courses.length === 0 ? <p className="muted">No courses yet.</p> : (
        <div className="grid">
          {courses.map((c) => (
            <div key={c._id} className="card stack">
              <div className="row between"><span className="tag">{c.category}</span><span className={`tag ${c.status}`}>{c.status}</span></div>
              <h3>{c.title}</h3>
              <div className="row">
                <Link className="btn small" to={`/instructor/courses/${c._id}`}>Manage</Link>
                <button className="btn danger small" onClick={() => remove(c._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2>New course</h2>
      <form className="form" onSubmit={create}>
        <label>Title<input name="title" value={form.title} onChange={change} required minLength={3} /></label>
        <label>Category<input name="category" value={form.category} onChange={change} required placeholder="e.g. Web development" /></label>
        <label>Description<textarea name="description" value={form.description} onChange={change} required /></label>
        <button className="btn">Create course</button>
      </form>
    </div>
  );
}
