/**
 * Prüft interne Links im gebauten HTML gegen die tatsächlich gebauten Seiten.
 *
 * Findet tote Verweise, die beim Umbauen entstehen: eine Seite wird entfernt
 * oder umbenannt, ein Link zeigt weiter auf den alten Pfad.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;

async function* files(dir, ext) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) yield* files(path, ext);
		else if (entry.name.endsWith(ext)) yield path;
	}
}

/** Alle gebauten Routen als "/pfad/" — index.html wird zum Verzeichnis. */
const routes = new Set(['/']);
for await (const file of files(DIST, '.html')) {
	const rel = relative(DIST, file).replace(/index\.html$/, '');
	routes.add(`/${rel}`);
}

const exists = async (path) => {
	try {
		return (await stat(join(DIST, path))).isFile();
	} catch {
		return false;
	}
};

const broken = [];

for await (const file of files(DIST, '.html')) {
	const html = await readFile(file, 'utf8');
	const page = `/${relative(DIST, file)}`;

	for (const match of html.matchAll(/href="(\/[^"#?]*)(?:[#?][^"]*)?"/g)) {
		const href = match[1];
		if (href.startsWith('//')) continue;
		if (routes.has(href) || routes.has(`${href}/`)) continue;
		if (await exists(href.slice(1))) continue;
		broken.push(`${page} → ${href}`);
	}
}

if (broken.length > 0) {
	console.error(`\n[check-links] ${broken.length} tote interne Links:\n`);
	for (const entry of [...new Set(broken)].sort()) console.error(`  ${entry}`);
	console.error('');
	process.exit(1);
}

console.log(`[check-links] ${routes.size} Routen, keine toten internen Links`);
