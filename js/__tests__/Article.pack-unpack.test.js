/**
 * Tests for the security fix in Article.js:
 *   - pack(): stores data-content / data-rendered-enclosures as JS properties
 *     (_packedContentHtml / _packedEnclosuresHtml) instead of reading raw data
 *     attributes directly into innerHTML.
 *   - unpack(): reads from those JS properties (with a typeof-string guard that
 *     falls back to ""), then assigns the concatenated value to container.innerHTML.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Evaluate Article.js in the current globalThis context after the required
 * globals have been stubbed out.  Returns the Article object that the script
 * assigns to window.Article.
 */
function loadArticle() {
	const src = readFileSync(resolve(__dirname, '../Article.js'), 'utf8');
	// Article.js is a plain script (not an ES module), so we execute it as a
	// function body.  All globals it needs are already on globalThis.
	// eslint-disable-next-line no-new-func
	new Function(src)();
	return globalThis.Article;
}

/**
 * Build a minimal DOM row element that mirrors the structure expected by
 * pack() and unpack().
 *
 * @param {object} opts
 * @param {string|null} opts.dataContent         value for data-content attribute
 * @param {string|null} opts.dataRenderedEnclosures value for data-rendered-enclosures attribute
 * @param {string}      opts.isPacked            "0" | "1"
 */
function makeRow({ dataContent = null, dataRenderedEnclosures = null, isPacked = '0' } = {}) {
	const row = document.createElement('div');
	row.setAttribute('data-is-packed', isPacked);

	if (dataContent !== null)
		row.setAttribute('data-content', dataContent);

	if (dataRenderedEnclosures !== null)
		row.setAttribute('data-rendered-enclosures', dataRenderedEnclosures);

	const contentInner = document.createElement('div');
	contentInner.className = 'content-inner';
	row.appendChild(contentInner);

	return row;
}

// ---------------------------------------------------------------------------
// Global stubs required for Article.js to parse without errors
// ---------------------------------------------------------------------------

function setupGlobals() {
	globalThis.__ = (s) => s;
	globalThis.ngettext = (s) => s;
	globalThis.dojo = {
		parser: { parse: vi.fn() },
		connect: vi.fn(),
		disconnect: vi.fn(),
	};
	globalThis.dijit = {
		byId: vi.fn(() => ({
			addChild: vi.fn(),
			removeChild: vi.fn(),
			attr: vi.fn(),
			focus: vi.fn(),
		})),
		getEnclosingWidget: vi.fn(() => ({
			attr: vi.fn().mockReturnThis(),
		})),
	};
	globalThis.App = {
		isCombinedMode: vi.fn(() => false),
		reconcileOverlayHistory: vi.fn(),
		cleanupMemory: vi.fn(),
		getInitParam: vi.fn(() => false),
		escapeHtml: vi.fn((s) => s),
		sanitizeUrl: vi.fn((s) => s),
		FormFields: { icon: vi.fn(() => ''), hidden_tag: vi.fn(() => '') },
		Error: { report: vi.fn() },
		postOpenWindow: vi.fn(),
		Scrollable: { fitsInContainer: vi.fn(() => true), scrollByPages: vi.fn(), scroll: vi.fn() },
		audioCanPlay: vi.fn(() => false),
		openUrl: vi.fn(),
	};
	globalThis.PluginHost = {
		run: vi.fn(),
		HOOK_ARTICLE_RENDERED: 'HOOK_ARTICLE_RENDERED',
		HOOK_ARTICLE_RENDERED_CDM: 'HOOK_ARTICLE_RENDERED_CDM',
		HOOK_ARTICLE_SET_ACTIVE: 'HOOK_ARTICLE_SET_ACTIVE',
	};
	globalThis.Headlines = {
		getSelected: vi.fn(() => []),
		objectById: vi.fn(() => null),
		scrollToArticleId: vi.fn(),
		toggleUnread: vi.fn(),
		onTagsUpdated: vi.fn(),
	};
	globalThis.Notify = { info: vi.fn(), progress: vi.fn(), close: vi.fn() };
	globalThis.xhr = { json: vi.fn() };
	globalThis.fox = {
		SingleUseDialog: vi.fn(),
		form: { DropDownButton: vi.fn() },
	};
}

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

