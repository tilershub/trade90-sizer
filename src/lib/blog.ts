import { getCollection, type CollectionEntry } from 'astro:content';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  feature_image: string | null;
  published_at: string;
  updated_at: string;
  status: 'draft' | 'published';
  tags: string[];
  primary_tag: string | null;
  meta_title: string | null;
  meta_description: string | null;
  reading_time: number | null;
  author: string;
}

function entrySlug(entry: CollectionEntry<'posts'>): string {
  return entry.id.replace(/\.mdx?$/, '');
}

function entryToPost(entry: CollectionEntry<'posts'>): BlogPost {
  const d = entry.data;
  return {
    id: entry.id,
    title: d.title,
    slug: entrySlug(entry),
    excerpt: d.excerpt ?? null,
    content: null,
    feature_image: d.feature_image ?? null,
    published_at: d.published_at,
    updated_at: d.updated_at ?? d.published_at,
    status: 'published',
    tags: d.tags ?? [],
    primary_tag: d.primary_tag ?? null,
    meta_title: d.meta_title ?? null,
    meta_description: d.meta_description ?? null,
    reading_time: d.reading_time ?? null,
    author: d.author ?? 'TRADE90',
  };
}

export async function getPosts(options: { limit?: number; tag?: string } = {}): Promise<BlogPost[]> {
  let entries = await getCollection('posts');

  if (options.tag) {
    entries = entries.filter((e) => e.data.tags?.includes(options.tag!));
  }

  entries.sort(
    (a, b) =>
      new Date(b.data.published_at).getTime() - new Date(a.data.published_at).getTime()
  );

  if (options.limit) entries = entries.slice(0, options.limit);

  return entries.map(entryToPost);
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  const entries = await getCollection('posts');
  const entry = entries.find((e) => entrySlug(e) === slug);
  return entry ? entryToPost(entry) : null;
}

export async function getPostEntry(slug: string): Promise<CollectionEntry<'posts'> | null> {
  const entries = await getCollection('posts');
  return entries.find((e) => entrySlug(e) === slug) ?? null;
}

export async function getRelatedPosts(
  primaryTag: string,
  excludeId: string,
  limit = 3
): Promise<BlogPost[]> {
  let entries = await getCollection('posts');
  entries = entries.filter(
    (e) => entrySlug(e) !== excludeId && e.data.tags?.includes(primaryTag)
  );
  entries.sort(
    (a, b) =>
      new Date(b.data.published_at).getTime() - new Date(a.data.published_at).getTime()
  );
  return entries.slice(0, limit).map(entryToPost);
}

export async function getAllSlugs(): Promise<string[]> {
  const entries = await getCollection('posts');
  return entries.map((e) => entrySlug(e));
}

export async function getAllTags(): Promise<string[]> {
  const entries = await getCollection('posts');
  const seen = new Set<string>();
  for (const entry of entries) {
    for (const tag of entry.data.tags ?? []) seen.add(tag);
  }
  return [...seen].sort();
}

/** Estimate reading time from HTML content (200 wpm). */
export function calcReadingTime(html: string): number {
  const words = html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
