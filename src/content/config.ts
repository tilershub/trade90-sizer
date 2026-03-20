import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    excerpt: z.string().optional(),
    feature_image: z.string().optional().nullable(),
    published_at: z.string(),
    updated_at: z.string().optional(),
    tags: z.array(z.string()).default([]),
    primary_tag: z.string().optional().nullable(),
    meta_title: z.string().optional().nullable(),
    meta_description: z.string().optional().nullable(),
    reading_time: z.number().optional().nullable(),
    author: z.string().default('TRADE90'),
  }),
});

export const collections = { posts };
