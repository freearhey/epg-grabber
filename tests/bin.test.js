const { execSync } = require('child_process')

const pwd = `${__dirname}/..`

function stdoutResultTester(stdout) {
  return [`Finish`].every(val => {
    return RegExp(val).test(stdout)
  })
}

it('can load config', () => {
  const result = execSync(
    `node ${pwd}/bin/epg-grabber.js --config=tests/input/example.com.config.js --delay=0`,
    {
      encoding: 'utf8'
    }
  )

  expect(stdoutResultTester(result)).toBe(true)
})

it('can load mini config', () => {
  const result = execSync(
    `node ${pwd}/bin/epg-grabber.js \
      --config=tests/input/mini.config.js \
      --channels=tests/input/example.com.channels.xml \
      --output=tests/output/mini.guide.xml \
      --lang=fr \
      --days=3 \
      --delay=0 \
      --debug \
      --timeout=1`,
    {
      encoding: 'utf8'
    }
  )

  expect(stdoutResultTester(result)).toBe(true)
  expect(result.includes("File 'tests/output/mini.guide.xml' successfully saved")).toBe(true)
})
