import HapiSwagger from 'hapi-swagger'
// import { config } from '../config.js'

const swaggerOptions = {
  info: {
    title: 'Digital Waste Tracking Receipt API',
    version: '1.0',
    description: 'API for managing waste movements and receipts'
  },
  documentationPath: '/',
  swaggerUIPath: '/swaggerui',
  jsonPath: '/swagger.json',
  // schemes: ['https'],
  // // host:
  // //   config.get('cdpEnvironment') === 'local'
  // //     ? `${config.get('host')}:${config.get('port')}`
  // //     : `waste-movement-external-api.${config.get('cdpEnvironment')}.cdp-int.defra.cloud`,
  // grouping: 'tags',
  // tags: [
  //   {
  //     name: 'movements',
  //     description: 'Waste movement operations'
  //   }
  // ],
  // debug: true,
  // // expanded: 'full',
  // sortTags: 'alpha',
  // sortEndpoints: 'alpha',
  // swaggerUI: true,
  // documentationPage: true,
  // deReference: true,
  // pathPrefixSize: 2,
  // basePath: '/',
  // pathReplacements: [],
  routeTag: 'movements',
  OAS: 'v3.0'
}

export const swagger = {
  plugin: HapiSwagger,
  options: swaggerOptions
}
