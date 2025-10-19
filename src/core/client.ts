import { ClientRequestConfig, ClientResponse } from '../types/client'
import axios, { AxiosHeaders, AxiosRequestConfig } from 'axios'
import { CurlGenerator } from 'curl-generator'
import { isObject, isPromise } from './utils'
import { Logger } from './logger'
import {
  AxiosCacheInstance,
  CacheAxiosResponse,
  CacheRequestConfig,
  setupCache
} from 'axios-cache-interceptor'

export class Client {
  #instance: AxiosCacheInstance

  constructor(options?: { logger: Logger }) {
    const logger = options && options.logger ? options.logger : new Logger()
    const instance = setupCache(axios.create())

    instance.interceptors.request.use(
      function (request) {
        logger.debug(`Request: ${JSON.stringify(request, null, 2)}`)

        return request
      },
      function (error) {
        return Promise.reject(error)
      }
    )

    instance.interceptors.response.use(
      function (response) {
        const data = response.data
          ? isObject(response.data) || Array.isArray(response.data)
            ? JSON.stringify(response.data)
            : response.data.toString()
          : undefined

        logger.debug(
          `Response: ${JSON.stringify(
            {
              headers: response.headers,
              data,
              cached: response.cached
            },
            null,
            2
          )}`
        )

        return response
      },
      function (error) {
        return Promise.reject(error)
      }
    )

    this.#instance = instance
  }

  static async buildRequest(
    config: ClientRequestConfig,
    options?: { logger: Logger }
  ): Promise<CacheRequestConfig> {
    const logger = options && options.logger ? options.logger : new Logger()

    async function getRequestHeaders(
      config: ClientRequestConfig
    ): Promise<Record<string, string> | undefined> {
      if (config.siteConfig.request && typeof config.siteConfig.request.headers === 'function') {
        if (typeof config.siteConfig.request.headers === 'function') {
          const requestContext = { channel: config.channel, date: config.date }
          const headers = config.siteConfig.request.headers(requestContext)
          if (isPromise(headers)) {
            return await headers
          }
          return headers
        }
      }

      return typeof config.siteConfig.request?.headers === 'object'
        ? config.siteConfig.request?.headers
        : undefined
    }

    async function getRequestData(config: ClientRequestConfig) {
      if (!config.siteConfig.request) return undefined

      if (typeof config.siteConfig.request.data === 'function') {
        const requestContext = { channel: config.channel, date: config.date }
        const data = config.siteConfig.request.data(requestContext)
        if (isPromise(data)) {
          return await data
        }
        return data
      }

      return config.siteConfig.request?.data
    }

    async function getRequestUrl(config: ClientRequestConfig) {
      if (typeof config.siteConfig.url === 'function') {
        const requestContext = { channel: config.channel, date: config.date }
        const url = config.siteConfig.url(requestContext)
        if (isPromise(url)) {
          return await url
        }
        return url
      }
      return config.siteConfig.url
    }

    const request = config.siteConfig.request as CacheRequestConfig
    request.headers = await getRequestHeaders(config)
    request.url = await getRequestUrl(config)
    request.data = await getRequestData(config)

    if (config.siteConfig.curl) {
      type AllowedMethods =
        | 'GET'
        | 'get'
        | 'POST'
        | 'post'
        | 'PUT'
        | 'put'
        | 'PATCH'
        | 'patch'
        | 'DELETE'
        | 'delete'

      const headers = request.headers instanceof AxiosHeaders ? request.headers : {}
      const method = (request.method as AllowedMethods) || 'GET'

      const curl = CurlGenerator({
        url: request.url || '',
        method,
        headers,
        body: request.data
      })

      logger.info(curl)
    }

    return request
  }

  async sendRequest(request: AxiosRequestConfig): Promise<ClientResponse> {
    const response = (await this.#instance(request)) as CacheAxiosResponse

    return this.parseResponse(response)
  }

  parseResponse(response: CacheAxiosResponse): ClientResponse {
    return {
      content: response.data.toString(),
      buffer: response.data,
      headers: response.headers,
      request: response.request,
      cached: response.cached
    }
  }
}
