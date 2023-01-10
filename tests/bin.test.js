const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const epgParser = require('epg-parser')

const pwd = `${__dirname}/..`

function stdoutResultTester(stdout) {
  return [`Finish`].every(val => {
    return RegExp(val).test(stdout)
  })
}

it('can load config', () => {
  const stdout = execSync(
    `node ${pwd}/bin/epg-grabber.js --config=tests/__data__/input/example.config.js --delay=0`,
    {
      encoding: 'utf8'
    }
  )

  expect(stdoutResultTester(stdout)).toBe(true)
})

it('can load mini config', () => {
  const stdout = execSync(
    `node ${pwd}/bin/epg-grabber.js \
      --config=tests/__data__/input/mini.config.js \
      --channels=tests/__data__/input/example.channels.xml \
      --output=tests/__data__/output/mini.guide.xml \
      --lang=fr \
      --days=3 \
      --delay=0 \
      --debug \
      --timeout=1`,
    {
      encoding: 'utf8'
    }
  )

  expect(stdoutResultTester(stdout)).toBe(true)
  expect(stdout.includes("File 'tests/__data__/output/mini.guide.xml' successfully saved")).toBe(
    true
  )
})

it('can generate gzip version', () => {
  const stdout = execSync(
    `node ${pwd}/bin/epg-grabber.js \
      --config=tests/__data__/input/mini.config.js \
      --channels=tests/__data__/input/example.channels.xml \
      --output=tests/__data__/output/mini.guide.xml.gz \
      --gzip`,
    {
      encoding: 'utf8'
    }
  )

  expect(stdoutResultTester(stdout)).toBe(true)
  expect(stdout.includes("File 'tests/__data__/output/mini.guide.xml.gz' successfully saved")).toBe(
    true
  )
})

it('removes duplicates of the program', () => {
  const stdout = execSync(
    `node ${pwd}/bin/epg-grabber.js \
      --config=tests/__data__/input/duplicates.config.js \
      --channels=tests/__data__/input/example.channels.xml \
      --output=tests/__data__/output/duplicates.guide.xml`,
    {
      encoding: 'utf8'
    }
  )

  let output = fs.readFileSync(path.resolve(__dirname, '__data__/output/duplicates.guide.xml'))
  let expected = fs.readFileSync(path.resolve(__dirname, '__data__/expected/duplicates.guide.xml'))

  output = epgParser.parse(output)
  expected = epgParser.parse(expected)

  expect(output.programs).toEqual(expected.programs)
})
