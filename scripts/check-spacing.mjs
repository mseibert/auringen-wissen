/**
 * Prüft das gebaute HTML auf fehlende Leerzeichen an Tag-Grenzen.
 *
 * Astro (wie JSX) entfernt Zeilenumbrüche zwischen Text und einem Tag:
 *
 *   Der Weg steht auf der
 *   <a href="/termine/">Terminseite</a>.
 *
 * wird zu "auf derTerminseite". Der Fehler ist im Quelltext nicht zu sehen
 * und fällt erst im Browser auf. Dieses Script sucht die Muster im Ergebnis
 * und bricht den Build ab, damit so etwas nicht live geht.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;

const INLINE = 'a|strong|em|b|i|code|span|small|abbr|time';

/** Wort klebt direkt vor einem öffnenden Inline-Tag. */
const BEFORE = new RegExp(`[A-Za-zÄÖÜäöüß0-9.,!?…](?=<(?:${INLINE})[\\s>])`, 'g');

/** Text klebt direkt hinter einem schließenden Inline-Tag. */
const AFTER = new RegExp(`</(?:${INLINE})>(?=[A-Za-zÄÖÜäöüß0-9])`, 'g');

async function* htmlFiles(dir) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) yield* htmlFiles(path);
		else if (entry.name.endsWith('.html')) yield path;
	}
}

const findings = [];

for await (const file of htmlFiles(DIST)) {
	const raw = await readFile(file, 'utf8');
	const body = raw
		.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
		.replace(/<pre[^>]*>[\s\S]*?<\/pre>/gi, '');

	for (const [label, pattern] of [
		['vor Tag', BEFORE],
		['nach Tag', AFTER],
	]) {
		for (const match of body.matchAll(pattern)) {
			const start = Math.max(0, match.index - 45);
			const snippet = body
				.slice(start, match.index + 45)
				.replace(/\s+/g, ' ')
				.trim();
			findings.push(`${relative(DIST, file)} [${label}]: …${snippet}…`);
		}
	}
}

if (findings.length > 0) {
	console.error(`\n[check-spacing] ${findings.length} fehlende Leerzeichen an Tag-Grenzen:\n`);
	for (const finding of findings) console.error(`  ${finding}`);
	console.error(
		'\nBehebung: das Tag in dieselbe Zeile wie den Text ziehen oder ein geschütztes Leerzeichen setzen.\n',
	);
	process.exit(1);
}

console.log('[check-spacing] keine fehlenden Leerzeichen an Tag-Grenzen');
