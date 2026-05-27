/**
 * VerifiedSceneLoader — fetch X3D chunks, SHA-256 verify against manifest, mount via Inline.
 * Paper prototype: content-addressed sub-scenes, verify-before-bind (Step 2).
 *
 * Depends on: Web Crypto, fetch, X_ITE <x3d-canvas> with Group DEF mount point.
 */
(function (global) {
	'use strict';

	function resolveUrl(baseUrl, relativePath) {
		var base = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
		return new URL(relativePath.replace(/^\//, ''), base).href;
	}

	function normalizeHash(hex) {
		return (hex || '').toLowerCase().replace(/^sha256:/, '');
	}

	async function sha256Hex(arrayBuffer) {
		var digest = await global.crypto.subtle.digest('SHA-256', arrayBuffer);
		return Array.from(new Uint8Array(digest))
			.map(function (b) {
				return b.toString(16).padStart(2, '0');
			})
			.join('');
	}

	/**
	 * @param {string} url
	 * @param {string|null} expectedSha256 hex from manifest
	 * @returns {Promise<{url:string,bytes:number,sha256:string,loadMs:number,text:string,buffer:ArrayBuffer,verified:boolean}>}
	 */
	async function fetchAndVerify(url, expectedSha256) {
		var t0 = global.performance ? global.performance.now() : Date.now();
		var res = await fetch(url, { cache: 'no-store' });
		if (!res.ok) {
			throw new Error('Chunk fetch failed: HTTP ' + res.status + ' for ' + url);
		}
		var buffer = await res.arrayBuffer();
		var actual = await sha256Hex(buffer);
		var expected = normalizeHash(expectedSha256);
		var verified = !expected || actual === expected;
		if (!verified) {
			throw new Error(
				'Verify-before-bind failed for ' + url +
				'\n  expected: ' + expected +
				'\n  actual:   ' + actual
			);
		}
		var t1 = global.performance ? global.performance.now() : Date.now();
		return {
			url: url,
			bytes: buffer.byteLength,
			sha256: actual,
			loadMs: t1 - t0,
			text: new TextDecoder('utf-8').decode(buffer),
			buffer: buffer,
			verified: true
		};
	}

	async function loadManifest(manifestUrl) {
		var res = await fetch(manifestUrl, { cache: 'no-store' });
		if (!res.ok) {
			throw new Error('Manifest fetch failed: HTTP ' + res.status);
		}
		return res.json();
	}

	function chunkMeta(manifest, chunkPath) {
		var key = chunkPath.replace(/\\/g, '/');
		var entry = manifest.chunks && manifest.chunks[key];
		if (!entry) {
			throw new Error('Chunk not listed in manifest: ' + key);
		}
		return entry;
	}

	/**
	 * @param {object} manifest
	 * @param {string} scenesBaseUrl directory URL ending with / (local or IPFS gateway + CID)
	 * @param {string} chunkPath e.g. sources/source-1-lod0.x3d
	 */
	async function loadChunkVerified(manifest, scenesBaseUrl, chunkPath) {
		var meta = chunkMeta(manifest, chunkPath);
		var url = resolveUrl(scenesBaseUrl, meta.path || chunkPath);
		var result = await fetchAndVerify(url, meta.sha256);
		result.chunkPath = chunkPath.replace(/\\/g, '/');
		result.expectedSha256 = normalizeHash(meta.sha256);
		return result;
	}

	function waitForBrowser(canvas, maxMs) {
		maxMs = maxMs == null ? 8000 : maxMs;
		return new Promise(function (resolve, reject) {
			var start = Date.now();
			(function tick() {
				if (canvas && canvas.browser && canvas.browser.currentScene) {
					resolve(canvas.browser);
					return;
				}
				if (Date.now() - start > maxMs) {
					reject(new Error('X_ITE browser not ready within ' + maxMs + 'ms'));
					return;
				}
				global.setTimeout(tick, 50);
			})();
		});
	}

	function findMountGroup(canvas, mountDef) {
		return (
			canvas.querySelector('Group[DEF="' + mountDef + '"]') ||
			canvas.querySelector('Group[def="' + mountDef + '"]')
		);
	}

	function findInlineForDef(mountEl, sculptureDef) {
		var list = mountEl.querySelectorAll('Inline');
		for (var i = 0; i < list.length; i++) {
			if (list[i].dataset && list[i].dataset.sculptureDef === sculptureDef) {
				return list[i];
			}
		}
		return null;
	}

	/**
	 * Mount verified chunk bytes under StreamedSources using Inline + blob URL (no second fetch).
	 */
	function mountVerifiedInline(canvas, mountDef, sculptureDef, chunkPath, verifiedPayload) {
		var mount = findMountGroup(canvas, mountDef);
		if (!mount) {
			throw new Error('Mount Group DEF="' + mountDef + '" not found in canvas');
		}

		var existing = findInlineForDef(mount, sculptureDef);
		if (existing) {
			if (existing.dataset.blobUrl) {
				URL.revokeObjectURL(existing.dataset.blobUrl);
			}
			existing.remove();
		}

		var blob = new Blob([verifiedPayload.buffer], { type: 'model/x3d+xml' });
		var blobUrl = URL.createObjectURL(blob);

		var inline = document.createElement('Inline');
		inline.setAttribute('url', blobUrl);
		inline.setAttribute('load', 'true');
		inline.dataset.sculptureDef = sculptureDef;
		inline.dataset.chunkPath = chunkPath;
		inline.dataset.sha256 = verifiedPayload.sha256;
		inline.dataset.blobUrl = blobUrl;
		inline.dataset.loadMs = String(verifiedPayload.loadMs);
		inline.dataset.bytes = String(verifiedPayload.bytes);

		mount.appendChild(inline);
		return inline;
	}

	/**
	 * Load manifest + all lod0 chunks in parallel, verify, mount.
	 * @returns {Promise<{manifest:object,loads:Array,totalMs:number}>}
	 */
	async function loadAllSourcesLod0(canvas, options) {
		options = options || {};
		var manifestUrl = options.manifestUrl || 'scenes/manifest.json';
		var scenesBaseUrl = options.scenesBaseUrl || 'scenes/';
		var mountDef = options.mountDef || 'StreamedSources';

		var t0 = global.performance ? global.performance.now() : Date.now();
		var manifest = await loadManifest(manifestUrl);
		await waitForBrowser(canvas, options.browserTimeoutMs);

		var sources = manifest.sources || [];
		var loads = await Promise.all(
			sources.map(async function (src) {
				var chunkPath = src.lod0;
				var verified = await loadChunkVerified(manifest, scenesBaseUrl, chunkPath);
				var inline = mountVerifiedInline(canvas, mountDef, src.def, chunkPath, verified);
				return {
					sourceId: src.id,
					sculptureDef: src.def,
					chunkPath: chunkPath,
					lod: 0,
					bytes: verified.bytes,
					sha256: verified.sha256,
					loadMs: verified.loadMs,
					inline: inline
				};
			})
		);

		var t1 = global.performance ? global.performance.now() : Date.now();
		return { manifest: manifest, loads: loads, totalMs: t1 - t0 };
	}

	/**
	 * Upgrade one source to lod1 (verify, replace Inline for that DEF).
	 */
	async function upgradeSourceLod1(canvas, manifest, scenesBaseUrl, sourceId, options) {
		options = options || {};
		var mountDef = options.mountDef || 'StreamedSources';
		var src = (manifest.sources || []).find(function (s) {
			return s.id === sourceId;
		});
		if (!src) {
			throw new Error('Unknown source id: ' + sourceId);
		}
		var verified = await loadChunkVerified(manifest, scenesBaseUrl, src.lod1);
		var inline = mountVerifiedInline(canvas, mountDef, src.def, src.lod1, verified);
		return {
			sourceId: sourceId,
			sculptureDef: src.def,
			chunkPath: src.lod1,
			lod: 1,
			bytes: verified.bytes,
			sha256: verified.sha256,
			loadMs: verified.loadMs,
			inline: inline
		};
	}

	/** IPFS gateway base from manifest (Step 4). */
	function ipfsBaseFromManifest(manifest) {
		var cid = manifest.ipfs && manifest.ipfs.rootCid;
		var gateway = (manifest.ipfs && manifest.ipfs.gateway) || 'https://ipfs.io/ipfs/';
		if (!cid) {
			return null;
		}
		return gateway.endsWith('/') ? gateway + cid + '/' : gateway + '/' + cid + '/';
	}

	global.VerifiedSceneLoader = {
		resolveUrl: resolveUrl,
		sha256Hex: sha256Hex,
		fetchAndVerify: fetchAndVerify,
		loadManifest: loadManifest,
		loadChunkVerified: loadChunkVerified,
		waitForBrowser: waitForBrowser,
		mountVerifiedInline: mountVerifiedInline,
		loadAllSourcesLod0: loadAllSourcesLod0,
		upgradeSourceLod1: upgradeSourceLod1,
		ipfsBaseFromManifest: ipfsBaseFromManifest
	};
})(typeof window !== 'undefined' ? window : globalThis);
