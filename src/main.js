import './style.css';

const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// Sekcje na pełną wysokość okna
const fullHeight = () => {
	$$('[data-fullheight]').forEach((el) => {
		el.style.height = `${window.innerHeight}px`;
	});
};
fullHeight();
window.addEventListener('resize', fullHeight);

// Paralaksa teł: data-parallax="0.5" (współczynnik), data-parallax-min="1200" (od jakiej szerokości)
const parallax = $$('[data-parallax]').map((el) => ({
	el,
	ratio: parseFloat(el.dataset.parallax) || 0.5,
	min: parseInt(el.dataset.parallaxMin || '0', 10),
	top: 0,
}));
const measureParallax = () => {
	parallax.forEach((p) => {
		p.el.style.backgroundPosition = '';
		p.top = p.el.getBoundingClientRect().top + window.scrollY;
	});
};
const updateParallax = () => {
	const st = window.scrollY;
	parallax.forEach((p) => {
		if (window.innerWidth < p.min) {
			p.el.style.backgroundPosition = '';
			return;
		}
		const y = Math.round((st - p.top) * (1 - p.ratio));
		p.el.style.backgroundPosition = `50% ${y}px`;
	});
};

// Pasek nawigacji wysuwany przy przewijaniu (podstrony)
const nav = document.querySelector('.site-nav');
const updateNav = () => {
	if (!nav) return;
	const st = window.scrollY;
	const cl = nav.classList;
	if (st > 150) cl.add('scrolled');
	else if (cl.contains('scrolled')) cl.remove('scrolled', 'sleep');
	if (st > 350) cl.add('awake');
	else if (cl.contains('awake')) {
		cl.remove('awake');
		cl.add('sleep');
	}
};

// Animacja wjazdu: odsłania elementy, które weszły w 95% wysokości okna
// albo zostały już przewinięte (np. szybki skok w dół)
let pending = $$('[data-reveal]');
const checkReveal = () => {
	if (!pending.length) return;
	const limit = window.innerHeight * 0.95;
	const batch = [];
	pending = pending.filter((el) => {
		if (el.getBoundingClientRect().top < limit) {
			batch.push(el);
			return false;
		}
		return true;
	});
	if (!batch.length) return;
	setTimeout(() => {
		batch.forEach((el, k) => setTimeout(() => el.classList.add('is-revealed'), k * 50));
	}, 100);
};

let ticking = false;
window.addEventListener(
	'scroll',
	() => {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(() => {
			updateParallax();
			updateNav();
			checkReveal();
			ticking = false;
		});
	},
	{ passive: true },
);
const refresh = () => {
	measureParallax();
	updateParallax();
	checkReveal();
};
window.addEventListener('resize', refresh);
window.addEventListener('load', refresh);
refresh();
updateNav();

// Karuzela (sekcja "Osiągnięcia")
$$('[data-carousel]').forEach((carousel) => {
	const items = $$('[data-slide]', carousel);
	const dots = $$('[data-dot]', carousel);
	if (!items.length) return;
	let current = 0;
	let timer;

	const show = (i) => {
		items[current].toggleAttribute('data-active', false);
		dots[current]?.toggleAttribute('data-active', false);
		current = (i + items.length) % items.length;
		items[current].toggleAttribute('data-active', true);
		dots[current]?.toggleAttribute('data-active', true);
	};
	const start = () => {
		clearInterval(timer);
		timer = setInterval(() => show(current + 1), 5000);
	};

	dots.forEach((dot, i) =>
		dot.addEventListener('click', () => {
			show(i);
			start();
		}),
	);
	start();
});

// Rok w stopce
$$('[data-year]').forEach((el) => {
	el.textContent = new Date().getFullYear();
});
