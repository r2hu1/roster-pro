"use client"

function setCookie({
  name,
  value,
  hours,
}: {
  name: string
  value: string
  hours: number
}) {
  const expires = new Date(Date.now() + hours * 60 * 60 * 1000).toUTCString()

  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

function getCookie(name: string) {
  const cookies = document.cookie.split("; ")

  for (const cookie of cookies) {
    const [key, value] = cookie.split("=")

    if (key === name && value) {
      return decodeURIComponent(value)
    }
  }
  return null
}

export { setCookie, getCookie }
