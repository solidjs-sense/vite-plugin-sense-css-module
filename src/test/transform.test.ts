import { join } from "path";
import { describe, expect, it } from "vitest";
import { resolveCssModuleClassNames } from "../transform";

describe('transform', async () => {
  const titleClassTo = '_ctn_11g4q_1'

  it('single class', async () => {
    const getTex = (name: string) => {
      return `import './transform.module.scss';
export function Component() {
    return <div class="${name}"></div>;
}
`
    }
    const tsx = getTex('ctn')
    const toTsx = getTex(titleClassTo)
    const code = await resolveCssModuleClassNames(tsx, join(__dirname,  'transform.component.tsx'), 'ES2015', {})
    expect(code).eq(toTsx)
  })

  it('custom class attribute', async () => {
    const getTex = (name: string) => {
      return `import './transform.module.scss';
export function Component() {
    return <div classActive="${name}"></div>;
}
`
    }
    const tsx = getTex('ctn')
    const toTsx = getTex(titleClassTo)
    const code = await resolveCssModuleClassNames(tsx, join(__dirname,  'transform.component.tsx'), 'ES2015', {}, {
      classAttributeRegex: /class(Name|List|Active)/
    })
    expect(code).eq(toTsx)
  })

  it('no css module', async () => {
    const getTex = (name: string) => {
      return `
export function Component() {
    return <div class="${name}"></div>;
}
`
    }
    const tsx = getTex('ctn')
    const code = await resolveCssModuleClassNames(tsx, join(__dirname,  'transform.component.tsx'), 'ES2015', {})
    expect(code).eq(tsx)
  })

  it('options camelCaseOnly', async () => {
    const getTex = (name: string) => {
      return `import './transform.module.scss';
export function Component() {
    return <div class="${name}"></div>;
}
`
    }
    const tsx = getTex('ctn')
    const toTsx = getTex(titleClassTo)
    const code = await resolveCssModuleClassNames(tsx, join(__dirname,  'transform.component.tsx'), 'ES2015', {
      localsConvention: 'camelCaseOnly'
    })
    expect(code).eq(toTsx)
  })

  it('options dashesOnly', async () => {
    const getTex = (name: string) => {
      return `import './transform.module.scss';
export function Component() {
    return <div class="${name}"></div>;
}
`
    }
    const tsx = getTex('ctn')
    const toTsx = getTex(titleClassTo)
    const code = await resolveCssModuleClassNames(tsx, join(__dirname,  'transform.component.tsx'), 'ES2015', {
      localsConvention: 'dashesOnly'
    })
    expect(code).eq(toTsx)
  })

  it('options dashes', async () => {
    const getTex = (name: string) => {
      return `import './transform.module.scss';
export function Component() {
    return <div class="${name}"></div>;
}
`
    }
    const tsx = getTex('ctn')
    const toTsx = getTex(titleClassTo)
    const code = await resolveCssModuleClassNames(tsx, join(__dirname,  'transform.component.tsx'), 'ES2015', {
      localsConvention: 'dashes'
    })
    expect(code).eq(toTsx)
  })

  it('multiple class', async () => {
    const getTex = (name: string) => {
      return `import './transform.module.scss';
export function Component() {
    return <div class="${name} ${name}"></div>;
}
`
    }
    const tsx = getTex('ctn')
    const toTsx = getTex(titleClassTo)
    const code = await resolveCssModuleClassNames(tsx, join(__dirname,  'transform.component.tsx'), 'ES2015', {})
    expect(code).eq(toTsx)
  })

  it('condition expression', async () => {
    const getTex = (name: string) => {
      return `import './transform.module.scss';
export function Component() {
    return <div class={a + b ? "start ${name} end" : "start ${name} end"}></div>;
}
`
    }
    const tsx = getTex('ctn')
    const toTsx = getTex(titleClassTo)
    const code = await resolveCssModuleClassNames(tsx, join(__dirname,  'transform.component.tsx'), 'ES2015', {})
    expect(code).eq(toTsx)
  })

  it('template expression', async () => {
    const getTex = (name: string) => {
      return `import './transform.module.scss';
export function Component() {
    return <div class={\`${name} ${name}\`}></div>;
}
`
    }
    const tsx = getTex('ctn')
    const toTsx = getTex(titleClassTo)
    const code = await resolveCssModuleClassNames(tsx, join(__dirname,  'transform.component.tsx'), 'ES2015', {})
    expect(code).eq(toTsx)
  })

  it('template expression', async () => {
    const getTex = (name: string) => {
      return `import './transform.module.scss';
export function Component() {
    return <div class={\`${name} \${"${name}"} ${name} \${a + b} ${name}\`}></div>;
}
`
    }
    const tsx = getTex('ctn')
    const toTsx = getTex(titleClassTo)
    const code = await resolveCssModuleClassNames(tsx, join(__dirname,  'transform.component.tsx'), 'ES2015', {})
    expect(code).eq(toTsx)
  })

  it('template expression include condition expression', async () => {
    const getTex = (name: string) => {
      return `import './transform.module.scss';
export function Component() {
    return <div class={\`${name} \${a + b ? "start ${name} end" : "start ${name} end"} ${name}\`}></div>;
}
`
    }
    const tsx = getTex('ctn')
    const toTsx = getTex(titleClassTo)
    const code = await resolveCssModuleClassNames(tsx, join(__dirname,  'transform.component.tsx'), 'ES2015', {})
    expect(code).eq(toTsx)
  })

  it('classList with object and string', async () => {
    const getTex = (name: string) => {
      return `import './transform.module.scss';
export function Component() {
    return <div classList={{ "${name}": a }}></div>;
}
`
    }
    const tsx = getTex('ctn')
    const toTsx = getTex(titleClassTo)
    const code = await resolveCssModuleClassNames(tsx, join(__dirname,  'transform.component.tsx'), 'ES2015', {})
    expect(code).eq(toTsx)
  })

  it('classList with object and identifier', async () => {
    const getTex = (name: string) => {
      return `import './transform.module.scss';
export function Component() {
    return <div classList={{ ${name}: a }}></div>;
}
`
    }
    const tsx = getTex('ctn')
    const toTsx = getTex(`"${titleClassTo}"`)
    const code = await resolveCssModuleClassNames(tsx, join(__dirname,  'transform.component.tsx'), 'ES2015', {})
    expect(code).eq(toTsx)
  })

  it('classList with spread object', async () => {
    const getTex = (name: string) => {
      return `import './transform.module.scss';
export function Component() {
    return <div classList={{ ${name}: b, ...{ ${name}: a } }}></div>;
}
`
    }
    const tsx = getTex('ctn')
    const toTsx = getTex(`"${titleClassTo}"`)
    const code = await resolveCssModuleClassNames(tsx, join(__dirname,  'transform.component.tsx'), 'ES2015', {})
    expect(code).eq(toTsx)
  })

  it('classList with spread object', async () => {
    const getTex = (name: string) => {
      return `import './transform.module.scss';
export function Component() {
    return <div classList={{ [styles.ctn]: b, ...{ "${name}": a } }}></div>;
}
`
    }
    const tsx = getTex('ctn')
    const toTsx = getTex(titleClassTo)
    const code = await resolveCssModuleClassNames(tsx, join(__dirname,  'transform.component.tsx'), 'ES2015', {})
    expect(code).eq(toTsx)
  })

  it('classList with short assignment expression', async () => {
    const getTex = (name: string) => {
      return `import './transform.module.scss';
export function Component() {
    return <div classList={{ ctn, ...{ "${name}": a } }}></div>;
}
`
    }
    const tsx = getTex('ctn')
    const toTsx = getTex(titleClassTo)
    const code = await resolveCssModuleClassNames(tsx, join(__dirname,  'transform.component.tsx'), 'ES2015', {})
    expect(code).eq(toTsx)
  })
})
