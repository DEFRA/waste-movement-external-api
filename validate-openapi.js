import SwaggerParser from '@apidevtools/swagger-parser'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function validateOpenApi() {
  try {
    console.log('Validating OpenAPI specifications...')

    // Validate Receipt API.yml
    console.log('Validating Receipt API.yml...')
    const receiptApiPath = path.join(__dirname, 'docs', 'Receipt API.yml')
    await SwaggerParser.validate(receiptApiPath)
    console.log('Receipt API.yml is valid')

    // Validate openapi.yml
    console.log('Validating openapi.yml...')
    const openapiPath = path.join(__dirname, 'docs', 'openapi.yml')
    await SwaggerParser.validate(openapiPath)
    console.log('openapi.yml is valid')

    console.log('All OpenAPI specifications are valid')
    process.exit(0)
  } catch (error) {
    console.error('Error validating OpenAPI spec:', error)
    process.exit(1)
  }
}

validateOpenApi()
