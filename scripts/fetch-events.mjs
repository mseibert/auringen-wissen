/**
 * Holt die Termine von auringer-events.de über den öffentlichen ICS-Feed
 * und schreibt sie nach src/data/events.json.
 *
 * Läuft vor jedem Build. Der Feed ist die einzige Schnittstelle: keine
 * Datenbank, kein Token, keine Kopplung an die Next.js-App.
 *
 * `EVENTS_ICS_URL` überschreibt die Quelle: ein http(s)-URL wird geholt, jeder
 * andere Wert als Datei relativ zur Repo-Wurzel gelesen — so baut die CI gegen
 * einen Fixture, während der Deploy am echten Feed bleibt. Fällt der Feed aus,
 * wird gewarnt und mit dem vorhandenen Stand weitergebaut; eine unlesbare
 * Datei-Quelle bricht dagegen ab, weil sie ein Fehler im Repo ist.
 */
import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const FEED = process.env.EVENTS_ICS_URL ?? 'https://www.auringer-events.de/calendar.ics';
const OUT = resolve(import.meta.dirname, '../src/data/events.json');

/** Warnung, in GitHub Actions zusätzlich als Annotation im Check-Log. */
function warn(message) {
	console.warn(`[events] ${message}`);
	if (process.env.GITHUB_ACTIONS) console.warn(`::warning::${message}`);
}

/**
 * Feed als Text. Gibt `null` zurück, wenn der http(s)-Feed nicht erreichbar
 * ist; eine unlesbare Datei-Quelle beendet den Lauf mit Status 1.
 */
async function readFeed() {
	if (!/^https?:\/\//i.test(FEED)) {
		const path = resolve(import.meta.dirname, '..', FEED);
		try {
			return await readFile(path, 'utf8');
		} catch (error) {
			console.error(`[events] Datei-Quelle nicht lesbar (${path}): ${error.message}`);
			process.exit(1);
		}
	}

	try {
		const res = await fetch(FEED, { headers: { accept: 'text/calendar' } });
		if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
		return await res.text();
	} catch (error) {
		warn(`Feed nicht erreichbar (${FEED}): ${error.message}`);
		return null;
	}
}

/** ICS-Zeilen entfalten (RFC 5545: Fortsetzung beginnt mit Space oder Tab). */
function unfold(text) {
	return text.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '');
}

/** "20260426T120000" -> { iso, hasTime } in Europe/Berlin. */
function parseDate(value, tzid) {
	const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/.exec(value.trim());
	if (!m) return null;
	const [, y, mo, d, hh, mm, ss, utc] = m;
	const hasTime = hh !== undefined;
	if (!hasTime) return { iso: `${y}-${mo}-${d}T00:00:00`, hasTime: false };
	if (utc) {
		const dt = new Date(Date.UTC(+y, +mo - 1, +d, +hh, +mm, +(ss ?? 0)));
		return { iso: berlinIso(dt), hasTime: true };
	}
	return { iso: `${y}-${mo}-${d}T${hh}:${mm}:${ss ?? '00'}`, hasTime: true };
}

/** UTC-Zeitpunkt als Europe/Berlin-Wandzeit ausgeben. */
function berlinIso(dt) {
	const parts = new Intl.DateTimeFormat('sv-SE', {
		timeZone: 'Europe/Berlin',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
	}).formatToParts(dt);
	const get = (t) => parts.find((p) => p.type === t)?.value ?? '00';
	return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`;
}

function unescapeText(value = '') {
	return value
		.replace(/\\n/gi, '\n')
		.replace(/\\,/g, ',')
		.replace(/\\;/g, ';')
		.replace(/\\\\/g, '\\')
		.trim();
}

function parseIcs(raw) {
	const lines = unfold(raw).split('\n');
	const events = [];
	let cur = null;

	for (const line of lines) {
		if (line === 'BEGIN:VEVENT') {
			cur = {};
			continue;
		}
		if (line === 'END:VEVENT') {
			if (cur?.summary && cur.start) events.push(cur);
			cur = null;
			continue;
		}
		if (!cur) continue;

		const idx = line.indexOf(':');
		if (idx === -1) continue;
		const key = line.slice(0, idx);
		const value = line.slice(idx + 1);
		const name = key.split(';')[0];

		switch (name) {
			case 'UID':
				cur.uid = value;
				break;
			case 'SUMMARY':
				cur.summary = unescapeText(value);
				break;
			case 'DTSTART': {
				const d = parseDate(value, key.match(/TZID=([^;]+)/)?.[1]);
				if (d) {
					cur.start = d.iso;
					cur.hasTime = d.hasTime;
				}
				break;
			}
			case 'DTEND': {
				const d = parseDate(value);
				if (d) cur.end = d.iso;
				break;
			}
			case 'LOCATION':
				cur.location = unescapeText(value);
				break;
			case 'DESCRIPTION':
				cur.description = unescapeText(value);
				break;
			case 'URL':
				cur.url = value.trim();
				break;
			case 'ORGANIZER':
				cur.organizer = unescapeText(key.match(/CN="([^"]+)"/)?.[1] ?? '');
				break;
			case 'STATUS':
				cur.cancelled = value.trim().toUpperCase() === 'CANCELLED';
				break;
		}
	}

	return events;
}

/** "Veranstalter: X" aus der Beschreibung ziehen, damit es nicht doppelt erscheint. */
function splitDescription(text = '') {
	const m = /\n*Veranstalter:\s*(.+)$/s.exec(text);
	if (!m) return { text: text.trim(), organizer: '' };
	return { text: text.slice(0, m.index).trim(), organizer: m[1].trim() };
}

async function writeOut(events, upcoming) {
	await mkdir(dirname(OUT), { recursive: true });
	await writeFile(
		OUT,
		JSON.stringify(
			{ fetchedAt: new Date().toISOString(), source: FEED, events, upcoming },
			null,
			'\t',
		) + '\n',
	);
}

const raw = await readFeed();

if (raw === null) {
	if (existsSync(OUT)) {
		warn('Build läuft mit dem vorhandenen Terminstand weiter');
	} else {
		warn('Kein vorhandener Terminstand, Build läuft mit leerer Terminliste weiter');
		await writeOut([], []);
	}
	process.exit(0);
}

const parsed = parseIcs(raw);
const events = parsed
	.map((e) => {
		const { text, organizer } = splitDescription(e.description);
		return {
			uid: e.uid,
			title: e.summary,
			start: e.start,
			end: e.end ?? null,
			hasTime: e.hasTime !== false,
			location: e.location || '',
			description: text,
			organizer: organizer || e.organizer || '',
			url: e.url || '',
			cancelled: Boolean(e.cancelled) || e.summary.startsWith('Abgesagt:'),
		};
	})
	.sort((a, b) => a.start.localeCompare(b.start));

const today = new Date().toISOString().slice(0, 10);
const upcoming = events.filter((e) => e.start.slice(0, 10) >= today);

await writeOut(events, upcoming);

console.log(`[events] ${events.length} Termine gelesen, ${upcoming.length} davon künftig`);