let Article;

describe('Article.pack()', () => {
	beforeEach(() => {
		setupGlobals();
		Article = loadArticle();
		vi.clearAllMocks();
	});

	it('stores the data-content attribute value in _packedContentHtml', () => {
		const row = makeRow({ dataContent: '<p>Hello world</p>', isPacked: '0' });
		Article.pack(row);
		expect(row._packedContentHtml).toBe('<p>Hello world</p>');
	});

	it('stores the data-rendered-enclosures attribute value in _packedEnclosuresHtml', () => {
		const row = makeRow({ dataRenderedEnclosures: '<div>enc</div>', isPacked: '0' });
		Article.pack(row);
		expect(row._packedEnclosuresHtml).toBe('<div>enc</div>');
	});

	it('stores empty string in _packedContentHtml when data-content attribute is absent', () => {
		// no data-content attribute set
		const row = makeRow({ dataRenderedEnclosures: '<div>enc</div>', isPacked: '0' });
		Article.pack(row);
		expect(row._packedContentHtml).toBe('');
	});

	it('stores empty string in _packedEnclosuresHtml when data-rendered-enclosures attribute is absent', () => {
		const row = makeRow({ dataContent: '<p>content</p>', isPacked: '0' });
		Article.pack(row);
		expect(row._packedEnclosuresHtml).toBe('');
	});

	it('stores both as empty strings when neither attribute is present', () => {
		const row = makeRow({ isPacked: '0' });
		Article.pack(row);
		expect(row._packedContentHtml).toBe('');
		expect(row._packedEnclosuresHtml).toBe('');
	});

	it('stores both attribute values together correctly', () => {
		const row = makeRow({ dataContent: '<p>content</p>', dataRenderedEnclosures: '<p>enc</p>', isPacked: '0' });
		Article.pack(row);
		expect(row._packedContentHtml).toBe('<p>content</p>');
		expect(row._packedEnclosuresHtml).toBe('<p>enc</p>');
	});

	it('does not overwrite properties if row is already packed', () => {
		const row = makeRow({ dataContent: '<p>original</p>', isPacked: '1' });
		// Manually set properties to sentinel values before calling pack() on an already-packed row
		row._packedContentHtml = 'sentinel-content';
		row._packedEnclosuresHtml = 'sentinel-enc';
		Article.pack(row);
		// pack() should no-op because data-is-packed === "1"
		expect(row._packedContentHtml).toBe('sentinel-content');
		expect(row._packedEnclosuresHtml).toBe('sentinel-enc');
	});

	it('sets data-is-packed to "1" after packing', () => {
		const row = makeRow({ dataContent: '<p>content</p>', isPacked: '0' });
		Article.pack(row);
		expect(row.getAttribute('data-is-packed')).toBe('1');
	});

	it('sets content-inner to a loading message after packing', () => {
		const row = makeRow({ dataContent: '<p>content</p>', isPacked: '0' });
		Article.pack(row);
		const inner = row.querySelector('.content-inner');
		expect(inner.innerHTML).toContain('Loading, please wait...');
	});
});

