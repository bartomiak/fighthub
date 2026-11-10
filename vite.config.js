import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const root = import.meta.dirname;
const pages = ['index', 'dzieci', 'dorosli', 'ojcowie'];
const partialsDir = resolve(root, 'partials');

// <!-- @include footer.html -->               → zawartość partials/footer.html
// <!-- @include eyebrow.html text="Cennik" --> → {{text}} w partialu zamienione na "Cennik"
function htmlPartials() {
	const include = (html) =>
		html.replace(/<!--\s*@include\s+([\w.-]+)((?:\s+\w+="[^"]*")*)\s*-->/g, (_, file, attrs) => {
			const vars = Object.fromEntries([...attrs.matchAll(/(\w+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
			const partial = readFileSync(resolve(partialsDir, file), 'utf-8').replace(
				/\{\{\s*(\w+)\s*\}\}/g,
				(m, key) => vars[key] ?? m,
			);
			return include(partial);
		});

	return {
		name: 'html-partials',
		transformIndexHtml: { order: 'pre', handler: include },
		handleHotUpdate({ file, server }) {
			if (file.startsWith(partialsDir)) server.ws.send({ type: 'full-reload' });
		},
	};
}

export default defineConfig({
	// względne ścieżki – działa na FTP w dowolnym katalogu
	base: './',
	plugins: [htmlPartials(), tailwindcss()],
	build: {
		rollupOptions: {
			input: Object.fromEntries(pages.map((p) => [p, resolve(root, `${p}.html`)])),
		},
	},
});
