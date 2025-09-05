import Joi from 'joi'
import { DISPOSAL_OR_RECOVERY_CODES } from '../common/constants/treatment-codes.js'
import { MEANS_OF_TRANSPORT } from '../common/constants/means-of-transport.js'
import { wasteItemsSchema } from './waste.js'
import { weightSchema } from './weight.js'
import {
  hazardousWasteConsignmentCodeSchema,
  reasonForNoConsignmentCodeSchema
} from './hazardous-waste-consignment.js'

const MIN_STRING_LENGTH = 1

// RegEx per Gov UK recommendation: https://assets.publishing.service.gov.uk/media/5a7f3ff4ed915d74e33f5438/Bulk_Data_Transfer_-_additional_validation_valid_from_12_November_2015.pdf
// BEGIN-NOSCAN
const UK_POSTCODE_REGEX =
  /^((GIR 0A{2})|((([A-Z]\d{1,2})|(([A-Z][A-HJ-Y]\d{1,2})|(([A-Z]\d[A-Z])|([A-Z][A-HJ-Y]\d?[A-Z])))) \d[A-Z]{2}))$/i // NOSONAR
// Ireland Eircode regex (routing key + unique identifier)
// Reference: https://www.eircode.ie
const IRL_POSTCODE_REGEX =
  /^(?:D6W|[AC-FHKNPRTV-Y]\d{2}) ?[0-9AC-FHKNPRTV-Y]{4}$/i
// END-NOSCAN

const addressSchema = Joi.object({
  fullAddress: Joi.string(),
  postCode: Joi.alternatives()
    .try(
      Joi.string().pattern(UK_POSTCODE_REGEX),
      Joi.string().pattern(IRL_POSTCODE_REGEX)
    )
    .messages({
      'alternatives.match': 'Post Code must be in valid UK or Ireland format'
    })
    .required()
})

const carrierSchema = Joi.object({
  registrationNumber: Joi.string()
    .required()
    .custom((value, helpers) => {
      const reasonProvided =
        helpers.state.ancestors[0].reasonForNoRegistrationNumber

      // If registration number is "N/A" (case-insensitive), reason is required
      if (
        value &&
        value.toUpperCase() === 'N/A' &&
        (!reasonProvided || reasonProvided.trim() === '')
      ) {
        return helpers.error('carrier.naRequiresReason')
      }

      return value
    })
    .messages({
      'string.empty': 'Carrier registration number is required',
      'any.required': 'Carrier registration number is required'
    }),
  reasonForNoRegistrationNumber: Joi.string().custom((value, helpers) => {
    const registrationNumber = helpers.state.ancestors[0].registrationNumber

    // Reason should only be provided when registration number is "N/A"
    if (
      registrationNumber &&
      registrationNumber.toUpperCase() !== 'N/A' &&
      value
    ) {
      return helpers.error('carrier.reasonOnlyForNA')
    }

    return value
  }),
  organisationName: Joi.string().required(),
  address: addressSchema,
  emailAddress: Joi.string().email(),
  phoneNumber: Joi.string(),
  vehicleRegistration: Joi.string(),
  meansOfTransport: Joi.string().valid(...MEANS_OF_TRANSPORT),
  otherMeansOfTransport: Joi.string()
})
  .label('Carrier')
  .messages({
    'carrier.naRequiresReason':
      'When carrier registration number is "N/A", a reason must be provided',
    'carrier.registrationRequired': 'Carrier registration number is required',
    'carrier.reasonOnlyForNA':
      'Reason for no registration number should only be provided when registration number is "N/A"'
  })

const receiverAddressSchema = addressSchema.keys({
  fullAddress: Joi.string().required(),
  postCode: Joi.string()
    .pattern(UK_POSTCODE_REGEX)
    .message('Post Code must be in valid UK format')
    .required()
})

const receiverSchema = Joi.object({
  organisationName: Joi.string().required(),
  emailAddress: Joi.string().email(),
  phoneNumber: Joi.string(),
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
  address: receiverAddressSchema.required()
}).label('Receipt')

const brokerOrDealerSchema = Joi.object({
  organisationName: Joi.string().required(),
  address: addressSchema,
  registrationNumber: Joi.string(),
  phoneNumber: Joi.string(),
  emailAddress: Joi.string().email()
}).label('BrokerOrDealer')

export const receiveMovementRequestSchema = Joi.object({
  receivingSiteId: Joi.string().required(),
  dateTimeReceived: Joi.date().iso().required(),
  hazardousWasteConsignmentCode: hazardousWasteConsignmentCodeSchema,
  reasonForNoConsignmentCode: reasonForNoConsignmentCodeSchema,
  yourUniqueReference: Joi.string(),
  otherReferencesForMovement: Joi.array().items(
    Joi.object({
      label: Joi.string().min(MIN_STRING_LENGTH).required(),
      reference: Joi.string().min(MIN_STRING_LENGTH).required()
    })
  ),
  specialHandlingRequirements: Joi.string(),
  wasteItems: Joi.array().items(wasteItemsSchema),
  carrier: carrierSchema,
  brokerOrDealer: brokerOrDealerSchema,
  receiver: receiverSchema,
  receipt: receiptSchema.required(),
  disposalOrRecoveryCodes: Joi.array().items(disposalOrRecoveryCodeSchema)
}).label('Movement')