describe('Article.unpack()', () => {
	beforeEach(() => {
		setupGlobals();
		Article = loadArticle();
		vi.clearAllMocks();
	});

	it('sets container innerHTML to the concatenation of _packedContentHtml and _packedEnclosuresHtml', () => {
		const row = makeRow({ isPacked: '1' });
		row._packedContentHtml = '<p>article text</p>';
		row._packedEnclosuresHtml = '<p>enc</p>';
		Article.unpack(row);
		const inner = row.querySelector('.content-inner');
		expect(inner.innerHTML).toContain('<p>article text</p>');
		expect(inner.innerHTML).toContain('<p>enc</p>');
	});

	it('uses empty string for content when _packedContentHtml is undefined', () => {
		const row = makeRow({ isPacked: '1' });
		// _packedContentHtml deliberately not set
		row._packedEnclosuresHtml = '<p>enc only</p>';
		Article.unpack(row);
		const inner = row.querySelector('.content-inner');
		// Should contain enclosures but not crash or insert "undefined"
		expect(inner.innerHTML).toContain('<p>enc only</p>');
		expect(inner.innerHTML).not.toContain('undefined');
	});

	it('uses empty string for enclosures when _packedEnclosuresHtml is undefined', () => {
		const row = makeRow({ isPacked: '1' });
		row._packedContentHtml = '<p>content only</p>';
		// _packedEnclosuresHtml deliberately not set
		Article.unpack(row);
		const inner = row.querySelector('.content-inner');
		expect(inner.innerHTML).toContain('<p>content only</p>');
		expect(inner.innerHTML).not.toContain('undefined');
	});

	it('uses empty string when _packedContentHtml is null (not a string)', () => {
		const row = makeRow({ isPacked: '1' });
		row._packedContentHtml = null;
		row._packedEnclosuresHtml = '<p>enc</p>';
		Article.unpack(row);
		const inner = row.querySelector('.content-inner');
		expect(inner.innerHTML).not.toContain('null');
		expect(inner.innerHTML).toContain('<p>enc</p>');
	});

	it('uses empty string when _packedEnclosuresHtml is null (not a string)', () => {
		const row = makeRow({ isPacked: '1' });
		row._packedContentHtml = '<p>content</p>';
		row._packedEnclosuresHtml = null;
		Article.unpack(row);
		const inner = row.querySelector('.content-inner');
		expect(inner.innerHTML).toContain('<p>content</p>');
		expect(inner.innerHTML).not.toContain('null');
	});

	it('uses empty string when _packedContentHtml is a number (not a string)', () => {
		const row = makeRow({ isPacked: '1' });
		row._packedContentHtml = 42;
		row._packedEnclosuresHtml = '<p>enc</p>';
		Article.unpack(row);
		const inner = row.querySelector('.content-inner');
		expect(inner.innerHTML).not.toContain('42');
	});

	it('uses empty string when both properties are missing', () => {
		const row = makeRow({ isPacked: '1' });
		// Neither property set — both should default to ""
		Article.unpack(row);
		// content-inner should get a &nbsp; because textContent.length === 0
		// jsdom preserves &nbsp; as a literal HTML entity in innerHTML
		const inner = row.querySelector('.content-inner');
		expect(inner.innerHTML).toContain('&nbsp;');
	});

	it('appends &nbsp; when resulting content is empty (blank article guard)', () => {
		const row = makeRow({ isPacked: '1' });
		row._packedContentHtml = '';
		row._packedEnclosuresHtml = '';
		Article.unpack(row);
		const inner = row.querySelector('.content-inner');
		expect(inner.innerHTML).toContain('&nbsp;');
	});

	it('does not append &nbsp; when content is non-empty', () => {
		const row = makeRow({ isPacked: '1' });
		row._packedContentHtml = '<p>has text</p>';
		row._packedEnclosuresHtml = '';
		Article.unpack(row);
		const inner = row.querySelector('.content-inner');
		// Should not have appended the blank-content guard
		expect(inner.innerHTML).not.toContain('&nbsp;');
	});

	it('sets data-is-packed to "0" after unpacking', () => {
		const row = makeRow({ isPacked: '1' });
		row._packedContentHtml = '<p>content</p>';
		row._packedEnclosuresHtml = '';
		Article.unpack(row);
		expect(row.getAttribute('data-is-packed')).toBe('0');
	});

	it('does nothing when data-is-packed is not "1"', () => {
		const row = makeRow({ isPacked: '0' });
		row._packedContentHtml = '<p>should not be used</p>';
		const inner = row.querySelector('.content-inner');
		inner.innerHTML = 'original';
		Article.unpack(row);
		// innerHTML should remain unchanged
		expect(inner.innerHTML).toBe('original');
	});

	it('calls dojo.parser.parse on the container after setting innerHTML', () => {
		const row = makeRow({ isPacked: '1' });
		row._packedContentHtml = '<p>content</p>';
		row._packedEnclosuresHtml = '';
		Article.unpack(row);
		expect(globalThis.dojo.parser.parse).toHaveBeenCalledWith(row.querySelector('.content-inner'));
	});

	it('calls PluginHost.run with HOOK_ARTICLE_RENDERED_CDM after unpacking', () => {
		const row = makeRow({ isPacked: '1' });
		row._packedContentHtml = '<p>content</p>';
		row._packedEnclosuresHtml = '';
		Article.unpack(row);
		expect(globalThis.PluginHost.run).toHaveBeenCalledWith(
			globalThis.PluginHost.HOOK_ARTICLE_RENDERED_CDM,
			row
		);
	});
});

