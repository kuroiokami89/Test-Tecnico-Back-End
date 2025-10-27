This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/create-next-app).

## Getting Started

Before running the project, make sure to install all dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/route.ts`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Featured Posts API
This project includes a complete featured posts API with GET and POST endpoints.

## Base URL
/api/featured-posts

## GET Endpoint
Retrieve featured posts with optional filtering.

Parameters:

id (optional): Get a specific post by ID

q (optional): Search query to filter posts by title, excerpt, or tags

Examples:

Get all featured posts:

```bash
curl http://localhost:3000/api/featured-posts
```

Get a specific post by ID:
```bash
curl "http://localhost:3000/api/featured-posts?id=1"
```

Search posts by query:
```bash
curl "http://localhost:3000/api/featured-posts?q=nextjs"
```

## POST Endpoint
Add a new featured post to the collection.

Required fields: title, slug

Optional fields: excerpt, image, featured, tags

Example using curl:

```bash
curl -X POST http://localhost:3000/api/featured-posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Blog Post",
    "slug": "new-blog-post",
    "excerpt": "This is a new blog post about web development",
    "image": "/images/posts/new-post.jpg",
    "featured": true,
    "tags": ["webdev", "tutorial"]
  }'
```

Response:

Success: Returns the created post with status 201

Error: Returns error message with status 400 for missing fields or invalid JSON

## Data Structure
Posts have the following structure:

{
  id: number,           // Auto-generated incremental ID
  title: string,        // Required - Post title
  slug: string,         // Required - URL-friendly identifier
  excerpt: string,      // Optional - Short description
  image: string,        // Optional - Image path/URL
  createdAt: string,    // Auto-generated ISO timestamp
  featured: boolean,    // Optional - Featured status (defaults to false)
  tags: string[]        // Optional array of tags
}

This directory contains example API routes for the headless API app.

For more details, see [route.js file convention](https://nextjs.org/docs/app/api-reference/file-conventions/route).
# Test-Tecnico-Back-End
