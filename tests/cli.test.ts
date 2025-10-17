import { it, expect, beforeEach } from 'vitest'
import { execSync } from 'child_process'
import fs from 'fs-extra'

beforeEach(() => {
  fs.emptyDirSync('tests/__data__/output')
})

it('can load config', () => {
  const stdout = execSync(
    `tsx ./src/cli.ts --config=tests/__data__/input/example.config.cjs --delay=0 --timeout=1`,
    {
      encoding: 'utf8'
    }
  )

  expect(stdout).contains('Finished')
})

it('can load mini config', () => {
  const stdout = execSync(
    `tsx ./src/cli.ts \
      --config=tests/__data__/input/mini.config.cjs \
      --channels=tests/__data__/input/example.channels.xml \
      --output=tests/__data__/output/mini.guide.xml \
      --lang=fr \
      --days=3 \
      --delay=0 \
      --proxy=socks://127.0.0.1:1086 \
      --timeout=1`,
    {
      encoding: 'utf8'
    }
  )

  expect(stdout).contains('Finished')
  expect(stdout).contains("File 'tests/__data__/output/mini.guide.xml' successfully saved")
})

it('can generate gzip version', () => {
  const stdout = execSync(
    `tsx ./src/cli.ts \
      --config=tests/__data__/input/mini.config.cjs \
      --channels=tests/__data__/input/example.channels.xml \
      --output=tests/__data__/output/mini.guide.xml.gz \
      --delay=0 \
      --timeout=1 \
      --gzip`,
    {
      encoding: 'utf8'
    }
  )

  expect(stdout).contains('Finished')
  expect(stdout).contains("File 'tests/__data__/output/mini.guide.xml.gz' successfully saved")
})

it('can produce multiple outputs', () => {
  const stdout = execSync(
    `tsx ./src/cli.ts \
      --timeout=1 \
      --delay=0 \
      --config=tests/__data__/input/mini.config.cjs \
      --channels=tests/__data__/input/example.channels.xml \
      --output=tests/__data__/output/{lang}/{xmltv_id}.xml`,
    {
      encoding: 'utf8'
    }
  )

  expect(stdout).contains('Finished')
  expect(stdout).contains("File 'tests/__data__/output/fr/1TV.com.xml' successfully saved")
  expect(stdout).contains("File 'tests/__data__/output/undefined/2TV.com.xml' successfully saved")
})

it('can load multiple "channels.xml" files at once', () => {
  const stdout = execSync(
    `tsx ./src/cli.ts --config=tests/__data__/input/example.config.cjs --channels=tests/__data__/input/example*.channels.xml --delay=0 --timeout=1`,
    {
      encoding: 'utf8'
    }
  )

  expect(stdout).contains('Finished')
})

it('can parse list of "channels.xml" from array', () => {
  const stdout = execSync(
    `tsx ./src/cli.ts --config=tests/__data__/input/example_channels.config.cjs --delay=0 --timeout=1`,
    {
      encoding: 'utf8'
    }
  )

  expect(stdout).contains('Finished')
})
