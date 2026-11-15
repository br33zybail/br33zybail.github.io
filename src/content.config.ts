import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const step = z.object({ label: z.string(), note: z.string() });
const bar = z.object({ label: z.string(), value: z.number() });

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    group: z.enum(['platform', 'fastscribe', 'nearbywatch', 'zcash', 'workstation']),
    kinds: z.array(z.enum(['ai', 'data', 'revops', 'infra', 'security'])).min(1).max(3),
    order: z.number(),
    summary: z.string().max(170),
    facts: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    diagram: z.object({
      type: z.enum(['flow', 'ladder', 'bars']),
      caption: z.string(),
      steps: z.array(step).optional(),
      unit: z.string().optional(),
      bars: z.array(bar).optional(),
    }),
    links: z.array(z.object({ label: z.string(), href: z.string().url() })).default([]),
    shots: z.array(z.string()).default([]),
    shotsNote: z.string().optional(),
    demo: z.enum(['forecast', 'map']).optional(),
    screen: z.enum(['myday', 'brief', 'territory', 'roleplay']).optional(),
    timeline: z.array(z.object({ date: z.string(), label: z.string(), note: z.string() })).optional(),
  }),
});

export const collections = { projects };
