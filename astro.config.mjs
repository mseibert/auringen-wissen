// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://in-wiesbaden-auringen.de',
	integrations: [
		starlight({
			title: 'Auringen Wissen',
			description: 'Wissen über Wiesbaden-Auringen: Vereine, Geschichte, Freizeit, Politik und Orte.',
			logo: { src: './src/assets/auringen-logo.jpg', alt: 'Auringen' },
			defaultLocale: 'root',
			locales: {
				root: { label: 'Deutsch', lang: 'de' },
			},
			sidebar: [{ label: 'Auringen', items: [{ autogenerate: { directory: '.' } }] }],
			editLink: {
				baseUrl: 'https://github.com/mseibert/auringen-wissen/edit/main/',
			},
		}),
	],
});
