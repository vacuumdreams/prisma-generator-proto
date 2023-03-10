import { DMMF } from '@prisma/generator-helper'

export type SoloField = {
  type: string
  name: string
  opt?: undefined | 'optional'
  rep?: undefined | 'repeated'
  dependency?: string
  internal?: boolean
}

export type Field = SoloField | {
  type: 'oneof'
  name: string
  opt?: undefined | 'optional'
  children: SoloField[]
}

export const getProtoFieldDef = (field: DMMF.Field): SoloField => {
  switch(field.type) {
    case 'Json':
    case 'String': {
      return {
        opt: (field.isRequired || field.isList) ? undefined : 'optional',
        name: field.name,
        rep: field.isList ? 'repeated' : undefined,
        type: 'string',
      }
    }
    case 'Boolean': {
      return {
        opt: (field.isRequired || field.isList) ? undefined : 'optional',
        name: field.name,
        rep: field.isList ? 'repeated' : undefined,
        type: 'bool',
      }
    }
    case 'Int': {
      return {
        opt: (field.isRequired || field.isList) ? undefined : 'optional',
        name: field.name,
        rep: field.isList ? 'repeated' : undefined,
        type: 'sint64',
      }
    }
    case 'Float': {
      return {
        opt: (field.isRequired || field.isList) ? undefined : 'optional',
        name: field.name,
        rep: field.isList ? 'repeated' : undefined,
        type: 'float',
      }
    }
    case 'Decimal': {
      return {
        opt: (field.isRequired || field.isList) ? undefined : 'optional',
        name: field.name,
        rep: field.isList ? 'repeated' : undefined,
        type: 'float',
      }
    }
    case 'Bytes': {
      return {
        opt: (field.isRequired || field.isList) ? undefined : 'optional',
        name: field.name,
        rep: field.isList ? 'repeated' : undefined,
        type: 'bytes',
      }
    }
    case 'DateTime': {
      return {
        opt: (field.isRequired || field.isList) ? undefined : 'optional',
        name: field.name,
        type: 'google.protobuf.Timestamp',
        rep: field.isList ? 'repeated' : undefined,
        dependency: 'google/protobuf/timestamp.proto',
      }
    }
    default: {
      return {
        opt: (field.isRequired || field.isList) ? undefined : 'optional',
        name: field.name,
        type: field.type,
        rep: field.isList ? 'repeated' : undefined,
        internal: true
      }
    }
  }
}