import { CSSModulesOptions, Plugin } from 'vite';
import { ScriptTarget } from 'typescript';
import { inlineCssModuleFileRE } from './constant';
import { resolveCssModuleClassNames } from './transform';

type BuildTarget = keyof typeof ScriptTarget

function isTarget(target: any): target is BuildTarget {
  if (ScriptTarget[target]) {
    return true
  }
  return false
};

export default (): Plugin =>  {
  let target: BuildTarget
  let cssModulesOptions: CSSModulesOptions | undefined

  return {
    enforce: 'pre',
    name: 'sense-css-module',
    configResolved(cf) {
      cssModulesOptions = cf.css?.modules ? cf.css.modules : {}
      target = isTarget(cf.build.target) ? cf.build.target : 'ES2015'
    },
    transform(code, id) {
      if (cssModulesOptions && id.endsWith('.tsx') && inlineCssModuleFileRE.test(code)) {
        return resolveCssModuleClassNames(code, id, target, cssModulesOptions)
      }
    },
  }
}
