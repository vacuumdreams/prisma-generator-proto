import { logger } from '@prisma/sdk'
import { DMMF } from '@prisma/generator-helper'

import { Message } from '../definitions/models'
import { getProtoFieldDef } from '../definitions/fields'

type Props = {
	name: string
	model: DMMF.Model
}

const addByName = (model: DMMF.Model) => (acc: Message, name: string) => {
	const f = model.fields.find(f => f.name === name)
	if (f) {
		const def = getProtoFieldDef(f)
		acc.fields.push(def)
		if (def.dependency && !acc.dependencies.includes(def.dependency)) {
			acc.dependencies.push(def.dependency)
		}
	}
	return acc
}

export const compileMessageWithIdentifiableFields = ({ model, name }: Props): Message => {
	if (!!model.fields.find(f => f.isId || f.isUnique)) {
		return model.fields.reduce<Message>((acc, f) => {
			if (f.isId || f.isUnique) {
				const def = getProtoFieldDef(f)
				if ('children' in acc.fields[0]) {
					acc.fields[0].children.push(def)
					if (def.dependency && !acc.dependencies.includes(def.dependency)) {
						acc.dependencies.push(def.dependency)
					}
				}
			}
			return acc
		}, {
			name,
			fields: [{
				name: 'where',
				type: 'oneof',
				children: []
			}],
			dependencies: [],
		})
	}

	if (model.primaryKey) {
		return model.primaryKey.fields.reduce<Message>(addByName(model), {
			name,
			fields: [],
			dependencies: [],
		})
	}

	if (model.uniqueFields.length) {
		if (model.uniqueFields.length > 1) {
			logger.warn(`Multiple contraints will be ignored in the model "${model.name}" for the handler "${name}".`)
		}

		return model.uniqueFields[0].reduce<Message>(addByName(model), {
			name,
			fields: [],
			dependencies: [],
		})
	}

	return {
		name,
		fields: [],
		dependencies: [],
	}
}