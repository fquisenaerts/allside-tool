// lib/urlMapping.ts
export const urlMapping = {
  "/": { fr: "/" }, // Homepage remains '/' for both, handled by language context
  "/about": { fr: "/a-propos" },
  "/contact": { fr: "/contactez-nous" },
  "/login": { fr: "/connexion" },
  "/signup": { fr: "/inscription" },
  "/analyze": { fr: "/analyser" },
  "/my-establishments": { fr: "/mes-etablissements" },
  "/subscription": { fr: "/abonnement" },
  "/profile": { fr: "/profil" },
  "/book-a-demo": { fr: "/reserver-une-demo" },
  // Dynamic routes: use a function to handle the ID
  "/establishment/[id]": {
    fr: (id: string) => `/etablissement/${id}`,
    en: (id: string) => `/establishment/${id}`,
  },
} as const

type UrlMappingKey = keyof typeof urlMapping

export function getLocalizedUrl(path: string | null | undefined, targetLang: "en" | "fr"): string {
  const safePath = path || "" // Ensure path is a string

  // Handle dynamic routes first
  if (safePath.startsWith("/establishment/")) {
    const id = safePath.split("/")[2]
    const dynamicKey: UrlMappingKey = "/establishment/[id]"
    return urlMapping[dynamicKey][targetLang](id)
  }

  // Handle static routes
  // We need to find the *key* that corresponds to the current safePath,
  // then use that key for English, or its 'fr' value for French.
  for (const key in urlMapping) {
    const mapped = urlMapping[key as UrlMappingKey]
    if (typeof mapped !== "function") {
      // This is a static route entry { fr: string }
      if (key === safePath || mapped.fr === safePath) {
        // Found the mapping for the current path (either English key or French value)
        if (targetLang === "en") {
          return key // The key itself is the English path for static routes
        } else {
          // targetLang === "fr"
          return mapped.fr // The 'fr' property is the French path
        }
      }
    }
  }

  // Fallback: if no specific mapping found, return the original safePath
  // This covers paths like /signup/confirmation which might not be explicitly mapped
  return safePath
}

export function getAlternateUrls(currentPath: string | null | undefined): { href: string; hreflang: string }[] {
  const alternates: { href: string; hreflang: string }[] = []
  const safeCurrentPath = currentPath || "" // Ensure currentPath is a string

  // Handle dynamic routes
  if (safeCurrentPath.startsWith("/establishment/")) {
    const id = safeCurrentPath.split("/")[2]
    const dynamicKey: UrlMappingKey = "/establishment/[id]"
    alternates.push({ href: urlMapping[dynamicKey].en(id), hreflang: "en" })
    alternates.push({ href: urlMapping[dynamicKey].fr(id), hreflang: "fr" })
    return alternates
  }

  // Handle static routes
  for (const key in urlMapping) {
    const mapped = urlMapping[key as UrlMappingKey]
    if (typeof mapped !== "function") {
      if (key === safeCurrentPath) {
        // If current path is the English version (the key)
        alternates.push({ href: key, hreflang: "en" })
        alternates.push({ href: mapped.fr, hreflang: "fr" })
        return alternates
      } else if (mapped.fr === safeCurrentPath) {
        // If current path is the French version (the mapped.fr value)
        alternates.push({ href: key, hreflang: "en" }) // The English equivalent is the key
        alternates.push({ href: mapped.fr, hreflang: "fr" })
        return alternates
      }
    }
  }

  // Fallback for paths not explicitly mapped (e.g., /signup/confirmation)
  // Assume they are language-agnostic or only exist in one language
  alternates.push({ href: safeCurrentPath, hreflang: "x-default" })
  return alternates
}

export function getLanguageFromPath(pathname: string | null | undefined): "en" | "fr" {
  const currentPath = pathname || "" // Ensure pathname is a string

  // Check if the path is a French localized path
  for (const key in urlMapping) {
    const mapped = urlMapping[key as UrlMappingKey]
    if (typeof mapped !== "function" && mapped.fr === currentPath) {
      return "fr"
    }
    // Handle dynamic French paths like /etablissement/[id]
    if (key === "/establishment/[id]" && currentPath.startsWith("/etablissement/")) {
      return "fr"
    }
  }
  // Default to English if not explicitly French
  return "en"
}
