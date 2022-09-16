import { CSSModulesOptions, Plugin } from 'vite';
import { getNameOfDeclaration, ScriptTarget } from 'typescript';
import { inlineCssModuleFileRE, jsxPath } from './constant';
import { resolveCssModuleClassNames } from './transform';
import { SenseCssModuleOptions } from './type';
import { readFileSync, statSync } from 'fs';
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
  let cssFileCache: Map<string, { mtimeMs: number, content: string}>

  return {
    enforce: 'pre',
    name: 'sense-css-module',
    buildStart() {
      cssFileCache = new Map()
    },
    config(config) {
      let gName: CSSModulesOptions['generateScopedName']
      if (config.css?.modules) {
        gName = config.css.modules.generateScopedName
      }
      if ((gName === undefined || gName === null || typeof gName === 'function')) {
        return {
          css: {
            modules: {
              generateScopedName(name, filename) {
                const filePath = filename.split('?')[0]
                const mtimeMs = statSync(filePath).mtimeMs
                const cache = cssFileCache.get(filePath)
                let css = cache?.content
                if (!css || mtimeMs !== cache?.mtimeMs) {
                  css = readFileSync(filePath, { encoding: 'utf-8' })
                  cssFileCache.set(filePath, {
                    mtimeMs,
                    content: css
                  })
                }
                return (typeof gName === 'function' ? gName : generateScopedName)(name, filename, css)
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
      const filePath = id.split('?')[0]
      if (cssModulesOptions && jsxPath.test(filePath) && inlineCssModuleFileRE.test(code)) {
        return resolveCssModuleClassNames(code, filePath, target, cssModulesOptions, option)
      }
    },
  }
}
