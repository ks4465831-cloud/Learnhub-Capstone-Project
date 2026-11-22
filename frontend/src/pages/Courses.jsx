import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function Courses() {
  const [data, setData] = useState({ courses: [], pages: 1, categories: [] });
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 9 });
    if (search) params.set('q', search);
    if (category) params.set('category', category);
    api(`/courses?${params}`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [search, category, page]);

  const submit = (e) => { e.preventDefault(); setPage(1); setSearch(q); };

  return (
    <div className="stack">
      <h1>Find a course</h1>
      <form className="row" onSubmit={submit}>
        <input style={{ maxWidth: 320 }} placeholder="Search by title or topic" value={q} onChange={(e) => setQ(e.target.value)} />
        <select style={{ maxWidth: 200 }} value={category} onChange={(e) => { setPage(1); setCategory(e.target.value); }}>
          <option value="">All categories</option>
          {data.categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button className="btn">Search</button>
      </form>
      {error && <div className="error">{error}</div>}
      {loading ? <p className="muted">Loading…</p> : data.courses.length === 0 ? (
        <p className="muted">No courses match. Try a different search.</p>
      ) : (
        <div className="grid">
          {data.courses.map((c) => (
            <article key={c._id} className="card stack">
              <span className="tag">{c.category}</span>
              <h3>{c.title}</h3>
              <p className="muted">{c.description.slice(0, 110)}{c.description.length > 110 ? '…' : ''}</p>
              <div className="row between">
                <small className="muted">By {c.instructor?.name}</small>
                <Link className="btn small" to={`/courses/${c._id}`}>View course</Link>
              </div>
            </article>
          ))}
        </div>
      )}
      {data.pages > 1 && (
        <div className="row">
          <button className="btn ghost small" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} of {data.pages}</span>
          <button className="btn ghost small" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
