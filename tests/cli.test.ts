import { it, expect, beforeEach } from 'vitest'
import { execSync } from 'child_process'
import { pathToFileURL } from 'node:url'
import fs from 'fs-extra'

const ENV_VAR = 'cross-env CURR_DATE=2025-10-28'

beforeEach(() => {
  fs.emptyDirSync('tests/__data__/output')
})

it('can load config', () => {
  const stdout = execSync(
    `${ENV_VAR} tsx ./src/cli.ts --config=tests/__data__/input/example.config.cjs --delay=0 --timeout=1 --debug`,
    {
      encoding: 'utf8'
    }
  )

  expect(stdout).contains(`{
  "site": "example.com",
  "days": 2,
  "channels": [
    "example.channels.xml"
  ],
  "output": "tests/__data__/output/example.guide.xml",
  "request": {
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "Cookie": "abc=123"
    },
    "timeout": 1
  },
  "delay": 0,
  "debug": true
}`)
  expect(stdout).contains("File 'tests/__data__/output/example.guide.xml' successfully saved")
  expect(content('tests/__data__/output/example.guide.xml')).toEqual(
    content('tests/__data__/expected/example.guide.xml')
  )
})

it('can load mini config', () => {
  const stdout = execSync(
    `${ENV_VAR} tsx ./src/cli.ts \
      --config=tests/__data__/input/mini.config.cjs \
      --channels=tests/__data__/input/example.channels.xml \
      --output=tests/__data__/output/mini.guide.xml \
      --days=3 \
      --delay=0 \
      --proxy=socks://127.0.0.1:1086 \
      --timeout=1 \
      --debug`,
    {
      encoding: 'utf8'
    }
  )

  expect(stdout).contains(`{
  "site": "example.com",
  "url": "http://example.com/20210319/1tv.json",
  "channels": [
    "tests/__data__/input/example.channels.xml"
  ],
  "request": {
    "timeout": 1,
    "httpAgent": {
      "_events": {},
      "_eventsCount": 2,
      "options": {
        "noDelay": true,
        "path": null
      },
      "requests": {},
      "sockets": {},
      "freeSockets": {},
      "keepAliveMsecs": 1000,
      "keepAlive": false,
      "maxSockets": null,
      "maxFreeSockets": 256,
      "scheduling": "lifo",
      "maxTotalSockets": null,
      "totalSocketCount": 0,
      "shouldLookup": false,
      "proxy": {
        "host": "127.0.0.1",
        "port": 1086,
        "type": 5
      },
      "timeout": null,
      "socketOptions": null
    },
    "httpsAgent": {
      "_events": {},
      "_eventsCount": 2,
      "options": {
        "noDelay": true,
        "path": null
      },
      "requests": {},
      "sockets": {},
      "freeSockets": {},
      "keepAliveMsecs": 1000,
      "keepAlive": false,
      "maxSockets": null,
      "maxFreeSockets": 256,
      "scheduling": "lifo",
      "maxTotalSockets": null,
      "totalSocketCount": 0,
      "shouldLookup": false,
      "proxy": {
        "host": "127.0.0.1",
        "port": 1086,
        "type": 5
      },
      "timeout": null,
      "socketOptions": null
    }
  },
  "output": "tests/__data__/output/mini.guide.xml",
  "days": 3,
  "delay": 0,
  "debug": true
}`)
  expect(stdout).contains("File 'tests/__data__/output/mini.guide.xml' successfully saved")
  expect(content('tests/__data__/output/mini.guide.xml')).toEqual(
    content('tests/__data__/expected/mini.guide.xml')
  )
})

it('can generate gzip version', () => {
  const stdout = execSync(
    `${ENV_VAR} tsx ./src/cli.ts \
      --config=tests/__data__/input/mini.config.cjs \
      --channels=tests/__data__/input/example.channels.xml \
      --output=tests/__data__/output/mini.guide.xml.gz \
      --delay=0 \
      --timeout=1 \
      --gzip \
      --debug`,
    {
      encoding: 'utf8'
    }
  )

  expect(stdout).contains(`{
  "site": "example.com",
  "url": "http://example.com/20210319/1tv.json",
  "channels": [
    "tests/__data__/input/example.channels.xml"
  ],
  "request": {
    "timeout": 1
  },
  "output": "tests/__data__/output/mini.guide.xml.gz",
  "delay": 0,
  "debug": true,
  "gzip": true
}`)
  expect(stdout).contains("File 'tests/__data__/output/mini.guide.xml.gz' successfully saved")
  expect(fs.readFileSync('tests/__data__/output/mini.guide.xml.gz')).toEqual(
    fs.readFileSync('tests/__data__/expected/mini.guide.xml.gz')
  )
})

