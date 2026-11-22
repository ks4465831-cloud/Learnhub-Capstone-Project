import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function AdminPanel() {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    api(`/admin/courses${filter ? `?status=${filter}` : ''}`).then((d) => setCourses(d.courses)).catch((e) => setError(e.message));
    api('/admin/users').then((d) => setUsers(d.users)).catch(() => {});
    api('/analytics/admin').then(setStats).catch(() => {});
  };
  useEffect(load, [filter]);

  const setStatus = async (id, status) => {
    try { await api(`/admin/courses/${id}/status`, { method: 'PATCH', body: { status } }); load(); }
    catch (e) { setError(e.message); }
  };

  return (
    <div className="stack">
      <h1>Admin panel</h1>
      {error && <div className="error">{error}</div>}
      {stats && (
        <div className="grid">
          <div className="card"><h3>Users</h3>{stats.usersByRole.map((u) => <div key={u._id}>{u._id}: <strong>{u.count}</strong></div>)}</div>
          <div className="card"><h3>Courses</h3>{stats.coursesByStatus.map((u) => <div key={u._id}>{u._id}: <strong>{u.count}</strong></div>)}</div>
          <div className="card"><h3>Top courses</h3>
            {stats.topCourses.length === 0 ? <span className="muted">No enrolments yet</span> :
              stats.topCourses.map((t) => <div key={t.title}>{t.title}: <strong>{t.enrolments}</strong></div>)}</div>
        </div>
      )}

      <div className="row between"><h2>Courses</h2>
        <select style={{ maxWidth: 180 }} value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option><option value="pending">Pending</option>
          <option value="approved">Approved</option><option value="blocked">Blocked</option>
        </select></div>
      <div className="tablewrap"><table>
        <thead><tr><th>Title</th><th>Instructor</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{courses.map((c) => (
          <tr key={c._id}><td>{c.title}</td><td>{c.instructor?.name}</td>
            <td><span className={`tag ${c.status}`}>{c.status}</span></td>
            <td className="row">
              {c.status !== 'approved' && <button className="btn small" onClick={() => setStatus(c._id, 'approved')}>Approve</button>}
              {c.status !== 'blocked' && <button className="btn danger small" onClick={() => setStatus(c._id, 'blocked')}>Block</button>}
            </td></tr>
        ))}</tbody>
      </table></div>

      <h2>Users</h2>
      <div className="tablewrap"><table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
        <tbody>{users.map((u) => (
          <tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{new Date(u.createdAt).toLocaleDateString()}</td></tr>
        ))}</tbody>
      </table></div>
    </div>
  );
}
