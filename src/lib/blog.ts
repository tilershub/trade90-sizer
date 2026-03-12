import { supabase } from './supabase';

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

// Selected columns for list views (excludes heavy content field)
const LIST_COLS = 'id,title,slug,excerpt,feature_image,published_at,updated_at,tags,primary_tag,reading_time,author';

export async function getPosts(options: { limit?: number; tag?: string } = {}): Promise<BlogPost[]> {
  let query = supabase
    .from('blog_posts')
    .select(LIST_COLS)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (options.tag) {
    query = query.contains('tags', [options.tag]);
  }
  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[blog] getPosts error:', error.message);
    return [];
  }
  return (data ?? []) as BlogPost[];
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    if (error.code !== 'PGRST116') console.error('[blog] getPost error:', error.message);
    return null;
  }
  return data as BlogPost;
}

export async function getRelatedPosts(
  primaryTag: string,
  excludeId: string,
  limit = 3
): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(LIST_COLS)
    .eq('status', 'published')
    .contains('tags', [primaryTag])
    .neq('id', excludeId)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[blog] getRelatedPosts error:', error.message);
    return [];
  }
  return (data ?? []) as BlogPost[];
}

export async function getAllSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published');

  if (error) {
    console.error('[blog] getAllSlugs error:', error.message);
    return [];
  }
  return (data ?? []).map((row) => row.slug as string);
}

export async function getAllTags(): Promise<string[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('tags')
    .eq('status', 'published');

  if (error) return [];

  const seen = new Set<string>();
  for (const row of data ?? []) {
    for (const tag of (row.tags as string[]) ?? []) seen.add(tag);
  }
  return [...seen].sort();
}

/** Estimate reading time from HTML content (200 wpm). */
export function calcReadingTime(html: string): number {
  const words = html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
