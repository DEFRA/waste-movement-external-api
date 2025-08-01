import Joi from 'joi'
import { DISPOSAL_OR_RECOVERY_CODES } from '../common/constants/treatment-codes.js'
import { wasteSchema } from './waste-compatible.js'
import { quantitySchema } from './quantity.js'

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
  code: Joi.string()
    .valid(...DISPOSAL_OR_RECOVERY_CODES)
    .required(),
  quantity: quantitySchema.required()
}).label('DisposalOrRecoveryCode')

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
