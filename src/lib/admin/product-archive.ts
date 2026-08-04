/**
 * Stock-based auto-archive is disabled: out-of-stock products stay visible
 * with an OOS badge. Manual archive/unarchive admin actions remain separate.
 */

/** @deprecated Stock no longer drives archive; always returns {}. */
export function archiveFieldsForStock(_stock: number, _isDraft: boolean) {
  return {}
}

/** @deprecated No-op — products are not archived when stock hits zero. */
export async function syncProductArchiveForStock(
  _productId: string,
  _client?: unknown,
) {
  return
}
