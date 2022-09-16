import { CSSModulesOptions, Plugin } from 'vite';
import { ScriptTarget } from 'typescript';
import { inlineCssModuleFileRE, jsxPath } from './constant';
import { resolveCssModuleClassNames } from './transform';
import { SenseCssModuleOptions } from './type';
import { readFileSync } from 'fs';
import generateScopedName from './postcss';

type BuildTarget = keyof typeof ScriptTarget

function isTarget(target: any): target is BuildTarget {
  if (ScriptTarget[target]) {
    return true
  }
  return false
};

export default (option?: SenseCssModuleOptions): Plugin =>  {
  let target: BuildTarget
  let cssModulesOptions: CSSModulesOptions | undefined

  return {
    enforce: 'pre',
    name: 'sense-css-module',
    config(config) {
      if (config.css?.modules) {
        const gName = config.css.modules.generateScopedName
        if ((gName === undefined || gName === null || typeof gName === 'function')) {
          return {
            css: {
              modules: {
                generateScopedName(name, filename) {
                  const css = readFileSync(filename.split('?')[0], { encoding: 'utf-8' })
                  return (!gName ? generateScopedName : gName)(name, filename, css)
                }
              }
            }
          }
        }
      }
      return {}
    },
    configResolved(cf) {
      cssModulesOptions = cf.css?.modules !== false ? cf.css?.modules || {} : undefined
      target = isTarget(cf.build.target) ? cf.build.target : 'ES2015'
    },
    transform(code, id) {
      if (cssModulesOptions && jsxPath.test(id) && inlineCssModuleFileRE.test(code)) {
        return resolveCssModuleClassNames(code, id, target, cssModulesOptions, option)
      }
    },
  }
}
