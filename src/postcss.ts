import postcss from 'postcss';
// @ts-ignore
import postLess from 'postcss-less';
import postScss from 'postcss-scss';
import postModules from 'postcss-modules';
import { CSSModulesOptions } from 'vite';
import { extname } from 'path';
import { readFile } from 'fs/promises';

const syntaxMap: Record<string, typeof postLess | typeof postScss> = {
  'less': postLess,
  'scss': postScss
}

const getSyntax = (id: string) => {
  return syntaxMap[extname(id).slice(1)]
}

export const getCssModulesNames = async (
  id: string,
  option: Omit<CSSModulesOptions, 'localsConvention'> | {
    localsConvention?: 'camelCase' | 'camelCaseOnly' | 'dashes' | 'dashesOnly' | undefined;
  }
): Promise<Record<string, string>> => {
  let json: Record<string, string> = {};
  const code = await readFile(id, { encoding: 'utf-8' })
  const syntax = getSyntax(id)
  await postcss([
    postModules({
      getJSON(_cssFilename, outputJson) {
        json = outputJson
      },
      ...option
    })
  ]).process(code, {
    map: false,
    from: id,
    syntax
  })
  return json
}
