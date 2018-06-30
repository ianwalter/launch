const { getShortName } = require('../')

test('getShortName returns the correct name', () => {
  expect(getShortName({ name: 'prescott' })).toEqual('prescott')
})

test('getShortName returns the correct name when namespaced', () => {
  expect(getShortName({ name: '@ianwalter/relay' })).toEqual('relay')
})
