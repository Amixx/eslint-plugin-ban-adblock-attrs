import { RuleTester } from 'eslint'
import rule from '../../src/rules/ban-adblock-attrs'

const tester = new RuleTester({
  parser: require.resolve('vue-eslint-parser'),
  parserOptions: { ecmaVersion: 2015 },
})

tester.run('ban-adblock-attrs', rule, {
  valid: [
    "const foo = 'bar'",
    'let AC_ad = 2',
    `
    <template>
      <div id='foo'></div>
    </template>
    `,
    `
    <template>
      <div class='bar'></div>
    </template>
    `,
  ],
  invalid: [
    {
      code: "const x = 'AC_ad'",
      errors: [{ messageId: 'forbiddenId' }],
    },
    {
      code: `<template>
                <div id='AC_ad'></div>
            </template>`,
      errors: [{ messageId: 'forbiddenId' }],
    },
    {
      code: "const x = 'AD-POST'",
      errors: [{ messageId: 'forbiddenClass' }],
    },
    {
      code: `<template>
                <div class='AD-POST'></div>
            </template>`,
      errors: [{ messageId: 'forbiddenClass' }],
    },
  ],
})
