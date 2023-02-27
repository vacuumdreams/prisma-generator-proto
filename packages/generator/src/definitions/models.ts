import { DMMF } from '@prisma/generator-helper'
import { getProtoFieldDef, Field } from './fields'

export type Message = {
	name: string
	fields: Field[]
	children?: Message[]
	dependencies: string[]
}
  
export type Models = {
	messages: Message[]
	dependencies: string[]
}
  
export const getModels = (models: DMMF.Model[]) => {
	return models.reduce<Models>((acc, model) => {
		const name = model.name
		const fields = model.fields.map(f => getProtoFieldDef(f))
		const dependencies = fields.reduce<string[]>((dlist, f) => {
			if (f.dependency) {
				if (!dlist.includes(f.dependency)) {
					dlist.push(f.dependency)
				}
				if (!acc.dependencies.includes(f.dependency)) {
					acc.dependencies.push(f.dependency)
				}
			}
			return dlist
		}, [])

		acc.messages.push({
			name,
			fields,
			dependencies,
		})

		return acc
	}, {
		messages: [],
		dependencies: [],
	})
}