it('can produce multiple outputs', () => {
  const stdout = execSync(
    `${ENV_VAR} tsx ./src/cli.ts \
      --timeout=1 \
      --delay=0 \
      --config=tests/__data__/input/mini.config.cjs \
      --channels=tests/__data__/input/example.channels.xml \
      --output=tests/__data__/output/{lang}/{xmltv_id}.xml \
      --debug`,
    {
      encoding: 'utf8'
    }
  )

  expect(stdout).contains(`{
  "site": "example.com",
  "url": "http://example.com/20210319/1tv.json",
  "channels": [
    "tests/__data__/input/example.channels.xml"
  ],
  "request": {
    "timeout": 1
  },
  "output": "tests/__data__/output/{lang}/{xmltv_id}.xml",
  "delay": 0,
  "debug": true
}`)
  expect(stdout).contains("File 'tests/__data__/output/fr/1TV.com.xml' successfully saved")
  expect(stdout).contains("File 'tests/__data__/output/undefined/2TV.com.xml' successfully saved")
  expect(content('tests/__data__/output/fr/1TV.com.xml')).toEqual(
    content('tests/__data__/expected/fr/1TV.com.xml')
  )
  expect(content('tests/__data__/output/undefined/2TV.com.xml')).toEqual(
    content('tests/__data__/expected/undefined/2TV.com.xml')
  )
})

it('can load multiple "*.channels.xml" files at once', () => {
  const stdout = execSync(
    `${ENV_VAR} tsx ./src/cli.ts --config=tests/__data__/input/example.config.cjs --channels="tests/__data__/input/example_*.channels.xml" --output=tests/__data__/output/wildcard.guide.xml --delay=0 --timeout=1 --debug`,
    {
      encoding: 'utf8'
    }
  )

  expect(stdout).contains(`{
  "site": "example.com",
  "days": 2,
  "channels": [
    "tests/__data__/input/example_3.channels.xml",
    "tests/__data__/input/example_2.channels.xml"
  ],
  "output": "tests/__data__/output/wildcard.guide.xml",
  "request": {
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "Cookie": "abc=123"
    },
    "timeout": 1
  },
  "delay": 0,
  "debug": true
}`)
  expect(stdout).contains("File 'tests/__data__/output/wildcard.guide.xml' successfully saved")
  expect(content('tests/__data__/output/wildcard.guide.xml')).toEqual(
    content('tests/__data__/expected/wildcard.guide.xml')
  )
})

it('can parse list of "*.channels.xml" from array', () => {
  const stdout = execSync(
    `${ENV_VAR} tsx ./src/cli.ts --config=tests/__data__/input/example_channels.config.cjs --output=tests/__data__/output/channels_array.guide.xml --delay=0 --timeout=1 --debug`,
    {
      encoding: 'utf8'
    }
  )

  expect(stdout).contains(`{
  "site": "example.com",
  "days": 2,
  "channels": [
    "example_2.channels.xml",
    "example_3.channels.xml"
  ],
  "output": "tests/__data__/output/channels_array.guide.xml",
  "request": {
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "Cookie": "abc=123"
    },
    "timeout": 1
  },
  "delay": 0,
  "debug": true
}`)
  expect(stdout).contains(
    "File 'tests/__data__/output/channels_array.guide.xml' successfully saved"
  )

  expect(content('tests/__data__/output/channels_array.guide.xml')).toEqual(
    content('tests/__data__/expected/channels_array.guide.xml')
  )
})

function content(filepath: string) {
  const string = fs.readFileSync(pathToFileURL(filepath), 'utf8')

  return new Set(string.split('\r\n'))
}
