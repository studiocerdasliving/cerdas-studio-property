/**
 * URL helper for subdirectory deployments.
 * Reads the baseUrl from Inertia's shared page props.
 */
import { page } from '@inertiajs/svelte'
import { get } from 'svelte/store'

/**
 * Prefix a path with the app's base URL.
 * e.g. url('/properti') → '/studiokalepa/public/properti'
 * When deployed to root, it returns the path unchanged.
 * 
 * @param {string} path - The path to prefix (must start with /)
 * @returns {string}
 */
export function url(path) {
  const pageData = get(page)
  const base = pageData?.props?.baseUrl || ''
  if (!path || path === '/') return base || '/'
  return base + path
}
