# dsh-plugin-core

**English** · [简体中文](https://github.com/cq-guojia/dsh-plugin-core/blob/main/README.zh-CN.md)

The shared UI foundation for **DSH (DeepSeek Harness)** plugins: design tokens, a complete React control set, pure helpers, workspace file browsing, and read-only session preview — in one package, imported subpath by subpath.

It exists so that every plugin does not re-implement the same button, date picker, toast, file preview and conversation playback. Everything here is built on the host's own tokens and theme switch, so a plugin assembled from these parts looks native without any per-plugin skinning.

- **Follows the host, not the OS.** Light and dark come from the host's `body[data-ds-dark-theme]`; the 12 accent colors are the same ones the host uses.
- **Nothing here fetches data.** Values, options, workspaces and sessions arrive through props or a small injected interface — the components never reach into the host behind your back.
- **Runs everywhere the code runs.** The `design`, `ui` and `utils` entries carry zero `@deepseek-ai/*` imports, so they import cleanly in Node and in tests, not just inside the host.

## Screenshots

Real rendering inside a DSH host, dark theme:

Design tokens, the theme predicate and the style injector:

![Design tokens and theme predicate](https://cdn.jsdelivr.net/gh/cq-guojia/dsh-plugin-core@main/assets/readme/01-tokens.png)

Buttons — 18 appearance tiers, three heights, icons, automatic loading:

![Button tiers](https://cdn.jsdelivr.net/gh/cq-guojia/dsh-plugin-core@main/assets/readme/02-buttons.png)

Inputs — field hints, switches, checkboxes, segmented controls:

![Inputs](https://cdn.jsdelivr.net/gh/cq-guojia/dsh-plugin-core@main/assets/readme/03-inputs.png)

Workspace browsing — right-docked file browser and preview, not limited to workspaces:

![Workspace explorer](https://cdn.jsdelivr.net/gh/cq-guojia/dsh-plugin-core@main/assets/readme/04-explorer.png)

Session preview — a read-only dialog that mirrors the official conversation page:

![Session preview](https://cdn.jsdelivr.net/gh/cq-guojia/dsh-plugin-core@main/assets/readme/05-session.png)

All five screenshots are taken from [`dsh-plugin-core-demo`](#see-it-running-the-demo-plugin), the preview plugin shipped from the same repository.

## Install

```bash
pnpm add dsh-plugin-core
# or
npm install dsh-plugin-core
```

The published package already contains compiled `dist/` output and type declarations — the host never runs build scripts when installing a plugin. `react` / `react-dom` (`>= 18`) are **optional peers**: skip them if you only use `design` or `utils`.

## Quick start

```tsx
// your plugin's client entry
import { createStyleKit } from 'dsh-plugin-core/design'
import { Button, Input, setStyleKit, showToast } from 'dsh-plugin-core/ui'

const kit = createStyleKit({ id: 'dsh-task-reminder-ui' }) // 1. one kit per plugin
setStyleKit(kit)

export function TaskEditor(props: { name: string; setName: (v: string) => void }) {
  return (
    <div>
      <Input value={props.name} onChange={props.setName} placeholder="Task name" hint="Shown in the task list" />
      <Button variant="primary" onClick={async () => { await save(); showToast('Saved', { variant: 'success' }) }}>
        Save
      </Button>
    </div>
  )
}
```

Three things worth knowing on day one:

1. **Call `setStyleKit` once.** Styles reach the page as a runtime-injected `<style>` string, because a plugin's client bundle is a CJS closure and the kernel never loads `.css` assets. The `id` must be unique per plugin — several plugins share one page, and the id is what keeps their style tags from overwriting each other.
2. **Import by name.** Each control registers only its own CSS the first time it renders (idempotent), so an unused control costs nothing in your bundle. That only holds with named imports (`import { Button } from 'dsh-plugin-core/ui'`); `import * as core` or a CJS `require` disables tree-shaking and silently gives the saving back.
3. **Dialogs are promises.** `await confirmModal({...})` resolves to `true` / `false`, `alertModal({...})` resolves when dismissed. There are no callback-style variants.

## What's inside

| Import | What you get | React required |
|---|---|---|
| `dsh-plugin-core/design` | Token variables (light + dark), `createStyleKit` injector factory, dark-mode predicate | no |
| `dsh-plugin-core/ui` | The whole control set — actions, inputs, display, feedback, layout, navigation | yes |
| `dsh-plugin-core/ui/official` | Direct re-exports of the host's official primitives, for the rare case you need one | yes |
| `dsh-plugin-core/ui/code-viewer` | Code viewer with per-line highlighting (also used by file preview) | yes |
| `dsh-plugin-core/ui/host` | Bridge to the host's own toast | yes |
| `dsh-plugin-core/utils` | Pure helpers: date, string, bytes, HTTP, built-in zh/en dictionary | no |
| `dsh-plugin-core/explorer` | File browser, file picker, docked file preview | yes |
| `dsh-plugin-core/explorer/preview` | Preview bodies: image, PDF, Markdown, HTML, Office, text/code | yes |
| `dsh-plugin-core/session` | Read-only session preview dialog + changed-file diff | yes |
| `dsh-plugin-core/host` | Host-side routes: read-only FS route, model catalog | no |

Dependency direction is one-way: `design` ← `ui` ← `explorer` / `session`, while `utils` depends on nothing.

## Feature tour

### design — tokens and style injection

Zero React, no components: it ships values plus the mechanism that puts them on the page.

- One token table for both themes, covering surfaces (`--dshpc-surface-1/2/sunken`), text (`--dshpc-fg`, `--dshpc-fg-3`, `--dshpc-fg-4`), borders, and twelve accents: `business`, `success`, `warning`, `danger`, `purple`, `pink`, `cyan`, `teal`, `orange`, `indigo`, `rose`, `slate`.
- `createStyleKit({ id })` returns a kit with `cssVar(name)`, `registerStyle(domain, css)`, `applyStyle(domain, css)` and `ensureStyles()` — one `<style>` tag per plugin, isolated by id.
- `DARK_THEME_SELECTOR` is exported as a constant (`body[data-ds-dark-theme]`) so your own CSS never guesses the theme from the OS.
- Prefixes are fixed across the ecosystem (`--dshpc-*` / `dshpc-*`); there is no per-plugin rename. Plugins built on different core versions are kept apart by the style-tag id, not by prefixing.

Use this subpath alone if you want the palette and the theme switch but write your own components.

### ui — the control set

Everything is built from tokens, takes its data through props, and follows the host's theme. Props are the customization surface — compose them instead of forking a component. See the [control reference](https://github.com/cq-guojia/dsh-plugin-core/blob/main/docs/help/ui.md) for every prop.

**Actions**

- `Button` — 18 appearance tiers (solid / outline / bare: `primary`, `secondary`, `danger`, `success`, `warning`, `info`, `outline`, `danger-outline`, `ghost`, `link`, plus the eight extended colors), three heights (24 / 28 / 32), leading and trailing icons, fixed / min / max width with marquee overflow, and automatic loading: return a Promise from `onClick` and the button spins, disables and restores itself — including on rejection.
- `IconButton` — icon-only variant of the same, with the accessible name enforced.
- `Segmented` — single or multiple selection, optional 1px frame, per-item icon / count / badge, tone-colored selection.

**Inputs**

- `Input`, `PrefixedInput`, `NumberInput`, `Textarea` — one shared field metric (`fieldMetricsOf`) so every control lines up; error state, leading icon slot, search clear button, and a question-mark hint that uses the host's tooltip.
- `Checkbox`, and the official `Switch` for on/off semantics.
- `Picker` — single or multiple, search, groups, selection cap, clearable, empty state; keyboard driven (Esc / arrows / Enter). Its logic (`toGroups`, `filterGroups`, `toggleValue`) is exported separately.
- `WorkspacePicker` / `ModelPicker` — pickers that bring their own data once `connectHost(ctx)` has been called; unwired they show an empty state rather than inventing entries.
- `DateTimePicker` — one control for a single instant or a range, precision `day` / `hour` / `minute` / `second`, two independent calendars, keyboard support, start floored and end ceiled.
- `InputGroup` — input with attached actions.

**Display**

- `Surface` — the plain framed container, with tone / border / padding / radius axes.
- `Card` / `StripCard` — cards with an accent system.
- `Chip`, `SectionHead`, `MarqueeText`, `FlipText`, `LiveText`.
- `Table` — grouped (multi-row) headers, banner groups so several sections live in one table, row spanning, selection, density / striped / border switches, per-column alignment and header tone, built-in empty state, loading and loading-more states, optional built-in pagination. Data-driven: it never sorts, fetches or virtualizes.
- `FieldHint` — the standalone question mark that opens the host's tooltip.

**Feedback**

- `Modal`, `SideSheet` — sized dialogs; `SideSheet` slides in from either side; both accept a `busy` lock.
- `AlertModal`, `ConfirmModal`, `alertModal()`, `confirmModal()` — promise-based dialogs.
- `showToast`, `notify` — Sonner-backed toasts, one host per screen shared across plugins.
- `Loader`, `LoaderBar`, `Loading`, `LoadingBlock`, `LoadingToast`, `RunningBlocks`, `showLoading` — spinners, an indeterminate bar, and a single-slot global loading card.

**Layout and navigation**

- `PanelDock` / `DockPanel` / `createPanelDock` — the right-docked column shell: a real layout member that takes width instead of floating over the page, multiple columns with draggable widths, saved widths, collapse to an edge ear.
- `QuickToolbar` — a toolbar that follows scrolling with back-to-top and visibility rules.
- `SplitGroup`, `startResizeLayoutWidth`, `Pagination`.

### utils — pure helpers

Zero React, zero DOM, zero dependency on `design`.

- **Date / time**: `formatDateTime`, `formatYmd`, `formatClock`, `formatDurationHms`, `formatRange`, `sameCalendarDay`, `relativePast`, `relativeFuture`, `overlaps`, `pad2`. Local timezone; a parse failure falls back instead of throwing, and never invents a time. `relativePast` and `relativeFuture` are duals — use the latter for future timestamps or "in 3 minutes" collapses into "just now".
- **Strings / bytes / paths**: `baseNameOf`, `safeTrim`, `truncateBytes` (UTF-8 aware, never splits a character), `formatBytes`, `formatCount`, `joinPath`, `parentOf`, `extOf`, `mimeOf`, `crumbsOf`.
- **HTTP**: `request`, `requestJson`, `HttpError` — one options object, structured failures.
- **i18n**: `setLocale('zh' | 'en')`, `getLocale()`, `t()` — the built-in dictionary shipped with the library (field placeholders, empty states, loading copy). Your plugin's own copy stays yours.

### explorer — workspace file browsing

- `openFilePreview({ mount, path })` — opens the right-docked file panel next to your main area. `mount` is the flex row that wraps the main area (element or selector); the dock becomes a layout member and gives the width back when closed.
- `pickWorkspaceFile({ anchor, filter })` — a Promise-based file picker; resolves to `{ path, isDir }` or `null`.
- `FileBrowser` — the browse surface on its own, if you would rather host it yourself.
- `FilePreview` — dispatches by extension to image, PDF, Markdown (rendered or source), HTML (rendered or source), Office (through the host's converter, honest "unavailable" state when it is missing), or text with syntax highlighting and open-at-line.
- Browsing is **not limited to workspaces**: one tree with workspace nodes plus the real root (`/`, or drive letters on Windows). Wiring takes two lines — `serveFsRoute({ path })` on the host side and `connectFs({ path })` on the client side with the same path constant. Browsing needs no session.

### session — read-only session preview

- `openSessionView(sessions, uiConversation, sessionId, mountId)` builds the data chain and returns a `view`, or `null` when the session cannot be resolved; hand it to `SessionViewModal` and call `view.dispose()` on close.
- Renders a dialog that mirrors the official conversation page: user and assistant turns, tool cards, reasoning blocks, changed files, permissions.
- Archive state is live, not a prop: core subscribes to the official workspace snapshot, so the archived badge and the "Continue" button follow changes while the dialog stays open. Archived sessions stay readable.
- "Continue" never disappears: an active session jumps to the official conversation, an archived one forks a child session first — with a confirmation dialog you can veto.
- `openSessionReview({ mount, locator })` opens the changed-file diff; a single file exit (`onOpenFile`) covers tool-card paths, inline mentions and delivered cards.

## Compatibility

| Area | Requirement |
|---|---|
| Host | DSH web client. Plugin client bundles are `window.__ModuleLoader__.load({ id, factory })` CJS closures; styles therefore arrive as runtime-injected strings. |
| Node.js | `>= 22.5` (build and install time only). |
| React / React DOM | `>= 18`, optional peers. Only `design` and `utils` work without React. |
| Theme | Follows the host: `body[data-ds-dark-theme]`. Never `prefers-color-scheme`. Tokens fall back to built-in values when the host does not provide them. |
| Naming | Variables `--dshpc-*`, class names `dshpc-*` — fixed, shared by the whole ecosystem. Nothing touches the host's own `--dsw-*` / `--dsh-*`. |
| Official primitives | Reachable only through `dsh-plugin-core/ui/official`, and only inside the host. The main entries stay free of `@deepseek-ai/*`, so importing `ui` in Node or in a test does not explode. |
| Bundling | ESM with `sideEffects: false` and per-control CSS domains — named imports keep unused controls (and their CSS) out of your bundle. |
| Data | Never fetched by a component. Workspaces, models, files and sessions come from the caller or from an interface you inject once. |

This is a **library, not a plugin**: no `main`, no `dsh` field. Whoever wants to *see* it running installs the demo plugin below.

## See it running: the demo plugin

`dsh-plugin-core-demo` ("Blue Whale Component Library") is an installable DSH plugin from the same repository. It renders every control and every composed module with real host data — the same code paths your plugin would use, not a static gallery.

Install it into your DSH host with the DSH CLI:

```bash
dsh plugin --profile web add dsh-plugin-core-demo
```

Or install the npm package itself:

```bash
npm install dsh-plugin-core-demo
```

After installing, open the plugin in DSH: the plugin page carries a **Component preview** entry that opens the full-page preview, and the sidebar entry can be placed first-level, under "More", or turned off entirely in the plugin settings.

What it covers: design foundation (tokens, dark-mode predicate, injection), actions, inputs, display, feedback, layout and scrolling, navigation, workspace browsing, session preview, the utility helpers with live input/output, and every built-in i18n string in both languages.

Its `dist/` is committed to the repository and it bundles core's build output into itself, so it always previews the current code — you do not need to publish core first.

## Documentation

| I want to… | Read |
|---|---|
| Integrate the package into a plugin | [Integration guide](https://github.com/cq-guojia/dsh-plugin-core/blob/main/docs/help/integration.md) |
| Look up a control and its props | [Control reference](https://github.com/cq-guojia/dsh-plugin-core/blob/main/docs/help/ui.md) |
| Use `createStyleKit`, override tokens, isolate plugins | [design](https://github.com/cq-guojia/dsh-plugin-core/blob/main/docs/help/design.md) |
| Use tokens, colors or a custom skin | [Style guide](https://github.com/cq-guojia/dsh-plugin-core/blob/main/docs/help/style.md) |
| Handle dates, strings, bytes, HTTP | [utils](https://github.com/cq-guojia/dsh-plugin-core/blob/main/docs/help/utils.md) — and the shared [method conventions](https://github.com/cq-guojia/dsh-plugin-core/blob/main/docs/help/methods.md) |
| Add workspace browsing and file preview | [explorer](https://github.com/cq-guojia/dsh-plugin-core/blob/main/docs/help/explorer.md) |
| Render a session as a read-only preview | [session](https://github.com/cq-guojia/dsh-plugin-core/blob/main/docs/help/session.md) |
| Understand the architecture | [Architecture](https://github.com/cq-guojia/dsh-plugin-core/blob/main/docs/design/architecture.md) |
| See why a decision was made | [Requirements and decisions](https://github.com/cq-guojia/dsh-plugin-core/blob/main/docs/requirements.md) |

The help documents are bilingual (Chinese prose, English abstract under each section).

## Releasing

Core and the demo share one version number, and one git tag publishes both packages:

```bash
# 1. set the same version in the root package.json and packages/demo/package.json
# 2. build, commit (dist/ must be committed) and push
pnpm run build && pnpm run build:demo
git add -A && git commit -m "Release 0.33.0" && git push
# 3. the tag triggers GitHub Actions, which publishes to npm
git tag v0.33.0 && git push origin v0.33.0
```

`tag vX.Y.Z` must equal both `version` fields; there is no separate `demo-v*` tag.

## License

MIT
