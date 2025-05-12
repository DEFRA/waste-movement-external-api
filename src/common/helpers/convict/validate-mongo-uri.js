import Joi from 'joi'

export const convictValidateMongoUri = {
  name: 'mongo-uri',
  validate: function validateMongoUri(value) {
    const mongodbSchema = Joi.string().uri({
      scheme: ['mongodb']
    })

    Joi.assert(value, mongodbSchema)
  }
}
