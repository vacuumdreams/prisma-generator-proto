import path from 'path'
import * as changeCase from 'change-case'
import { DMMF } from '@prisma/generator-helper'

import { getEnums, Enum } from './enums'
import { getModels, Models } from './models'
import { getServices, Service } from './services'

export type Definitions = {
  root: string
  enums: Enum[]
  models: Models
  types: Models
  services: Service[]
  changeCase: typeof changeCase
}

type Props = {
  root: string,
  datamodel: DMMF.Datamodel
}

export const compileDefinitions = ({ root, datamodel }: Props): Definitions => {
  return {
    root,
    enums: getEnums(datamodel.enums),
    types: getModels(datamodel.types),
    models: getModels(datamodel.models),
    services: getServices(datamodel.models),
    changeCase,
  }
}