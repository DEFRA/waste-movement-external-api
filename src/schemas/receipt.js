import Joi from 'joi'

const quantitySchema = Joi.object({
  value: Joi.number().required(),
  unit: Joi.string().required(),
  isEstimate: Joi.bool().required()
}).label('Quantity')

const wasteSchema = Joi.object({
  ewcCode: Joi.string().required(),
  description: Joi.string().required(),
  form: Joi.string()
    .valid('Gas', 'Liquid', 'Solid', 'Powder', 'Sludge', 'Mixed')
    .required(),
  containers: Joi.string().required(),
  quantity: quantitySchema.required()
}).label('Waste')

const carrierSchema = Joi.object({
  registrationNumber: Joi.string().required(),
  organisationName: Joi.string().required(),
  address: Joi.string().required(),
  emailAddress: Joi.string().email().required(),
  companiesHouseNumber: Joi.string(),
  phoneNumber: Joi.string().required(),
  vehicleRegistration: Joi.string().required(),
  meansOfTransport: Joi.string()
    .valid('Road', 'Rail', 'Air', 'Sea', 'Waterway', 'Other')
    .required()
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
  authorisationType: Joi.string().required(),
  authorisationNumber: Joi.string().required(),
  regulatoryPositionStatement: Joi.string()
}).label('Receiver')

const disposalOrRecoveryCodeSchema = Joi.object({
  code: Joi.string(),
  quantity: quantitySchema
})

const receiptSchema = Joi.object({
  estimateOrActual: Joi.string().valid('Estimate', 'Actual').required(),
  dateTimeReceived: Joi.date().iso().required(),
  disposalOrRecoveryCode: disposalOrRecoveryCodeSchema
}).label('Receipt')

const movementSchema = Joi.object({
  receivingSiteId: Joi.string().required(),
  receiverReference: Joi.string().required(),
  specialHandlingRequirements: Joi.string(),
  waste: Joi.array().items(wasteSchema),
  carrier: carrierSchema.required(),
  acceptance: acceptanceSchema.required(),
  receiver: receiverSchema.required(),
  receipt: receiptSchema.required()
}).label('Movement')

export const receiptMovementSchema = Joi.object({
  movement: movementSchema.required()
}).label('ReceiptMovement')

const hazardousComponentSchema = Joi.object({
  component: Joi.string().required(),
  concentration: Joi.number().required(),
  hazCode: Joi.string().required()
}).label('HazardousComponent')

export const hazardousWasteSchema = Joi.object({
  isHazardousWaste: Joi.boolean().required(),
  components: Joi.array()
    .items(hazardousComponentSchema)
    .when('isHazardousWaste', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.forbidden()
    })
}).label('HazardousWaste')

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
