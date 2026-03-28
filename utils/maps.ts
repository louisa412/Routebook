export const buildGoogleMapsUrl = (query: string): string => {
  const encodedQuery = encodeURIComponent(query.trim())
  return `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`
}

export const openGoogleMaps = (query: string) => {
  const cleanQuery = query.trim()
  if (!cleanQuery) return

  const encodedQuery = encodeURIComponent(cleanQuery)
  const browserUrl = buildGoogleMapsUrl(cleanQuery)
  const appDeepLink = `comgooglemaps://?q=${encodedQuery}`

  try {
    window.location.href = appDeepLink
    setTimeout(() => {
      window.open(browserUrl, '_blank', 'noopener,noreferrer')
    }, 400)
  } catch (error) {
    console.warn('Google Maps deep link 失敗，改用瀏覽器 URL', error)
    window.open(browserUrl, '_blank', 'noopener,noreferrer')
  }
}
