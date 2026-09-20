const NodeCache = require('node-cache')

// Cache with default TTL of 10 minutes (600 seconds) and check period of 2 minutes
const appCache = new NodeCache({ stdTTL: 600, checkperiod: 120, useClones: false })

const getCache = (key) => appCache.get(key)

const setCache = (key, value, ttl) => {
  if (ttl) {
    return appCache.set(key, value, ttl)
  }
  return appCache.set(key, value)
}

const delCache = (key) => appCache.del(key)

const flushCache = () => appCache.flushAll()

module.exports = {
  appCache,
  getCache,
  setCache,
  delCache,
  flushCache,
}
