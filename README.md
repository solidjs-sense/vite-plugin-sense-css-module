# vite-plugin-sense-css-module

Make use css module more sense.

## Editor autocomplete support

- [VS Code](https://github.com/solidjs-sense/vscode-sense-css-module)
- [(Neo)vim/coc.nvim](https://github.com/solidjs-sense/coc-sense-css-module)
- [LSP](https://github.com/solidjs-sense/sense-css-module-server)

## Installation

**npm**

```
npm install --save-dev vite-plugin-sense-css-module
```

**yarn**

```
yarn add -D vite-plugin-sense-css-module
```

## Usage

``` javascript
import { defineConfig } from 'vite';
import senseCssModule from 'vite-plugin-sense-css-module';

export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
      generateScopedName: (name, filename) => {
        const res = `SUIS_${basename(filename).replace(/\.module\.scss(.*)$/, '')}_${name}`;
        return res;
      },
    },
  },
  plugins: [
    ...
    senseCssModule({ classAttributeRegex: /(class(Name|List)?|activeClass)/ }),
    ...
  ],
  build: {
    target: 'esnext',
  },
}
```

**Options**:

Default `classAttributeRegex`: `/class(Name|List)?/`

``` javascript
  senseCssModule({ classAttributeRegex?: RegExp }),
```

### What does it do?

Normal when using css module.

``` tsx
import { Link, Outlet } from 'solidjs-sense-router';
import { t } from '../util';
import styles from './usage.module.scss';

export default () => {
  return (
    <>
      <div class={styles.title}>{t('usage-example')}</div>
      <div class={styles.ctn}>
        <div class={styles.nav}>
          <Link href="/usage/dialog" class={styles.item} activeClass={styles.active}>
            <span>Dialog</span>
          </Link>
          <Link href="/usage/color-picker" class={styles.item} activeClass={styles.active}>
            <span>Color Picker</span>
          </Link>
        </div>
        <div class={styles.content}>
          <Outlet />
        </div>
      </div>
    </>
  );
};
```

When using this plugin.

``` tsx
import { Link, Outlet } from 'solidjs-sense-router';
import { t } from '../util';
import './usage.module.scss';

export default () => {
  return (
    <>
      <div class="title">{t('usage-example')}</div>
      <div class="ctn">
        <div class="nav">
          <Link href="/usage/dialog" class="item" activeClass="active">
            <span>Dialog</span>
          </Link>
          <Link href="/usage/color-picker" class="item" activeClass="active">
            <span>Color Picker</span>
          </Link>
        </div>
        <div class="content">
          <Outlet />
        </div>
      </div>
    </>
  );
};
```

It will translate to

``` tsx
import { Link, Outlet } from 'solidjs-sense-router';
import { t } from '../util';
import './usage.module.scss';

export default () => {
  return (
    <>
      <div class="SUIS_usage_title">{t('usage-example')}</div>
      <div class="SUIS_usage_ctn">
        <div class="SUIS_usage_nav">
          <Link href="/usage/dialog" class="SUIS_usage_item" activeClass="SUIS_usage_active">
            <span>Dialog</span>
          </Link>
          <Link href="/usage/color-picker" class="SUIS_usage_item" activeClass="SUIS_usage_active">
            <span>Color Picker</span>
          </Link>
        </div>
        <div class="SUIS_usage_content">
          <Outlet />
        </div>
      </div>
    </>
  );
};
```
