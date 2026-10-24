// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://in-wiesbaden-auringen.de',
	vite: {
		resolve: {
			// Kurze Importpfade in MDX-Dateien, z. B. "@/components/EventList.astro".
			alias: { '@': new URL('./src', import.meta.url).pathname },
		},
	},
	// Verhindert, dass Dev- und Preview-Server alte Seiten aus dem Cache zeigen.
	server: { headers: { 'Cache-Control': 'no-store' } },
	integrations: [
		starlight({
			title: 'Wissen über Wiesbaden-Auringen',
			description:
				'Wissen über Wiesbaden-Auringen: Vereine, Geschichte, Freizeit, Politik und Orte.',
			logo: { src: './src/assets/auringen-logo.jpg', alt: 'Auringen' },
			defaultLocale: 'root',
			locales: { root: { label: 'Deutsch', lang: 'de' } },
			tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
			pagination: true,
			editLink: {
				baseUrl: 'https://github.com/mseibert/auringen-wissen/edit/main/',
			},
			sidebar: [
				{ label: 'Start', link: '/' },
				{ label: 'Termine', link: '/termine/' },
				{
					label: 'Leben in Auringen',
					items: [
						{
							label: 'Freizeit',
							items: [
								{ label: 'Übersicht', link: '/leben-in-auringen/freizeit/' },
								{
									label: 'Spielplatz in den langen Ruten',
									items: [
										{
											label: 'Übersicht',
											link: '/leben-in-auringen/freizeit/spielplatz-in-den-langen-ruten/',
										},
										{
											label: 'Weinstand 2021',
											link: '/leben-in-auringen/freizeit/spielplatz-in-den-langen-ruten/weinstand-2021/',
										},
									],
								},
								{ label: 'Wildbret aus Auringen', link: '/leben-in-auringen/freizeit/wildbret/' },
							],
						},
						{
							label: 'Vereine und Organisationen',
							items: [
								{ label: 'Übersicht', link: '/leben-in-auringen/vereine/' },
								{ label: 'Auringer Vereine', link: '/leben-in-auringen/vereine/auringer-vereine/' },
								{ label: 'Ferienwohnungen', link: '/leben-in-auringen/vereine/ferienwohnungen/' },
							],
						},
						{
							label: 'Politik',
							items: [
								{ label: 'Übersicht', link: '/leben-in-auringen/politik/' },
								{
									label: 'Gefahren am Wellinger (L3028)',
									link: '/leben-in-auringen/politik/gefahren-wellinger-l3028/',
								},
								{
									label: 'Gehweg zur Auringer Mühle',
									link: '/leben-in-auringen/politik/gehweg-zur-auringer-muehle/',
								},
								{
									label: 'Ausbau der Rudolf-Dietz-Schule',
									link: '/leben-in-auringen/politik/rudolf-dietz-schule/',
								},
							],
						},
						{
							label: 'Veranstaltungen',
							items: [
								{ label: 'Übersicht', link: '/leben-in-auringen/veranstaltungen/' },
								{
									label: 'Weinstand',
									link: '/leben-in-auringen/veranstaltungen/weinstand/',
								},
								{
									label: 'Lebendiger Adventskalender',
									link: '/leben-in-auringen/veranstaltungen/lebendiger-adventskalender/',
								},
							],
						},
					],
				},
				{
					label: 'Geschichte',
					items: [
						{ label: 'Übersicht', link: '/geschichte/' },
						{ label: 'Ehrenmal von 1896', link: '/geschichte/ehrenmal-1896/' },
						{
							label: 'Ehrenmal für die Gefallenen',
							link: '/geschichte/ehrenmal-gefallene/',
						},
					],
				},
				{
					label: 'Zahlen und Wahlergebnisse',
					link: '/zahlen-und-wahlergebnisse/',
				},
			],
		}),
		// Muss nach Starlight stehen, sonst meckert astro-expressive-code.
		mdx(),
	],
});
