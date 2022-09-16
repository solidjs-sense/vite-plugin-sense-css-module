import { describe, expect, it } from "vitest";
import { classAttributes, cssModuleImportString, inlineCssModuleFileRE, jsxPath } from "../constant";

describe('regex', () => {
  it('inlineCssModuleFileRE', () => {
    expect(
      inlineCssModuleFileRE.test(`
      import styles from './index.module.scss'
        `)
    ).eq(true)
  })

  it('cssModuleImportString', () => {
    expect(
      cssModuleImportString.test(`
      import styles from './index.module.scss'
        `)
    ).eq(true)
  })

  it('classAttributes', () => {
    expect(
      classAttributes.test('class')
    ).eq(true)

    expect(
      classAttributes.test('className')
    ).eq(true)

    expect(
      classAttributes.test('classList')
    ).eq(true)
  })

  it('jsxPath', () => {
    expect(
      jsxPath.test('/path/to/file.tsx')
    ).eq(true)

    expect(
      jsxPath.test('/path/to/file.jsx')
    ).eq(true)
  })
})
