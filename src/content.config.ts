import {defineCollection} from 'astro:content';
import {z} from 'astro/zod';
import {glob} from 'astro/loaders';
export const collections = {'solar-terms':defineCollection({loader:glob({pattern:'*.md',base:'./src/content/solar-terms'}),schema:z.object({name:z.string(),slug:z.string(),order:z.number(),season:z.enum(['spring','summer','autumn','winter']),english:z.string(),summary:z.string(),hou:z.array(z.string()).length(3),poem:z.object({sentence:z.string(),author:z.string(),dynasty:z.string(),title:z.string()})})})};
