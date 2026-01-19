import { receiveMovementRequestSchema } from './receipt.js'
import { createMovementRequest } from '../test/utils/createMovementRequest.js'
import { validContainerTypes } from '../common/constants/container-types.js'
import { NO_CONSIGNMENT_REASONS } from '../common/constants/no-consignment-reasons.js'

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
      },
      numberOfContainers: 1,
      typeOfContainers: validContainerTypes[0].code,
      containsPops: false,
      containsHazardous: false
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
        '"hazardousWasteConsignmentCode" is required when hazardous EWC codes are present'
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
        '"hazardousWasteConsignmentCode" is required when hazardous EWC codes are present'
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

  it('Allow both hazardousWasteConsignmentCode and reasonForNoConsignmentCode to be missing when non-hazardous EWC codes are present', () => {
    const payload = buildBasePayload()
    // Keep non-hazardous EWC
    payload.hazardousWasteConsignmentCode = undefined
    payload.reasonForNoConsignmentCode = undefined

    const { error } = receiveMovementRequestSchema.validate(payload)
    expect(error).toBeUndefined()
  })

  it('Require either hazardousWasteConsignmentCode or reasonForNoConsignmentCode to be present when hazardous EWC codes are present', () => {
    const payload = buildBasePayload()
    // Use a hazardous EWC code (from constants list)
    payload.wasteItems[0].ewcCodes = ['030104']
    payload.hazardousWasteConsignmentCode = undefined
    payload.reasonForNoConsignmentCode = undefined

    const { error } = receiveMovementRequestSchema.validate(payload)
    expect(error).toBeDefined()
    expect(error.message).toBe(
      '"reasonForNoConsignmentCode" is required when wasteItems[*].ewcCodes contains a hazardous code and hazardousWasteConsignmentCode is not provided'
    )
  })

  it('Consignment Note Code supplied in incorrect format causes rejection (hazardous context)', () => {
    const payload = buildBasePayload()
    payload.wasteItems[0].ewcCodes = ['030104'] // hazardous
    // Invalid format
    payload.hazardousWasteConsignmentCode = 'BADFORMAT'

    const { error } = receiveMovementRequestSchema.validate(payload)
    expect(error).toBeDefined()
    expect(error.message).toContain(
      '"hazardousWasteConsignmentCode" must be in one of the valid formats'
    )
  })

  it('Prompt reason if consignment number blank - reject if reason is not from the valid reason list', () => {
    const payload = buildBasePayload()
    payload.wasteItems[0].ewcCodes = ['030104'] // hazardous
    payload.hazardousWasteConsignmentCode = ''
    // Provide an invalid reason value (not in allowed list)
    payload.reasonForNoConsignmentCode = 'Some invalid reason'

    const { error } = receiveMovementRequestSchema.validate(payload)
    expect(error).toBeDefined()
    expect(error.message).toBe(
      `"reasonForNoConsignmentCode" must be one of: ${NO_CONSIGNMENT_REASONS.join(', ')}`
    )
  })

  it.each(NO_CONSIGNMENT_REASONS)(
    'Prompt reason if consignment number blank - accept if the reason is from the valid reason list: "%s"',
    (value) => {
      const payload = buildBasePayload()
      payload.wasteItems[0].ewcCodes = ['030104'] // hazardous
      payload.hazardousWasteConsignmentCode = ''
      // Provide a valid reason value (in allowed list)
      payload.reasonForNoConsignmentCode = value

      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeUndefined()
    }
  )

  it('Reason is left blank when required - generates a warning (not a rejection)', () => {
    const payload = buildBasePayload()
    payload.wasteItems[0].ewcCodes = ['030104'] // hazardous
    payload.hazardousWasteConsignmentCode = '' // blank
    payload.reasonForNoConsignmentCode = '' // blank

    const { error } = receiveMovementRequestSchema.validate(payload)
    expect(error).toBeDefined()
    expect(error.message).toContain(
      '"reasonForNoConsignmentCode" is required when wasteItems[*].ewcCodes contains a hazardous code and hazardousWasteConsignmentCode is not provided'
    )
  })

  // Regression test for bug fix: error.details should include correct field name for error path
  // This ensures the error handler can extract the field name from error.type
  it('Error type includes field name for reasonForNoConsignmentCode validation errors', () => {
    const payload = buildBasePayload()
    payload.wasteItems[0].ewcCodes = ['030104'] // hazardous
    // Omit both fields entirely (real-world scenario from bug report)
    delete payload.hazardousWasteConsignmentCode
    delete payload.reasonForNoConsignmentCode

    const { error } = receiveMovementRequestSchema.validate(payload)
    expect(error).toBeDefined()
    expect(error.details).toBeDefined()
    expect(error.details[0].type).toBe('BusinessRuleViolation.reasonRequired')
    // The error handler will extract 'BusinessRuleViolation' category from this type
  })

  it('Error type includes field name when invalid reason is provided', () => {
    const payload = buildBasePayload()
    payload.wasteItems[0].ewcCodes = ['030104'] // hazardous
    payload.hazardousWasteConsignmentCode = ''
    payload.reasonForNoConsignmentCode = 'Invalid reason not in allowed list'

    const { error } = receiveMovementRequestSchema.validate(payload)
    expect(error).toBeDefined()
    expect(error.details).toBeDefined()
    expect(error.details[0].type).toBe(
      'InvalidValue.reasonForNoConsignmentCode'
    )
    // The error handler will extract 'InvalidValue' category from this type
  })
})
