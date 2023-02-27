import { generatorHandler, GeneratorOptions, DMMF } from '@prisma/generator-helper'
import { logger } from '@prisma/sdk'
import fs from 'fs'
import path from 'path'
import { template } from 'underscore'

import { paramCase } from 'change-case'
import { GENERATOR_NAME } from './constants'
import { writeFileSafely } from './utils/fs'
import { collectTemplates } from './utils/template'
import { compileDefinitions } from './definitions'

const { version } = require('../package.json')

generatorHandler({
  onManifest() {
    logger.info(`${GENERATOR_NAME}:Registered`)
    return {
      version,
      defaultOutput: '../protos',
      prettyName: GENERATOR_NAME,
    }
  },
  onGenerate: async (options: GeneratorOptions) => {
    const outputRoot = options.generator.output?.value ?? '../protos'
    const tplRoot = options.generator.config.templatePath || path.join(__dirname, 'template')

    const templateFiles = collectTemplates(tplRoot)
    const definitions = compileDefinitions(options.dmmf.datamodel)

    await Promise.all(templateFiles.map(p => {
      const tplContent = fs.readFileSync(p, { encoding: 'utf-8' })
      const outputPath = path.join(outputRoot, p.replace(tplRoot, ''))

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
  },
})
