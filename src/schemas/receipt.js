import Joi from 'joi'
import { MEANS_OF_TRANSPORT } from '../common/constants/means-of-transport.js'
import { wasteItemsSchema } from './waste.js'
import {
  hasHazardousEwcCodes,
  hazardousWasteConsignmentCodeSchema
} from './hazardous-waste-consignment.js'
import {
  ENGLAND_CARRIER_REGISTRATION_NUMBER_REGEX,
  IRL_POSTCODE_REGEX,
  NI_CARRIER_REGISTRATION_NUMBER_REGEX,
  NRU_CARRIER_REGISTRATION_NUMBER_REGEX,
  SEPA_CARRIER_REGISTRATION_NUMBER_REGEX,
  UK_POSTCODE_REGEX,
  ALL_SITE_AUTHORISATION_NUMBER_REGEXES
} from '../common/constants/regexes.js'
import {
  CARRIER_ERRORS,
  ADDRESS_ERRORS,
  CONSIGNMENT_ERRORS,
  AUTHORISATION_ERRORS
} from '../common/constants/validation-error-messages.js'
import { REASONS_FOR_NO_REGISTRATION_NUMBER } from '../common/constants/reasons-for-no-registration-number.js'
import { NO_CONSIGNMENT_REASONS } from '../common/constants/no-consignment-reasons.js'

const MIN_STRING_LENGTH = 1
const LONG_STRING_MAX_LENGTH = 5000

const addressSchema = Joi.object({
  fullAddress: Joi.string(),
  postcode: Joi.alternatives()
    .try(
      Joi.string().pattern(UK_POSTCODE_REGEX),
      Joi.string().pattern(IRL_POSTCODE_REGEX)
    )
    .messages({
      'alternatives.match': ADDRESS_ERRORS.POSTCODE_UK_IRELAND_FORMAT
    })
    .required()
})

const carrierOrBrokerDealerRegistrationNumber = Joi.alternatives()
  .try(
    Joi.string().pattern(ENGLAND_CARRIER_REGISTRATION_NUMBER_REGEX),
    Joi.string().pattern(SEPA_CARRIER_REGISTRATION_NUMBER_REGEX),
    Joi.string().pattern(NRU_CARRIER_REGISTRATION_NUMBER_REGEX),
    Joi.string().pattern(NI_CARRIER_REGISTRATION_NUMBER_REGEX)
  )
  .messages({
    'alternatives.match': CARRIER_ERRORS.REGISTRATION_NUMBER_FORMAT
  })

/**
 * Determines if a site authorisation number is valid
 * @param {String} authorisationNumber - The site authorisation number
 * @returns {Boolean} True if the site authorisation number is valid, otherwise false
 */
const isValidAuthorisationNumber = (authorisationNumber) => {
  const trimmedAuthorisationNumber = authorisationNumber.trim()
  return ALL_SITE_AUTHORISATION_NUMBER_REGEXES.some((regex) =>
    regex.test(trimmedAuthorisationNumber)
  )
}

const authorisationNumberSchema = Joi.string()
  .strict()
  .custom((value, helpers) => {
    if (isValidAuthorisationNumber(value)) {
      return value
    }
    return helpers.error('authorisation.invalid')
  })
  .messages({
    'authorisation.invalid': AUTHORISATION_ERRORS.INVALID
  })
  .required()

const carrierSchema = Joi.object({
  registrationNumber: carrierOrBrokerDealerRegistrationNumber
    .allow(null, '')
    .required(),
  reasonForNoRegistrationNumber: Joi.string()
    .valid(...REASONS_FOR_NO_REGISTRATION_NUMBER)
    .allow(null, '')
    .when('registrationNumber', {
      switch: [
        {
          is: null,
          then: Joi.required()
        },
        {
          is: '',
          then: Joi.required()
        }
      ],
      otherwise: Joi.forbidden()
    })
    .messages({
      'string.empty': CARRIER_ERRORS.REGISTRATION_OR_REASON_REQUIRED,
      'string.base': CARRIER_ERRORS.REGISTRATION_OR_REASON_REQUIRED,
      'any.unknown': CARRIER_ERRORS.REASON_ONLY_FOR_NULL,
      'any.only': `${CARRIER_ERRORS.REASON_FOR_NO_REGISTRATION_NUMBER_INVALID_PREFIX} ${REASONS_FOR_NO_REGISTRATION_NUMBER.join(', ')}`
    }),
  organisationName: Joi.string().required(),
  address: addressSchema,
  emailAddress: Joi.string().email(),
  phoneNumber: Joi.string(),
  vehicleRegistration: Joi.when('meansOfTransport', {
    is: Joi.string().required().valid('Road'),
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }).messages({
    'any.required': CARRIER_ERRORS.VEHICLE_REG_REQUIRED_FOR_ROAD,
    'any.unknown': CARRIER_ERRORS.VEHICLE_REG_ONLY_ALLOWED_FOR_ROAD
  }),
  meansOfTransport: Joi.string()
    .valid(...MEANS_OF_TRANSPORT)
    .required(),
  otherMeansOfTransport: Joi.string()
})

const receiverAddressSchema = addressSchema.keys({
  fullAddress: Joi.string().required(),
  postcode: Joi.string()
    .pattern(UK_POSTCODE_REGEX)
    .message(ADDRESS_ERRORS.POSTCODE_UK_FORMAT)
    .required()
})

const receiverSchema = Joi.object({
  siteName: Joi.string().required(),
  emailAddress: Joi.string().email(),
  phoneNumber: Joi.string(),
  authorisationNumber: authorisationNumberSchema,
  regulatoryPositionStatements: Joi.array().items(
    Joi.number().strict().integer().positive()
  )
})

const receiptSchema = Joi.object({
  address: receiverAddressSchema.required()
})

const brokerOrDealerSchema = Joi.object({
  organisationName: Joi.string().required(),
  address: addressSchema,
  registrationNumber: carrierOrBrokerDealerRegistrationNumber,
  phoneNumber: Joi.string(),
  emailAddress: Joi.string().email()
})

export const receiveMovementRequestSchema = Joi.object({
  apiCode: Joi.string().required().uuid(),
  dateTimeReceived: Joi.date().iso().required(),
  hazardousWasteConsignmentCode: hazardousWasteConsignmentCodeSchema,
  reasonForNoConsignmentCode: Joi.string().allow(null, ''),
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
})
  .custom((value, helpers) => {
    const hasHazardous = hasHazardousEwcCodes(value)

    // Only validate if there are hazardous codes and no consignment code provided
    if (hasHazardous && !value.hazardousWasteConsignmentCode) {
      if (!value.reasonForNoConsignmentCode) {
        return helpers.error('reasonForNoConsignmentCode.required', {
          local: { fieldName: 'reasonForNoConsignmentCode' }
        })
      }

      if (!NO_CONSIGNMENT_REASONS.includes(value.reasonForNoConsignmentCode)) {
        return helpers.error('reasonForNoConsignmentCode.only', {
          local: { fieldName: 'reasonForNoConsignmentCode' }
        })
      }
    }

    return value
  })
  .messages({
    'reasonForNoConsignmentCode.only': `${CONSIGNMENT_ERRORS.REASON_INVALID_PREFIX} ${NO_CONSIGNMENT_REASONS.join(', ')}`,
    'reasonForNoConsignmentCode.required': CONSIGNMENT_ERRORS.REASON_REQUIRED
  })
