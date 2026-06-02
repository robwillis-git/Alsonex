import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * News content collection.
 * Real posts are authored as Markdown in src/content/news/.
 *
 * Posts are published UNDATED: the legacy Alsonex site carried no publication
 * dates on any news item and none could be sourced (Rob's locked decision, see
 * Team Inbox/content/news.md). An optional `order` controls list ordering
 * (ascending) — no date is stored or rendered.
 */
const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    tag: z.string().default('Announcement'),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

export const collections = { news };
