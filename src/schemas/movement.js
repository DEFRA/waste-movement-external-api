import Joi from 'joi'

const quantitySchema = Joi.object({
  value: Joi.number().required().description('The quantity value'),
  unit: Joi.string().required().description('The unit of measurement')
}).label('Quantity')

const wasteSchema = Joi.object({
  ewcCode: Joi.string().required().description('European Waste Catalogue code'),
  description: Joi.string().required().description('Description of the waste'),
  form: Joi.string()
    .valid('Gas', 'Liquid', 'Solid', 'Powder', 'Sludge', 'Mixed')
    .required()
    .description('Physical form of the waste'),
  containers: Joi.string()
    .required()
    .description('Description of containers used'),
  quantity: quantitySchema.required().description('Quantity of waste')
}).label('Waste')

const carrierSchema = Joi.object({
  registrationNumber: Joi.string()
    .required()
    .description('Carrier registration number'),
  organisationName: Joi.string()
    .required()
    .description('Name of the carrier organisation'),
  address: Joi.string().required().description('Carrier address'),
  emailAddress: Joi.string()
    .email()
    .required()
    .description('Carrier email address'),
  companiesHouseNumber: Joi.string().description(
    'Companies House registration number'
  ),
  phoneNumber: Joi.string().required().description('Carrier phone number'),
  vehicleRegistration: Joi.string()
    .required()
    .description('Vehicle registration number'),
  meansOfTransport: Joi.string()
    .valid('Road', 'Rail', 'Air', 'Sea', 'Waterway', 'Other')
    .required()
    .description('Means of transport used')
}).label('Carrier')

const acceptanceSchema = Joi.object({
  acceptingAll: Joi.boolean()
    .required()
    .description('Whether all waste is being accepted'),
  quantityNotAccepted: Joi.when('acceptingAll', {
    is: false,
    then: quantitySchema
      .required()
      .description('Quantity of waste not accepted'),
    otherwise: Joi.forbidden()
  }),
  rejectionReason: Joi.when('acceptingAll', {
    is: false,
    then: Joi.string().required().description('Reason for rejection'),
    otherwise: Joi.forbidden()
  })
}).label('Acceptance')

const receiverSchema = Joi.object({
  authorisationType: Joi.string()
    .required()
    .description('Type of authorisation'),
  authorisationNumber: Joi.string()
    .required()
    .description('Authorisation number'),
  regulatoryPositionStatement: Joi.string().description(
    'Regulatory position statement'
  )
}).label('Receiver')

const receiptSchema = Joi.object({
  estimateOrActual: Joi.string()
    .valid('Estimate', 'Actual')
    .required()
    .description('Whether the receipt is an estimate or actual'),
  dateTimeReceived: Joi.date()
    .iso()
    .required()
    .description('Date and time when waste was received')
}).label('Receipt')

export const createMovementSchema = Joi.object({
  receiverReference: Joi.string()
    .required()
    .description('Reference number used by the receiver'),
  specialHandlingRequirements: Joi.string().description(
    'Any special handling requirements'
  ),
  waste: wasteSchema.required().description('Waste details'),
  carrier: carrierSchema.required().description('Carrier details'),
  acceptance: acceptanceSchema.required().description('Acceptance details'),
  receiver: receiverSchema.required().description('Receiver details'),
  receipt: receiptSchema.required().description('Receipt details')
}).label('CreateMovement')

export const hazardousWasteSchema = Joi.object({
  isHazerdousWaste: Joi.boolean()
    .required()
    .description('Whether the waste is hazardous'),
  components: Joi.array()
    .items(
      Joi.object({
        component: Joi.string()
          .required()
          .description('Name of the hazardous component'),
        concentration: Joi.number()
          .required()
          .description('Concentration of the component'),
        hazCode: Joi.string()
          .required()
          .description('Hazard code for the component')
      })
    )
    .when('isHazerdousWaste', {
      is: true,
      then: Joi.required().description('Hazardous components details'),
      otherwise: Joi.forbidden()
    })
}).label('HazardousWaste')

export const popsSchema = Joi.object({
  hasPops: Joi.boolean()
    .required()
    .description('Whether the waste contains POPs'),
  concentrationValue: Joi.number().when('hasPops', {
    is: true,
    then: Joi.required().description('Concentration value of POPs'),
    otherwise: Joi.forbidden()
  })
}).label('Pops')

export const movementIdSchema = Joi.object({
  movementId: Joi.string()
    .guid()
    .required()
    .description('Globally unique identifier of the movement')
}).label('MovementId')

export const carrierMovementSchema = Joi.object({
  carrierId: Joi.string().required().description('Carrier identifier'),
  carrierMovementId: Joi.string()
    .required()
    .description('Carrier movement identifier')
}).label('CarrierMovement')
