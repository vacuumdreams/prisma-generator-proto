import { DMMF } from '@prisma/generator-helper'

export type EnumField = {
    name: string
}
  
export type Enum = {
    name: string
    fields: EnumField[]
}
  
export const getEnums = (enums: DMMF.DatamodelEnum[]) => {
    return enums.map(e => ({
        name: e.name,
        fields: e.values.map(value => ({
        name: value.name,
        }))
    }))
}