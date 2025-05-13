import HapiSwagger from 'hapi-swagger'
import { config } from '../config.js'

const swaggerOptions = {
  info: {
    title: 'Digital Waste Tracking Receipt API',
    version: '1.0',
    description: 'API for managing waste movements and receipts'
  },
  documentationPath: '/documentation',
  swaggerUIPath: '/swaggerui',
  jsonPath: '/swagger.json',
  schemes: ['http'],
  host: `${config.get('host')}:${config.get('port')}`,
  grouping: 'tags',
  tags: [
    {
      name: 'movements',
      description: 'Waste movement operations'
    }
  ],
  debug: true,
  expanded: 'full',
  sortTags: 'alpha',
  sortEndpoints: 'alpha',
  swaggerUI: true,
  documentationPage: true,
  documentationRouteTags: ['movements'],
  deReference: true,
  pathPrefixSize: 2,
  basePath: '/',
  pathReplacements: [],
  routeTag: 'movements'
}

export const swagger = {
  plugin: HapiSwagger,
  options: swaggerOptions
}
