import { version, homepage } from '../package.json'

export default {
  days: 1,
  delay: 3000,
  output: 'guide.xml',
  channels: [],
  request: {
    method: 'GET',
    maxContentLength: 5 * 1024 * 1024,
    timeout: 5000,
    withCredentials: true,
    responseType: 'arraybuffer',
    cache: false,
    headers: {
      'User-Agent': `EPGGrabber/${version} (${homepage})`
    }
  },
  maxConnections: 1,
  curl: false,
  debug: false,
  gzip: false
}
