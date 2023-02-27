import { generatorHandler, GeneratorOptions, DMMF } from '@prisma/generator-helper'
import { logger } from '@prisma/sdk'
import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'
import { template } from 'underscore'

import { paramCase } from 'change-case'
import { GENERATOR_NAME } from './constants'
import { writeFileSafely } from './utils/fs'
import { collectTemplates } from './utils/template'
import { compileDefinitions } from './definitions'

const { version } = require('../package.json')

generatorHandler({
  onManifest() {
    logger.info(`${GENERATOR_NAME}: ✔ Registered`)
    return {
      version,
      defaultOutput: '../protos',
      prettyName: GENERATOR_NAME,
    }
  },
  onGenerate: async (options: GeneratorOptions) => {
    const outputDir = options.generator.output?.value ?? '../protos'
    const outputRoot = path.join(options.schemaPath, outputDir)
    const hasCustomTemplate = !!options.generator.config.templatePath
    const tplRoot = options.generator.config.templatePath || path.join(__dirname, 'template')

    const templateFiles = collectTemplates(tplRoot)
    const definitions = compileDefinitions(options.dmmf.datamodel)

    await Promise.all(templateFiles.map(p => {
      const tplContent = fs.readFileSync(p, { encoding: 'utf-8' })
      const outputPath = path.join(outputDir, p.replace(tplRoot, ''))

      if (outputPath.includes('{model}')) {
        definitions.models.messages.forEach(m => {
          const modelOutputPath = outputPath.replace(new RegExp('{model}', 'g'), paramCase(m.name))
          const content = template(tplContent)({
            ...definitions,
            model: definitions.models.messages.find(({ name }) => m.name === name),
            service: definitions.services.find(({ name }) => m.name === name),
          })
          return writeFileSafely(modelOutputPath, content)
        })
        return
      }
      
      const content = template(tplContent)(definitions)
      return writeFileSafely(outputPath, content)
    }))

    logger.info(`${GENERATOR_NAME}: ✔ Generation complete`)

    if (!hasCustomTemplate) {
      try {
        spawnSync('buf', ['lint', outputRoot])
        logger.info(`${GENERATOR_NAME}: ✔ Lint complete`)
      } catch (err) {
        logger.error(`${GENERATOR_NAME}: Error linting generated protos`, err)
      }

      try {
        spawnSync('buf', ['format', outputRoot, '-w'])
        logger.info(`${GENERATOR_NAME}: ✔ Format complete`)
      } catch (err) {
        logger.error(`${GENERATOR_NAME}: Error formatting generated protos: `, err)
      }
    }
  },
})
