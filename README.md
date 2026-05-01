# Qilin

Qilin is the **shared front-end component library** for NXT Grid. It provides Vue 3 components, composables, styles, and API integration layers that are used across all NXT Grid front-end applications.

## What's Inside

```
shared/
├── components/       # Reusable Vue components (maps, modals, dashboard, forms, …)
├── composables/      # Vue composables (MQTT, Flutterwave, realtime, …)
├── libraries/        # API repos, constants, utilities, format maps, plugins
└── styles/           # Global SCSS variables, mixins, and base styles
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Vue 3](https://vuejs.org/) |
| Build tool | [Vite 6](https://vitejs.dev/) |
| State management | [Pinia](https://pinia.vuejs.org/) |
| Mapping | [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) |
| Geo utilities | [Turf.js](https://turfjs.org/) |
| Real-time | [MQTT (Eclipse Paho)](https://eclipse.dev/paho/index.php?page=clients/js/index.php) |
| Payments | [Flutterwave](https://flutterwave.com/) |
| Backend | [Supabase](https://supabase.com/) |
| Component explorer | [Storybook](https://storybook.js.org/) |

## Using Qilin in a Consumer App

### Local development

Clone Qilin as a **sibling** of the consuming app and make sure the app's `jsconfig.json` points to `../qilin/shared`:

```sh
git clone https://github.com/nxtgrid/qilin.git ../qilin
```

The alias is already set up in all NXT Grid apps:

```json
{
  "compilerOptions": {
    "paths": {
      "@nxt/*": ["../qilin/shared/*"]
    }
  }
}
```

### Installing as a git dependency (CI / production)

Add Qilin as an npm dependency pointing to this public repository:

```sh
npm install nxt-shared@git+https://github.com/nxtgrid/qilin.git
```

Or in `package.json`:

```json
"nxt-shared": "git+https://github.com/nxtgrid/qilin.git"
```

## Prerequisites

- [Node.js](https://nodejs.org/) — use the version in `.nvmrc` (managed via [NVM](https://github.com/nvm-sh/nvm))

## Getting Started (Storybook)

```sh
nvm use
npm install
npm run storybook
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run storybook` | Start the Storybook dev server |
| `npm run build-storybook` | Build a static Storybook |
| `npm run lint` | Lint all JS and Vue files |
| `npm run lint:fix` | Lint and auto-fix |

## VueUse Patch

Qilin applies a patch to `@vueuse/core` to fix the `onClickOutside` composable. If you use this in a consuming app, copy the `patches/` folder to the consuming app's root and add the following to its `package.json`:

```json
"devDependencies": {
  "patch-package": "^8.0.0"
},
"scripts": {
  "postinstall": "patch-package"
}
```

## Code Quality

All commits are linted via [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/okonet/lint-staged). If you encounter a "command not found" error on commit, see the [Husky troubleshooting guide](https://typicode.github.io/husky/troubleshooting.html#command-not-found).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Authors & Contributors

**Bobby Bol** ([studio.innua@gmail.com](mailto:studio.innua@gmail.com)) — author & maintainer

See [AUTHORS.md](./AUTHORS.md) for the full list of authors and [CONTRIBUTORS.md](./CONTRIBUTORS.md) for all contributors.

## License

This project is licensed under the [Mozilla Public License 2.0](https://www.mozilla.org/MPL/2.0/). See [LICENSE](./LICENSE) for the full text.

## Third-party licenses

Source in this repository is under MPL-2.0. **npm dependencies** are under their own licenses. If you ship a bundled app that includes Qilin and its dependency tree, you are responsible for meeting those licenses’ requirements.

Run a full audit locally after `npm install`, for example:

```sh
npx license-checker --summary
```

**Notable dependencies to review:**

| Package | SPDX (per registry / `license-checker`) | Note |
|---------|------------------------------------------|------|
| [mapbox-gl-style-switcher](https://www.npmjs.com/package/mapbox-gl-style-switcher) | GPL-3.0 | Strong copyleft; assess impact if this code is included in a build you distribute. |
| [paho-mqtt](https://www.npmjs.com/package/paho-mqtt) | EPL-1.0 | Weak copyleft on EPL-covered code; review if you modify or redistribute it. |

Other packages are mostly common permissive licenses (MIT, ISC, Apache-2.0, etc.); confirm the complete tree with tooling before you release or publish.
