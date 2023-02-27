import { DMMF } from '@prisma/generator-helper'

import { Message } from './models'
import { getProtoFieldDef } from './fields'
import { compileMessageWithIdentifiableFields } from '../utils/message'

enum OperationType {
  FIND = 'Find',
  CREATE = 'Create',
  UPDATE = 'Update',
  DELETE = 'Delete',
}

export type Operation = {
  name: string
  req: Message
  res: Message
}
  
export type Service = {
  name: string
  operations: Operation[]
  dependencies: string[]
}

const getFindRequest = (model: DMMF.Model): Message => {
  return compileMessageWithIdentifiableFields({
    name: `FindRequest`,
    model,
  })
}

const isCreatable = (f: DMMF.Field): boolean => {
  return (
    !f.isGenerated
    && !f.isUpdatedAt
    && !f.relationName
    && !(f.isId && f.hasDefaultValue)
    && !(typeof f.default === 'object' && f.default.name === 'now')
  )
}

const getCreateRequest = (model: DMMF.Model): Message => {
  return model.fields.reduce<Message>((acc, f) => {
    if (isCreatable(f)) {
      const def = getProtoFieldDef(f)
      acc.fields.push({
        ...def,
        opt: !!f.default ? 'optional' : undefined,
      })
      if (def.dependency && !acc.dependencies.includes(def.dependency)) {
        acc.dependencies.push(def.dependency)
      }
    }
    return acc
  }, {
    name: `CreateRequest`,
    fields: [],
    dependencies: [],
  })
}

const isUpdatable = (f: DMMF.Field): boolean => {
  return (
    !f.isGenerated
    && !f.isUpdatedAt
    && !f.isReadOnly
    && !f.relationName
    && !(typeof f.default === 'object' && f.default.name === 'now')
  )
}

const getUpdateRequest = (model: DMMF.Model): Message => {
  return model.fields.reduce<Message>((acc, f) => {
    if (isUpdatable(f)) {
      const def = getProtoFieldDef(f)
      acc.fields.push({
        ...def,
        opt: f.isId ? undefined : 'optional',
      })
      if (def.dependency && !acc.dependencies.includes(def.dependency)) {
        acc.dependencies.push(def.dependency)
      }
    }
    return acc
  }, {
    name: `UpdateRequest`,
    fields: [],
    dependencies: [],
  })
}

const getDeleteRequest = (model: DMMF.Model): Message => {
  return compileMessageWithIdentifiableFields({
    name: `DeleteRequest`,
    model,
  })
}

const getRequest = (t: OperationType, model: DMMF.Model): Message => {
  switch (t) {
    case OperationType.FIND: {
      return getFindRequest(model)
    }
    case OperationType.CREATE: {
      return getCreateRequest(model)
    }
    case OperationType.UPDATE: {
      return getUpdateRequest(model)
    }
    case OperationType.DELETE: {
      return getDeleteRequest(model)
    }
    default: {
      throw Error(`Operation ${t} not permitted.`)
    }
  }
}

const getFindResponse = (model: DMMF.Model): Message => {
  return {
    name: `FindResponse`,
    fields: [{
      name: 'item',
      type: model.name,
      internal: true,
    }],
    dependencies: [],
  }
}

const getCreateResponse = (model: DMMF.Model): Message => {
  return {
    name: `CreateResponse`,
    fields: [{
      name: 'item',
      type: model.name,
      internal: true,
    }],
    dependencies: [],
  }
}

const getUpdateResponse = (model: DMMF.Model): Message => {
  return {
    name: `UpdateResponse`,
    fields: [{
      name: 'item',
      type: model.name,
      internal: true,
    }],
    dependencies: [],
  }
}

const getDeleteResponse = (model: DMMF.Model): Message => {
  return {
    name: `DeleteResponse`,
    fields: [{
      name: 'item',
      type: model.name,
      internal: true,
    }],
    dependencies: [],
  }
}

const getResponse = (t: OperationType, model: DMMF.Model): Message => {
  switch (t) {
    case OperationType.FIND: {
      return getFindResponse(model)
    }
    case OperationType.CREATE: {
      return getCreateResponse(model)
    }
    case OperationType.UPDATE: {
      return getUpdateResponse(model)
    }
    case OperationType.DELETE: {
      return getDeleteResponse(model)
    }
    default: {
      throw Error(`Operation ${t} not permitted.`)
    }
  }
}

const getOperations = (model: DMMF.Model): Operation[] => {
  return Object.values(OperationType).map(t => ({
    name: t,
    req: getRequest(t, model),
    res: getResponse(t, model),
  })).filter(o => o.req.fields.length > 0 && o.res.fields.length > 0)
}

export const getServices = (models: DMMF.Model[]): Service[] => {
  return models.reduce<Service[]>((acc, m) => {
    const operations = getOperations(m)
    const dependencies = operations.reduce<string[]>((acc, o) => {
      o.res.dependencies.concat(o.req.dependencies).forEach(d => {
        if (!acc.includes(d)) {
          acc.push(d)
        }
      })
      return acc
    }, [])

    acc.push({
      name: m.name,
      operations,
      dependencies,
    })
    return acc
  }, [])
}