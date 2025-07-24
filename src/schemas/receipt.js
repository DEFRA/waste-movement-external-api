import Joi from 'joi'

const quantitySchema = Joi.object({
  metric: Joi.string().valid('Tonnes').required(),
  amount: Joi.number().required(),
  isEstimate: Joi.bool().required()
}).label('Quantity')

const popsSchema = Joi.object({
  containsPops: Joi.boolean(),
  pops: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      concentrationValue: Joi.number()
    }).label('PopsItem')
  )
}).label('Pops')

const hazardousSchema = Joi.object({
  components: Joi.array().items(
    Joi.object({
      component: Joi.string(),
      concentration: Joi.number()
    }).label('ComponentItem')
  )
})

const wasteSchema = Joi.object({
  ewcCode: Joi.string().required(),
  wasteDescription: Joi.string().required(),
  form: Joi.string()
    .valid('Gas', 'Liquid', 'Solid', 'Powder', 'Sludge', 'Mixed')
    .required(),
  numberOfContainers: Joi.number(),
  typeOfContainers: Joi.string(),
  quantity: quantitySchema,
  pops: popsSchema,
  hazardous: hazardousSchema
}).label('Waste')

const carrierSchema = Joi.object({
  registrationNumber: Joi.string(),
  reasonForNoRegistrationNumber: Joi.string(),
  organisationName: Joi.string(),
  address: Joi.string(),
  emailAddress: Joi.string().email(),
  phoneNumber: Joi.string(),
  vehicleRegistration: Joi.string(),
  meansOfTransport: Joi.string().valid(
    'Road',
    'Rail',
    'Air',
    'Sea',
    'Waterway',
    'Pipe',
    'Other'
  ),
  otherMeansOfTransport: Joi.string()
}).label('Carrier')

const acceptanceSchema = Joi.object({
  acceptingAll: Joi.boolean().required(),
  quantityNotAccepted: Joi.when('acceptingAll', {
    is: false,
    then: quantitySchema.required(),
    otherwise: Joi.forbidden()
  }),
  rejectionReason: Joi.when('acceptingAll', {
    is: false,
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  })
}).label('Acceptance')

const receiverSchema = Joi.object({
  authorisations: Joi.array().items({
    authorisationType: Joi.string(),
    authorisationNumber: Joi.string()
  }),
  regulatoryPositionStatement: Joi.string()
}).label('Receiver')

const disposalOrRecoveryCodeSchema = Joi.object({
  code: Joi.string(),
  quantity: quantitySchema
})

const receiptSchema = Joi.object({
  dateTimeReceived: Joi.date().iso(),
  disposalOrRecoveryCodes: Joi.array().items(disposalOrRecoveryCodeSchema)
}).label('Receipt')

const brokerOrDealerSchema = Joi.object({
  organisationName: Joi.string(),
  address: Joi.string(),
  registrationNumber: Joi.string()
}).label('BrokerOrDealer')

export const receiveMovementRequestSchema = Joi.object({
  receivingSiteId: Joi.string().required(),
  hazardousWasteConsignmentNumber: Joi.string(),
  reasonForNoConsignmentNumber: Joi.string(),
  yourUniqueReference: Joi.string(),
  otherReferencesForMovement: Joi.string(),
  specialHandlingRequirements: Joi.string(),
  waste: Joi.array().items(wasteSchema),
  carrier: carrierSchema,
  brokerOrDealer: brokerOrDealerSchema,
  acceptance: acceptanceSchema,
  receiver: receiverSchema,
  receipt: receiptSchema
}).label('Movement')

const popsComponentSchema = Joi.object({
  component: Joi.string().required(),
  concentration: Joi.number().required(),
  popsCode: Joi.string().required()
}).label('PopsComponent')

export const popsWasteSchema = Joi.object({
  isPopsWaste: Joi.boolean().required(),
  components: Joi.array().items(popsComponentSchema).when('isPopsWaste', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.forbidden()
  })
}).label('PopsWaste')
