import { receiveMovementRequestSchema } from './receipt.js'
import {
  generateAllValidationWarnings,
  VALIDATION_ERROR_TYPES
} from '../common/helpers/validation-warnings.js'
import { createMovementRequest } from '../test/utils/createMovementRequest.js'

// Helper to build a base valid payload
const buildBasePayload = () => ({
  ...createMovementRequest(),
  wasteItems: [
    {
      ewcCodes: ['010101'], // non-hazardous by default
      wasteDescription: 'Test waste',
      physicalForm: 'Solid',
      weight: {
        metric: 'Tonnes',
        amount: 1,
        isEstimate: false
      }
    }
  ]
})

describe('Hazardous Waste Consignment Note Code rules', () => {
  it.each([
    ['code is null and reason is not provided', null, undefined],
    ['code is null and reason is null', null, null]
  ])(
    'Require consignment note code for hazardous waste when reason is not provided - %s',
    (text, code, reason) => {
      const payload = buildBasePayload()
      // Use a hazardous EWC code (from constants list)
      payload.wasteItems[0].ewcCodes = ['030104']
      // Leave consignment code and reason blank
      payload.hazardousWasteConsignmentCode = code
      payload.reasonForNoConsignmentCode = reason

      // Schema should accept (business rule handled via warnings)
      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.message).toBe(
        'hazardousWasteConsignmentCode is required when hazardous EWC codes are present'
      )
    }
  )

  it.each([
    ['code is null and reason is not provided', null, undefined],
    ['code is null and reason is null', null, null]
  ])(
    'Hazardous EWC Code included in Mirror Code (one hazardous among two) - %s',
    (text, code, reason) => {
      const payload = buildBasePayload()
      // Provide two EWC codes: one non-hazardous and one hazardous
      payload.wasteItems[0].ewcCodes = ['010101', '030104']
      payload.hazardousWasteConsignmentCode = code
      payload.reasonForNoConsignmentCode = reason

      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.message).toBe(
        'hazardousWasteConsignmentCode is required when hazardous EWC codes are present'
      )
    }
  )

  it.each([
    ['code is null and reason is not provided', null, undefined],
    ['code is null and reason is empty', null, ''],
    ['code is null and reason is null', null, null]
  ])(
    'Do not require consignment number nor reason for non-hazardous waste - %s',
    (text, code, reason) => {
      const payload = buildBasePayload()
      // Keep non-hazardous EWC
      payload.hazardousWasteConsignmentCode = code
      payload.reasonForNoConsignmentCode = reason

      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeUndefined()
    }
  )

  it('Consignment Note Code supplied in incorrect format causes rejection (hazardous context)', () => {
    const payload = buildBasePayload()
    payload.wasteItems[0].ewcCodes = ['030104'] // hazardous
    // Invalid format
    payload.hazardousWasteConsignmentCode = 'BADFORMAT'

    const { error } = receiveMovementRequestSchema.validate(payload)
    expect(error).toBeDefined()
    expect(error.message).toContain(
      'consignment note code must be in one of the valid formats'
    )
  })

  it('Prompt reason if consignment number blank - reason must be from allowed list when provided', () => {
    const payload = buildBasePayload()
    payload.wasteItems[0].ewcCodes = ['030104'] // hazardous
    payload.hazardousWasteConsignmentCode = ''
    // Provide an invalid reason value (not in allowed list)
    payload.reasonForNoConsignmentCode = 'Some invalid reason'

    const { error } = receiveMovementRequestSchema.validate(payload)
    expect(error).toBeDefined()
    expect(error.message).toContain(
      'Reason for no consignment note code must be one of: Non-Hazardous Waste Transfer | Carrier did not provide documentation | Local Authority Receipt'
    )
  })

  it('Reason is left blank when required - generates a warning (not a rejection)', () => {
    const payload = buildBasePayload()
    payload.wasteItems[0].ewcCodes = ['030104'] // hazardous
    payload.hazardousWasteConsignmentCode = '' // blank
    payload.reasonForNoConsignmentCode = '' // blank

    const { error } = receiveMovementRequestSchema.validate(payload)
    expect(error).toBeUndefined()

    const warnings = generateAllValidationWarnings(payload)
    expect(warnings).toContainEqual({
      key: 'receipt.reasonForNoConsignmentCode',
      errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
      message:
        'Reason for no Consignment Note Code is required when hazardous EWC codes are present'
    })
  })
})
