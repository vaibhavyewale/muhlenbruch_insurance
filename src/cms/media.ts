/** Normalize legacy HTTP media URLs for HTTPS production deployments. */
export function mediaUrl(value: string): string {
  if (!value) return value
  if (/^https?:\/\/(www\.)?muhlenbruchinsurance\.com\//i.test(value)) {
    return `/api/media?url=${encodeURIComponent(value)}`
  }
  return value.replace(/^http:\/\//i, 'https://')
}
