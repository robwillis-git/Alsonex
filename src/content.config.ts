import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * News content collection.
 * Real posts are authored as Markdown in src/content/news/ by Cora (Phase 2).
 * One example post ships with the scaffold to prove the pipeline.
 */
const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tag: z.string().default('Announcement'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { news };
