import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';

const blankQuestion = () => ({ text: '', options: ['', ''], correctIndex: 0 });

export default function ManageCourse() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [moduleTitle, setModuleTitle] = useState('');
  const [lesson, setLesson] = useState({ moduleId: '', title: '', content: '', videoUrl: '' });
  const [quiz, setQuiz] = useState({ title: '', passPercentage: 50, questions: [blankQuestion()] });
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const l = await api(`/courses/${id}/lessons`);
      setCourse(l.course); setLessons(l.lessons);
      setQuizzes((await api(`/courses/${id}/quizzes`)).quizzes);
    } catch (e) { setError(e.message); }
  };
  useEffect(() => { load(); }, [id]);

  const run = async (fn, okMsg) => {
    setError(''); setMsg('');
    try { await fn(); setMsg(okMsg); await load(); } catch (e) { setError(e.message); }
  };

  const addModule = (e) => { e.preventDefault(); run(async () => {
    await api(`/courses/${id}/modules`, { method: 'POST', body: { title: moduleTitle } }); setModuleTitle('');
  }, 'Module added'); };

  const addLesson = (e) => { e.preventDefault(); run(async () => {
    await api(`/courses/${id}/lessons`, { method: 'POST', body: lesson });
    setLesson({ ...lesson, title: '', content: '', videoUrl: '' });
  }, 'Lesson added'); };

  const deleteLesson = (lid) => run(() => api(`/lessons/${lid}`, { method: 'DELETE' }), 'Lesson deleted');
  const deleteQuiz = (qid) => run(() => api(`/quizzes/${qid}`, { method: 'DELETE' }), 'Quiz deleted');

  const setQ = (i, patch) => setQuiz({ ...quiz, questions: quiz.questions.map((q, qi) => (qi === i ? { ...q, ...patch } : q)) });
  const setOpt = (qi, oi, v) => setQ(qi, { options: quiz.questions[qi].options.map((o, i) => (i === oi ? v : o)) });

  const addQuiz = (e) => { e.preventDefault(); run(async () => {
    await api(`/courses/${id}/quizzes`, { method: 'POST', body: quiz });
    setQuiz({ title: '', passPercentage: 50, questions: [blankQuestion()] });
  }, 'Quiz created'); };

  if (!course) return error ? <div className="error">{error}</div> : <p className="muted">Loading…</p>;

  return (
    <div className="stack">
      <p><Link to="/instructor">← Back to dashboard</Link></p>
      <div className="row"><h1>{course.title}</h1><span className={`tag ${course.status}`}>{course.status}</span></div>
      {course.status !== 'approved' && <p className="muted">Students can’t see this course until an admin approves it.</p>}
      {error && <div className="error">{error}</div>}
      {msg && <div className="success">{msg}</div>}

      <h2>Modules and lessons</h2>
      {course.modules.map((m) => (
        <div key={m._id} className="card">
          <h3>{m.title}</h3>
          <ul>{lessons.filter((l) => l.module === m._id).map((l) => (
            <li key={l._id}>{l.title} <button className="btn danger small" onClick={() => deleteLesson(l._id)}>Delete</button></li>
          ))}</ul>
        </div>
      ))}
      <form className="form" onSubmit={addModule}>
        <label>New module title<input value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} required /></label>
        <button className="btn">Add module</button>
      </form>

      {course.modules.length > 0 && (
        <form className="form" onSubmit={addLesson}>
          <h3>Add a lesson</h3>
          <label>Module
            <select value={lesson.moduleId} onChange={(e) => setLesson({ ...lesson, moduleId: e.target.value })} required>
              <option value="">Choose a module</option>
              {course.modules.map((m) => <option key={m._id} value={m._id}>{m.title}</option>)}
            </select>
          </label>
          <label>Lesson title<input value={lesson.title} onChange={(e) => setLesson({ ...lesson, title: e.target.value })} required /></label>
          <label>Content<textarea value={lesson.content} onChange={(e) => setLesson({ ...lesson, content: e.target.value })} /></label>
          <label>Video link (optional)<input value={lesson.videoUrl} onChange={(e) => setLesson({ ...lesson, videoUrl: e.target.value })} /></label>
          <button className="btn">Add lesson</button>
        </form>
      )}

      <h2>Quizzes</h2>
      {quizzes.map((q) => (
        <div key={q._id} className="card row between">
          <span>{q.title} — {q.questions.length} questions, pass at {q.passPercentage}%</span>
          <button className="btn danger small" onClick={() => deleteQuiz(q._id)}>Delete</button>
        </div>
      ))}
      <form className="stack" onSubmit={addQuiz} style={{ maxWidth: 560 }}>
        <h3>New quiz</h3>
        <label>Quiz title<input value={quiz.title} onChange={(e) => setQuiz({ ...quiz, title: e.target.value })} required /></label>
        <label>Pass percentage<input type="number" min="0" max="100" value={quiz.passPercentage}
          onChange={(e) => setQuiz({ ...quiz, passPercentage: Number(e.target.value) })} /></label>
        {quiz.questions.map((q, qi) => (
          <div key={qi} className="card stack">
            <label>Question {qi + 1}<input value={q.text} onChange={(e) => setQ(qi, { text: e.target.value })} required /></label>
            {q.options.map((o, oi) => (
              <div key={oi} className="row">
                <input type="radio" style={{ width: 'auto' }} name={`correct${qi}`} checked={q.correctIndex === oi}
                  onChange={() => setQ(qi, { correctIndex: oi })} aria-label={`Option ${oi + 1} is correct`} />
                <input value={o} placeholder={`Option ${oi + 1}`} onChange={(e) => setOpt(qi, oi, e.target.value)} required style={{ flex: 1 }} />
              </div>
            ))}
            <div className="row">
              <button type="button" className="btn ghost small" onClick={() => setQ(qi, { options: [...q.options, ''] })}>Add option</button>
              {quiz.questions.length > 1 && <button type="button" className="btn danger small"
                onClick={() => setQuiz({ ...quiz, questions: quiz.questions.filter((_, i) => i !== qi) })}>Remove question</button>}
            </div>
            <small className="muted">Select the radio button next to the correct option.</small>
          </div>
        ))}
        <div className="row">
          <button type="button" className="btn ghost" onClick={() => setQuiz({ ...quiz, questions: [...quiz.questions, blankQuestion()] })}>Add question</button>
          <button className="btn">Save quiz</button>
        </div>
      </form>
    </div>
  );
}
