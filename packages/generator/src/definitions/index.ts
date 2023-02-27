import { DMMF } from '@prisma/generator-helper'

import { getEnums, Enum } from './enums'
import { getModels, Models } from './models'
import { getServices, Service } from './services'

export type Definitions = {
  enums: Enum[]
  models: Models
  types: Models
  services: Service[]
}

export const compileDefinitions = (datamodel: DMMF.Datamodel): Definitions => {
  return {
    enums: getEnums(datamodel.enums),
    types: getModels(datamodel.types),
    models: getModels(datamodel.models),
    services: getServices(datamodel.models),
  }
}