describe('Article.pack() -> Article.unpack() round-trip', () => {
	beforeEach(() => {
		setupGlobals();
		Article = loadArticle();
		vi.clearAllMocks();
	});

	it('round-trips content and enclosures correctly', () => {
		const row = makeRow({
			dataContent: '<p>article body</p>',
			dataRenderedEnclosures: '<p>attachment</p>',
			isPacked: '0',
		});

		Article.pack(row);
		expect(row.getAttribute('data-is-packed')).toBe('1');

		Article.unpack(row);
		expect(row.getAttribute('data-is-packed')).toBe('0');

		const inner = row.querySelector('.content-inner');
		expect(inner.innerHTML).toContain('<p>article body</p>');
		expect(inner.innerHTML).toContain('<p>attachment</p>');
	});

	it('round-trips when only data-content is present', () => {
		const row = makeRow({ dataContent: '<p>only content</p>', isPacked: '0' });

		Article.pack(row);
		Article.unpack(row);

		const inner = row.querySelector('.content-inner');
		expect(inner.innerHTML).toContain('<p>only content</p>');
	});

	it('round-trips when only data-rendered-enclosures is present', () => {
		const row = makeRow({ dataRenderedEnclosures: '<p>only enc</p>', isPacked: '0' });

		Article.pack(row);
		Article.unpack(row);

		const inner = row.querySelector('.content-inner');
		expect(inner.innerHTML).toContain('<p>only enc</p>');
	});

	it('unpack after pack does not read raw data attributes for innerHTML (security regression)', () => {
		// This test verifies the core security fix:
		// data-content is stored via JS property, not reinterpreted from the attribute.
		const row = makeRow({ dataContent: '<img src=x onerror=alert(1)>', isPacked: '0' });

		Article.pack(row);

		// Simulate an attacker changing the data-content attribute after pack() was called
		row.setAttribute('data-content', '<script>evil()</script>');

		const prevSanitize = globalThis.DOMPurify.sanitize;
		globalThis.DOMPurify.sanitize = vi.fn((html) => html.replace(/onerror\s*=\s*[^ >]+/gi, '').replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ''));

		Article.unpack(row);

		const inner = row.querySelector('.content-inner');
		// innerHTML should reflect the value captured at pack() time, not the tampered attribute
		expect(inner.innerHTML).not.toContain('evil()');
		expect(inner.innerHTML).not.toContain('onerror');
		expect(globalThis.DOMPurify.sanitize).toHaveBeenCalled();

		globalThis.DOMPurify.sanitize = prevSanitize;
	});

	it('calling pack twice keeps the original packed values (idempotent)', () => {
		const row = makeRow({ dataContent: '<p>first</p>', isPacked: '0' });
		Article.pack(row);

		// Change the attribute and call pack() again — since data-is-packed is now "1", it should no-op
		row.setAttribute('data-content', '<p>second</p>');
		Article.pack(row);

		expect(row._packedContentHtml).toBe('<p>first</p>');
	});
});