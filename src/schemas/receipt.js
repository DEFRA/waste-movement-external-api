import Joi from 'joi'
import { MEANS_OF_TRANSPORT } from '../common/constants/means-of-transport.js'
import { wasteItemsSchema } from './waste.js'
import {
  hazardousWasteConsignmentCodeSchema,
  reasonForNoConsignmentCodeSchema
} from './hazardous-waste-consignment.js'
import {
  ENGLAND_CARRIER_REGISTRATION_NUMBER_REGEX,
  IRL_POSTCODE_REGEX,
  NI_CARRIER_REGISTRATION_NUMBER_REGEX,
  NRU_CARRIER_REGISTRATION_NUMBER_REGEX,
  SEPA_CARRIER_REGISTRATION_NUMBER_REGEX,
  UK_POSTCODE_REGEX
} from '../common/constants/regexes.js'

const MIN_STRING_LENGTH = 1

// Carrier validation error messages
const CARRIER_REGISTRATION_REQUIRED = 'Carrier registration number is required'
const CARRIER_REGISTRATION_OR_REASON_REQUIRED =
  'Either carrier registration number or reason for no registration number is required'
const CARRIER_REASON_ONLY_FOR_NULL =
  'Reason for no registration number should only be provided when registration number is not provided'
const CARRIER_VEHICLE_REG_REQUIRED_FOR_ROAD =
  'If carrier.meansOfTransport is "Road" then carrier.vehicleRegistration is required.'
const CARRIER_VEHICLE_REG_ONLY_ALLOWED_FOR_ROAD =
  'If carrier.meansOfTransport is not "Road" then carrier.vehicleRegistration is not applicable.'

const LONG_STRING_MAX_LENGTH = 5000

const addressSchema = Joi.object({
  fullAddress: Joi.string(),
  postcode: Joi.alternatives()
    .try(
      Joi.string().pattern(UK_POSTCODE_REGEX),
      Joi.string().pattern(IRL_POSTCODE_REGEX)
    )
    .messages({
      'alternatives.match': 'Postcode must be in valid UK or Ireland format'
    })
    .required()
})

const carrierSchema = Joi.object({
  registrationNumber: Joi.alternatives()
    .try(
      Joi.string().pattern(ENGLAND_CARRIER_REGISTRATION_NUMBER_REGEX),
      Joi.string().pattern(SEPA_CARRIER_REGISTRATION_NUMBER_REGEX),
      Joi.string().pattern(NRU_CARRIER_REGISTRATION_NUMBER_REGEX),
      Joi.string().pattern(NI_CARRIER_REGISTRATION_NUMBER_REGEX)
    )
    .empty(null)
    .messages({
      'alternatives.match':
        '{{ #label }} must be in a valid England, SEPA, NRW or NI format'
    })
    .required(),
  reasonForNoRegistrationNumber: Joi.string().allow(null, ''),
  organisationName: Joi.string().required(),
  address: addressSchema,
  emailAddress: Joi.string().email(),
  phoneNumber: Joi.string(),
  vehicleRegistration: Joi.when('meansOfTransport', {
    is: Joi.string().required().valid('Road'),
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }).messages({
    'any.required': CARRIER_VEHICLE_REG_REQUIRED_FOR_ROAD,
    'any.unknown': CARRIER_VEHICLE_REG_ONLY_ALLOWED_FOR_ROAD
  }),
  meansOfTransport: Joi.string()
    .valid(...MEANS_OF_TRANSPORT)
    .required(),
  otherMeansOfTransport: Joi.string()
})
  .custom((obj, helpers) => {
    const { registrationNumber, reasonForNoRegistrationNumber } = obj
    const isEmpty = (val) =>
      val === null ||
      val === undefined ||
      val === '' ||
      (typeof val === 'string' && val.trim() === '')

    // If registration is null/empty AND reason is null/empty, fail
    if (isEmpty(registrationNumber) && isEmpty(reasonForNoRegistrationNumber)) {
      return helpers.error('carrier.registrationOrReasonRequired')
    }

    // Reason should only be provided when registration number is null/empty
    if (
      !isEmpty(registrationNumber) &&
      !isEmpty(reasonForNoRegistrationNumber)
    ) {
      return helpers.error('carrier.reasonOnlyForNull')
    }

    return obj
  })
  .label('Carrier')
  .messages({
    'carrier.registrationRequired': CARRIER_REGISTRATION_REQUIRED,
    'carrier.registrationOrReasonRequired':
      CARRIER_REGISTRATION_OR_REASON_REQUIRED,
    'carrier.reasonOnlyForNull': CARRIER_REASON_ONLY_FOR_NULL
  })

const receiverAddressSchema = addressSchema.keys({
  fullAddress: Joi.string().required(),
  postcode: Joi.string()
    .pattern(UK_POSTCODE_REGEX)
    .message('Postcode must be in valid UK format')
    .required()
})

const receiverSchema = Joi.object({
  organisationName: Joi.string().required(),
  emailAddress: Joi.string().email(),
  phoneNumber: Joi.string(),
  authorisationNumbers: Joi.array().items(Joi.string()).min(1).required(),
  regulatoryPositionStatements: Joi.array().items(
    Joi.number().integer().positive()
  )
}).label('Receiver')

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
  organisationApiId: Joi.string().required().uuid(),
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
  specialHandlingRequirements: Joi.string().max(LONG_STRING_MAX_LENGTH),
  wasteItems: Joi.array().items(wasteItemsSchema),
  carrier: carrierSchema,
  brokerOrDealer: brokerOrDealerSchema,
  receiver: receiverSchema.required(),
  receipt: receiptSchema.required()
}).label('Movement')
