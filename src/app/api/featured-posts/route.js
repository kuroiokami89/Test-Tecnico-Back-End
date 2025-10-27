// file: app/api/featured-posts/route.js  (o il file dove hai GET/POST)
import { NextResponse } from "next/server";

// ARRAY CHE SIMULA DB CON 5 OGGETTI
let featuredPosts = [
  {
    id: 1,
    title: "Design minimalista: principi fondamentali",
    slug: "design-minimalista-principi",
    excerpt: "Scopri come applicare i principi del design minimalista alle interfacce web.",
    image: "/images/posts/design-minimal.jpg",
    createdAt: "2025-05-10T10:00:00.000Z",
    featured: true,
    tags: ["design", "ui"],
  },
  {
    id: 2,
    title: "Ottimizzare le performance in Next.js",
    slug: "ottimizzare-performance-nextjs",
    excerpt: "Trucchi concreti per migliorare il tempo di caricamento e ridurre il bundle size.",
    image: "/images/posts/nextjs-performance.jpg",
    createdAt: "2025-06-01T12:00:00.000Z",
    featured: true,
    tags: ["nextjs", "performance"],
  },
  {
    id: 3,
    title: "Introduzione a TypeScript per front-end",
    slug: "introduzione-typescript-frontend",
    excerpt: "Perché usare TypeScript e come iniziare in progetti React / Next.js.",
    image: "/images/posts/typescript-intro.jpg",
    createdAt: "2025-06-15T09:30:00.000Z",
    featured: false,
    tags: ["typescript", "frontend"],
  },
  {
    id: 4,
    title: "Animazioni con CSS e Framer Motion",
    slug: "animazioni-css-framer-motion",
    excerpt: "Confronto tra animazioni CSS e quelle gestite con Framer Motion.",
    image: "/images/posts/animations.jpg",
    createdAt: "2025-07-10T08:00:00.000Z",
    featured: false,
    tags: ["css", "animations"],
  },
  {
    id: 5,
    title: "Accessibilità: checklist rapida",
    slug: "accessibilita-checklist-rapida",
    excerpt: "Controlli pratici da fare prima di pubblicare una pagina web.",
    image: "/images/posts/accessibility-check.jpg",
    createdAt: "2025-06-02T10:45:00.000Z",
    featured: true,
    tags: ["accessibility", "qa"],
  },
];

// Funzione helper per generare ID incrementale
function getNextId() {
  return featuredPosts.length > 0
    ? Math.max(...featuredPosts.map((p) => p.id)) + 1
    : 1;
}

// GET: restituisce tutti i post 'featured' o filtra con q
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const q = searchParams.get("q")?.trim() ?? "";

  // Se viene specificato un ID, ritorna quel singolo post
  if (id) {
    const post = featuredPosts.find((p) => p.id === Number(id));
    if (!post) {
      return NextResponse.json(
        {
          success: false,
          error: "Post non trovato",
        },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: post,
    });
  }

  // filtro iniziale: solo featured === true
  let featured = featuredPosts.filter((post) => post.featured === true);

  // se q è presente, filtriamo ulteriormente (case-insensitive)
  if (q) {
    const qLower = q.toLowerCase();
    featured = featured.filter((post) => {
      const titleMatch = post.title && post.title.toLowerCase().includes(qLower);
      const excerptMatch = post.excerpt && post.excerpt.toLowerCase().includes(qLower);
      const tagsMatch =
        Array.isArray(post.tags) &&
        post.tags.some((t) => String(t).toLowerCase().includes(qLower));
      return titleMatch || excerptMatch || tagsMatch;
    });
  }

  return NextResponse.json({
    success: true,
    data: featured,
    count: featured.length,
  });
}

// POST: aggiunge un nuovo post all'array
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      excerpt = "",
      image = "",
      featured = false,
      tags = [],
    } = body ?? {};

    // Validazione campi obbligatori
    if (!title || !slug) {
      return NextResponse.json(
        {
          success: false,
          error: "Campi obbligatori mancanti: title e slug",
        },
        { status: 400 }
      );
    }

    // Crea il nuovo post
    const newPost = {
      id: getNextId(),
      title,
      slug,
      excerpt,
      image,
      createdAt: new Date().toISOString(),
      featured: Boolean(featured),
      tags: Array.isArray(tags) ? tags : [],
    };

    // Aggiunge il post all'array
    featuredPosts.push(newPost);

    // Ritorna il post creato con status 201
    return NextResponse.json(
      {
        success: true,
        data: newPost,
        message: "Post creato con successo",
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: "Corpo JSON non valido",
      },
      { status: 400 }
    );
  }
}
