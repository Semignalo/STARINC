/**
 * Cloudinary URL helpers — manipulasi transformation di URL Cloudinary
 * untuk delivery yang optimal (f_auto, q_auto, responsive srcset, LQIP).
 *
 * Pola URL Cloudinary:
 *   https://res.cloudinary.com/{cloud}/image/upload/{transformations}/{public_id}
 */

const CLOUDINARY_HOST_RE = /res\.cloudinary\.com\/[^/]+\/(image|video)\/upload\//;

/**
 * @returns {boolean} apakah URL ini dari Cloudinary
 */
export function isCloudinaryUrl(url) {
    return typeof url === 'string' && CLOUDINARY_HOST_RE.test(url);
}

/**
 * Sisipkan string transformasi ke URL Cloudinary.
 * Bila URL bukan Cloudinary, kembalikan apa adanya.
 *
 * @param {string} url
 * @param {string} transforms - contoh: 'f_auto,q_auto,w_400'
 */
export function withTransforms(url, transforms) {
    if (!isCloudinaryUrl(url) || !transforms) return url;
    return url.replace(CLOUDINARY_HOST_RE, (match) => `${match}${transforms}/`);
}

/**
 * Buat srcset responsif untuk gambar Cloudinary.
 * @param {string} url
 * @param {number[]} widths - daftar lebar (px) untuk srcset
 * @param {string} extra - transformasi tambahan, default f_auto,q_auto,c_limit
 */
export function buildSrcSet(url, widths = [320, 480, 640, 960, 1280, 1600], extra = 'f_auto,q_auto,c_limit') {
    if (!isCloudinaryUrl(url)) return undefined;
    return widths
        .map((w) => `${withTransforms(url, `${extra},w_${w}`)} ${w}w`)
        .join(', ');
}

/**
 * LQIP (Low Quality Image Placeholder) — versi blur ringan untuk dipakai
 * sebagai background sambil gambar utama loading.
 *
 * @param {string} url
 * @returns {string|null}
 */
export function buildLqip(url) {
    if (!isCloudinaryUrl(url)) return null;
    return withTransforms(url, 'e_blur:1000,q_1,f_auto,w_40');
}

/**
 * URL versi optimal untuk single-size delivery (non-responsive).
 * Cocok untuk thumbnail/avatar/icon yang ukurannya tetap.
 */
export function optimizedUrl(url, width, extra = 'f_auto,q_auto,c_limit,dpr_auto') {
    if (!isCloudinaryUrl(url)) return url;
    return withTransforms(url, width ? `${extra},w_${width}` : extra);
}
