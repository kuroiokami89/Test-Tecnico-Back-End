// file: app/page.jsx (o il file dove hai il componente Home)
// mantiene "use client"
"use client";

import { useState, useEffect, useRef } from "react";
import "./globals.css";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); // indica fetch in corso
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    image: "",
    featured: true,
    tags: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // ricerca
  const [searchTerm, setSearchTerm] = useState("");
  const searchTimer = useRef(null);

  // per distinguere "prima" load da fetch successive
  const isInitialLoad = useRef(true);

  // per cancellare fetch precedenti
  const abortControllerRef = useRef(null);

  useEffect(() => {
    fetchFeaturedPosts(); // prima fetch senza query
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounce per la ricerca
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchFeaturedPosts(searchTerm);
    }, 400); // 400ms per una digitazione più fluida

    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  async function fetchFeaturedPosts(q = "") {
    // cancella fetch precedente se presente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setLoading(true);
      setError(null);

      const url = q ? `/api/featured-posts?q=${encodeURIComponent(q)}` : `/api/featured-posts`;

      const res = await fetch(url, { signal: controller.signal });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(`Errore HTTP: ${res.status} ${text ?? ""}`);
      }

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || "Errore nel caricamento");
      }

      const data = Array.isArray(result.data) ? result.data : [result.data];
      setPosts(data);
    } catch (err) {
      // Se l'errore è dovuto ad abort, ignoralo
      if (err.name === "AbortError") {
        // fetch cancellato — non considerarlo un errore visibile
        return;
      }
      console.error("Errore fetch:", err);
      setError(err.message || "Errore sconosciuto");
      setPosts([]); // opzionale: svuota lista in caso di errore
    } finally {
      setLoading(false);
      // dopo prima fetch impostiamo initialLoad a false
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
      }
      // puliamo controller se non è più utile
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const response = await fetch("/api/featured-posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt,
          image: formData.image,
          featured: formData.featured,
          tags: tagsArray,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert("Post creato con successo!");
        setFormData({
          title: "",
          slug: "",
          excerpt: "",
          image: "",
          featured: true,
          tags: "",
        });
        setShowForm(false);
        // Rifetch mantenendo il filtro corrente
        fetchFeaturedPosts(searchTerm);
      } else {
        alert("Errore: " + (result.error || "Impossibile creare il post"));
      }
    } catch (err) {
      alert("Errore durante la creazione: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Mostra la schermata di caricamento SOLO se è il primo caricamento e non abbiamo post
  if (loading && posts.length === 0 && isInitialLoad.current) {
    return (
      <div className="loading-container">
        <p>Caricamento iniziale...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="header">
        <div className="header-content">
          <div>
            <h1>Featured Posts</h1>
            <p>Post in evidenza dal blog</p>
          </div>

          {/* SEARCH UI */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="search"
              placeholder="Cerca per titolo, excerpt o tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: "6px 8px" }}
              aria-label="Cerca post"
            />

            {/* indicatore discreto per fetch in corso (non-blocking) */}
            {loading && !isInitialLoad.current ? (
              <span style={{ fontSize: 12, opacity: 0.85 }}>ricerca…</span>
            ) : null}

            <button
              className="add-post-btn"
              onClick={() => setShowForm(!showForm)}
              type="button"
            >
              {showForm ? "Chiudi Form" : "+ Aggiungi Post"}
            </button>
          </div>
        </div>
      </header>

      {/* mostra errore inline (non distruttivo) */}
      {error && (
        <div className="error-inline" style={{ padding: 12 }}>
          <strong>Errore:</strong> {error}
          <div style={{ marginTop: 8 }}>
            <button onClick={() => fetchFeaturedPosts(searchTerm)}>Riprova</button>
            <button onClick={() => setError(null)} style={{ marginLeft: 8 }}>
              Chiudi
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit} className="post-form">
            <h2>Aggiungi Nuovo Post</h2>

            <div className="form-group">
              <label>Titolo *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Es: Il mio nuovo post"
              />
            </div>

            <div className="form-group">
              <label>Slug *</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                placeholder="Es: il-mio-nuovo-post"
              />
            </div>

            <div className="form-group">
              <label>Excerpt</label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                rows="3"
                placeholder="Breve descrizione del post..."
              />
            </div>

            <div className="form-group">
              <label>Immagine URL</label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="/images/posts/esempio.jpg"
              />
            </div>

            <div className="form-group">
              <label>Tags (separati da virgola)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="nextjs, react, javascript"
              />
            </div>

            <div className="form-group-checkbox">
              <label>
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                />
                <span>Post Featured</span>
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-cancel"
              >
                Annulla
              </button>
              <button type="submit" disabled={submitting} className="btn-submit">
                {submitting ? "Creazione..." : "Crea Post"}
              </button>
            </div>
          </form>
        </div>
      )}

      <main className="main-content">
        {posts.length === 0 ? (
          <div className="empty-state">
            <p>Nessun post featured disponibile</p>
            {/* se non ci sono post e non è il primo load, mostra possibilità di riprovare */}
            {!isInitialLoad.current && !loading && (
              <div style={{ marginTop: 8 }}>
                <button onClick={() => fetchFeaturedPosts(searchTerm)}>Ricarica</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="counter">
              <span>{posts.length} post featured</span>
            </div>

            <div className="posts-grid">
              {posts.map((post) => (
                <article key={post.id} className="post-card">
                  <h2>{post.title}</h2>

                  <p className="post-excerpt">{post.excerpt}</p>

                  {post.tags && post.tags.length > 0 && (
                    <div className="tags">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="post-footer">
                    <span className="post-date">
                      {new Date(post.createdAt).toLocaleDateString("it-IT", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
