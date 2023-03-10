#!/usr/bin/env node
import { logger } from '@prisma/sdk'
import { generatorHandler } from '@prisma/generator-helper'
import { createHandler } from './generator'

const handler = createHandler({ logger })

generatorHandler(handler)