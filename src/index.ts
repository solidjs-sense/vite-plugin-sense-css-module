import { CSSModulesOptions, Plugin } from 'vite';
import { ScriptTarget } from 'typescript';
import { inlineCssModuleFileRE, jsxPath } from './constant';
import { resolveCssModuleClassNames } from './transform';
import { SenseCssModuleOptions } from './type';

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
    configResolved(cf) {
      cssModulesOptions = cf.css?.modules ? cf.css.modules : undefined
      target = isTarget(cf.build.target) ? cf.build.target : 'ES2015'
    },
    transform(code, id) {
      if (cssModulesOptions && jsxPath.test(id) && inlineCssModuleFileRE.test(code)) {
        return resolveCssModuleClassNames(code, id, target, cssModulesOptions, option)
      }
    },
  }
}
