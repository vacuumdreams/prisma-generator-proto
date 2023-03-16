import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'

const TMP_OUTPUT_PATH = path.join(__dirname, 'tmp')
const SCHEMA_PATH = path.join(__dirname, '../../usage/prisma/schema.prisma')

describe('Generate handler', () => {
  beforeEach(() => {
    fs.mkdirSync(path.join(TMP_OUTPUT_PATH, 'prisma'), { recursive: true })
    fs.copyFileSync(
      path.join(__dirname, '../../usage/prisma/schema.prisma'),
      path.join(TMP_OUTPUT_PATH, 'prisma/schema.prisma'),
    )
  })

  afterEach(() => {
    fs.rmSync(TMP_OUTPUT_PATH, { recursive: true, force: true })
  })

  it('generates proto files', () => {
    expect(fs.existsSync(path.join(TMP_OUTPUT_PATH, 'protos'))).toBe(false)

    const exec = () => {
      const r = spawnSync('prisma', ['generate', '--schema=prisma/schema.prisma'], {
        cwd: TMP_OUTPUT_PATH,
      })
      if (r.error) {
        throw r.error
      }
      if (r.stderr.toString() !== '') {
        throw new Error(r.stderr.toString())
      }
      console.log(r.stdout.toString())
    }

    expect(exec).not.toThrow()

    expect(fs.existsSync(path.join(TMP_OUTPUT_PATH, 'protos'))).toBe(true)
  })
})