import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

function QuizTaker({ quiz }) {
  const [answers, setAnswers] = useState(Array(quiz.questions.length).fill(null));
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try { setResult(await api(`/quizzes/${quiz._id}/attempt`, { method: 'POST', body: { answers } })); }
    catch (err) { setError(err.message); }
  };

  return (
    <form className="card stack" onSubmit={submit}>
      <h3>{quiz.title}</h3>
      {quiz.questions.map((q, qi) => (
        <fieldset key={q._id} style={{ border: 0, padding: 0, margin: 0 }}>
          <legend><strong>{qi + 1}. {q.text}</strong></legend>
          {q.options.map((o, oi) => (
            <label key={oi} className="option">
              <input type="radio" name={`q${qi}`} disabled={!!result} checked={answers[qi] === oi}
                onChange={() => setAnswers(answers.map((a, i) => (i === qi ? oi : a)))} />
              <span>{o}</span>
              {result && oi === result.correctAnswers[qi] && <span className="correct">✓ correct</span>}
              {result && answers[qi] === oi && oi !== result.correctAnswers[qi] && <span className="wrong">✗ your answer</span>}
            </label>
          ))}
        </fieldset>
      ))}
      {error && <div className="error">{error}</div>}
      {result ? (
        <div className={result.attempt.passed ? 'success' : 'error'}>
          Score: {result.attempt.score}/{result.attempt.total} ({result.attempt.percentage}%) — {result.attempt.passed ? 'Passed' : 'Not passed, review and try again'}
        </div>
      ) : (
        <button className="btn" disabled={answers.includes(null)}>Submit quiz</button>
      )}
    </form>
  );
}

export default function Learn() {
  const { id } = useParams();
  const { user } = useAuth();
  const isStudent = user.role === 'student';
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [done, setDone] = useState([]);
  const [current, setCurrent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const l = await api(`/courses/${id}/lessons`);
        setCourse(l.course); setLessons(l.lessons); setCurrent(l.lessons[0]?._id || null);
        setQuizzes((await api(`/courses/${id}/quizzes`)).quizzes);
        if (isStudent) setDone((await api(`/enrollments/${id}`)).enrollment?.completedLessons || []);
      } catch (e) { setError(e.message); }
    })();
  }, [id, isStudent]);

  const toggle = async (lessonId) => {
    try {
      const d = await api(`/enrollments/${id}/lessons/${lessonId}/complete`, { method: 'POST' });
      setDone(d.completedLessons);
    } catch (e) { setError(e.message); }
  };

  if (error) return <div className="error">{error}</div>;
  if (!course) return <p className="muted">Loading…</p>;
  const lesson = lessons.find((l) => l._id === current);
  const pct = lessons.length ? Math.round((done.length / lessons.length) * 100) : 0;

  return (
    <div className="stack">
      <h1>{course.title}</h1>
      {isStudent && (<><div className="progress"><span style={{ width: `${pct}%` }} /></div>
        <small className="muted">{pct}% complete</small></>)}
      <div className="layout">
        <aside className="card">
          {course.modules.map((m) => (
            <div key={m._id}>
              <h3>{m.title}</h3>
              <ul className="lesson-list">
                {lessons.filter((l) => l.module === m._id).map((l) => (
                  <li key={l._id} className={l._id === current ? 'current' : ''} onClick={() => setCurrent(l._id)}>
                    {isStudent && <input type="checkbox" aria-label={`Mark ${l.title} complete`} checked={done.includes(l._id)}
                      onClick={(e) => e.stopPropagation()} onChange={() => toggle(l._id)} />}
                    {l.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {lessons.length === 0 && <p className="muted">No lessons yet.</p>}
        </aside>
        <section className="stack">
          {lesson ? (
            <div className="card stack">
              <h2>{lesson.title}</h2>
              {lesson.videoUrl && <p><a href={lesson.videoUrl} target="_blank" rel="noreferrer">Watch the video</a></p>}
              <div className="content">{lesson.content || 'No written content for this lesson.'}</div>
              {isStudent && <button className="btn small" onClick={() => toggle(lesson._id)}>
                {done.includes(lesson._id) ? 'Mark as not done' : 'Mark as done'}</button>}
            </div>
          ) : <p className="muted">Select a lesson to begin.</p>}
          {quizzes.length > 0 && <h2>Quizzes</h2>}
          {quizzes.map((q) => (isStudent ? <QuizTaker key={q._id} quiz={q} /> :
            <div key={q._id} className="card">{q.title} ({q.questions.length} questions)</div>))}
        </section>
      </div>
    </div>
  );
}
