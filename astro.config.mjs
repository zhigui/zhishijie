import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
export default defineConfig({site:'https://zhigui.github.io',base:'/zhishijie',trailingSlash:'always',output:'static',integrations:[sitemap({filter: url => !url.endsWith('/404/')})]});
