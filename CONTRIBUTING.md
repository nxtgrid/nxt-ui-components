# Contributing to NXT ui components

Thank you for your interest in contributing to NXT ui components. Because NXT ui components is a shared library consumed by multiple applications, changes here can affect all of them — please read this document carefully before submitting changes.

## Prerequisites

- [Node.js](https://nodejs.org/) via [NVM](https://github.com/nvm-sh/nvm) — run `nvm use` to activate the correct version

## Setting Up

```sh
git clone https://github.com/nxtgrid/nxt-ui-components.git
cd nxt-ui-components
nvm use
npm install
npm run storybook   # explore and develop components in isolation
```

## Scope of Changes

NXT ui components provides components, composables, and libraries shared across all NXT front-end apps. When contributing:

- **Components** live in `shared/components/`. They should be generic enough to be useful across apps without hard-coded app-specific logic.
- **Composables** live in `shared/composables/`. Keep them focused on a single concern.
- **Libraries** (API repos, utilities, constants) live in `shared/libraries/`.
- **Styles** (SCSS variables, mixins, base rules) live in `shared/styles/`.

When adding a new env var dependency (e.g. `import.meta.env.VITE_*`), document it in the `.env.example` of every consuming application.

## Development Workflow

1. **Fork** the repository and create your branch from `main`.
2. **Name your branch** using the following convention:
   - `feat/short-description` — new feature or component
   - `fix/short-description` — bug fix
   - `chore/short-description` — tooling, dependencies, refactoring
   - `docs/short-description` — documentation only
3. **Make your changes** and ensure the linter passes (`npm run lint`).
4. **Test in a consuming app** by cloning it as a sibling and using the local path alias before submitting.
5. **Open a pull request** against `main` with a clear description of what changed and why — and which consuming apps are affected.

## Code Style

This project uses [ESLint](https://eslint.org/). All staged files are linted automatically on every commit via [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged).

- Run `npm run lint` to check for issues.
- Run `npm run lint:fix` to auto-fix where possible.
- The linter is configured with `--max-warnings=0` — no warnings are allowed in a commit.

## VueUse Patch

NXT ui components maintains a `patch-package` patch for `@vueuse/core`. If your change modifies how `@vueuse/core` is used, verify the patch in `patches/` is still correct and update it if needed.

## Commit Messages

Use clear, imperative present-tense messages:

```
feat: add NxtDateRangePicker component
fix: correct MQTT reconnect logic on token expiry
chore: upgrade @vueuse/core and refresh patch
docs: add usage example to NxtModal README section
```

## Reporting Issues

Please open an issue and include:
- A clear description of the problem or suggestion
- Which consuming app(s) are affected
- Steps to reproduce (for bugs)
- Your Node.js version and operating system

## Questions

For questions about the project, reach out to [studio.innua@gmail.com](mailto:studio.innua@gmail.com).
