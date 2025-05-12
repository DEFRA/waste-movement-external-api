export default {
  mongodbMemoryServerOptions: {
    binary: {
      skipMD5: true
    },
    autoStart: false,
    instance: {
      dbName: 'waste-movement-backend'
    }
  },
  mongoURLEnvName: 'MONGO_URI',
  useSharedDBForAllJestWorkers: false
}
