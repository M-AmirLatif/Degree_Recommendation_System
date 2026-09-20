;(function () {
  const API = window.APP_CONFIG.API_BASE_URL
  const inFlightRequests = new Map()

  const getApiUrl = (path) =>
    `${API}${path.startsWith('/') ? path : `/${path}`}`

  const readJsonSafely = async (response) => {
    const text = await response.text()

    if (!text) {
      return null
    }

    try {
      return JSON.parse(text)
    } catch (error) {
      return { message: text }
    }
  }

  const apiFetch = async (path, options = {}) => {
    const { headers = {}, body, method = 'GET', ...rest } = options
    const isGet = method.toUpperCase() === 'GET'
    const cacheKey = `${isGet ? 'GET' : 'OTHER'}:${path}`

    // Deduplicate concurrent GET requests
    if (isGet && inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey)
    }

    const requestHeaders = {
      ...headers,
    }

    const requestOptions = {
      method,
      credentials: 'include',
      ...rest,
      headers: requestHeaders,
    }

    if (body !== undefined) {
      requestOptions.body =
        typeof body === 'string' ? body : JSON.stringify(body)

      if (!requestHeaders['Content-Type']) {
        requestHeaders['Content-Type'] = 'application/json'
      }
    }

    const fetchPromise = (async () => {
      try {
        const response = await fetch(getApiUrl(path), requestOptions)
        const data = await readJsonSafely(response)

        if (!response.ok) {
          const error = new Error(data?.message || 'Request failed')
          error.status = response.status
          error.data = data
          throw error
        }

        return data
      } finally {
        if (isGet) {
          inFlightRequests.delete(cacheKey)
        }
      }
    })()

    if (isGet) {
      inFlightRequests.set(cacheKey, fetchPromise)
    }

    return fetchPromise
  }

  const redirectToLogin = () => {
    sessionStorage.removeItem('drs_cached_profile')
    window.location.href = 'login.html'
  }

  const requireAuth = async (allowStale = true) => {
    // Check instant session cache for ultra-fast render
    if (allowStale) {
      try {
        const cachedRaw = sessionStorage.getItem('drs_cached_profile')
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw)
          if (cached && cached.data && Date.now() - cached.timestamp < 180000) {
            // Revalidate quietly in the background
            apiFetch('/auth/profile')
              .then((fresh) => {
                sessionStorage.setItem(
                  'drs_cached_profile',
                  JSON.stringify({ data: fresh, timestamp: Date.now() }),
                )
              })
              .catch((err) => {
                if (err.status === 401) redirectToLogin()
              })
            return cached.data
          }
        }
      } catch (e) {
        // ignore cache read error
      }
    }

    try {
      const profile = await apiFetch('/auth/profile')
      try {
        sessionStorage.setItem(
          'drs_cached_profile',
          JSON.stringify({ data: profile, timestamp: Date.now() }),
        )
      } catch (e) {}
      return profile
    } catch (error) {
      if (error.status === 401) {
        redirectToLogin()
        return null
      }
      throw error
    }
  }

  const requireAdmin = async () => {
    const profile = await requireAuth(false)
    if (!profile) {
      return null
    }

    if (profile.role !== 'admin') {
      window.location.href = 'dashboard.html'
      return null
    }

    return profile
  }

  const redirectIfAuthenticated = async () => {
    try {
      const profile = await apiFetch('/auth/profile')
      window.location.href =
        profile.role === 'admin' ? 'admin-dashboard.html' : 'dashboard.html'
      return profile
    } catch (error) {
      if (error.status === 401) {
        return null
      }
      return null
    }
  }

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' })
    } catch (error) {
      // Fall through to local redirect even if the server session has expired.
    }

    sessionStorage.removeItem('drs_cached_profile')
    sessionStorage.removeItem('drs_cached_degrees')
    showAppAlert('Logged out successfully.', 'success')
    setTimeout(() => {
      redirectToLogin()
    }, 400)
  }

  window.AUTH_CLIENT = {
    apiFetch,
    getApiUrl,
    logout,
    redirectIfAuthenticated,
    requireAdmin,
    requireAuth,
  }

  window.logout = logout
})()
