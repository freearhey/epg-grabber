const { CurlGenerator } = require('curl-generator')
const { default: axios } = require('axios')
const { setupCache } = require('axios-cache-interceptor')
const { isObject, isPromise } = require('./utils')

module.exports.create = create
module.exports.buildRequest = buildRequest
module.exports.parseResponse = parseResponse

let timeout

function create(config) {
  const client = axios.defaults.cache
    ? axios
    : setupCache(
        axios.create({
          ignoreCookieErrors: true
        })
      )

  client.interceptors.request.use(
    function (request) {
      if (config.debug) {
        console.log('Request:', JSON.stringify(request, null, 2))
      }
      return request
    },
    function (error) {
      return Promise.reject(error)
    }
  )

  client.interceptors.response.use(
    function (response) {
      if (config.debug) {
        const data =
          isObject(response.data) || Array.isArray(response.data)
            ? JSON.stringify(response.data)
            : response.data.toString()
        console.log(
          'Response:',
          JSON.stringify(
            {
              headers: response.headers,
              data,
              cached: response.cached
            },
            null,
            2
          )
        )
      }

      clearTimeout(timeout)
      return response
    },
    function (error) {
      clearTimeout(timeout)
      return Promise.reject(error)
    }
  )

  return client
}

async function buildRequest({ channel, date, config }) {
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  const request = { ...config.request }
  timeout = setTimeout(() => {
    source.cancel('Connection timeout')
  }, request.timeout)
  request.headers = await getRequestHeaders({ channel, date, config })
  request.url = await getRequestUrl({ channel, date, config })
  request.data = await getRequestData({ channel, date, config })
  request.cancelToken = source.token

  if (config.curl) {
    const curl = CurlGenerator({
      url: request.url,
      method: request.method,
      headers: request.headers,
      body: request.data
    })
    console.log(curl)
  }

  return request
}

function parseResponse(response) {
  return {
    content: response.data.toString(),
    buffer: response.data,
    headers: response.headers,
    request: response.request,
    cached: response.cached
  }
}

async function getRequestHeaders({ channel, date, config }) {
  if (typeof config.request.headers === 'function') {
    const headers = config.request.headers({ channel, date })
    if (isPromise(headers)) {
      return await headers
    }
    return headers
  }

  return config.request.headers || null
}

async function getRequestData({ channel, date, config }) {
  if (typeof config.request.data === 'function') {
    const data = config.request.data({ channel, date })
    if (isPromise(data)) {
      return await data
    }
    return data
  }
  return config.request.data || null
}

async function getRequestUrl({ channel, date, config }) {
  if (typeof config.url === 'function') {
    const url = config.url({ channel, date })
    if (isPromise(url)) {
      return await url
    }
    return url
  }
  return config.url
}
