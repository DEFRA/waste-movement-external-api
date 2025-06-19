import { createServer } from './src/server.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import SwaggerParser from '@apidevtools/swagger-parser'
import yaml from 'js-yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function generateOpenApi() {
  try {
    console.log('Creating server...')
    const server = await createServer()

    console.log('Starting server...')
    await server.start()

    console.log('Fetching OpenAPI spec...')
    const response = await fetch(
      `http://${server.info.host}:${server.info.port}/swagger.json`
    )
    const openApiSpec = await response.json()

    console.log('Validating OpenAPI spec...')
    await SwaggerParser.validate(openApiSpec)

    console.log('Writing OpenAPI spec to file...')
    const outputPath = path.join(__dirname, 'docs', 'openapi.json')
    fs.writeFileSync(outputPath, JSON.stringify(openApiSpec, null, 2))

    console.log('Converting JSON to YAML...')
    const yamlOutputPath = path.join(__dirname, 'docs', 'openapi.yml')
    const yamlContent = yaml.dump(openApiSpec, { lineWidth: -1 })
    fs.writeFileSync(yamlOutputPath, yamlContent)

    console.log(
      `OpenAPI spec generated successfully at ${outputPath} and ${yamlOutputPath}`
    )

    console.log('Stopping server...')
    await server.stop()

    console.log('Clean up')
    fs.rmSync(outputPath)

    process.exit(0)
  } catch (error) {
    console.error('Error generating OpenAPI spec:', error)
    process.exit(1)
  }
}

generateOpenApi()
