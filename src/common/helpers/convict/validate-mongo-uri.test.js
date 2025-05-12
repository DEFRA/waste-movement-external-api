import { convictValidateMongoUri } from './validate-mongo-uri.js'

describe('#convictValidateMongoUri', () => {
  test('With correct mongo-uri, Should not throw', () => {
    expect(() =>
      convictValidateMongoUri.validate('mongodb://127.0.0.1:27017')
    ).not.toThrow()
  })

  test('With invalid mongo-uri, Should throw', () => {
    expect(() =>
      convictValidateMongoUri.validate('incorrect-mongo-uri')
    ).toThrow()
  })
})
