import { defineCollection, z } from "astro:content";

const person = z.object({
  name: z.string(),
  url: z.string().url(),
});

const postSchema = z.object({
  title: z.string(),
  description: z.string(),
  author: person,
  contributors: person.array(),
  tags: z.string().array(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

const posts = defineCollection({
  type: "content",
  schema: postSchema,
});

const postsEn = defineCollection({
  type: "content",
  schema: postSchema,
});

export const collections = { posts, postsEn };
