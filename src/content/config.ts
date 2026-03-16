import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	schema: z.object({
		title: z.string(),
		date: z.union([z.string(), z.date()]),  // Handle both string and Date
		tags: z.union([z.array(z.string()), z.null()]).optional().transform(val => val || []),
		categories: z.union([z.array(z.string()), z.null()]).optional().transform(val => val || []),
	}),
});

export const collections = { blog };
