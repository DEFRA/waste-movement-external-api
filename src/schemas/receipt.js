import Joi from 'joi'
import { DISPOSAL_OR_RECOVERY_CODES } from '../common/constants/treatment-codes.js'
import { MEANS_OF_TRANSPORT } from '../common/constants/means-of-transport.js'
import { wasteItemsSchema } from './waste.js'
import { weightSchema } from './quantity.js'
import {
  hazardousWasteConsignmentCodeSchema,
  reasonForNoConsignmentCodeSchema
} from './hazardous-waste-consignment.js'

const addressSchema = Joi.object({
  fullAddress: Joi.string(),
  postCode: Joi.string().required()
})

const carrierSchema = Joi.object({
  registrationNumber: Joi.string(),
  reasonForNoRegistrationNumber: Joi.string(),
  organisationName: Joi.string().required(),
  address: addressSchema,
  emailAddress: Joi.string().email(),
  phoneNumber: Joi.string(),
  vehicleRegistration: Joi.string(),
  meansOfTransport: Joi.string().valid(...MEANS_OF_TRANSPORT),
  otherMeansOfTransport: Joi.string()
}).label('Carrier')

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
  weight: weightSchema.required()
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
  hazardousWasteConsignmentCode: hazardousWasteConsignmentCodeSchema,
  reasonForNoConsignmentCode: reasonForNoConsignmentCodeSchema,
  yourUniqueReference: Joi.string(),
  otherReferencesForMovement: Joi.string(),
  specialHandlingRequirements: Joi.string(),
  wasteItems: Joi.array().items(wasteItemsSchema),
  carrier: carrierSchema,
  brokerOrDealer: brokerOrDealerSchema,
  receiver: receiverSchema,
  receipt: receiptSchema
}).label('Movement')
