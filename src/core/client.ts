import { ClientRequestContext, ClientResponse } from '../types/client'
import axios, { AxiosRequestConfig } from 'axios'
import { isPromise } from './utils'
import {
  AxiosCacheInstance,
  CacheAxiosResponse,
  CacheRequestConfig,
  setupCache
} from 'axios-cache-interceptor'

export class Client {
  instance: AxiosCacheInstance

  constructor() {
    this.instance = setupCache(axios.create())
  }

  static async buildRequest(context: ClientRequestContext): Promise<CacheRequestConfig> {
    async function getRequestHeaders(
      requestContext: ClientRequestContext
    ): Promise<Record<string, string> | undefined> {
      const config = requestContext.config
      if (config.request && typeof config.request.headers === 'function') {
        if (typeof config.request.headers === 'function') {
          const headers = config.request.headers(requestContext)
          if (isPromise(headers)) {
            return await headers
          }
          return headers
        }
      }

      return typeof config.request?.headers === 'object' ? config.request?.headers : undefined
    }

    async function getRequestData(requestContext: ClientRequestContext) {
      const config = requestContext.config
      if (!config.request) return undefined

      if (typeof config.request.data === 'function') {
        const data = config.request.data(requestContext)
        if (isPromise(data)) {
          return await data
        }
        return data
      }

      return config.request?.data
    }

    async function getRequestUrl(requestContext: ClientRequestContext) {
      const config = requestContext.config
      if (typeof config.url === 'function') {
        const url = config.url(requestContext)
        if (isPromise(url)) {
          return await url
        }
        return url
      }
      return config.url
    }

    const request = context.config.request as CacheRequestConfig
    request.headers = await getRequestHeaders(context)
    request.url = await getRequestUrl(context)
    request.data = await getRequestData(context)

    return request
  }

  async sendRequest(request: AxiosRequestConfig): Promise<ClientResponse> {
    const response = (await this.instance(request)) as CacheAxiosResponse

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
