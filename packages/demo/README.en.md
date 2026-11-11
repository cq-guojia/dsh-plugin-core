# dsh-plugin-core-demo

[简体中文](https://github.com/cq-guojia/dsh-plugin-core/blob/main/packages/demo/README.md) · **English**

The live preview plugin for [`dsh-plugin-core`](https://www.npmjs.com/package/dsh-plugin-core) — in the DSH sidebar it appears as **Blue Whale Component Library**.

Install it into a real DSH host and every base control and composed module renders with the host's own theme, tokens and data. There is no standalone web page: what you see is exactly what a plugin built on the library gets.

| | Package | Role |
|---|---|---|
| Library | `dsh-plugin-core` | Imported by plugins by subpath (`/ui`, `/design`, `/utils`, `/explorer`, `/session`) |
| Plugin | `dsh-plugin-core-demo` (this package) | Installed into DSH, renders the library in place |

## Install

Into a DSH host, with the DSH CLI:

```bash
dsh plugin --profile web add dsh-plugin-core-demo
```

Or the npm package itself:

```bash
npm install dsh-plugin-core-demo
```

After installing: open the plugin in the DSH plugin list — the plugin page carries a **Component preview** entry that opens the full-page preview. The sidebar entry position (first level / under "More" / off) is a plugin setting.

## What it shows

| Page | Content |
|---|---|
| Design foundation | The token palette, the dark-mode predicate, the style injector that puts both on the page |
| Actions | Button across all 18 appearance tiers and three heights, icon buttons, loading behaviour |
| Inputs | Input family, pickers, date and time, checkbox / switch / segmented, field hints |
| Display | Surface, cards, chips, section heads, marquee and flip text, tables with grouped headers and banner groups |
| Feedback | Modal, side sheet, promise-based confirm and alert, toasts, loaders and the global loading card |
| Layout and scrolling | The right-docked panel, toolbar behaviour, split groups and resizers |
| Navigation | Pagination on its own and built into a table |
| Workspace browsing | Docked file browser and every preview body, driven by real workspace files |
| Session preview | A read-only conversation dialog, including archive state and changed-file review |
| Utilities | Every helper with live input and output, including failure returns |
| Localization | Every built-in string in both Chinese and English |

Everything on these pages runs the same code the library ships — the preview plugin bundles core's build output into itself, so it always shows the current source, without publishing core first.

## Screenshots

Design tokens, the theme predicate and the injector:

![Design tokens and theme predicate](https://cdn.jsdelivr.net/gh/cq-guojia/dsh-plugin-core@main/assets/readme/01-tokens.png)

Buttons:

![Button tiers](https://cdn.jsdelivr.net/gh/cq-guojia/dsh-plugin-core@main/assets/readme/02-buttons.png)

Inputs:

![Inputs](https://cdn.jsdelivr.net/gh/cq-guojia/dsh-plugin-core@main/assets/readme/03-inputs.png)

Workspace browsing:

![Workspace explorer](https://cdn.jsdelivr.net/gh/cq-guojia/dsh-plugin-core@main/assets/readme/04-explorer.png)

Session preview:

![Session preview](https://cdn.jsdelivr.net/gh/cq-guojia/dsh-plugin-core@main/assets/readme/05-session.png)

## Compatibility

| Area | Requirement |
|---|---|
| Host | DSH web client (`client.platform: web`); the plugin registers into the sidebar, the main area and the plugin settings page |
| Node.js | `>= 22.5` |
| React / React DOM | `>= 18`, optional peers provided by the host |
| Official modules | `@deepseek-ai/*` packages are resolved by the host at runtime and never declared as dependencies |
| Styling | Runtime-injected; variables and classes use the fixed `--dshpc-*` / `dshpc-*` prefixes and never touch the host's own |

## Build from source

```bash
# in the repository root
pnpm run build        # build the library first (this package imports ../../dist/)
pnpm run build:demo   # build this package → dist/index.js (server shell) + dist/client.js (preview bundle)
```

`dist/` is committed alongside `src/`: the host does not run build scripts when installing a plugin.

## Release

Do not run `npm publish` in this directory. The library and this plugin share the same `vX.Y.Z` tag and are published by `.github/workflows/demo-publish.yml`; the two versions must match exactly (checked by `test/version-sync.test.mjs` and by CI).

```bash
# from the repository root — one tag publishes both packages
git tag vX.Y.Z && git push origin vX.Y.Z
```

## License

MIT
