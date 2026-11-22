import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function MyLearning() {
  const [items, setItems] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/enrollments/me').then((d) => setItems(d.enrollments)).catch((e) => setError(e.message));
    api('/quizzes/attempts/me').then((d) => setAttempts(d.attempts)).catch(() => {});
  }, []);

  if (error) return <div className="error">{error}</div>;
  if (!items) return <p className="muted">Loading…</p>;

  return (
    <div className="stack">
      <h1>My learning</h1>
      {items.length === 0 ? (
        <p>You haven’t enrolled in anything yet. <Link to="/">Browse courses</Link></p>
      ) : (
        <div className="grid">
          {items.map((e) => (
            <div key={e._id} className="card stack">
              <h3>{e.course.title}</h3>
              <div className="progress" aria-label={`${e.progress}% complete`}><span style={{ width: `${e.progress}%` }} /></div>
              <small className="muted">{e.completedLessons.length} of {e.totalLessons} lessons done ({e.progress}%)</small>
              <Link className="btn small" to={`/learn/${e.course._id}`}>Open course</Link>
            </div>
          ))}
        </div>
      )}
      <h2>Quiz attempts</h2>
      {attempts.length === 0 ? <p className="muted">No quiz attempts yet.</p> : (
        <div className="tablewrap"><table>
          <thead><tr><th>Quiz</th><th>Score</th><th>Result</th><th>Date</th></tr></thead>
          <tbody>{attempts.map((a) => (
            <tr key={a._id}><td>{a.quiz?.title}</td><td>{a.score}/{a.total} ({a.percentage}%)</td>
              <td className={a.passed ? 'correct' : 'wrong'}>{a.passed ? 'Passed' : 'Failed'}</td>
              <td>{new Date(a.createdAt).toLocaleDateString()}</td></tr>
          ))}</tbody>
        </table></div>
      )}
    </div>
  );
}
