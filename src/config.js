const tough = require('tough-cookie')
const { merge } = require('lodash')

module.exports.parse = parse

function parse(config) {
  if (!config.site) throw new Error("The required 'site' property is missing")
  if (!config.url) throw new Error("The required 'url' property is missing")
  if (typeof config.url !== 'function' && typeof config.url !== 'string')
    throw new Error("The 'url' property should return the function or string")
  if (!config.parser) throw new Error("The required 'parser' function is missing")
  if (typeof config.parser !== 'function')
    throw new Error("The 'parser' property should return the function")
  if (config.logo && typeof config.logo !== 'function')
    throw new Error("The 'logo' property should return the function")

  const defaultConfig = {
    days: 1,
    lang: 'en',
    delay: 3000,
    output: 'guide.xml',
    request: {
      method: 'GET',
      maxContentLength: 5 * 1024 * 1024,
      timeout: 5000,
      withCredentials: true,
      jar: new tough.CookieJar(),
      responseType: 'arraybuffer',
      cache: false
    }
  }

  return merge(defaultConfig, config)
}
