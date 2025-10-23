/**
 * Test script to verify consolidated logging for validation errors
 *
 * This script sends an invalid request to the POST /movements/receive endpoint
 * to trigger validation errors and verify that they are logged on a single line.
 *
 * Usage:
 * 1. Start the server: npm run dev
 * 2. In another terminal, run: node test-logging.js
 */

async function testValidationLogging() {
  const API_URL = 'http://localhost:3001/movements/receive'

  // Invalid payload - missing required fields to trigger validation errors
  const invalidPayload = {
    // Missing: organisationApiId, dateTimeReceived, receiver, receipt
    wasteItems: [
      {
        // Invalid: missing required fields in waste items
        description: 'Test waste'
      }
    ],
    specialHandlingRequirements: 'a'.repeat(5001) // Too long - should trigger validation error
  }

  console.log('🧪 Testing validation error logging...\n')
  console.log('Sending invalid request to:', API_URL)
  console.log(
    'Expected: Validation errors should be consolidated into single log entries\n'
  )

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cdp-request-id': 'test-request-123' // Custom trace ID for easy identification
      },
      body: JSON.stringify(invalidPayload)
    })

    const data = await response.json()

    console.log('Response status:', response.status)
    console.log('Response body:', JSON.stringify(data, null, 2))

    if (response.status === 400) {
      console.log('\n✅ Received expected 400 validation error')
      console.log('\n📝 Check the server logs above - you should see:')
      console.log(
        '   1. A single "Processing receipt movement" log (with auth + tracking ID)'
      )
      console.log(
        '   2. A single "Validation failed" log (with all validation errors)'
      )
      console.log('   3. A response log from hapi-pino')
      console.log('\n   All logs should include trace.id: "test-request-123"')
    } else {
      console.log('\n⚠️  Unexpected response status:', response.status)
    }
  } catch (error) {
    console.error('❌ Error making request:', error.message)
    console.log('\n💡 Make sure the server is running with: npm run dev')
  }
}

// Run the test
testValidationLogging()
