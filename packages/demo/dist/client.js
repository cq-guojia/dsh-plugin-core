window.__ModuleLoader__.load({ id: "dsh-plugin-core-demo", factory: (require) => {
var module = { exports: {} }; var exports = module.exports;

"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/demo/src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply
});
module.exports = __toCommonJS(index_exports);
var import_react44 = require("react");
var import_dsh_client_ui_primitives4 = require("@deepseek-ai/dsh-client-ui-primitives");

// dist/design/tokens-css.generated.js
var TOKENS_CSS_TEMPLATE = '\n/* \u2500\u2500 \u6587\u5B57\uFF08\u5BBF\u4E3B label \u56DB\u6863 + \u53CD\u8272\u9762\u7528\u5B57\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\nbody{\n  --dshpc-fg:var(--dsw-alias-label-primary,#1f2328);\n  --dshpc-fg-2:var(--dsw-alias-label-secondary,#5c6370);\n  --dshpc-fg-3:var(--dsw-alias-label-tertiary,#767d87);\n  --dshpc-fg-4:var(--dsw-alias-label-caption,#9aa1ab);\n  --dshpc-fg-dim:var(--dsw-alias-label-dimmed,#b9bfc7);\n  /* \u53CD\u8272\u9762\u4E0A\u7684\u5B57\uFF08\u5B9E\u5FC3\u94AE / \u89D2\u6807\uFF09\uFF1A\u6697\u8272\u4E0B\u662F bluish-1000\uFF0C\u6545\u7528 -foreground \u800C\u975E -inverted */\n  --dshpc-fg-inverse:var(--dsw-alias-label-primary-foreground,#fff);\n\n  /* \u2500\u2500 \u9762\uFF08\u5BBF\u4E3B bg-layer \u4E09\u6863 + \u4E0B\u6C89\u8F68\u9053\u5E95\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n  --dshpc-surface-1:var(--dsw-alias-bg-layer-1,#fff);\n  --dshpc-surface-2:var(--dsw-alias-bg-layer-2,#fff);\n  --dshpc-surface-3:var(--dsw-alias-bg-layer-3,#fff);\n  /* \u300C\u9009\u4E2D\u4EAE\u7247\u300D\u7684\u5E95\u76D8\u8272\uFF08\u914D --dshpc-shadow-raised \u7528\uFF09 */\n  --dshpc-surface-raised:var(--dsw-alias-bg-layer-1,#fff);\n  /* \u8F68\u9053 / \u4E0B\u6C89\u5E95\uFF08\u5B98\u65B9\u5206\u6BB5\u63A7\u4EF6\u8F68\u9053\u7528\u7684\u5C31\u662F\u8FD9\u6761\uFF09 */\n  --dshpc-surface-sunken:var(--dsw-alias-interactive-bg-hover,rgba(38,49,72,.06));\n  /* \u6574\u9875 / \u7F16\u8F91\u5668\u5E95\uFF08bg-base\uFF09 */\n  --dshpc-surface-base:var(--dsw-alias-bg-base,#fff);\n  /* \u81EA\u7ED8\u6D6E\u5C42 / \u83DC\u5355\u5361\u7684\u4E0D\u900F\u660E\u5E95\uFF08= base\uFF1B\u4E0D\u8981\u7528\u534A\u900F\u660E\u7684 specific-menu\uFF09 */\n  --dshpc-surface-menu:var(--dshpc-surface-base);\n  /* markdown \u4EE3\u7801\u5757\u9762 / \u5B57\u4F53\uFF08\u4F1A\u8BDD\u955C\u50CF\u91CC\u7528\u5230\uFF09 */\n  --dshpc-code-surface:var(--dsw-alias-markdown-code-block,rgba(128,128,128,.10));\n  --dshpc-code-font:var(--dsw-font-markdown-code-block-small,12px/18px var(--ds-font-family-code,monospace));\n  /* \u8B66\u544A\u6587\u5B57\u8272\uFF08\u5BBF\u4E3B state-warn-label\uFF09 */\n  --dshpc-warning-label:var(--dsw-alias-state-warn-label,#f5a623);\n  /* \u56FA\u5B9A\u4E2D\u6027\u5B9E\u9762\uFF08\u81EA\u7ED8\u6D6E\u5C42\u3001\u6DF1\u8272\u4E3B\u9898\u4E0B\u5FC5\u987B\u81EA\u5DF1\u53D8\u7684\u90A3\u51E0\u4E2A\uFF09\u2014\u2014\u53EA\u6709\u5B83\u9700\u8981\u6697\u8272\u8986\u76D6 */\n  --dshpc-solid:var(--dsw-static-neutral-00,#fff);\n  --dshpc-on-solid:var(--dsw-alias-label-primary,#1f2328);\n  /* \u4EA4\u4ED8\u6587\u4EF6\u5361\u90A3\u79CD\u300C\u6D45\u5E95\u76D8 + hover \u52A0\u6DF1\u300D\u4E24\u62CD */\n  --dshpc-plate:var(--dsw-static-neutral-50,#fafafa);\n  --dshpc-plate-hover:var(--dsw-static-neutral-100,#f5f5f5);\n  /* \u26A0\uFE0F \u8FD9\u4E9B**\u56FA\u5B9A\u4E2D\u6027\u9762\u4E00\u5F8B\u7528 rgba \u5B57\u9762\u91CF**\uFF082026-10-19 \u771F\u673A\u6559\u8BAD\uFF09\uFF1A\u4E0D\u8981\u5199\u6210\n     \u300Crgba \u56DE\u9000\u884C + \u5D4C --dsw-static-* \u7684 color-mix \u884C\u300D\u4E24\u6761\u540C\u540D\u58F0\u660E\u2014\u2014\u81EA\u5B9A\u4E49\u5C5E\u6027**\u540E\u8005\u6052\u80DC**\uFF0C\n     \u54EA\u6015\u5B83\u7684\u503C\u5728\u5BBF\u4E3B\u91CC\u7B97\u4E0D\u51FA\u6765\uFF08static \u53D8\u91CF invalid\uFF09\u21D2 \u6574\u6761 token \u4F5C\u5E9F\u3001rgba \u515C\u5E95\u4E00\u8D77\u88AB\u5E9F\uFF0C\n     0.2.6 \u91CC Segmented \u8F68\u9053\u5168\u900F\u660E\u5C31\u662F\u8FD9\u4E48\u6765\u7684\u3002\u8981\u8DDF\u5BBF\u4E3B\u4E3B\u9898\u8054\u52A8\u7684\u9762\u7528 alias token\uFF08\u90A3\u4E9B\u5B9E\u6D4B\u6709\u6548\uFF09\u3002 */\n  --dshpc-icon-plate:rgba(255,255,255,.5);\n  /* \u8868\u5934\u5E95\uFF1A\u6D45\u8272\u4E3B\u9898**\u504F\u6DF1**\uFF0C\u4E14\u5FC5\u987B**\u6BD4\u6591\u9A6C\u7EB9\uFF08--dshpc-plate\uFF09\u518D\u6DF1\u4E00\u6863**\u2014\u2014\n     \u4E24\u8005\u4E0D\u80FD\u649E\u8272\uFF08\u7528\u6237 2026-10-02\uFF1A\u8868\u5934\u8DDF\u6591\u9A6C\u7EB9\u4E00\u6A21\u4E00\u6837\uFF09\u3002 */\n  --dshpc-head-bg:var(--dsw-static-neutral-100,#f5f5f5);\n  /* \u56FE\u6807\u5C0F\u5E95\u677F\uFF08\u4EA7\u51FA\u7269\uFF09\uFF1A\u6D45\u8272\u4E0B\u8981**\u770B\u5F97\u89C1**\uFF08\u539F\u5148\u53D6 plate \u21D2 \u5728\u767D\u5E95\u4E0A\u7B49\u4E8E\u6CA1\u6709\uFF09\uFF1Bhover \u52A0\u500D\u3002 */\n  --dshpc-chip-bg:rgba(15,15,15,.07);\n  --dshpc-chip-bg-hover:rgba(15,15,15,.14);\n  /* \u5C55\u5F00\u884C\uFF1A**\u5E26\u900F\u660E\u5EA6\u7684\u84DD**\u2014\u2014\u4E0D\u662F\u7070\u3001\u4E5F\u4E0D\u662F\u7EAF\u8272\uFF0C\u900F\u51FA\u5361\u7247\u5E95\u8272\uFF0C\u4E00\u773C\u770B\u51FA\u300C\u8FD9\u662F\u5C55\u5F00\u7684\u300D\n     \uFF08\u7528\u6237 2026-10-02\uFF1A\u7070\u8272\u8DDF\u6591\u9A6C\u7EB9\u5206\u4E0D\u51FA\u6765\uFF09\u3002\u5185\u5BB9\u533A\u518D\u6DE1\u4E00\u6863\uFF0C\u5F62\u6210\u300C\u884C\u6DF1 / \u5185\u5BB9\u6D45\u300D\u7684\u533A\u9694\u3002 */\n  --dshpc-open-bg:rgba(37,99,235,.10);\n  --dshpc-open-bg-soft:rgba(37,99,235,.05);\n  --dshpc-card-hover:rgba(37,99,235,.07);\n\n  /* \u2500\u2500 \u63CF\u8FB9\u56DB\u6863\uFF08\u5BBF\u4E3B\u771F\u503C\uFF1Al1 4% / l2 10% / l3 12% / l4 16%\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n  --dshpc-border-faint:var(--dsw-alias-border-l1,#0000000a);\n  --dshpc-border:var(--dsw-alias-border-l2,#0000001a);\n  --dshpc-border-strong:var(--dsw-alias-border-l3,#0000001f);\n  --dshpc-border-heavy:var(--dsw-alias-border-l4,#00000029);\n\n  /* \u2500\u2500 \u54C1\u724C / \u8BED\u4E49\u8272 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n  /* \u54C1\u724C\u300C\u9762\u300D\u8272\uFF1A\u660E\u8272\u8FD1\u9ED1\u3001\u6697\u8272\u8FD1\u767D\uFF08\u5B98\u65B9 Switch \u9009\u4E2D\u6001\u5373\u6B64\uFF09\uFF0C**\u4E0D\u662F\u84DD\u8272** */\n  --dshpc-accent:var(--dsw-alias-brand-primary,#0f1115);\n  /* \u84DD\u8272\uFF1A\u5F3A\u8C03 / \u9009\u4E2D / \u7126\u70B9\uFF0C\u4E00\u5F8B\u8D70\u8FD9\u6761 */\n  --dshpc-business:var(--dsw-alias-state-business-primary,#3b5bdb);\n  --dshpc-success:var(--dsw-alias-state-success-primary,#22c55e);\n  /* \u26A0\uFE0F \u662F state-warn\uFF08\u4E0D\u662F state-warning\uFF0C\u540E\u8005\u5BBF\u4E3B\u65E0\u6B64\u5B9A\u4E49\uFF09 */\n  --dshpc-warning:var(--dsw-alias-state-warn-primary,#f59e0b);\n  --dshpc-danger:var(--dsw-alias-state-error-primary,#ec1313);\n  --dshpc-link:var(--dsw-alias-link,#3b5bdb);\n  /* \u8BED\u4E49\u8272**\u5B9E\u9762**\u4E0A\u7684\u5B57\uFF08\u89D2\u6807 / \u5B9E\u5FC3\u63D0\u793A\uFF09\uFF1A\u5BBF\u4E3B\u7EA2\u7EFF\u9EC4\u4E09\u8272\u90FD\u662F\u4E2D\u8C03 \u21D2 \u767D\u5B57\u4E24\u4E2A\u4E3B\u9898\u90FD\u53EF\u8BFB\uFF0C\n     \u6545\u8FD9\u662F\u4E00\u6761\u4E0E\u4E3B\u9898\u65E0\u5173\u7684\u5E38\u91CF\uFF1B\u4E0D\u8981\u62FF --dshpc-fg-inverse \u9876\u2014\u2014\u5B83\u5728\u6697\u8272\u4E0B\u662F\u8FD1\u9ED1\uFF0C\u538B\u5728\u7EA2\u5E95\u4E0A\u770B\u4E0D\u6E05\u3002 */\n  --dshpc-on-signal:#fff;\n  /* \u9EC4\u5E95\u4E0A\u7684\u5B57\uFF1A\u9EC4\u8272\u662F\u4E2D\u9AD8\u660E\u5EA6\uFF0C\u767D\u5B57\u770B\u4E0D\u6E05 \u21D2 \u56FA\u5B9A\u6DF1\u8272\uFF08\u4E0E\u4E3B\u9898\u65E0\u5173\uFF09\u3002 */\n  --dshpc-on-warning:#1f2328;\n\n  /* \u2500\u2500 \u5B9E\u5FC3\u6309\u94AE\u7684 hover / active \u6D3E\u751F\u6001\uFF082026-10-19 \u7528\u6237\u70B9\u540D\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n     \u539F\u5B9E\u73B0\u662F :hover \u76F4\u63A5\u538B opacity .9\uFF1A\u9ED1\u5E95\u538B 10% \u51E0\u4E4E\u770B\u4E0D\u51FA\u6765\uFF0C\u7528\u6237\u539F\u8BDD\u300C\u5B8C\u5168\u611F\u89C9\u4E0D\u5230\u989C\u8272\u53D8\u4E86\u300D\u3002\n     \u21D2 \u6539\u6210\u5BF9\u5E95\u8272\u505A**\u660E\u786E\u7684\u6DF7\u8272**\uFF08\u538B 22% / 34%\uFF09\uFF0C\u4E0D\u7528 opacity\uFF1A\n       \xB7 \u4EAE\u8272\u4E3B\u9898\uFF1A\u9ED1\u5E95\uFF08--dshpc-accent\uFF09\u63BA\u767D\u63D0\u4EAE\uFF1B\u7EA2 / \u7EFF / \u9EC4 / \u84DD\u5E95\u63BA\u9ED1\u538B\u6DF1\uFF1B\n       \xB7 \u6697\u8272\u4E3B\u9898\uFF1A\u53CD\u8FC7\u6765\uFF08\u6697\u5E95\u63BA\u767D\u3001\u4EAE\u5E95\u63BA\u9ED1\uFF09\u3002\n     \u6DF7\u8272\u5BF9\u8C61\u662F**\u56FA\u5B9A\u4E2D\u6027\u8272\u5B57\u9762\u91CF**\uFF08#fff / #000\uFF09\uFF0C\u4E0D\u4F9D\u8D56\u5BBF\u4E3B static-neutral \u662F\u5426\u5B58\u5728\uFF1B\n     \u65E7\u5185\u6838\u4E0D\u8BA4 color-mix \u65F6\u6574\u6761\u58F0\u660E\u4F5C\u5E9F \u21D2 \u56DE\u843D\u5404\u6863\u539F\u8272\uFF08\u53EF\u63A5\u53D7\uFF1A\u4ECD\u53EF\u70B9\uFF0C\u53EA\u662F\u6CA1\u6709 hover \u53CD\u9988\uFF09\u3002 */\n  --dshpc-accent-hover:color-mix(in srgb,var(--dshpc-accent) 78%,#ffffff);\n  --dshpc-accent-active:color-mix(in srgb,var(--dshpc-accent) 64%,#ffffff);\n  --dshpc-danger-hover:color-mix(in srgb,var(--dshpc-danger) 78%,#000000);\n  --dshpc-danger-active:color-mix(in srgb,var(--dshpc-danger) 64%,#000000);\n  --dshpc-success-hover:color-mix(in srgb,var(--dshpc-success) 78%,#000000);\n  --dshpc-success-active:color-mix(in srgb,var(--dshpc-success) 64%,#000000);\n  --dshpc-warning-hover:color-mix(in srgb,var(--dshpc-warning) 78%,#000000);\n  --dshpc-warning-active:color-mix(in srgb,var(--dshpc-warning) 64%,#000000);\n  --dshpc-business-hover:color-mix(in srgb,var(--dshpc-business) 78%,#000000);\n  --dshpc-business-active:color-mix(in srgb,var(--dshpc-business) 64%,#000000);\n  /* \u8BED\u4E49\u8272**\u6D45\u5E95**\uFF1A\u72B6\u6001\u8272\u7CFB\u7684\u300C\u4E00\u5757\u5E95\u8272\u300D\u2014\u2014\u6267\u884C\u8BB0\u5F55\u9875\u6BCF\u6761\u6D41\u6C34\u8D26\u7684\u5757\u5E95\u5C31\u662F\u5B83\n     \uFF08\u7528\u6237 2026-10-04\uFF1A\u6B63\u5E38\u6001\u7ED9\u540C\u8272\u7CFB\u5F88\u6D45\u7684\u900F\u660E\u5E95\u3001\u5931\u8D25\u7528\u7EA2\u5E95\u900F\u51FA\u6765\uFF09\u3002\n     \u7528 \u300Ccolor-mix\u300D \u73B0\u7B97\u800C\u4E0D\u5199\u6B7B rgba\uFF1A\u72B6\u6001\u8272\u672C\u8EAB\u8DDF\u968F\u5BBF\u4E3B alias\uFF0C\u4E3B\u9898\u4E00\u6362\u81EA\u52A8\u6210\u7ACB\u3002\n     \u26A0\uFE0F **\u6DF1\u8272\u4E0B\u8981\u66F4\u6DE1**\uFF1A\u7528\u6237 2026-10-04\u300C\u6DF1\u8272\u98CE\u683C\u7684\u7EFF\u8272\u548C\u7EA2\u8272\u597D\u50CF\u90FD\u6709\u70B9\u6DF1\u300D\u21D2 dark \u6BB5\n     \u628A\u8FD9\u56DB\u6761\u538B\u5230 5%\uFF08\u66F4\u8D34\u8FD1\u9762\u677F\u5E95\u3001\u5B58\u5728\u611F\u66F4\u5F31\uFF09\uFF1B\u6D45\u8272\u6BB5\u7EF4\u6301 8%\u3002\u4E24\u7AEF\u5404\u81EA\u7ED9\u503C\uFF0C\u4E0D\u5171\u7528\u4E00\u6761\u66F2\u7EBF\u3002\n     \u547D\u540D\u6536\u5728 tokens.ts \u5355\u70B9\uFF08\u672C\u4ED3\u786C\u89C4\u77E9\uFF1A\u4E1A\u52A1\u6587\u4EF6\u4E0D\u8BB8\u81EA\u9020 --dshpc-*\uFF09\u3002 */\n  --dshpc-success-soft:color-mix(in srgb,var(--dshpc-success) 8%,transparent);\n  --dshpc-warning-soft:color-mix(in srgb,var(--dshpc-warning) 8%,transparent);\n  --dshpc-danger-soft:color-mix(in srgb,var(--dshpc-danger) 8%,transparent);\n  --dshpc-business-soft:color-mix(in srgb,var(--dshpc-business) 8%,transparent);\n\n  /* \u26A0\uFE0F 2026-10-18 \u7528\u6237\u62CD\u677F\uFF1A\u5BBF\u4E3B alias \u7684 hover\uFF08\u6697\u8272\u767D 8% / \u4EAE\u8272 6%\uFF09**\u592A\u5F31**\uFF0C\n     \u300C\u79FB\u4E0A\u53BB\u8981\u4ED4\u7EC6\u770B\u624D\u770B\u5F97\u51FA\u6765\u300D\u21D2 \u4E0D\u518D\u59D4\u6258\u5BBF\u4E3B hover \u522B\u540D\uFF0C\u6539\u4E3A\u81EA\u63BA\u4E2D\u6027\u8272\u5E76\u52A0\u91CD\uFF1A\n     \u4EAE\u8272\u63BA\u9ED1 10%\u3001\u6697\u8272\u63BA\u767D 14%\uFF08active \u518D\u52A0\u4E00\u6863\uFF09\u3002\u6309\u94AE / \u5206\u6BB5\u8F68\u9053 / \u5404\u7C7B hover \u5E95\u540C\u65F6\u53D7\u76CA\u3002\n     \u26A0\uFE0F \u5FC5\u987B\u4FDD\u7559 rgba \u515C\u5E95\u884C\u5728\u524D\uFF08\u672C\u6587\u4EF6\u60EF\u4F8B\uFF0C\u89C1 icon-plate \u6CE8\u91CA\uFF09\uFF1A\u63BA\u7684\u662F**\u56FA\u5B9A\u4E2D\u6027\u8272**\n     \uFF08neutral-900=#0f0f0f / neutral-00=#fff\uFF09\uFF0C\u9884\u8BA1\u7B97\u65E0\u635F\uFF1B\u65E7\u5185\u6838\u4E0D\u8BA4 color-mix \u65F6\u8D70\u515C\u5E95\uFF0C\n     \u5426\u5219\u6574\u6761 background:var(--seg-track) \u4F5C\u5E9F \u21D2 \u5206\u6BB5\u8F68\u9053\u900F\u660E\uFF08\u771F\u8E29\u8FC7\uFF1A\u9884\u89C8\u7AD9\u8F68\u9053\u6D88\u5931\uFF09\u3002 */\n  --dshpc-hover:rgba(15,15,15,.10);\n  --dshpc-active:rgba(15,15,15,.18);\n  /* \u5206\u6BB5\u63A7\u4EF6\u8F68\u9053\u5E95\uFF1A\u4E13\u7528 token\uFF08rgba \u5B57\u9762\u91CF\u3001\u4E0D\u501F --dshpc-hover \u4E2D\u8F6C\uFF09\u2014\u2014\n     2026-10-19 \u6559\u8BAD\uFF1A\u53D8\u91CF\u94FE\u4E2D\u95F4\u4EFB\u4F55\u4E00\u73AF invalid \u21D2 background \u6574\u6761\u4F5C\u5E9F\u3001\u8F68\u9053\u5168\u900F\u660E\u3002\n     \u4EAE\u8272\uFF1A\u9ED1 7%\uFF08\u6BD4 hover \u7684 10% \u6DE1\u4E00\u6863\uFF0C\u9009\u4E2D\u767D\u7247\u624D\u8DF3\u5F97\u51FA\uFF09\u3002 */\n  --dshpc-seg-track:rgba(15,15,15,.07);\n  --dshpc-mask:var(--dsw-alias-bg-mask-1,#0000003d);\n  /* \u300C\u9009\u4E2D\u9762\u300D\uFF082026-10-06\uFF0C\u4EFB\u52A1\u65E5\u7A0B\u9875\u9996\u521B\uFF09= \u5F53\u524D\u5E95\u8272**\u671D\u66F4\u6DF1\u63BA 12% \u6587\u5B57\u8272**\uFF1A\n     \u6D45\u8272\u4E3B\u9898\u4E0B\u6587\u5B57\u8272\u662F\u9ED1 \u21D2 \u9009\u4E2D\u9762\u6BD4\u5E38\u6001\u5E95\u8272**\u6DF1\u4E00\u6863**\u3002\u6DF1\u8272\u5206\u652F\u89C1 body[data-ds-dark-theme]\uFF08\u671D\u80CC\u666F\u8272\u63BA\uFF09\u3002\n     \u8BED\u4E49\uFF1A\u6807\u8BB0\u300C\u6B63\u5728\u770B\u7684\u4E1C\u897F\u300D\uFF0C\u6BD4\u5E38\u6001\u660E\u663E\u3001\u53C8\u4E0D\u8BB8\u76D6\u4F4F\u5185\u5BB9\uFF08\u4E0D\u8BB8\u7528\u534A\u900F\u660E\u53E0\u72B6\u6001\u8272\uFF09\u3002 */\n  --dshpc-selected-bg:color-mix(in srgb,var(--dshpc-surface-1) 88%,var(--dshpc-fg));\n  /* \u4EFB\u52A1\u65E5\u7A0B\u9875\u672C\u6708\u683C\u9ED8\u8BA4\u5E95\uFF082026-10-06 \u2192 \u7EED2\uFF09\uFF1A\u6D45\u8272\u4E0B\u7ED9**\u6DE1\u84DD**\uFF08business 8% \u900F\u767D\u5E95\uFF09\u2014\u2014\n     \u53C2\u7167\u7528\u6237\u53C2\u8003\u7A3F\u91CC\u672A\u9009\u4E2D\u65E5\u7A0B\u5757 / Tuesday \u5217\u7684\u90A3\u79CD\u84DD\u3001\u518D\u6D45\u4E00\u70B9\u70B9\uFF1B\n     \u76F8\u90BB\u6708\u8865\u4F4D\u683C\u4ECD\u8D70 --dshpc-surface-2\uFF08\u66F4\u7070\uFF09\uFF0C\u4E0D\u53D7\u5F71\u54CD\u3002\n     \u6DF1\u8272\u6BB5\u7EF4\u6301 #23262e\uFF08\u7528\u6237\uFF1A\u6DF1\u8272 UI \u5DF2\u5DEE\u4E0D\u591A\uFF0C\u4E0D\u52A8\uFF09\u3002 */\n  --dshpc-cal-cell-bg:color-mix(in srgb,var(--dshpc-business) 8%,var(--dshpc-surface-1));\n  /* \u4EFB\u52A1\u65E5\u7A0B\u9875\u300C\u70B9\u5F00\u67D0\u5929\u300D\u5C55\u5F00\u7684\u9762\u677F\u5E95\uFF082026-10-06 \u7EED\uFF09\uFF1A\u6D45\u8272\u4E0B**\u65E0\u9650\u63A5\u8FD1\u767D\u3001\u53EA\u5E26\u4E00\u4E01\u70B9\u7070**\n     \uFF08neutral-50 = #fafafa\uFF09\u2014\u2014\u9762\u677F\u91CC\u88C5\u534A\u900F\u660E\u6267\u884C\u8BB0\u5F55\u5217\u8868\uFF0C\u5E95\u518D\u6DF1\u6574\u7247\u5C31\u53D1\u7CCA\u53D1\u7070\uFF1B\n     \u6DF1\u8272\u6BB5\u6CBF\u7528\u539F selected-bg \u6697\u503C\uFF0C\u4FDD\u6301\u4E0D\u52A8\u3002 */\n  --dshpc-cal-panel-bg:var(--dsw-static-neutral-50,#fafafa);\n  /* \u4EFB\u52A1\u65E5\u7A0B\u9875\u672C\u6708\u683C hover \u5E95\uFF08\u6D45\u8272\u6BB5\uFF0C2026-10-06 \u7EED3\uFF09\uFF1A\u4E0D\u518D\u8D70\u7070\u8272\u901A\u7528\u4EA4\u4E92\u5E95\u2014\u2014\n     \u9F20\u6807\u79FB\u4E0A\u53BB\u5E94\u662F\u300C\u66F4\u4EAE\u4E00\u70B9\u70B9\u7684\u84DD\u300D\uFF08\u4E0E\u6DF1\u8272\u6BB5\u540C\u8BED\u4E49\uFF1Ahover = \u63D0\u4EAE\u7684\u84DD\uFF0C\u4E0D\u662F\u7070\u4E0B\u53BB\uFF09\u3002\n     \u6D53\u5EA6**\u4ECB\u4E8E**\u8868\u5934\u84DD\uFF0814%\uFF09\u4E0E\u672A\u9009\u4E2D\u683C\u84DD\uFF088%\uFF09\u4E4B\u95F4\u3001\u7565\u504F\u8868\u5934\u4E00\u4FA7\uFF1Abusiness 12% \u900F\u767D\u5E95\n     \uFF08\u6BD4\u8868\u5934\u6D45\u4E00\u70B9\u3001\u6BD4\u672A\u9009\u4E2D\u683C\u6DF1\u4E00\u70B9\uFF09\u3002 */\n  --dshpc-cal-cell-hover:color-mix(in srgb,var(--dshpc-business) 12%,var(--dshpc-surface-1));\n\n  /* \u2500\u2500 \u6295\u5F71 / \u7126\u70B9 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n  --dshpc-shadow-1:var(--dsw-elevation-soft,0 4px 16px 0 #00000008);\n  /* \u4EAE\u7247\u81EA\u5E26\u7684\u6D6E\u8D77\u611F\uFF08\u9009\u4E2D\u6001\u7528\uFF1B\u4E0E --dshpc-surface-raised \u914D\u5BF9\uFF09 */\n  --dshpc-shadow-raised:var(--dsw-elevation-soft,0 4px 16px 0 #00000008);\n  --dshpc-shadow-2:var(--dsw-shadow-lv3,0 12px 32px 0 #00000014);\n  /* \u952E\u76D8\u7126\u70B9\u73AF\u3002\u26A0\uFE0F \u4E0D\u7528\u5BBF\u4E3B --dsw-focus-ring-color\uFF1A\u5B83\u9ED8\u8BA4\u503C\u662F transparent\uFF08\u515C\u5E95\u4E0D\u751F\u6548\u3001\u4F1A\u9690\u8EAB\uFF09 */\n  --dshpc-focus:var(--dsw-alias-state-business-primary,#3b5bdb);\n\n  /* \u2500\u2500 \u5706\u89D2\uFF08\u5BBF\u4E3B\u771F\u503C 4 / 8 / 12 / 16 / 20 / 28\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n  --dshpc-radius-xs:var(--dsw-radius-xs,4px);\n  --dshpc-radius-sm:var(--dsw-radius-sm,8px);\n  --dshpc-radius-md:var(--dsw-radius-md,12px);\n  --dshpc-radius-lg:var(--dsw-radius-lg,16px);\n  --dshpc-radius-xl:var(--dsw-radius-xl,20px);\n  --dshpc-radius-panel:var(--dsw-radius-panel,28px);\n  /* \u5168\u5706\uFF08\u80F6\u56CA\u6807\u7B7E\uFF09\uFF1A\u5BBF\u4E3B\u7684 radius \u6863\u6700\u5927\u53EA\u6709 28px\uFF0C\u6491\u4E0D\u6EE1 24px \u9AD8\u7684 chip */\n  --dshpc-radius-pill:999px;\n\n  /* \u2500\u2500 \u95F4\u8DDD\u56DB\u62CD\uFF08\u53EA\u8BB8\u7528\u8FD9\u56DB\u6863\uFF0C\u4E0D\u8BB8\u51FA\u73B0 5 / 7 / 9px\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n  --dshpc-space-1:4px;\n  --dshpc-space-2:8px;\n  --dshpc-space-3:12px;\n  --dshpc-space-4:16px;\n\n  /* \u2500\u2500 \u63A7\u4EF6\u9AD8\u5EA6\uFF1A\u79BB\u6563\u4E09\u6863\uFF08\u63A7\u4EF6\u7528 size="sm|md|lg" \u9009\uFF1B\u8C03\u7528\u70B9\u4E0D\u8BB8\u81EA\u5B9A\u4E49\u9AD8\u5EA6\uFF0C\n       \u771F\u4E0D\u591F\u7528\u624D\u5141\u8BB8\u5728\u8C03\u7528\u70B9\u672C\u5730\u8986\u76D6 --dshpc-control-h-*\uFF0C\u5C5E\u4F8B\u5916\u800C\u975E\u5E38\u6001\uFF09\u2500\u2500 */\n  --dshpc-control-h-sm:24px;\n  --dshpc-control-h-md:28px;\n  --dshpc-control-h-lg:32px;\n\n  /* \u2500\u2500 \u5B57\u53F7 / \u884C\u9AD8\uFF1A\u76F4\u7ED1\u5BBF\u4E3B\u5B57\u53F7\u65CF\uFF08\u5BBF\u4E3B\u771F\u503C 11 / 12 / 13 / 14 / 16\uFF09\u2500\u2500\u2500\u2500\u2500 */\n  --dshpc-font-xs:var(--dsw-font-xxxs-11-font-size,11px);\n  --dshpc-font-sm:var(--dsw-font-xxs-12-font-size,12px);\n  --dshpc-font-md:var(--dsw-font-xs-13-font-size,13px);\n  --dshpc-font-lg:var(--dsw-font-s-14-font-size,14px);\n  --dshpc-font-xl:var(--dsw-font-base-16-font-size,16px);\n  --dshpc-line-xs:var(--dsw-font-xxxs-11-line-height,14px);\n  --dshpc-line-sm:var(--dsw-font-xxs-12-line-height,18px);\n  --dshpc-line-md:var(--dsw-font-xs-13-line-height,20px);\n  --dshpc-line-lg:var(--dsw-font-s-14-line-height,22px);\n  --dshpc-line-xl:var(--dsw-font-base-16-line-height,24px);\n  --dshpc-font-mono:var(--ds-font-family-code,monospace);\n\n  /* \u2500\u2500 \u5C42\u7EA7\u9636\u68AF\uFF08\u4E1A\u52A1\u6587\u4EF6\u4E0D\u8BB8\u518D\u5199\u88F8 z-index\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n  /* \u9875\u9762\u7EA7\u9884\u89C8\u5206\u680F \u2192 \u62BD\u5C49\uFF08\u65B0\u5EFA/\u7F16\u8F91\uFF09\u2192 \u5F39\u7A97/\u786E\u8BA4\u6846 \u2192 \u6D6E\u5C42\u83DC\u5355 \u2192 \u6D6E\u5C42\u63D0\u793A */\n  /* \u5185\u5BB9\u5C42\u5438\u9876\uFF08\u5929\u6807\u7B7E / \u8868\u5934\u8FD9\u7C7B\u300C\u8DDF\u7740\u6EDA\u4F46\u538B\u4F4F\u540C\u5C42\u5185\u5BB9\u300D\u7684\u5143\u7D20\uFF09\uFF1A\u53EA\u538B\u540C\u5C42\u5144\u5F1F\uFF0C\n     \u5FC5\u987B\u4F4E\u4E8E\u4E0B\u9762\u6240\u6709\u6D6E\u5C42\u6863 \u2014\u2014 \u6240\u4EE5\u5B83\u4E0D\u662F\u300C\u5F00\u65B0\u6D6E\u5C42\u6863\u300D\uFF0C\u800C\u662F\u5185\u5BB9\u5C42\u5185\u90E8\u7684\u6392\u5E8F\u4F4D\u3002 */\n  --dshpc-z-sticky:10;\n  --dshpc-z-dock:1030;\n  --dshpc-z-drawer:1040;\n  --dshpc-z-modal:1070;\n  --dshpc-z-menu:1100;\n  --dshpc-z-tip:1200;\n\n  /* \u2500\u2500 \u52A8\u6548 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n  --dshpc-dur:var(--ds-transition-duration,.2s);\n  --dshpc-dur-fast:var(--ds-transition-duration-fast,.12s);\n  --dshpc-ease:var(--ds-ease-in-out,cubic-bezier(.4,0,.2,1));\n  /* \u8FD0\u884C\u4E2D\u72B6\u6001\u7684\u8109\u52A8\u65F6\u957F\uFF082026-10-06 \u7EDF\u4E00\u524D\u540E\u4E24\u7AEF\uFF1A\u4EFB\u52A1\u914D\u7F6E\u91CC\u7684\u7EFF\u547C\u5438 \u2192 \u84DD\u3001\u653E\u6162\uFF1B\n     \u6267\u884C\u8BB0\u5F55\u91CC\u7684\u84DD\u95EA \u2192 \u653E\u6162\u4E00\u70B9\u3002\u4E24\u8005\u7528\u540C\u4E00\u4E2A\u503C\uFF0C\u52A8\u753B\u5F62\u72B6\u672C\u5C31\u4E00\u81F4\uFF09\u3002 */\n  --dshpc-dur-run:500ms;\n}\n\n/* \u2500\u2500 \u660E\u6697\u5DEE\u5F02\u7684**\u552F\u4E00**\u843D\u70B9 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n   \u5224\u636E = body[data-ds-dark-theme]\uFF08\u5BBF\u4E3B 0.2.0-rc.2 \u6E90\u7801\u6838\u5B9E\uFF1A\u542F\u52A8\u811A\u672C toggleAttribute \u5199\u5165\uFF0C\n   \u552F\u4E00\u660E\u6697\u5224\u636E\uFF1B\u63D2\u4EF6\u7981\u6B62\u7528 prefers-color-scheme \u2014\u2014 \u5B83\u8DDF\u7684\u662F\u7CFB\u7EDF\u3001\u4E0D\u662F\u7528\u6237\u5728\u5BBF\u4E3B\u91CC\u7684\u9009\u62E9\uFF09\u3002\n   \u4E0B\u9762\u53EA\u653E alias \u8868\u8FBE\u4E0D\u4E86\u7684\u300C\u56FA\u5B9A\u4E2D\u6027\u9762\u300D\uFF1B\u989C\u8272\u82E5\u80FD\u9760 alias \u81EA\u52A8\u8DDF\u968F\uFF0C\u4E00\u5F8B\u4E0D\u8981\u5199\u5728\u8FD9\u91CC\u3002 */\nbody[data-ds-dark-theme]{\n  --dshpc-solid:var(--dsw-static-neutral-900,#0f0f0f);\n  --dshpc-on-solid:var(--dsw-static-neutral-00,#fff);\n  /* \u5B9E\u5FC3\u6309\u94AE hover / active\uFF08\u6697\u8272\u7248\uFF09\uFF1A\u9ED1\u5E95\uFF08\u6D45\u8272\u4E3B\u9898\u7684\u8FD1\u9ED1 \u2192 \u6697\u8272\u4E0B\u7684\u8FD1\u767D\uFF09\u63BA\u9ED1\u538B\u6DF1\uFF1B\n     \u7EA2 / \u7EFF / \u9EC4 / \u84DD\u63BA\u767D\u63D0\u4EAE\u3002\u4E0E\u4EAE\u8272\u6BB5\u65B9\u5411\u76F8\u53CD\uFF0C\u4FDD\u8BC1\u4E24\u79CD\u4E3B\u9898\u4E0B\u300C\u4E00\u773C\u770B\u51FA\u53D8\u4E86\u300D\u3002 */\n  --dshpc-accent-hover:color-mix(in srgb,var(--dshpc-accent) 80%,#000000);\n  --dshpc-accent-active:color-mix(in srgb,var(--dshpc-accent) 66%,#000000);\n  --dshpc-danger-hover:color-mix(in srgb,var(--dshpc-danger) 78%,#ffffff);\n  --dshpc-danger-active:color-mix(in srgb,var(--dshpc-danger) 64%,#ffffff);\n  --dshpc-success-hover:color-mix(in srgb,var(--dshpc-success) 78%,#ffffff);\n  --dshpc-success-active:color-mix(in srgb,var(--dshpc-success) 64%,#ffffff);\n  --dshpc-warning-hover:color-mix(in srgb,var(--dshpc-warning) 78%,#ffffff);\n  --dshpc-warning-active:color-mix(in srgb,var(--dshpc-warning) 64%,#ffffff);\n  --dshpc-business-hover:color-mix(in srgb,var(--dshpc-business) 78%,#ffffff);\n  --dshpc-business-active:color-mix(in srgb,var(--dshpc-business) 64%,#ffffff);\n  /* \u6697\u8272 hover \u63BA\u767D 14% / active 24%\uFF08\u5BF9\u9F50\u4E0A\u9762 2026-10-18 \u7684\u52A0\u91CD\u62CD\u677F\uFF09\u3002rgba \u515C\u5E95\u884C\u540C\u4E0A\u3002 */\n  --dshpc-hover:rgba(255,255,255,.14);\n  --dshpc-active:rgba(255,255,255,.24);\n  /* \u5206\u6BB5\u8F68\u9053\uFF08\u6697\u8272\u7248\uFF09\uFF1A\u767D 10%\u2014\u2014\u6BD4 hover \u6DE1\u4E00\u6863\uFF0C\u9009\u4E2D\u4EAE\u7247\u624D\u8DF3\u5F97\u51FA\u3002 */\n  --dshpc-seg-track:rgba(255,255,255,.10);\n  --dshpc-plate:var(--dsw-static-neutral-850,#212123);\n  --dshpc-plate-hover:var(--dsw-static-neutral-800,#292929);\n  --dshpc-icon-plate:rgba(255,255,255,.05);\n  /* \u6697\u8272\u4E3B\u9898**\u53CD\u8FC7\u6765**\uFF1A\u8868\u5934\u8981\u6BD4\u5361\u7247\u9762**\u4EAE**\u3001\u6BD4\u6591\u9A6C\u7EB9\u518D**\u6D45\u4E00\u6863**\uFF08\u7528\u6237\uFF1A\u7EAF\u9ED1\u80CC\u666F\u6CA1\u6CD5\u770B\uFF09\u3002 */\n  --dshpc-head-bg:var(--dshpc-surface-2);\n  /* \u6697\u8272\u5E95\u677F**\u5FAE\u4EAE**\uFF1Bhover **\u66F4\u4EAE**\uFF08\u539F\u5148 hover \u53D6 plate-hover \u53CD\u800C\u66F4\u6DE1 \u21D2 \u9F20\u6807\u79FB\u4E0A\u53BB\u5C31\u6CA1\u4E86\uFF09\u3002 */\n  --dshpc-chip-bg:rgba(255,255,255,.08);\n  --dshpc-chip-bg-hover:rgba(255,255,255,.16);\n  /* \u6697\u8272\u4E0B\u84DD\u8272\u8981\u66F4\u4EAE\u3001\u900F\u660E\u5EA6\u7565\u9AD8\u624D\u538B\u5F97\u4F4F\u6DF1\u5E95\u3002 */\n  --dshpc-open-bg:rgba(96,165,250,.18);\n  --dshpc-open-bg-soft:rgba(96,165,250,.08);\n  --dshpc-card-hover:rgba(96,165,250,.13);\n  /* \u8BED\u4E49\u8272**\u6D45\u5E95**\uFF08\u6DF1\u8272\u7248\uFF09\uFF1A\u7528\u6237\u5ACC\u6DF1\u8272\u7684\u7EFF / \u7EA2\u300C\u6709\u70B9\u6DF1\u300D\u21D2 \u538B\u5230 **5%**\uFF08\u6D45\u8272\u6BB5\u662F 8%\uFF09\uFF0C\n     \u66F4\u8D34\u8FD1\u9762\u677F\u5E95\u8272\u3001\u5B58\u5728\u611F\u66F4\u5F31\uFF1B\u5757\u5E95\u4E0E\u72B6\u6001\u8272\u7AD6\u6761\u4ECD\u540C\u6E90\uFF08\u7AD6\u6761\u662F\u5B9E\u8272\uFF0C\u4E0D\u53D7\u8FD9\u6761\u5F71\u54CD\uFF09\u3002 */\n  --dshpc-success-soft:color-mix(in srgb,var(--dshpc-success) 5%,transparent);\n  --dshpc-warning-soft:color-mix(in srgb,var(--dshpc-warning) 5%,transparent);\n  --dshpc-danger-soft:color-mix(in srgb,var(--dshpc-danger) 5%,transparent);\n  --dshpc-business-soft:color-mix(in srgb,var(--dshpc-business) 5%,transparent);\n  /* \u300C\u9009\u4E2D\u9762\u300D\uFF08\u6DF1\u8272\u7248\uFF0C2026-10-06\uFF09\uFF1A\u63BA **~40% \u80CC\u666F\u8272**\uFF08--dshpc-surface-base\uFF09\u21D2 \u65E0\u9650\u63A5\u8FD1\u9875\u9762\u80CC\u666F\u7684\u9ED1\u3001\n     \u53EA\u6BD4\u80CC\u666F\u7565\u6DF1\u4E00\u70B9\u70B9\uFF08\u7528\u6237\uFF1A\u6DF1\u8272\u4E0B\u5C55\u5F00\u533A\u538B\u7740\u4EFB\u52A1\u900F\u660E\u7EFF\u4F1A\u53D1\u7070\uFF0C\u5E95\u8272\u8981\u5C3D\u91CF\u8D34\u8FD1\u80CC\u666F\u624D\u4E0D\u663E\u7070\uFF09\u3002\n     \u26A0\uFE0F \u6DF1\u8272\u4E0B\u4E0D\u80FD\u63BA\u6587\u5B57\u8272 \u2014\u2014 \u90A3\u662F\u767D\uFF0C\u4F1A\u53D8\u4EAE\uFF0C\u9009\u4E2D\u53CD\u800C\u6BD4\u672C\u6708\u65E5\u671F\u6D45\u3002 */\n  --dshpc-selected-bg:color-mix(in srgb,var(--dshpc-surface-1) 60%,var(--dshpc-surface-base));\n  /* \u4EFB\u52A1\u65E5\u7A0B\u9875\u672C\u6708\u683C\u7684\u9ED8\u8BA4\u5E95\uFF08\u6DF1\u8272\u7248\uFF0C2026-10-06\uFF09\uFF1A\u6DF1\u7684\u3001\u5E26\u70B9\u7070\u84DD\u7684\u6697\u8272\uFF08\u7528\u6237\u7ED9\u7684\u53C2\u8003\u56FE \u2248 #23262e\uFF09\uFF0C\n     \u6BD4\u539F\u6765\u7684\u5361\u7247\u9762\u66F4\u6C89\u3001\u66F4\u504F\u84DD\u7070\uFF1B\u9009\u4E2D\u683C\u4ECD\u8D70 --dshpc-selected-bg\uFF08\u66F4\u6697\u4E00\u6863\uFF09\uFF0C\u5C42\u7EA7\u4E0D\u53D8\u3002 */\n  --dshpc-cal-cell-bg:#23262e;\n  /* \u4EFB\u52A1\u65E5\u7A0B\u9875\u672C\u6708\u683C hover \u5E95\uFF08\u6DF1\u8272\u6BB5\uFF0C2026-10-06\uFF09\uFF1A\u539F\u5148\u8D70 --dshpc-hover\uFF08\u5BBF\u4E3B\u6D45\u8272\u53E0\u52A0\uFF09\u5728\u6DF1\u5E95\u4E0A\u663E\u5F97\n     \u300C\u7070\u53D1\u4EAE\u300D\uFF0C\u4E0D\u597D\u770B \u21D2 \u6362\u6210\u66F4\u8D34\u5E95\u7684\u84DD\u8C03\u5FAE\u4EAE\uFF08\u4E0E open-bg-soft \u540C\u65CF\uFF09\uFF0Chover \u65F6\u4E0D\u523A\u773C\u3001\u53C8\u6709\u53CD\u9988\u3002 */\n  --dshpc-cal-cell-hover:rgba(96,165,250,.12);\n  /* \u4EFB\u52A1\u65E5\u7A0B\u9875\u5C55\u5F00\u9762\u677F\u5E95\uFF08\u6DF1\u8272\u6BB5\uFF0C2026-10-06 \u7EED\uFF09\uFF1A\u4E0E\u539F selected-bg \u6697\u503C\u4E00\u81F4\uFF0C\u6DF1\u8272 UI \u4E0D\u52A8 */\n  --dshpc-cal-panel-bg:color-mix(in srgb,var(--dshpc-surface-1) 60%,var(--dshpc-surface-base));\n}\n';

// dist/design/style-kit.js
var CSS_PREFIX = "dshpc";
var TOKENS_DOMAIN = "tokens";
function createStyleKit(options) {
  const { id } = options;
  if (id === "")
    throw new Error("dsh-plugin-core/design: id \u4E0D\u80FD\u4E3A\u7A7A");
  const tokensCss = TOKENS_CSS_TEMPLATE;
  const domains = /* @__PURE__ */ new Map();
  let tag = null;
  let dirty = true;
  const composeCss = () => {
    const entries2 = [...domains.entries()];
    entries2.sort((a, b) => a[0] === TOKENS_DOMAIN ? -1 : b[0] === TOKENS_DOMAIN ? 1 : 0);
    return entries2.map(([, css]) => css).join("\n");
  };
  const flush2 = () => {
    if (tag === null)
      return;
    tag.textContent = composeCss();
    dirty = false;
  };
  const ensureStyles = () => {
    if (typeof document === "undefined")
      return;
    if (tag === null || !tag.isConnected) {
      const head = document.head;
      if (head === null)
        return;
      const found = document.getElementById(id);
      if (found !== null)
        tag = found;
      else {
        const el = document.createElement("style");
        el.id = id;
        head.appendChild(el);
        tag = el;
      }
      dirty = true;
    }
    if (dirty)
      flush2();
  };
  const registerStyle = (domain, css) => {
    if (domains.get(domain) === css)
      return;
    domains.set(domain, css);
    dirty = true;
    if (tag?.isConnected === true)
      flush2();
  };
  const dispose = () => {
    if (tag?.isConnected === true)
      tag.remove();
    tag = null;
    domains.clear();
    dirty = true;
  };
  return {
    id,
    tokensCss,
    cssVar: (name) => `--${CSS_PREFIX}-${name}`,
    registerStyle,
    ensureStyles,
    dispose,
    applyStyle: (domain, css) => {
      registerStyle(domain, css);
      ensureStyles();
    }
  };
}

// dist/ui/controls/segmented-css.generated.js
var SEGMENTED_CSS = "\n/* \u2500\u2500 \u5206\u6BB5\u63A7\u4EF6 P2 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n   \u7ED3\u6784\u7167\u5144\u5F1F\u9879\u76EE dsh-task-dispatch-table \u7684 Segmented \u76AE\u80A4\uFF08item \u65E0\u8FB9\u6846\u3001hover \u53EA\u63D0\u4EAE\u6587\u5B57\uFF09\uFF0C\n   \u524D\u7F00 / \u53D8\u91CF\u540D\u6362\u6210\u672C\u4ED3\u53E3\u5F84\u3002\u7528\u6237\u989D\u5916\u8981\u7684\u4E24\u5904\uFF08\u5144\u5F1F\u6CA1\u6709\uFF09\uFF1Aweekday \u65B9\u5757\u95F4\u9694\uFF08\u73B0\u4E3A 2px\uFF09\uFF1B\u6BB5\u5185\u4E2D\u6027\u8BA1\u6570 __count\u3002\n   \u26A0\uFE0F 2026-10-19 \u4E24\u6B21\u8BEF\u5224\u5747\u5DF2\u6F84\u6E05\uFF1A\u2460 \u300C\u5BBF\u4E3B\u53EA\u8BA4\u5355\u884C CSS\u300D\u2014\u2014\u5047\uFF0C\u591A\u884C\u4E00\u76F4\u6B63\u5E38\uFF1B\n   \u2461 \u300C\u5BBF\u4E3B\u5403\u6389 token \u5757\u4E4B\u540E\u7B2C\u4E00\u6761\u89C4\u5219\u300D\u2014\u2014\u4E5F\u5047\uFF0C\u771F\u56E0\u662F tokens \u6A21\u677F\u5B57\u7B26\u4E32\u7ED3\u5C3E\u591A\u4E86\u4E00\u4E2A\u53CD\u659C\u6760\uFF0C\n   \u6CE8\u5165\u6587\u672C\u91CC\u7559\u4E0B\u5B57\u9762\u53CD\u5F15\u53F7\uFF0C\u628A\u7D27\u968F\u5176\u540E\u7684\u90A3\u6761\u89C4\u5219\u7684\u9009\u62E9\u5668\u6C61\u67D3\u6389\u4E86\uFF08\u89C1 dsh-host.md \xA79\uFF09\u3002\n   \u6837\u5F0F\u7167\u5E38\u591A\u884C\u4E66\u5199\uFF0C\u4E0D\u5FC5\u538B\u884C\uFF1B\u4E5F\u4E0D\u9700\u8981\u4EFB\u4F55\u300C\u727A\u7272\u89C4\u5219\u300D\u3002 */\n.dshpc-seg{display:inline-flex;align-items:center;gap:2px;padding:2px;border-radius:var(--dshpc-radius-md);background:var(--dshpc-seg-track);}\n.dshpc-seg--default{--seg-track:var(--dshpc-seg-track);--seg-thumb:var(--dshpc-surface-raised);border:0;padding:2px;background:var(--seg-track);}\n.dshpc-seg--inset{--seg-track:var(--dshpc-seg-track);--seg-thumb:var(--dshpc-surface-raised);border:0;padding:3px;background:var(--seg-track);}\n.dshpc-seg__item{appearance:none;display:inline-flex;align-items:center;gap:4px;box-sizing:border-box;height:calc(var(--dshpc-control-h-sm) - 6px);padding:0 12px;border:0;border-radius:var(--dshpc-radius-sm);background:transparent;color:var(--dshpc-fg-2);font-family:inherit;font-size:var(--dshpc-font-xs);font-weight:500;white-space:nowrap;cursor:pointer;flex:none;transition:color var(--dshpc-dur-fast) var(--dshpc-ease),background-color var(--dshpc-dur-fast) var(--dshpc-ease),box-shadow var(--dshpc-dur-fast) var(--dshpc-ease);}\n.dshpc-seg--md .dshpc-seg__item{height:calc(var(--dshpc-control-h-md) - 6px);}\n.dshpc-seg--lg .dshpc-seg__item{height:calc(var(--dshpc-control-h-lg) - 6px);}\n.dshpc-seg__item:hover:not([aria-pressed='true']):not(:disabled){color:var(--dshpc-fg);}\n.dshpc-seg__item[aria-pressed='true']{background:var(--seg-thumb);box-shadow:var(--dshpc-shadow-raised);color:var(--dshpc-fg);font-weight:600;}\n.dshpc-seg__item:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:-2px;}\n.dshpc-seg__item:disabled{cursor:default;opacity:.4;}\n/* \u6BB5\u5185\u89D2\u6807\uFF08\u5982\u300C\u5F02\u5E38\u300D\u7684\u6570\u91CF\uFF09\uFF1A\u8BED\u4E49\u8272\u5B9E\u9762 + \u53CD\u767D\u5B57\uFF0C0 \u7531\u7EC4\u4EF6\u4FA7\u4E0D\u6E32\u67D3\u3002\u5FC5\u987B\u662F\u6B63\u5706\uFF08\u7528\u6237 2026-10-03\uFF09\u3002 */\n.dshpc-seg__badge{display:inline-flex;align-items:center;justify-content:center;flex:none;width:16px;height:16px;padding:0;overflow:hidden;border-radius:50%;background:var(--dshpc-danger);color:var(--dshpc-on-signal);font-size:10px;line-height:16px;font-weight:500;font-variant-numeric:tabular-nums;}\n/* \u6BB5\u5185\u4E2D\u6027\u8BA1\u6570\uFF08\u5982\u7B5B\u9009\u6761\u300C\u5168\u90E8 11\u300D\uFF09\uFF1A\u7EAF\u6587\u5B57\u3001\u65E0\u5E95\u65E0\u8FB9\uFF08\u5BF9\u9F50 task-ledger .dtl-seg__num \u62CD\u677F\u53E3\u5F84\uFF09\uFF1B0 \u7531\u7EC4\u4EF6\u4FA7\u4E0D\u6E32\u67D3\u3002 */\n.dshpc-seg__count{display:inline;flex:none;margin-left:3px;padding:0;border:0;border-radius:0;background:none;color:var(--dshpc-fg-3);font-size:10px;line-height:1;font-weight:400;font-variant-numeric:tabular-nums;}\n/* block\uFF1A\u6491\u6EE1\u7236\u5BBD\uFF08\u8868\u5355\u884C\u7528\uFF09\uFF0C\u5404\u6BB5\u7B49\u5206 */\n.dshpc-seg--block{display:flex;width:100%;}\n.dshpc-seg--block .dshpc-seg__item{flex:1 1 auto;justify-content:center;}\n/* weekday\uFF1A\u661F\u671F\u591A\u9009\u65B9\u5757\u3002\u57FA\u7840\u63D2\u4EF6\u7684\u7279\u6B8A\u5316\u5B9A\u5236\uFF08\u7528\u6237 2026-10-01\uFF1A\u539F WeekdayPicker \u5373\u300C\u84DD\u5E95 + \u8FD1\u4F3C\u65B9\u5F62\u300D\uFF09\uFF1A\n   \u6BCF\u683C\u6B63\u65B9\u5F62\uFF08\u5BBD = \u6BB5\u9AD8\uFF09\u3001\u9009\u4E2D\u54C1\u724C\u84DD\u53CD\u767D\u5B57\u3001**\u65E0\u5916\u63CF\u8FB9**\uFF082026-10-18 \u91CD\u7533\uFF09\u3001\n   \u65B9\u5757\u4E4B\u95F4\u95F4\u8DDD gap:2px\uFF082026-10-20 \u7528\u6237\u5B9A\u7A3F\uFF1A\u65B9\u5757\u6539\u5C0F\u540E 6px \u663E\u5F97\u592A\u5BBD\u300210-18 \u66FE\u4ECE 2px \u653E\u5BBD\u5230 6px\uFF0C\n   \u4E24\u6B21\u90FD\u662F\u7528\u6237\u62CD\u677F \u2014\u2014 \u522B\u81EA\u4F5C\u4E3B\u5F20\u6539\u56DE\u53BB\uFF09\u3002 */\n.dshpc-seg--weekday{--seg-track:var(--dshpc-seg-track);gap:2px;border:0;padding:3px;background:var(--seg-track);}\n.dshpc-seg--weekday .dshpc-seg__item{width:calc(var(--dshpc-control-h-lg) - 8px);padding:0;justify-content:center;}\n.dshpc-seg--weekday .dshpc-seg__item[aria-pressed='true']{background:var(--dshpc-business);color:var(--dshpc-fg-inverse);box-shadow:var(--dshpc-shadow-raised);}\n\n/* \u2500\u2500 bordered \u5916\u6846\uFF082026-10-20 \u7528\u6237\u8981\u7684\u7B2C\u4E8C\u79CD\u6A21\u5F0F\uFF09\uFF1A**\u53EA\u5728\u6700\u5916\u9762\u5957\u4E00\u5708 1px \u63CF\u8FB9**\uFF0C\n   \u91CC\u9762\u4E00\u6982\u4E0D\u52A8 \u2014\u2014 \u9009\u4E2D\u6BB5\u7684\u586B\u5145\u8272 / \u9634\u5F71 / \u6587\u5B57\u8272\u5168\u90E8\u4FDD\u6301\u5404\u81EA\u53D8\u4F53\u539F\u672C\u7684\u6837\u5B50\n   \uFF08default \u7684\u7070\u9762\u3001weekday \u7684\u84DD\u9762\u90FD\u7167\u65E7\uFF09\uFF0C\u8FD9\u91CC\u4E0D\u5199\u4EFB\u4F55\u9488\u5BF9 __item \u7684\u89C4\u5219\u3002\n   \u603B\u9AD8\u5FC5\u987B\u4E0E\u65E0\u6846\u7248\u9010\u50CF\u7D20\u4E00\u81F4\uFF1Aborder 1px\xD72 \u7531\u5404\u53D8\u4F53\u7684 padding \u5404\u8BA9 1px \u62B5\u6D88\n   \uFF08default 2\u21921\u3001inset/weekday 3\u21922\uFF09\uFF0C\u6240\u4EE5\u4E09\u79CD\u53D8\u4F53 \xD7 bordered \u7684\u603B\u9AD8\u90FD\u4E0E\u65E0\u6846\u7248\u76F8\u540C\u3002 */\n.dshpc-seg--bordered{border:1px solid var(--dshpc-border);padding:1px;}\n.dshpc-seg--bordered.dshpc-seg--inset{padding:2px;}\n.dshpc-seg--bordered.dshpc-seg--weekday{padding:2px;}\n\n@media (prefers-reduced-motion: reduce){.dshpc-seg__item{transition:none;}}\n";

// dist/ui/controls/button-css.generated.js
var BUTTON_CSS = '\n/* \u2500\u2500 \u6309\u94AE / \u56FE\u6807\u94AE P2 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n   \u4E0E Segmented \u540C\u4E00\u6761\u9AD8\u5EA6\u7EAA\u5F8B\uFF1A--dshpc-control-h-sm(24) / -md(28) / -lg(32)\uFF0C\n   \u6709\u8FB9\u6846\u7684 variant \u7528 1px \u771F\u8FB9\u6846 + \u5185\u90E8 padding \u8865\u56DE\uFF0C**\u6709\u8FB9 / \u65E0\u8FB9\u540C\u9AD8**\u3002\n\n   \u4E09\u6761\u53D7\u63A7\u8F74\uFF082026-10-19 \u91CD\u5199\uFF0C\u5BF9\u9F50\u4E3B\u6D41 UI \u6846\u67B6\u7684\u5206\u7C7B\u53E3\u5F84\uFF09\uFF1A\n     \xB7 variant \u2014\u2014 \u5916\u89C2\u6863 = \u5F62\u6001 + \u8BED\u4E49\u8272\uFF0C\u5171 10 \u6863\uFF1A\n         primary / secondary / outline / ghost / danger / success / warning / info /\n         danger-outline\uFF08\u7EA2\u5B57\u63CF\u8FB9\uFF09/ link\uFF08\u884C\u5185\u94FE\u63A5\uFF09\n     \xB7 size \u2014\u2014 sm / md / lg\n     \xB7 block \u2014\u2014 \u6491\u6EE1\u7236\u5BBD\n   \u6BCF\u4E00\u6863**\u53EA\u586B 5 \u4E2A\u5C40\u90E8\u53D8\u91CF**\uFF08--btn-bg / -fg / -border / -bg-hover / -bg-active\uFF09\uFF0C\n   \u7ED3\u6784\u4E0E\u4EA4\u4E92\u53EA\u6709\u4E0A\u9762\u8FD9\u4E00\u4EFD\uFF1B\u4EFB\u4F55\u6863\u4F4D\u90FD\u4E0D\u8BB8\u518D\u5199\u4E00\u904D display/height/padding\u3002\n   \u81EA\u5B9A\u4E49\u989C\u8272\uFF08Button \u7684 color \u53C2\u6570\uFF09\u540C\u6837\u53EA\u8986\u76D6\u8FD9 5 \u4E2A\u53D8\u91CF\uFF08token \u8986\u76D6\uFF0C\u4E0D\u662F\u65B0\u76AE\u80A4\uFF09\u3002\n\n   \u26A0\uFE0F hover \u4E0D\u518D\u7528 opacity \u538B\u4E00\u5C42\uFF08\u7528\u6237 2026-10-19\uFF1A\u300C\u9ED1\u8272\u548C\u7EA2\u8272\u7684\u6309\u94AE\u79FB\u4E0A\u53BB\u53D8\u5316\u592A\u5C0F\uFF0C\n   \u5B8C\u5168\u611F\u89C9\u4E0D\u5230\u989C\u8272\u53D8\u4E86\u300D\uFF09\u21D2 \u8D70 --dshpc-*-hover / -active \u7684\u660E\u786E\u6DF7\u8272\uFF0C\u89C1 tokens-css.ts\u3002 */\n.dshpc-btn{--btn-bg:transparent;--btn-fg:var(--dshpc-fg);--btn-border:transparent;--btn-pad:12px;\n  --btn-bg-hover:var(--dshpc-hover);--btn-bg-active:var(--dshpc-active);--btn-fg-hover:var(--btn-fg);\n  appearance:none;display:inline-flex;align-items:center;justify-content:center;gap:6px;\n  box-sizing:border-box;border:1px solid var(--btn-border);border-radius:var(--dshpc-radius-md);\n  background-color:var(--btn-bg);color:var(--btn-fg);font-family:inherit;font-weight:500;white-space:nowrap;cursor:pointer;\n  transition:background-color var(--dshpc-dur-fast) var(--dshpc-ease),border-color var(--dshpc-dur-fast) var(--dshpc-ease),color var(--dshpc-dur-fast) var(--dshpc-ease),box-shadow var(--dshpc-dur-fast) var(--dshpc-ease),transform var(--dshpc-dur-fast) var(--dshpc-ease);}\n.dshpc-btn--sm{--btn-pad:10px;height:var(--dshpc-control-h-sm);padding:0 var(--btn-pad);font-size:var(--dshpc-font-sm);line-height:1;}\n.dshpc-btn--md{--btn-pad:12px;height:var(--dshpc-control-h-md);padding:0 var(--btn-pad);font-size:var(--dshpc-font-md);line-height:1;}\n.dshpc-btn--lg{--btn-pad:14px;height:var(--dshpc-control-h-lg);padding:0 var(--btn-pad);font-size:var(--dshpc-font-md);line-height:1;}\n/* block\uFF1A\u6491\u6EE1\u7236\u5BBD\uFF08\u8868\u5355\u5E95\u680F / \u62BD\u5C49\u5E95\u90E8\u7684\u4E3B\u64CD\u4F5C\uFF09 */\n.dshpc-btn--block{display:flex;width:100%;}\n/* block + \u524D\u7F6E\u56FE\u6807 \u21D2 \u6587\u5B57\u89C6\u89C9\u5C45\u4E2D\uFF082026-10-19 \u7528\u6237\u70B9\u540D\uFF09\uFF1A\n   \u5185\u5BB9\u7EC4 [\u56FE\u6807 + \u95F4\u8DDD + \u6587\u5B57] \u6574\u4F53\u5728\u76D2\u5185\u5C45\u4E2D\u65F6\uFF0C**\u6587\u5B57**\u7684\u4E2D\u5FC3\u4F1A\u88AB\u56FE\u6807\u63A8\u53F3\u534A\u683C\u3002\n   \u628A\u53F3\u5185\u8FB9\u8DDD\u8865\u4E0A\u300C\u56FE\u6807\u5BBD + \u95F4\u8DDD\u300D\uFF0C\u53EF\u7528\u76D2\u968F\u4E4B\u5DE6\u79FB\u540C\u91CF \u21D2 \u6587\u5B57\u843D\u56DE\u89C6\u89C9\u4E2D\u5FC3\uFF0C\u56FE\u6807\u8D34\u5DE6\u4FA7\u3002\n   \u56FE\u6807\u5BBD\u6309 1.2em \u4F30\uFF08\u5B98\u65B9\u56FE\u6807 14/16px vs \u5B57\u53F7 12/13px\uFF09\uFF0Cem \u968F\u5B57\u53F7\u6863\u81EA\u52A8\u7F29\u653E\u3002 */\n.dshpc-btn--block.dshpc-btn--icon-start{padding-right:calc(var(--btn-pad) + 1.2em + 6px);}\n.dshpc-btn__icon,.dshpc-btn__icon-end{display:inline-flex;align-items:center;justify-content:center;flex:none;line-height:0;}\n.dshpc-btn__icon svg,.dshpc-btn__icon-end svg{display:block;margin:0;}\n/* loading\uFF1A\u4E0D\u6362 DOM \u7ED3\u6784\uFF0C\u53EA\u5728\u6587\u6848\u524D\u63D2\u4E00\u4E2A\u540C\u8272\u5C0F\u5708\u3002\n   \u26A0\uFE0F 2026-10-20 \u6539\u753B\u6CD5\uFF1A\u539F\u6765\u662F border:1.5px \u52A0 border-radius:999px \u753B\u7684\u73AF \u2014\u2014 \u771F\u673A\u5B9E\u6D4B computed\n   radius \u5C31\u662F 999px\u3001\u5BBD\u9AD8\u90FD\u662F 12px\uFF08\u6CA1\u88AB\u4EFB\u4F55\u6837\u5F0F\u8986\u76D6\uFF09\uFF0C\u770B\u7740\u5374"\u50CF\u5706\u89D2\u65B9"\uFF0C\u539F\u56E0\u662F**\u6B21\u50CF\u7D20\u8FB9\u6846\n   \uFF081.5px\uFF09\u5728 12px \u8FD9\u4E48\u5C0F\u7684\u5706\u4E0A\u88AB\u6297\u952F\u9F7F\u63D2\u503C\u62C9\u6BDB**\u3002\u6539\u7528 SVG \u77E2\u91CF\u5F27\uFF1A\u4EFB\u610F DPR \u4E0B\u90FD\u662F\u771F\u5706\u3002 */\n.dshpc-btn__spinner{display:block;flex:none;width:12px;height:12px;\n  animation:dshpc-btn-spin .7s linear infinite;}\n/* shortcut: 12px \u662F\u56FA\u5B9A\u503C\uFF0C\u4E0D\u968F\u6309\u94AE\u5B57\u53F7\u7F29\u653E\uFF1B\u8981\u66F4\u5927\u5C31\u6539\u8FD9\u4E00\u5904\u3002 */\n@keyframes dshpc-btn-spin{to{transform:rotate(360deg)}}\n\n/* \u4EA4\u4E92\u6001\uFF1A\u989C\u8272\u53D8\u5316\u5199\u5728\u53D8\u91CF\u4E0A \u21D2 \u6240\u6709\u6863\u4F4D\u4E00\u6B21\u751F\u6548\uFF0C\u4E14\u53D8\u5316\u5E45\u5EA6\u7531 token \u51B3\u5B9A\uFF08\u591F\u660E\u663E\uFF09 */\n.dshpc-btn:hover:not(:disabled){background-color:var(--btn-bg-hover);color:var(--btn-fg-hover);}\n.dshpc-btn:active:not(:disabled){background-color:var(--btn-bg-active);transform:translateY(1px);}\n.dshpc-btn:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:2px;}\n.dshpc-btn:disabled{cursor:default;opacity:.5;}\n\n.dshpc-btn--primary{--btn-bg:var(--dshpc-accent);--btn-fg:var(--dshpc-fg-inverse);\n  --btn-bg-hover:var(--dshpc-accent-hover);--btn-bg-active:var(--dshpc-accent-active);}\n/* secondary\uFF1A\u4E2D\u6027\u5B9E\u5FC3\uFF08\u7070\u9762\uFF09\uFF0C\u7528\u4E8E\u300C\u53D6\u6D88 / \u6B21\u8981\u300D\u8FD9\u7C7B\u4E0E\u4E3B\u64CD\u4F5C\u5E76\u6392\u7684\u6309\u94AE */\n.dshpc-btn--secondary{--btn-bg:var(--dshpc-hover);--btn-fg:var(--dshpc-fg);\n  --btn-bg-hover:var(--dshpc-active);--btn-bg-active:var(--dshpc-active);}\n.dshpc-btn--outline{--btn-bg:var(--dshpc-surface-1);--btn-border:var(--dshpc-border-strong);\n  --btn-bg-hover:var(--dshpc-hover);--btn-bg-active:var(--dshpc-active);}\n.dshpc-btn--ghost{--btn-fg:var(--dshpc-fg-2);--btn-fg-hover:var(--dshpc-fg);\n  --btn-bg-hover:var(--dshpc-hover);--btn-bg-active:var(--dshpc-active);}\n.dshpc-btn--danger{--btn-bg:var(--dshpc-danger);--btn-fg:var(--dshpc-on-signal);\n  --btn-bg-hover:var(--dshpc-danger-hover);--btn-bg-active:var(--dshpc-danger-active);}\n.dshpc-btn--success{--btn-bg:var(--dshpc-success);--btn-fg:var(--dshpc-on-signal);\n  --btn-bg-hover:var(--dshpc-success-hover);--btn-bg-active:var(--dshpc-success-active);}\n.dshpc-btn--warning{--btn-bg:var(--dshpc-warning);--btn-fg:var(--dshpc-on-warning);\n  --btn-bg-hover:var(--dshpc-warning-hover);--btn-bg-active:var(--dshpc-warning-active);}\n.dshpc-btn--info{--btn-bg:var(--dshpc-business);--btn-fg:var(--dshpc-on-signal);\n  --btn-bg-hover:var(--dshpc-business-hover);--btn-bg-active:var(--dshpc-business-active);}\n/* danger-outline\uFF1A\u7EA2\u5B57\u63CF\u8FB9\uFF08\u7834\u574F\u6027\u6B21\u8981\u64CD\u4F5C\uFF0C\u5982\u5361\u7247\u4E0A\u7684\u300C\u5220\u9664\u300D\uFF09\u3002\n   \u26A0\uFE0F \u65E7\u4FEE\u9970\u7C7B danger-ink \u4FDD\u7559\u4E3A\u522B\u540D\uFF08\u6D88\u8D39\u65B9\u53EF\u80FD\u8FD8\u5728\u6302\uFF09\uFF0C\u4E24\u8005\u540C\u4E00\u5957\u76AE\u80A4\u3002 */\n.dshpc-btn--danger-outline,.dshpc-btn--danger-ink{--btn-border:var(--dshpc-danger);--btn-fg:var(--dshpc-danger);\n  --btn-fg-hover:var(--dshpc-danger);--btn-bg-hover:var(--dshpc-danger-soft);--btn-bg-active:var(--dshpc-danger-soft);}\n/* link\uFF1A\u884C\u5185\u6587\u5B57\u94FE\u63A5\u578B\uFF08\u4F1A\u8BDD / \u4EA7\u51FA\u6587\u4EF6\u540D\uFF09\uFF0C\u65E0\u5E95\u65E0\u8FB9\u3001\u54C1\u724C\u84DD\u3001hover \u4E0B\u5212\u7EBF */\n.dshpc-btn--link{--btn-fg:var(--dshpc-link);--btn-fg-hover:var(--dshpc-link);\n  --btn-bg-hover:transparent;--btn-bg-active:transparent;\n  height:auto;padding:0;border:0;background:none;font-weight:400;text-align:left;}\n.dshpc-btn--link:hover:not(:disabled){text-decoration:underline;}\n\n/* \u56FE\u6807\u94AE\uFF1A\u7EAF\u56FE\u6807\uFF0C\u65B9\u5F62\uFF1B\u5C3A\u5BF8\u6863\u7684\u5BBD\u9AD8\u4E0E\u540C\u6863\u6587\u5B57\u6309\u94AE\u7B49\u9AD8 */\n.dshpc-iconbtn{appearance:none;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;\n  border:1px solid transparent;border-radius:var(--dshpc-radius-sm);background:transparent;color:var(--dshpc-fg-2);\n  font-family:inherit;cursor:pointer;flex:none;\n  transition:background-color var(--dshpc-dur-fast) var(--dshpc-ease),border-color var(--dshpc-dur-fast) var(--dshpc-ease),color var(--dshpc-dur-fast) var(--dshpc-ease),opacity var(--dshpc-dur-fast) var(--dshpc-ease);}\n.dshpc-iconbtn--sm{width:var(--dshpc-control-h-sm);height:var(--dshpc-control-h-sm);font-size:var(--dshpc-font-sm);}\n.dshpc-iconbtn--md{width:var(--dshpc-control-h-md);height:var(--dshpc-control-h-md);font-size:var(--dshpc-font-md);}\n.dshpc-iconbtn--lg{width:var(--dshpc-control-h-lg);height:var(--dshpc-control-h-lg);font-size:var(--dshpc-font-md);}\n.dshpc-iconbtn--plain{color:var(--dshpc-fg-2);}\n.dshpc-iconbtn--outline{background:var(--dshpc-surface-1);border-color:var(--dshpc-border);color:var(--dshpc-fg-2);}\n.dshpc-iconbtn--danger{color:var(--dshpc-danger);}\n.dshpc-iconbtn:hover:not(:disabled){background:var(--dshpc-hover);color:var(--dshpc-fg);}\n.dshpc-iconbtn--danger:hover:not(:disabled){background:var(--dshpc-danger-soft);color:var(--dshpc-danger);}\n.dshpc-iconbtn:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:2px;}\n.dshpc-iconbtn:disabled{cursor:default;opacity:.4;}\n\n/* \u2500\u2500 \u884C\u5F0F\u6587\u4EF6\u6309\u94AE\uFF08\u56FE\u6807 + \u6587\u4EF6\u540D\uFF09P2\uFF1A**\u5168\u7AD9\u552F\u4E00\u5B9E\u73B0**\uFF082026-10-04 \u6536\u7F16\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n   \u7528\u9014\uFF1A\u300C\u4EA7\u51FA\u7269 / \u9644\u4EF6\u300D\u90A3\u79CD**\u4E00\u884C\u4E00\u4E2A\u6587\u4EF6**\u7684\u6E05\u5355\u9879\uFF08\u57FA\u7840\u4FE1\u606F\u53F3\u680F\u4EA7\u51FA\u7269\u6E05\u5355\u3001\u9644\u4EF6\u533A\u3001\n   \u6267\u884C\u8BB0\u5F55\u9875\u7684\u5C55\u5F00\u533A\uFF09\u3002\u5E73\u65F6\u900F\u660E\u3001**\u9F20\u6807\u79FB\u4E0A\u53BB\u624D\u51FA\u6D45\u5E95**\uFF08\u6CBF\u7528\u7528\u6237 2026-10-03 \u5B9A\u7684\u89C2\u611F\uFF09\u3002\n   \u4E24\u4E2A\u5F62\u6001\u4FEE\u9970\u7C7B\uFF1A\n     --block   \u6491\u6EE1\u7236\u5BBD\uFF08\u6E05\u5355\u91CC\u4E00\u9879\u4E00\u884C\uFF09\n     --inline  \u5185\u5BB9\u5BBD\uFF08\u8DDF\u5728\u6587\u5B57\u540E\u5934\uFF0C\u5982\u9644\u4EF6\u884C\uFF09\n   \u6536\u7F16\u539F\u56E0\uFF1A\u8FD9\u4EFD\u76AE\u80A4\u6B64\u524D\u53EA\u5199\u5728 task-list.tsx \u7684 TASK_LIST_CSS \u91CC\uFF08\u65E7\u540D .dshpc-info-out\uFF09\uFF0C\n   \u6267\u884C\u8BB0\u5F55\u9875\u5C55\u5F00\u533A\u8981\u7528\u540C\u4E00\u79CD\u89C2\u611F \u21D2 \u4E0A\u63D0\u57FA\u7840\u5C42\uFF0C\u907F\u514D\u518D\u51FA\u73B0\u300C\u5404\u5199\u4E00\u4EFD\u5916\u89C2\u300D\uFF08\u540C\u540D\u4E0D\u540C\u76AE\u7684\u5751\u521A\u8E29\u8FC7\uFF09\u3002 */\n.dshpc-filechip{appearance:none;-webkit-appearance:none;border:0;border-radius:var(--dshpc-radius-xs);\n  background:transparent;color:var(--dshpc-fg);font:inherit;text-align:left;cursor:pointer;min-width:0;\n  transition:background-color var(--dshpc-dur) var(--dshpc-ease);}\n.dshpc-filechip:hover:not(:disabled){background:var(--dshpc-chip-bg);}\n.dshpc-filechip:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:1px;}\n.dshpc-filechip:disabled{cursor:default;background:transparent;color:var(--dshpc-fg-3);}\n.dshpc-filechip--block{display:flex;align-items:center;gap:6px;width:100%;box-sizing:border-box;\n  padding:4px 6px;font-size:var(--dshpc-font-xs);}\n.dshpc-filechip--inline{display:inline-flex;align-items:center;gap:4px;padding:2px 6px;font-size:var(--dshpc-font-sm);}\n\n@media (prefers-reduced-motion: reduce){.dshpc-btn,.dshpc-iconbtn,.dshpc-filechip{transition:none;}}\n';

// dist/ui/controls/field-css.generated.js
var FIELD_CSS = "\n/* \u2500\u2500 \u5B57\u6BB5 + \u95EE\u53F7\u63D0\u793A\uFF08hint \u53C2\u6570\u5185\u7F6E\uFF09 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n/* \u63A7\u4EF6 + FieldHint \u540C\u4E00\u884C\uFF1Bhint \u7248\u7531\u7EC4\u4EF6\u81EA\u5DF1\u5305\uFF0C\u8C03\u7528\u65B9\u53EA\u4F20 hint \u5B57\u7B26\u4E32\u3002\n   \u94FA\u6EE1\u578B\u63A7\u4EF6\uFF08input/textarea\uFF09\u8FDB\u5305\u540E\u6539\u5403 flex \u5F39\u6027\uFF0C\u8BA9\u4F4D\u7ED9\u95EE\u53F7\u3002 */\n.dshpc-fieldwrap{display:flex;align-items:center;gap:6px;min-width:0;max-width:100%;}\n.dshpc-fieldwrap--inline{display:inline-flex;}\n.dshpc-fieldwrap > .dshpc-input,.dshpc-fieldwrap > .dshpc-textarea{flex:1 1 auto;width:auto;min-width:0;}\n/* \u591A\u884C\u8F93\u5165\uFF1A\u95EE\u53F7\u9489\u5728**\u53F3\u4E0B\u89D2**\uFF082026-10-20 \u7528\u6237\uFF1A\u4E0D\u8981\u5782\u76F4\u5C45\u4E2D\uFF09\uFF0C\u6587\u672C\u533A\u5E95\u90E8\u7559\u51FA\u5B83\u7684\u4F4D\u7F6E\u3002\n   \u26A0\uFE0F \u8FD9\u4E00\u6863\u5FC5\u987B\u628A textarea \u7684\u5BBD\u5EA6\u8FD8\u56DE\u53BB\uFF08\u4E0A\u9762\u90A3\u6761 flex \u8BA9\u4F4D\u89C4\u5219\u4F1A\u628A\u5B83\u7F29\u7A84\uFF09\u3002 */\n.dshpc-fieldwrap--block{position:relative;display:block;}\n.dshpc-fieldwrap--block > .dshpc-textarea{width:100%;padding-bottom:24px;}\n.dshpc-fieldwrap--block > .dshpc-hint{position:absolute;right:8px;bottom:6px;}\n\n/* \u2500\u2500 \u8F93\u5165\u7C7B P3 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n/* \u9ED8\u8BA4\u94FA\u6EE1\u5BB9\u5668\uFF08width:100%\uFF0C\u4E0E .dshpc-textarea \u540C\u53E3\u5F84\uFF09\uFF1Ainput \u539F\u751F\u6309 size \u5C5E\u6027\u53D6\u5185\u5728\u5BBD\uFF0C\n   \u4E0D\u94FA\u6EE1 \u21D2 \u8C03\u7528\u65B9\u5957\u5B9A\u5BBD\u58F3\u65F6\u4F1A\u300C\u53F3\u8FB9\u7A7A\u4E00\u622A\u3001\u770B\u7740\u6CA1\u8D34\u53F3\u300D\uFF082026-10-20 \u7528\u6237\u6293\u7684 bug\uFF09\u3002\n   \u8981\u5B9A\u5BBD\u7531\u8C03\u7528\u65B9\u5728\u5916\u9762\u5957\u58F3\u63A7\u5236\uFF08\u5982 192px \u641C\u7D22\u69FD\uFF09\u3002 */\n.dshpc-input{display:block;width:100%;box-sizing:border-box;border:1px solid var(--dshpc-border);border-radius:var(--dshpc-radius-md);\n  background:var(--dshpc-surface-1);color:var(--dshpc-fg);font-family:inherit;outline:none;\n  transition:border-color var(--dshpc-dur-fast) var(--dshpc-ease),box-shadow var(--dshpc-dur-fast) var(--dshpc-ease);}\n.dshpc-input--sm{height:var(--dshpc-control-h-sm);padding:0 8px;font-size:var(--dshpc-font-sm);line-height:var(--dshpc-line-sm);}\n.dshpc-input--md{height:var(--dshpc-control-h-md);padding:0 10px;font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);}\n.dshpc-input--lg{height:var(--dshpc-control-h-lg);padding:0 12px;font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);}\n.dshpc-input::placeholder{color:var(--dshpc-fg-dim);}\n.dshpc-input:focus{border-color:var(--dshpc-focus);box-shadow:0 0 0 1px var(--dshpc-focus);}\n.dshpc-input--error{border-color:var(--dshpc-danger);}\n.dshpc-input:disabled{cursor:default;opacity:.5;}\n\n.dshpc-pfx{display:inline-flex;align-items:center;box-sizing:border-box;overflow:hidden;\n  border:1px solid var(--dshpc-border);border-radius:var(--dshpc-radius-md);background:var(--dshpc-surface-1);color:var(--dshpc-fg);}\n.dshpc-pfx--sm{height:var(--dshpc-control-h-sm);}\n.dshpc-pfx--md{height:var(--dshpc-control-h-md);}\n.dshpc-pfx--lg{height:var(--dshpc-control-h-lg);}\n/* md / lg \u6863\u5B57\u53F7\u8DDF\u6863\u8D70\uFF08\u4E0E\u540C\u6863\u4E0B\u62C9\u540C\u5B57\u53F7\uFF09\uFF1A\u6B64\u524D\u5199\u6B7B sm(12px)\uFF0C\u540C\u6392\u4E0B\u62C9\u662F 13px \u21D2 \u663E\u5F97\u300Cinput \u5B57\u5C0F\u300D\u3002 */\n.dshpc-pfx--md .dshpc-pfx__label,.dshpc-pfx--lg .dshpc-pfx__label{font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);}\n.dshpc-pfx--md .dshpc-pfx__input,.dshpc-pfx--lg .dshpc-pfx__input{font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);}\n.dshpc-pfx--error{border-color:var(--dshpc-danger);}\n.dshpc-pfx:focus-within{border-color:var(--dshpc-focus);box-shadow:0 0 0 1px var(--dshpc-focus);}\n.dshpc-pfx__label{padding:0 8px;color:var(--dshpc-fg-2);font-size:var(--dshpc-font-sm);line-height:var(--dshpc-line-sm);white-space:nowrap;border-right:1px solid var(--dshpc-border);}\n.dshpc-pfx__input{flex:1 1 auto;min-width:0;height:100%;padding:0 8px;border:0;background:transparent;color:var(--dshpc-fg);\n  font-family:inherit;font-size:var(--dshpc-font-sm);line-height:var(--dshpc-line-sm);outline:none;}\n.dshpc-pfx__input::placeholder{color:var(--dshpc-fg-dim);}\n\n.dshpc-num{display:inline-flex;align-items:center;justify-content:space-between;box-sizing:border-box;overflow:hidden;\n  border:1px solid var(--dshpc-border);border-radius:var(--dshpc-radius-md);background:var(--dshpc-surface-1);color:var(--dshpc-fg);}\n/* \u4E2D\u6BB5\uFF1A\u6570\u5B57 + \u540E\u7F00\u6210\u7EC4\u5C45\u4E2D\uFF1B\u5BB9\u5668\u88AB\u6D88\u8D39\u7AEF\u62C9\u5BBD\u65F6\u5403\u6389\u5168\u90E8\u4F59\u91CF\uFF0C\u4E24\u7AEF \u2212 / + \u56E0\u6B64\u9489\u6B7B\u5728\u5DE6\u53F3\u8FB9\u7F18\u3002 */\n.dshpc-num__mid{display:flex;align-items:center;justify-content:center;flex:1 1 auto;min-width:0;}\n.dshpc-num--sm{height:var(--dshpc-control-h-sm);}\n.dshpc-num--md{height:var(--dshpc-control-h-md);}\n.dshpc-num--lg{height:var(--dshpc-control-h-lg);}\n.dshpc-num--md .dshpc-num__input,.dshpc-num--lg .dshpc-num__input{font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);}\n.dshpc-num--md .dshpc-num__suffix,.dshpc-num--lg .dshpc-num__suffix{font-size:var(--dshpc-font-md);}\n.dshpc-num--disabled{opacity:.5;}\n/* \u7126\u70B9\u6001\u4E0E Input \u540C\u6B3E\uFF082026-10-20 \u7528\u6237\uFF1A\u6570\u5B57\u6846\u91CC\u70B9\u8FDB\u53BB\u6CA1\u6709\u84DD\u6846\uFF09\uFF1A\u5185\u5C42 input \u65E0\u8FB9\u6846\uFF0C\n   \u7126\u70B9\u72B6\u6001\u753B\u5728\u6574\u4E2A\u6B65\u8FDB\u63A7\u4EF6\u5916\u6846\u4E0A\u3002 */\n.dshpc-num:focus-within{border-color:var(--dshpc-focus);box-shadow:0 0 0 1px var(--dshpc-focus);}\n.dshpc-num__input{width:36px;height:100%;padding:0 2px;border:0;background:transparent;color:var(--dshpc-fg);\n  font-family:inherit;font-size:var(--dshpc-font-sm);line-height:var(--dshpc-line-sm);text-align:center;outline:none;}\n.dshpc-num__suffix{padding:0 6px;color:var(--dshpc-fg-2);font-size:var(--dshpc-font-sm);white-space:nowrap;}\n.dshpc-num .dshpc-iconbtn{border-radius:0;color:var(--dshpc-fg-2);flex:none;}\n\n/* \u5B98\u65B9 Switch \u5305\u88C5\u7EDF\u4E00\uFF1A\u9009\u4E2D = success \u7EFF\u3002\n   \uFF08\u5408\u5E76\u539F\u5148 task-editor-css / task-list \u4E24\u5904\u5C31\u5730\u8986\u76D6\uFF1B\u9009\u62E9\u5668\u5E26\u5305\u88C5\u7C7B + role\uFF0C\u7279\u5F02\u6027\u9AD8\u4E8E\u5B98\u65B9\u3002\uFF09 */\n.dshpc-switch button[role='switch'][aria-checked='true']{background:var(--dshpc-success);}\n\n/* \u591A\u884C\u6587\u672C\u8F93\u5165\uFF08\u63D0\u793A\u8BCD\u7B49\uFF0CP3\uFF09\uFF1A**\u8FB9\u6846 / \u5706\u89D2 / \u5E95 / \u7126\u70B9\u6001\u4E0E Input \u540C\u4E00\u5957\u53E3\u5F84**\uFF08\u7528\u6237 2026-10-20\uFF1A\n   \u300C\u591A\u884C\u8F93\u5165\u5E94\u8BE5\u548C input \u7684\u8FB9\u513F\u662F\u4E00\u4E2A\u9053\u7406\uFF0C\u5305\u62EC\u5706\u89D2\u5728\u5185\uFF0C\u90FD\u662F\u4E00\u4E2A\u4E1C\u897F\u300D\uFF09\u3002\n   \u26A0\uFE0F \u65E7\u610F\u56FE\u300C\u5361\u5185\u65E0\u8FB9\u6846\u3001\u89C6\u89C9\u91CD\u5FC3\u5728\u6574\u5F20\u5361\u4E0A\u300D\u5DF2\u4F5C\u5E9F \u2014\u2014 \u73B0\u5728\u5B83\u5C31\u662F\u4E00\u53EA\u5E26\u6846\u7684\u591A\u884C\u8F93\u5165\u6846\u3002\n   \uFF08\u4ECE task-editor-css \u7684 .dshpc-ed-prompt \u4E0A\u63D0\u800C\u6765\uFF1B\u4E1A\u52A1\u6587\u4EF6\u4E0D\u518D\u81EA\u5199 textarea \u76AE\u80A4\u3002\uFF09 */\n.dshpc-textarea{display:block;width:100%;box-sizing:border-box;min-height:132px;padding:8px 12px;\n  border:1px solid var(--dshpc-border);border-radius:var(--dshpc-radius-md);outline:none;\n  background:var(--dshpc-surface-1);color:var(--dshpc-fg);font-family:inherit;font-size:var(--dshpc-font-lg);line-height:1.6;resize:vertical;\n  transition:border-color var(--dshpc-dur-fast) var(--dshpc-ease),box-shadow var(--dshpc-dur-fast) var(--dshpc-ease);}\n.dshpc-textarea::placeholder{color:var(--dshpc-fg-dim);}\n.dshpc-textarea:focus{border-color:var(--dshpc-focus);box-shadow:0 0 0 1px var(--dshpc-focus);}\n/* \u6821\u9A8C\u4E0D\u901A\u8FC7\uFF1A\u4E0E Input \u4E00\u81F4\uFF0C\u8D70\u8FB9\u6846\u63CF\u7EA2\uFF08\u65E7\u7248\u662F box-shadow \u63CF\u7EA2\u76D2\uFF0C\u4E0E Input \u4E0D\u540C\u53E3\u5F84\uFF09 */\n.dshpc-textarea--error{border-color:var(--dshpc-danger);}\n.dshpc-textarea:disabled{cursor:default;opacity:.5;}\n@media (prefers-reduced-motion: reduce){.dshpc-textarea{transition:none;}}\n\n/* \u62D6\u62FD\u5206\u9694\u6761\uFF08\u7F16\u8F91\u5206\u680F / \u9884\u89C8 dock \u5171\u7528\uFF0CU20 #3\uFF09\uFF1A6px \u547D\u4E2D\u533A\uFF0Ccol-resize\uFF0C\u4E0D\u753B\u7EBF\uFF0Chover/\u6309\u4E0B\u6D6E\u51FA\u6D45\u5E26\u3002\n   \u5177\u4F53 z-index \u7531 .dshpc-ed-resizer / .dshpc-sv-resizer \u5404\u81EA\u8865\u3002 */\n.dshpc-resizer{position:absolute;top:0;bottom:0;left:0;width:6px;cursor:col-resize;background:0 0;touch-action:none;user-select:none;}\n.dshpc-resizer:hover,.dshpc-resizer:active{background:var(--dshpc-hover,rgba(38,49,72,.06));}\n\n@media (prefers-reduced-motion: reduce){.dshpc-input,.dshpc-pfx{transition:none;}}\n";

// dist/ui/controls/loading-css.generated.js
var LOADING_CSS = "\n/* \u8FD0\u884C\u4E2D / loading \u7684\u6D3B\u52A8\u6307\u793A\uFF1A\u4E09\u4E2A\u5C0F\u65B9\u5757\u4F9D\u6B21\u8109\u52A8\u3002 */\n@keyframes dshpc-run-block { 0%, 80%, 100% { opacity: 0.25; transform: scale(0.8) } 40% { opacity: 1; transform: scale(1) } }\n.dshpc-run-blocks { display: inline-flex; align-items: center; gap: 3px; }\n.dshpc-run-blocks > i { width: 5px; height: 5px; border-radius: 1px; background: currentColor; animation: dshpc-run-block 1.2s ease-in-out infinite; }\n.dshpc-run-blocks > i:nth-child(2) { animation-delay: 0.15s; }\n.dshpc-run-blocks > i:nth-child(3) { animation-delay: 0.3s; }\n@media (prefers-reduced-motion: reduce) { .dshpc-run-blocks > i { animation: none; opacity: 1; } }\n";

// dist/ui/controls/back-to-top-css.generated.js
var BACK_TO_TOP_CSS = "\n/* \u56DE\u5230\u9876\u90E8\u60AC\u6D6E\u94AE\uFF1A\u5706\u94AE\u3001\u5B9E\u9762\u3001\u6295\u5F71\uFF1B\u9ED8\u8BA4\u9690\u8EAB\uFF0C\u6EDA\u8FC7\u9608\u503C\u52A0 .is-visible \u624D\u663E\u5F62\u3002\n   \u6A2A\u5411 left \u7531\u7EC4\u4EF6\u6309\u4E3B\u5185\u5BB9\u5217\u53F3\u7F18\u5B9E\u65F6\u7B97\u51FA\uFF08\u8D34\u5728\u5176\u53F3\u4FA7\u5916\u4FA7\uFF09\uFF0C\u4E0D\u5199\u6B7B\u3002 */\n.dshpc-backtotop{\n  position:fixed;\n  bottom:var(--dshpc-space-4);\n  z-index:var(--dshpc-z-dock);\n  width:44px;height:44px;\n  display:inline-flex;align-items:center;justify-content:center;\n  padding:0;margin:0;\n  box-sizing:border-box;\n  border:1px solid var(--dshpc-border);\n  border-radius:50%;\n  background:var(--dshpc-solid);\n  color:var(--dshpc-on-solid);\n  box-shadow:var(--dshpc-shadow-2);\n  cursor:pointer;\n  opacity:0;\n  transform:translateY(8px) scale(.92);\n  transition:opacity var(--dshpc-dur) var(--dshpc-ease),\n             transform var(--dshpc-dur) var(--dshpc-ease),\n             background-color var(--dshpc-dur-fast) var(--dshpc-ease);\n  pointer-events:none;\n}\n.dshpc-backtotop.is-visible{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}\n.dshpc-backtotop:hover{background:var(--dshpc-hover);}\n.dshpc-backtotop:active{background:var(--dshpc-active);}\n.dshpc-backtotop:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:2px;}\n@media (prefers-reduced-motion: reduce){\n  .dshpc-backtotop{transition:opacity var(--dshpc-dur-fast) linear;transform:none;}\n}\n";

// dist/ui/controls/hint-css.generated.js
var HINT_CSS = "\n/* \u2500\u2500 \u95EE\u53F7\u63D0\u793A P4\uFF08\u7528\u6237 2026-10-18\uFF1A\u5BF9\u9F50\u771F\u5B9E\u63D2\u4EF6 HelpButton\u2014\u2014**\u5E26\u5708\u7684\u95EE\u53F7\u56FE\u6807**\uFF09\u2500\u2500\n   \u672C\u4F53 14px \u7EC6\u5708 + \u5708\u5185 ?\uFF0C\u989C\u8272 fg-3\u3001hover \u53EA\u63D0\u4EAE\u4E0D\u52A0\u5E95\uFF08\u4E0E dshpc-ed-help \u540C\u89C4\u77E9\uFF09\u3002\n   \u6C14\u6CE1\u4E0D\u5728\u672C\u6587\u4EF6\uFF1A2026-10-19 \u7528\u6237\u62CD\u677F\u300C\u95EE\u53F7\u5FC5\u987B\u7528\u5B98\u65B9 Tooltip \u90A3\u4E00\u4E2A\u300D\u21D2 \u6C14\u6CE1\u7531\u6CE8\u5165\u7684\n   \u5B98\u65B9\u7EC4\u4EF6\u6E32\u67D3\uFF08src/ui/tooltip.ts\uFF09\uFF0C\u8FD9\u91CC\u53EA\u7BA1\u95EE\u53F7\u56FE\u6807\u672C\u8EAB\u3002 */\n.dshpc-hint{display:inline-flex;align-items:center;justify-content:center;flex:none;\n  box-sizing:border-box;width:14px;height:14px;padding:0;border:1px solid currentColor;border-radius:50%;background:transparent;\n  color:var(--dshpc-fg-3);font-family:inherit;font-size:8px;font-weight:600;line-height:12px;cursor:help;vertical-align:middle;\n  transition:color var(--dshpc-dur-fast) var(--dshpc-ease);}\n.dshpc-hint:hover,.dshpc-hint:focus-visible{color:var(--dshpc-fg);background:0 0;}\n.dshpc-hint:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:1px;}\n";

// dist/ui/marquee-css.generated.js
var MARQUEE_CSS = "/* \u8DD1\u9A6C\u706F\uFF08MarqueeText\uFF09\uFF1A\u53CC\u5C42\u2014\u2014\u5916\u5C42\u53EA\u88C1\u526A\uFF0C\u5185\u5C42\u624D transform \u6EDA\u52A8\uFF1B\u975E hover \u5185\u5C42\u81EA\u5E26\u7701\u7565\u53F7\u3002\n   2026-10-20\uFF1A\u672C\u6587\u4EF6\u539F\u662F\u6742\u70E9\u300Cselect.css\u300D\uFF08\u4E0B\u62C9 / \u65E5\u5386 / \u65F6\u5206\u7684\u76AE\u80A4\u90FD\u88C5\u8FC7\uFF09\uFF0C\u968F\u7740\u90A3\u4E9B\u63A7\u4EF6\n   \u4E00\u4E2A\u4E2A\u5220\u5B8C\uFF0C\u6700\u540E\u53EA\u5269\u8DD1\u9A6C\u706F\uFF0C\u6545\u6309\u672C\u5305\u300C\u4E00\u4E2A css \u670D\u52A1\u4E00\u4E2A\u5BF9\u8C61\u300D\u7684\u683C\u5C40\u6539\u540D\u5F52\u6863\u3002\n   \u540C\u6279\u6E05\u6389\u7684\u8FD8\u6709\u96F6\u5F15\u7528\u7684\u7701\u7565\u53F7\u7C7B .dshpc-ellipsis \u2014\u2014 \u672C\u5305\u4E09\u4E2A\u7528\u5230\u622A\u65AD\u7684\u5730\u65B9\u90FD\u6CA1\u91C7\u7EB3\u5B83\u3002 */\n.dshpc-mq{display:block;overflow:hidden;white-space:nowrap;}\n.dshpc-mq .dshpc-mq-in{display:inline-block;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis;vertical-align:top;}\n/* \u26A0\uFE0F \u8DD1\u6CD5\uFF08\u7528\u6237 2026-10-03 \u62CD\u677F\uFF09\uFF1A**\u8DD1\u4E00\u904D\u3001\u505C\u5728\u5C3E\u5B57**\uFF08\u64AD\u653E 1 \u6B21 + forwards\uFF09\uFF0C\u4E0D\u6765\u56DE\u5F39\u3001\u4E0D\u65E0\u9650\u8DD1\u3002\n   \u6EDA\u8DDD = \u7CBE\u786E\u6EA2\u51FA\u91CF \u21D2 \u505C\u4E0B\u65F6\u6700\u540E\u4E00\u4E2A\u5B57\u6B63\u597D\u8D34\u53F3\u7F18\uFF0C**\u4E0D\u4F1A\u8DD1\u8FDB\u9ED1\u5757**\uFF08\u9ED1\u5757\u662F\u65E7\u624B\u5199\u7248\u628A\n   \u5185\u5C42\u76D2\u5B50\u88C1\u4E86\u3001\u6309\u300C\u534A\u622A\u6587\u672C\u300D\u5E73\u79FB\u5BFC\u81F4\u7684\uFF09\u3002\u9F20\u6807\u79FB\u5F00 \u21D2 :hover \u5931\u6548 \u21D2 \u81EA\u52A8\u590D\u4F4D\u56DE\u7701\u7565\u53F7\u6001\u3002 */\n.dshpc-mq-run:hover .dshpc-mq-in{max-width:none;overflow:visible;animation:dshpc-mq-scroll var(--dshpc-mq-dur,6s) linear .4s 1 forwards;}\n@keyframes dshpc-mq-scroll{from{transform:translateX(0)}to{transform:translateX(var(--dshpc-mq-dist,-40px))}}\n";

// dist/ui/picker-css.generated.js
var PICKER_CSS = `
.dshpc-picker{position:relative;display:inline-block;font-size:13px;line-height:20px}
.dshpc-picker__trigger{
  display:inline-flex;align-items:center;justify-content:space-between;gap:6px;
  min-width:120px;max-width:100%;height:28px;padding:0 8px;
  color:var(--dshpc-fg);background:var(--dshpc-surface-1);
  border:1px solid var(--dshpc-border);border-radius:var(--dshpc-radius-md);cursor:pointer;
}
.dshpc-picker__trigger:disabled{color:var(--dshpc-fg-dim);cursor:not-allowed;opacity:.7}
/* \u6587\u5B57\u9ED8\u8BA4\u9760\u5DE6\uFF08\u5403\u6389\u5269\u4F59\u5BBD\u5EA6\uFF09\uFF0C\u4E0D\u7ED9 space-between \u628A\u77ED\u6587\u6848\u63A8\u5230\u4E2D\u95F4\u7684\u673A\u4F1A\uFF1B
   \u786E\u5B9E\u8981\u5C45\u4E2D\u5C31\u663E\u5F0F\u4F20 align="center"\u3002 */
.dshpc-picker__label{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left}
.dshpc-picker__trigger--center .dshpc-picker__label{text-align:center}
.dshpc-picker__caret{flex:none;color:var(--dshpc-fg-3)}
.dshpc-picker__icon{display:inline-flex;flex:none;color:var(--dshpc-fg-2)}
.dshpc-picker__option-icon{display:inline-flex;flex:none;color:var(--dshpc-fg-2)}
.dshpc-picker__menu{
  position:absolute;z-index:60;top:calc(100% + 4px);left:0;min-width:100%;
  max-height:280px;overflow:auto;padding:4px;
  background:var(--dshpc-surface-menu);border:1px solid var(--dshpc-border);
  border-radius:var(--dshpc-radius-md);box-shadow:0 8px 24px rgba(15,23,42,.12);
}
/* \u5411\u4E0A\u5C55\u5F00\uFF08\u89E6\u53D1\u5668\u9760\u8FD1\u89C6\u53E3\u5E95\u90E8\u65F6\u7528 placement="up"\uFF09\u3002 */
.dshpc-picker__menu--up{top:auto;bottom:calc(100% + 4px)}
/* \u5C3A\u5BF8\u6863\uFF08\u4E0E Field \u7684 sm/md/lg \u5BF9\u5E94\uFF09\u3002 */
.dshpc-picker__trigger--sm{height:24px;font-size:12px}
.dshpc-picker__trigger--lg{height:32px}
/* \u952E\u76D8\u6E38\u6807\u6240\u5728\u9879\uFF08\u65E0 hover \u4E5F\u8981\u770B\u5F97\u89C1\uFF09\u3002 */
.dshpc-picker__option[data-active='true']{background:var(--dshpc-surface-sunken);outline:1px solid var(--dshpc-border)}
.dshpc-picker__option--clear{color:var(--dshpc-fg-3)}
.dshpc-picker__search{
  width:100%;height:28px;margin-bottom:4px;padding:0 8px;box-sizing:border-box;
  color:var(--dshpc-fg);background:var(--dshpc-surface-sunken);
  border:1px solid var(--dshpc-border-faint);border-radius:var(--dshpc-radius-md);outline:none;
}
.dshpc-picker__group-label{
  padding:6px 8px 2px;color:var(--dshpc-fg-3);font-size:11px;
}
.dshpc-picker__option{
  display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:var(--dshpc-radius-sm);cursor:pointer;
  color:var(--dshpc-fg);white-space:nowrap;
}
.dshpc-picker__option:hover{background:var(--dshpc-surface-sunken)}
.dshpc-picker__option--active{background:var(--dshpc-open-bg);color:var(--dshpc-business)}
.dshpc-picker__option--disabled{color:var(--dshpc-fg-dim);cursor:not-allowed}
.dshpc-picker__tick{width:12px;color:var(--dshpc-business)}
.dshpc-picker__empty{padding:8px;color:var(--dshpc-fg-3);text-align:center}
.dshpc-picker__degraded{
  padding:6px 8px;margin-bottom:4px;border-radius:var(--dshpc-radius-sm);
  color:var(--dshpc-warning-label);background:color-mix(in srgb,var(--dshpc-warning) 12%,transparent);
  font-size:11px;
}
.dshpc-picker__row{display:flex;align-items:center;gap:8px}
`;

// dist/ui/feedback-css.generated.js
var FEEDBACK_CSS = "\n/* \u906E\u7F69 = \u5BBF\u4E3B\u906E\u7F69\u53D8\u91CF --dsw-alias-bg-mask-1\uFF08\u4E0E\u5B98\u65B9 Modal / \u5144\u5F1F\u9879\u76EE --tdt-mask \u540C\u4E00\u6761\u771F\u503C\uFF0C\u7528\u6237 2026-10-20\uFF09\u3002 */\n.dshpc-modal-mask{\n  position:fixed;inset:0;z-index:1070;display:flex;align-items:center;justify-content:center;\n  background:var(--dshpc-mask);\n}\n/* \u5927\u5F39\u7A97\u5BB6\u65CF\uFF08md/lg\uFF09\uFF1A\u6284\u5144\u5F1F\u9879\u76EE archive-session-css \u7684 .dsh-tdt-sv-panel\uFF08surface-base + border-l2 + radius 12 + shadow-2\uFF09\u3002 */\n.dshpc-modal{\n  display:flex;flex-direction:column;box-sizing:border-box;\n  background:var(--dshpc-surface-base);color:var(--dshpc-fg);\n  border:1px solid var(--dshpc-border);border-radius:var(--dshpc-radius-md);\n  box-shadow:var(--dshpc-shadow-2);overflow:hidden;\n}\n.dshpc-modal__head{\n  display:flex;align-items:center;gap:8px;padding:18px 31px 12px;\n  border-bottom:1px solid var(--dshpc-border);flex-wrap:wrap;\n}\n.dshpc-modal__title{font-size:var(--dshpc-font-lg);font-weight:600;line-height:1.4;min-width:0}\n/* \u6807\u9898\u4E0B\u526F\u6807\u9898\u884C\uFF08\u5144\u5F1F\u9879\u76EE .dsh-tdt-sv-sid\uFF1A\u7B49\u5BBD\u5B57\u4F53\u3001caption \u8272\u3001\u53EF\u6362\u884C\uFF09\u3002 */\n.dshpc-modal__sid{font-family:var(--ds-font-family-code,monospace);font-size:var(--dshpc-font-xs);color:var(--dshpc-fg-3);word-break:break-all}\n/* \u5173\u95ED\u6309\u94AE\uFF1A24\xD724 \u65B9\u89D2\u56FE\u6807\u4F4D\uFF0C\u4E0D\u501F\u7528 Picker \u7684\u89E6\u53D1\u5668\u76AE\u80A4\uFF08\u90A3\u4EFD\u5E26 min-width:120px\uFF09\u3002 */\n.dshpc-modal__close{\n  display:inline-flex;align-items:center;justify-content:center;flex:none;\n  width:20px;height:20px;padding:0;border:none;border-radius:var(--dshpc-radius-sm);\n  background:transparent;color:var(--dshpc-fg-3);font-family:inherit;font-size:13px;line-height:1;cursor:pointer;\n  transition:background-color var(--dshpc-dur-fast) var(--dshpc-ease),color var(--dshpc-dur-fast) var(--dshpc-ease);\n}\n.dshpc-modal__close:hover{background:var(--dshpc-hover);color:var(--dshpc-fg)}\n.dshpc-modal__close:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:1px}\n.dshpc-modal__body{flex:1 1 auto;min-height:0;overflow:auto;padding:17px 31px}\n.dshpc-modal__foot{display:flex;justify-content:flex-end;gap:8px;padding:12px 31px 18px}\n.dshpc-toast-host{\n  position:fixed;z-index:1090;left:50%;bottom:32px;transform:translateX(-50%);\n  display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;\n}\n.dshpc-toast{\n  padding:8px 14px;border-radius:8px;font-size:13px;color:var(--dshpc-fg);\n  background:var(--dshpc-surface-menu);border:1px solid var(--dshpc-border);\n  box-shadow:0 8px 24px rgba(15,23,42,.16);\n}\n.dshpc-toast--success{color:var(--dshpc-success);border-color:color-mix(in srgb,var(--dshpc-success) 40%,transparent)}\n.dshpc-toast--error{color:var(--dshpc-danger);border-color:color-mix(in srgb,var(--dshpc-danger) 40%,transparent)}\n.dshpc-empty{\n  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;\n  padding:24px;color:var(--dshpc-fg-3);font-size:13px;text-align:center;\n}\n.dshpc-error__retry{\n  margin-top:8px;color:var(--dshpc-link);cursor:pointer;background:none;border:none;padding:0;\n}\n/* \u539F\u751F\u5F39\u7A97\u6F14\u793A\uFF1A\u7ECF\u5BBF\u4E3B Modal \u7684 contentClassName \u6CE8\u5165\uFF0C\u8BC1\u660E\u5BBF\u4E3B\u5185\u5BB9\u533A\u5C3A\u5BF8\u53EF\u7ECF\u7C7B\u540D\u81EA\u5B9A\u4E49\u3002 */\n.dshpc-native-demo-content{max-width:520px}\n/* Modal \u5934\u90E8\u56DB\u69FD\uFF1A\u5DE6\u56FE\u6807 / \u6807\u9898\u7EC4 / \u5F39\u6027\u95F4\u9694 / \u53F3\u4FA7\u52A8\u4F5C\u533A + \u5173\u95ED\u94AE\u3002 */\n.dshpc-modal__heading{display:flex;align-items:center;gap:8px;min-width:0;flex:0 1 auto}\n.dshpc-modal__lead{flex:none;display:inline-flex;align-items:center;justify-content:center;font-size:16px;line-height:1}\n.dshpc-modal__extra{flex:none;display:inline-flex;align-items:center}\n.dshpc-modal__spacer{flex:1 1 auto;min-width:8px}\n.dshpc-modal__actions{flex:none;display:flex;align-items:center;gap:8px}\n/* \u5934\u90E8\u4FE1\u53F7\u56FE\u6807\uFF08AlertModal \u6309 severity \u6CE8\u5165\uFF09\uFF1A\u81EA\u542B\u914D\u8272\uFF0C\u4E0D\u4F9D\u8D56\u5BBF\u4E3B token\u3002 */\n.dshpc-alert-sev{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;font-size:12px;color:#fff;flex:none}\n.dshpc-alert-sev--info{background:#2563eb}\n.dshpc-alert-sev--success{background:#16a34a}\n.dshpc-alert-sev--warning{background:#d97706}\n.dshpc-alert-sev--error{background:#dc2626}\n/* \u5C0F\u786E\u8BA4\u6846\u5BB6\u65CF\uFF08sm\uFF09\uFF1A\u4E25\u683C\u6284\u5144\u5F1F\u9879\u76EE renderConfirm \u7684 dialogStyle\uFF08task-list.tsx:456\uFF09\u2014\u2014\n   360px \u5BBD / 18px \u5185\u8DDD / \u5934\u90E8\u65E0\u5206\u9694\u7EBF / \u8BF4\u660E\u6587\u5B57 fg-2 / \u5E95\u90E8\u6309\u94AE\u53F3\u5BF9\u9F50\u3002 */\n.dshpc-modal--sm{padding:18px}\n.dshpc-modal--sm .dshpc-modal__head{padding:0 0 8px;border-bottom:none}\n.dshpc-modal--sm .dshpc-modal__body{padding:0 0 14px;overflow:visible;font-size:var(--dshpc-font-sm);color:var(--dshpc-fg-2);line-height:var(--dshpc-line-sm)}\n.dshpc-modal--sm .dshpc-modal__foot{padding:0}\n";

// dist/ui/card-css.generated.js
var CARD_CSS = "\n.dshpc-card{\n  position:relative;box-sizing:border-box;color:var(--dshpc-fg);font:inherit;text-align:left;\n  --card-accent:var(--dshpc-business);\n  --card-accent-soft:var(--dshpc-business-soft);\n}\n/* \u6863\u4F4D \u2192 token\uFF08\u7167 records-timeline \u7684 tone \u6A21\u5F0F\uFF1A\u4E00\u4E2A\u53D8\u91CF\u5207\u6863\uFF0C\u4E0D\u5199 5 \u5957\u89C4\u5219\uFF1B\u6D45\u5E95\u4E0E\u8272\u6761\u540C\u6E90\uFF09\u3002 */\n.dshpc-card--success{--card-accent:var(--dshpc-success);--card-accent-soft:var(--dshpc-success-soft)}\n.dshpc-card--warning{--card-accent:var(--dshpc-warning);--card-accent-soft:var(--dshpc-warning-soft)}\n.dshpc-card--danger{--card-accent:var(--dshpc-danger);--card-accent-soft:var(--dshpc-danger-soft)}\n/* neutral \u6D45\u5E95\u501F chip \u5E95\uFF08\u5144\u5F1F\u9879\u76EE mute \u6863\u540C\u6B3E\uFF1A\u660E\u6697\u90FD\u6210\u7ACB\uFF09\u3002 */\n.dshpc-card--neutral{--card-accent:var(--dshpc-fg-4);--card-accent-soft:var(--dshpc-chip-bg)}\n\n/* \u5934\u90E8\u4E00\u884C = \u8272\u6761 + \u4E3B\u5185\u5BB9 + \u53F3\u4FA7\u69FD\uFF0C**\u6574\u4F53\u5782\u76F4\u5C45\u4E2D**\uFF1A\u8C03\u7528\u65B9\u5728 action \u91CC\u88F8\u653E\u4E00\u4E2A\u5143\u7D20\n   \uFF08\u6309\u94AE / \u6587\u5B57 / \u56FE\u6807\uFF09\u4E0D\u7528\u81EA\u5DF1\u5957\u5BB9\u5668\u5C45\u4E2D\uFF1B\u4E00\u884C\u4E24\u884C\u3001\u53F3\u8FB9\u600E\u4E48\u653E\u7531\u8C03\u7528\u65B9\u5728\u6846\u5185\u81EA\u5B9A\u3002 */\n.dshpc-card__head{display:flex;align-items:center;gap:8px;min-width:0}\n.dshpc-card__main{flex:1;min-width:0}\n.dshpc-card__side{display:flex;align-items:center;gap:6px;flex:none}\n\n/* \u2500\u2500 \u5916\u89C2\u4E00 \xB7 StripCard\uFF1A\u540C\u8272\u7CFB\u6D45\u5E95 + 1px \u4E0D\u53EF\u89C1\u5360\u4F4D\u8FB9\u6846 + \u65B9\u89D2 + 4px \u901A\u9AD8\u65B9\u89D2\u8272\u6761\u8D34\u5DE6\u7F18 \u2500\u2500 */\n.dshpc-card--strip{\n  padding:12px 12px 12px 20px;border:1px solid transparent;\n  background:var(--card-accent-soft,transparent);\n}\n/* \u5DE6\u5185\u8FB9\u8DDD 20px = 16 \u7559\u767D + 4 \u6761\u5BBD \u21D2 \u5185\u5BB9\u4ECE\u8272\u6761\u53F3\u7F18\u8D77\u7B97\uFF1B\u8272\u6761\u7EDD\u5BF9\u5B9A\u4F4D\u901A\u9AD8\uFF0C\u8DDF\u7740\u5185\u5BB9\u9AD8\u5EA6\u81EA\u9002\u5E94\u3002 */\n.dshpc-card--strip .dshpc-card__bar{position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--card-accent)}\n\n/* \u2500\u2500 \u5916\u89C2\u4E8C \xB7 Card\uFF1Asurface \u5E95 + 1px \u5B9E\u8272\u8FB9\u6846 + \u5706\u89D2 + \u884C\u5185\u5706\u89D2\u77ED\u6761 \u2500\u2500 */\n.dshpc-card--bordered{\n  /* \u5DE6\u5185\u8FB9\u8DDD 12\uFF08\u6BD4\u4E0A/\u53F3/\u4E0B 14 \u5C11 2\uFF09\uFF1A\u7AD6\u6761\u8D34\u8FD1\u8FB9\u6846\uFF1B\u5934\u90E8\u5185\u7F29 2px \u21D2 \u4E3B\u5185\u5BB9\u8DDF\u7740\u5DE6\u79FB 2px\uFF0C\n     \u7AD6\u6761\u2194\u5185\u5BB9\u7684 12px \u95F4\u8DDD\u4E0D\u53D8\u2014\u2014\u6BD4\u300C\u6761\u5B50 left:-2 \u800C\u5185\u5BB9\u4E0D\u52A8\u300D\u66F4\u6B63\u89C4\uFF08\u4E0D\u9760\u76F8\u5BF9\u5B9A\u4F4D\u786C\u8865\uFF09\u3002 */\n  padding:14px 14px 14px 12px;border:1px solid var(--dshpc-border);border-radius:var(--dshpc-radius-sm);\n  background:var(--dshpc-surface-1);\n}\n.dshpc-card--bordered .dshpc-card__head{gap:12px}\n/* \u77ED\u6761\uFF1A\u884C\u5185 flex \u9879\uFF0C**\u9AD8\u5EA6\u8DDF\u7740\u5185\u5BB9\u8D70**\uFF08stretch\uFF09\uFF0C\u6700\u5C0F\u4E00\u884C\u6587\u5B57\uFF08--dshpc-line-md\uFF09\u2014\u2014\n   \u4E00\u884C\u6587\u5B57\u65F6\u6761\u5B50\u4E0E\u6587\u5B57\u9F50\u9AD8\uFF0C\u4E0D\u4F1A\u628A\u5361\u6491\u9AD8\uFF1B\u7AD6\u6761\u8DDD\u5DE6 12\uFF08= \u5DE6\u5185\u8FB9\u8DDD\uFF09\uFF0C\u8DDD\u4E0A/\u53F3/\u4E0B 14\u3002 */\n.dshpc-card--bordered .dshpc-card__bar{width:6px;flex:none;align-self:stretch;min-height:var(--dshpc-line-md);border-radius:var(--dshpc-radius-xs);background:var(--card-accent)}\n.dshpc-card__toggle{\n  display:inline-flex;align-items:center;justify-content:center;\n  width:24px;height:24px;padding:0;background:none;border:none;border-radius:6px;\n  color:var(--dshpc-fg-3);cursor:pointer;\n}\n.dshpc-card__toggle:hover{background:var(--dshpc-surface-sunken);color:var(--dshpc-fg)}\n.dshpc-card__caret{display:inline-block;font-size:10px;transition:transform .15s ease}\n.dshpc-card__caret.is-open{transform:rotate(180deg)}\n.dshpc-card__panel{margin-top:8px;padding-top:8px;border-top:1px solid var(--dshpc-border-faint)}\n";

// dist/ui/chip-css.generated.js
var CHIP_CSS = "\n/* \u4E09\u6761\u5C40\u90E8\u53D8\u91CF\u627F\u8F7D\u914D\u8272\uFF1Aneutral \u8D70\u65E7\u7070\u9762\uFF1B\u8BED\u4E49\u6863\u6362\u5E95\u5B57\u914D\u5BF9\uFF082026-10-20 \u7528\u6237\u8981\u591A\u8272\u591A\u5C3A\u5BF8\u6807\u7B7E\uFF09\u3002 */\n.dshpc-chip{--chip-bg:var(--dshpc-chip-bg);--chip-fg:var(--dshpc-fg);--chip-bg-hover:var(--dshpc-chip-bg-hover);\n  display:inline-flex;align-items:center;justify-content:center;gap:4px;padding:1px 8px;\n  box-sizing:border-box;border-radius:var(--dshpc-radius-pill,999px);border:none;\n  background:var(--chip-bg);color:var(--chip-fg);\n  font-family:inherit;font-size:11px;line-height:18px;margin:0;\n  /* 2026-10-18\uFF1Achip \u662F flex \u884C\u91CC\u7684\u5E38\u7528\u9879\uFF0C\u7981\u6B62\u88AB\u538B\u7F29\u6362\u884C\uFF08\u9884\u89C8\u7AD9\u51FA\u73B0\u8FC7\u6587\u5B57\u7AD6\u6392\u3001\u4E92\u76F8\u53E0\u538B\u7684\u6324\u538B\uFF09\u3002 */\n  white-space:nowrap;flex:none;\n  appearance:none;-webkit-appearance:none;\n}\n/* md \u6863\uFF1A\u5361\u7247\u5143\u4FE1\u606F\u884C\u7B49\u7A0D\u5927\u573A\u666F\uFF1Bsm \u5373\u65E7\u7248\u9ED8\u8BA4\uFF0C\u9010\u50CF\u7D20\u4E0D\u52A8\u3002 */\n.dshpc-chip--md{padding:2px 10px;font-size:12px;line-height:20px;}\n/* xs \u6863\uFF1A\u6807\u9898\u540E\u7F00\u7B49\u6781\u7D27\u51D1\u573A\u666F\uFF082026-10-20 \u7528\u6237\u8981\u66F4\u5C0F\u6807\u7B7E\uFF09\uFF1B16px \u9AD8\u3001font 10\u3002 */\n.dshpc-chip--xs{padding:0 6px;font-size:10px;line-height:16px;}\n/* \u8BED\u4E49\u8272\u5B9E\u5FC3\u6863\uFF1A\u5E95 / \u5B57 / hover \u914D\u5BF9\u4E0E Button \u540C\u6E90\uFF08\u9EC4\u5E95\u4E2D\u9AD8\u660E\u5EA6 \u21D2 \u5B57\u7528 --dshpc-on-warning\uFF09\u3002 */\n.dshpc-chip--business{--chip-bg:var(--dshpc-business);--chip-fg:var(--dshpc-on-signal);--chip-bg-hover:var(--dshpc-business-hover);}\n.dshpc-chip--success{--chip-bg:var(--dshpc-success);--chip-fg:var(--dshpc-on-signal);--chip-bg-hover:var(--dshpc-success-hover);}\n.dshpc-chip--warning{--chip-bg:var(--dshpc-warning);--chip-fg:var(--dshpc-on-warning);--chip-bg-hover:var(--dshpc-warning-hover);}\n.dshpc-chip--danger{--chip-bg:var(--dshpc-danger);--chip-fg:var(--dshpc-on-signal);--chip-bg-hover:var(--dshpc-danger-hover);}\n/* \u53EF\u70B9\u6001\uFF1Abutton \u6E32\u67D3\uFF08\u89C1 Chip.ts\uFF09\uFF0C\u5149\u6807 + hover \u52A0\u6DF1\u3002 */\n.dshpc-chip--clickable{cursor:pointer;transition:background-color var(--dshpc-dur-fast) var(--dshpc-ease);}\n.dshpc-chip--clickable:hover:not(:disabled){background:var(--chip-bg-hover)}\n.dshpc-chip:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:1px}\n.dshpc-chip:disabled{cursor:default;color:var(--dshpc-fg-3)}\n@media (prefers-reduced-motion: reduce){.dshpc-chip{transition:none}}\n";

// dist/ui/panel-dock-css.generated.js
var PANEL_DOCK_CSS = "\n/* \u505C\u9760\u680F = **\u5E03\u5C40\u6210\u5458**\uFF0C\u4E0D\u662F\u6D6E\u5C42\uFF1A\u5B83\u5360\u5BBD\u5EA6\u3001\u628A\u4E3B\u533A\u771F\u6B63\u6324\u7A84\uFF08\u5144\u5F1F\u9879\u76EE 2026-09-28\uFF1A\n   \u300C\u5206\u680F\u538B\u8FC7\u6765\uFF0C\u4E0D\u662F\u76D6\u4E0A\u53BB\u300D\uFF09\u3002\u6240\u4EE5\u8C03\u7528\u65B9\u5FC5\u987B\u628A\u5B83\u653E\u8FDB\u81EA\u5DF1\u7684 flex \u6839\u91CC\u3002 */\n.dshpc-dock{display:flex;flex:0 0 auto;align-self:stretch;min-width:0}\n\n/* \u5355\u680F\uFF1Asticky + 100vh \u8BA9\u5B83\u5728\u9875\u9762\u6EDA\u52A8\u65F6\u4FDD\u6301\u53EF\u89C1\uFF0C\u540C\u65F6\u4ECD\u7136\u5360\u5BBD\u5EA6\u3002\n   \u26A0\uFE0F **\u672C\u6761\u523B\u610F\u4E0D\u8BBE z-index**\uFF1A\u5E03\u5C40\u6210\u5458\u4E00\u65E6\u5E26\u6B63 z-index\uFF0C\u5C31\u4F1A\u65E0\u6761\u4EF6\u538B\u8FC7\u5BBF\u4E3B portal \u5230 body \u7684\n   \u5F39\u7A97\uFF08\u5144\u5F1F\u9879\u76EE 2026-10-05 \u771F\u673A\u4E8B\u6545\u300C\u4FA7\u8FB9\u680F\u76D6\u4F4F\u5BBF\u4E3B\u8BBE\u7F6E\u5F39\u7A97\u300D\uFF09\u3002\u5C42\u5E8F\u4EA4\u7ED9 DOM \u987A\u5E8F\u88C1\u51B3\u3002 */\n.dshpc-dock__panel{\n  position:sticky;top:0;align-self:stretch;\n  display:flex;flex-direction:column;flex:0 0 auto;\n  /* \u9AD8\u5EA6\u9ED8\u8BA4\u89C6\u53E3\u9AD8\uFF08\u6574\u9875\u573A\u666F\uFF09\uFF1B\u5D4C\u5728\u5B9A\u9AD8\u5BB9\u5668\u91CC\u65F6\u7531\u8C03\u7528\u65B9\u7ED9 --dshpc-dock-h\uFF08\u5982 420px / 100%\uFF09\u3002 */\n  height:var(--dshpc-dock-h,100vh);max-height:var(--dshpc-dock-h,100vh);min-width:0;\n  background:var(--dshpc-surface-base);color:var(--dshpc-fg);\n  border-left:1px solid var(--dshpc-border);\n  box-shadow:var(--dshpc-shadow-2);\n}\n\n.dshpc-dock__head{\n  flex:none;display:flex;align-items:center;gap:8px;\n  /* \u53F3\u4FA7 34px = 8(\u8FB9\u8DDD) + 20(\u5173\u94AE) + 6(\u547C\u5438)\uFF1A\u7ED9\u7EDD\u5BF9\u5B9A\u4F4D\u7684\u5173\u94AE\u7559\u4F4D\uFF0C\u6807\u9898/extra \u4E0D\u4ECE\u5B83\u5E95\u4E0B\u94BB */\n  padding:10px 34px 10px 14px;\n  border-bottom:1px solid var(--dshpc-border-faint);\n}\n/* \u56FE\u6807\u4F4D / \u6807\u9898\u53F3\u4FA7\u7684\u5185\u5BB9\u4F4D\uFF1A\u6D88\u8D39\u65B9\u4F20 ReactNode\uFF0C\u53EF\u585E\u591A\u4E2A\uFF1B\u5E93\u53EA\u8D1F\u8D23\u6392\u5E03\uFF0C\u4E0D\u62A2\u5BBD\u5EA6\u3002 */\n.dshpc-dock__lead{display:inline-flex;align-items:center;gap:6px;flex:none;color:var(--dshpc-fg-2)}\n.dshpc-dock__extra{display:inline-flex;align-items:center;gap:6px;flex:none;margin-left:auto}\n/* \u81EA\u5B9A\u4E49\u5934\u90E8\uFF1A\u6574\u884C\u5F52\u8C03\u7528\u65B9 \u2014\u2014 \u4E0D\u52A0\u5185\u8FB9\u8DDD/\u8FB9\u6846/\u80CC\u666F\uFF0C\u4E5F\u4E0D\u7ED9\u5173\u94AE\u7559\u5185\u8054\u7A7A\u95F4\uFF08\u5173\u94AE\u662F\u7EDD\u5BF9\u5B9A\u4F4D\u7684\uFF09\u3002 */\n.dshpc-dock__head--custom{display:block;padding:0;border-bottom:none}\n.dshpc-dock__title{\n  flex:1 1 auto;min-width:0;\n  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;\n  font-size:var(--dshpc-font-md);font-weight:600;\n}\n/* \u5173\u95ED\u94AE\uFF1A20\xD720 \u65B9\u89D2\u56FE\u6807\u4F4D\uFF08\u4E0E Modal \u7684\u5173\u95ED\u94AE\u540C\u89C4\u683C\uFF0C\u4E0D\u501F Picker \u89E6\u53D1\u5668\u76AE\u80A4\uFF09\u3002 */\n.dshpc-dock__close{\n  display:inline-flex;align-items:center;justify-content:center;flex:none;\n  width:20px;height:20px;padding:0;border:none;border-radius:var(--dshpc-radius-sm);\n  background:transparent;color:var(--dshpc-fg-3);\n  font-family:inherit;font-size:13px;line-height:1;cursor:pointer;\n  transition:background-color var(--dshpc-dur-fast) var(--dshpc-ease),color var(--dshpc-dur-fast) var(--dshpc-ease);\n}\n.dshpc-dock__close:hover{background:var(--dshpc-hover);color:var(--dshpc-fg)}\n.dshpc-dock__close:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:1px}\n/* \u5934\u90E8\u5173\u94AE\uFF1A\u7EDD\u5BF9\u5B9A\u4F4D\uFF0C\u4F4D\u7F6E\u4E0E\u5185\u7F6E\u5934\u5B8C\u5168\u4E00\u81F4\uFF08top 10 / right 8\uFF09\uFF1B\u81EA\u5B9A\u4E49\u5934\u4E5F\u7528\u8FD9\u4E00\u4E2A\u4F4D\u7F6E\u3002\n   \u951A\u70B9\u662F\u9762\u677F\u672C\u8EAB\uFF08position:sticky \u5373\u5B9A\u4F4D\u4E0A\u4E0B\u6587\uFF09\uFF0C\u4E0D\u5728\u6EDA\u52A8\u5185\u5BB9\u91CC\uFF0C\u6240\u4EE5\u6B63\u6587\u6EDA\u52A8\u5B83\u4E0D\u8DDF\u6EDA\u3002 */\n.dshpc-dock__close--abs{position:absolute;top:10px;right:8px;z-index:8}\n/* \u6D6E\u52A8\u5173\u94AE\uFF1A\u65E0\u5934\u90E8\u9762\u677F\u7528\uFF0C\u7565\u6536\u4E00\u70B9\u8FB9\u8DDD\u3002 */\n.dshpc-dock__close--floating{\n  position:absolute;top:6px;right:6px;z-index:8;\n  background:var(--dshpc-surface-menu);border:1px solid var(--dshpc-border-faint);\n}\n\n/* \u5185\u5BB9\u533A\u81EA\u5DF1\u6EDA\uFF1A\u9762\u677F\u9AD8\u5EA6\u9501 100vh\uFF0C\u5185\u5BB9\u4E0D\u8BBE\u5185\u90E8\u6EDA\u52A8\u5C31\u4F1A\u628A\u6574\u9875\u6491\u9AD8\u3002 */\n.dshpc-dock__body{flex:1 1 auto;min-height:0;overflow:auto}\n\n/* \u62D6\u62FD\u6761\uFF1A\u5DE6\u7F18 6px \u547D\u4E2D\u533A\uFF0C**\u4E0D\u753B\u7EBF**\uFF0Chover/\u6309\u4F4F\u65F6\u624D\u6D6E\u51FA\u4E00\u6761\u6D45\u8272\u5E26\u3002\n   z-index 7 \u5FC5\u987B\u9AD8\u4E8E\u9762\u677F\u5185\u5BB9\u91CC\u7684\u6D6E\u5C42\uFF08\u590D\u5236\u94AE\u4E00\u7C7B\uFF09\uFF0C\u5426\u5219\u547D\u4E2D\u533A\u4F1A\u88AB\u5185\u5BB9\u76D6\u4F4F\u3002 */\n.dshpc-dock__resizer{\n  position:absolute;left:0;top:0;bottom:0;width:6px;\n  z-index:7;cursor:col-resize;background:transparent;\n  transition:background-color var(--dshpc-dur-fast) var(--dshpc-ease);\n}\n.dshpc-dock__resizer:hover,.dshpc-dock__resizer:active{background:var(--dshpc-hover)}\n\n/* \u62D6\u52A8\u671F\uFF1A\u2460 <iframe>\uFF08PDF / HTML \u9884\u89C8\uFF09\u662F\u72EC\u7ACB\u6587\u6863\uFF0C\u4F1A\u541E\u6389\u7236\u6587\u6863\u7684 pointermove\uFF0C\n   \u5411\u53F3\u62D6\u8FDB iframe \u5C31\u5361\u6B7B \u2014\u2014 \u6574\u7247\u8BA9\u51FA\u6307\u9488\u4E8B\u4EF6\uFF1B\u2461 contain \u628A\u91CD\u6392\u9694\u79BB\u5728\u680F\u5185\uFF0C\n   \u5426\u5219\u6BCF\u5E27\u6539\u5BBD\u5EA6\u90FD\u4F1A\u7275\u52A8\u6574\u9875\u91CD\u6392\uFF08\u5144\u5F1F\u9879\u76EE 2026-10-04 \u771F\u673A\u300C\u632A\u5F88\u4E45\u624D\u52A8\u4E00\u4E0B\u300D\uFF09\u3002 */\n.dshpc-dock.dshpc-dock--resizing iframe{pointer-events:none}\n.dshpc-dock.dshpc-dock--resizing .dshpc-dock__panel{contain:layout paint;will-change:width}\n";

// dist/explorer/explorer-css.generated.js
var EXPLORER_CSS = "/* \u5DE5\u4F5C\u533A\u6587\u4EF6\u6D4F\u89C8\u5668\uFF08dshpc-fb-*\uFF09\u3002\n *\n * \u5EA6\u91CF\u771F\u6E90 = \u5144\u5F1F\u9879\u76EE dsh-task-dispatch-table \u7684 src/client/archive-session-css.ts\n * \uFF08.dsh-tdt-sv-* \u5168\u65CF\uFF09\u3002**\u9010\u6761\u7167\u6284\uFF0C\u4E0D\u8BB8\u81EA\u5DF1\u4F30**\uFF1Apadding / gap / \u5706\u89D2 / \u5B57\u53F7 / \u884C\u9AD8 /\n * \u8FB9\u6846\u8272 / \u60AC\u505C\u8272 / \u900F\u660E\u5EA6\u52A8\u753B / \u6EA2\u51FA\u7B56\u7565\uFF0C\u4E00\u4E00\u5BF9\u5E94\uFF0C\u6539\u8FD9\u91CC\u4E4B\u524D\u5148\u53BB\u90A3\u8FB9\u5BF9\u539F\u6587\u3002\n * \u524D\u7F00\u4E0E\u53D8\u91CF\u540D\u6362\u6210\u672C\u4ED3\u53E3\u5F84\uFF08--tdt-* \u2192 --dshpc-*\uFF09\uFF0C\u6570\u503C\u4E0D\u6362\u3002\n *\n * \u63A7\u4EF6\uFF1A\u80FD\u6838\u5FC3\u5C31\u6838\u5FC3\uFF08\u9762\u5305\u5C51 = Button ghost\u3001\u884C\u5C3E = Button outline\u3001\u5C55\u5F00 / \u56FE\u6807 = IconButton\u3001\n * \u5206\u6BB5 = Segmented\u3001\u6587\u5B57 = MarqueeText\uFF09\u3002\u6838\u5FC3\u63A7\u4EF6\u81EA\u5E26\u7684 padding / \u9AD8\u5EA6 / \u76AE\u80A4\u5728\u672C\u6587\u4EF6\u91CC\n * **\u6309\u5144\u5F1F\u6570\u503C\u8986\u76D6**\uFF08\u9009\u62E9\u5668\u5E26 .dshpc-fb \u524D\u7F00\u63D0\u9AD8\u7279\u5F02\u6027\uFF0C\u786E\u4FDD\u76D6\u5F97\u4F4F\u63A7\u4EF6\u9ED8\u8BA4\u503C\uFF09\u3002\n */\n.dshpc-fb{\n  position:relative;display:flex;flex-direction:column;height:100%;min-height:0;\n  background:var(--dshpc-surface-base);color:var(--dshpc-fg);\n}\n\n/* \u7B2C\u4E00\u6392\uFF1A\u25BE \u9009\u5C42 + \u9762\u5305\u5C51 + \u52A8\u4F5C\uFF08\u5144\u5F1F .dsh-tdt-sv-crumbbar\uFF09\n   \u26A0\uFE0F \u4E0D\u80FD overflow:hidden \u2014\u2014 \u4E0B\u62C9\u6D6E\u5C42\u6302\u5728\u5B83\u4E0B\u9762\uFF0C\u88C1\u4E86\u5C31\u770B\u4E0D\u89C1\u3002 */\n.dshpc-fb__bar{\n  position:relative;flex:none;display:flex;align-items:center;gap:2px;\n  padding:4px 10px;border-bottom:1px solid var(--dshpc-border);white-space:nowrap;\n}\n.dshpc-fb__menu-wrap{position:relative;flex:none;display:inline-flex}\n.dshpc-fb__crumbs{position:relative;flex:1;min-width:0;display:flex;align-items:center;gap:2px;overflow:hidden}\n.dshpc-fb__crumbs-measure{\n  position:absolute;top:0;left:0;display:inline-flex;align-items:center;gap:2px;\n  visibility:hidden;pointer-events:none;white-space:nowrap;\n}\n\n/* \u9762\u5305\u5C51\uFF1A\u6838\u5FC3 ghost \u94AE\uFF0C\u4F46\u76AE\u80A4\u4E0E\u5C3A\u5BF8\u53D6\u5144\u5F1F .dsh-tdt-sv-crumb\uFF08\u9AD8\u7531\u5185\u5BB9\u51B3\u5B9A\uFF0C\u4E0D\u9501\u63A7\u5236\u9AD8\uFF09\u3002 */\n.dshpc-fb .dshpc-fb__crumb{\n  appearance:none;background:0 0;border:none;height:auto;\n  padding:2px 4px;border-radius:var(--dshpc-radius-sm);\n  font:inherit;font-size:var(--dshpc-font-sm);line-height:var(--dshpc-line-sm);\n  color:var(--dshpc-fg-2);cursor:pointer;\n  display:inline-flex;align-items:center;min-width:0;overflow:hidden;text-overflow:ellipsis;\n}\n.dshpc-fb .dshpc-fb__crumb:hover{background:var(--dshpc-hover);color:var(--dshpc-fg)}\n.dshpc-fb .dshpc-fb__crumb:disabled{color:var(--dshpc-fg-2);cursor:default}\n.dshpc-fb .dshpc-fb__crumb--current{cursor:default;color:var(--dshpc-fg);font-weight:600;min-width:0}\n.dshpc-fb .dshpc-fb__crumb--current:hover{background:0 0}\n.dshpc-fb__crumb-mq{flex:1 1 auto;min-width:0}\n.dshpc-fb__crumb-sep{flex:none;color:var(--dshpc-fg-3)}\n\n/* \u8D8A\u754C\uFF08outside-workspace\uFF09\u7B2C\u4E00\u6392\uFF1A\u53EA\u8BFB\u5B8C\u6574\u8DEF\u5F84\uFF08\u5144\u5F1F .dsh-tdt-sv-crumbbar-plain-inner\uFF09\u3002 */\n.dshpc-fb__bar-plain{\n  font-family:var(--dshpc-font-mono,ui-monospace,SFMono-Regular,Menlo,Consolas,monospace);\n  font-size:var(--dshpc-font-sm);line-height:var(--dshpc-line-sm);color:var(--dshpc-fg-2);\n  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:default;user-select:none;\n}\n.dshpc-fb__actions{flex:none;display:flex;align-items:center;gap:4px}\n\n/* \u25BE \u9009\u5C42\u6D6E\u5C42\uFF08\u5144\u5F1F .dsh-tdt-sv-crumbs-*\uFF09\u3002\n   \u5C42\u5E8F\uFF1A\u5144\u5F1F\u662F 30/31\uFF1B\u672C\u4ED3 picker \u9762\u677F\u662F 1100\uFF0C\u906E\u7F69\u5FC5\u987B\u9AD8\u4E8E\u5B83\uFF0C\u5426\u5219\u83DC\u5355\u5F00\u7740\u70B9\u9762\u677F\u4E0D\u7B97\u300C\u70B9\u5916\u90E8\u300D\u3002 */\n.dshpc-fb__crumbs-backdrop{position:fixed;inset:0;z-index:1200;background:transparent}\n.dshpc-fb__crumbs-menu{\n  position:absolute;top:calc(100% + 4px);left:0;z-index:1201;min-width:160px;max-height:240px;overflow:auto;\n  background:var(--dshpc-surface-menu);border:1px solid var(--dshpc-border);border-radius:var(--dshpc-radius-sm);\n  box-shadow:0 4px 16px rgba(0,0,0,.18);padding:4px;display:flex;flex-direction:column;\n}\n.dshpc-fb__menu-item{\n  appearance:none;background:0 0;border:none;text-align:left;font:inherit;\n  font-size:var(--dshpc-font-sm);line-height:var(--dshpc-line-md);\n  padding:4px 8px;border-radius:var(--dshpc-radius-sm);color:var(--dshpc-fg);cursor:pointer;\n  max-width:280px;display:flex;align-items:center;gap:2px;\n  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;\n}\n.dshpc-fb__menu-item:hover{background:var(--dshpc-hover)}\n.dshpc-fb__menu-empty{\n  font-size:var(--dshpc-font-sm);line-height:var(--dshpc-line-md);padding:4px 8px;color:var(--dshpc-fg-3);\n}\n.dshpc-fb__menu-icon{flex:none;display:inline-flex}\n.dshpc-fb__menu-chev{flex:none;color:var(--dshpc-fg-3);margin-right:1px}\n.dshpc-fb__menu-chev-slot{flex:none;width:11px;height:11px;margin-right:1px}\n.dshpc-fb__menu-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n\n/* \u7B2C\u4E8C\u6392\uFF08\u4EC5\u9884\u89C8\u6001\uFF09\uFF1A\u6587\u4EF6\u540D + \u5DE5\u5177\uFF08\u5144\u5F1F .dsh-tdt-sv-titlebar / -preview-title-inner\uFF09\u3002 */\n.dshpc-fb__title{\n  flex:none;display:flex;align-items:center;gap:8px;\n  padding:8px 14px;border-bottom:1px solid var(--dshpc-border);\n}\n.dshpc-fb__title-inner{\n  font-family:var(--dshpc-font-mono,ui-monospace,SFMono-Regular,Menlo,Consolas,monospace);\n  font-size:var(--dshpc-font-sm);line-height:var(--dshpc-line-sm);color:var(--dshpc-fg);\n  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:default;\n}\n\n/* \u4E3B\u4F53\uFF08\u5144\u5F1F .dsh-tdt-sv-preview-body / -hint / -preview-err\uFF09 */\n.dshpc-fb__body{flex:1;min-height:0;overflow-x:hidden;overflow-y:auto;padding:12px 14px}\n.dshpc-fb__note{font-size:var(--dshpc-font-sm);color:var(--dshpc-fg-2);text-align:center;padding:12px 0}\n.dshpc-fb__err{\n  display:flex;flex-direction:column;align-items:flex-start;gap:10px;\n  font-size:var(--dshpc-font-sm);line-height:1.6;color:var(--dshpc-fg-2);padding:8px 0;\n}\n\n/* \u76EE\u5F55\u6811\uFF08\u5144\u5F1F .dsh-tdt-sv-tree*\uFF09 */\n.dshpc-fb__tree{flex:1;min-height:0;overflow:auto;padding:6px 8px}\n.dshpc-fb__row{\n  display:flex;align-items:center;gap:8px;padding:6px 8px;\n  border-radius:var(--dshpc-radius-sm);cursor:pointer;user-select:none;\n}\n.dshpc-fb__row:hover{background:var(--dshpc-hover)}\n.dshpc-fb__row:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:-2px}\n.dshpc-fb__row-icon{flex:none;display:inline-flex;color:var(--dshpc-fg-2)}\n.dshpc-fb__row-name{\n  flex:1;min-width:0;font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);color:var(--dshpc-fg);\n  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;\n}\n\n/* \u5C55\u5F00\u5F00\u5173\uFF1A\u6838\u5FC3 IconButton\uFF0C\u547D\u4E2D\u4F4D 20\xD720 + \u5C55\u5F00\u65F6\u8F6C 90\xB0\uFF08\u5144\u5F1F .dsh-tdt-sv-tree-toggle{,-open}\uFF09\u3002 */\n.dshpc-fb .dshpc-fb__row-toggle{\n  appearance:none;background:0 0;border:none;flex:none;\n  width:20px;height:20px;padding:0;margin:0;border-radius:var(--dshpc-radius-sm);\n  color:var(--dshpc-fg-2);cursor:pointer;\n  display:inline-flex;align-items:center;justify-content:center;\n  transition:transform var(--dshpc-dur-fast) var(--dshpc-ease),background var(--dshpc-dur-fast) var(--dshpc-ease);\n}\n.dshpc-fb .dshpc-fb__row-toggle--open{transform:rotate(90deg)}\n\n/* \u884C\u5C3E\u300C\u8FDB\u5165 / \u9009\u62E9\u300D\uFF1A\u6838\u5FC3 outline \u94AE\uFF0C\u76AE\u80A4\u53D6\u5144\u5F1F .dsh-tdt-sv-tree-act\uFF08\u9AD8\u7531\u5185\u5BB9\u51B3\u5B9A\uFF09\u3002\n   \u5E73\u65F6\u9690\u8EAB\u4F46\u5360\u4F4D\uFF08opacity \u800C\u975E display\uFF09\u21D2 \u51FA\u73B0\u65F6\u4E0D\u9876\u52A8\u884C\u5185\u5E03\u5C40\u3002 */\n.dshpc-fb .dshpc-fb__row-act{\n  flex:none;margin-left:auto;appearance:none;background:0 0;\n  border:1px solid var(--dshpc-border);border-radius:var(--dshpc-radius-sm);\n  height:auto;padding:2px 8px;font-size:var(--dshpc-font-sm);line-height:1.4;\n  color:var(--dshpc-fg-2);cursor:pointer;\n  opacity:0;pointer-events:none;\n  transition:opacity var(--dshpc-dur-fast) var(--dshpc-ease);\n}\n.dshpc-fb__row:hover .dshpc-fb__row-act,.dshpc-fb .dshpc-fb__row-act:focus-visible{opacity:1;pointer-events:auto}\n.dshpc-fb .dshpc-fb__row-act:hover{background:var(--dshpc-hover);color:var(--dshpc-fg)}\n\n.dshpc-fb__row-children{\n  margin-left:9px;padding-left:7px;border-left:1px solid var(--dshpc-border);\n  display:flex;flex-direction:column;\n}\n.dshpc-fb__row-note{flex:none;padding:8px 10px;font-size:var(--dshpc-font-sm);color:var(--dshpc-fg-3)}\n.dshpc-fb__row-err{padding:4px 8px 4px 36px;font-size:var(--dshpc-font-sm);color:var(--dshpc-danger)}\n\n/* \u9884\u89C8\u4F53\u5185\u90E8\u5BB9\u5668\uFF08\u4EC5\u672C\u4ED3\u9884\u89C8\u7EC4\u4EF6\u7528\uFF1B\u5144\u5F1F\u5BF9\u5E94 preview-fill / preview-body-code \u4E00\u7C7B\uFF09 */\n.dshpc-fb__text{flex:1;min-height:0;overflow:auto;width:100%}\n.dshpc-fb__banner{padding:6px 10px;background:var(--dshpc-open-bg);color:var(--dshpc-fg-2);font-size:var(--dshpc-font-sm)}\n.dshpc-fb__more{display:flex;justify-content:center;padding:10px}\n.dshpc-fb__image{max-width:100%;border-radius:var(--dshpc-radius-sm);border:1px solid var(--dshpc-border)}\n.dshpc-fb__frame{flex:1;width:100%;height:100%;border:none;background:var(--dshpc-surface-1)}\n";

// dist/session/session-css.generated.js
var SESSION_CSS = "\n.dshpc-ses{display:flex;flex-direction:column;min-height:0;color:var(--dshpc-fg);font-size:13px}\n.dshpc-ses--sidebar{height:100%;border-left:1px solid var(--dshpc-border-faint);background:var(--dshpc-surface-base)}\n.dshpc-ses--page{height:100%;background:var(--dshpc-surface-base)}\n.dshpc-ses__list{flex:1;min-height:0;overflow:auto;padding:8px 12px;display:flex;flex-direction:column;gap:10px}\n.dshpc-ses__msg{padding:8px 10px;border-radius:8px;background:var(--dshpc-surface-2);border:1px solid var(--dshpc-border-faint)}\n.dshpc-ses__msg--user{background:var(--dshpc-open-bg-soft)}\n.dshpc-ses__head{display:flex;align-items:center;gap:6px;margin-bottom:4px;color:var(--dshpc-fg-3);font-size:11px}\n.dshpc-ses__text{margin:0;white-space:pre-wrap;word-break:break-word;line-height:1.6}\n.dshpc-ses__atts{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}\n.dshpc-ses__att{\n  display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;\n  background:var(--dshpc-chip-bg);color:var(--dshpc-fg);cursor:pointer;border:none;font:inherit;font-size:12px;\n}\n.dshpc-ses__att:hover{background:var(--dshpc-chip-bg-hover)}\n.dshpc-ses__note{padding:12px;color:var(--dshpc-fg-3);text-align:center}\n";

// dist/ui/css.js
var CONTROLS_DOMAIN = "controls";
var CONTROLS_CSS = [
  SEGMENTED_CSS,
  BUTTON_CSS,
  FIELD_CSS,
  LOADING_CSS,
  BACK_TO_TOP_CSS,
  HINT_CSS,
  PICKER_CSS,
  FEEDBACK_CSS,
  EXPLORER_CSS,
  SESSION_CSS,
  CARD_CSS,
  CHIP_CSS,
  MARQUEE_CSS,
  PANEL_DOCK_CSS
].join("\n");
var current = createStyleKit({ id: "dsh-plugin-core-ui" });
function setStyleKit(kit) {
  current = kit;
}
function getStyleKit() {
  return current;
}
function ensureControls(kit = current) {
  kit.registerStyle("tokens", kit.tokensCss);
  kit.applyStyle(CONTROLS_DOMAIN, CONTROLS_CSS);
}

// dist/ui/picker-logic.js
function toGroups(groups, options) {
  if (groups !== void 0 && groups.length > 0)
    return groups;
  const flat = options ?? [];
  return flat.length === 0 ? [] : [{ value: "", label: "", options: flat }];
}
function flattenOptions(groups) {
  const out = [];
  for (const g of groups)
    out.push(...g.options);
  return out;
}
function filterGroups(groups, query) {
  const q = query.trim().toLowerCase();
  if (q === "")
    return groups;
  const out = [];
  for (const g of groups) {
    const hit = g.options.filter((o) => o.label.toLowerCase().includes(q));
    if (hit.length > 0)
      out.push({ ...g, options: hit });
  }
  return out;
}
function toggleValue(current3, value, max) {
  const idx = current3.indexOf(value);
  if (idx >= 0)
    return current3.filter((v) => v !== value);
  if (max !== void 0 && current3.length >= max)
    return [...current3];
  return [...current3, value];
}
function labelsOf(groups, values) {
  const all = flattenOptions(groups);
  const out = [];
  for (const v of values) {
    const hit = all.find((o) => o.value === v);
    if (hit !== void 0)
      out.push(hit.label);
  }
  return out;
}
function groupOf(groups, value) {
  if (value === "")
    return void 0;
  return groups.find((g) => g.options.some((o) => o.value === value));
}

// dist/ui/Picker.js
var import_react2 = require("react");

// dist/utils/i18n.js
var DICT = {
  zh: {
    sessionLoading: "\u52A0\u8F7D\u4F1A\u8BDD\u2026",
    sessionFailed: "\u4F1A\u8BDD\u52A0\u8F7D\u5931\u8D25",
    sessionEmpty: "\u8BE5\u4F1A\u8BDD\u6682\u65E0\u5185\u5BB9",
    sessionAttachments: "\u9644\u4EF6",
    sessionRoleUser: "\u7528\u6237",
    sessionRoleAssistant: "\u52A9\u624B",
    sessionRoleTool: "\u5DE5\u5177",
    explorerLoading: "\u52A0\u8F7D\u4E2D\u2026",
    explorerFailed: "\u52A0\u8F7D\u5931\u8D25",
    explorerRoot: "\u5DE5\u4F5C\u533A",
    explorerTruncated: "\u6761\u76EE\u8FC7\u591A\uFF0C\u5DF2\u622A\u65AD",
    explorerEmptyDir: "\u7A7A\u76EE\u5F55",
    explorerLevels: "\u9009\u62E9\u5C42\u7EA7",
    explorerExpand: "\u5C55\u5F00",
    explorerCollapse: "\u6536\u8D77",
    explorerEnter: "\u8FDB\u5165",
    explorerRootName: "\uFF08\u5DE5\u4F5C\u533A\u6839\u76EE\u5F55\uFF09",
    explorerCrumbsAria: "\u76EE\u5F55\u8DEF\u5F84",
    explorerPickFile: "\u9009\u62E9\u6B64\u6587\u4EF6",
    explorerPickDir: "\u9009\u62E9",
    explorerPickDirAria: "\u9009\u62E9\u6B64\u76EE\u5F55\uFF08\u8FDE\u5E26\u5176\u4E0B\u6240\u6709\u6587\u4EF6\uFF09",
    previewClose: "\u5173\u95ED",
    previewCopyPath: "\u590D\u5236\u8DEF\u5F84",
    previewRefresh: "\u5237\u65B0",
    previewRender: "\u9884\u89C8",
    previewSource: "\u6E90\u7801",
    previewMdSwitchAria: "\u5207\u6362\u6E32\u67D3\u6216\u6E90\u7801",
    previewHtmlSwitchAria: "\u5207\u6362\u6E32\u67D3\u6216\u6E90\u7801",
    previewLoadMore: "\u52A0\u8F7D\u66F4\u591A",
    previewTruncated: "\u5185\u5BB9\u8FC7\u5927\uFF0C\u4EC5\u663E\u793A\u524D {n}",
    previewOfficeUnavailable: "Office \u9884\u89C8\u4E0D\u53EF\u7528",
    previewRenderFailed: "\u9884\u89C8\u6E32\u67D3\u5931\u8D25",
    previewBadPayload: "\u8FD4\u56DE\u6570\u636E\u4E0D\u7B26\u5408\u9884\u671F",
    previewOutside: "\u8DEF\u5F84\u5728\u5DE5\u4F5C\u533A\u4E4B\u5916",
    previewNotFound: "\u6587\u4EF6\u4E0D\u5B58\u5728",
    previewNotDirectory: "\u4E0D\u662F\u6587\u4EF6\u5939",
    previewTooLarge: "\u6587\u4EF6\u8FC7\u5927\uFF0C\u65E0\u6CD5\u9884\u89C8",
    previewNotText: "\u4E0D\u662F\u6587\u672C\u6587\u4EF6",
    mdCopy: "\u590D\u5236",
    mdCopied: "\u5DF2\u590D\u5236",
    mdCode: "\u4EE3\u7801",
    mdWrap: "\u6362\u884C",
    mdUnwrap: "\u53D6\u6D88\u6362\u884C",
    mdFootnotes: "\u811A\u6CE8",
    cardToggle: "\u5C55\u5F00/\u6536\u8D77",
    modalClose: "\u5173\u95ED",
    dockClose: "\u5173\u95ED\u9762\u677F",
    dockResize: "\u62D6\u52A8\u8C03\u6574\u5BBD\u5EA6",
    emptyText: "\u6682\u65E0\u6570\u636E",
    errorRetry: "\u91CD\u8BD5",
    confirm: "\u786E\u5B9A",
    cancel: "\u53D6\u6D88",
    dialogOk: "\u77E5\u9053\u4E86",
    pickerPlaceholder: "\u8BF7\u9009\u62E9",
    pickerClear: "\u4E0D\u9009",
    pickerEmpty: "\u6682\u65E0\u53EF\u9009",
    pickerNoMatch: "\u65E0\u5339\u914D\u9879",
    pickerSearch: "\u641C\u7D22\u2026",
    pickerSelected: "\u5DF2\u9009 {n} \u9879",
    pickerMaxReached: "\u6700\u591A\u9009 {n} \u9879",
    pickerDegraded: "\u5019\u9009\u53EF\u80FD\u4E0D\u5B8C\u6574",
    modelProvider: "\u4F9B\u5E94\u5546",
    modelModel: "\u6A21\u578B",
    modelDefault: "\u9ED8\u8BA4\u6A21\u578B",
    workspaceAll: "\u6240\u6709\u5DE5\u4F5C\u533A",
    relNow: "\u521A\u521A",
    relInJustNow: "\u5373\u5C06",
    relInMinutes: "{n} \u5206\u949F\u540E",
    relInHours: "{n} \u5C0F\u65F6\u540E",
    relInDays: "{n} \u5929\u540E",
    relInMonths: "{n} \u4E2A\u6708\u540E",
    relInYears: "{n} \u5E74\u540E",
    relJustNow: "\u521A\u521A",
    relMinutesAgo: "{n} \u5206\u949F\u524D",
    relHoursAgo: "{n} \u5C0F\u65F6\u524D",
    relDaysAgo: "{n} \u5929\u524D",
    relWeeksAgo: "{n} \u5468\u524D",
    relMonthsAgo: "{n} \u4E2A\u6708\u524D",
    relYearsAgo: "{n} \u5E74\u524D"
  },
  en: {
    sessionLoading: "Loading session\u2026",
    sessionFailed: "Failed to load session",
    sessionEmpty: "No content in this session",
    sessionAttachments: "Attachments",
    sessionRoleUser: "User",
    sessionRoleAssistant: "Assistant",
    sessionRoleTool: "Tool",
    explorerLoading: "Loading\u2026",
    explorerFailed: "Failed to load",
    explorerRoot: "Workspace",
    explorerTruncated: "Too many entries, truncated",
    explorerEmptyDir: "Empty folder",
    explorerLevels: "Jump to level",
    explorerExpand: "Expand",
    explorerCollapse: "Collapse",
    explorerEnter: "Open",
    explorerRootName: "(workspace root)",
    explorerCrumbsAria: "Breadcrumb",
    explorerPickFile: "Pick this file",
    explorerPickDir: "Select",
    explorerPickDirAria: "Pick this folder (with everything under it)",
    previewClose: "Close",
    previewCopyPath: "Copy path",
    previewRefresh: "Refresh",
    previewRender: "Preview",
    previewSource: "Source",
    previewMdSwitchAria: "Toggle render or source",
    previewHtmlSwitchAria: "Toggle render or source",
    previewLoadMore: "Load more",
    previewTruncated: "Content too large, showing first {n}",
    previewOfficeUnavailable: "Office preview unavailable",
    previewRenderFailed: "Failed to render preview",
    previewBadPayload: "Unexpected response payload",
    previewOutside: "Path is outside the workspace",
    previewNotFound: "File not found",
    previewNotDirectory: "Not a folder",
    previewTooLarge: "File too large to preview",
    previewNotText: "Not a text file",
    mdCopy: "Copy",
    mdCopied: "Copied",
    mdCode: "Code",
    mdWrap: "Wrap",
    mdUnwrap: "Unwrap",
    mdFootnotes: "Footnotes",
    cardToggle: "Expand/Collapse",
    modalClose: "Close",
    dockClose: "Close panel",
    dockResize: "Drag to resize",
    emptyText: "No data",
    errorRetry: "Retry",
    confirm: "Confirm",
    cancel: "Cancel",
    dialogOk: "OK",
    pickerPlaceholder: "Select\u2026",
    pickerClear: "None",
    pickerEmpty: "No options",
    pickerNoMatch: "No match",
    pickerSearch: "Search\u2026",
    pickerSelected: "{n} selected",
    pickerMaxReached: "Up to {n}",
    pickerDegraded: "List may be incomplete",
    modelProvider: "Provider",
    modelModel: "Model",
    modelDefault: "Default model",
    workspaceAll: "All workspaces",
    relNow: "just now",
    relInJustNow: "soon",
    relInMinutes: "in {n}m",
    relInHours: "in {n}h",
    relInDays: "in {n}d",
    relInMonths: "in {n}mo",
    relInYears: "in {n}y",
    relJustNow: "just now",
    relMinutesAgo: "{n}m ago",
    relHoursAgo: "{n}h ago",
    relDaysAgo: "{n}d ago",
    relWeeksAgo: "{n}w ago",
    relMonthsAgo: "{n}mo ago",
    relYearsAgo: "{n}y ago"
  }
};
var current2 = "zh";
function setLocale(locale) {
  current2 = locale;
}
function getLocale() {
  return current2;
}
function t(key, vars) {
  const template = DICT[current2][key] ?? DICT.zh[key] ?? key;
  if (vars === void 0)
    return template;
  return template.replace(/\{(\w+)\}/g, (whole, name) => {
    const value = vars[name];
    return value === void 0 ? whole : String(value);
  });
}

// dist/ui/tooltip.js
var renderer;
function setTooltipRenderer(fn) {
  renderer = fn;
}
function getTooltipRenderer() {
  return renderer;
}

// dist/ui/FieldHint.js
var import_react = require("react");
function FieldHint(props) {
  ensureControls();
  const { text, side, align, maxWidth, className, style } = props;
  const anchor = (0, import_react.createElement)("span", {
    className: `dshpc-hint${className !== void 0 && className !== "" ? ` ${className}` : ""}`,
    style,
    tabIndex: 0,
    role: "note",
    "aria-label": text
  }, "?");
  const renderer2 = getTooltipRenderer();
  if (renderer2 === void 0)
    return anchor;
  return renderer2({
    label: text,
    side: side ?? "top",
    ...align !== void 0 ? { align } : {},
    ...maxWidth !== void 0 ? { maxWidth } : {},
    children: anchor
  });
}

// dist/ui/Picker.js
function Picker(props) {
  ensureControls();
  const tt = props.translate ?? t;
  const mode = props.mode ?? "single";
  const size = props.size ?? "md";
  const placement = props.placement ?? "down";
  const clearable = props.clearable === true;
  const showLabels = props.showLabels !== false;
  const groups = (0, import_react2.useMemo)(() => toGroups(props.groups, props.options), [props.groups, props.options]);
  const controlled = props.value !== void 0;
  const [inner, setInner] = (0, import_react2.useState)(() => toArray(props.defaultValue));
  const selected = controlled ? toArray(props.value) : inner;
  const emit = (next) => {
    if (!controlled)
      setInner(next);
    props.onChange?.(mode === "single" ? next[0] ?? "" : next);
  };
  const [open, setOpen] = (0, import_react2.useState)(false);
  const [query, setQuery] = (0, import_react2.useState)("");
  const [active, setActive] = (0, import_react2.useState)(-1);
  const rootRef = (0, import_react2.useRef)(null);
  const searchRef = (0, import_react2.useRef)(null);
  (0, import_react2.useEffect)(() => {
    if (open && props.searchable === true)
      searchRef.current?.focus();
  }, [open, props.searchable]);
  (0, import_react2.useEffect)(() => {
    if (!open)
      return;
    const onDown = (e) => {
      const root = rootRef.current;
      if (root !== null && !root.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);
  (0, import_react2.useEffect)(() => {
    if (open)
      return;
    setQuery("");
    setActive(-1);
  }, [open]);
  const shown = filterGroups(groups, query);
  const flat = flattenOptions(shown);
  const atMax = mode === "multiple" && props.max !== void 0 && selected.length >= props.max;
  const summary = selected.length === 0 ? props.placeholder ?? tt("pickerPlaceholder") : mode === "multiple" && !showLabels ? tt("pickerSelected", { n: selected.length }) : labelsOf(groups, selected).join("\u3001") || (props.placeholder ?? tt("pickerPlaceholder"));
  const pick2 = (value) => {
    if (mode === "single") {
      emit([value]);
      setOpen(false);
      return;
    }
    emit(toggleValue(selected, value, props.max));
    if (props.closeOnSelect === true)
      setOpen(false);
  };
  const clear = () => {
    emit([]);
    setOpen(false);
  };
  const onKeyDown = (e) => {
    if (!open)
      return;
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (flat.length === 0)
      return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const dir = e.key === "ArrowDown" ? 1 : -1;
      setActive((cur) => (cur + dir + flat.length) % flat.length);
      return;
    }
    if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      const hit = flat[active];
      if (hit !== void 0)
        pick2(hit.value);
    }
  };
  const trigger = (0, import_react2.createElement)(
    "button",
    {
      type: "button",
      "aria-label": props.ariaLabel,
      "aria-expanded": open,
      className: `dshpc-picker__trigger dshpc-picker__trigger--${size}${props.align === "center" ? " dshpc-picker__trigger--center" : ""}`,
      disabled: props.disabled === true,
      onClick: () => {
        if (props.disabled !== true)
          setOpen(!open);
      }
    },
    props.icon !== void 0 && props.icon !== null ? (0, import_react2.createElement)("span", { className: "dshpc-picker__icon" }, props.icon) : null,
    // 文字吃掉剩余宽度并靠左（默认）：否则 space-between 会把短文案推到中间
    (0, import_react2.createElement)("span", { className: "dshpc-picker__label" }, summary),
    (0, import_react2.createElement)("svg", {
      className: "dshpc-picker__caret",
      width: 12,
      height: 12,
      viewBox: "0 0 16 16",
      fill: "none",
      "aria-hidden": true
    }, (0, import_react2.createElement)("path", {
      d: "M4 6l4 4 4-4",
      stroke: "currentColor",
      "stroke-width": 1.5,
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }))
  );
  const triggerRow = props.hint === void 0 ? trigger : (0, import_react2.createElement)("span", { className: "dshpc-fieldwrap dshpc-fieldwrap--inline" }, trigger, (0, import_react2.createElement)(FieldHint, { text: props.hint }));
  return (0, import_react2.createElement)("div", {
    className: `dshpc-picker${props.className === void 0 ? "" : ` ${props.className}`}`,
    ref: rootRef,
    onKeyDown
  }, triggerRow, open ? (0, import_react2.createElement)("div", {
    className: placement === "up" ? "dshpc-picker__menu dshpc-picker__menu--up" : "dshpc-picker__menu"
  }, props.degraded === true ? (0, import_react2.createElement)("div", { className: "dshpc-picker__degraded" }, tt("pickerDegraded")) : null, atMax ? (0, import_react2.createElement)("div", { className: "dshpc-picker__degraded" }, tt("pickerMaxReached", { n: props.max ?? 0 })) : null, props.searchable === true ? (0, import_react2.createElement)("input", {
    ref: searchRef,
    className: "dshpc-picker__search",
    placeholder: tt("pickerSearch"),
    value: query,
    onChange: (e) => setQuery(e.target.value)
  }) : null, flat.length === 0 && groups.length === 0 ? (0, import_react2.createElement)("div", { className: "dshpc-picker__empty" }, tt("pickerEmpty")) : flat.length === 0 ? (0, import_react2.createElement)("div", { className: "dshpc-picker__empty" }, tt("pickerNoMatch")) : [
    clearable && mode === "single" && selected.length > 0 ? (0, import_react2.createElement)("div", {
      key: "__clear__",
      className: "dshpc-picker__option dshpc-picker__option--clear",
      onClick: clear
    }, tt("pickerClear")) : null,
    ...shown.map((g) => (0, import_react2.createElement)("div", { key: g.value || "_" }, g.label === "" ? null : (0, import_react2.createElement)("div", { className: "dshpc-picker__group-label" }, g.label), g.options.map((o) => {
      const blocked = o.disabled === true || atMax && !selected.includes(o.value);
      const activeCls = [
        "dshpc-picker__option",
        selected.includes(o.value) ? "dshpc-picker__option--active" : "",
        blocked ? "dshpc-picker__option--disabled" : ""
      ].filter((s) => s !== "").join(" ");
      const idx = flat.indexOf(o);
      return (0, import_react2.createElement)("div", {
        key: o.value,
        className: activeCls,
        "data-active": idx === active ? "true" : void 0,
        onClick: () => {
          if (!blocked)
            pick2(o.value);
        }
      }, mode === "multiple" ? (0, import_react2.createElement)("span", { className: "dshpc-picker__tick" }, selected.includes(o.value) ? "\u2713" : "") : null, o.icon !== void 0 && o.icon !== null ? (0, import_react2.createElement)("span", { className: "dshpc-picker__option-icon" }, o.icon) : null, (0, import_react2.createElement)("span", null, o.label));
    })))
  ]) : null);
}
function toArray(v) {
  if (v === void 0)
    return [];
  return Array.isArray(v) ? [...v] : [v];
}

// dist/ui/ModelPicker.js
var import_react4 = require("react");

// dist/ui/host-data.js
var ModelCatalogStore = class {
  constructor() {
    this.snapshot = { status: "loading" };
    this.listeners = /* @__PURE__ */ new Set();
    this.getSnapshot = () => this.snapshot;
    this.subscribe = (listener) => {
      this.listeners.add(listener);
      return () => {
        this.listeners.delete(listener);
      };
    };
  }
  update(next) {
    this.snapshot = next;
    for (const listener of this.listeners)
      listener();
  }
  setRoutes(routes) {
    this.update({ status: "ready", routes });
  }
  setUnavailable(reason) {
    this.update({ status: "unavailable", reason });
  }
};
var modelCatalog = new ModelCatalogStore();
var WorkspaceListStore = class {
  constructor() {
    this.items = [];
    this.listeners = /* @__PURE__ */ new Set();
    this.getSnapshot = () => this.items;
    this.subscribe = (listener) => {
      this.listeners.add(listener);
      return () => {
        this.listeners.delete(listener);
      };
    };
  }
  /** 换源（仅 connectHost 调；重复调用换到新源）。 */
  setSource(source) {
    this.unsubscribe?.();
    const pull = () => {
      this.items = source.getSnapshot().items;
      for (const listener of this.listeners)
        listener();
    };
    pull();
    this.unsubscribe = source.subscribe(pull);
  }
};
var workspaceList = new WorkspaceListStore();
function isWorkspaceSource(value) {
  if (value === null || typeof value !== "object")
    return false;
  const rec = value;
  return typeof rec.getSnapshot === "function" && typeof rec.subscribe === "function";
}
function connectHost(ctx, options = {}) {
  ctx.inject(["workspaces"], (sub) => {
    const source = sub?.workspaces?.list;
    if (isWorkspaceSource(source))
      workspaceList.setSource(source);
  });
  const modelsPath = options.modelsPath;
  if (modelsPath === void 0)
    return;
  void fetch(modelsPath).then((response) => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`))).then((data) => {
    const routes = data?.routes;
    if (!Array.isArray(routes))
      throw new Error("\u6A21\u578B\u76EE\u5F55\u54CD\u5E94\u7F3A\u5C11 routes");
    modelCatalog.setRoutes(routes);
  }).catch((error) => {
    modelCatalog.setUnavailable(String(error));
  });
}

// dist/ui/picker-icons.js
var import_react3 = require("react");
function glyph(path) {
  return (0, import_react3.createElement)("svg", { width: 14, height: 14, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true }, path);
}
function folderIcon() {
  return glyph((0, import_react3.createElement)("path", {
    d: "M2 4.5A1.5 1.5 0 0 1 3.5 3h2.6l1.2 1.5h5.2A1.5 1.5 0 0 1 14 6v5.5A1.5 1.5 0 0 1 12.5 13h-9A1.5 1.5 0 0 1 2 11.5z",
    stroke: "currentColor",
    "stroke-width": 1.3,
    "stroke-linejoin": "round"
  }));
}
function sparkleIcon() {
  return glyph((0, import_react3.createElement)("path", {
    d: "M8 1.8l1.6 4.1 4.1 1.6-4.1 1.6L8 13.2 6.4 9.1 2.3 7.5l4.1-1.6z",
    stroke: "currentColor",
    "stroke-width": 1.2,
    "stroke-linejoin": "round"
  }));
}

// dist/ui/ModelPicker.js
function ModelPicker(props) {
  ensureControls();
  const tt = props.translate ?? t;
  const value = props.value;
  const variant = props.variant ?? "grouped";
  const searchable = props.searchable ?? true;
  const defaultOption = props.allowDefault === false ? void 0 : { value: "", label: props.defaultLabel ?? tt("modelDefault") };
  const catalog = (0, import_react4.useSyncExternalStore)(modelCatalog.subscribe, modelCatalog.getSnapshot);
  const groups = props.groups ?? (catalog.status === "ready" ? catalog.routes.map((route) => ({
    value: route.provider,
    label: route.displayName,
    options: route.models.map((model) => ({
      value: `${route.provider}/${model.id}`,
      label: model.name ?? model.id
    }))
  })) : []);
  const degraded = props.degraded ?? (catalog.status === "unavailable" || catalog.status === "ready" && groups.length === 0);
  const icon = props.icon === void 0 ? sparkleIcon() : props.icon ?? void 0;
  const emitModel = (v) => {
    props.onChange?.(typeof v === "string" ? v : v[0] ?? "");
  };
  const [pickedProvider, setPickedProvider] = (0, import_react4.useState)("");
  const curGroup = groupOf(groups, value ?? "");
  const provider = pickedProvider !== "" && groups.some((g) => g.value === pickedProvider) ? pickedProvider : curGroup?.value ?? "";
  (0, import_react4.useEffect)(() => {
    if (value !== void 0 && value !== "")
      setPickedProvider("");
  }, [value]);
  if (variant === "grouped") {
    return (0, import_react4.createElement)(Picker, {
      // 「默认模型」放最上面：空 label 的组，Picker 只渲染选项不渲染组头
      groups: defaultOption === void 0 ? groups : [{ value: "", label: "", options: [defaultOption] }, ...groups],
      value,
      defaultValue: props.defaultValue,
      icon,
      placeholder: props.placeholder ?? tt("modelModel"),
      degraded,
      disabled: props.disabled,
      clearable: props.clearable,
      searchable,
      hint: props.hint,
      size: props.size,
      placement: props.placement,
      className: props.className,
      onChange: emitModel
    });
  }
  const group = groups.find((g) => g.value === provider);
  const options = group === void 0 ? [] : flattenOptions([group]);
  return (0, import_react4.createElement)("div", { className: "dshpc-picker__row" }, (0, import_react4.createElement)(Picker, {
    options: groups.map((g) => ({ value: g.value, label: g.label })),
    value: provider === "" ? void 0 : provider,
    placeholder: tt("modelProvider"),
    degraded,
    disabled: props.disabled,
    searchable: false,
    onChange: (v) => {
      setPickedProvider(typeof v === "string" ? v : v[0] ?? "");
      props.onChange?.("");
    }
  }), (0, import_react4.createElement)(Picker, {
    options: defaultOption === void 0 ? options : [defaultOption, ...options],
    value,
    defaultValue: props.defaultValue,
    icon,
    placeholder: props.placeholder ?? tt("modelModel"),
    degraded,
    disabled: props.disabled === true || provider === "",
    clearable: props.clearable,
    searchable,
    hint: props.hint,
    size: props.size,
    placement: props.placement,
    className: props.className,
    onChange: emitModel
  }));
}

// dist/ui/WorkspacePicker.js
var import_react5 = require("react");
function WorkspacePicker(props) {
  ensureControls();
  const tt = props.translate ?? t;
  const items = (0, import_react5.useSyncExternalStore)(workspaceList.subscribe, workspaceList.getSnapshot);
  const options = items.map((w) => ({ value: w.workspaceId, label: w.title }));
  const allOption = props.allowDefault !== false && props.mode !== "multiple" ? { value: "", label: props.defaultLabel ?? tt("workspaceAll") } : void 0;
  return (0, import_react5.createElement)(Picker, {
    options: allOption === void 0 ? options : [allOption, ...options],
    value: props.value,
    defaultValue: props.defaultValue,
    mode: props.mode,
    max: props.max,
    onChange: props.onChange,
    clearable: props.clearable,
    searchable: props.searchable,
    hint: props.hint,
    icon: props.icon === void 0 ? folderIcon() : props.icon ?? void 0,
    placeholder: props.placeholder ?? tt("explorerRoot"),
    disabled: props.disabled,
    size: props.size,
    placement: props.placement,
    className: props.className
  });
}

// dist/ui/Modal.js
var import_react6 = require("react");
function Modal(props) {
  ensureControls();
  const tt = props.translate ?? t;
  const closeOnMask = props.closeOnMask !== false;
  const escClose = props.escClose !== false;
  (0, import_react6.useEffect)(() => {
    if (!escClose || props.onClose === void 0)
      return;
    const onKey = (e) => {
      if (e.key === "Escape")
        props.onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [escClose, props.onClose]);
  const sizeStyle = {
    sm: { width: "360px", maxWidth: "calc(100vw - 48px)" },
    md: { width: "min(720px, calc(100vw - 32px))", maxHeight: "86vh" },
    lg: { width: "min(1120px, calc(100vw - 32px))", height: "calc(100% - 80px)" }
  };
  const s = sizeStyle[props.size ?? "md"];
  const showClose = props.closable !== false && props.onClose !== void 0;
  const showHeader = props.hideHeader !== true && (props.icon !== void 0 || props.title !== void 0 || props.headerExtra !== void 0 || props.headerActions !== void 0 || showClose);
  return (0, import_react6.createElement)("div", {
    className: "dshpc-modal-mask",
    onClick: () => {
      if (closeOnMask)
        props.onClose?.();
    }
  }, (0, import_react6.createElement)("div", {
    className: `dshpc-modal${props.size ? ` dshpc-modal--${props.size}` : ""}`,
    style: {
      width: props.width ?? s.width,
      maxWidth: props.maxWidth ?? s.maxWidth,
      maxHeight: props.maxHeight ?? s.maxHeight,
      height: props.height ?? s.height
    },
    onClick: (e) => e.stopPropagation()
  }, showHeader ? (0, import_react6.createElement)("div", { className: "dshpc-modal__head" }, (0, import_react6.createElement)("div", { className: "dshpc-modal__heading" }, props.icon === void 0 ? null : (0, import_react6.createElement)("span", { className: "dshpc-modal__lead" }, props.icon), (0, import_react6.createElement)("div", { className: "dshpc-modal__title" }, props.title ?? ""), props.headerExtra === void 0 ? null : (0, import_react6.createElement)("div", { className: "dshpc-modal__extra" }, props.headerExtra)), (0, import_react6.createElement)("div", { className: "dshpc-modal__spacer" }), props.headerActions === void 0 ? null : (0, import_react6.createElement)("div", { className: "dshpc-modal__actions" }, props.headerActions), showClose ? (0, import_react6.createElement)("button", {
    type: "button",
    className: "dshpc-modal__close",
    "aria-label": tt("modalClose"),
    onClick: () => props.onClose?.()
  }, "\u2715") : null) : null, (0, import_react6.createElement)("div", { className: "dshpc-modal__body" }, props.children ?? null), props.footer === void 0 ? null : (0, import_react6.createElement)("div", { className: "dshpc-modal__foot" }, props.footer)));
}

// dist/ui/AlertModal.js
var import_react8 = require("react");

// dist/ui/Button.js
var import_react7 = require("react");
var SOLID_VARIANTS = ["primary", "secondary", "danger", "success", "warning", "info"];
function colorVars(variant, color) {
  if (color === void 0 || color === "")
    return void 0;
  if (SOLID_VARIANTS.includes(variant)) {
    return {
      "--btn-bg": color,
      // 亮色主题下 --dshpc-fg 是黑 ⇒ 压深；暗色下是白 ⇒ 提亮。两边都能明确看出变化。
      "--btn-bg-hover": `color-mix(in srgb, ${color} 82%, var(--dshpc-fg))`,
      "--btn-bg-active": `color-mix(in srgb, ${color} 70%, var(--dshpc-fg))`
    };
  }
  return {
    "--btn-fg": color,
    "--btn-fg-hover": color,
    "--btn-border": color,
    "--btn-bg-hover": `color-mix(in srgb, ${color} 12%, transparent)`,
    "--btn-bg-active": `color-mix(in srgb, ${color} 18%, transparent)`
  };
}
function buttonClass(variant, size, block, hasIcon, extra) {
  return `dshpc-btn dshpc-btn--${variant} dshpc-btn--${size}${block ? " dshpc-btn--block" : ""}${hasIcon ? " dshpc-btn--icon-start" : ""}${extra !== void 0 && extra !== "" ? ` ${extra}` : ""}`;
}
function Button(props) {
  ensureControls();
  const { variant = "outline", size = "lg", icon, iconRight, color, loading = false, block = false, className, style, children, ...rest } = props;
  const attrs = {
    ...rest,
    type: rest.type ?? "button",
    disabled: rest.disabled === true || loading,
    className: buttonClass(variant, size, block, icon !== void 0 && icon !== null && !loading, className),
    style: { ...colorVars(variant, color), ...style }
  };
  return (0, import_react7.createElement)("button", attrs, loading ? (0, import_react7.createElement)("svg", {
    className: "dshpc-btn__spinner",
    viewBox: "0 0 12 12",
    width: 12,
    height: 12,
    "aria-hidden": true
  }, (0, import_react7.createElement)("circle", {
    cx: 6,
    cy: 6,
    r: 4.75,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    // 周长 ≈ 29.85，画 22 的弧 + 足够长的空缺 ⇒ 一个约 270° 的开口环
    strokeDasharray: "22 30"
  })) : icon !== void 0 && icon !== null ? (0, import_react7.createElement)("span", { className: "dshpc-btn__icon" }, icon) : null, children, iconRight !== void 0 && iconRight !== null ? (0, import_react7.createElement)("span", { className: "dshpc-btn__icon-end" }, iconRight) : null);
}
function IconButton(props) {
  ensureControls();
  const { variant = "plain", size = "lg", icon, label, className, style, ...rest } = props;
  const attrs = {
    ...rest,
    type: rest.type ?? "button",
    title: rest.title ?? label,
    "aria-label": rest["aria-label"] ?? label,
    className: `dshpc-iconbtn dshpc-iconbtn--${variant} dshpc-iconbtn--${size}${className !== void 0 && className !== "" ? ` ${className}` : ""}`,
    style
  };
  return (0, import_react7.createElement)("button", attrs, icon);
}

// dist/ui/AlertModal.js
var SEVERITY_GLYPH = {
  info: "\u24D8",
  success: "\u2713",
  warning: "\u26A0",
  error: "\u2715"
};
function AlertModal(props) {
  const tt = props.translate ?? t;
  const severity = props.severity ?? "info";
  return (0, import_react8.createElement)(Modal, {
    icon: (0, import_react8.createElement)("span", { className: `dshpc-alert-sev dshpc-alert-sev--${severity}` }, SEVERITY_GLYPH[severity]),
    title: props.title,
    size: props.size ?? "sm",
    hideHeader: props.title === void 0,
    closable: false,
    closeOnMask: props.closeOnMask,
    onClose: props.onConfirm,
    footer: (0, import_react8.createElement)(Button, { variant: "primary", onClick: () => props.onConfirm?.() }, props.confirmText ?? tt("dialogOk"))
  }, props.message ?? null);
}

// dist/ui/ConfirmModal.js
var import_react9 = require("react");
function ConfirmModal(props) {
  const tt = props.translate ?? t;
  const tone = props.tone ?? "primary";
  const confirmVariant = tone === "danger" ? "danger" : tone === "warning" ? "warning" : "primary";
  return (0, import_react9.createElement)(Modal, {
    title: props.title,
    size: props.size ?? "sm",
    hideHeader: props.title === void 0,
    closable: false,
    closeOnMask: props.closeOnMask,
    onClose: props.onCancel,
    footer: (0, import_react9.createElement)("div", { style: { display: "flex", gap: "8px", justifyContent: "flex-end" } }, (0, import_react9.createElement)(Button, { variant: "outline", onClick: () => props.onCancel?.() }, props.cancelText ?? tt("cancel")), (0, import_react9.createElement)(Button, { variant: confirmVariant, onClick: () => props.onConfirm?.() }, props.confirmText ?? tt("confirm")))
  }, props.message ?? null);
}

// dist/ui/modal-host.js
var import_react10 = require("react");
var import_client = require("react-dom/client");
var hostRoot = null;
var hostContainer = null;
var entries = [];
var idSeq = 0;
function getHostRoot() {
  if (typeof document === "undefined")
    return null;
  if (hostRoot === null) {
    hostContainer = document.createElement("div");
    hostContainer.setAttribute("data-dshpc-modal-host", "");
    document.body.appendChild(hostContainer);
    hostRoot = (0, import_client.createRoot)(hostContainer);
  }
  return hostRoot;
}
function flush() {
  const root = getHostRoot();
  if (root === null)
    return;
  ensureControls(getStyleKit());
  if (entries.length === 0) {
    root.unmount();
    hostContainer?.remove();
    hostRoot = null;
    hostContainer = null;
    return;
  }
  root.render((0, import_react10.createElement)(import_react10.Fragment, null, entries.map((e) => e.node)));
}
function dismiss(id) {
  entries = entries.filter((e) => e.id !== id);
  flush();
}
var hostHandlers = null;
function registerHostDialog(handlers) {
  hostHandlers = handlers;
}
function confirmModal(opts) {
  if (opts.skin === "host") {
    if (hostHandlers !== null) {
      return hostHandlers.confirm({
        title: opts.title == null ? void 0 : String(opts.title),
        description: opts.message == null ? void 0 : String(opts.message),
        confirmText: opts.confirmText,
        cancelText: opts.cancelText,
        danger: opts.tone === "danger"
      });
    }
    console.warn('[dsh-plugin-core] confirmModal skin:"host" \u9700\u5148\u5F15\u5165\u5B98\u65B9\u9002\u914D\u5C42 official.js\uFF0C\u5DF2\u56DE\u843D\u5230 core \u76AE\u80A4');
  }
  const { skin: _skin, ...core } = opts;
  void _skin;
  return new Promise((resolve) => {
    const id = ++idSeq;
    const close = (result) => {
      dismiss(id);
      resolve(result);
    };
    entries.push({
      id,
      node: (0, import_react10.createElement)(ConfirmModal, { ...core, onConfirm: () => close(true), onCancel: () => close(false) })
    });
    flush();
  });
}
function alertModal(opts) {
  if (opts.skin === "host") {
    if (hostHandlers !== null) {
      return hostHandlers.alert({
        title: opts.title == null ? void 0 : String(opts.title),
        description: opts.message == null ? void 0 : String(opts.message),
        confirmText: opts.confirmText
      });
    }
    console.warn('[dsh-plugin-core] alertModal skin:"host" \u9700\u5148\u5F15\u5165\u5B98\u65B9\u9002\u914D\u5C42 official.js\uFF0C\u5DF2\u56DE\u843D\u5230 core \u76AE\u80A4');
  }
  const { skin: _skin, ...core } = opts;
  void _skin;
  return new Promise((resolve) => {
    const id = ++idSeq;
    const close = () => {
      dismiss(id);
      resolve();
    };
    entries.push({ id, node: (0, import_react10.createElement)(AlertModal, { ...core, onConfirm: close }) });
    flush();
  });
}

// dist/ui/Card.js
var import_react11 = require("react");
var CARD_ACCENTS = ["business", "success", "warning", "danger", "neutral"];
function CardShell(kind, props) {
  ensureControls();
  const tt = props.translate ?? t;
  const accent = props.accent ?? "business";
  const isPreset = CARD_ACCENTS.includes(accent);
  const classes = [
    "dshpc-card",
    kind === "strip" ? "dshpc-card--strip" : "dshpc-card--bordered",
    isPreset ? `dshpc-card--${accent}` : "",
    props.className ?? ""
  ].filter((s) => s !== "").join(" ");
  const style = isPreset ? props.style : { ...props.style, ["--card-accent"]: accent };
  return (0, import_react11.createElement)("div", { className: classes, style }, (0, import_react11.createElement)(
    "div",
    { className: "dshpc-card__head" },
    // 色条是头部第一个子元素：strip 外观 = 绝对定位 4px 通高贴左缘；bordered 外观 = 行内 6px 圆角短条（高度跟随内容，最小一行，左移 3px）。
    (0, import_react11.createElement)("span", { className: "dshpc-card__bar", "aria-hidden": true }),
    (0, import_react11.createElement)("div", { className: "dshpc-card__main" }, props.children ?? null),
    props.action === void 0 && props.onToggle === void 0 ? null : (0, import_react11.createElement)("div", { className: "dshpc-card__side" }, props.action ?? null, props.onToggle === void 0 ? null : (0, import_react11.createElement)("button", {
      type: "button",
      className: "dshpc-card__toggle",
      "aria-label": tt("cardToggle"),
      "aria-expanded": props.expanded === true,
      onClick: props.onToggle
    }, (0, import_react11.createElement)("span", { className: props.expanded === true ? "dshpc-card__caret is-open" : "dshpc-card__caret" }, "\u25BE")))
  ), props.panel === void 0 || props.expanded !== true ? null : (0, import_react11.createElement)("div", { className: "dshpc-card__panel" }, props.panel));
}
function Card(props) {
  return CardShell("bordered", props);
}
function StripCard(props) {
  return CardShell("strip", props);
}

// dist/ui/Chip.js
var import_react12 = require("react");
function Chip(props) {
  ensureControls();
  const clickable = props.onClick !== void 0;
  const tone = props.tone ?? "neutral";
  const size = props.size ?? "sm";
  return (0, import_react12.createElement)(clickable ? "button" : "span", {
    type: clickable ? "button" : void 0,
    className: `dshpc-chip${tone !== "neutral" ? ` dshpc-chip--${tone}` : ""}${size !== "sm" ? ` dshpc-chip--${size}` : ""}${clickable ? " dshpc-chip--clickable" : ""}${props.className === void 0 ? "" : ` ${props.className}`}`,
    onClick: props.onClick
  }, props.children ?? null);
}

// dist/ui/Toast.js
var import_react14 = require("react");
var import_client2 = require("react-dom/client");

// node_modules/.pnpm/sonner@2.0.8_@types+react@18.3.31_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/sonner/dist/index.mjs
var import_react13 = __toESM(require("react"), 1);
var import_react_dom = __toESM(require("react-dom"), 1);
function __insertCSS(code) {
  if (!code || typeof document == "undefined") return;
  let head = document.head || document.getElementsByTagName("head")[0];
  let style = document.createElement("style");
  style.type = "text/css";
  head.appendChild(style);
  style.styleSheet ? style.styleSheet.cssText = code : style.appendChild(document.createTextNode(code));
}
var getAsset = (type) => {
  switch (type) {
    case "success":
      return SuccessIcon;
    case "info":
      return InfoIcon;
    case "warning":
      return WarningIcon;
    case "error":
      return ErrorIcon;
    default:
      return null;
  }
};
var bars = Array(12).fill(0);
var Loader = ({ visible, className }) => {
  return /* @__PURE__ */ import_react13.default.createElement("div", {
    className: [
      "sonner-loading-wrapper",
      className
    ].filter(Boolean).join(" "),
    "data-visible": visible
  }, /* @__PURE__ */ import_react13.default.createElement("div", {
    className: "sonner-spinner"
  }, bars.map((_, i) => /* @__PURE__ */ import_react13.default.createElement("div", {
    className: "sonner-loading-bar",
    key: `spinner-bar-${i}`
  }))));
};
var SuccessIcon = /* @__PURE__ */ import_react13.default.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 20 20",
  fill: "currentColor",
  height: "20",
  width: "20",
  "aria-hidden": "true"
}, /* @__PURE__ */ import_react13.default.createElement("path", {
  fillRule: "evenodd",
  d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z",
  clipRule: "evenodd"
}));
var WarningIcon = /* @__PURE__ */ import_react13.default.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "currentColor",
  height: "20",
  width: "20",
  "aria-hidden": "true"
}, /* @__PURE__ */ import_react13.default.createElement("path", {
  fillRule: "evenodd",
  d: "M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z",
  clipRule: "evenodd"
}));
var InfoIcon = /* @__PURE__ */ import_react13.default.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 20 20",
  fill: "currentColor",
  height: "20",
  width: "20",
  "aria-hidden": "true"
}, /* @__PURE__ */ import_react13.default.createElement("path", {
  fillRule: "evenodd",
  d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z",
  clipRule: "evenodd"
}));
var ErrorIcon = /* @__PURE__ */ import_react13.default.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 20 20",
  fill: "currentColor",
  height: "20",
  width: "20",
  "aria-hidden": "true"
}, /* @__PURE__ */ import_react13.default.createElement("path", {
  fillRule: "evenodd",
  d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z",
  clipRule: "evenodd"
}));
var CloseIcon = /* @__PURE__ */ import_react13.default.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: "12",
  height: "12",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.5",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, /* @__PURE__ */ import_react13.default.createElement("line", {
  x1: "18",
  y1: "6",
  x2: "6",
  y2: "18"
}), /* @__PURE__ */ import_react13.default.createElement("line", {
  x1: "6",
  y1: "6",
  x2: "18",
  y2: "18"
}));
var useIsDocumentHidden = () => {
  const [isDocumentHidden, setIsDocumentHidden] = import_react13.default.useState(document.hidden);
  import_react13.default.useEffect(() => {
    const callback = () => {
      setIsDocumentHidden(document.hidden);
    };
    document.addEventListener("visibilitychange", callback);
    return () => document.removeEventListener("visibilitychange", callback);
  }, []);
  return isDocumentHidden;
};
var toastsCounter = 1;
var MAX_HISTORY_SIZE = 100;
var getToastId = (data) => {
  var _data_id;
  return typeof (data == null ? void 0 : data.id) === "number" || (data == null ? void 0 : (_data_id = data.id) == null ? void 0 : _data_id.length) > 0 ? data.id : toastsCounter++;
};
var Observer = class {
  constructor() {
    this.subscribe = (subscriber) => {
      this.subscribers.push(subscriber);
      this.getActiveToasts().forEach((toast2) => subscriber(toast2));
      return () => {
        const index = this.subscribers.indexOf(subscriber);
        this.subscribers.splice(index, 1);
      };
    };
    this.publish = (data) => {
      this.subscribers.forEach((subscriber) => subscriber(data));
    };
    this.addToast = (data) => {
      this.publish(data);
      this.toasts = [
        ...this.toasts,
        data
      ];
      this.trimHistory();
    };
    this.trimHistory = () => {
      let toRemove = this.toasts.length - MAX_HISTORY_SIZE;
      if (toRemove <= 0) return;
      this.toasts = this.toasts.filter((toast2) => {
        if (toRemove > 0 && this.dismissedToasts.has(toast2.id)) {
          this.dismissedToasts.delete(toast2.id);
          toRemove--;
          return false;
        }
        return true;
      });
    };
    this.create = (data) => {
      const { message, ...rest } = data;
      const id = getToastId(data);
      const pendingDismissal = this.pendingDismissals.get(id);
      if (pendingDismissal !== void 0) {
        cancelAnimationFrame(pendingDismissal);
        this.pendingDismissals.delete(id);
        this.dismissedToasts.delete(id);
      }
      const wasDismissed = this.dismissedToasts.has(id);
      const dismissible = data.dismissible === void 0 ? true : data.dismissible;
      if (wasDismissed) {
        this.dismissedToasts.delete(id);
        this.toasts = this.toasts.filter((toast2) => toast2.id !== id);
      }
      const alreadyExists = wasDismissed ? void 0 : this.toasts.find((toast2) => {
        return toast2.id === id;
      });
      if (alreadyExists) {
        this.toasts = this.toasts.map((toast2) => {
          if (toast2.id === id) {
            this.publish({
              ...toast2,
              ...data,
              id,
              title: message
            });
            return {
              ...toast2,
              ...data,
              id,
              dismissible,
              title: message
            };
          }
          return toast2;
        });
      } else {
        this.addToast({
          title: message,
          ...rest,
          dismissible,
          id
        });
      }
      return id;
    };
    this.dismiss = (id) => {
      if (id === void 0 || id === null) {
        this.getActiveToasts().forEach((toast2) => {
          this.dismissedToasts.add(toast2.id);
          this.subscribers.forEach((subscriber) => subscriber({
            id: toast2.id,
            dismiss: true
          }));
        });
        return id;
      }
      this.dismissedToasts.add(id);
      const alreadyPending = this.pendingDismissals.get(id);
      if (alreadyPending !== void 0) {
        cancelAnimationFrame(alreadyPending);
      }
      this.pendingDismissals.set(id, requestAnimationFrame(() => {
        this.pendingDismissals.delete(id);
        this.subscribers.forEach((subscriber) => subscriber({
          id,
          dismiss: true
        }));
      }));
      return id;
    };
    this.message = (message, data) => {
      return this.create({
        ...data,
        message,
        type: void 0
      });
    };
    this.error = (message, data) => {
      return this.create({
        ...data,
        message,
        type: "error"
      });
    };
    this.success = (message, data) => {
      return this.create({
        ...data,
        type: "success",
        message
      });
    };
    this.info = (message, data) => {
      return this.create({
        ...data,
        type: "info",
        message
      });
    };
    this.warning = (message, data) => {
      return this.create({
        ...data,
        type: "warning",
        message
      });
    };
    this.loading = (message, data) => {
      return this.create({
        ...data,
        type: "loading",
        message
      });
    };
    this.promise = (promise, data) => {
      if (!data) {
        return;
      }
      let id = void 0;
      if (data.loading !== void 0) {
        id = this.create({
          ...data,
          promise,
          type: "loading",
          message: data.loading,
          description: typeof data.description !== "function" ? data.description : void 0
        });
      }
      const p = Promise.resolve(promise instanceof Function ? promise() : promise);
      let shouldDismiss = id !== void 0;
      let result;
      const originalPromise = p.then(async (response) => {
        result = [
          "resolve",
          response
        ];
        const isReactElementResponse = import_react13.default.isValidElement(response);
        if (isReactElementResponse) {
          shouldDismiss = false;
          this.create({
            id,
            type: "default",
            message: response
          });
        } else if (isHttpResponse(response) && !response.ok) {
          shouldDismiss = false;
          const promiseData = typeof data.error === "function" ? await data.error(`HTTP error! status: ${response.status}`) : data.error;
          const description = typeof data.description === "function" ? await data.description(`HTTP error! status: ${response.status}`) : data.description;
          const isExtendedResult = typeof promiseData === "object" && !import_react13.default.isValidElement(promiseData);
          const toastSettings = isExtendedResult ? promiseData : {
            message: promiseData
          };
          this.create({
            id,
            type: "error",
            description,
            ...toastSettings
          });
        } else if (response instanceof Error) {
          shouldDismiss = false;
          const promiseData = typeof data.error === "function" ? await data.error(response) : data.error;
          const description = typeof data.description === "function" ? await data.description(response) : data.description;
          const isExtendedResult = typeof promiseData === "object" && !import_react13.default.isValidElement(promiseData);
          const toastSettings = isExtendedResult ? promiseData : {
            message: promiseData
          };
          this.create({
            id,
            type: "error",
            description,
            ...toastSettings
          });
        } else if (data.success !== void 0) {
          shouldDismiss = false;
          const promiseData = typeof data.success === "function" ? await data.success(response) : data.success;
          const description = typeof data.description === "function" ? await data.description(response) : data.description;
          const isExtendedResult = typeof promiseData === "object" && !import_react13.default.isValidElement(promiseData);
          const toastSettings = isExtendedResult ? promiseData : {
            message: promiseData
          };
          this.create({
            id,
            type: "success",
            description,
            ...toastSettings
          });
        }
      }).catch(async (error) => {
        result = [
          "reject",
          error
        ];
        if (data.error !== void 0) {
          shouldDismiss = false;
          const promiseData = typeof data.error === "function" ? await data.error(error) : data.error;
          const description = typeof data.description === "function" ? await data.description(error) : data.description;
          const isExtendedResult = typeof promiseData === "object" && !import_react13.default.isValidElement(promiseData);
          const toastSettings = isExtendedResult ? promiseData : {
            message: promiseData
          };
          this.create({
            id,
            type: "error",
            description,
            ...toastSettings
          });
        }
      }).finally(() => {
        if (shouldDismiss) {
          this.dismiss(id);
          id = void 0;
        }
        data.finally == null ? void 0 : data.finally.call(data);
      });
      const unwrap = () => new Promise((resolve, reject) => originalPromise.then(() => result[0] === "reject" ? reject(result[1]) : resolve(result[1])).catch(reject));
      if (typeof id !== "string" && typeof id !== "number") {
        return {
          unwrap
        };
      } else {
        return Object.assign(id, {
          unwrap
        });
      }
    };
    this.custom = (jsx, data) => {
      const id = getToastId(data);
      this.create({
        ...data,
        jsx: jsx(id),
        id,
        type: void 0
      });
      return id;
    };
    this.getActiveToasts = () => {
      return this.toasts.filter((toast2) => !this.dismissedToasts.has(toast2.id));
    };
    this.subscribers = [];
    this.toasts = [];
    this.dismissedToasts = /* @__PURE__ */ new Set();
    this.pendingDismissals = /* @__PURE__ */ new Map();
  }
};
var ToastState = new Observer();
var toastFunction = (message, data) => {
  return ToastState.message(message, data);
};
var isHttpResponse = (data) => {
  return data && typeof data === "object" && "ok" in data && typeof data.ok === "boolean" && "status" in data && typeof data.status === "number";
};
var basicToast = toastFunction;
var getHistory = () => ToastState.toasts;
var getToasts = () => ToastState.getActiveToasts();
var toast = Object.assign(basicToast, {
  success: ToastState.success,
  info: ToastState.info,
  warning: ToastState.warning,
  error: ToastState.error,
  custom: ToastState.custom,
  message: ToastState.message,
  promise: ToastState.promise,
  dismiss: ToastState.dismiss,
  loading: ToastState.loading
}, {
  getHistory,
  getToasts
});
__insertCSS("[data-sonner-toaster][dir=ltr],html[dir=ltr]{--toast-icon-margin-start:-3px;--toast-icon-margin-end:4px;--toast-svg-margin-start:-1px;--toast-svg-margin-end:0px;--toast-button-margin-start:auto;--toast-button-margin-end:0;--toast-close-button-start:0;--toast-close-button-end:unset;--toast-close-button-transform:translate(-35%, -35%)}[data-sonner-toaster][dir=rtl],html[dir=rtl]{--toast-icon-margin-start:4px;--toast-icon-margin-end:-3px;--toast-svg-margin-start:0px;--toast-svg-margin-end:-1px;--toast-button-margin-start:0;--toast-button-margin-end:auto;--toast-close-button-start:unset;--toast-close-button-end:0;--toast-close-button-transform:translate(35%, -35%)}[data-sonner-toaster]{position:fixed;width:var(--width);font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;--gray1:hsl(0, 0%, 99%);--gray2:hsl(0, 0%, 97.3%);--gray3:hsl(0, 0%, 95.1%);--gray4:hsl(0, 0%, 93%);--gray5:hsl(0, 0%, 90.9%);--gray6:hsl(0, 0%, 88.7%);--gray7:hsl(0, 0%, 85.8%);--gray8:hsl(0, 0%, 78%);--gray9:hsl(0, 0%, 56.1%);--gray10:hsl(0, 0%, 52.3%);--gray11:hsl(0, 0%, 43.5%);--gray12:hsl(0, 0%, 9%);--border-radius:8px;box-sizing:border-box;padding:0;margin:0;list-style:none;outline:0;z-index:999999999;transition:transform .4s ease}@media (hover:none) and (pointer:coarse){[data-sonner-toaster][data-lifted=true]{transform:none}}[data-sonner-toaster][data-x-position=right]{right:var(--offset-right)}[data-sonner-toaster][data-x-position=left]{left:var(--offset-left)}[data-sonner-toaster][data-x-position=center]{left:50%;transform:translateX(-50%)}[data-sonner-toaster][data-y-position=top]{top:var(--offset-top)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--offset-bottom)}[data-sonner-toast]{--y:translateY(100%);--lift-amount:calc(var(--lift) * var(--gap));z-index:var(--z-index);position:absolute;opacity:0;transform:var(--y);touch-action:none;transition:transform .4s,opacity .4s,height .4s,box-shadow .2s;box-sizing:border-box;outline:0;overflow-wrap:anywhere}[data-sonner-toast][data-styled=true]{padding:16px;background:var(--normal-bg);border:1px solid var(--normal-border);color:var(--normal-text);border-radius:var(--border-radius);box-shadow:0 4px 12px rgba(0,0,0,.1);width:var(--width);font-size:13px;display:flex;align-items:center;gap:6px}[data-sonner-toast]:focus-visible{box-shadow:0 4px 12px rgba(0,0,0,.1),0 0 0 2px rgba(0,0,0,.2)}[data-sonner-toast][data-y-position=top]{top:0;--y:translateY(-100%);--lift:1;--lift-amount:calc(1 * var(--gap))}[data-sonner-toast][data-y-position=bottom]{bottom:0;--y:translateY(100%);--lift:-1;--lift-amount:calc(var(--lift) * var(--gap))}[data-sonner-toast][data-styled=true] [data-description]{font-weight:400;line-height:1.4;color:#3f3f3f}[data-rich-colors=true][data-sonner-toast][data-styled=true] [data-description]{color:inherit}[data-sonner-toaster][data-sonner-theme=dark] [data-description]{color:#e8e8e8}[data-sonner-toast][data-styled=true] [data-title]{font-weight:500;line-height:1.5;color:inherit}[data-sonner-toast][data-styled=true] [data-icon]{display:flex;height:16px;width:16px;position:relative;justify-content:flex-start;align-items:center;flex-shrink:0;margin-left:var(--toast-icon-margin-start);margin-right:var(--toast-icon-margin-end)}[data-sonner-toast][data-promise=true] [data-icon]>svg{opacity:0;transform:scale(.8);transform-origin:center;animation:sonner-fade-in .3s ease forwards}[data-sonner-toast][data-styled=true] [data-icon]>*{flex-shrink:0}[data-sonner-toast][data-styled=true] [data-icon] svg{margin-left:var(--toast-svg-margin-start);margin-right:var(--toast-svg-margin-end)}[data-sonner-toast][data-styled=true] [data-content]{display:flex;flex-direction:column;gap:2px;flex:1;min-width:0}[data-sonner-toast][data-styled=true] [data-button]{border-radius:4px;padding-left:8px;padding-right:8px;height:24px;font-size:12px;color:var(--normal-bg);background:var(--normal-text);margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end);border:none;font-weight:500;cursor:pointer;outline:0;display:flex;align-items:center;flex-shrink:0;transition:opacity .4s,box-shadow .2s}[data-sonner-toast][data-styled=true] [data-button]:focus-visible{box-shadow:0 0 0 2px rgba(0,0,0,.4)}[data-sonner-toast][data-styled=true] [data-button]:first-of-type{margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end)}[data-sonner-toast][data-styled=true] [data-cancel]{color:var(--normal-text);background:rgba(0,0,0,.08)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast][data-styled=true] [data-cancel]{background:rgba(255,255,255,.3)}[data-sonner-toast][data-styled=true] [data-close-button]{position:absolute;left:var(--toast-close-button-start);right:var(--toast-close-button-end);top:0;height:20px;width:20px;display:flex;justify-content:center;align-items:center;padding:0;color:var(--normal-text);background:var(--normal-bg);border:1px solid var(--normal-border);transform:var(--toast-close-button-transform);border-radius:50%;cursor:pointer;z-index:1;transition:opacity .1s,background .2s,border-color .2s}[data-sonner-toast][data-styled=true] [data-close-button]:focus-visible{box-shadow:0 4px 12px rgba(0,0,0,.1),0 0 0 2px rgba(0,0,0,.2)}[data-sonner-toast][data-styled=true] [data-disabled=true]{cursor:not-allowed}[data-sonner-toast][data-styled=true]:hover [data-close-button]:hover{background:var(--gray2);border-color:var(--gray5)}[data-sonner-toast][data-swiping=true]::before{content:'';position:absolute;left:-100%;right:-100%;height:100%;z-index:-1}[data-sonner-toast][data-y-position=top][data-swiping=true]::before{bottom:50%;transform:scaleY(3) translateY(50%)}[data-sonner-toast][data-y-position=bottom][data-swiping=true]::before{top:50%;transform:scaleY(3) translateY(-50%)}[data-sonner-toast][data-swiping=false][data-removed=true]::before{content:'';position:absolute;inset:0;transform:scaleY(2)}[data-sonner-toast][data-expanded=true]::after{content:'';position:absolute;left:0;height:calc(var(--gap) + 1px);bottom:100%;width:100%}[data-sonner-toast][data-mounted=true]{--y:translateY(0);opacity:1}[data-sonner-toast][data-expanded=false][data-front=false]{--scale:var(--toasts-before) * 0.05 + 1;--y:translateY(calc(var(--lift-amount) * var(--toasts-before))) scale(calc(-1 * var(--scale)));height:var(--front-toast-height)}[data-sonner-toast]>*{transition:opacity .4s}[data-sonner-toast][data-x-position=right]{right:0}[data-sonner-toast][data-x-position=left]{left:0}[data-sonner-toast][data-expanded=false][data-front=false][data-styled=true]>*{opacity:0}[data-sonner-toast][data-visible=false]{opacity:0;pointer-events:none}[data-sonner-toast][data-mounted=true][data-expanded=true]{--y:translateY(calc(var(--lift) * var(--offset)));height:var(--initial-height)}[data-sonner-toast][data-removed=true][data-front=true][data-swipe-out=false]{--y:translateY(calc(var(--lift) * -100%));opacity:0}[data-sonner-toast][data-removed=true][data-front=false][data-swipe-out=false][data-expanded=true]{--y:translateY(calc(var(--lift) * var(--offset) + var(--lift) * -100%));opacity:0}[data-sonner-toast][data-removed=true][data-front=false][data-swipe-out=false][data-expanded=false]{--y:translateY(40%);opacity:0;transition:transform .5s,opacity .2s}[data-sonner-toast][data-removed=true][data-front=false]::before{height:calc(var(--initial-height) + 20%)}[data-sonner-toast][data-swiping=true]{transform:var(--y) translateY(var(--swipe-amount-y,0)) translateX(var(--swipe-amount-x,0));transition:none}[data-sonner-toast][data-swiped=true]{-webkit-user-select:none;user-select:none}[data-sonner-toast][data-swipe-out=true][data-y-position=bottom],[data-sonner-toast][data-swipe-out=true][data-y-position=top]{animation-duration:.2s;animation-timing-function:ease-out;animation-fill-mode:forwards}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=left]{animation-name:swipe-out-left}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=right]{animation-name:swipe-out-right}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=up]{animation-name:swipe-out-up}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=down]{animation-name:swipe-out-down}@keyframes swipe-out-left{from{transform:var(--y) translateX(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translateX(calc(var(--swipe-amount-x) - 100%));opacity:0}}@keyframes swipe-out-right{from{transform:var(--y) translateX(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translateX(calc(var(--swipe-amount-x) + 100%));opacity:0}}@keyframes swipe-out-up{from{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) - 100%));opacity:0}}@keyframes swipe-out-down{from{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) + 100%));opacity:0}}@media (max-width:600px){[data-sonner-toaster]{position:fixed;right:var(--mobile-offset-right);left:var(--mobile-offset-left);width:100%}[data-sonner-toaster][dir=rtl]{left:calc(var(--mobile-offset-left) * -1)}[data-sonner-toaster] [data-sonner-toast]{left:0;right:0;width:calc(100% - var(--mobile-offset-left) * 2)}[data-sonner-toaster][data-x-position=left]{left:var(--mobile-offset-left)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--mobile-offset-bottom)}[data-sonner-toaster][data-y-position=top]{top:var(--mobile-offset-top)}[data-sonner-toaster][data-x-position=center]{left:var(--mobile-offset-left);right:var(--mobile-offset-right);transform:none}}[data-sonner-toaster][data-sonner-theme=light]{--normal-bg:#fff;--normal-border:var(--gray4);--normal-text:var(--gray12);--success-bg:hsl(143, 85%, 96%);--success-border:hsl(145, 92%, 87%);--success-text:hsl(140, 100%, 27%);--info-bg:hsl(208, 100%, 97%);--info-border:hsl(221, 91%, 93%);--info-text:hsl(210, 92%, 45%);--warning-bg:hsl(49, 100%, 97%);--warning-border:hsl(49, 91%, 84%);--warning-text:hsl(31, 92%, 45%);--error-bg:hsl(359, 100%, 97%);--error-border:hsl(359, 100%, 94%);--error-text:hsl(360, 100%, 45%)}[data-sonner-toaster][data-sonner-theme=light] [data-sonner-toast][data-invert=true]{--normal-bg:#000;--normal-border:hsl(0, 0%, 20%);--normal-text:var(--gray1)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast][data-invert=true]{--normal-bg:#fff;--normal-border:var(--gray3);--normal-text:var(--gray12)}[data-sonner-toaster][data-sonner-theme=dark]{--normal-bg:#000;--normal-bg-hover:hsl(0, 0%, 12%);--normal-border:hsl(0, 0%, 20%);--normal-border-hover:hsl(0, 0%, 25%);--normal-text:var(--gray1);--success-bg:hsl(150, 100%, 6%);--success-border:hsl(147, 100%, 12%);--success-text:hsl(150, 86%, 65%);--info-bg:hsl(215, 100%, 6%);--info-border:hsl(223, 43%, 17%);--info-text:hsl(216, 87%, 65%);--warning-bg:hsl(64, 100%, 6%);--warning-border:hsl(60, 100%, 9%);--warning-text:hsl(46, 87%, 65%);--error-bg:hsl(358, 76%, 10%);--error-border:hsl(357, 89%, 16%);--error-text:hsl(358, 100%, 81%)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast] [data-close-button]{background:var(--normal-bg);border-color:var(--normal-border);color:var(--normal-text)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast] [data-close-button]:hover{background:var(--normal-bg-hover);border-color:var(--normal-border-hover)}[data-rich-colors=true][data-sonner-toast][data-type=success]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=success] [data-close-button]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=info]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=info] [data-close-button]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning] [data-close-button]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=error]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}[data-rich-colors=true][data-sonner-toast][data-type=error] [data-close-button]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}.sonner-loading-wrapper{--size:16px;height:var(--size);width:var(--size);position:absolute;inset:0;z-index:10}.sonner-loading-wrapper[data-visible=false]{transform-origin:center;animation:sonner-fade-out .2s ease forwards}.sonner-spinner{position:relative;top:50%;left:50%;height:var(--size);width:var(--size)}.sonner-loading-bar{animation:sonner-spin 1.2s linear infinite;background:var(--gray11);border-radius:6px;height:8%;left:-10%;position:absolute;top:-3.9%;width:24%}.sonner-loading-bar:first-child{animation-delay:-1.2s;transform:rotate(.0001deg) translate(146%)}.sonner-loading-bar:nth-child(2){animation-delay:-1.1s;transform:rotate(30deg) translate(146%)}.sonner-loading-bar:nth-child(3){animation-delay:-1s;transform:rotate(60deg) translate(146%)}.sonner-loading-bar:nth-child(4){animation-delay:-.9s;transform:rotate(90deg) translate(146%)}.sonner-loading-bar:nth-child(5){animation-delay:-.8s;transform:rotate(120deg) translate(146%)}.sonner-loading-bar:nth-child(6){animation-delay:-.7s;transform:rotate(150deg) translate(146%)}.sonner-loading-bar:nth-child(7){animation-delay:-.6s;transform:rotate(180deg) translate(146%)}.sonner-loading-bar:nth-child(8){animation-delay:-.5s;transform:rotate(210deg) translate(146%)}.sonner-loading-bar:nth-child(9){animation-delay:-.4s;transform:rotate(240deg) translate(146%)}.sonner-loading-bar:nth-child(10){animation-delay:-.3s;transform:rotate(270deg) translate(146%)}.sonner-loading-bar:nth-child(11){animation-delay:-.2s;transform:rotate(300deg) translate(146%)}.sonner-loading-bar:nth-child(12){animation-delay:-.1s;transform:rotate(330deg) translate(146%)}@keyframes sonner-fade-in{0%{opacity:0;transform:scale(.8)}100%{opacity:1;transform:scale(1)}}@keyframes sonner-fade-out{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.8)}}@keyframes sonner-spin{0%{opacity:1}100%{opacity:.15}}@media (prefers-reduced-motion){.sonner-loading-bar,[data-sonner-toast],[data-sonner-toast]>*{transition:none!important;animation:none!important}}.sonner-loader{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);transform-origin:center;transition:opacity .2s,transform .2s}.sonner-loader[data-visible=false]{opacity:0;transform:scale(.8) translate(-50%,-50%)}");
function isAction(action) {
  return action.label !== void 0;
}
var VISIBLE_TOASTS_AMOUNT = 3;
var VIEWPORT_OFFSET = "24px";
var MOBILE_VIEWPORT_OFFSET = "16px";
var TOAST_LIFETIME = 4e3;
var TOAST_WIDTH = 356;
var GAP = 14;
var SWIPE_THRESHOLD = 45;
var TIME_BEFORE_UNMOUNT = 200;
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
function getDefaultSwipeDirections(position) {
  const [y, x] = position.split("-");
  const directions = [];
  if (y) {
    directions.push(y);
  }
  if (x) {
    directions.push(x);
  }
  return directions;
}
var Toast = (props) => {
  var _toast_classNames, _toast_classNames1, _toast_classNames2, _toast_classNames3, _toast_classNames4, _toast_classNames5, _toast_classNames6, _toast_classNames7, _toast_classNames8;
  const { invert: ToasterInvert, toast: toast2, unstyled, interacting, setHeights, visibleToasts, heights, index, toasts, expanded, removeToast, defaultRichColors, closeButton: closeButtonFromToaster, style, cancelButtonStyle, actionButtonStyle, className = "", descriptionClassName = "", duration: durationFromToaster, position, gap, expandByDefault, classNames, icons, closeButtonAriaLabel = "Close toast" } = props;
  const [swipeDirection, setSwipeDirection] = import_react13.default.useState(null);
  const [swipeOutDirection, setSwipeOutDirection] = import_react13.default.useState(null);
  const [mounted, setMounted] = import_react13.default.useState(false);
  const [removed, setRemoved] = import_react13.default.useState(false);
  const [swiping, setSwiping] = import_react13.default.useState(false);
  const [swipeOut, setSwipeOut] = import_react13.default.useState(false);
  const [isSwiped, setIsSwiped] = import_react13.default.useState(false);
  const [offsetBeforeRemove, setOffsetBeforeRemove] = import_react13.default.useState(0);
  const [initialHeight, setInitialHeight] = import_react13.default.useState(0);
  const remainingTime = import_react13.default.useRef(toast2.duration || durationFromToaster || TOAST_LIFETIME);
  const dragStartTime = import_react13.default.useRef(null);
  const toastRef = import_react13.default.useRef(null);
  const isFront = index === 0;
  const isVisible = index + 1 <= visibleToasts;
  const toastType = toast2.type;
  const toastTypeKey = toastType != null ? toastType : "default";
  const dismissible = toast2.dismissible !== false;
  const toastClassname = toast2.className || "";
  const toastDescriptionClassname = toast2.descriptionClassName || "";
  const heightIndex = import_react13.default.useMemo(() => heights.findIndex((height) => height.toastId === toast2.id) || 0, [
    heights,
    toast2.id
  ]);
  const closeButton = import_react13.default.useMemo(() => {
    var _toast_closeButton;
    return (_toast_closeButton = toast2.closeButton) != null ? _toast_closeButton : closeButtonFromToaster;
  }, [
    toast2.closeButton,
    closeButtonFromToaster
  ]);
  const duration = import_react13.default.useMemo(() => toast2.duration || durationFromToaster || TOAST_LIFETIME, [
    toast2.duration,
    durationFromToaster
  ]);
  const closeTimerStartTimeRef = import_react13.default.useRef(0);
  const offset = import_react13.default.useRef(0);
  const lastCloseTimerStartTimeRef = import_react13.default.useRef(0);
  const pointerStartRef = import_react13.default.useRef(null);
  const [y, x] = position.split("-");
  const toastsHeightBefore = import_react13.default.useMemo(() => {
    return heights.reduce((prev, curr, reducerIndex) => {
      if (reducerIndex >= heightIndex) {
        return prev;
      }
      return prev + curr.height;
    }, 0);
  }, [
    heights,
    heightIndex
  ]);
  const isDocumentHidden = useIsDocumentHidden();
  const swipeDirections = import_react13.default.useMemo(() => {
    var _props_swipeDirections;
    return (_props_swipeDirections = props.swipeDirections) != null ? _props_swipeDirections : getDefaultSwipeDirections(position);
  }, [
    props.swipeDirections,
    position
  ]);
  const invert = toast2.invert || ToasterInvert;
  const disabled = toastType === "loading";
  offset.current = import_react13.default.useMemo(() => heightIndex * gap + toastsHeightBefore, [
    heightIndex,
    toastsHeightBefore
  ]);
  import_react13.default.useEffect(() => {
    remainingTime.current = duration;
  }, [
    duration
  ]);
  import_react13.default.useEffect(() => {
    setMounted(true);
  }, []);
  import_react13.default.useEffect(() => {
    const toastNode = toastRef.current;
    if (toastNode) {
      const height = toastNode.getBoundingClientRect().height;
      setInitialHeight(height);
      setHeights((h43) => [
        {
          toastId: toast2.id,
          height,
          position: toast2.position
        },
        ...h43
      ]);
      return () => setHeights((h43) => h43.filter((height2) => height2.toastId !== toast2.id));
    }
  }, [
    setHeights,
    toast2.id
  ]);
  import_react13.default.useLayoutEffect(() => {
    if (!mounted) return;
    const toastNode = toastRef.current;
    const originalHeight = toastNode.style.height;
    toastNode.style.height = "auto";
    const newHeight = toastNode.getBoundingClientRect().height;
    toastNode.style.height = originalHeight;
    setInitialHeight(newHeight);
    setHeights((heights2) => {
      const alreadyExists = heights2.find((height) => height.toastId === toast2.id);
      if (!alreadyExists) {
        return [
          {
            toastId: toast2.id,
            height: newHeight,
            position: toast2.position
          },
          ...heights2
        ];
      } else {
        return heights2.map((height) => height.toastId === toast2.id ? {
          ...height,
          height: newHeight
        } : height);
      }
    });
  }, [
    mounted,
    toast2.title,
    toast2.description,
    setHeights,
    toast2.id,
    toast2.jsx,
    toast2.action,
    toast2.cancel
  ]);
  const deleteToast = import_react13.default.useCallback(() => {
    setRemoved(true);
    setOffsetBeforeRemove(offset.current);
    setHeights((h43) => h43.filter((height) => height.toastId !== toast2.id));
    setTimeout(() => {
      removeToast(toast2);
    }, TIME_BEFORE_UNMOUNT);
  }, [
    toast2,
    removeToast,
    setHeights,
    offset
  ]);
  import_react13.default.useEffect(() => {
    if (toast2.promise && toastType === "loading" || toast2.duration === Infinity || toast2.type === "loading") return;
    let timeoutId;
    const pauseTimer = () => {
      if (lastCloseTimerStartTimeRef.current < closeTimerStartTimeRef.current) {
        const elapsedTime = (/* @__PURE__ */ new Date()).getTime() - closeTimerStartTimeRef.current;
        remainingTime.current = remainingTime.current - elapsedTime;
      }
      lastCloseTimerStartTimeRef.current = (/* @__PURE__ */ new Date()).getTime();
    };
    const startTimer = () => {
      if (remainingTime.current === Infinity) return;
      closeTimerStartTimeRef.current = (/* @__PURE__ */ new Date()).getTime();
      timeoutId = setTimeout(() => {
        toast2.onAutoClose == null ? void 0 : toast2.onAutoClose.call(toast2, toast2);
        deleteToast();
      }, remainingTime.current);
    };
    if (expanded || interacting || isDocumentHidden) {
      pauseTimer();
    } else {
      startTimer();
    }
    return () => clearTimeout(timeoutId);
  }, [
    expanded,
    interacting,
    toast2,
    toastType,
    isDocumentHidden,
    deleteToast
  ]);
  import_react13.default.useEffect(() => {
    if (toast2.delete) {
      deleteToast();
      toast2.onDismiss == null ? void 0 : toast2.onDismiss.call(toast2, toast2);
    }
  }, [
    deleteToast,
    toast2.delete
  ]);
  function getLoadingIcon() {
    var _toast_classNames9;
    if (icons == null ? void 0 : icons.loading) {
      var _toast_classNames12;
      return /* @__PURE__ */ import_react13.default.createElement("div", {
        className: cn(classNames == null ? void 0 : classNames.loader, toast2 == null ? void 0 : (_toast_classNames12 = toast2.classNames) == null ? void 0 : _toast_classNames12.loader, "sonner-loader"),
        "data-visible": toastType === "loading"
      }, icons.loading);
    }
    return /* @__PURE__ */ import_react13.default.createElement(Loader, {
      className: cn(classNames == null ? void 0 : classNames.loader, toast2 == null ? void 0 : (_toast_classNames9 = toast2.classNames) == null ? void 0 : _toast_classNames9.loader),
      visible: toastType === "loading"
    });
  }
  const icon = toast2.icon || (icons == null ? void 0 : icons[toastType]) || getAsset(toastType);
  var _toast_richColors, _icons_close;
  return /* @__PURE__ */ import_react13.default.createElement("li", {
    tabIndex: 0,
    ref: toastRef,
    className: cn(className, toastClassname, classNames == null ? void 0 : classNames.toast, toast2 == null ? void 0 : (_toast_classNames = toast2.classNames) == null ? void 0 : _toast_classNames.toast, classNames == null ? void 0 : classNames[toastTypeKey], toast2 == null ? void 0 : (_toast_classNames1 = toast2.classNames) == null ? void 0 : _toast_classNames1[toastTypeKey]),
    "data-sonner-toast": "",
    "data-rich-colors": (_toast_richColors = toast2.richColors) != null ? _toast_richColors : defaultRichColors,
    "data-styled": !Boolean(toast2.jsx || toast2.unstyled || unstyled),
    "data-mounted": mounted,
    "data-promise": Boolean(toast2.promise),
    "data-swiped": isSwiped,
    "data-removed": removed,
    "data-visible": isVisible,
    "data-y-position": y,
    "data-x-position": x,
    "data-index": index,
    "data-front": isFront,
    "data-swiping": swiping,
    "data-dismissible": dismissible,
    "data-type": toastType,
    "data-invert": invert,
    "data-swipe-out": swipeOut,
    "data-swipe-direction": swipeOutDirection,
    "data-expanded": Boolean(expanded || expandByDefault && mounted),
    "data-testid": toast2.testId,
    style: {
      "--index": index,
      "--toasts-before": index,
      "--z-index": toasts.length - index,
      "--offset": `${removed ? offsetBeforeRemove : offset.current}px`,
      "--initial-height": expandByDefault ? "auto" : `${initialHeight}px`,
      ...style,
      ...toast2.style
    },
    onDragEnd: () => {
      setSwiping(false);
      setSwipeDirection(null);
      pointerStartRef.current = null;
    },
    onPointerDown: (event) => {
      if (event.button === 2) return;
      if (disabled || !dismissible) return;
      dragStartTime.current = /* @__PURE__ */ new Date();
      setOffsetBeforeRemove(offset.current);
      event.target.setPointerCapture(event.pointerId);
      if (event.target.tagName === "BUTTON") return;
      setSwiping(true);
      pointerStartRef.current = {
        x: event.clientX,
        y: event.clientY
      };
    },
    onPointerUp: () => {
      var _toastRef_current, _toastRef_current1, _dragStartTime_current;
      if (swipeOut || !dismissible) return;
      pointerStartRef.current = null;
      const swipeAmountX = Number(((_toastRef_current = toastRef.current) == null ? void 0 : _toastRef_current.style.getPropertyValue("--swipe-amount-x").replace("px", "")) || 0);
      const swipeAmountY = Number(((_toastRef_current1 = toastRef.current) == null ? void 0 : _toastRef_current1.style.getPropertyValue("--swipe-amount-y").replace("px", "")) || 0);
      const timeTaken = (/* @__PURE__ */ new Date()).getTime() - ((_dragStartTime_current = dragStartTime.current) == null ? void 0 : _dragStartTime_current.getTime());
      const swipeAmount = swipeDirection === "x" ? swipeAmountX : swipeAmountY;
      const velocity = Math.abs(swipeAmount) / timeTaken;
      const isAllowedDirection = swipeDirection === "x" ? swipeDirections.includes(swipeAmountX > 0 ? "right" : "left") : swipeDirections.includes(swipeAmountY > 0 ? "bottom" : "top");
      if (isAllowedDirection && (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11)) {
        setOffsetBeforeRemove(offset.current);
        toast2.onDismiss == null ? void 0 : toast2.onDismiss.call(toast2, toast2);
        if (swipeDirection === "x") {
          setSwipeOutDirection(swipeAmountX > 0 ? "right" : "left");
        } else {
          setSwipeOutDirection(swipeAmountY > 0 ? "down" : "up");
        }
        deleteToast();
        setSwipeOut(true);
        return;
      } else {
        var _toastRef_current2, _toastRef_current3;
        (_toastRef_current2 = toastRef.current) == null ? void 0 : _toastRef_current2.style.setProperty("--swipe-amount-x", `0px`);
        (_toastRef_current3 = toastRef.current) == null ? void 0 : _toastRef_current3.style.setProperty("--swipe-amount-y", `0px`);
      }
      setIsSwiped(false);
      setSwiping(false);
      setSwipeDirection(null);
    },
    onPointerMove: (event) => {
      var _window_getSelection, _toastRef_current, _toastRef_current1;
      if (!pointerStartRef.current || !dismissible) return;
      const isHighlighted = ((_window_getSelection = window.getSelection()) == null ? void 0 : _window_getSelection.toString().length) > 0;
      if (isHighlighted) return;
      const yDelta = event.clientY - pointerStartRef.current.y;
      const xDelta = event.clientX - pointerStartRef.current.x;
      if (!swipeDirection && (Math.abs(xDelta) > 1 || Math.abs(yDelta) > 1)) {
        setSwipeDirection(Math.abs(xDelta) > Math.abs(yDelta) ? "x" : "y");
      }
      let swipeAmount = {
        x: 0,
        y: 0
      };
      const getDampening = (delta) => {
        const factor = Math.abs(delta) / 20;
        return 1 / (1.5 + factor);
      };
      if (swipeDirection === "y") {
        if (swipeDirections.includes("top") || swipeDirections.includes("bottom")) {
          if (swipeDirections.includes("top") && yDelta < 0 || swipeDirections.includes("bottom") && yDelta > 0) {
            swipeAmount.y = yDelta;
          } else {
            const dampenedDelta = yDelta * getDampening(yDelta);
            swipeAmount.y = Math.abs(dampenedDelta) < Math.abs(yDelta) ? dampenedDelta : yDelta;
          }
        }
      } else if (swipeDirection === "x") {
        if (swipeDirections.includes("left") || swipeDirections.includes("right")) {
          if (swipeDirections.includes("left") && xDelta < 0 || swipeDirections.includes("right") && xDelta > 0) {
            swipeAmount.x = xDelta;
          } else {
            const dampenedDelta = xDelta * getDampening(xDelta);
            swipeAmount.x = Math.abs(dampenedDelta) < Math.abs(xDelta) ? dampenedDelta : xDelta;
          }
        }
      }
      if (Math.abs(swipeAmount.x) > 0 || Math.abs(swipeAmount.y) > 0) {
        setIsSwiped(true);
      }
      (_toastRef_current = toastRef.current) == null ? void 0 : _toastRef_current.style.setProperty("--swipe-amount-x", `${swipeAmount.x}px`);
      (_toastRef_current1 = toastRef.current) == null ? void 0 : _toastRef_current1.style.setProperty("--swipe-amount-y", `${swipeAmount.y}px`);
    }
  }, closeButton && !toast2.jsx && toastType !== "loading" ? /* @__PURE__ */ import_react13.default.createElement("button", {
    "aria-label": closeButtonAriaLabel,
    "data-disabled": disabled,
    "data-close-button": true,
    onClick: disabled || !dismissible ? () => {
    } : () => {
      deleteToast();
      toast2.onDismiss == null ? void 0 : toast2.onDismiss.call(toast2, toast2);
    },
    className: cn(classNames == null ? void 0 : classNames.closeButton, toast2 == null ? void 0 : (_toast_classNames2 = toast2.classNames) == null ? void 0 : _toast_classNames2.closeButton)
  }, (_icons_close = icons == null ? void 0 : icons.close) != null ? _icons_close : CloseIcon) : null, (toastType || toast2.icon || toast2.promise) && toast2.icon !== null && ((icons == null ? void 0 : icons[toastType]) !== null || toast2.icon) ? /* @__PURE__ */ import_react13.default.createElement("div", {
    "data-icon": "",
    className: cn(classNames == null ? void 0 : classNames.icon, toast2 == null ? void 0 : (_toast_classNames3 = toast2.classNames) == null ? void 0 : _toast_classNames3.icon)
  }, toastType === "loading" ? toast2.icon || getLoadingIcon() : toast2.promise ? getLoadingIcon() : null, toastType !== "loading" ? icon : null) : null, /* @__PURE__ */ import_react13.default.createElement("div", {
    "data-content": "",
    className: cn(classNames == null ? void 0 : classNames.content, toast2 == null ? void 0 : (_toast_classNames4 = toast2.classNames) == null ? void 0 : _toast_classNames4.content)
  }, /* @__PURE__ */ import_react13.default.createElement("div", {
    "data-title": "",
    className: cn(classNames == null ? void 0 : classNames.title, toast2 == null ? void 0 : (_toast_classNames5 = toast2.classNames) == null ? void 0 : _toast_classNames5.title)
  }, toast2.jsx ? toast2.jsx : typeof toast2.title === "function" ? toast2.title() : toast2.title), toast2.description ? /* @__PURE__ */ import_react13.default.createElement("div", {
    "data-description": "",
    className: cn(descriptionClassName, toastDescriptionClassname, classNames == null ? void 0 : classNames.description, toast2 == null ? void 0 : (_toast_classNames6 = toast2.classNames) == null ? void 0 : _toast_classNames6.description)
  }, typeof toast2.description === "function" ? toast2.description() : toast2.description) : null), /* @__PURE__ */ import_react13.default.isValidElement(toast2.cancel) ? toast2.cancel : toast2.cancel && isAction(toast2.cancel) ? /* @__PURE__ */ import_react13.default.createElement("button", {
    "data-button": true,
    "data-cancel": true,
    style: toast2.cancelButtonStyle || cancelButtonStyle,
    onClick: (event) => {
      if (!isAction(toast2.cancel)) return;
      if (!dismissible) return;
      toast2.cancel.onClick == null ? void 0 : toast2.cancel.onClick.call(toast2.cancel, event);
      deleteToast();
    },
    className: cn(classNames == null ? void 0 : classNames.cancelButton, toast2 == null ? void 0 : (_toast_classNames7 = toast2.classNames) == null ? void 0 : _toast_classNames7.cancelButton)
  }, toast2.cancel.label) : null, /* @__PURE__ */ import_react13.default.isValidElement(toast2.action) ? toast2.action : toast2.action && isAction(toast2.action) ? /* @__PURE__ */ import_react13.default.createElement("button", {
    "data-button": true,
    "data-action": true,
    style: toast2.actionButtonStyle || actionButtonStyle,
    onClick: (event) => {
      if (!isAction(toast2.action)) return;
      toast2.action.onClick == null ? void 0 : toast2.action.onClick.call(toast2.action, event);
      if (event.defaultPrevented) return;
      deleteToast();
    },
    className: cn(classNames == null ? void 0 : classNames.actionButton, toast2 == null ? void 0 : (_toast_classNames8 = toast2.classNames) == null ? void 0 : _toast_classNames8.actionButton)
  }, toast2.action.label) : null);
};
function getDocumentDirection() {
  if (typeof window === "undefined") return "ltr";
  if (typeof document === "undefined") return "ltr";
  const dirAttribute = document.documentElement.getAttribute("dir");
  if (dirAttribute === "auto" || !dirAttribute) {
    return window.getComputedStyle(document.documentElement).direction;
  }
  return dirAttribute;
}
function assignOffset(defaultOffset, mobileOffset) {
  const styles = {};
  [
    defaultOffset,
    mobileOffset
  ].forEach((offset, index) => {
    const isMobile = index === 1;
    const prefix = isMobile ? "--mobile-offset" : "--offset";
    const defaultValue = isMobile ? MOBILE_VIEWPORT_OFFSET : VIEWPORT_OFFSET;
    function assignAll(offset2) {
      [
        "top",
        "right",
        "bottom",
        "left"
      ].forEach((key) => {
        styles[`${prefix}-${key}`] = typeof offset2 === "number" ? `${offset2}px` : offset2;
      });
    }
    if (typeof offset === "number" || typeof offset === "string") {
      assignAll(offset);
    } else if (typeof offset === "object") {
      [
        "top",
        "right",
        "bottom",
        "left"
      ].forEach((key) => {
        if (offset[key] === void 0) {
          styles[`${prefix}-${key}`] = defaultValue;
        } else {
          styles[`${prefix}-${key}`] = typeof offset[key] === "number" ? `${offset[key]}px` : offset[key];
        }
      });
    } else {
      assignAll(defaultValue);
    }
  });
  return styles;
}
var Toaster = /* @__PURE__ */ import_react13.default.forwardRef(function Toaster2(props, ref) {
  const { id, invert, position = "bottom-right", hotkey = [
    "altKey",
    "KeyT"
  ], expand, closeButton, className, offset, mobileOffset, theme = "light", richColors, duration, style, visibleToasts = VISIBLE_TOASTS_AMOUNT, toastOptions, dir = getDocumentDirection(), gap = GAP, icons, customAriaLabel, containerAriaLabel = "Notifications" } = props;
  const [toasts, setToasts] = import_react13.default.useState([]);
  const filteredToasts = import_react13.default.useMemo(() => {
    if (id) {
      return toasts.filter((toast2) => toast2.toasterId === id);
    }
    return toasts.filter((toast2) => !toast2.toasterId);
  }, [
    toasts,
    id
  ]);
  const possiblePositions = import_react13.default.useMemo(() => {
    return Array.from(new Set([
      position
    ].concat(filteredToasts.filter((toast2) => toast2.position).map((toast2) => toast2.position))));
  }, [
    filteredToasts,
    position
  ]);
  const [heights, setHeights] = import_react13.default.useState([]);
  const [expanded, setExpanded] = import_react13.default.useState(false);
  const [interacting, setInteracting] = import_react13.default.useState(false);
  const [actualTheme, setActualTheme] = import_react13.default.useState(theme !== "system" ? theme : typeof window !== "undefined" ? window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : "light");
  const listRef = import_react13.default.useRef(null);
  const hotkeyLabel = hotkey.join("+").replace(/Key/g, "").replace(/Digit/g, "");
  const lastFocusedElementRef = import_react13.default.useRef(null);
  const isFocusWithinRef = import_react13.default.useRef(false);
  const removeToast = import_react13.default.useCallback((toastToRemove) => {
    setToasts((toasts2) => {
      var _toasts_find;
      if (!((_toasts_find = toasts2.find((toast2) => toast2.id === toastToRemove.id)) == null ? void 0 : _toasts_find.delete)) {
        ToastState.dismiss(toastToRemove.id);
      }
      return toasts2.filter(({ id: id2 }) => id2 !== toastToRemove.id);
    });
  }, []);
  import_react13.default.useEffect(() => {
    return ToastState.subscribe((toast2) => {
      if (toast2.dismiss) {
        requestAnimationFrame(() => {
          setToasts((toasts2) => toasts2.map((t3) => t3.id === toast2.id ? {
            ...t3,
            delete: true
          } : t3));
        });
        return;
      }
      setTimeout(() => {
        import_react_dom.default.flushSync(() => {
          setToasts((toasts2) => {
            const indexOfExistingToast = toasts2.findIndex((t3) => t3.id === toast2.id);
            if (indexOfExistingToast !== -1) {
              return [
                ...toasts2.slice(0, indexOfExistingToast),
                {
                  ...toasts2[indexOfExistingToast],
                  ...toast2
                },
                ...toasts2.slice(indexOfExistingToast + 1)
              ];
            }
            return [
              toast2,
              ...toasts2
            ];
          });
        });
      });
    });
  }, []);
  import_react13.default.useEffect(() => {
    if (theme !== "system") {
      setActualTheme(theme);
      return;
    }
    if (theme === "system") {
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setActualTheme("dark");
      } else {
        setActualTheme("light");
      }
    }
    if (typeof window === "undefined") return;
    const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    try {
      darkMediaQuery.addEventListener("change", ({ matches }) => {
        if (matches) {
          setActualTheme("dark");
        } else {
          setActualTheme("light");
        }
      });
    } catch (error) {
      darkMediaQuery.addListener(({ matches }) => {
        try {
          if (matches) {
            setActualTheme("dark");
          } else {
            setActualTheme("light");
          }
        } catch (e) {
          console.error(e);
        }
      });
    }
  }, [
    theme
  ]);
  import_react13.default.useEffect(() => {
    if (toasts.length <= 1) {
      setExpanded(false);
    }
  }, [
    toasts
  ]);
  import_react13.default.useEffect(() => {
    const handleKeyDown = (event) => {
      var _listRef_current;
      const isHotkeyPressed = hotkey.length > 0 && hotkey.every((key) => event[key] || event.code === key);
      if (isHotkeyPressed) {
        var _listRef_current1;
        setExpanded(true);
        (_listRef_current1 = listRef.current) == null ? void 0 : _listRef_current1.focus();
      }
      if (event.code === "Escape" && (document.activeElement === listRef.current || ((_listRef_current = listRef.current) == null ? void 0 : _listRef_current.contains(document.activeElement)))) {
        setExpanded(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    hotkey
  ]);
  import_react13.default.useEffect(() => {
    if (listRef.current) {
      return () => {
        if (lastFocusedElementRef.current) {
          lastFocusedElementRef.current.focus({
            preventScroll: true
          });
          lastFocusedElementRef.current = null;
          isFocusWithinRef.current = false;
        }
      };
    }
  }, [
    listRef.current
  ]);
  return (
    // Remove item from normal navigation flow, only available via hotkey
    /* @__PURE__ */ import_react13.default.createElement("section", {
      ref,
      "aria-label": customAriaLabel != null ? customAriaLabel : `${containerAriaLabel} ${hotkeyLabel}`,
      tabIndex: -1,
      "aria-live": "polite",
      "aria-relevant": "additions text",
      "aria-atomic": "false",
      suppressHydrationWarning: true,
      "data-react-aria-top-layer": true
    }, possiblePositions.map((position2, index) => {
      var _heights_;
      const [y, x] = position2.split("-");
      if (!filteredToasts.length) return null;
      return /* @__PURE__ */ import_react13.default.createElement("ol", {
        key: position2,
        dir: dir === "auto" ? getDocumentDirection() : dir,
        tabIndex: -1,
        ref: listRef,
        className,
        "data-sonner-toaster": true,
        "data-sonner-theme": actualTheme,
        "data-y-position": y,
        "data-x-position": x,
        style: {
          "--front-toast-height": `${((_heights_ = heights[0]) == null ? void 0 : _heights_.height) || 0}px`,
          "--width": `${TOAST_WIDTH}px`,
          "--gap": `${gap}px`,
          ...style,
          ...assignOffset(offset, mobileOffset)
        },
        onBlur: (event) => {
          if (isFocusWithinRef.current && !event.currentTarget.contains(event.relatedTarget)) {
            isFocusWithinRef.current = false;
            if (lastFocusedElementRef.current) {
              lastFocusedElementRef.current.focus({
                preventScroll: true
              });
              lastFocusedElementRef.current = null;
            }
          }
        },
        onFocus: (event) => {
          const isNotDismissible = event.target instanceof HTMLElement && event.target.dataset.dismissible === "false";
          if (isNotDismissible) return;
          if (!isFocusWithinRef.current) {
            isFocusWithinRef.current = true;
            lastFocusedElementRef.current = event.relatedTarget;
          }
        },
        onMouseEnter: () => setExpanded(true),
        onMouseMove: () => setExpanded(true),
        onMouseLeave: () => {
          if (!interacting) {
            setExpanded(false);
          }
        },
        onDragEnd: () => setExpanded(false),
        onPointerDown: (event) => {
          const isNotDismissible = event.target instanceof HTMLElement && event.target.dataset.dismissible === "false";
          if (isNotDismissible) return;
          setInteracting(true);
        },
        onPointerUp: () => setInteracting(false)
      }, filteredToasts.filter((toast2) => !toast2.position && index === 0 || toast2.position === position2).map((toast2, index2) => {
        var _toastOptions_duration, _toastOptions_closeButton;
        return /* @__PURE__ */ import_react13.default.createElement(Toast, {
          key: toast2.id,
          icons,
          index: index2,
          toast: toast2,
          defaultRichColors: richColors,
          duration: (_toastOptions_duration = toastOptions == null ? void 0 : toastOptions.duration) != null ? _toastOptions_duration : duration,
          className: toastOptions == null ? void 0 : toastOptions.className,
          descriptionClassName: toastOptions == null ? void 0 : toastOptions.descriptionClassName,
          invert,
          visibleToasts,
          closeButton: (_toastOptions_closeButton = toastOptions == null ? void 0 : toastOptions.closeButton) != null ? _toastOptions_closeButton : closeButton,
          interacting,
          position: position2,
          style: toastOptions == null ? void 0 : toastOptions.style,
          unstyled: toastOptions == null ? void 0 : toastOptions.unstyled,
          classNames: toastOptions == null ? void 0 : toastOptions.classNames,
          cancelButtonStyle: toastOptions == null ? void 0 : toastOptions.cancelButtonStyle,
          actionButtonStyle: toastOptions == null ? void 0 : toastOptions.actionButtonStyle,
          closeButtonAriaLabel: toastOptions == null ? void 0 : toastOptions.closeButtonAriaLabel,
          removeToast,
          toasts: filteredToasts.filter((t3) => t3.position == toast2.position),
          heights: heights.filter((h43) => h43.position == toast2.position),
          setHeights,
          expandByDefault: expand,
          gap,
          expanded,
          swipeDirections: props.swipeDirections
        });
      }));
    }))
  );
});

// dist/ui/toast-host.js
var TOAST_HOST_KEY = /* @__PURE__ */ Symbol.for("dsh-plugin-core/toast-host");
function claimToastHost(create) {
  const g = globalThis;
  const existing = g[TOAST_HOST_KEY];
  if (existing !== void 0)
    return existing;
  const created = create();
  g[TOAST_HOST_KEY] = created;
  return created;
}

// dist/ui/Toast.js
var DEFAULT_MS = 2600;
var ROOT_ID = "dshpc-toast-root";
function currentTheme() {
  return document.body.hasAttribute("data-ds-dark-theme") ? "dark" : "light";
}
var sharedHost = null;
function toasterHost() {
  if (sharedHost !== null)
    return sharedHost;
  if (typeof document === "undefined" || typeof MutationObserver === "undefined")
    return null;
  sharedHost = claimToastHost(createToasterHost);
  return sharedHost;
}
function createToasterHost() {
  let root = null;
  let themeObserver = null;
  let position = "bottom-center";
  function renderToaster() {
    if (root === null)
      return;
    root.render((0, import_react14.createElement)(Toaster, {
      theme: currentTheme(),
      position,
      // richColors：success=绿整条 / error=红整条 / warning=黄整条（Sonner 自带）；
      // 不开 closeButton：在宿主里吃不到 Sonner 的 CSS 变量，会渲染成白底方块叉（真机踩过）。
      richColors: true
    }));
  }
  function ensureToaster() {
    if (root !== null)
      return;
    let container = document.getElementById(ROOT_ID);
    if (container === null) {
      container = document.createElement("div");
      container.id = ROOT_ID;
      document.body.appendChild(container);
    }
    root = (0, import_client2.createRoot)(container);
    renderToaster();
    themeObserver = new MutationObserver(() => renderToaster());
    themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-ds-dark-theme"]
    });
  }
  function showNative(payload) {
    const duration = payload.durationMs;
    const onDismiss = payload.onDismiss;
    if (payload.color !== void 0) {
      toast(payload.message, {
        duration,
        unstyled: true,
        onDismiss,
        className: "dshpc-toast-custom",
        style: {
          background: payload.color,
          color: "#fff",
          minWidth: "320px",
          minHeight: "48px",
          padding: "12px 16px",
          borderRadius: "8px",
          boxShadow: "0 6px 16px rgba(0, 0, 0, 0.18)",
          fontSize: "14px",
          lineHeight: "20px",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center"
        }
      });
      return;
    }
    const variant = payload.variant;
    if (variant === "success") {
      toast.success(payload.message, { duration, onDismiss });
    } else if (variant === "error") {
      toast.error(payload.message, { duration, onDismiss });
    } else if (variant === "warning") {
      toast.warning(payload.message, { duration, onDismiss });
    } else {
      toast(payload.message, { duration, onDismiss });
    }
  }
  function showCard(payload) {
    const palette = notifyPalette(payload.variant, currentTheme());
    const duration = payload.durationMs;
    const actions = payload.actions;
    const id = toast.custom(() => (0, import_react14.createElement)("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        minWidth: "320px",
        minHeight: "48px",
        padding: "12px 16px",
        borderRadius: "10px",
        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.18)",
        background: palette.bg,
        color: palette.fg,
        boxSizing: "border-box",
        fontSize: "14px",
        lineHeight: "20px"
      }
    }, (0, import_react14.createElement)("span", {
      style: {
        flexShrink: 0,
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        background: "rgba(255, 255, 255, 0.25)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "13px",
        fontWeight: 700
      }
    }, palette.glyph), (0, import_react14.createElement)("div", { style: { flex: 1, minWidth: 0 } }, (0, import_react14.createElement)("div", { style: { fontWeight: 600 } }, payload.message), payload.description !== void 0 ? (0, import_react14.createElement)("div", { style: { opacity: 0.9, fontSize: "13px", marginTop: "2px" } }, payload.description) : null), actions !== void 0 && actions.length > 0 ? (0, import_react14.createElement)("div", { style: { display: "flex", gap: "8px", flexShrink: 0 } }, ...actions.slice(0, 2).map((a) => (0, import_react14.createElement)(Button, {
      variant: a.variant ?? "outline",
      size: "md",
      onClick: () => {
        a.onClick();
        toast.dismiss(id);
      }
    }, a.text))) : null), { duration, unstyled: true });
  }
  return {
    show(payload) {
      ensureToaster();
      renderToaster();
      if (payload.style === "card")
        showCard(payload);
      else
        showNative(payload);
    },
    setPosition(next) {
      position = next;
      renderToaster();
    }
  };
}
function showToast(message, opts) {
  if (typeof document === "undefined")
    return;
  const host = toasterHost();
  if (host === null)
    return;
  if (opts?.position !== void 0)
    host.setPosition(opts.position);
  host.show({
    message,
    variant: opts?.variant ?? "info",
    style: "native",
    durationMs: opts?.durationMs ?? DEFAULT_MS,
    color: opts?.color,
    onDismiss: opts?.onDismiss
  });
}
function notifyPalette(variant, theme) {
  switch (variant) {
    case "success":
      return { bg: "#16a34a", fg: "#ffffff", glyph: "\u2713" };
    // error / warning 用哑光降饱和档：实心卡上加透明度会透出底层内容、伤可读性，
    // 故改为压暗一档的色相（设计师口径：冷静的严重度，而非警报荧光）。
    case "error":
      return { bg: "#c0392b", fg: "#ffffff", glyph: "\u2715" };
    case "warning":
      return { bg: "#e0922f", fg: "#1f2937", glyph: "!" };
    default:
      return theme === "dark" ? { bg: "#3f3f46", fg: "#fafafa", glyph: "i" } : { bg: "#f4f4f5", fg: "#18181b", glyph: "i" };
  }
}
function notify(message, opts) {
  if (typeof document === "undefined")
    return;
  const host = toasterHost();
  if (host === null)
    return;
  if (opts?.position !== void 0)
    host.setPosition(opts.position);
  host.show({
    message,
    variant: opts?.variant ?? "info",
    style: "card",
    description: opts?.description,
    durationMs: opts?.durationMs ?? DEFAULT_MS,
    actions: opts?.actions
  });
}

// dist/ui/EmptyState.js
var import_react15 = require("react");
function EmptyState(props) {
  ensureControls();
  const tt = props.translate ?? t;
  return (0, import_react15.createElement)("div", { className: "dshpc-empty" }, props.icon ?? null, (0, import_react15.createElement)("div", null, props.text ?? tt("emptyText")), props.action ?? null);
}

// dist/ui/Segmented.js
var import_react16 = require("react");
function Segmented(props) {
  ensureControls();
  ensureControls();
  const size = props.size ?? "lg";
  const variant = props.variant ?? "default";
  const multiple = props.multiple === true;
  const value = props.value;
  const onChange = props.onChange;
  return (0, import_react16.createElement)("div", {
    role: "group",
    "aria-label": props.label,
    id: props.id,
    // 结构一套、皮肤只在 controls-css 里；此处只拼「轴」类名，不写任何颜色 / 尺寸字面值。
    className: `dshpc-seg dshpc-seg--${variant} dshpc-seg--${size}${props.block === true ? " dshpc-seg--block" : ""}${props.bordered === true ? " dshpc-seg--bordered" : ""}${props.className !== void 0 ? ` ${props.className}` : ""}`,
    style: props.style
  }, props.items.map((item) => {
    const on = multiple ? value.includes(item.value) : value === item.value;
    const disabled = item.disabled === true || props.disabled === true;
    const handle = () => {
      if (disabled)
        return;
      if (multiple) {
        const arr = value;
        const next = arr.includes(item.value) ? arr.filter((v) => v !== item.value) : [...arr, item.value];
        onChange(next);
      } else {
        ;
        onChange(item.value);
      }
    };
    return (0, import_react16.createElement)("button", {
      key: item.value,
      type: "button",
      className: "dshpc-seg__item",
      // 选中态用 aria-pressed 表达 ⇒ 读屏可读，皮肤也只认这一个选择器
      "aria-pressed": on,
      disabled,
      onClick: handle
    }, item.label, item.count !== void 0 && item.count > 0 ? (0, import_react16.createElement)("span", { className: "dshpc-seg__count" }, String(item.count)) : null, item.badge !== void 0 && item.badge > 0 ? (0, import_react16.createElement)("span", { className: "dshpc-seg__badge" }, String(item.badge)) : null);
  }));
}

// dist/ui/Textarea.js
var import_react17 = require("react");
function Textarea(props) {
  ensureControls();
  const { value, onChange, placeholder, error, disabled, id, rows, spellCheck, className, style } = props;
  const box = (0, import_react17.createElement)("textarea", {
    id,
    rows,
    value,
    placeholder,
    disabled,
    spellCheck: spellCheck === true,
    "aria-label": props["aria-label"],
    className: `dshpc-textarea${error === true ? " dshpc-textarea--error" : ""}${className !== void 0 && className !== "" ? ` ${className}` : ""}`,
    style,
    onChange: (event) => {
      onChange(event.target.value);
    }
  });
  if (props.hint === void 0)
    return box;
  return (0, import_react17.createElement)("span", { className: "dshpc-fieldwrap dshpc-fieldwrap--block" }, box, (0, import_react17.createElement)(FieldHint, { text: props.hint }));
}

// dist/ui/Checkbox.js
var import_react18 = require("react");
function Checkbox(props) {
  const { checked, onChange, label, accentColor, disabled, className } = props;
  return (0, import_react18.createElement)("label", {
    className: `dshpc-checkbox${className !== void 0 && className !== "" ? ` ${className}` : ""}`,
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: "8px",
      fontSize: "var(--dshpc-font-md)",
      lineHeight: "var(--dshpc-line-md)",
      cursor: disabled === true ? "default" : "pointer"
    }
  }, (0, import_react18.createElement)("input", {
    type: "checkbox",
    checked,
    disabled,
    style: {
      flex: "none",
      margin: "2px 0 0",
      accentColor: accentColor ?? "var(--dshpc-business)",
      width: "14px",
      height: "14px",
      cursor: disabled === true ? "default" : "pointer"
    },
    onChange: (event) => {
      onChange(event.target.checked);
    }
  }), label !== void 0 ? (0, import_react18.createElement)("span", null, label) : null);
}

// dist/ui/MarqueeText.js
var import_react19 = require("react");
function MarqueeText(props) {
  const outerRef = (0, import_react19.useRef)(null);
  const innerRef = (0, import_react19.useRef)(null);
  const [dist, setDist] = (0, import_react19.useState)(0);
  const measure = (0, import_react19.useCallback)(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (outer === null || inner === null)
      return;
    setDist(Math.max(0, Math.ceil(inner.scrollWidth - outer.clientWidth)));
  }, []);
  (0, import_react19.useLayoutEffect)(() => {
    const outer = outerRef.current;
    if (outer === null)
      return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(outer);
    return () => {
      ro.disconnect();
    };
  }, [measure]);
  (0, import_react19.useEffect)(() => {
    measure();
  }, [props.text, measure]);
  const run = dist > 0;
  return (0, import_react19.createElement)("span", {
    ref: outerRef,
    className: (run ? "dshpc-mq dshpc-mq-run" : "dshpc-mq") + (props.className === void 0 ? "" : ` ${props.className}`),
    title: props.title,
    style: props.style
  }, (0, import_react19.createElement)("span", {
    ref: innerRef,
    className: "dshpc-mq-in",
    style: {
      ...run ? { "--dshpc-mq-dist": `${-dist}px`, "--dshpc-mq-dur": `${Math.max(3, Math.round(dist / 30))}s` } : null
    }
  }, props.text));
}

// dist/ui/SectionHead.js
var import_react20 = require("react");
function SectionHead(props) {
  return (0, import_react20.createElement)("div", {
    style: { display: "flex", alignItems: "center", gap: "var(--dshpc-space-2)", marginBottom: "var(--dshpc-space-3)" }
  }, (0, import_react20.createElement)("span", { style: { display: "inline-flex", alignItems: "center", flex: "none", lineHeight: "var(--dshpc-line-lg)", color: "var(--dshpc-fg-3)" } }, props.icon), (0, import_react20.createElement)("span", { style: { fontSize: "var(--dshpc-font-lg)", lineHeight: "var(--dshpc-line-lg)", fontWeight: 600, color: "var(--dshpc-fg)", flex: "none" } }, props.title), props.right === void 0 ? null : (0, import_react20.createElement)("div", { style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "var(--dshpc-space-2)", minWidth: 0 } }, props.right));
}

// dist/ui/LiveText.js
var import_react22 = require("react");

// dist/ui/ticker.js
var import_react21 = require("react");
var tickerListeners = /* @__PURE__ */ new Set();
var tickerTimer = null;
var onVisibilityChange = () => {
  for (const l of [...tickerListeners])
    l();
};
var visibilityBound = false;
function subscribeTicker(cb) {
  tickerListeners.add(cb);
  if (tickerTimer === null) {
    tickerTimer = window.setInterval(() => {
      for (const l of [...tickerListeners])
        l();
    }, 1e3);
    if (!visibilityBound && typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibilityChange);
      visibilityBound = true;
    }
  }
  return () => {
    tickerListeners.delete(cb);
    if (tickerListeners.size === 0 && tickerTimer !== null) {
      window.clearInterval(tickerTimer);
      tickerTimer = null;
    }
  };
}

// dist/ui/LiveText.js
function LiveText(props) {
  const [, force] = (0, import_react22.useState)(0);
  const renderRef = (0, import_react22.useRef)(props.render);
  renderRef.current = props.render;
  (0, import_react22.useEffect)(() => subscribeTicker(() => force((v) => v + 1)), []);
  return (0, import_react22.createElement)("span", { style: props.style }, renderRef.current(Date.now()));
}

// dist/ui/resizer.js
function startResizeLayoutWidth(opts) {
  opts.startEvent.preventDefault?.();
  const body = document.body;
  const prevUserSelect = body.style.userSelect;
  body.style.userSelect = "none";
  window.getSelection()?.removeAllRanges();
  const rootEl = opts.root ?? document.getElementById("dshpc-root");
  if (opts.rootClass !== void 0)
    rootEl?.classList.add(opts.rootClass);
  let frame = 0;
  let pendingX = 0;
  const emit = (clientX) => {
    const w = opts.compute(clientX);
    opts.onMove(w);
    return w;
  };
  const onMove = (event) => {
    if (opts.rafThrottle === true) {
      pendingX = event.clientX;
      if (frame !== 0)
        return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        emit(pendingX);
      });
    } else {
      emit(event.clientX);
    }
  };
  const onUp = (event) => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    if (frame !== 0)
      cancelAnimationFrame(frame);
    body.style.userSelect = prevUserSelect;
    if (opts.rootClass !== void 0)
      rootEl?.classList.remove(opts.rootClass);
    opts.onCommit(opts.compute(event.clientX));
  };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

// dist/ui/PanelDock.js
var import_react23 = require("react");

// dist/ui/panel-dock-logic.js
var DEFAULT_PANEL_ID = "default";
function emptyDock() {
  return { ids: [], widths: {} };
}
function clampWidth(value, min, max) {
  const wide = Number.isFinite(value) ? value : min;
  const capped = max === void 0 || !Number.isFinite(max) ? wide : Math.min(wide, max);
  return Math.max(min, Math.round(capped));
}
function isOpen(state, id) {
  return state.ids.includes(id);
}
function openPanel(state, id, maxPanels) {
  if (isOpen(state, id))
    return { state, result: { ok: true, id, created: false } };
  if (state.ids.length >= maxPanels)
    return { state, result: { ok: false, id, reason: "limit" } };
  return { state: { ids: [...state.ids, id], widths: state.widths }, result: { ok: true, id, created: true } };
}
function closePanel(state, id) {
  if (!isOpen(state, id))
    return state;
  const widths = { ...state.widths };
  delete widths[id];
  return { ids: state.ids.filter((item) => item !== id), widths };
}
function setPanelWidth(state, id, width) {
  if (!isOpen(state, id))
    return state;
  if (state.widths[id] === width)
    return state;
  return { ids: state.ids, widths: { ...state.widths, [id]: width } };
}
function othersWidth(state, id, fallbackOf) {
  return state.ids.reduce((sum, item) => {
    if (item === id)
      return sum;
    return sum + (state.widths[item] ?? fallbackOf(item));
  }, 0);
}

// dist/ui/PanelDock.js
function DockPanel(_props) {
  return null;
}
function readStoredWidth(key) {
  try {
    if (typeof localStorage === "undefined")
      return null;
    const raw = localStorage.getItem(key);
    if (raw === null)
      return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}
function writeStoredWidth(key, width) {
  try {
    if (typeof localStorage === "undefined")
      return;
    localStorage.setItem(key, String(width));
  } catch {
  }
}
function createPanelDock(options = {}) {
  const maxPanels = options.maxPanels ?? 3;
  const defaultWidth = options.defaultWidth ?? 460;
  const minWidth = options.minWidth ?? 320;
  const storageKey = options.storageKey ?? "dshpc-dock";
  const widthKey = (id) => storageKey === false ? "" : `${storageKey}:width:${id}`;
  let state = emptyDock();
  const listeners = /* @__PURE__ */ new Set();
  const emit = (next) => {
    if (next === state)
      return;
    state = next;
    for (const listener of listeners)
      listener();
  };
  const controller = {
    defaults: { maxPanels, defaultWidth, minWidth },
    open(id = DEFAULT_PANEL_ID) {
      const { state: next, result } = openPanel(state, id, maxPanels);
      if (result.ok && result.created) {
        const stored = storageKey === false ? null : readStoredWidth(widthKey(id));
        emit(stored === null ? next : setPanelWidth(next, id, stored));
        options.onOpen?.({ id, created: true });
      } else if (result.ok) {
        emit(next);
      } else {
        options.onLimitReached?.({ id });
      }
      return result;
    },
    close(id = DEFAULT_PANEL_ID, reason = "api") {
      if (!isOpen(state, id))
        return;
      if (options.onBeforeClose?.({ id, reason }) === false)
        return;
      emit(closePanel(state, id));
      options.onClose?.({ id, reason });
    },
    toggle(id = DEFAULT_PANEL_ID) {
      if (controller.isOpen(id)) {
        controller.close(id, "api");
        return { ok: true, id, created: false };
      }
      return controller.open(id);
    },
    isOpen(id = DEFAULT_PANEL_ID) {
      return isOpen(state, id);
    },
    ids() {
      return state.ids;
    },
    setWidth(id, width) {
      const next = setPanelWidth(state, id, width);
      if (next === state)
        return;
      emit(next);
      if (storageKey !== false)
        writeStoredWidth(widthKey(id), width);
      options.onResize?.({ id, width });
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot() {
      return state;
    }
  };
  return controller;
}
function panesOf(children) {
  const out = [];
  import_react23.Children.forEach(children, (child) => {
    if ((0, import_react23.isValidElement)(child) && child.type === DockPanel)
      out.push(child.props);
  });
  return out;
}
function PanelDock(props) {
  ensureControls();
  const tt = props.translate ?? t;
  const state = (0, import_react23.useSyncExternalStore)(props.dock.subscribe, props.dock.getSnapshot, props.dock.getSnapshot);
  const rootRef = (0, import_react23.useRef)(null);
  const panelRefs = (0, import_react23.useRef)(/* @__PURE__ */ new Map());
  const panes = panesOf(props.children);
  const { defaultWidth, minWidth: fallbackMin } = props.dock.defaults;
  const widthOf = (pane) => state.widths[pane.id] ?? clampWidth(pane.width ?? defaultWidth, pane.minWidth ?? fallbackMin, pane.maxWidth);
  for (const id of state.ids) {
    if (!panes.some((pane) => pane.id === id)) {
      console.warn(`[dsh-plugin-core] PanelDock: \u9762\u677F "${id}" \u5DF2\u6253\u5F00\u4F46\u6CA1\u6709\u5BF9\u5E94\u7684 <DockPanel id="${id}"> \u58F0\u660E`);
    }
  }
  const beginResize = (pane, event) => {
    const element = panelRefs.current.get(pane.id);
    if (element === void 0 || typeof window === "undefined")
      return;
    const startX = event.clientX;
    const startWidth = widthOf(pane);
    const min = pane.minWidth ?? fallbackMin;
    const mainMin = props.mainMinWidth ?? 480;
    startResizeLayoutWidth({
      startEvent: event,
      root: rootRef.current,
      rootClass: "dshpc-dock--resizing",
      rafThrottle: true,
      compute: (clientX) => {
        const others = othersWidth(state, pane.id, (id) => {
          const other = panes.find((item) => item.id === id);
          return other === void 0 ? defaultWidth : widthOf(other);
        });
        const viewportMax = window.innerWidth - others - mainMin;
        const businessMax = pane.maxWidth ?? Number.POSITIVE_INFINITY;
        const max = Math.min(viewportMax, businessMax);
        return clampWidth(startWidth + (startX - clientX), min, Math.max(min, max));
      },
      onMove: (width) => {
        element.style.width = `${width}px`;
      },
      onCommit: (width) => {
        props.dock.setWidth(pane.id, width);
      }
    });
  };
  const headerCloseOf = (pane) => {
    const closable = pane.closable !== false;
    const mode = pane.closeButton ?? "auto";
    const hasHeader = pane.header !== null;
    if (!closable || !(mode === "header" || mode === "auto" && hasHeader))
      return null;
    return (0, import_react23.createElement)("button", {
      type: "button",
      className: "dshpc-dock__close dshpc-dock__close--abs",
      "aria-label": tt("dockClose"),
      onClick: () => props.dock.close(pane.id, "button")
    }, pane.closeIcon ?? "\u2715");
  };
  const renderHeader = (pane) => {
    if (pane.header === null)
      return null;
    if (pane.header !== void 0) {
      return (0, import_react23.createElement)("div", { className: "dshpc-dock__head dshpc-dock__head--custom" }, pane.header);
    }
    return (0, import_react23.createElement)("div", { className: "dshpc-dock__head" }, pane.icon === void 0 ? null : (0, import_react23.createElement)("div", { className: "dshpc-dock__lead" }, pane.icon), (0, import_react23.createElement)("div", { className: "dshpc-dock__title" }, pane.title), pane.extra === void 0 ? null : (0, import_react23.createElement)("div", { className: "dshpc-dock__extra" }, pane.extra));
  };
  const floatingCloseOf = (pane) => {
    if (pane.closable === false)
      return null;
    const mode = pane.closeButton ?? "auto";
    const hasHeader = pane.header !== null;
    if (mode !== "floating" && !(mode === "auto" && !hasHeader))
      return null;
    return (0, import_react23.createElement)("button", {
      type: "button",
      className: "dshpc-dock__close dshpc-dock__close--floating",
      "aria-label": tt("dockClose"),
      onClick: () => props.dock.close(pane.id, "button")
    }, pane.closeIcon ?? "\u2715");
  };
  return (0, import_react23.createElement)("div", {
    ref: rootRef,
    className: props.className === void 0 ? "dshpc-dock" : `dshpc-dock ${props.className}`
  }, panes.filter((pane) => state.ids.includes(pane.id)).map((pane) => (0, import_react23.createElement)("section", {
    key: pane.id,
    ref: (element) => {
      if (element === null)
        panelRefs.current.delete(pane.id);
      else
        panelRefs.current.set(pane.id, element);
    },
    className: "dshpc-dock__panel",
    style: { width: `${widthOf(pane)}px` },
    "data-panel": pane.id,
    "aria-label": pane.ariaLabel ?? (typeof pane.title === "string" ? pane.title : pane.id)
  }, (0, import_react23.createElement)("div", {
    className: "dshpc-dock__resizer",
    role: "separator",
    "aria-orientation": "vertical",
    "aria-label": tt("dockResize"),
    onPointerDown: (event) => {
      beginResize(pane, event);
    }
  }), renderHeader(pane), headerCloseOf(pane), floatingCloseOf(pane), (0, import_react23.createElement)("div", { className: "dshpc-dock__body" }, pane.children ?? null))));
}

// dist/ui/Field.js
var import_react24 = require("react");
function withHint(control, hint) {
  if (hint === void 0)
    return control;
  return (0, import_react24.createElement)("span", { className: "dshpc-fieldwrap" }, control, (0, import_react24.createElement)(FieldHint, { text: hint }));
}
function sizeClass(size) {
  return size === "lg" ? "--lg" : size === "md" ? "--md" : "--sm";
}
function Input(props) {
  ensureControls();
  const { value, onChange, placeholder, size = "lg", error, disabled, type, className, style } = props;
  return withHint((0, import_react24.createElement)("input", {
    ref: props.inputRef,
    type: type ?? "text",
    value,
    placeholder,
    disabled,
    "aria-label": props["aria-label"],
    title: props.title,
    className: `dshpc-input dshpc-input${sizeClass(size)}${error === true ? " dshpc-input--error" : ""}${className !== void 0 && className !== "" ? ` ${className}` : ""}`,
    style,
    onChange: (event) => {
      onChange(event.target.value);
    },
    onKeyDown: props.onKeyDown,
    onBlur: props.onBlur
  }), props.hint);
}
function NumberInput(props) {
  ensureControls();
  const { value, onChange, min = -Infinity, max = Infinity, step = 1, size = "lg", inputWidth, disabled, suffix, label, decreaseLabel = "\u51CF\u5C11", increaseLabel = "\u589E\u52A0", className, style } = props;
  const [text, setText] = (0, import_react24.useState)(String(value));
  (0, import_react24.useEffect)(() => {
    setText(String(value));
  }, [value]);
  const clamp = (n) => Math.min(max, Math.max(min, n));
  const commit = (raw) => {
    if (raw.trim() === "") {
      setText(String(value));
      return;
    }
    const n = Number(raw);
    if (!Number.isFinite(n)) {
      setText(String(value));
      return;
    }
    const next = clamp(n);
    setText(String(next));
    if (next !== value)
      onChange(next);
  };
  const bump = (dir) => {
    const base = Number.isFinite(Number(text)) ? Number(text) : value;
    const next = clamp(base + dir * step);
    setText(String(next));
    if (next !== value)
      onChange(next);
  };
  return withHint((0, import_react24.createElement)(
    "div",
    {
      className: `dshpc-num dshpc-num${sizeClass(size)}${disabled === true ? " dshpc-num--disabled" : ""}${className !== void 0 && className !== "" ? ` ${className}` : ""}`,
      style
    },
    (0, import_react24.createElement)(IconButton, { variant: "plain", size, icon: "\u2212", label: decreaseLabel, disabled, onClick: () => {
      bump(-1);
    } }),
    // 中段（数字 + 后缀）成组居中：消费端把宽度拉大时，「−」钉最左、「+」钉最右、数字组始终居中
    // （用户 2026-10-18：加减号必须在最左 / 最右，宽度由消费端调）。
    (0, import_react24.createElement)("span", { className: "dshpc-num__mid" }, (0, import_react24.createElement)("input", {
      className: "dshpc-num__input",
      ...inputWidth === void 0 ? {} : { style: { width: `${inputWidth}px` } },
      value: text,
      disabled,
      inputMode: "numeric",
      "aria-label": label,
      onChange: (event) => {
        setText(event.target.value);
      },
      onBlur: () => {
        commit(text);
      },
      onKeyDown: (event) => {
        if (event.key === "Enter")
          commit(text);
      }
    }), suffix !== void 0 ? (0, import_react24.createElement)("span", { className: "dshpc-num__suffix" }, suffix) : null),
    (0, import_react24.createElement)(IconButton, { variant: "plain", size, icon: "+", label: increaseLabel, disabled, onClick: () => {
      bump(1);
    } })
  ), props.hint);
}

// packages/demo/src/host-files.ts
var FileServicesStore = class {
  constructor() {
    this.snapshot = { workspaceFiles: null, officeToPdf: null };
    this.listeners = /* @__PURE__ */ new Set();
    this.getSnapshot = () => this.snapshot;
    this.subscribe = (listener) => {
      this.listeners.add(listener);
      return () => {
        this.listeners.delete(listener);
      };
    };
  }
  set(patch) {
    this.snapshot = { ...this.snapshot, ...patch };
    for (const listener of this.listeners) listener();
  }
  setFiles(workspaceFiles) {
    this.set({ workspaceFiles });
  }
  setOffice(officeToPdf) {
    this.set({ officeToPdf });
  }
};
var fileServices = new FileServicesStore();
function pick(sub, dotted, prop, probe) {
  const rec = sub;
  const remote = rec.remote;
  const candidate = rec[dotted] ?? remote?.[prop];
  if (candidate === null || candidate === void 0) return null;
  const probeValue = candidate[probe];
  return typeof probeValue === "function" ? candidate : null;
}
function connectFileServices(ctx) {
  ctx.inject(["remote", "remote.workspaceFiles"], (sub) => {
    const found = pick(sub, "remote.workspaceFiles", "workspaceFiles", "list");
    if (found !== null) fileServices.setFiles(found);
  });
  ctx.inject(["remote", "remote.officeToPdf"], (sub) => {
    const found = pick(sub, "remote.officeToPdf", "officeToPdf", "render");
    if (found !== null) fileServices.setOffice(found);
  });
}

// packages/demo/src/dock.ts
var import_react25 = require("react");
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");

// dist/utils/date.js
function pad2(value) {
  return String(value).padStart(2, "0");
}
var FALLBACK = "\u2014";
function formatDateTime(iso, opts) {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms))
    return opts?.fallback ?? iso;
  const d = new Date(ms);
  const base = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  return opts?.seconds === true ? `${base}:${pad2(d.getSeconds())}` : base;
}
function formatYmd(iso, opts) {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms))
    return opts?.fallback ?? FALLBACK;
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function formatClock(iso, opts) {
  const fb = opts?.fallback ?? "-";
  if (iso === null || iso === void 0 || iso === "")
    return fb;
  const ms = Date.parse(iso);
  if (Number.isNaN(ms))
    return fb;
  const d = new Date(ms);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}
function formatDurationHms(ms) {
  if (!Number.isFinite(ms) || ms < 0)
    return "-";
  const totalSec = Math.round(ms / 1e3);
  const h43 = Math.floor(totalSec / 3600);
  const m = Math.floor(totalSec % 3600 / 60);
  const s = totalSec % 60;
  return h43 > 0 ? `${h43}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`;
}
function sameCalendarDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function relativePast(iso, nowMs, translate) {
  const tt = translate ?? t;
  const diff = nowMs - Date.parse(iso);
  if (Number.isNaN(diff) || !(diff >= 0))
    return tt("relNow");
  if (diff < 6e4)
    return tt("relJustNow");
  const minutes = Math.floor(diff / 6e4);
  if (minutes < 60)
    return tt("relMinutesAgo", { n: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24)
    return tt("relHoursAgo", { n: hours });
  const days = Math.floor(hours / 24);
  if (days < 7)
    return tt("relDaysAgo", { n: days });
  if (days < 30)
    return tt("relWeeksAgo", { n: Math.floor(days / 7) });
  const months = Math.floor(days / 30);
  if (months < 12)
    return tt("relMonthsAgo", { n: months });
  return tt("relYearsAgo", { n: Math.floor(days / 365) });
}
function relativeFuture(iso, nowMs, translate) {
  const tt = translate ?? t;
  const diff = Date.parse(iso) - nowMs;
  if (Number.isNaN(diff))
    return formatYmd(iso);
  if (diff <= 0)
    return tt("relNow");
  if (diff < 6e4)
    return tt("relInJustNow");
  const minutes = Math.floor(diff / 6e4);
  if (minutes < 60)
    return tt("relInMinutes", { n: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24)
    return tt("relInHours", { n: hours });
  const days = Math.floor(hours / 24);
  if (days < 30)
    return tt("relInDays", { n: days });
  const months = Math.floor(days / 30);
  if (months < 12)
    return tt("relInMonths", { n: months });
  return tt("relInYears", { n: Math.floor(days / 365) });
}
function formatRange(fromIso, toIso, opts) {
  const from = Date.parse(fromIso);
  const to = Date.parse(toIso);
  if (Number.isNaN(from) || Number.isNaN(to))
    return FALLBACK;
  const a = new Date(from);
  const b = new Date(to);
  const clock = (d) => opts?.seconds === true ? `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}` : `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  if (sameCalendarDay(a, b))
    return `${clock(a)} \u2013 ${clock(b)}`;
  const day = (d) => `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  return `${day(a)} ${clock(a)} \u2013 ${day(b)} ${clock(b)}`;
}

// dist/utils/number.js
function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0)
    return "\u2014";
  if (bytes < 1024)
    return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value >= 10 ? String(Math.round(value)) : value.toFixed(1)} ${units[unit]}`;
}

// dist/utils/path.js
var IMAGE_EXT = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  bmp: "image/bmp",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  avif: "image/avif"
};
function mimeOf(path) {
  const ext = extOf(path);
  return ext === "" ? void 0 : IMAGE_EXT[ext];
}
function extOf(path) {
  const name = path.slice(path.lastIndexOf("/") + 1);
  const dot = name.lastIndexOf(".");
  return dot <= 0 ? "" : name.slice(dot + 1).toLowerCase();
}
function parentOf(path) {
  const cut = path.lastIndexOf("/");
  return cut < 0 ? "" : path.slice(0, cut);
}
function joinPath(dir, name) {
  return dir === "" ? name : `${dir}/${name}`;
}

// packages/demo/src/i18n.ts
var DICT2 = {
  zh: {
    grpStart: "\u5165\u95E8",
    grpComponents: "\u63A7\u4EF6",
    grpBlocks: "\u4E1A\u52A1\u6A21\u5757",
    grpUtils: "\u901A\u7528\u65B9\u6CD5",
    grpReference: "\u53C2\u8003",
    secOverview: "\u6982\u89C8",
    secInstall: "\u5B89\u88C5\u4E0E\u521D\u59CB\u5316",
    secQuickstart: "\u5FEB\u901F\u5F00\u59CB",
    secFoundation: "\u8BBE\u8BA1\u57FA\u7840",
    secWritePlugin: "\u5199\u4E00\u4E2A\u63D2\u4EF6",
    secReference: "\u53C2\u8003\u4E0E\u7EA6\u5B9A",
    secNaming: "\u547D\u540D\u4E0E\u524D\u7F00\u5951\u7EA6",
    secButton: "\u6309\u94AE",
    secInput: "\u5F55\u5165",
    secPicker: "\u9009\u62E9\u5668",
    secTooltip: "\u63D0\u793A",
    secCard: "\u5361\u7247\u4E0E\u5BB9\u5668",
    secChip: "\u6807\u7B7E \xB7 \u6587\u672C \xB7 \u72B6\u6001",
    secFeedback: "\u53CD\u9988",
    secLayout: "\u5E03\u5C40\u4E0E\u6EDA\u52A8",
    secExplorer: "\u5DE5\u4F5C\u533A\u6D4F\u89C8",
    secSession: "\u4F1A\u8BDD\u9884\u89C8",
    secDate: "\u65E5\u671F\u4E0E\u65F6\u95F4",
    secText: "\u5B57\u7B26\u4E32\u4E0E\u8DEF\u5F84",
    secNumber: "\u6570\u5B57\u4E0E\u5B57\u8282",
    secHttp: "HTTP \u53D6\u6570",
    secI18n: "\u591A\u8BED\u8A00",
    secA11y: "\u65E0\u969C\u788D\u4E0E\u952E\u76D8",
    secRoadmap: "\u7F3A\u53E3\u4E0E\u8DEF\u7EBF\u56FE",
    secBuild: "\u7248\u672C\u4E0E\u6784\u5EFA",
    phTodo: "\u5F85\u8865\u5185\u5BB9",
    inputMissingDesc: "\u672C\u9875\u5C1A\u672A\u5C55\u793A\uFF1A\n\xB7 PrefixedInput\uFF08\u5E26\u524D\u7F00\u7684\u8F93\u5165\u6846\uFF09\u2014\u2014 dem\u043E \u91CC\u8FD8\u6CA1\u6709\u6837\u4F8B\n\xB7 Loading / RunningBlocks \u867D\u5C5E\u53CD\u9988\uFF0C\u5B9E\u9645\u6E32\u67D3\u4F1A\u6302\u5728\u5BB9\u5668\u53F3\u4E0B\u89D2\uFF0C\u89C1\u300C\u53CD\u9988\u300D\u9875\u7684\u8BF4\u660E",
    pickerLogicDesc: "\u672C\u9875\u5C1A\u672A\u5C55\u793A\uFF1A\n\xB7 picker-logic \u5BFC\u51FA\u7684\u7EAF\u51FD\u6570 filterGroups / flattenOptions / groupOf / labelsOf / toGroups / toggleValue\n\u2014\u2014 \u5B83\u4EEC\u662F\u9009\u62E9\u9898\u5E95\u5C42\u7684\u53D6\u503C\u903B\u8F91\uFF0C\u6CA1\u6709 UI\uFF0C\u9700\u8981\u4E00\u5F20\u300C\u8F93\u5165 \u2192 \u8F93\u51FA\u300D\u7684\u901F\u67E5\u8868\u624D\u8BB2\u5F97\u6E05",
    overviewDesc: "\u5F85\u8865\uFF1A\n\xB7 \u5305\u7684\u4E00\u53E5\u8BDD\u5B9A\u4F4D\uFF1A\u8C01\u80FD\u7528\u3001\u89E3\u51B3\u4EC0\u4E48\n\xB7 \u4E94\u4E2A\u5B50\u5305\u5404\u81EA\u56DE\u7B54\u4EC0\u4E48\u95EE\u9898\uFF08design / ui / utils / explorer / session\uFF09\n\xB7 \u4E00\u5F20\u80FD\u529B\u5730\u56FE\uFF0C\u76F4\u63A5\u8DF3\u5230\u5BF9\u5E94\u4E8C\u7EA7\u9875\n\xB7 \u4E0D\u9002\u7528\u8FB9\u754C\uFF08\u4E0D\u662F i18n \u6846\u67B6\u3001\u4E0D\u662F\u8BBE\u7F6E\u9875\u9AA8\u67B6\uFF09",
    installDesc: "\u5F85\u8865\uFF1A\n\xB7 \u4F9D\u8D56\u58F0\u660E\u600E\u4E48\u88C5\uFF08git \u5B89\u88C5\uFF0C\u5BBF\u4E3B\u4E0D\u8DD1\u6784\u5EFA\u811A\u672C\uFF09\n\xB7 \u5165\u53E3\u5FC5\u987B\u505A\u7684\u4E24\u884C\uFF1AsetStyleKit + ensureControls\n\xB7 \u4E3A\u4EC0\u4E48 @deepseek-ai/* \u5FC5\u987B\u6807 external\uFF08\u4E0D\u6807\u6253\u5305\u4F1A\u5931\u8D25\uFF09\n\xB7 \u5BBF\u4E3B slots \u6CE8\u518C\uFF1Asidebar.panellist / main / settings.plugin.item\n\xB7 \u88C5\u4E0D\u4E0A\u7684\u6392\u67E5\u6E05\u5355\uFF08\u5148\u770B build \u7F16\u7801\u662F\u5426\u53D8\u4E86\uFF09",
    quickstartDesc: "\u5F85\u8865\uFF1A\n\xB7 \u4E00\u4E2A\u6700\u5C0F\u53EF\u8DD1\u63D2\u4EF6\u7684\u5B8C\u6574\u6E90\u7801\n\xB7 \u4ECE\u5EFA\u76EE\u5F55\u5230\u5728\u5BBF\u4E3B\u91CC\u770B\u89C1\u5B83\u7684\u5206\u6B65\u8BF4\u660E\n\xB7 \u672C\u9884\u89C8\u63D2\u4EF6\u81EA\u5DF1\u5C31\u662F\u6837\u4F8B\uFF0C\u53EF\u5BF9\u7167 packages/demo/src",
    namingDesc: "\u5F85\u8865\uFF1A\n\xB7 \u53D8\u91CF\u4E0E\u7C7B\u540D\u7EDF\u4E00 dshpc \u524D\u7F00\u7684\u7406\u7531\n\xB7 \u7C7B\u540D\u5FC5\u987B\u4E0E\u7EC4\u4EF6\u91CC\u786C\u7F16\u7801\u7684 className \u9010\u5B57\u4E00\u81F4\u2014\u2014\u4E0D\u4E00\u81F4\u4F1A\u6574\u7247\u5931\u6548\n\xB7 createStyleKit({ id }) \u9694\u79BB\u5230\u4EC0\u4E48\u7C92\u5EA6\n\xB7 \u6CE8\u5165\u987A\u5E8F\uFF1A\u540C\u7279\u5F02\u6027\u65F6\u540E\u6CE8\u5165\u8005\u80DC\u51FA\n\xB7 \u660E\u6697\u5224\u636E\u4E3A\u4EC0\u4E48\u662F body[data-ds-dark-theme] \u800C\u4E0D\u662F\u7CFB\u7EDF\u8BBE\u7F6E",
    dockHint: "\u53F3\u4FA7\u505C\u9760\u5206\u680F\uFF0C\u6302\u5728\u6574\u9875\u4E0A\uFF1A\u7ED3\u6784\u5199\u5728\u9875\u9762\u91CC\uFF08DockPanel\uFF09\uFF0Copen(id) \u53EA\u7BA1\u663E\u9690\u3002\n\u8BD5\u4E00\u904D\uFF1A\u5F00 A\uFF08\u56FE\u6807 + \u6807\u9898 + \u53F3\u4FA7\u6807\u7B7E\uFF09\u2192 \u5F00 B\uFF08\u6574\u5757\u81EA\u5B9A\u4E49\u5934\u90E8\uFF09\u2192 \u5F00 C\uFF08\u65E0\u5934\u90E8\u3001\u5173\u95ED\u94AE\u6D6E\u5728\u53F3\u4E0A\u89D2\uFF09\u2192 \u5173 A \u540E\u518D\u5F00\u65B0\u7EC4\u540D \u2192 \u6EE1 3 \u680F\u518D\u5F00\u4F1A\u88AB\u62D2\u7EDD\u3002",
    dockMainText: "\u5206\u680F\u662F\u5E03\u5C40\u6210\u5458\uFF1A\u5B83\u628A\u8FD9\u4E00\u9875\u7684\u6B63\u6587\u6324\u7A84\uFF0C\u800C\u4E0D\u662F\u76D6\u5728\u4E0A\u9762\u3002\u4E09\u4E2A\u9762\u677F\u5206\u522B\u6F14\u793A\u5185\u7F6E\u5934\u3001\u81EA\u5B9A\u4E49\u5934\u3001\u65E0\u5934 + \u6D6E\u52A8\u5173\u95ED\u94AE\u3002",
    dockPanelA: "\u5185\u7F6E\u5934\uFF1A\u56FE\u6807 + \u6807\u9898 + \u53F3\u4FA7\u5185\u5BB9",
    dockPanelATag: "\u65B0",
    dockPanelC: "\u65E0\u5934\u9762\u677F",
    dockCustomHeadTitle: "\u81EA\u5B9A\u4E49\u5934\u90E8\uFF08\u672C\u884C\u53CA\u4EE5\u4E0B\u90FD\u7531\u8C03\u7528\u65B9\u753B\uFF09",
    dockCustomHeadHint: "\u5E93\u4E0D\u52A0\u5185\u8FB9\u8DDD\u3001\u4E0D\u52A0\u8FB9\u6846 \u2014\u2014 \u591A\u9AD8\u3001\u51E0\u884C\u3001\u653E\u4EC0\u4E48\u5F39\u5C42\u90FD\u968F\u4F60",
    dockPanelBody: "\u8FD9\u4E00\u680F\u7684\u5185\u5BB9\u3002\u518D\u5F00\u540C\u540D\u9762\u677F\u4F1A\u66FF\u6362\u5B83\uFF0C\u5BBD\u5EA6\u4E0E\u4F4D\u7F6E\u4FDD\u6301\u4E0D\u53D8\u3002",
    dockOpened: "\u5F53\u524D\u7A97\u53E3\uFF1A",
    dockLimitWarn: "\u5DF2\u6EE1 3 \u680F\uFF0C\u65B0\u7EC4\u540D\u88AB\u62D2\u7EDD\uFF08open \u8FD4\u56DE ok:false / reason:limit\uFF09",
    dockBtnOpenA: "\u6253\u5F00 A",
    dockBtnOpenB: "\u6253\u5F00 B",
    dockBtnOpenA2: "\u518D\u5F00 A\uFF08\u4E0D\u4F1A\u591A\u5F00\uFF09",
    dockBtnCloseA: "\u5173\u95ED A",
    dockBtnDefault: "\u6253\u5F00\u9ED8\u8BA4\u7A97\u53E3",
    dockBtnOpenC: "\u6253\u5F00 C",
    dockBtnReset: "\u5168\u90E8\u5173\u95ED",
    textDesc: "\u5F85\u8865\uFF1A\n\xB7 baseNameOf / safeTrim / truncateBytes \u7684\u5B9E\u9645\u8868\u73B0\n\xB7 crumbsOf / extOf / joinPath / mimeOf / parentOf\n\xB7 \u5171\u540C\u53E3\u5F84\uFF1A\u89E3\u6790\u5931\u8D25\u4E00\u5F8B\u515C\u5E95\u3001\u4E0D\u629B\u9519\u3001\u4E0D\u7F16\u9020",
    httpDesc: "\u5F85\u8865\uFF1A\n\xB7 request / requestJson \u7684\u7528\u6CD5\n\xB7 HttpError \u7684\u5B57\u6BB5\u4E0E\u5224\u9519\u65B9\u5F0F\n\xB7 \u8D85\u65F6 / \u91CD\u8BD5 / \u9274\u6743\u600E\u4E48\u4F20",
    i18nDesc: "\u5F85\u8865\uFF1A\n\xB7 getLocale / setLocale\uFF1A\u5355\u4E00\u8BED\u8A00\u72B6\u6001\n\xB7 \u6838\u5FC3\u81EA\u5E26\u7684\u591A\u8BED\u8A00\u662F\u300C\u7EC4\u4EF6\u7684\u56FA\u5B9A\u63D0\u793A\u8BED\u300D\uFF0C\u4E0D\u542B\u63D2\u4EF6\u754C\u9762\u6587\u6848\n\xB7 \u63D2\u4EF6\u81EA\u5DF1\u7684\u6587\u6848\u7531\u63D2\u4EF6\u81EA\u7BA1\u2014\u2014\u672C\u9884\u89C8\u63D2\u4EF6\u7684 DICT \u5C31\u662F\u6837\u4F8B\n\xB7 \u8BED\u8A00\u7531\u5BBF\u4E3B\u9A71\u52A8\uFF0C\u63D2\u4EF6\u4E0D\u81EA\u5E26\u8BED\u8A00\u9009\u62E9\u5668",
    i18nNow: "\u5F53\u524D locale",
    a11yDesc: "\u5F85\u8865\uFF1A\n\xB7 \u7126\u70B9\u73AF\u4E0E\u952E\u76D8\u53EF\u8FBE\u6027\n\xB7 Tab \u987A\u5E8F\u4E0E Modal \u7684\u7126\u70B9\u9677\u9631\n\xB7 role / aria-* \u8BED\u4E49\u7684\u8986\u76D6\u60C5\u51B5\n\xB7 \u5BF9\u6BD4\u5EA6\u4E0E prefers-reduced-motion \u7684\u5904\u7406",
    tokensHint: "\u989C\u8272\u5168\u90E8\u6765\u81EA design \u7684 token\uFF1B\u5207\u6362\u53F3\u4E0A\u89D2\u660E\u6697\uFF0C\u4E0B\u9762\u4F1A\u8DDF\u7740\u53D8",
    darkHint: "\u660E\u6697\u5224\u636E\u662F\u5199\u6B7B\u7684\uFF1A\u5BBF\u4E3B\u5728 body \u4E0A\u6302 data-ds-dark-theme \u624D\u5207\u6697\u8272\uFF0C\u4E0D\u8BFB\u7CFB\u7EDF\u7684 prefers-color-scheme\u3002\u63D2\u4EF6\u56E0\u6B64\u4E0D\u9700\u8981\u3001\u4E5F\u4E0D\u5E94\u8BE5\u81EA\u5E26\u660E\u6697\u5F00\u5173\u2014\u2014\u4E0B\u9762\u662F\u5F53\u524D\u5B9E\u6D4B\u503C\uFF0C\u5207\u660E\u6697\u540E\u91CD\u5F00\u672C\u9875\u53EF\u89C1\u53D8\u5316\u3002",
    darkNow: "\u5F53\u524D body[data-ds-dark-theme]",
    injectHint: "\u63A7\u4EF6\u6E32\u67D3\u524D\u8C03\u4E00\u6B21 setStyleKit + ensureControls\uFF0Ctoken \u4E0E\u63A7\u4EF6 CSS \u7531 kit \u6CE8\u5165 <head>",
    demoTokenPalette: "token \u8272\u677F",
    demoStyleInject: "\u6837\u5F0F\u6CE8\u5165\u673A\u5236",
    designInjectNote: "\u672C\u9884\u89C8\u63D2\u4EF6\u81EA\u5DF1\u5C31\u662F\u8FD9\u4E48\u505A\u521D\u59CB\u5316\u7684\u2014\u2014\u9884\u89C8\u4E0E\u771F\u5B9E\u63D2\u4EF6\u8D70\u540C\u4E00\u6761\u8DEF\u3002",
    btnTextTitle: "\u6309\u94AE\u6587\u6848\u4E0E\u8BED\u8A00",
    btnTextHint: "\u6587\u6848\u7531\u8C03\u7528\u65B9\u7ED9\uFF1A\u4E2D\u6587\u73AF\u5883\u51FA\u4E2D\u6587\u3001\u82F1\u6587\u73AF\u5883\u51FA\u82F1\u6587\uFF1B\u4E2D\u82F1\u5E76\u6392\u7684\u7EC4\u5408\u4E5F\u652F\u6301\uFF08\u6700\u53F3\u4E00\u9897\uFF09",
    btnVariantTitle: "\u5916\u89C2\u6863\uFF0810 \u6863\uFF09",
    btnVariantHint: "\u5B9E\u5FC3\uFF1Aprimary / secondary / danger / success / warning / info\uFF1B\u7EBF\u6846\uFF1Aoutline / danger-outline\uFF1B\u65E0\u5E95\uFF1Aghost / link",
    btnSizeTitle: "\u5C3A\u5BF8 / \u56FE\u6807 / block",
    btnSizeHint: "sm 24 \xB7 md 28 \xB7 lg 32 \u540C\u9AD8\uFF1Bicon \u6536\u7684\u662F ReactNode\u2014\u2014\u5B98\u65B9\u56FE\u6807\u7EC4\u4EF6\u3001\u81EA\u7ED8 SVG\u3001\u751A\u81F3\u4E00\u4E2A\u5B57\u7B26\u90FD\u884C\uFF0C\u4E0D\u662F\u540D\u5B57\u4E5F\u4E0D\u662F class\uFF08\u4E0B\u9762\u4E09\u9897\u5206\u522B\u662F\u8FD9\u4E09\u79CD\uFF09\uFF1BiconRight \u540E\u7F6E\u3001block \u6491\u6EE1\u7236\u5BBD",
    btnStateTitle: "\u72B6\u6001",
    btnStateHint: "disabled \u534A\u900F\u660E\u4E0D\u53EF\u70B9\uFF1Bloading \u524D\u7F6E\u540C\u8272\u5C0F\u5708\u5E76\u81EA\u52A8\u7981\u7528",
    btnColorTitle: "\u81EA\u5B9A\u4E49\u989C\u8272",
    btnColorHint: "color \u4F20\u4EFB\u610F CSS \u8272\u503C\uFF1A\u5B9E\u5FC3\u6863\u4F5C\u5E95\u8272\u3001\u7EBF\u6846\u4E0E\u6587\u5B57\u6863\u4F5C\u4E3B\u8272\uFF1Bhover / \u6309\u4E0B\u81EA\u52A8\u6309\u8BE5\u8272\u6DF7\u51FA",
    btnNote: "\u5B98\u65B9 primitives \u6CA1\u6709 danger / lg \u8FD9\u4E24\u6761\u8F74\uFF0CButton \u7531\u672C\u5E93\u81EA\u7ED8\uFF1B\u5916\u89C2\u5168\u8D70 --dshpc-* token\uFF0C\u8DDF\u7740\u5BBF\u4E3B\u660E\u6697\u4E3B\u9898\u8D70\u3002",
    inputNote: "\u5F55\u5165\u5BB6\u65CF\u4E09\u6863\u9AD8\u5EA6\u5403 --dshpc-control-h-*\uFF1Bhint \u53C2\u6570\u7531\u7EC4\u4EF6\u81EA\u5DF1\u6302 FieldHint\uFF0C\u4E0D\u7528\u624B\u52A8\u62FC\u3002\u300C\u542F\u7528\u300D\u662F\u5F00\u5173\u8BED\u4E49\uFF1A\u7528\u5B98\u65B9 Switch\uFF08label \u53EA\u662F\u65E0\u969C\u788D\u540D\uFF0C\u53EF\u89C1\u6587\u6848\u81EA\u5DF1\u753B\u5728\u65C1\u8FB9\uFF09\uFF0C\u4E0D\u7528\u52FE\u9009\u6846\u3002",
    apiValue: "\u5F53\u524D\u503C\uFF08\u53D7\u63A7\uFF09",
    apiOnChange: "\u503C\u53D8\u5316\u56DE\u8C03",
    apiPlaceholder: "\u5360\u4F4D\u6587\u6848",
    apiHint: "\u6846\u540E\u6302\u95EE\u53F7\u63D0\u793A\uFF08FieldHint \u672C\u4F53\uFF09",
    apiError: "\u63CF\u7EA2\uFF08\u6821\u9A8C\u5931\u8D25\u6001\uFF09",
    apiMin: "\u4E0B\u9650\uFF0C\u8D85\u51FA\u81EA\u52A8\u6536\u56DE",
    apiMax: "\u4E0A\u9650\uFF0C\u8D85\u51FA\u81EA\u52A8\u6536\u56DE",
    apiSuffix: "\u6570\u5B57\u540E\u7F00\uFF08\u5982\u300C\u6B21\u300D\uFF09",
    apiRows: "\u521D\u59CB\u884C\u6570",
    apiItems: "\u5206\u6BB5\u9879\uFF1A{ value, label, count?, badge?, disabled? }",
    apiMultiple: "\u591A\u9009\uFF1Avalue \u4E0E onChange \u90FD\u662F\u6570\u7EC4",
    apiBordered: "\u9009\u4E2D\u6BB5\u53D8\u63CF\u8FB9\u5757",
    apiLabel: "aria \u7EC4\u540D\uFF08\u65E0\u969C\u788D\uFF0C\u4E0D\u53EF\u89C1\uFF09",
    pickerNote: "\u9009\u62E9\u5668\u4E00\u4E2A\u7EC4\u4EF6\u8986\u76D6\u5355\u9009\u3001\u5206\u7EC4\u3001\u591A\u9009\u4E09\u79CD\u5F62\u6001\uFF1B\u9009\u9879 icon \u6536 ReactNode\uFF0Chint \u6302\u5728\u89E6\u53D1\u5668\u540E\u9762\u3002ModelPicker / WorkspacePicker \u662F\u5B83\u7684\u4E1A\u52A1\u5C01\u88C5\uFF1A\u6570\u636E\u7531\u5BBF\u4E3B\u7ED9\uFF08connectHost \u6CE8\u5165\uFF09\uFF0C\u4E0D\u80FD\u51ED\u7A7A\u9020\u3002",
    tooltipNote: "Tooltip \u662F\u5B98\u65B9 primitive\uFF1Alabel + side / align\uFF1Bchildren \u5FC5\u987B\u662F\u80FD\u6302 ref \u7684\u771F\u5B9E DOM\uFF08\u51FD\u6570\u7EC4\u4EF6\u6302\u4E0D\u4E0A \u21D2 \u60AC\u505C\u65E0\u6C14\u6CE1\uFF0C\u5144\u5F1F\u4ED3\u8E29\u8FC7\uFF09\u3002HoverCard \u662F\u53E6\u4E00\u79CD\u60AC\u505C\u5BCC\u5361\u7247\uFF0Ccompact \u53D8\u4F53\u80CC\u666F\u6052\u6DF1\uFF0C\u5185\u5BB9\u8272\u8981\u8C03\u7528\u65B9\u81EA\u5DF1\u7ED9\u3002",
    cardNote: "Card \u4E0E StripCard \u5171\u7528\u540C\u4E00\u4EFD props\uFF0C\u5DEE\u7684\u662F\u5916\u89C2\uFF1ACard \u662F surface \u5E95 + 1px \u8FB9\u6846 + \u5706\u89D2\uFF1BStripCard \u662F\u540C\u8272\u7CFB\u6D45\u5E95 + \u65B9\u89D2 + \u5DE6\u7F18 4px \u901A\u9AD8\u8272\u6761 \u2014\u2014 \u5907\u6CE8\u6846\u3001\u6267\u884C\u8BB0\u5F55\u6761\u90FD\u662F\u5B83\u3002",
    chipNote: "Chip \u662F\u884C\u5185\u6807\u7B7E\uFF1Atone \u4E94\u6863 + size \u4E09\u6863\uFF1B\u4F20 onClick \u624D\u6E32\u67D3\u6210 button\u3002\u4E2D\u6027 # \u6807\u7B7E\u4E0E\u8BED\u8A00\u65E0\u5173\uFF0C\u957F\u6587\u5B57\u5BBD\u5EA6\u8DDF\u7740\u6587\u5B57\u8D70\u3002",
    apiOptions: "\u6241\u5E73\u9009\u9879\uFF1A[{ value, label, icon?, disabled? }]",
    apiGroups: "\u5206\u7EC4\u9009\u9879\uFF1A[{ value, label, options }]\uFF08\u4E0E options \u4E8C\u9009\u4E00\uFF09",
    apiMode: "'single' | 'multiple'",
    apiSearchable: "\u89E6\u53D1\u5668\u5185\u5E26\u641C\u7D22\u6846",
    apiClearable: "\u5DF2\u9009\u540E\u53EF\u4E00\u952E\u6E05\u9664",
    apiSide: "\u6C14\u6CE1\u65B9\u4F4D\uFF1A'top' | 'bottom' | 'right'",
    apiAlign: "\u5BF9\u9F50\uFF1A'center' | 'end'",
    apiMaxWidth: "\u6C14\u6CE1\u6700\u5927\u5BBD\u5EA6\uFF08\u50CF\u7D20\uFF09",
    apiDelayMs: "\u60AC\u505C\u591A\u4E45\u51FA\u6C14\u6CE1\uFF08\u6BEB\u79D2\uFF09",
    apiPortal: "\u6302\u5230 document.body\uFF0C\u907F\u5F00\u7956\u5148\u6EA2\u51FA\u88C1\u526A",
    apiAnchor: "\u951A\u70B9\u5B50\u5143\u7D20\uFF1A\u5FC5\u987B\u662F\u80FD\u6302 ref \u7684\u771F\u5B9E DOM",
    apiAccent: "\u8272\u6761\u6863\u4F4D business / success / warning / danger / neutral\uFF0C\u6216\u4EFB\u610F CSS \u8272\u503C",
    apiExpanded: "\u5C55\u5F00\u6001\uFF1A\u51B3\u5B9A\u7BAD\u5934\u671D\u5411\u4E0E panel \u663E\u9690",
    apiOnToggle: "\u4F20\u4E86\u624D\u663E\u793A\u6298\u53E0\u7BAD\u5934\uFF1B\u5C55\u5F00\u72B6\u6001\u7531\u8C03\u7528\u65B9\u7BA1",
    apiAction: "\u53F3\u4E0A\u89D2\u64CD\u4F5C\u533A\uFF08\u6309\u94AE / \u6587\u5B57\u90FD\u884C\uFF0C\u81EA\u52A8\u5782\u76F4\u5C45\u4E2D\uFF09",
    apiPanel: "\u5C55\u5F00\u5185\u5BB9\uFF08expanded \u4E3A true \u65F6\u663E\u793A\uFF09",
    apiTone: "\u8BED\u4E49\u8272\u6863\uFF1Aneutral / business / success / warning / danger",
    apiToneModal: "\u8BED\u4E49\u6863\uFF1A'primary' | 'danger' | 'warning'\uFF08\u786E\u8BA4\u6846\u4E13\u7528\uFF0C\u4E0E Chip \u7684\u4E94\u6863 tone \u4E0D\u540C\uFF09",
    apiOnClick: "\u4F20\u4E86\u624D\u6E32\u67D3\u6210 button",
    apiText: "\u6587\u5B57",
    apiRender: "\u8D70\u65F6\u6E32\u67D3\u51FD\u6570\uFF1A\u53C2\u6570\u662F\u5F53\u524D\u6BEB\u79D2\u6570\uFF0C\u8FD4\u56DE\u4EFB\u610F ReactNode",
    feedbackNote: '\u5F39\u7A97\u5206\u4E09\u5C42\uFF0C\u6309\u9700\u8981\u9009\uFF1A\u5BBF\u4E3B\u5B98\u65B9 Modal\uFF08\u906E\u7F69/\u5934\u90E8/\u5173\u95ED\u53C9\u5168\u5F52\u5BBF\u4E3B\u7BA1\uFF0C\u547D\u4EE4\u5F0F\u52A0 skin:"host"\uFF09\u2192 \u6211\u4EEC\u7684\u6807\u51C6\u5C0F\u6846 AlertModal / ConfirmModal\uFF08\u5355/\u53CC\u6309\u94AE\uFF0C\u540D\u5B57\u5E26 Modal \u540E\u7F00\uFF0C\u4E0D\u8986\u76D6\u5BBF\u4E3B\u539F\u751F\uFF09\u2192 \u6211\u4EEC\u7684\u5185\u5BB9\u5F39\u7A97 Modal\uFF08size md/lg\uFF0C\u627F\u8F7D\u4EFB\u610F\u5185\u5BB9\uFF09\u3002\u547D\u4EE4\u5F0F\u4E00\u5F8B Promise\uFF08await confirmModal(...) \u62FF true/false\uFF09\uFF0C\u4E0D\u7528\u56DE\u8C03\u5F0F\u3002\u63D0\u793A\u4E09\u79CD\uFF1AshowToast \u662F Sonner \u539F\u5473\uFF08\u5BF9\u6BD4\u7528\uFF09\u3001showHostToast \u662F\u5B98\u65B9 Toast\u3001notify \u662F\u9879\u76EE\u5185\u63A8\u8350\uFF08\u7EDF\u4E00\u5361\u7247 + \u6211\u4EEC\u81EA\u5DF1\u7684\u6309\u94AE\uFF09\u3002',
    apiTitle: "\u6807\u9898\uFF1A\u5B57\u7B26\u4E32\u6216 ReactNode\uFF08\u81EA\u5B9A\u4E49\u6392\u6CD5\u65F6\u4F20\u8282\u70B9\uFF09",
    apiMessage: "\u6B63\u6587\u8BF4\u660E\u6587\u5B57",
    apiSeverity: "\u8BED\u4E49\u6863\uFF1A'info' | 'success' | 'warning' | 'error'",
    apiConfirmText: "\u786E\u8BA4\u6309\u94AE\u6587\u6848",
    apiCancelText: "\u53D6\u6D88\u6309\u94AE\u6587\u6848",
    apiOnConfirm: "\u786E\u8BA4\u56DE\u8C03\uFF08\u547D\u4EE4\u5F0F\u4E3A Promise resolve(true)\uFF09",
    apiOnCancel: "\u53D6\u6D88\u56DE\u8C03\uFF08\u547D\u4EE4\u5F0F\u4E3A Promise resolve(false)\uFF09",
    apiHeaderActions: "\u53F3\u4E0A\u89D2\u64CD\u4F5C\u533A",
    apiFooter: "\u5E95\u90E8\u6309\u94AE\u533A\uFF1B\u4E0D\u4F20\u5219\u6CA1\u6709 footer",
    apiDescription: "\u6807\u9898\u4E0B\u65B9\u7684\u6B21\u8981\u8BF4\u660E",
    apiActions: "\u53F3\u4FA7\u52A8\u4F5C\u6309\u94AE\uFF081\u20132 \u4E2A\uFF0C\u7528\u6211\u4EEC\u81EA\u5DF1\u7684 Button \u6837\u5F0F\uFF09",
    apiPosition: "\u51FA\u73B0\u4F4D\u7F6E\uFF1A'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'",
    apiOnDismiss: "\u63D0\u793A\u6D88\u5931\uFF08\u81EA\u52A8\u6216\u624B\u52A8\u5173\u95ED\uFF09\u540E\u89E6\u53D1",
    apiDurationMs: "\u505C\u7559\u65F6\u957F\uFF08\u6BEB\u79D2\uFF09\uFF0C\u9ED8\u8BA4 2600",
    layoutNote: "PanelDock \u662F**\u5E03\u5C40\u6210\u5458\uFF0C\u4E0D\u662F\u6D6E\u5C42**\uFF1A\u5B83\u5360\u5BBD\u5EA6\u3001\u628A\u4E3B\u533A\u6324\u7A84\uFF0C\u56E0\u6B64\u5FC5\u987B\u7531\u8C03\u7528\u65B9\u653E\u8FDB\u81EA\u5DF1\u7684 flex \u6839\u5BB9\u5668\u91CC\uFF08\u81EA\u6302 document.body \u53EA\u80FD\u906E\u76D6\u3001\u6324\u4E0D\u7A84\uFF09\u3002\u5206\u5DE5\uFF1A\u7ED3\u6784\u5199\u5728\u8C03\u7528\u70B9\uFF08PanelDock \u7684 children \u91CC\u653E DockPanel\uFF09\u3001\u663E\u9690\u5F52\u72B6\u6001\uFF08dock.open(id) \u53EA\u4F20 id \u4E0D\u4F20\u5185\u5BB9\uFF09\u3001\u5934\u90E8\u53EF\u63A7\uFF08title / icon / extra \u4E09\u4EF6\u5957\uFF0C\u6216 header \u6574\u5757\u66FF\u6362\uFF09\u3002\u672C\u9875\u53F3\u4FA7\u90A3\u4E00\u4EFD\u5C31\u662F\u771F\u7684\uFF0C\u70B9\u4E0A\u9762\u7684\u6309\u94AE\u8BD5\u3002",
    apiPanelId: "\u7EC4\u540D\uFF08\u5BFB\u5740\u952E\uFF09\uFF1B\u540C\u540D\u552F\u4E00",
    apiPanelTitle: "\u6807\u9898\uFF1Bheader \u4F20\u4E86\u975E undefined \u7684\u503C\u65F6\u5B83\u53EA\u7528\u4E8E\u65E0\u969C\u788D\u540D",
    apiPanelIcon: "\u6807\u9898\u524D\u7684\u56FE\u6807\u4F4D\uFF08\u53EF\u591A\u4E2A\uFF09",
    apiPanelExtra: "\u6807\u9898\u53F3\u4FA7\u7684\u4EFB\u610F\u5185\u5BB9\uFF08\u6309\u94AE\u3001\u6807\u7B7E\u3001\u4E0B\u62C9\u90FD\u884C\uFF09",
    apiPanelHeader: "\u6574\u5757\u66FF\u6362\u5934\u90E8\uFF1A\u4E0D\u4F20 = \u5185\u7F6E\u5934\uFF1Bnull = \u4E0D\u8981\u5934\u90E8\uFF1B\u5176\u4ED6 = \u4F60\u7684\u5934\u90E8\uFF08\u5E93\u4E0D\u52A0\u5185\u8FB9\u8DDD/\u8FB9\u6846/\u80CC\u666F\uFF09",
    apiPanelClosable: "\u662F\u5426\u663E\u793A\u5173\u95ED\u94AE",
    apiPanelCloseButton: "\u5173\u95ED\u94AE\u4F4D\u7F6E\uFF1A'auto' | 'header' | 'floating' | 'none'",
    apiPanelWidth: "\u9996\u6B21\u6253\u5F00\u65F6\u7684\u5BBD\u5EA6\uFF08px\uFF09",
    apiPanelMinWidth: "\u53EF\u62D6\u52A8\u7684\u5BBD\u5EA6\u4E0B\u9650",
    apiPanelMaxWidth: "\u53EF\u62D6\u52A8\u7684\u5BBD\u5EA6\u4E0A\u9650\uFF1B\u4E0D\u4F20 = \u53EA\u53D7\u89C6\u53E3\u4E0E\u4E3B\u533A\u4FDD\u5E95\u7EA6\u675F",
    apiMaxPanels: "\u540C\u65F6\u5B58\u5728\u7684\u680F\u6570\u4E0A\u9650",
    apiDefaultWidth: "\u65B0\u680F\u9ED8\u8BA4\u5BBD\u5EA6",
    apiStorageKey: "\u5BBD\u5EA6\u8BB0\u5FC6\u524D\u7F00\uFF1B\u4F20 false \u5173\u95ED\u8BB0\u5FC6",
    apiOnOpen: "\u65B0\u5F00\u4E00\u680F\u540E\u89E6\u53D1\uFF08\u91CD\u590D\u6253\u5F00\u5DF2\u5B58\u5728\u7684\u4E0D\u89E6\u53D1\uFF09",
    apiOnBeforeClose: "\u5173\u95ED\u4E4B\u524D\u89E6\u53D1\uFF1B\u8FD4\u56DE false \u53EF\u53D6\u6D88\uFF08\u672A\u4FDD\u5B58\u5185\u5BB9\u62E6\u622A\u5C31\u9760\u5B83\uFF09",
    apiOnClose: "\u5DF2\u7ECF\u5173\u6389\u4E4B\u540E\u89E6\u53D1",
    apiOnResize: "\u62D6\u5BBD\u677E\u624B\u540E\u89E6\u53D1",
    apiOnLimitReached: "\u5230\u4E0A\u9650\u88AB\u62D2\u65F6\u89E6\u53D1\uFF08\u5E93\u4E0D\u5F39\u63D0\u793A\u3001\u4E0D\u629B\u5F02\u5E38\uFF09",
    blocksNote: "\u5DE5\u4F5C\u533A\u6D4F\u89C8\u4E24\u5757\u6F14\u793A\uFF1A\u2460 Explorer\u2014\u2014\u53F3\u4FA7\u505C\u9760\u9884\u89C8\uFF08openFilePreview\uFF0C\u5360\u5BBD\u5EA6\u3001\u628A\u4E3B\u533A\u6324\u7A84\uFF09\u4E0E\u951A\u5B9A\u5F39\u7A97\u9009\u6587\u4EF6\uFF08pickWorkspaceFile\uFF0CPromise \u8FD4\u56DE\u5DE5\u4F5C\u533A\u76F8\u5BF9\u8DEF\u5F84\uFF09\u3002\u2461 Session\u2014\u2014\u4F1A\u8BDD\u9884\u89C8\uFF08SessionPreview\uFF0Cvariant modal/inline\uFF09\u3002\u672C\u9875\u4E0D\u7528\u4EFB\u4F55 mock\uFF1A\u6837\u4F8B\u6587\u4EF6\u662F\u4ED3\u5E93\u771F\u6587\u4EF6\uFF0C\u53D6\u6570\u8D70\u5BBF\u4E3B workspaceFiles\uFF0C\u63A2\u4E0D\u5230\u5C31\u5982\u5B9E\u8BF4\u300C\u6CA1\u627E\u5230\u300D\u3002",
    apiExplorerMount: "\u5206\u680F\u6302\u8F7D\u70B9\uFF1A\u6574\u9875 flex \u884C\uFF0Cdock \u6210\u4E3A\u5B83\u7684\u6700\u540E\u4E00\u4E2A\u5B50\u9879\uFF08\u4E3B\u533A\u88AB\u771F\u6B63\u6324\u7A84\uFF09\u3002\u81EA\u6302 body \u53EA\u80FD\u906E\u76D6\u3001\u6324\u4E0D\u7A84",
    apiExplorerFiles: "\u5BBF\u4E3B\u4F1A\u8BDD\u4F5C\u7528\u57DF\u7684\u5DE5\u4F5C\u533A\u6587\u4EF6\u670D\u52A1\uFF08WorkspaceFilesFace\uFF09",
    apiExplorerSession: "\u4F1A\u8BDD id\uFF1BworkspaceFiles \u662F\u4F1A\u8BDD\u4F5C\u7528\u57DF\uFF0C\u5FC5\u987B\u5148\u843D\u5230\u4E00\u4E2A\u771F\u4F1A\u8BDD",
    apiExplorerPath: "\u8981\u9884\u89C8\u7684\u6587\u4EF6\u8DEF\u5F84\uFF08\u5DE5\u4F5C\u533A\u76F8\u5BF9\uFF09\uFF1B\u7A7A\u4E32 = \u6253\u5F00\u6839\u76EE\u5F55",
    apiExplorerRoot: "\u6839\u76EE\u5F55\u663E\u793A\u540D\uFF08\u951A\u70B9/\u9009\u5C42\u4E0B\u62C9\u7528\uFF09",
    apiExplorerWorkspaces: "\u5DE5\u4F5C\u533A\u6E05\u5355\uFF08\u6807\u9898\u6570\u7EC4\uFF09\uFF0C\u7528\u4E8E\u9009\u5C42\u4E0B\u62C9",
    apiExplorerOnSelect: "\u5728\u9009\u5C42\u4E0B\u62C9\u91CC\u6362\u5DE5\u4F5C\u533A\u65F6\u89E6\u53D1\uFF0C\u56DE\u8C03\u91CC\u518D open \u4E00\u6B21\u5373\u53EF\u6362\u4F1A\u8BDD\u91CD\u5F00",
    apiPickAnchor: "\u89E6\u53D1\u5143\u7D20\uFF08HTMLElement\uFF09\uFF0C\u5F39\u7A97\u636E\u6B64\u5B9A\u4F4D\uFF1B\u4E0D\u81EA\u5DF1\u6302 dock",
    apiPickFilter: "\u8FC7\u6EE4\u6761\u4EF6\uFF08exts \u6269\u5C55\u540D\u767D\u540D\u5355 / dirs \u662F\u5426\u542B\u76EE\u5F55\uFF09",
    apiSessionId: "\u4F1A\u8BDD id",
    apiSessionSource: "\u4F1A\u8BDD\u6570\u636E\u6E90\uFF08SessionSource\uFF09\uFF1B\u771F\u5B9E\u8D70\u5BBF\u4E3B\uFF0Cdemo \u7528 mock",
    apiSessionVariant: "\u6E32\u67D3\u5F62\u6001\uFF1A'modal'\uFF08\u5F39\u7A97\uFF09\uFF5C'inline'\uFF08\u5185\u8054\u5757\uFF09",
    apiSessionTitle: "\u5F39\u7A97\u6807\u9898\uFF08variant=modal \u65F6\uFF09",
    apiSessionCallbacks: "onClose\uFF1A\u5173\u95ED\uFF1BonOpenFile\uFF1A\u70B9\u5F00\u6587\u4EF6\u65F6\u89E6\u53D1",
    utilsNote: "utils \u7EC4\u662F\u7EAF\u51FD\u6570\u5DE5\u5177\uFF1A\u65E5\u671F\u65F6\u95F4\u683C\u5F0F\u5316\u3001\u6570\u5B57/\u4F53\u79EF\u683C\u5F0F\u5316\u3001\u591A\u8BED\u8A00\u3002\u5168\u90E8\u8D70\u5F53\u524D locale\uFF08\u7531\u5BBF\u4E3B\u9A71\u52A8\uFF0C\u5207\u5BBF\u4E3B\u8BED\u8A00\u5373\u53D8\uFF09\u3002",
    apiDateDateTime: "ISO \u5B57\u7B26\u4E32 \u2192 \u672C\u5730\u65E5\u671F\u65F6\u95F4\uFF1Bopts.seconds \u63A7\u5236\u662F\u5426\u5E26\u79D2",
    apiDateYmd: "ISO \u2192 \u5E74\u6708\u65E5",
    apiDateClock: "ISO \u2192 \u65F6\u5206\u79D2",
    apiDateDuration: "\u6BEB\u79D2 \u2192 \u65F6:\u5206:\u79D2",
    apiDateRange: "\u4E24\u4E2A ISO \u2192 \u533A\u95F4\u6587\u672C\uFF08\u8D77 \u2013 \u6B62\uFF09",
    apiDatePast: "(iso, now) \u2192 \u300CN \u5206\u949F/\u5C0F\u65F6/\u5929\u524D\u300D",
    apiDateFuture: "(iso, now) \u2192 \u300CN \u5206\u949F/\u5C0F\u65F6\u540E\u300D",
    apiNumberBytes: "(bytes) \u2192 \u4EBA\u7C7B\u53EF\u8BFB\u4F53\u79EF\uFF08B / KB / MB / GB \u2026\uFF09",
    apiI18nGet: "() => \u5F53\u524D locale \u5B57\u7B26\u4E32\uFF08\u7531\u5BBF\u4E3B\u9A71\u52A8\uFF09",
    apiI18nSet: "(locale) => void\uFF1A\u5207\u8BED\u8A00\uFF08\u5BBF\u4E3B\u8986\u76D6\u65F6\u4EE5\u6B64\u4E3A\u51C6\uFF09",
    apiI18nT: "(key) => \u5F53\u524D\u8BED\u8A00\u7684\u6587\u6848",
    startNote: "\u5FEB\u901F\u5F00\u59CB\uFF1A\u539F\u300C\u6982\u89C8 / \u5B89\u88C5\u4E0E\u521D\u59CB\u5316 / \u5199\u4E00\u4E2A\u63D2\u4EF6\u300D\u4E09\u6761\u5E76\u6210\u4E00\u9875\uFF0C\u6BCF\u5757\u4ECD\u662F\u72EC\u7ACB\u5361\u7247\u3002\u5148\u770B\u4E00\u773C\u80FD\u4ECE\u672C\u5305\u62FF\u5230\u4EC0\u4E48\uFF0C\u518D\u7167\u5B89\u88C5\u4E0E\u6837\u5F0F\u6CE8\u5165\u4E24\u6BB5\u628A\u73AF\u5883\u642D\u8D77\u6765\u3002",
    foundationNote: "\u8BBE\u8BA1\u57FA\u7840\uFF1AToken \u8272\u677F\uFF08\u5168\u90E8\u6D88\u8D39 --dshpc-* \u53D8\u91CF\uFF0C\u660E\u6697\u4EA4\u7ED9 token\uFF09\u3001\u6697\u8272\u4E3B\u9898\u5224\u636E\uFF08\u6E32\u67D3\u65F6\u8BFB body[data-ds-dark-theme]\uFF09\u3001\u6837\u5F0F\u6CE8\u5165\uFF08createStyleKit + setStyleKit\uFF0C\u6BCF\u4E2A\u63D2\u4EF6\u7528\u56FA\u5B9A id\uFF09\u3001\u547D\u540D\u5951\u7EA6\uFF08dshpc- \u524D\u7F00\uFF09\u3002",
    referenceNote: "\u53C2\u8003\u4E0E\u7EA6\u5B9A\uFF1A\u65E0\u969C\u788D\u8981\u70B9\u3001\u660E\u786E\u4E0D\u505A\u7684\u90E8\u5206\uFF08\u4E0E docs/design/features.md \u540C\u6E90\uFF09\u3001\u7248\u672C\u4E0E\u6784\u5EFA\u4EA7\u7269\u4FE1\u606F\u3002",
    btnLabelSave: "\u4FDD\u5B58\u4FEE\u6539",
    btnLabelCancel: "\u53D6\u6D88",
    btnLabelDelete: "\u5220\u9664",
    btnLabelMixed: "\u4FDD\u5B58 Save",
    btnIconOnly: "icon only",
    btnHintTitle: "\u95EE\u53F7\u63D0\u793A\uFF08FieldHint\uFF09",
    btnHintHint: "\u72EC\u7ACB\u7EC4\u4EF6\uFF0C\u653E\u54EA\u90FD\u884C\uFF1A\u6807\u9898\u540E / \u6309\u94AE\u540E / \u4E00\u6BB5\u6587\u5B57\u540E / \u8F93\u5165\u6846\u540E\uFF1B\u9F20\u6807\u60AC\u505C\u6216\u952E\u76D8\u805A\u7126\u6D6E\u51FA\u6C14\u6CE1",
    demoInputFamily: "Input \u5BB6\u65CF",
    inputHint: "Input / PrefixedInput / NumberInput / Textarea\uFF0C\u90FD\u652F\u6301 error \u63CF\u7EA2\uFF1B\u4F20 hint \u53C2\u6570\u5373\u81EA\u52A8\u5728\u884C\u5C3E\u6302\u6807\u51C6\u95EE\u53F7\u63D0\u793A\uFF08FieldHint \u672C\u4F53\u4ECD\u53EF\u5355\u72EC\u7528\uFF09",
    fieldHintDate: "\u4EFB\u52A1\u81EA\u8BE5\u65E5\u8D77\u5F00\u59CB\u6267\u884C\u3002\u53EF\u63D0\u524D\u521B\u5EFA\u4EFB\u52A1\uFF0C\u81F3\u8BE5\u65E5\u81EA\u52A8\u5F00\u8DD1\uFF1B\u300C\u6BCF N \u5468\u300D\u4EA6\u81EA\u8BE5\u65E5\u8D77\u7B97\u9996\u5468\u3002",
    switchTip: "\u5B98\u65B9 Switch\uFF08\u542F\u7528\u8BED\u4E49\uFF0C\u4E0D\u662F\u52FE\u9009\uFF09+ Checkbox + Segmented",
    checkboxHint: "\u5916\u89C2\u5BF9\u9F50\u771F\u5B9E\u63D2\u4EF6\uFF1A\u7070\u5E95 inset\uFF08\u65E0\u5916\u63CF\u8FB9\uFF09\uFF1B\u5E26\u63CF\u8FB9\u7684 default \u4EC5\u4F9B\u7279\u6B8A\u573A\u5408\uFF08\u6700\u53F3\uFF0C\u53EF\u70B9\u7740\u73A9\uFF09\uFF1B\u661F\u671F\u65B9\u5757\u662F\u591A\u9009\u3002\u6587\u6848\u968F\u8BED\u8A00\u5207\u6362",
    pickerHint: '\u5355\u9009 / \u591A\u9009 / \u4E0A\u9650 / \u641C\u7D22\uFF08searchable \u5F00\u5173\uFF09/ \u5206\u7EC4 / \u7A7A\u6001 / \u964D\u7EA7\uFF1B\u89E6\u53D1\u5668\u4E0E\u9009\u9879\u90FD\u652F\u6301\u524D\u7F6E icon\uFF1B\u6587\u5B57\u9ED8\u8BA4\u5C45\u5DE6\uFF08align="center" \u624D\u5C45\u4E2D\uFF09\uFF1B\u591A\u9009\u5230\u4E0A\u9650\u540E\u5DF2\u9009\u9879\u4ECD\u53EF\u70B9\u9009\u53D6\u6D88',
    modelPickerHint: "grouped \u5206\u7EC4\uFF08\u4E00\u4E2A\u4E0B\u62C9\u3001\u5382\u5546\u505A\u7EC4\u5934\u3001\u5B8C\u5168\u72EC\u7ACB\uFF09/ cascade \u8054\u52A8\uFF08\u4F9B\u5E94\u5546\u3001\u6A21\u578B\u4E24\u4E2A\u4E0B\u62C9\u8054\u52A8\uFF09\u2014\u2014\u4E24\u79CD\u5F62\u6001 onChange \u90FD\u53D1\u6700\u7EC8\u6A21\u578B value\uFF1B\u300C\u9ED8\u8BA4\u6A21\u578B\u300D\u9009\u9879\u9ED8\u8BA4\u63D0\u4F9B\uFF08\u9009\u4E2D\u53D1\u7A7A\u4E32\uFF0C\u5173\u95ED\u4F20 allowDefault: false\uFF09\uFF1B\u76EE\u5F55\u81EA\u52A8\u6765\u81EA\u5BBF\u4E3B",
    workspacePickerHint: "\u5DE5\u4F5C\u533A\u5217\u8868\u81EA\u52A8\u6765\u81EA\u5BBF\u4E3B\u5FEB\u7167\uFF08connectHost \u63A5\u7EBF\uFF0Cfollow \u6D41\u5B9E\u65F6\u66F4\u65B0\uFF09\uFF0C\u9009\u4E2D\u503C\u4E3A workspaceId",
    tooltipTitle: "Tooltip\uFF08\u9F20\u6807\u60AC\u505C\u63D0\u793A\uFF09",
    tooltipHint: "\u5B98\u65B9 Tooltip\uFF1Aside \u4E0A / \u4E0B / \u53F3 \xD7 align \u5C45\u4E2D / \u8D34\u8FB9\uFF1B\u951A\u70B9\u53EF\u4EE5\u662F\u6309\u94AE\u6216\u4E00\u6BB5\u6587\u5B57\uFF1B\u957F\u6587\u672C\u6309 maxWidth \u81EA\u52A8\u6298\u884C\uFF1B\u6700\u53F3\u4E00\u9897\u662F\u300C\u540D\u5B57 + \u6B63\u6587\u300D\u4E24\u6BB5\u5F0F\u2014\u2014\u6587\u672C\u91CC\u7684 \\n \u5C31\u662F\u771F\u5B9E\u6362\u884C",
    tooltipAnchorText: "\u6587\u5B57\u951A\u70B9",
    tooltipAnchorButton: "\u6309\u94AE\u951A\u70B9",
    tooltipLong: "\u957F\u6587\u672C\u6362\u884C",
    tooltipName: "\u5F20\u4E09\u4E30",
    tooltipRich: "\u5BCC\u5361\u7247",
    tooltipMultiline: "\u4E24\u6BB5\u5F0F",
    tooltipLongText: "\u8FD9\u662F\u4E00\u6BB5\u8DB3\u591F\u957F\u7684\u63D0\u793A\u6587\u5B57\uFF1A\u6C14\u6CE1\u9047\u5230 maxWidth \u4F1A\u81EA\u52A8\u6362\u884C\uFF0C\u800C\u4E0D\u4F1A\u4E00\u8DEF\u6491\u5230\u534A\u4E2A\u5C4F\u5E55\u5BBD\uFF0C anchored \u5143\u7D20\u5728\u8FB9\u7F18\u65F6\u5B98\u65B9\u8FD8\u4F1A\u81EA\u52A8\u628A\u6C14\u6CE1\u6536\u56DE\u89C6\u53E3\u5185\u3002",
    demoCardTitle: "Card\uFF08\u8FB9\u6846 + \u5706\u89D2 + \u77ED\u8272\u6761\uFF09",
    demoStripTitle: "StripCard\uFF08\u6D45\u5E95 + \u901A\u9AD8\u8272\u6761\uFF09",
    cardHint: "surface \u5E95 + 1px \u8FB9\u6846 + \u5706\u89D2 + \u884C\u5185 6px \u5706\u89D2\u77ED\u6761\uFF08\u9AD8\u5EA6\u968F\u5185\u5BB9\uFF09\uFF1B\u5934\u90E8\u6574\u4F53\u5782\u76F4\u5C45\u4E2D\u2014\u2014action \u91CC\u88F8\u653E\u4E00\u4E2A\u5143\u7D20\u5373\u5C45\u4E2D\uFF0C\u60AC\u505C\u6D6E\u51FA\u7684\u6309\u94AE\u3001\u4E00\u884C\u4E24\u884C\u90FD\u7531\u8C03\u7528\u65B9\u5728\u6846\u5185\u81EA\u5B9A\uFF1B\u771F\u5B9E\u63D2\u4EF6\u5F62\u6001\uFF1A\u6807\u9898\u884C + \u53F3\u4FA7\u5143\u4FE1\u606F + chips \u884C\uFF1Baccent \u4E94\u6863\u89C1\u4E0B\u65B9\u901F\u89C8",
    stripHint: "\u540C\u8272\u7CFB\u6D45\u5E95 + \u5DE6\u7F18 4px \u901A\u9AD8\u65B9\u89D2\u8272\u6761\uFF08\u7167\u5144\u5F1F\u9879\u76EE\u6267\u884C\u8BB0\u5F55\u5757\uFF09\uFF1B\u540C\u6837\u6574\u4F53\u5782\u76F4\u5C45\u4E2D\u2014\u2014\u6D41\u6C34\u8D26\u6392\u7248\uFF1A\u6807\u9898 + \u5143\u4FE1\u606F\u884C + \u53F3\u4FA7\u65F6\u95F4/\u64CD\u4F5C",
    sectionHeadTitle: "SectionHead \u5206\u533A\u6807\u9898",
    chipHint: "chip \u4E24\u8F74\u53EF\u9009\uFF1Atone \u8BED\u4E49\u8272\uFF08neutral \u7070\u9762 / business / success / warning / danger \u5B9E\u5FC3\u4FE1\u53F7\u9762\uFF09\u3001size\uFF08sm / md\uFF09\uFF1B\u5BBD\u5EA6\u6309\u6587\u5B57\u6491\u5F00\u3001\u4E0D\u6362\u884C\uFF1B\u6587\u6848\u968F\u8BED\u8A00\u5207\u6362\uFF08\u4E2D\u82F1\u793A\u4F8B\uFF09\uFF1B\u6700\u540E\u4E00\u9897\u957F\u6587\u5B57\u82E5\u88AB\u538B\u6210 28px \u7AD6\u6392\u5C31\u662F\u53C8\u6DF7\u8FDB\u4E86\u56FE\u6807\u6309\u94AE\u7684\u5B9A\u5BBD\u89C4\u5219",
    chipOverdue: "\u903E\u671F",
    chipStalled: "\u505C\u6EDE",
    chipDone: "\u5DF2\u5B8C\u6210",
    chipDoing: "\u8FDB\u884C\u4E2D",
    emptyStateTitle: "EmptyState \u7A7A\u6001",
    marqueeTitle: "MarqueeText \u8DD1\u9A6C\u706F",
    liveTitle: "LiveText \u5B9E\u65F6\u6587\u672C",
    feedbackModalHint: "\u81EA\u7ED8 overlay\uFF08\u4E0D\u7528 portal\uFF09\uFF1B\u70B9\u906E\u7F69 / Esc / \u2715 \u90FD\u80FD\u5173\u3002\u6807\u9898\u680F\u7684 \u2715 \u662F 24\xD724 \u56FE\u6807\u4F4D\uFF0C\u4E0D\u8BE5\u51FA\u73B0\u8FB9\u6846\u6216 120px \u5BBD\u7684\u5E95\u8272\u5757",
    feedbackToastHint: "\u547D\u4EE4\u5F0F showToast\uFF0C\u4E0D\u8981\u6C42\u6302\u7EC4\u4EF6",
    explorerDataTitle: "\u6570\u636E\u6765\u6E90\uFF08\u771F\u6570\u636E\uFF0C\u65E0 mock\uFF09",
    explorerDataHint: "\u6587\u4EF6\u670D\u52A1\u53D6\u5BBF\u4E3B\u7684 remote.workspaceFiles\uFF08dotted \u6CE8\u5165\uFF09\uFF0C\u5DE5\u4F5C\u533A\u6E05\u5355\u53D6\u5B98\u65B9 workspaces \u670D\u52A1\u5FEB\u7167\uFF1B\u300C\u6700\u8FD1\u4F1A\u8BDD\u6240\u5C5E\u5DE5\u4F5C\u533A\u300D= \u66F4\u65B0\u8FC7\u7684\u6700\u65B0\u4E14\u5E26\u4F1A\u8BDD\u7684\u90A3\u4E2A\u5DE5\u4F5C\u533A\uFF08pickWorkspaceAnchor\uFF09\u2014\u2014list / read \u90FD\u8981 sessionId\uFF0C\u951A\u70B9\u5FC5\u987B\u5148\u843D\u5230\u4E00\u4E2A\u771F\u4F1A\u8BDD\u4E0A\u3002",
    explorerFilesNone: "\u672A\u5C31\u4F4D\uFF1A\u5BBF\u4E3B\u8FD8\u6CA1\u7ED9\u51FA remote.workspaceFiles\uFF08\u6587\u4EF6\u9884\u89C8 / \u9009\u62E9\u90FD\u4E0D\u53EF\u7528\uFF0C\u4E0D\u9020\u5047\u6570\u636E\uFF09",
    explorerAnchorNone: "\u672A\u5C31\u4F4D\uFF1A\u5DE5\u4F5C\u533A\u6E05\u5355\u91CC\u8FD8\u6CA1\u6709\u5E26\u4F1A\u8BDD\u7684\u5DE5\u4F5C\u533A\uFF08\u5148\u5728\u5BBF\u4E3B\u91CC\u5F00\u4E00\u4E2A\u4F1A\u8BDD\u518D\u56DE\u6765\u770B\uFF09",
    explorerAnchorLabel: "\u5F53\u524D\u951A\u70B9\uFF1A",
    explorerSessionLabel: "\u4F1A\u8BDD\uFF1A",
    explorerWorkspaces: "\u5DE5\u4F5C\u533A\u6570\uFF1A",
    methodATitle: "\u65B9\u6CD5 A\uFF1AopenFilePreview \u4FA7\u8FB9\u680F\u9884\u89C8",
    methodAHint: "\u4F20\u6587\u4EF6\u6216\u6587\u4EF6\u5939\u8DEF\u5F84\uFF0C\u53F3\u4FA7**\u5206\u680F**\u6253\u5F00\uFF08\u6838\u5FC3 PanelDock\uFF0Cheader=null \u90A3\u7248\uFF1A\u6CA1\u6709\u5934\u90E8\u90A3\u6761\u7EBF\uFF0C\u2715 \u6D6E\u5728\u53F3\u4E0A\u89D2\uFF09\u2014\u2014\u5B83\u88AB\u585E\u8FDB\u6574\u9875\u8FD9\u5C42 flex \u884C\uFF0C\u6240\u4EE5\u4E3B\u533A\u88AB\u6324\u7A84\uFF0C\u4E0D\u662F\u76D6\u4E0A\u53BB\u3002\u62D6\u5BBD\u7531 PanelDock \u8D1F\u8D23\uFF0C\u9762\u677F\u81EA\u5DF1\u4E0D\u753B\u5916\u58F3\u3002\u6837\u4F8B\u6309\u94AE\u6307\u5411\u4ED3\u5E93\u91CC packages/demo/src/samples/ \u7684\u771F\u6587\u4EF6\uFF08\u76EE\u5F55\u662F\u6309\u5185\u5BB9\u63A2\u51FA\u6765\u7684\uFF0C\u4E0D\u5199\u6B7B\u8DEF\u5F84\uFF09\u3002",
    openRootPreview: "\u6253\u5F00\u6700\u8FD1\u5DE5\u4F5C\u533A\u7684\u6839\u76EE\u5F55",
    openSamplesDir: "\u6D4F\u89C8\u6837\u4F8B\u76EE\u5F55",
    sampleMd: "\u9884\u89C8 README.md",
    sampleHtml: "\u9884\u89C8 demo.html",
    sampleJs: "\u9884\u89C8 sample.js",
    sampleCss: "\u9884\u89C8 sample.css",
    samplesProbing: "\u6B63\u5728\u771F\u5B9E\u5DE5\u4F5C\u533A\u91CC\u627E\u6837\u4F8B\u76EE\u5F55\u2026",
    samplesNotFound: "\u6CA1\u627E\u5230\u6837\u4F8B\u76EE\u5F55\uFF08\u5F53\u524D\u951A\u5B9A\u7684\u5DE5\u4F5C\u533A\u91CC\u6CA1\u6709 packages/demo/src/samples\uFF09",
    methodBTitle: "\u65B9\u6CD5 B\uFF1ApickWorkspaceFile \u9009\u62E9\u6587\u4EF6",
    methodBHint: "\u5728\u951A\u70B9\u6309\u94AE\u65C1\u5F39\u51FA\u6A21\u6001\u5F39\u7A97\uFF1BPromise \u8FD4\u56DE { path, isDir }\uFF08path \u4E3A\u5DE5\u4F5C\u533A\u76F8\u5BF9\u8DEF\u5F84\uFF09\uFF1BEsc / \u70B9\u5916\u90E8 / \u2715 \u53D6\u6D88\u8FD4\u56DE null",
    pickAny: "\u9009\u62E9\u6587\u4EF6\uFF08\u4E0D\u9650\uFF09",
    pickTs: "\u53EA\u8981 .ts",
    pickDir: "\u53EA\u8981\u6587\u4EF6\u5939",
    pickFolder: "\u6587\u4EF6\u5939",
    pickNone: "\u8FD8\u6CA1\u9009",
    pickResult: "\u5DF2\u9009\u62E9",
    previewBodyTitle: "FilePreview \u9884\u89C8\u4F53\uFF08\u53EF\u5355\u72EC\u7528\uFF09",
    previewBodyHint: "\u4E0A\u9762\u90A3\u5757\u5DF2\u7ECF\u5305\u542B\u5B83\u2014\u2014FileBrowser \u5185\u90E8\u6E32\u67D3\u7684\u5C31\u662F FilePreview\u3002\n\u5B83\u540C\u65F6\u4E5F\u662F\u4E00\u6761\u72EC\u7ACB\u5B50\u8DEF\u5F84 dsh-plugin-core/explorer/preview\uFF1A\u53EA\u6709\u4E00\u4E2A\u6587\u4EF6\u8981\u663E\u793A\u65F6\uFF08\u4F1A\u8BDD\u9644\u4EF6\u3001\u5DE5\u5177\u8F93\u51FA\uFF09\u4E0D\u5FC5\u642C\u51FA\u6574\u4E2A\u9762\u677F\u3002",
    sessionHint: "\u4E09\u79CD\u627F\u8F7D\uFF1Amodal / sidebar / page\uFF1Bsource \u662F mock \u7684\uFF1BrenderMessage \u53EF\u63A5\u7BA1\u5BCC\u5185\u5BB9",
    sessionOpenModal: "\u6253\u5F00\u4F1A\u8BDD\u9884\u89C8\uFF08modal\uFF09",
    sessionClose: "\u5173\u95ED",
    sessionPreviewTitle: "\u4F1A\u8BDD\u9884\u89C8\uFF08\u5047\u6570\u636E\uFF09",
    dateHint: "\u89E3\u6790\u5931\u8D25\u4E0D\u629B\u9519\u3001\u7ED9\u515C\u5E95\u3001\u4E0D\u7F16\u9020\uFF1B\u6240\u6709\u51FD\u6570\u65E0 UI \u4F9D\u8D56\uFF0CNode \u91CC\u4E5F\u80FD\u8DD1",
    numberHint: "formatBytes \u6309 1024 \u8FDB\u5236\u3001\u5355\u4F4D\u81EA\u52A8\u8FDB\u4F4D\uFF1BformatCount \u7ED9\u5927\u6570\u52A0\u5343\u5206\u4F4D",
    roadmapHint: "\u4E0B\u9762\u662F\u300C\u660E\u786E\u4E0D\u63D0\u4F9B\u300D\u7684\u90E8\u5206\u2014\u2014\u5199\u5728\u8FD9\u91CC\u662F\u4E3A\u4E86\u8BA9\u4F60\u4E0D\u7528\u731C\uFF0C\u4E5F\u8BA9\u540E\u6765\u4EBA\u77E5\u9053\u8FB9\u754C\u5728\u54EA\u3002",
    roadmapOut: "\u8BBE\u7F6E\u9875\u9AA8\u67B6\u3001i18n \u6846\u67B6\uFF08\u63D2\u4EF6\u6587\u6848\u63D2\u4EF6\u81EA\u7BA1\uFF09\u3001host \u5BBF\u4E3B\u7C7B\u578B\u9762",
    roadmapMirror: "\u5B98\u65B9\u4F1A\u8BDD UI \u7684\u5B8C\u6574\u955C\u50CF\uFF08\u5DE5\u5177\u5361 / \u4EE3\u7801\u5757 / \u63A8\u7406\u884C\uFF09\u2014\u2014session \u76EE\u524D\u53EA\u6709\u6700\u7B80\u6E32\u67D3\uFF0C\u5BCC\u5185\u5BB9\u8D70 renderMessage \u6269\u5C55\u70B9",
    roadmapPreview: "\uFF08\u5DF2\u843D\u5730\uFF09md \u6E32\u67D3\uFF08\u5B98\u65B9 MarkdownText\uFF09/ \u4EE3\u7801\u9AD8\u4EAE\uFF08\u5B98\u65B9 CodeBlock\uFF09/ HTML / PDF / Office \u9884\u89C8",
    roadmapSkeleton: "\uFF08\u5DF2\u843D\u5730\uFF09PanelDock\u2014\u2014\u53EF\u505C\u9760\u5206\u680F\uFF1A\u591A\u9762\u677F\u3001\u6309\u540D\u8986\u76D6\u3001\u4E0A\u9650 3",
    roadmapLayout: "\u7EA2\u7EBF\uFF1A\u6574\u5408\u4EE5\u524D\u7684.share(plugins/demo)",
    buildDesc: "\u7248\u672C\u53F7\u4E0D bump \u65F6\uFF0C\u5224\u65AD\u5BBF\u4E3B\u91CC\u8DD1\u7684\u662F\u4E0D\u662F\u6700\u65B0\u4EA7\u7269\uFF0C\u9760\u7684\u662F build \u7F16\u7801\u2014\u2014\u6BCF\u6B21\u6784\u5EFA\u90FD\u53D8\u3002",
    buildCore: "core \u7248\u672C",
    buildDemo: "demo \u7248\u672C",
    buildStamp: "\u672C\u6B21 build \u7F16\u7801",
    segDay: "\u65E5",
    segWeek: "\u5468",
    segMonth: "\u6708",
    segAll: "\u5168\u90E8",
    segDoing: "\u8FDB\u884C\u4E2D",
    segClaimed: "\u5F85\u8BA4\u9886",
    segBlocked: "\u963B\u585E",
    segStalled: "\u505C\u6EDE",
    weekday1: "\u4E00",
    weekday2: "\u4E8C",
    weekday3: "\u4E09",
    weekday4: "\u56DB",
    weekday5: "\u4E94",
    weekday6: "\u516D",
    weekday7: "\u65E5",
    // 文档骨架：示例 / 代码 / 用法 / API 表的栏位名与表头
    docNote: "\u5907\u6CE8",
    docPreview: "\u793A\u4F8B",
    docCode: "\u4EE3\u7801",
    docUsage: "\u600E\u4E48\u7528",
    docApi: "API",
    docApiName: "\u5C5E\u6027",
    docApiType: "\u7C7B\u578B",
    docApiDefault: "\u9ED8\u8BA4\u503C",
    docApiDesc: "\u8BF4\u660E",
    docCopy: "\u590D\u5236",
    docCopied: "\u5DF2\u590D\u5236",
    apiVariant: "\u5916\u89C2\u5341\u6863\uFF1Aprimary / secondary / outline / ghost / danger / success / warning / info / danger-outline / link",
    apiSize: "\u5C3A\u5BF8\u4E09\u6863\uFF1Asm 24 / md 28 / lg 32\uFF08\u9AD8\u5EA6\u6863\uFF1B\u6709\u8FB9\u65E0\u8FB9\u540C\u9AD8\uFF09",
    apiIcon: "\u524D\u7F6E\u56FE\u6807\uFF1A\u5B98\u65B9\u56FE\u6807\u7EC4\u4EF6\u3001\u81EA\u7ED8 SVG\u3001\u4E00\u4E2A\u5B57\u7B26\u90FD\u884C\uFF08\u6536\u7684\u662F ReactNode\uFF09",
    apiIconRight: "\u540E\u7F6E\u56FE\u6807\uFF08\u5C55\u5F00\u7BAD\u5934\u3001\u5916\u94FE\u7B49\uFF09",
    apiColor: "\u81EA\u5B9A\u4E49\u4E3B\u8272\uFF1A\u5B9E\u5FC3\u6863\u4F5C\u5E95\u8272\uFF0C\u63CF\u8FB9\u4E0E\u6587\u5B57\u6863\u4F5C\u5B57\u8272\u548C\u63CF\u8FB9\u8272",
    apiLoading: "\u8F6C\u5708\u5E76\u81EA\u52A8\u7981\u7528\u70B9\u51FB",
    apiBlock: "\u6491\u6EE1\u7236\u5BBD\uFF1B\u6709\u524D\u7F6E\u56FE\u6807\u65F6\u6587\u5B57\u4ECD\u5728\u89C6\u89C9\u4E2D\u5FC3",
    apiDisabled: "\u900F\u4F20\u539F\u751F disabled\uFF08\u7981\u7528\uFF09",
    apiChildren: "\u6309\u94AE\u6587\u6848 / \u5185\u5BB9",
    pluginTitle: "\u7EC4\u4EF6\u9884\u89C8",
    pluginCardDesc: "\u6253\u5F00 dsh-plugin-core \u7684\u63A7\u4EF6\u4E0E\u4E1A\u52A1\u7EC4\u4EF6\u5C55\u793A\u9875",
    pluginCardOpen: "\u6253\u5F00 \u203A"
  },
  en: {
    grpStart: "Getting started",
    grpComponents: "Components",
    grpBlocks: "Blocks",
    grpUtils: "Utilities",
    grpReference: "Reference",
    secOverview: "Overview",
    secInstall: "Install & init",
    secQuickstart: "Quick start",
    secFoundation: "Foundations",
    secWritePlugin: "Write a plugin",
    secReference: "Reference",
    secNaming: "Naming & prefix contract",
    secButton: "Button",
    secInput: "Inputs",
    secPicker: "Pickers",
    secTooltip: "Tooltip",
    secCard: "Cards & containers",
    secChip: "Tags \xB7 text \xB7 states",
    secFeedback: "Feedback",
    secLayout: "Layout & scrolling",
    secExplorer: "Workspace browsing",
    secSession: "Session preview",
    secDate: "Date & time",
    secText: "String & path",
    secNumber: "Number & bytes",
    secHttp: "HTTP requests",
    secI18n: "Internationalization",
    secA11y: "Accessibility & keyboard",
    secRoadmap: "Gaps & roadmap",
    secBuild: "Version & build",
    phTodo: "To be added",
    inputMissingDesc: "Not shown on this page yet:\n\xB7 PrefixedInput \u2014 no sample in this demo\n\xB7 Loading / RunningBlocks belong to feedback; they pin to the container\u2019s bottom-right, see the note on the Feedback page",
    pickerLogicDesc: "Not shown on this page yet:\n\xB7 The pure helpers from picker-logic: filterGroups / flattenOptions / groupOf / labelsOf / toGroups / toggleValue\n\u2014 they are the value logic under the pickers, no UI of their own; they need an input \u2192 output cheat sheet to explain",
    overviewDesc: "To be added:\n\xB7 One-line positioning: who it is for, what it solves\n\xB7 What each of the five subpackages answers (design / ui / utils / explorer / session)\n\xB7 A capability map linking straight to the pages below\n\xB7 The boundary: not an i18n framework, not a settings-page skeleton",
    installDesc: "To be added:\n\xB7 How to install (via git \u2014 the host does not run build scripts)\n\xB7 The two mandatory entry lines: setStyleKit + ensureControls\n\xB7 Why @deepseek-ai/* must stay external (otherwise bundling fails)\n\xB7 Registering host slots: sidebar.panellist / main / settings.plugin.item\n\xB7 Checklist when it does not load (start by checking the build stamp)",
    quickstartDesc: "To be added:\n\xB7 Full source of a minimal working plugin\n\xB7 Step-by-step from empty folder to visible panel\n\xB7 This preview plugin is itself the sample \u2014 see packages/demo/src",
    namingDesc: "To be added:\n\xB7 Why variables and class names share the dshpc prefix\n\xB7 Class names must match the hard-coded className character for character \u2014 any drift kills the whole block\n\xB7 How far createStyleKit({ id }) isolates\n\xB7 Injection order: at equal specificity the later one wins\n\xB7 Why the theme switch is body[data-ds-dark-theme] and not prefers-color-scheme",
    dockHint: "Right-side dock: a group name is one window; reopening the same name replaces its content in place (no extra column).\nTry it: open A \u2192 open B \u2192 reopen A (content replaced) \u2192 close A \u2192 open C (the freed slot is usable) \u2192 with 3 columns open, a new group name is rejected.",
    dockMainText: "The dock is a layout member: it squeezes the page content instead of covering it. The three panels demo a built-in header, a custom header, and a header-less panel with a floating close button.",
    dockPanelA: "Built-in header: icon + title + right-side content",
    dockPanelATag: "new",
    dockPanelC: "Header-less panel",
    dockCustomHeadTitle: "Custom header (everything from here down is yours)",
    dockCustomHeadHint: "No padding, no border from the library \u2014 height, rows and popovers are up to you",
    dockPanelBody: "Content of this column. Reopening the same name replaces it; width and position stay put.",
    dockOpened: "Open now: ",
    dockLimitWarn: "All 3 columns are taken \u2014 the new group name was rejected (open returns ok:false / reason:limit)",
    dockBtnOpenA: "Open A",
    dockBtnOpenB: "Open B",
    dockBtnOpenA2: "Reopen A (no duplicate)",
    dockBtnCloseA: "Close A",
    dockBtnDefault: "Open default",
    dockBtnOpenC: "Open C",
    dockBtnReset: "Close all",
    textDesc: "To be added:\n\xB7 What baseNameOf / safeTrim / truncateBytes actually return\n\xB7 crumbsOf / extOf / joinPath / mimeOf / parentOf\n\xB7 Shared rule: never throw on parse failure \u2014 fall back, never fabricate",
    httpDesc: "To be added:\n\xB7 Using request / requestJson\n\xB7 HttpError fields and how to detect failures\n\xB7 Passing timeouts, retries and auth",
    i18nDesc: "To be added:\n\xB7 getLocale / setLocale: a single language state\n\xB7 What ships in the core dictionary: fixed component prompts only, no plugin UI copy\n\xB7 Plugin copy is the plugin\u2019s own job \u2014 this preview plugin\u2019s DICT is the sample\n\xB7 Language is driven by the host; a plugin must not ship its own language picker",
    i18nNow: "Current locale",
    a11yDesc: "To be added:\n\xB7 Focus rings and keyboard reachability\n\xB7 Tab order and the Modal focus trap\n\xB7 Which role / aria-* semantics are covered\n\xB7 Contrast and prefers-reduced-motion handling",
    tokensHint: "All colors come from design tokens; switch light/dark at top-right and these update with it",
    darkHint: "The switch is hard-coded: dark applies only when the host sets data-ds-dark-theme on body \u2014 prefers-color-scheme is not read. A plugin therefore needs no theme toggle of its own. The value below is measured live; toggle the theme and reopen this page to see it change.",
    darkNow: "Current body[data-ds-dark-theme]",
    injectHint: "Call setStyleKit + ensureControls once before controls render; the kit injects tokens and control CSS into <head>",
    demoTokenPalette: "Token palette",
    demoStyleInject: "Style injection",
    designInjectNote: "This preview plugin initializes itself exactly this way \u2014 preview and real plugin take the same path.",
    btnTextTitle: "Button labels & language",
    btnTextHint: "Labels come from the caller: Chinese in zh, English in en; a mixed zh+en label is fine too (rightmost)",
    btnVariantTitle: "Variants (10)",
    btnVariantHint: "Solid: primary / secondary / danger / success / warning / info; outlined: outline / danger-outline; flat: ghost / link",
    btnSizeTitle: "Sizes / icons / block",
    btnSizeHint: "sm 24 \xB7 md 28 \xB7 lg 32, same height; icon takes any ReactNode \u2014 an official icon component, your own SVG, even a single character (not a name, not a class); iconRight trails, block fills the parent",
    btnStateTitle: "States",
    btnStateHint: "disabled is dimmed and unclickable; loading shows a same-color spinner and disables itself",
    btnColorTitle: "Custom colors",
    btnColorHint: "Pass any CSS color as color: solid variants use it as fill, outlined/text variants as the accent; hover/press are mixed from it",
    btnNote: "The official primitives have no danger / lg axis, so Button is drawn in this library; it consumes --dshpc-* tokens only and follows the host light/dark theme.",
    inputNote: "The field family takes its three heights from --dshpc-control-h-*; hint is attached by the component itself (FieldHint), no manual wiring. Enabling is switch semantics: use the official Switch (label is the accessible name only; draw the visible text yourself) \u2014 not a checkbox.",
    apiValue: "Current value (controlled)",
    apiOnChange: "Change callback",
    apiPlaceholder: "Placeholder",
    apiHint: "Attaches a question-mark hint (FieldHint) after the field",
    apiError: "Marks the field red (validation failed)",
    apiMin: "Lower bound; out-of-range values are clamped",
    apiMax: "Upper bound; out-of-range values are clamped",
    apiSuffix: 'Numeric suffix (e.g. "times")',
    apiRows: "Initial rows",
    apiItems: "Segments: { value, label, count?, badge?, disabled? }",
    apiMultiple: "Multi-select: value and onChange are both arrays",
    apiBordered: "Makes the selected segment a bordered block",
    apiLabel: "Accessible group name (not visible)",
    pickerNote: "One Picker covers single, grouped and multiple modes; option icons take ReactNode and hint attaches behind the trigger. ModelPicker / WorkspacePicker are business wrappers of it: their data comes from the host (connectHost), it cannot be fabricated.",
    tooltipNote: "Tooltip is an official primitive: label plus side / align; children must be a real DOM node that can hold a ref (a function component cannot \u2014 no bubble on hover, hit in the sibling repo). HoverCard is a different, richer hover card; its compact variant has a permanently dark background, so the content color must be supplied by the caller.",
    cardNote: "Card and StripCard share one prop set and differ only in appearance: Card is a surface fill with a 1px border and rounded corners; StripCard is a same-family soft fill with square corners and a 4px full-height bar on the left edge \u2014 notes and execution-record rows both use it.",
    chipNote: "Chip is an inline label: five tones and three sizes; pass onClick to render it as a button. Neutral # tags are language-agnostic, and long text keeps its natural width.",
    apiOptions: "Flat options: [{ value, label, icon?, disabled? }]",
    apiGroups: "Grouped options: [{ value, label, options }] (either this or options)",
    apiMode: "'single' | 'multiple'",
    apiSearchable: "Search box inside the trigger",
    apiClearable: "One-click clear once something is selected",
    apiSide: "Bubble side: 'top' | 'bottom' | 'right'",
    apiAlign: "Alignment: 'center' | 'end'",
    apiMaxWidth: "Max bubble width (pixels)",
    apiDelayMs: "Hover delay before the bubble shows (ms)",
    apiPortal: "Mount on document.body to escape ancestor overflow clipping",
    apiAnchor: "Anchor child: must be a real DOM node that can hold a ref",
    apiAccent: "Bar tier business / success / warning / danger / neutral, or any CSS color",
    apiExpanded: "Expanded state: drives the caret direction and panel visibility",
    apiOnToggle: "The caret only shows when this is passed; the caller owns the state",
    apiAction: "Top-right action area (a button or text is fine; auto-vertically centered)",
    apiPanel: "Expanded content (shown when expanded is true)",
    apiTone: "Semantic tier: neutral / business / success / warning / danger",
    apiToneModal: "Semantic tier: 'primary' | 'danger' | 'warning' (confirm dialog only; different from Chip's five-tier tone)",
    apiOnClick: "Renders as a button only when passed",
    apiText: "Text",
    apiRender: "Ticker render function: takes the current timestamp in ms, returns any ReactNode",
    feedbackNote: 'Modals come in three layers \u2014 pick by need: the host official Modal (mask/header/close button all belong to the host; command-style adds skin:"host") \u2192 our standard small boxes AlertModal / ConfirmModal (one/two buttons; the Modal suffix keeps them from shadowing the host native) \u2192 our content Modal (size md/lg, holds any content). Command-style APIs all return a Promise (await confirmModal(...) gives true/false), never callbacks. Three toasts: showToast is Sonner as-is (for comparison), showHostToast is the official Toast, notify is the in-project recommendation (unified card + our own buttons).',
    apiTitle: "Title: a string or a ReactNode (pass a node for a custom layout)",
    apiMessage: "Body text",
    apiSeverity: "Semantic tier: 'info' | 'success' | 'warning' | 'error'",
    apiConfirmText: "Confirm button label",
    apiCancelText: "Cancel button label",
    apiOnConfirm: "Confirm callback (command-style: Promise resolve(true))",
    apiOnCancel: "Cancel callback (command-style: Promise resolve(false))",
    apiHeaderActions: "Top-right action area",
    apiFooter: "Bottom button area; omit it for no footer",
    apiDescription: "Secondary text under the title",
    apiActions: "Trailing action buttons (1\u20132, in our own Button style)",
    apiPosition: "Position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'",
    apiOnDismiss: "Fires after the toast disappears (auto or manual close)",
    apiDurationMs: "Dwell time in ms, default 2600",
    layoutNote: "PanelDock is a LAYOUT MEMBER, not an overlay: it takes width and squeezes the main area, so the caller must place it inside their own flex root (self-mounting on document.body can only cover, never squeeze). The split: structure lives at the call site (DockPanel inside PanelDock children), visibility belongs to state (dock.open(id) takes an id only, never content), and the header is controllable (title / icon / extra, or replace it wholesale with header). The one on the right of this page is real \u2014 press the buttons above to try it.",
    apiPanelId: "Group name (addressing key); unique per dock",
    apiPanelTitle: "Title; only the accessible name once header is passed a non-undefined value",
    apiPanelIcon: "Icon slot before the title (can be several)",
    apiPanelExtra: "Anything on the right of the title (button, tag, dropdown, \u2026)",
    apiPanelHeader: "Replace the header wholesale: omit = built-in header; null = no header; anything else = your header (the library adds no padding/border/background)",
    apiPanelClosable: "Whether the close button shows",
    apiPanelCloseButton: "Close button position: 'auto' | 'header' | 'floating' | 'none'",
    apiPanelWidth: "Width on first open (px)",
    apiPanelMinWidth: "Lower drag bound",
    apiPanelMaxWidth: "Upper drag bound; omit = bounded only by the viewport and the main-area floor",
    apiMaxPanels: "Max simultaneously open panels",
    apiDefaultWidth: "Default width for new panels",
    apiStorageKey: "Width-memory prefix; pass false to disable memory",
    apiOnOpen: "Fires after a new panel opens (re-opening an existing one does not)",
    apiOnBeforeClose: "Fires before closing; return false to cancel (how you intercept unsaved content)",
    apiOnClose: "Fires after the panel is gone",
    apiOnResize: "Fires when the drag is released",
    apiOnLimitReached: "Fires when the cap rejects an open (the library shows no toast and throws nothing)",
    blocksNote: 'Two workspace-browsing demos: \u2460 Explorer \u2014 right-dock preview (openFilePreview, takes width and squeezes the main area) and anchor-popover file picking (pickWorkspaceFile, Promise returns the workspace-relative path). \u2461 Session \u2014 session preview (SessionPreview, variant modal/inline). This page uses no mock: sample files are real repo files, data comes from the host workspaceFiles, and if probing fails it says "not found" honestly.',
    apiExplorerMount: "Dock mount point: the whole-page flex row; the dock becomes its last child (the main area is genuinely squeezed). Self-mounting on body can only cover, never squeeze",
    apiExplorerFiles: "Host session-scoped workspace file service (WorkspaceFilesFace)",
    apiExplorerSession: "Session id; workspaceFiles is session-scoped, so it must land on a real session first",
    apiExplorerPath: "Path to preview (workspace-relative); empty string = open the root dir",
    apiExplorerRoot: "Root dir display name (used by the anchor / layer picker)",
    apiExplorerWorkspaces: "Workspace list (titles array), for the layer picker",
    apiExplorerOnSelect: "Fires when switching workspace in the layer picker; open once more inside to re-open on the new session",
    apiPickAnchor: "Trigger element (HTMLElement); the popover positions from it; does not mount its own dock",
    apiPickFilter: "Filter (exts allow-list / dirs whether to include directories)",
    apiSessionId: "Session id",
    apiSessionSource: "Session data source (SessionSource); real builds use the host, the demo uses a mock",
    apiSessionVariant: "Render form: 'modal' (dialog) | 'inline' (in-page block)",
    apiSessionTitle: "Dialog title (when variant=modal)",
    apiSessionCallbacks: "onClose: closes; onOpenFile: fires when a file is opened",
    utilsNote: "The utils group is pure-function tooling: date/time formatting, number/byte formatting, and i18n. All honor the current locale (driven by the host; switch host language and it changes).",
    apiDateDateTime: "ISO string \u2192 local date-time; opts.seconds controls whether seconds show",
    apiDateYmd: "ISO \u2192 year-month-day",
    apiDateClock: "ISO \u2192 hours:minutes:seconds",
    apiDateDuration: "milliseconds \u2192 hours:minutes:seconds",
    apiDateRange: "two ISO \u2192 range text (start \u2013 end)",
    apiDatePast: '(iso, now) \u2192 "N minutes/hours/days ago"',
    apiDateFuture: '(iso, now) \u2192 "in N minutes/hours/days"',
    apiNumberBytes: "(bytes) \u2192 human-readable size (B / KB / MB / GB \u2026)",
    apiI18nGet: "() => current locale string (driven by the host)",
    apiI18nSet: "(locale) => void: switch language (the host override wins)",
    apiI18nT: "(key) => the current-locale copy",
    startNote: "Quick start: the original three (overview / install & init / write a plugin) are merged into one page, each still an independent card. First see what this package gives you, then set up the environment with the install and style-injection snippets.",
    foundationNote: "Design foundations: the Token palette (all consume --dshpc-* variables; light/dark is the token\u2019s job), the dark-theme predicate (read body[data-ds-dark-theme] at render time), style injection (createStyleKit + setStyleKit, each plugin uses a fixed id), and the naming contract (dshpc- prefix).",
    referenceNote: "Reference & conventions: accessibility notes, what is explicitly out of scope (same source as docs/design/features.md), and version/build artifact info.",
    btnLabelSave: "Save changes",
    btnLabelCancel: "Cancel",
    btnLabelDelete: "Delete",
    btnLabelMixed: "Save \u4FDD\u5B58",
    btnIconOnly: "icon only",
    btnHintTitle: "Question-mark hint (FieldHint)",
    btnHintHint: "Standalone component, drop it anywhere: after a title, a button, a sentence, or an input; hover or keyboard-focus to reveal",
    demoInputFamily: "Input family",
    inputHint: "Input / PrefixedInput / NumberInput / Textarea, all support error highlighting; pass a hint string and the standard FieldHint is attached automatically (FieldHint still works standalone)",
    fieldHintDate: 'The task runs starting from this date. You can create it ahead of time and it auto-starts on that day; "every N weeks" also counts its first week from this date.',
    switchTip: "Official Switch (enable semantics, not a tick) + Checkbox + Segmented",
    checkboxHint: "Looks match the real plugin: grey inset background (no outer border); the bordered default (rightmost, clickable) is for special cases; the weekday squares are multi-select. Labels follow the locale",
    pickerHint: 'Single / multi / max / search (searchable switch) / grouped / empty / degraded; trigger and options both take a leading icon; label is left-aligned by default (align="center" to center); multi-select at max still allows deselecting picked items',
    modelPickerHint: 'grouped (one dropdown, vendor headers, fully independent) / cascade (vendor and model dropdowns linked) \u2014 both emit the same final model value; a "default model" option is provided by default (emits an empty string, disable with allowDefault: false); the catalog comes from the host automatically',
    workspacePickerHint: "Workspace list comes from the host snapshot automatically (wired via connectHost, live follow stream); selected value is the workspaceId",
    tooltipTitle: "Tooltip (hover hint)",
    tooltipHint: "Official Tooltip: side top / bottom / right x align center / end; anchor can be a button or a span of text; long labels wrap at maxWidth; the rightmost one is a two-part hint (name + body) where \\n in the text is a real line break",
    tooltipAnchorText: "Text anchor",
    tooltipAnchorButton: "Button anchor",
    tooltipLong: "Long label",
    tooltipName: "Alex Chen",
    tooltipRich: "Rich card",
    tooltipMultiline: "Two-part",
    tooltipLongText: "A deliberately long hint: the bubble wraps at maxWidth instead of stretching to half the viewport, and the official layer pulls it back inside the viewport near the edges.",
    demoCardTitle: "Card (frame + radius + short rail)",
    demoStripTitle: "StripCard (soft tint + full-height bar)",
    cardHint: "Surface + 1px border + radius + inline 6px rounded rail (height follows content); the head is vertically centered as a whole \u2014 drop a bare element into action and it centers itself; hover-floating buttons, one or two rows are all up to the caller inside the frame; real-plugin shape: title row + right-side meta + chips row; five accent tiers below",
    stripHint: "Same-hue soft tint + 4px full-height square accent bar at the left edge (mirrors the sibling record block); equally centered as a whole \u2014 record-stream layout: title + meta row + right-side time/actions",
    sectionHeadTitle: "SectionHead",
    chipHint: "Two optional axes: tone (neutral grey / business / success / warning / danger solid signal) and size (sm / md); width hugs the text, no wrap; labels follow the locale (zh & en examples); if the long-text chip at the end is squeezed into a 28px vertical stack, the icon-button fixed-width rule crept back in",
    chipOverdue: "Overdue",
    chipStalled: "Stalled",
    chipDone: "Done",
    chipDoing: "In progress",
    emptyStateTitle: "EmptyState",
    marqueeTitle: "MarqueeText",
    liveTitle: "LiveText",
    feedbackModalHint: "Hand-rolled overlay (no portal); click backdrop / Esc / \u2715 all close it. The header \u2715 is a 24\xD724 icon slot \u2014 no border or 120px-wide color block should appear",
    feedbackToastHint: "Imperative showToast \u2014 no component mounting required",
    explorerDataTitle: "Where the data comes from (real data, no mocks)",
    explorerDataHint: 'File services come from the host remote.workspaceFiles (dotted injection); the workspace list is the official workspaces snapshot. The "most recent workspace" is the newest updated one that owns a session (pickWorkspaceAnchor) \u2014 list / read all need a sessionId, so browsing must land on a real session first.',
    explorerFilesNone: "Not ready: the host has not exposed remote.workspaceFiles yet (no preview, no picking \u2014 no fake data either)",
    explorerAnchorNone: "Not ready: no workspace in the list owns a session yet (open a session in the host and come back)",
    explorerAnchorLabel: "Anchor: ",
    explorerSessionLabel: "session: ",
    explorerWorkspaces: "workspaces: ",
    methodATitle: "Method A: openFilePreview dock preview",
    methodAHint: "Pass a file or folder path and a dock opens on the right (core PanelDock, the header=null variant: no head line, \u2715 floats top-right) \u2014 it is inserted into the page flex row, so the main area is squeezed rather than covered. Resizing belongs to PanelDock. The sample buttons point at real files under packages/demo/src/samples/ (the directory is probed by content, never hardcoded).",
    openRootPreview: "Open the most recent workspace root",
    openSamplesDir: "Browse the sample directory",
    sampleMd: "Preview README.md",
    sampleHtml: "Preview demo.html",
    sampleJs: "Preview sample.js",
    sampleCss: "Preview sample.css",
    samplesProbing: "Looking for the sample directory in the real workspace\u2026",
    samplesNotFound: "Sample directory not found (the anchored workspace has no packages/demo/src/samples)",
    methodBTitle: "Method B: pickWorkspaceFile",
    methodBHint: "A modal pops up beside the anchor button; the promise resolves { path, isDir } (path is workspace-relative); Esc / click-outside / \u2715 cancels with null",
    pickAny: "Pick a file (any)",
    pickTs: ".ts only",
    pickDir: "Folders only",
    pickFolder: "folder",
    pickNone: "Nothing picked yet",
    pickResult: "Picked",
    previewBodyTitle: "FilePreview (usable on its own)",
    previewBodyHint: "The block above already includes it \u2014 FileBrowser renders FilePreview inside.\nIt is also a separate subpath, dsh-plugin-core/explorer/preview: when there is only one file to show (a session attachment, a tool result) you do not need the whole panel.",
    sessionHint: "Three carriers: modal / sidebar / page; source is mocked; renderMessage can take over rich content",
    sessionOpenModal: "Open session preview (modal)",
    sessionClose: "Close",
    sessionPreviewTitle: "Session preview (mock data)",
    dateHint: "No throw on parse failure \u2014 falls back gracefully and never fabricates; all functions are UI-free and run in Node too",
    numberHint: "formatBytes is 1024-based with automatic unit scaling; formatCount adds thousands separators",
    roadmapHint: "The list below is what this package explicitly does NOT provide \u2014 written down so nobody has to guess, and so the boundary stays visible.",
    roadmapOut: "A settings-page skeleton, an i18n framework (plugin copy is the plugin\u2019s own job), a host typings surface",
    roadmapMirror: "A full mirror of the official session UI (tool cards / code blocks / reasoning rows) \u2014 session renders only the minimal shape today; rich content goes through the renderMessage hook",
    roadmapPreview: "(shipped) md render (official MarkdownText) / code highlight (official CodeBlock) / HTML / PDF / Office preview",
    roadmapSkeleton: "(shipped) PanelDock \u2014 dockable split panes: multi-panel, replace-by-name, limit 3",
    roadmapLayout: "Red line: consolidation of the old packages/demo",
    buildDesc: "When the version number does not change, the build stamp is what tells you whether the host is running the newest bundle \u2014 it changes on every build.",
    buildCore: "core version",
    buildDemo: "demo version",
    buildStamp: "build stamp",
    segDay: "Day",
    segWeek: "Week",
    segMonth: "Month",
    segAll: "All",
    segDoing: "Doing",
    segClaimed: "Open",
    segBlocked: "Blocked",
    segStalled: "Stalled",
    weekday1: "Mo",
    weekday2: "Tu",
    weekday3: "We",
    weekday4: "Th",
    weekday5: "Fr",
    weekday6: "Sa",
    weekday7: "Su",
    // Documentation skeleton: labels for the example / code / usage / API table
    docNote: "Note",
    docPreview: "Example",
    docCode: "Code",
    docUsage: "Usage",
    docApi: "API",
    docApiName: "Prop",
    docApiType: "Type",
    docApiDefault: "Default",
    docApiDesc: "Description",
    docCopy: "Copy",
    docCopied: "Copied",
    apiVariant: "Ten appearances: primary / secondary / outline / ghost / danger / success / warning / info / danger-outline / link",
    apiSize: "Three heights: sm 24 / md 28 / lg 32 (bordered and borderless are the same height)",
    apiIcon: "Leading icon: an official icon component, your own SVG, or even a single character (it takes a ReactNode)",
    apiIconRight: "Trailing icon (expand chevron, external link, ...)",
    apiColor: "Custom accent: solid variants use it as fill, outlined and text variants use it for text and border",
    apiLoading: "Spins and disables clicks by itself",
    apiBlock: "Fills the parent width; with a leading icon the label stays optically centered",
    apiDisabled: "Passed through to the native disabled (disabled)",
    apiChildren: "Button label / content",
    pluginTitle: "Component preview",
    pluginCardDesc: "Open the showcase of dsh-plugin-core controls and business components",
    pluginCardOpen: "Open \u203A"
  }
};
var boundT;
function setDemoTranslate(fn) {
  boundT = fn;
}
function t2(key, vars) {
  if (boundT !== void 0) return boundT(key, vars);
  const template = DICT2[getLocale()][key] ?? DICT2.zh[key] ?? key;
  if (vars === void 0) return template;
  return template.replace(/\{(\w+)\}/g, (whole, name) => {
    const value = vars[name];
    return value === void 0 ? whole : String(value);
  });
}

// packages/demo/src/dock.ts
var demoDock = createPanelDock({ maxPanels: 3 });
function Body(props) {
  return (0, import_react25.createElement)(
    "div",
    { style: { padding: "12px 14px", fontSize: "13px", lineHeight: "1.9" } },
    (0, import_react25.createElement)("div", { style: { fontWeight: 600 } }, props.id),
    (0, import_react25.createElement)("div", { style: { color: "var(--dshpc-fg-3)" } }, t2("dockPanelBody"))
  );
}
function CustomHead() {
  return (0, import_react25.createElement)(
    "div",
    { style: { padding: "10px 12px", borderBottom: "1px solid var(--dshpc-border-faint)" } },
    (0, import_react25.createElement)(
      "div",
      { style: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600 } },
      (0, import_react25.createElement)(import_dsh_client_ui_primitives.IconSparkleRegular, null),
      t2("dockCustomHeadTitle")
    ),
    (0, import_react25.createElement)(
      "div",
      { style: { marginTop: "6px", fontSize: "12px", color: "var(--dshpc-fg-3)" } },
      t2("dockCustomHeadHint")
    )
  );
}
var PANELS = [
  {
    id: "A",
    title: t2("dockPanelA"),
    icon: (0, import_react25.createElement)(
      "span",
      { style: { display: "inline-flex", gap: "4px" } },
      (0, import_react25.createElement)(import_dsh_client_ui_primitives.IconSparkleRegular, null),
      (0, import_react25.createElement)(import_dsh_client_ui_primitives.IconClockOutlineRegular, null)
    ),
    // 标题右侧：任意内容，不只按钮。
    extra: (0, import_react25.createElement)(Chip, { tone: "business", size: "sm" }, t2("dockPanelATag")),
    minWidth: 300,
    maxWidth: 620
  },
  {
    id: "B",
    header: (0, import_react25.createElement)(CustomHead, null),
    minWidth: 320
  },
  {
    id: "C",
    // 不要头部：关钮自动浮到右上角。
    header: null,
    ariaLabel: t2("dockPanelC"),
    minWidth: 280
  }
];
function demoPanels() {
  return PANELS.map(
    (pane) => (0, import_react25.createElement)(DockPanel, { ...pane, key: pane.id }, (0, import_react25.createElement)(Body, { id: pane.id }))
  );
}

// packages/demo/src/layout-mount.ts
var pageRow = { element: null };

// packages/demo/src/sections/index.tsx
var import_react43 = require("react");

// packages/demo/src/sections/start.tsx
var import_react27 = require("react");

// packages/demo/src/doc.tsx
var import_react26 = require("react");
var import_dsh_client_ui_primitives2 = require("@deepseek-ai/dsh-client-ui-primitives");
function Note(props) {
  return (0, import_react26.createElement)(
    StripCard,
    { accent: "business", className: "dshpc-doc-note" },
    (0, import_react26.createElement)(
      "div",
      { className: "dshpc-doc-note__body" },
      (0, import_react26.createElement)("span", { className: "dshpc-doc-note__mark" }, t2("docNote")),
      (0, import_react26.createElement)("span", null, props.text)
    )
  );
}
function CodeOnly(props) {
  return (0, import_react26.createElement)(
    "div",
    { className: "dshpc-doc-block" },
    (0, import_react26.createElement)("div", { className: "dshpc-doc-label" }, t2(props.labelKey)),
    (0, import_react26.createElement)(import_dsh_client_ui_primitives2.CodeBlock, {
      code: props.code,
      lang: props.lang ?? "tsx",
      showHeader: true,
      copyLabel: t2("docCopy"),
      copiedLabel: t2("docCopied")
    })
  );
}
function Example(props) {
  return (0, import_react26.createElement)(
    "section",
    { className: "dshpc-doc-example" },
    (0, import_react26.createElement)(
      "div",
      { className: "dshpc-doc-example__head" },
      (0, import_react26.createElement)("div", { className: "dshpc-doc-example__title" }, props.title),
      props.hint === void 0 ? null : (0, import_react26.createElement)("div", { className: "dshpc-doc-example__hint" }, props.hint)
    ),
    (0, import_react26.createElement)(
      "div",
      { className: "dshpc-doc-example__body" },
      (0, import_react26.createElement)(
        "div",
        { className: "dshpc-doc-example__demo" },
        (0, import_react26.createElement)("div", { className: "dshpc-doc-label" }, t2("docPreview")),
        props.children ?? null
      ),
      props.code === void 0 ? null : (0, import_react26.createElement)(
        "div",
        { className: "dshpc-doc-example__code" },
        (0, import_react26.createElement)("div", { className: "dshpc-doc-label" }, t2("docCode")),
        (0, import_react26.createElement)(
          "div",
          { className: "dshpc-doc-example__scroll" },
          (0, import_react26.createElement)(import_dsh_client_ui_primitives2.CodeBlock, {
            code: props.code,
            lang: "tsx",
            showHeader: true,
            copyLabel: t2("docCopy"),
            copiedLabel: t2("docCopied")
          })
        )
      )
    )
  );
}
function ApiTable(props) {
  return (0, import_react26.createElement)(
    "div",
    { className: "dshpc-doc-block" },
    (0, import_react26.createElement)("div", { className: "dshpc-doc-label" }, t2("docApi")),
    (0, import_react26.createElement)(
      "table",
      { className: "dshpc-doc-api" },
      (0, import_react26.createElement)(
        "thead",
        null,
        (0, import_react26.createElement)(
          "tr",
          null,
          (0, import_react26.createElement)("th", null, t2("docApiName")),
          (0, import_react26.createElement)("th", null, t2("docApiType")),
          (0, import_react26.createElement)("th", null, t2("docApiDefault")),
          (0, import_react26.createElement)("th", null, t2("docApiDesc"))
        )
      ),
      (0, import_react26.createElement)(
        "tbody",
        null,
        props.rows.map(
          (row) => (0, import_react26.createElement)(
            "tr",
            { key: row.name },
            (0, import_react26.createElement)("td", null, row.name),
            (0, import_react26.createElement)("td", null, row.type),
            (0, import_react26.createElement)("td", null, row.def),
            (0, import_react26.createElement)("td", null, t2(row.descKey))
          )
        )
      )
    )
  );
}

// packages/demo/src/sections/start.tsx
var CODE_START_USAGE = `pnpm add dsh-plugin-core

// \u5F15\u5165\u6837\u5F0F\u5DE5\u5177\u4E0E\u63A7\u4EF6
import { createStyleKit } from 'dsh-plugin-core/design'
import { Button, Modal, notify } from 'dsh-plugin-core/ui'

// \u4E00\u6B21\u6027\u6CE8\u5165\u6837\u5F0F\uFF08\u6BCF\u4E2A\u63D2\u4EF6\u7528\u81EA\u5DF1\u7684\u56FA\u5B9A id\uFF09
import { setStyleKit, ensureControls } from 'dsh-plugin-core/ui'
setStyleKit(createStyleKit({ id: 'your-plugin-id' }))
ensureControls()`;
function QuickstartPage() {
  return (0, import_react27.createElement)(
    "div",
    null,
    (0, import_react27.createElement)(Note, { text: t2("startNote") }),
    (0, import_react27.createElement)(Example, { title: t2("secOverview") }, (0, import_react27.createElement)(Placeholder, { descKey: "overviewDesc" })),
    (0, import_react27.createElement)(Example, { title: t2("secInstall") }, (0, import_react27.createElement)(Placeholder, { descKey: "installDesc" })),
    (0, import_react27.createElement)(Example, { title: t2("secWritePlugin") }, (0, import_react27.createElement)(Placeholder, { descKey: "quickstartDesc" })),
    (0, import_react27.createElement)(CodeOnly, { labelKey: "docUsage", code: CODE_START_USAGE })
  );
}

// packages/demo/src/sections/foundation.tsx
var import_react28 = require("react");
var TOKENS = [
  { label: "business", cssVar: "--dshpc-business" },
  { label: "success", cssVar: "--dshpc-success" },
  { label: "warning", cssVar: "--dshpc-warning" },
  { label: "danger", cssVar: "--dshpc-danger" },
  { label: "surface-1", cssVar: "--dshpc-surface-1" },
  { label: "surface-2", cssVar: "--dshpc-surface-2" },
  { label: "surface-sunken", cssVar: "--dshpc-surface-sunken" },
  { label: "border", cssVar: "--dshpc-border" },
  { label: "fg", cssVar: "--dshpc-fg" },
  { label: "fg-3", cssVar: "--dshpc-fg-3" },
  { label: "fg-4", cssVar: "--dshpc-fg-4" }
];
function FoundationPage() {
  return (0, import_react28.createElement)(
    "div",
    null,
    (0, import_react28.createElement)(Note, { text: t2("foundationNote") }),
    (0, import_react28.createElement)(
      Example,
      { title: t2("demoTokenPalette"), hint: t2("tokensHint") },
      (0, import_react28.createElement)(
        "div",
        { style: { display: "flex", flexWrap: "wrap", gap: "10px" } },
        TOKENS.map(
          (item) => (0, import_react28.createElement)(
            "div",
            { key: item.cssVar, style: { width: "104px" } },
            (0, import_react28.createElement)("div", {
              style: {
                height: "40px",
                borderRadius: "6px",
                background: `var(${item.cssVar})`,
                border: "1px solid var(--dshpc-border-faint)"
              }
            }),
            (0, import_react28.createElement)("div", { style: { fontSize: "11px", marginTop: "4px" } }, item.label),
            (0, import_react28.createElement)("div", { style: { fontSize: "10px", color: "var(--dshpc-fg-4)" } }, item.cssVar)
          )
        )
      )
    ),
    // 暗色主题。判据是在**渲染时**读的，宿主改明暗后重开本页才更新。
    (0, import_react28.createElement)(
      Example,
      { title: "body[data-ds-dark-theme]", hint: t2("darkHint") },
      (0, import_react28.createElement)(
        "div",
        { style: { display: "flex", alignItems: "center", gap: "10px" } },
        (0, import_react28.createElement)(
          "span",
          { style: { fontFamily: "var(--dshpc-font-mono)", fontSize: "12px", color: "var(--dshpc-fg-3)" } },
          t2("darkNow")
        ),
        (0, import_react28.createElement)("code", {
          style: {
            fontFamily: "var(--dshpc-font-mono)",
            fontSize: "13px",
            padding: "3px 10px",
            borderRadius: "6px",
            background: "var(--dshpc-open-bg)",
            color: typeof document !== "undefined" && document.body.hasAttribute("data-ds-dark-theme") ? "var(--dshpc-success)" : "var(--dshpc-fg-2)"
          }
        }, typeof document !== "undefined" && document.body.hasAttribute("data-ds-dark-theme") ? "true\uFF08\u6697\u8272\uFF09" : "false\uFF08\u4EAE\u8272\uFF09")
      )
    ),
    (0, import_react28.createElement)(
      Example,
      {
        title: t2("demoStyleInject"),
        hint: t2("injectHint"),
        code: `import { createStyleKit } from 'dsh-plugin-core/design'
import { ensureControls, setStyleKit } from 'dsh-plugin-core/ui'

setStyleKit(createStyleKit({ id: 'dsh-plugin-core-demo-ui' }))
ensureControls()`
      },
      (0, import_react28.createElement)("div", { style: { color: "var(--dshpc-fg-3)", fontSize: "12px" } }, t2("designInjectNote"))
    ),
    (0, import_react28.createElement)(Example, { title: t2("secNaming") }, (0, import_react28.createElement)(Placeholder, { descKey: "namingDesc" }))
  );
}

// packages/demo/src/sections/controls.tsx
var import_react31 = require("react");

// dist/ui/official.js
var official_exports = {};
__export(official_exports, {
  Official: () => Official,
  pickOfficial: () => pickOfficial
});
var Official = __toESM(require("@deepseek-ai/dsh-client-ui-primitives"), 1);
__reExport(official_exports, require("@deepseek-ai/dsh-client-ui-primitives"));
var import_react29 = require("react");
var import_client3 = require("react-dom/client");
var warned = /* @__PURE__ */ new Set();
var officialRegistry = Official;
function pickOfficial(name, fallback) {
  const value = officialRegistry[name];
  if (value === void 0) {
    if (!warned.has(name)) {
      warned.add(name);
      console.warn(`[dsh-plugin-core:official] \u5B98\u65B9 primitive "${String(name)}" \u7F3A\u5931\uFF0C\u56DE\u843D\u5230\u672C\u5730\u515C\u5E95`);
    }
    return fallback;
  }
  return value;
}
function mountHostModal(render) {
  if (typeof document === "undefined")
    return;
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = (0, import_client3.createRoot)(container);
  const close = () => {
    root.unmount();
    container.remove();
  };
  root.render(render(close));
}
var hostConfirm = (opts) => new Promise((resolve) => {
  mountHostModal((close) => (0, import_react29.createElement)(Official.Modal, {
    open: true,
    onClose: () => {
      close();
      resolve(false);
    },
    title: opts.title ?? "",
    closeLabel: t("modalClose"),
    description: opts.description,
    footer: (0, import_react29.createElement)("div", { style: { display: "flex", justifyContent: "flex-end", gap: "8px" } }, (0, import_react29.createElement)(Button, { variant: "outline", onClick: () => {
      close();
      resolve(false);
    } }, opts.cancelText ?? t("cancel")), (0, import_react29.createElement)(Button, { variant: opts.danger === true ? "danger" : "primary", onClick: () => {
      close();
      resolve(true);
    } }, opts.confirmText ?? t("confirm")))
  }));
});
var hostAlert = (opts) => new Promise((resolve) => {
  mountHostModal((close) => (0, import_react29.createElement)(Official.Modal, {
    open: true,
    onClose: () => {
      close();
      resolve();
    },
    title: opts.title ?? "",
    closeLabel: t("modalClose"),
    description: opts.description,
    footer: (0, import_react29.createElement)("div", { style: { display: "flex", justifyContent: "flex-end" } }, (0, import_react29.createElement)(Button, { variant: "primary", onClick: () => {
      close();
      resolve();
    } }, opts.confirmText ?? t("dialogOk")))
  }));
});
registerHostDialog({ confirm: hostConfirm, alert: hostAlert });

// dist/ui/host-toast.js
var import_react30 = require("react");
var import_client4 = require("react-dom/client");
function showHostToast(message, opts) {
  if (typeof document === "undefined")
    return;
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = (0, import_client4.createRoot)(container);
  const close = () => {
    root.unmount();
    container.remove();
  };
  root.render((0, import_react30.createElement)(Official.Toast, {
    text: message,
    tone: opts?.tone,
    holdMs: opts?.holdMs ?? 3e3,
    actions: opts?.actions !== void 0 ? opts.actions.map((a) => ({ label: a.text, onClick: a.onClick })) : void 0,
    onDone: () => {
      close();
      opts?.onDismiss?.();
    }
  }));
}

// packages/demo/src/sections/controls.tsx
var import_dsh_client_ui_primitives3 = require("@deepseek-ai/dsh-client-ui-primitives");
var BUTTON_ICONS = [
  { name: "plus", Icon: import_dsh_client_ui_primitives3.IconPlusOutlineRegular },
  { name: "check", Icon: import_dsh_client_ui_primitives3.IconCheckOutlineRegular },
  { name: "close", Icon: import_dsh_client_ui_primitives3.IconCloseOutlineRegular },
  { name: "refresh", Icon: import_dsh_client_ui_primitives3.IconRefreshOutlineRegular },
  { name: "copy", Icon: import_dsh_client_ui_primitives3.IconCopyOutlineRegular },
  { name: "search", Icon: import_dsh_client_ui_primitives3.IconSearchOutlineRegular },
  { name: "edit", Icon: import_dsh_client_ui_primitives3.IconEditOutlineRegular },
  { name: "play", Icon: import_dsh_client_ui_primitives3.IconPlayOutlineRegular },
  { name: "send", Icon: import_dsh_client_ui_primitives3.IconPaperPlaneOutlineRegular },
  { name: "clock", Icon: import_dsh_client_ui_primitives3.IconClockOutlineRegular },
  { name: "sparkle", Icon: import_dsh_client_ui_primitives3.IconSparkleRegular },
  { name: "chevron", Icon: import_dsh_client_ui_primitives3.IconChevronDownOutlineRegular }
];
function iconOf(name, size = 14) {
  const found = BUTTON_ICONS.find((item) => item.name === name);
  return found === void 0 ? null : (0, import_react31.createElement)(found.Icon, { size });
}
function StarSvg() {
  return (0, import_react31.createElement)(
    "svg",
    { width: 14, height: 14, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true },
    (0, import_react31.createElement)("path", {
      d: "M8 1.6l1.9 4 4.4.6-3.2 3 .8 4.3L8 11.4l-3.9 2.1.8-4.3-3.2-3 4.4-.6z",
      stroke: "currentColor",
      strokeWidth: 1.2,
      strokeLinejoin: "round"
    })
  );
}
var ICON_SIZE = { sm: 12, md: 14, lg: 16 };
var VARIANT_ICON = {
  primary: "check",
  secondary: "copy",
  outline: "edit",
  ghost: "refresh",
  danger: "close",
  success: "play",
  warning: "clock",
  info: "send",
  "danger-outline": "close",
  link: "search"
};
var VARIANT_GROUPS = [
  { label: "\u4E3B\u884C\u52A8", items: ["primary", "secondary"] },
  { label: "\u4E2D\u6027", items: ["outline", "ghost"] },
  { label: "\u8BED\u4E49\u8272", items: ["danger", "success", "warning", "info"] },
  { label: "\u5F31\u5316 / \u884C\u5185", items: ["danger-outline", "link"] }
];
var CUSTOM_COLORS = ["#7c3aed", "#0ea5e9", "#f97316", "#16a34a"];
function tipAnchor(text, side, align) {
  const props = { label: text, side };
  if (align !== void 0) props.align = align;
  return (0, import_react31.createElement)(import_dsh_client_ui_primitives3.Tooltip, props, (0, import_react31.createElement)("button", {
    type: "button",
    style: {
      padding: "4px 10px",
      border: "1px solid var(--dshpc-border)",
      borderRadius: "6px",
      background: "var(--dshpc-surface-1)",
      color: "var(--dshpc-fg)",
      fontSize: "12px",
      cursor: "pointer"
    }
  }, text));
}
function Row(props) {
  return (0, import_react31.createElement)("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" } }, props.children);
}
function Labeled(props) {
  return (0, import_react31.createElement)(
    "div",
    { style: { display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" } },
    (0, import_react31.createElement)("span", { style: { width: "auto", minWidth: "64px", flex: "none", whiteSpace: "normal", color: "var(--dshpc-fg-3)", fontSize: "12px" } }, props.label),
    props.children
  );
}
var CODE_BTN_TEXT = `<Button variant="primary" icon={<IconCheckOutlineRegular size={16} />}>\u4FDD\u5B58</Button>
<Button variant="outline">\u53D6\u6D88</Button>
<Button variant="danger" icon={<IconCloseOutlineRegular size={16} />}>\u5220\u9664</Button>`;
var CODE_BTN_VARIANT = `// \u4E3B\u884C\u52A8
<Button variant="primary" icon={<IconCheckOutlineRegular size={16} />}>primary</Button>
<Button variant="secondary" icon={<IconCopyOutlineRegular size={16} />}>secondary</Button>

// \u4E2D\u6027
<Button variant="outline" icon={<IconEditOutlineRegular size={16} />}>outline</Button>
<Button variant="ghost" icon={<IconRefreshOutlineRegular size={16} />}>ghost</Button>

// \u8BED\u4E49\u8272
<Button variant="danger" icon={<IconCloseOutlineRegular size={16} />}>danger</Button>
<Button variant="success" icon={<IconPlayOutlineRegular size={16} />}>success</Button>
<Button variant="warning" icon={<IconClockOutlineRegular size={16} />}>warning</Button>
<Button variant="info" icon={<IconPaperPlaneOutlineRegular size={16} />}>info</Button>

// \u5F31\u5316 / \u884C\u5185
<Button variant="danger-outline" icon={<IconCloseOutlineRegular size={16} />}>danger-outline</Button>
<Button variant="link" icon={<IconSearchOutlineRegular size={16} />}>link</Button>

// \u4EFB\u610F\u4E00\u6863\u90FD\u80FD\u518D\u7ED9 size\uFF08\u8FD9\u91CC sm 24 \u9AD8\uFF09
<Button variant="danger" size="sm" icon={<IconCloseOutlineRegular size={12} />}>danger</Button>`;
var CODE_BTN_SIZE = `<Button size="sm" variant="outline" icon={<IconPlusOutlineRegular size={12} />}>sm</Button>
<Button size="md" variant="outline">md</Button>
<Button size="lg" variant="outline">lg</Button>

// icon \u6536\u7684\u662F ReactNode\uFF1A\u5B98\u65B9\u56FE\u6807\u7EC4\u4EF6 / \u81EA\u7ED8 SVG / \u4E00\u4E2A\u5B57\u7B26\uFF0C\u4E09\u79CD\u90FD\u80FD\u8FDB
<Button variant="primary" icon={<IconSendOutlineRegular size={16} />}>\u5B98\u65B9\u56FE\u6807</Button>
<Button variant="outline" icon={<StarSvg />}>\u81EA\u7ED8 SVG</Button>
<Button variant="ghost" icon="+">\u4E00\u4E2A\u5B57\u7B26</Button>

// iconRight \u540E\u7F6E\uFF1Bblock \u6491\u6EE1\u7236\u5BBD\uFF08\u6709\u524D\u7F6E\u56FE\u6807\u65F6\u6587\u5B57\u4ECD\u5728\u89C6\u89C9\u4E2D\u5FC3\uFF09
<Button variant="outline" iconRight={<IconChevronDownOutlineRegular size={16} />}>\u66F4\u591A</Button>
<Button variant="primary" block icon={<IconCheckOutlineRegular size={16} />}>\u6491\u6EE1\u7236\u5BBD</Button>

// \u7EAF\u56FE\u6807\u94AE\uFF1Alabel \u662F\u5FC5\u586B\u7684\u65E0\u969C\u788D\u540D\uFF08\u540C\u65F6\u4F5C title\uFF09
<IconButton icon={<IconPlusOutlineRegular size={16} />} label="plus" />`;
var CODE_BTN_STATE = `<Button variant="primary">\u9ED8\u8BA4</Button>
<Button variant="primary" disabled>\u7981\u7528</Button>
<Button variant="danger" disabled icon={<IconCloseOutlineRegular size={16} />}>\u7981\u7528</Button>
<Button variant="outline" loading>\u52A0\u8F7D\u4E2D</Button>
<Button variant="primary" loading icon={<IconRefreshOutlineRegular size={16} />}>\u63D0\u4EA4\u4E2D</Button>`;
var CODE_BTN_COLOR = `<Button variant="primary" color="#7c3aed">#7c3aed</Button>
<Button variant="outline" color="#0ea5e9">#0ea5e9</Button>`;
var CODE_BTN_USAGE = `pnpm add dsh-plugin-core

import { Button, IconButton } from 'dsh-plugin-core/ui'

<Button variant="primary" onClick={save}>\u4FDD\u5B58</Button>
<Button variant="danger" size="sm" onClick={remove}>\u5220\u9664</Button>

// \u6837\u5F0F\u4E0D\u7528\u53E6\u914D\uFF1A\u63A7\u4EF6\u81EA\u5DF1 ensureControls()\uFF0Ctoken \u8DDF\u968F\u5BBF\u4E3B\u660E\u6697\u4E3B\u9898`;
var BUTTON_API = [
  { name: "variant", type: "ButtonVariant", def: "'outline'", descKey: "apiVariant" },
  { name: "size", type: "'sm' | 'md' | 'lg'", def: "'lg'", descKey: "apiSize" },
  { name: "icon", type: "ReactNode", def: "\u2014", descKey: "apiIcon" },
  { name: "iconRight", type: "ReactNode", def: "\u2014", descKey: "apiIconRight" },
  { name: "color", type: "string", def: "\u2014", descKey: "apiColor" },
  { name: "loading", type: "boolean", def: "false", descKey: "apiLoading" },
  { name: "block", type: "boolean", def: "false", descKey: "apiBlock" },
  { name: "disabled", type: "boolean", def: "false", descKey: "apiDisabled" },
  { name: "children", type: "ReactNode", def: "\u2014", descKey: "apiChildren" }
];
function ButtonPage() {
  return (0, import_react31.createElement)(
    "div",
    null,
    (0, import_react31.createElement)(Note, { text: t2("btnNote") }),
    // 文案与语言
    (0, import_react31.createElement)(
      Example,
      { title: t2("btnTextTitle"), hint: t2("btnTextHint"), code: CODE_BTN_TEXT },
      (0, import_react31.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "12px" } },
        (0, import_react31.createElement)(
          Labeled,
          { label: "locale" },
          (0, import_react31.createElement)(Button, { variant: "primary", icon: iconOf("check", ICON_SIZE.lg) }, t2("btnLabelSave")),
          (0, import_react31.createElement)(Button, { variant: "outline" }, t2("btnLabelCancel")),
          (0, import_react31.createElement)(Button, { variant: "danger", icon: iconOf("close", ICON_SIZE.lg) }, t2("btnLabelDelete"))
        ),
        (0, import_react31.createElement)(
          Labeled,
          { label: "en" },
          (0, import_react31.createElement)(Button, { variant: "primary" }, "Save"),
          (0, import_react31.createElement)(Button, { variant: "outline" }, "Cancel"),
          (0, import_react31.createElement)(Button, { variant: "ghost" }, "Learn more")
        ),
        (0, import_react31.createElement)(
          Labeled,
          { label: "zh" },
          (0, import_react31.createElement)(Button, { variant: "primary" }, "\u4FDD\u5B58"),
          (0, import_react31.createElement)(Button, { variant: "outline" }, "\u53D6\u6D88"),
          (0, import_react31.createElement)(Button, { variant: "ghost" }, "\u4E86\u89E3\u66F4\u591A")
        ),
        (0, import_react31.createElement)(
          Labeled,
          { label: "zh + en" },
          (0, import_react31.createElement)(Button, { variant: "primary", icon: iconOf("sparkle", ICON_SIZE.lg) }, t2("btnLabelMixed")),
          (0, import_react31.createElement)(Button, { variant: "outline" }, "\u590D\u5236 Copy"),
          (0, import_react31.createElement)(Button, { variant: "secondary" }, "\u91CD\u8BD5 Retry")
        )
      )
    ),
    // 10 档外观
    (0, import_react31.createElement)(
      Example,
      { title: t2("btnVariantTitle"), hint: t2("btnVariantHint"), code: CODE_BTN_VARIANT },
      (0, import_react31.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "10px" } },
        VARIANT_GROUPS.map((group) => (0, import_react31.createElement)(
          Labeled,
          { key: group.label, label: group.label },
          (0, import_react31.createElement)(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-start" } },
            (0, import_react31.createElement)(Row, null, group.items.map((variant) => (0, import_react31.createElement)(Button, { key: variant, variant, icon: iconOf(VARIANT_ICON[variant], ICON_SIZE.lg) }, variant))),
            (0, import_react31.createElement)(Row, null, group.items.map((variant) => (0, import_react31.createElement)(Button, { key: variant, variant, size: "sm", icon: iconOf(VARIANT_ICON[variant], ICON_SIZE.sm) }, variant)))
          )
        ))
      )
    ),
    // 尺寸 / 图标位置 / block
    (0, import_react31.createElement)(
      Example,
      { title: t2("btnSizeTitle"), hint: t2("btnSizeHint"), code: CODE_BTN_SIZE },
      (0, import_react31.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "12px" } },
        (0, import_react31.createElement)(
          Labeled,
          { label: "size" },
          ["sm", "md", "lg"].map((size) => (0, import_react31.createElement)(Button, { key: size, size, variant: "outline", icon: iconOf("plus", ICON_SIZE[size]) }, size))
        ),
        // icon 收的是 ReactNode：官方图标组件 / 自绘 SVG / 一个字符，三种来源各一颗
        (0, import_react31.createElement)(
          Labeled,
          { label: "icon" },
          (0, import_react31.createElement)(Button, { variant: "primary", icon: iconOf("send", ICON_SIZE.lg) }, "\u5B98\u65B9\u56FE\u6807"),
          (0, import_react31.createElement)(Button, { variant: "outline", icon: (0, import_react31.createElement)(StarSvg, null) }, "\u81EA\u7ED8 SVG"),
          (0, import_react31.createElement)(Button, { variant: "ghost", icon: "+" }, "\u4E00\u4E2A\u5B57\u7B26")
        ),
        (0, import_react31.createElement)(
          Labeled,
          { label: "iconRight" },
          (0, import_react31.createElement)(Button, { variant: "outline", iconRight: iconOf("chevron", ICON_SIZE.lg) }, "\u66F4\u591A"),
          (0, import_react31.createElement)(Button, { variant: "primary" }, "\u4E0B\u4E00\u6B65")
        ),
        // block + 前置图标：文字要在视觉中心，不能整组内容居中（那样文字会被图标推右）
        (0, import_react31.createElement)(
          Labeled,
          { label: "block" },
          (0, import_react31.createElement)(
            "div",
            { style: { width: "260px" } },
            (0, import_react31.createElement)(Button, { variant: "primary", block: true, icon: iconOf("check", ICON_SIZE.lg) }, "\u6491\u6EE1\u7236\u5BBD"),
            (0, import_react31.createElement)("div", { style: { height: "8px" } }),
            (0, import_react31.createElement)(Button, { variant: "outline", block: true }, "\u65E0\u56FE\u6807\u5BF9\u7167")
          )
        ),
        (0, import_react31.createElement)(
          Labeled,
          { label: t2("btnIconOnly") },
          BUTTON_ICONS.slice(0, 6).map((item) => (0, import_react31.createElement)(IconButton, { key: item.name, icon: (0, import_react31.createElement)(item.Icon, { size: 16 }), label: item.name }))
        )
      )
    ),
    // 状态
    (0, import_react31.createElement)(
      Example,
      { title: t2("btnStateTitle"), hint: t2("btnStateHint"), code: CODE_BTN_STATE },
      (0, import_react31.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "10px" } },
        (0, import_react31.createElement)(
          Labeled,
          { label: "\u7981\u7528" },
          (0, import_react31.createElement)(Button, { variant: "primary" }, "\u9ED8\u8BA4"),
          (0, import_react31.createElement)(Button, { variant: "primary", disabled: true }, "\u7981\u7528"),
          (0, import_react31.createElement)(Button, { variant: "danger", disabled: true, icon: iconOf("close", ICON_SIZE.lg) }, "\u7981\u7528")
        ),
        (0, import_react31.createElement)(
          Labeled,
          { label: "loading" },
          (0, import_react31.createElement)(Button, { variant: "outline", loading: true }, "\u52A0\u8F7D\u4E2D"),
          (0, import_react31.createElement)(Button, { variant: "primary", loading: true, icon: iconOf("refresh", ICON_SIZE.lg) }, "\u63D0\u4EA4\u4E2D")
        )
      )
    ),
    // 自定义颜色
    (0, import_react31.createElement)(
      Example,
      { title: t2("btnColorTitle"), hint: t2("btnColorHint"), code: CODE_BTN_COLOR },
      (0, import_react31.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "10px" } },
        (0, import_react31.createElement)(
          Labeled,
          { label: "\u5B9E\u5FC3" },
          (0, import_react31.createElement)(Row, null, CUSTOM_COLORS.map((color) => (0, import_react31.createElement)(Button, { key: color, variant: "primary", color, icon: iconOf("sparkle", ICON_SIZE.lg) }, color)))
        ),
        (0, import_react31.createElement)(
          Labeled,
          { label: "\u63CF\u8FB9" },
          (0, import_react31.createElement)(Row, null, CUSTOM_COLORS.map((color) => (0, import_react31.createElement)(Button, { key: color, variant: "outline", color }, color)))
        )
      )
    ),
    (0, import_react31.createElement)(CodeOnly, { labelKey: "docUsage", code: CODE_BTN_USAGE }),
    (0, import_react31.createElement)(ApiTable, { rows: BUTTON_API })
  );
}
var CODE_INPUT_FAMILY = `const [text, setText] = useState('')
const [num, setNum] = useState(3)

// hint \u53C2\u6570\u7248\uFF1A\u95EE\u53F7\u63D0\u793A\u7531\u7EC4\u4EF6\u81EA\u5DF1\u6302\uFF0C\u4E0D\u7528\u624B\u52A8\u62FC FieldHint
<Input value={text} onChange={setText} placeholder="\u9009\u62E9\u65E5\u671F" hint="\u9009\u62E9\u4EFB\u52A1\u7684\u5F00\u59CB\u65F6\u95F4" />
// \u6821\u9A8C\u5931\u8D25\u6001\uFF1A\u63CF\u7EA2
<Input value={text} onChange={setText} error placeholder="\u6821\u9A8C\u5931\u8D25\u6001" />
// \u6570\u5B57\u6846\uFF1A\u8D85\u51FA min / max \u81EA\u52A8\u6536\u56DE\u5230\u8FB9\u754C
<NumberInput value={num} onChange={setNum} min={0} max={10} suffix="\u6B21" hint="\u8D85\u51FA\u8303\u56F4\u4F1A\u81EA\u52A8\u6536\u56DE\u5230 min / max\u3002" />
// \u591A\u884C\u8F93\u5165\uFF1A\u95EE\u53F7\u7F6E\u53F3\u4E0B\u89D2
<Textarea value={text} onChange={setText} placeholder="\u591A\u884C\u8F93\u5165" hint="\u591A\u884C\u8F93\u5165\u4E5F\u652F\u6301 hint \u53C2\u6570\u3002" />`;
var CODE_FIELD_HINT = `// \u95EE\u53F7\u63D0\u793A\u662F\u72EC\u7ACB\u7EC4\u4EF6\uFF0C\u653E\u54EA\u90FD\u884C\uFF0814px \u5185\u8054\u5143\u7D20\uFF09
<h3>\u4E00\u4E2A\u6807\u9898</h3>
<FieldHint text="\u8BF4\u660E\u8FD9\u4E00\u5757\u662F\u5E72\u4EC0\u4E48\u7684\u3002" side="top" />

<Button variant="outline">\u4E00\u4E2A\u6309\u94AE</Button>
<FieldHint text="\u89E3\u91CA\u8FD9\u4E2A\u64CD\u4F5C\u4F1A\u53D1\u751F\u4EC0\u4E48\u3002" side="right" />

<span>\u4E00\u6BB5\u666E\u901A\u6587\u5B57</span>
<FieldHint text="\u6302\u5728\u4EFB\u4F55\u6587\u5B57\u540E\u9762\u90FD\u884C\u3002" />`;
var CODE_SWITCH_SEG = `// \u5F00\u5173\u8BED\u4E49\u7528\u5B98\u65B9 Switch\uFF1Alabel \u53EA\u662F\u65E0\u969C\u788D\u540D\uFF0C\u53EF\u89C1\u6587\u6848\u81EA\u5DF1\u753B\u5728\u65C1\u8FB9
<Switch checked={checked} onChange={setChecked} label="\u542F\u7528" />
<Checkbox checked={checked} onChange={setChecked} label="\u591A\u9009" />

// \u5206\u6BB5\uFF1Aitems = { value, label, count?, badge?, disabled? }\uFF1Bvariant \u9ED8\u8BA4 default\uFF0Cinset \u662F\u7070\u5E95\u6B3E
<Segmented
  variant="inset"
  items={[{ value: 'day', label: '\u65E5' }, { value: 'week', label: '\u5468' }, { value: 'month', label: '\u6708' }]}
  value={seg}
  onChange={setSeg}
/>
// bordered\uFF1A\u9009\u4E2D\u6BB5\u53D8\u63CF\u8FB9\u5757\uFF1Bsize \u4E09\u6863
<Segmented variant="inset" bordered size="sm" items={...} value={seg} onChange={setSeg} />

// \u7B5B\u9009\u6761\uFF1Acount \u7ED9\u4E2D\u6027\u8BA1\u6570\uFF0Cbadge \u7ED9\u7EA2\u89D2\u6807
<Segmented
  variant="inset"
  items={[{ value: 'all', label: '\u5168\u90E8', count: 11 }, { value: 'doing', label: '\u8FDB\u884C\u4E2D', count: 5 }]}
  value={filter}
  onChange={setFilter}
/>

// \u661F\u671F\u591A\u9009\uFF1Amultiple + value \u662F\u6570\u7EC4
<Segmented
  multiple
  label="\u661F\u671F"
  items={[1, 2, 3, 4, 5, 6, 7].map((n) => ({ value: String(n), label: '\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u65E5'[n - 1] }))}
  value={multi}
  onChange={setMulti}
/>`;
var CODE_INPUT_USAGE = `pnpm add dsh-plugin-core

import { Input, NumberInput, Textarea, Checkbox, Segmented, FieldHint } from 'dsh-plugin-core/ui'

const [text, setText] = useState('')

<Input value={text} onChange={setText} placeholder="\u9009\u62E9\u65E5\u671F" hint="\u5F00\u59CB\u65F6\u95F4" />
<Textarea value={text} onChange={setText} placeholder="\u591A\u884C\u8F93\u5165" rows={4} />
<NumberInput value={3} onChange={setNum} min={0} max={10} suffix="\u6B21" />

<Segmented
  variant="inset"
  items={[{ value: 'day', label: '\u65E5' }, { value: 'week', label: '\u5468' }]}
  value={seg}
  onChange={setSeg}
/>

// \u300C\u542F\u7528\u300D\u662F\u5F00\u5173\u8BED\u4E49\uFF1A\u7528\u5B98\u65B9 Switch\uFF0C\u4E0D\u8981\u7528\u52FE\u9009\u6846
import { Switch } from '@deepseek-ai/dsh-client-ui-primitives'
<Switch checked={checked} onChange={setChecked} label="\u542F\u7528" />`;
var INPUT_API = [
  { name: "value", type: "string", def: "\u2014", descKey: "apiValue" },
  { name: "onChange", type: "(value: string) => void", def: "\u2014", descKey: "apiOnChange" },
  { name: "placeholder", type: "string", def: "\u2014", descKey: "apiPlaceholder" },
  { name: "hint", type: "string", def: "\u2014", descKey: "apiHint" },
  { name: "error", type: "boolean", def: "false", descKey: "apiError" },
  { name: "disabled", type: "boolean", def: "false", descKey: "apiDisabled" },
  { name: "size", type: "'sm' | 'md' | 'lg'", def: "'lg'", descKey: "apiSize" }
];
var NUMBER_API = [
  { name: "value", type: "number", def: "\u2014", descKey: "apiValue" },
  { name: "onChange", type: "(value: number) => void", def: "\u2014", descKey: "apiOnChange" },
  { name: "min / max", type: "number", def: "\xB1Infinity", descKey: "apiMin" },
  { name: "suffix", type: "string", def: "\u2014", descKey: "apiSuffix" }
];
var TEXTAREA_API = [
  { name: "rows", type: "number", def: "\u2014", descKey: "apiRows" }
];
var SEGMENTED_API = [
  { name: "items", type: "readonly SegmentedItem[]", def: "\u2014", descKey: "apiItems" },
  { name: "value", type: "T | T[]", def: "\u2014", descKey: "apiValue" },
  { name: "onChange", type: "(value: T | T[]) => void", def: "\u2014", descKey: "apiOnChange" },
  { name: "multiple", type: "boolean", def: "false", descKey: "apiMultiple" },
  { name: "variant", type: "'default' | 'inset'", def: "'default'", descKey: "apiVariant" },
  { name: "bordered", type: "boolean", def: "false", descKey: "apiBordered" },
  { name: "size", type: "'sm' | 'md' | 'lg'", def: "'lg'", descKey: "apiSize" },
  { name: "label", type: "string", def: "\u2014", descKey: "apiLabel" }
];
function InputPage() {
  const [text, setText] = (0, import_react31.useState)("");
  const [num, setNum] = (0, import_react31.useState)(3);
  const [checked, setChecked] = (0, import_react31.useState)(true);
  const [seg, setSeg] = (0, import_react31.useState)("week");
  const [filter, setFilter] = (0, import_react31.useState)("all");
  const [multi, setMulti] = (0, import_react31.useState)(["1"]);
  return (0, import_react31.createElement)(
    "div",
    null,
    (0, import_react31.createElement)(Note, { text: t2("inputNote") }),
    // Input 家族
    (0, import_react31.createElement)(
      Example,
      { title: t2("demoInputFamily"), hint: t2("inputHint"), code: CODE_INPUT_FAMILY },
      (0, import_react31.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "10px", maxWidth: "380px" } },
        (0, import_react31.createElement)(
          "div",
          { style: { display: "flex", alignItems: "center", gap: "6px" } },
          (0, import_react31.createElement)("span", { style: { color: "var(--dshpc-fg-2)", fontSize: "13px", flex: "none" } }, "\u5F00\u59CB\u65F6\u95F4"),
          // hint 参数版：问号提示由组件自己挂（不再手动拼 FieldHint）
          (0, import_react31.createElement)(Input, { value: text, onChange: setText, placeholder: "\u9009\u62E9\u65E5\u671F", hint: t2("fieldHintDate") })
        ),
        (0, import_react31.createElement)(Input, { value: "bad value", onChange: () => {
        }, error: true, placeholder: "\u6821\u9A8C\u5931\u8D25\u6001" }),
        // ⚠️ 外层是 flex column（默认 align-items:stretch）会把 .dshpc-num 拉到全宽；
        //    组件本身是内容自适应宽（inline-flex 无 width），演示区还原成它本来的短宽。
        (0, import_react31.createElement)(NumberInput, { value: num, onChange: setNum, min: 0, max: 10, suffix: "\u6B21", style: { alignSelf: "flex-start" }, hint: "\u8D85\u51FA\u8303\u56F4\u4F1A\u81EA\u52A8\u6536\u56DE\u5230 min / max\u3002" }),
        (0, import_react31.createElement)(Textarea, { value: text, onChange: setText, placeholder: "\u591A\u884C\u8F93\u5165", hint: "\u591A\u884C\u8F93\u5165\u4E5F\u652F\u6301 hint \u53C2\u6570\u3002" })
      )
    ),
    // 问号提示：证明它不属于 Input 家族，随处可挂
    (0, import_react31.createElement)(
      Example,
      { title: t2("btnHintTitle"), hint: t2("btnHintHint"), code: CODE_FIELD_HINT },
      (0, import_react31.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "10px" } },
        (0, import_react31.createElement)(
          Row,
          null,
          (0, import_react31.createElement)("b", { style: { fontSize: "13px" } }, "\u4E00\u4E2A\u6807\u9898"),
          (0, import_react31.createElement)(FieldHint, { text: "\u6302\u5728\u6807\u9898\u540E\u9762\uFF1A\u8BF4\u660E\u8FD9\u4E00\u5757\u662F\u5E72\u4EC0\u4E48\u7684\u3002" })
        ),
        (0, import_react31.createElement)(
          Row,
          null,
          (0, import_react31.createElement)(Button, { variant: "outline" }, "\u4E00\u4E2A\u6309\u94AE"),
          (0, import_react31.createElement)(FieldHint, { text: "\u6302\u5728\u6309\u94AE\u540E\u9762\uFF1A\u89E3\u91CA\u8FD9\u4E2A\u64CD\u4F5C\u4F1A\u53D1\u751F\u4EC0\u4E48\u3002" })
        ),
        (0, import_react31.createElement)(
          Row,
          null,
          (0, import_react31.createElement)("span", { style: { fontSize: "13px" } }, "\u4E00\u6BB5\u666E\u901A\u6587\u5B57"),
          (0, import_react31.createElement)(FieldHint, { text: "\u6302\u5728\u4EFB\u4F55\u6587\u5B57\u540E\u9762\u90FD\u884C\uFF0C\u5B83\u53EA\u662F\u4E00\u4E2A 14px \u7684\u5185\u8054\u5143\u7D20\u3002" })
        )
      )
    ),
    // Switch / Checkbox / Segmented
    (0, import_react31.createElement)(
      Example,
      { title: t2("switchTip"), hint: t2("checkboxHint"), code: CODE_SWITCH_SEG },
      (0, import_react31.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "14px", alignItems: "flex-start" } },
        (0, import_react31.createElement)(
          "div",
          { style: { display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" } },
          // 「启用」是开关语义，用官方 Switch（用户 2026-10-20：不要用勾去启用）。
          // 官方 Switch 只画胶囊本体，label 是 aria-label，可见文案由调用方自己画在旁边 ——
          // 文案单独挂 onClick 使其可点（不能挂外层：点胶囊会冒泡触发两次翻转）。
          (0, import_react31.createElement)(
            "span",
            { style: { display: "inline-flex", alignItems: "center", gap: "8px" } },
            (0, import_react31.createElement)(import_dsh_client_ui_primitives3.Switch, { checked, onChange: setChecked, label: "\u542F\u7528" }),
            (0, import_react31.createElement)("span", {
              style: { fontSize: "13px", cursor: "pointer", userSelect: "none" },
              onClick: () => {
                setChecked(!checked);
              }
            }, "\u542F\u7528")
          ),
          (0, import_react31.createElement)(Checkbox, { checked, onChange: setChecked, label: "\u591A\u9009" }),
          (0, import_react31.createElement)(Segmented, {
            variant: "inset",
            items: [
              { value: "day", label: "\u65E5" },
              { value: "week", label: "\u5468" },
              { value: "month", label: "\u6708" }
            ],
            value: seg,
            onChange: setSeg
          }),
          (0, import_react31.createElement)(Segmented, {
            variant: "inset",
            bordered: true,
            items: [
              { value: "day", label: "\u65E5" },
              { value: "week", label: "\u5468" },
              { value: "month", label: "\u6708" }
            ],
            value: seg,
            onChange: setSeg
          }),
          (0, import_react31.createElement)(Segmented, {
            variant: "inset",
            size: "sm",
            items: [
              { value: "day", label: "\u65E5" },
              { value: "week", label: "\u5468" },
              { value: "month", label: "\u6708" }
            ],
            value: seg,
            onChange: setSeg
          }),
          (0, import_react31.createElement)(Segmented, {
            variant: "inset",
            size: "sm",
            bordered: true,
            items: [
              { value: "day", label: "\u65E5" },
              { value: "week", label: "\u5468" },
              { value: "month", label: "\u6708" }
            ],
            value: seg,
            onChange: setSeg
          })
        ),
        // 筛选条形态（真实插件同款）：中性计数 + inset 灰底
        (0, import_react31.createElement)(Segmented, {
          variant: "inset",
          items: [
            { value: "all", label: t2("segAll"), count: 11 },
            { value: "doing", label: t2("segDoing"), count: 5 },
            { value: "claimed", label: t2("segClaimed"), count: 11 },
            { value: "blocked", label: t2("segBlocked") },
            { value: "stalled", label: t2("segStalled") }
          ],
          value: filter,
          onChange: setFilter
        }),
        (0, import_react31.createElement)(Segmented, {
          variant: "inset",
          bordered: true,
          items: [
            { value: "all", label: t2("segAll"), count: 11 },
            { value: "doing", label: t2("segDoing"), count: 5 },
            { value: "claimed", label: t2("segClaimed"), count: 11 },
            { value: "blocked", label: t2("segBlocked") },
            { value: "stalled", label: t2("segStalled") }
          ],
          value: filter,
          onChange: setFilter
        }),
        // 星期多选方块（蓝底选中、近似方形）
        (0, import_react31.createElement)(Segmented, {
          multiple: true,
          className: "dshpc-seg--weekday",
          label: "\u661F\u671F",
          items: [1, 2, 3, 4, 5, 6, 7].map((n) => ({
            value: String(n),
            label: t2(`weekday${n}`)
          })),
          value: multi,
          onChange: setMulti
        }),
        (0, import_react31.createElement)(Segmented, {
          multiple: true,
          className: "dshpc-seg--weekday",
          bordered: true,
          label: "\u661F\u671F\uFF08\u5E26\u5916\u6846\uFF09",
          items: [1, 2, 3, 4, 5, 6, 7].map((n) => ({
            value: String(n),
            label: t2(`weekday${n}`)
          })),
          value: multi,
          onChange: setMulti
        })
      )
    ),
    (0, import_react31.createElement)(CodeOnly, { labelKey: "docUsage", code: CODE_INPUT_USAGE }),
    (0, import_react31.createElement)(ApiTable, { rows: INPUT_API }),
    (0, import_react31.createElement)(ApiTable, { rows: NUMBER_API }),
    (0, import_react31.createElement)(ApiTable, { rows: TEXTAREA_API }),
    (0, import_react31.createElement)(ApiTable, { rows: SEGMENTED_API }),
    (0, import_react31.createElement)(Placeholder, { descKey: "inputMissingDesc" })
  );
}
var ICON_OPTIONS = [
  { value: "a", label: "\u9009\u9879 A", icon: (0, import_react31.createElement)(import_dsh_client_ui_primitives3.IconSparkleRegular, { size: 14 }) },
  { value: "b", label: "\u9009\u9879 B", icon: (0, import_react31.createElement)(import_dsh_client_ui_primitives3.IconClockOutlineRegular, { size: 14 }) },
  { value: "c", label: "\u9009\u9879 C", icon: (0, import_react31.createElement)(import_dsh_client_ui_primitives3.IconPlayOutlineRegular, { size: 14 }) }
];
var CODE_PICKER = `// \u5355\u9009\uFF1Aicon + \u53EF\u641C\u7D22 / \u53EF\u6E05\u9664
<Picker
  options={[{ value: 'a', label: '\u9009\u9879 A' }, { value: 'b', label: '\u9009\u9879 B' }]}
  value={single}
  onChange={setSingle}
  searchable
  clearable
  placeholder="\u5355\u9009"
/>
// \u5206\u7EC4 + \u591A\u9009\uFF1Agroups \u4E0E options \u4E8C\u9009\u4E00\uFF1Bmax \u7ED9\u4E0A\u9650\uFF0C\u53EF\u53CD\u9009
<Picker
  groups={[{ value: 'g1', label: '\u7EC4\u4E00', options }, { value: 'g2', label: '\u7EC4\u4E8C', options }]}
  value={multi}
  mode="multiple"
  max={2}
  onChange={setMulti}
  searchable
/>
// hint \u6302\u5728\u89E6\u53D1\u5668\u540E\u9762\uFF0C\u4E0D\u7528\u518D\u624B\u52A8\u62FC FieldHint
<Picker options={options} value={v} onChange={setV} hint="\u6302\u5728\u89E6\u53D1\u5668\u540E\u9762\u7684\u95EE\u53F7\u63D0\u793A" />`;
var CODE_MODEL_PICKER = `// \u6570\u636E\u6765\u81EA\u5BBF\u4E3B\u6A21\u578B\u76EE\u5F55\uFF08\u5BBF\u4E3B\u4FA7 connectHost(ctx, { modelsPath }) \u6CE8\u5165\uFF09\uFF0C\u4E0D\u80FD\u51ED\u7A7A\u9020
// \u5206\u7EC4\u5F62\u6001\uFF1A\u4E00\u4E2A\u4E0B\u62C9\uFF0C\u4F9B\u5E94\u5546\u505A\u7EC4\u5934
<ModelPicker value={model} onChange={setModel} variant="grouped" />
// \u8054\u52A8\u5F62\u6001\uFF1A\u4E24\u4E2A\u4E0B\u62C9\uFF0C\u5148\u9009\u4F9B\u5E94\u5546\u3001\u6A21\u578B\u5217\u8868\u8DDF\u7740\u7B5B
<ModelPicker value={model} onChange={setModel} variant="cascade" placeholder="\u9009\u62E9\u6A21\u578B" />`;
var CODE_WORKSPACE_PICKER = `// \u9ED8\u8BA4\u5373\u300C\u5DE5\u4F5C\u533A\u300D\u6587\u6848\u4E0E\u6587\u4EF6\u5939\u56FE\u6807\uFF1Bclearable / searchable \u662F\u53EF\u9009\u80FD\u529B
<WorkspacePicker value={ws} onChange={setWs} clearable searchable />`;
var CODE_PICKER_USAGE = `pnpm add dsh-plugin-core

import { Picker, ModelPicker, WorkspacePicker } from 'dsh-plugin-core/ui'

<Picker
  options={[{ value: 'a', label: '\u9009\u9879 A' }, { value: 'b', label: '\u9009\u9879 B' }]}
  value={single}
  onChange={setSingle}
  searchable
  clearable
  placeholder="\u8BF7\u9009\u62E9"
/>

// ModelPicker / WorkspacePicker \u8981\u771F\u5B9E\u6570\u636E\uFF1A
// \u5BBF\u4E3B\u4FA7 connectHost(ctx, { modelsPath }) \u6CE8\u5165\u8FDE\u63A5\uFF0C\u5BA2\u6237\u7AEF\u53EA\u7BA1\u6E32\u67D3`;
var PICKER_API = [
  { name: "options", type: "readonly PickerOption[]", def: "\u2014", descKey: "apiOptions" },
  { name: "groups", type: "readonly PickerGroup[]", def: "\u2014", descKey: "apiGroups" },
  { name: "value", type: "string | string[]", def: "\u2014", descKey: "apiValue" },
  { name: "onChange", type: "(value: string | string[]) => void", def: "\u2014", descKey: "apiOnChange" },
  { name: "mode", type: "'single' | 'multiple'", def: "'single'", descKey: "apiMode" },
  { name: "max", type: "number", def: "\u2014", descKey: "apiMax" },
  { name: "searchable", type: "boolean", def: "false", descKey: "apiSearchable" },
  { name: "clearable", type: "boolean", def: "false", descKey: "apiClearable" },
  { name: "hint", type: "string", def: "\u2014", descKey: "apiHint" },
  { name: "size", type: "'sm' | 'md' | 'lg'", def: "'md'", descKey: "apiSize" }
];
var HOST_PICKER_API = [
  { name: "value", type: "string | string[]", def: "\u2014", descKey: "apiValue" },
  { name: "onChange", type: "(value: string | string[]) => void", def: "\u2014", descKey: "apiOnChange" },
  { name: "variant", type: "'grouped' | 'cascade'", def: "'grouped'", descKey: "apiVariant" },
  { name: "placeholder", type: "string", def: "\u2014", descKey: "apiPlaceholder" },
  { name: "clearable / searchable", type: "boolean", def: "false", descKey: "apiClearable" }
];
function PickerPage() {
  const [single, setSingle] = (0, import_react31.useState)(void 0);
  const [multi, setMulti] = (0, import_react31.useState)([]);
  const [model, setModel] = (0, import_react31.useState)("");
  const [model2, setModel2] = (0, import_react31.useState)("");
  const [ws, setWs] = (0, import_react31.useState)(void 0);
  return (0, import_react31.createElement)(
    "div",
    null,
    (0, import_react31.createElement)(Note, { text: t2("pickerNote") }),
    (0, import_react31.createElement)(
      Example,
      { title: "Picker", hint: t2("pickerHint"), code: CODE_PICKER },
      (0, import_react31.createElement)(
        "div",
        { style: { display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-start" } },
        (0, import_react31.createElement)(Picker, {
          options: ICON_OPTIONS,
          icon: (0, import_react31.createElement)(import_dsh_client_ui_primitives3.IconSparkleRegular, { size: 14 }),
          value: single,
          onChange: (v) => setSingle(v),
          searchable: true,
          clearable: true,
          placeholder: "\u5355\u9009\uFF08icon + \u53EF\u641C\u7D22/\u53EF\u6E05\u9664\uFF09"
        }),
        (0, import_react31.createElement)(Picker, {
          options: ICON_OPTIONS,
          value: single,
          onChange: (v) => setSingle(v),
          placeholder: "\u5355\u9009\uFF08\u65E0\u641C\u7D22\u6846\uFF09"
        }),
        (0, import_react31.createElement)(Picker, {
          groups: [
            { value: "g1", label: "\u7EC4\u4E00", options: ICON_OPTIONS },
            {
              value: "g2",
              label: "\u7EC4\u4E8C",
              options: [
                { value: "d", label: "\u9009\u9879 D", icon: (0, import_react31.createElement)(import_dsh_client_ui_primitives3.IconRefreshOutlineRegular, { size: 14 }) },
                { value: "e", label: "\u9009\u9879 E", icon: (0, import_react31.createElement)(import_dsh_client_ui_primitives3.IconPlusOutlineRegular, { size: 14 }) }
              ]
            }
          ],
          value: multi,
          mode: "multiple",
          max: 2,
          onChange: (v) => setMulti(v),
          searchable: true,
          placeholder: "\u591A\u9009\uFF08\u4E0A\u9650 2\uFF0C\u53EF\u53CD\u9009\uFF09"
        }),
        (0, import_react31.createElement)(Picker, {
          options: [{ value: "x", label: "\u964D\u7EA7\u793A\u4F8B" }],
          degraded: true,
          disabled: true,
          placeholder: "\u964D\u7EA7 + \u7981\u7528"
        }),
        (0, import_react31.createElement)(Picker, {
          options: ICON_OPTIONS,
          value: single,
          onChange: (v) => setSingle(v),
          hint: "\u6302\u5728\u89E6\u53D1\u5668\u540E\u9762\u7684\u95EE\u53F7\u63D0\u793A\uFF0C\u4E0D\u7528\u518D\u624B\u52A8\u62FC FieldHint\u3002",
          placeholder: "\u5355\u9009\uFF08\u5E26 hint\uFF09"
        })
      )
    ),
    (0, import_react31.createElement)(
      Example,
      { title: "ModelPicker\uFF08\u771F\u5B9E\u76EE\u5F55\uFF09", hint: t2("modelPickerHint"), code: CODE_MODEL_PICKER },
      (0, import_react31.createElement)(
        "div",
        { style: { display: "flex", gap: "12px", flexWrap: "wrap" } },
        // ① 分组形态：一个下拉、完全独立，供应商做组头（带「默认模型」选项）
        (0, import_react31.createElement)(ModelPicker, { value: model, onChange: setModel, variant: "grouped" }),
        // ② 联动形态：两个下拉联动，先选供应商、模型列表跟着筛
        (0, import_react31.createElement)(ModelPicker, {
          value: model2,
          onChange: setModel2,
          variant: "cascade",
          placeholder: "\u9009\u62E9\u6A21\u578B"
        })
      )
    ),
    (0, import_react31.createElement)(
      Example,
      { title: "WorkspacePicker\uFF08\u771F\u5B9E\u5217\u8868\uFF09", hint: t2("workspacePickerHint"), code: CODE_WORKSPACE_PICKER },
      (0, import_react31.createElement)(
        "div",
        { style: { display: "flex", gap: "12px", flexWrap: "wrap" } },
        // 默认即我们给的名字（「工作区」）和文件夹图标；自定义文案 / 图标是可选能力，不在演示里铺
        (0, import_react31.createElement)(WorkspacePicker, {
          value: ws,
          onChange: (v) => setWs(v),
          clearable: true,
          searchable: true
        })
      )
    ),
    (0, import_react31.createElement)(CodeOnly, { labelKey: "docUsage", code: CODE_PICKER_USAGE }),
    (0, import_react31.createElement)(ApiTable, { rows: PICKER_API }),
    (0, import_react31.createElement)(ApiTable, { rows: HOST_PICKER_API }),
    (0, import_react31.createElement)(Placeholder, { descKey: "pickerLogicDesc" })
  );
}
var CODE_TOOLTIP = `// label + side / align\uFF1Bchildren \u5FC5\u987B\u662F\u80FD\u6302 ref \u7684\u771F\u5B9E DOM\uFF08\u51FD\u6570\u7EC4\u4EF6\u6302\u4E0D\u4E0A \u21D2 \u65E0\u6C14\u6CE1\uFF09
<Tooltip label="top \xB7 center" side="top" align="center">
  <button type="button">\u60AC\u505C\u6211</button>
</Tooltip>
<Tooltip label="\u5F88\u957F\u7684\u4E00\u6BB5\u8BF4\u660E\uFF0C\u653E\u4E0D\u4E0B\u65F6\u6309 maxWidth \u6298\u884C" side="bottom" maxWidth={240}>
  <span>\u60AC\u505C\u6211</span>
</Tooltip>

// \u4E24\u6BB5\u5F0F\uFF1Alabel \u91CC\u76F4\u63A5\u5199\u6362\u884C
<Tooltip label={'\u4EFB\u52A1\u540D' + String.fromCharCode(10) + '\u4EFB\u52A1\u6B63\u6587'} side="top" maxWidth={260}>
  <span>\u4EFB\u52A1\u540D</span>
</Tooltip>

// \u5BCC\u5361\u7247\uFF1A\u5B98\u65B9 HoverCard\uFF0Ccontent \u6536\u4EFB\u610F ReactNode\uFF1Bcompact \u53D8\u4F53\u80CC\u666F\u6052\u6DF1\uFF0C\u5185\u5BB9\u8272\u81EA\u5DF1\u7ED9
<HoverCard
  variant="compact"
  openDelayMs={200}
  anchor={<span>\u4EFB\u52A1\u540D</span>}
  content={<div style={{ color: 'var(--dsw-static-neutral-bluish-00,#fff)' }}>\u2026</div>}
/>`;
var CODE_TOOLTIP_USAGE = `pnpm add dsh-plugin-core

import { Tooltip, HoverCard } from '@deepseek-ai/dsh-client-ui-primitives'

<Tooltip label="\u89E3\u91CA\u8FD9\u4E2A\u64CD\u4F5C\u4F1A\u53D1\u751F\u4EC0\u4E48" side="right">
  <Button variant="outline">\u4E00\u4E2A\u6309\u94AE</Button>
</Tooltip>

// \u95EE\u53F7\u63D0\u793A\uFF08FieldHint\uFF09\u7528\u7684\u662F\u540C\u4E00\u4E2A\u5B98\u65B9 Tooltip \u672C\u4F53\uFF1A
// \u5BBF\u4E3B\u4FA7 setTooltipRenderer((props) => h(Tooltip, props))\uFF0C\u4E4B\u540E\u6240\u6709\u95EE\u53F7\u6C14\u6CE1\u90FD\u662F\u5B83`;
var TOOLTIP_API = [
  { name: "label", type: "string", def: "\u2014", descKey: "apiText" },
  { name: "side", type: "'top' | 'bottom' | 'right'", def: "'top'", descKey: "apiSide" },
  { name: "align", type: "'center' | 'end'", def: "'center'", descKey: "apiAlign" },
  { name: "maxWidth", type: "number", def: "\u2014", descKey: "apiMaxWidth" },
  { name: "delayMs", type: "number", def: "\u2014", descKey: "apiDelayMs" },
  { name: "portal", type: "boolean", def: "false", descKey: "apiPortal" },
  { name: "children", type: "ReactElement", def: "\u2014", descKey: "apiAnchor" }
];
var HOVERCARD_API = [
  { name: "anchor", type: "ReactNode", def: "\u2014", descKey: "apiAnchor" },
  { name: "content", type: "ReactNode", def: "\u2014", descKey: "apiChildren" },
  { name: "variant", type: "'compact' | 'preview'", def: "'compact'", descKey: "apiVariant" },
  { name: "openDelayMs", type: "number", def: "\u2014", descKey: "apiDelayMs" }
];
function TooltipPage() {
  return (0, import_react31.createElement)(
    "div",
    null,
    (0, import_react31.createElement)(Note, { text: t2("tooltipNote") }),
    (0, import_react31.createElement)(
      Example,
      { title: t2("tooltipTitle"), hint: t2("tooltipHint"), code: CODE_TOOLTIP },
      (0, import_react31.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "12px" } },
        (0, import_react31.createElement)(
          Labeled,
          { label: t2("tooltipAnchorButton") },
          tipAnchor("top \xB7 center", "top", "center"),
          tipAnchor("top \xB7 end", "top", "end"),
          tipAnchor("bottom \xB7 center", "bottom", "center"),
          tipAnchor("bottom \xB7 end", "bottom", "end"),
          tipAnchor("right", "right")
        ),
        (0, import_react31.createElement)(
          Labeled,
          { label: t2("tooltipAnchorText") },
          (0, import_react31.createElement)(
            import_dsh_client_ui_primitives3.Tooltip,
            { label: t2("tooltipHint"), side: "top" },
            (0, import_react31.createElement)("span", {
              style: { borderBottom: "1px dashed var(--dshpc-border-strong)", cursor: "pointer", fontSize: "13px" }
            }, t2("tooltipAnchorText"))
          ),
          (0, import_react31.createElement)(
            import_dsh_client_ui_primitives3.Tooltip,
            { label: t2("tooltipLongText"), side: "bottom", maxWidth: 240 },
            (0, import_react31.createElement)("span", {
              style: { borderBottom: "1px dashed var(--dshpc-border-strong)", cursor: "pointer", fontSize: "13px" }
            }, t2("tooltipLong"))
          )
        ),
        // 两段式：第一行名字（短）、\n 真实换行、第二行正文（长，受 maxWidth 折行）
        (0, import_react31.createElement)(
          Labeled,
          { label: t2("tooltipMultiline") },
          (0, import_react31.createElement)(
            import_dsh_client_ui_primitives3.Tooltip,
            { label: `${t2("tooltipName")}
${t2("tooltipLongText")}`, side: "top", maxWidth: 260 },
            (0, import_react31.createElement)("span", {
              style: { borderBottom: "1px dashed var(--dshpc-border-strong)", cursor: "pointer", fontSize: "13px" }
            }, t2("tooltipName"))
          )
        ),
        // 富卡片：官方 HoverCard（宿主工作区列表那种「标题 + 正文」卡就是它）；content 收任意 ReactNode
        (0, import_react31.createElement)(
          Labeled,
          { label: t2("tooltipRich") },
          (0, import_react31.createElement)(import_dsh_client_ui_primitives3.HoverCard, {
            variant: "compact",
            openDelayMs: 200,
            anchor: (0, import_react31.createElement)("span", {
              style: { borderBottom: "1px dashed var(--dshpc-border-strong)", cursor: "pointer", fontSize: "13px" }
            }, t2("tooltipName")),
            // ⚠️ 官方 HoverCard 的 compact 变体（.card）背景是硬编码 `#2C2C2E` 且**不设 color**
            // （来源见 docs/design/external/dsh-host.md §10），卡片又被 portal 到 document.body，
            // 文字色因此退化成继承：亮色下继承到近黑 ⇒ 黑字压深底。背景恒深 ⇒ 内容色必须由调用方给，
            // 这里取官方 Tooltip 在同一个深底场景用的常量 `--dsw-static-neutral-bluish-00`（#fff）。
            content: (0, import_react31.createElement)(
              "div",
              {
                style: {
                  padding: "4px 2px",
                  minWidth: "220px",
                  color: "var(--dsw-static-neutral-bluish-00,#fff)"
                }
              },
              (0, import_react31.createElement)("div", { style: { fontWeight: 600, fontSize: "14px", marginBottom: "4px" } }, t2("tooltipName")),
              (0, import_react31.createElement)("div", { style: { fontSize: "12px", lineHeight: 1.6, whiteSpace: "pre-line", opacity: 0.78 } }, t2("tooltipLongText"))
            )
          })
        )
      )
    ),
    (0, import_react31.createElement)(CodeOnly, { labelKey: "docUsage", code: CODE_TOOLTIP_USAGE }),
    (0, import_react31.createElement)(ApiTable, { rows: TOOLTIP_API }),
    (0, import_react31.createElement)(ApiTable, { rows: HOVERCARD_API })
  );
}
var CODE_CARD = `// Card\uFF1Asurface \u5E95 + 1px \u8FB9\u6846 + \u5706\u89D2\uFF1Baction \u91CC\u88F8\u653E\u4E00\u4E2A\u5143\u7D20\u4E5F\u5782\u76F4\u5C45\u4E2D
<Card
  accent="business"
  action={<span style={{ color: 'var(--dshpc-fg-3)', fontSize: 'var(--dshpc-font-xs)' }}>2026-10-18 \u521B\u5EFA</span>}
>
  <div style={{ fontWeight: 600 }}>\u5C06 OpenSSH \u4E0A\u6240\u6709 NPM \u5B89\u88C5\u8FC1\u79FB\u5230 PNPM</div>
  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
    <Chip>#npm</Chip>
    <Chip>#\u8FC1\u79FB</Chip>
  </div>
</Card>

// accent \u4E94\u6863\uFF1Abusiness / success / warning / danger / neutral\uFF08\u6216\u4EFB\u610F CSS \u8272\u503C\uFF09
<Card accent="warning"><div>\u2026</div></Card>`;
var CODE_STRIP_CARD = `// StripCard\uFF1A\u540C\u8272\u7CFB\u6D45\u5E95 + \u65B9\u89D2 + \u5DE6\u7F18 4px \u901A\u9AD8\u8272\u6761\uFF08\u5907\u6CE8\u6846\u3001\u6267\u884C\u8BB0\u5F55\u6761\u540C\u6B3E\uFF09
<StripCard
  accent="success"
  action={<Button size="sm" variant="outline">Cancel</Button>}
>
  <div style={{ fontWeight: 600 }}>\u6267\u884C\u6210\u529F</div>
  <div style={{ color: 'var(--dshpc-fg-3)', fontSize: 'var(--dshpc-font-xs)' }}>\u8017\u65F6 12s \xB7 3 \u4E2A\u6587\u4EF6\u53D8\u66F4</div>
</StripCard>`;
var CODE_SECTION_HEAD = `// \u5206\u533A\u6807\u9898\uFF1Aicon + \u6807\u9898 + \u53F3\u4FA7\u64CD\u4F5C\u533A\u4E09\u6BB5\u5F0F\uFF1B\u6807\u9898\u540E\u7F00\u53EF\u4EE5\u662F\u8BA1\u6570 / \u5F69\u8272\u6807\u7B7E / \u5C0F\u5B57\u8BF4\u660E
<SectionHead
  icon={<IconSparkleRegular size={16} />}
  title={<span>\u5168\u90E8\u5F85\u529E <span style={{ fontSize: 'var(--dshpc-font-xs)', color: 'var(--dshpc-fg-3)' }}>22</span></span>}
  right={[
    <Segmented variant="inset" items={[{ value: 'all', label: '\u5168\u90E8', count: 22 }]} value={seg} onChange={setSeg} />,
    <div style={{ width: 192 }}><Input value={kw} onChange={setKw} placeholder="\u641C\u7D22" /></div>,
  ]}
/>`;
var CODE_CARD_USAGE = `pnpm add dsh-plugin-core

import { Card, StripCard, SectionHead } from 'dsh-plugin-core/ui'

// \u5907\u6CE8\u6846\u3001\u6267\u884C\u8BB0\u5F55\u6761\uFF1AStripCard\uFF08\u6D45\u5E95 + \u5DE6\u8272\u6761\uFF09
<StripCard accent="business"><div>\u6807\u9898 + \u5185\u5BB9</div></StripCard>

// \u666E\u901A\u5361\u7247\uFF1ACard\uFF08surface \u5E95 + \u8FB9\u6846 + \u5706\u89D2\uFF09
<Card accent="business" action={<Button size="sm" variant="ghost">\u67E5\u770B\u4F1A\u8BDD</Button>}>
  <div>\u6807\u9898 + \u5185\u5BB9</div>
</Card>`;
var CARD_API = [
  { name: "accent", type: "CardAccent | string", def: "'business'", descKey: "apiAccent" },
  { name: "expanded", type: "boolean", def: "false", descKey: "apiExpanded" },
  { name: "onToggle", type: "() => void", def: "\u2014", descKey: "apiOnToggle" },
  { name: "action", type: "ReactNode", def: "\u2014", descKey: "apiAction" },
  { name: "panel", type: "ReactNode", def: "\u2014", descKey: "apiPanel" },
  { name: "children", type: "ReactNode", def: "\u2014", descKey: "apiChildren" }
];
var SECTION_HEAD_API = [
  { name: "icon", type: "ReactNode", def: "\u2014", descKey: "apiIcon" },
  { name: "title", type: "ReactNode", def: "\u2014", descKey: "apiText" },
  { name: "right", type: "ReactNode | ReactNode[]", def: "\u2014", descKey: "apiAction" }
];
function CardPage() {
  const [seg, setSeg] = (0, import_react31.useState)("all");
  const [kw, setKw] = (0, import_react31.useState)("");
  return (0, import_react31.createElement)(
    "div",
    null,
    (0, import_react31.createElement)(Note, { text: t2("cardNote") }),
    (0, import_react31.createElement)(
      Example,
      { title: t2("demoCardTitle"), hint: t2("cardHint"), code: CODE_CARD },
      (0, import_react31.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "10px", maxWidth: "640px" } },
        // 真实形态示例（任务卡同款排版）：右侧元信息走 action 槽 ⇒ 外壳自动垂直居中
        (0, import_react31.createElement)(
          Card,
          {
            accent: "business",
            action: (0, import_react31.createElement)("span", { style: { color: "var(--dshpc-fg-3)", fontSize: "var(--dshpc-font-xs)", flex: "none" } }, "2026-10-18 \u521B\u5EFA")
          },
          (0, import_react31.createElement)(
            "div",
            { style: { fontWeight: 600, flex: "1 1 auto", minWidth: 0, fontSize: "var(--dshpc-font-md)" } },
            "\u5C06 OpenSSH \u4E0A\u6240\u6709 NPM \u5B89\u88C5\u8FC1\u79FB\u5230 PNPM"
          ),
          (0, import_react31.createElement)(
            "div",
            { style: { display: "flex", alignItems: "center", gap: "6px", marginTop: "6px", flexWrap: "wrap" } },
            (0, import_react31.createElement)(Chip, null, "NAS-Docker"),
            (0, import_react31.createElement)(Chip, null, "#npm"),
            (0, import_react31.createElement)(Chip, null, "#pnpm"),
            (0, import_react31.createElement)(Chip, null, "#OpenSSH"),
            (0, import_react31.createElement)(Chip, null, "#\u8FC1\u79FB")
          )
        ),
        // action 里裸放一个 button：不套容器也垂直居中；框内排版由调用方自定
        (0, import_react31.createElement)(
          Card,
          {
            accent: "business",
            action: (0, import_react31.createElement)(Button, { size: "sm", variant: "ghost" }, "\u67E5\u770B\u4F1A\u8BDD")
          },
          (0, import_react31.createElement)("div", { style: { fontWeight: 600, fontSize: "var(--dshpc-font-md)" } }, "DAY:1 - Docker \u955C\u50CF\u7248\u672C\u68C0\u67E5\u5668"),
          (0, import_react31.createElement)("div", { style: { color: "var(--dshpc-fg-3)", fontSize: "var(--dshpc-font-xs)", marginTop: "4px" } }, "NAS-Docker \xB7 \u8BA1\u5212 02:00 \xB7 \u5B9E\u9645 02:00 \xB7 \u65F6\u957F 04:02")
        ),
        // accent 速览：单行紧凑卡，只看色条档位
        (0, import_react31.createElement)(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" } },
          ["business", "success", "warning", "danger", "neutral"].map(
            (a) => (0, import_react31.createElement)(
              Card,
              { key: a, accent: a, style: { padding: "8px 12px" } },
              (0, import_react31.createElement)("div", { style: { fontSize: "var(--dshpc-font-sm)", color: "var(--dshpc-fg-2)" } }, `accent="${a}"`)
            )
          )
        )
      )
    ),
    (0, import_react31.createElement)(
      Example,
      { title: t2("demoStripTitle"), hint: t2("stripHint"), code: CODE_STRIP_CARD },
      (0, import_react31.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "4px", maxWidth: "640px" } },
        (0, import_react31.createElement)(
          StripCard,
          {
            accent: "business",
            action: (0, import_react31.createElement)("span", { style: { color: "var(--dshpc-fg-3)", fontSize: "var(--dshpc-font-xs)", flex: "none" } }, "2026-10-18 \u5F00\u59CB \xB7 \u4ECA\u5929")
          },
          (0, import_react31.createElement)("div", { style: { fontWeight: 600, fontSize: "var(--dshpc-font-md)" } }, "DAY:1 - Docker \u955C\u50CF\u7248\u672C\u68C0\u67E5\u5668"),
          (0, import_react31.createElement)(
            "div",
            { style: { display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", flexWrap: "wrap" } },
            (0, import_react31.createElement)(Chip, null, "NAS-Docker"),
            (0, import_react31.createElement)(
              "span",
              { style: { color: "var(--dshpc-fg-3)", fontSize: "var(--dshpc-font-xs)" } },
              "\u8BA1\u5212 02:00 \xB7 \u5B9E\u9645 02:00 \xB7 \u65F6\u957F 04:02 \xB7 2.4M"
            )
          )
        ),
        (0, import_react31.createElement)(
          StripCard,
          {
            accent: "success",
            // 右侧裸放一个描边钮（outline, sm=24px）：不套容器也垂直居中
            action: (0, import_react31.createElement)(Button, { size: "sm", variant: "outline" }, "Cancel")
          },
          (0, import_react31.createElement)("div", { style: { fontWeight: 600, fontSize: "var(--dshpc-font-md)" } }, "\u6267\u884C\u6210\u529F"),
          (0, import_react31.createElement)("div", { style: { color: "var(--dshpc-fg-3)", fontSize: "var(--dshpc-font-xs)", marginTop: "4px" } }, "\u8017\u65F6 12s \xB7 3 \u4E2A\u6587\u4EF6\u53D8\u66F4")
        ),
        // accent 速览：单行紧凑卡，只看色条档位（与 Card 节同款）
        (0, import_react31.createElement)(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" } },
          ["business", "success", "warning", "danger", "neutral"].map(
            (a) => (0, import_react31.createElement)(
              StripCard,
              { key: a, accent: a, style: { padding: "8px 12px 8px 20px" } },
              (0, import_react31.createElement)("div", { style: { fontSize: "var(--dshpc-font-sm)", color: "var(--dshpc-fg-2)" } }, `accent="${a}"`)
            )
          )
        )
      )
    ),
    (0, import_react31.createElement)(
      Example,
      { title: t2("sectionHeadTitle"), hint: "\u5206\u533A\u6807\u9898\uFF1Aicon + \u6807\u9898 + \u53F3\u4FA7\u64CD\u4F5C\u533A\u4E09\u6BB5\u5F0F\u2014\u2014\u7EAF\u6392\u7248\u58F3\uFF0Cicon/\u6807\u9898/\u53F3\u4FA7\u90FD\u8C03\u7528\u65B9\u81EA\u5B9A\uFF1B\u4E0B\u793A 3 \u7EC4\uFF1A\u4E0D\u540C\u56FE\u6807 / \u6807\u9898\u540E\u7F00\uFF08\u8BA1\u6570\xB7\u5F69\u8272\u6807\u7B7E\xB7\u5C0F\u5B57\u8BF4\u660E\uFF09/ \u4E24\u79CD\u53F3\u4FA7\u7EC4\u5408", code: CODE_SECTION_HEAD },
      (0, import_react31.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "8px" } },
        // A：sparkle 图标 + “全部待办”后缀计数 + 右侧过滤组（滑轨 + 搜索框）
        (0, import_react31.createElement)(SectionHead, {
          icon: (0, import_react31.createElement)(import_dsh_client_ui_primitives3.IconSparkleRegular, { size: 16 }),
          title: (0, import_react31.createElement)(
            "span",
            { style: { display: "inline-flex", alignItems: "baseline", gap: "6px" } },
            "\u5168\u90E8\u5F85\u529E",
            (0, import_react31.createElement)("span", { style: { fontSize: "var(--dshpc-font-xs)", color: "var(--dshpc-fg-3)", fontWeight: 400 } }, "22")
          ),
          right: [
            (0, import_react31.createElement)(Segmented, {
              variant: "inset",
              items: [
                { value: "all", label: t2("segAll"), count: 22 },
                { value: "doing", label: t2("segDoing"), count: 11 },
                { value: "claimed", label: t2("segClaimed"), count: 11 },
                { value: "backlog", label: "\u79EF\u538B" },
                { value: "overdue", label: "\u903E\u671F", count: 4 },
                { value: "stalled", label: "\u505C\u6EDE", count: 8 }
              ],
              value: seg,
              onChange: setSeg
            }),
            // 搜索框 192px 定宽（兄弟项目 SEARCH_WIDTH 同款），外面套 div 控宽
            (0, import_react31.createElement)(
              "div",
              { style: { width: "192px", flex: "none" } },
              (0, import_react31.createElement)(Input, { value: kw, onChange: setKw, placeholder: "\u641C\u7D22" })
            )
          ]
        }),
        // B：clock 图标 + “我的待办” + 彩色标签 + 右侧单个操作钮
        (0, import_react31.createElement)(SectionHead, {
          icon: (0, import_react31.createElement)(import_dsh_client_ui_primitives3.IconClockOutlineRegular, { size: 16 }),
          title: (0, import_react31.createElement)(
            "span",
            { style: { display: "inline-flex", alignItems: "center", gap: "6px" } },
            "\u6211\u7684\u5F85\u529E",
            (0, import_react31.createElement)(Chip, { tone: "success", size: "xs" }, "\u6700\u65B0")
          ),
          right: (0, import_react31.createElement)(Button, { size: "sm", variant: "ghost" }, "\u5237\u65B0")
        }),
        // C：refresh 图标 + “已归档” + 小字说明 + 右侧操作组（两个钮）
        (0, import_react31.createElement)(SectionHead, {
          icon: (0, import_react31.createElement)(import_dsh_client_ui_primitives3.IconRefreshOutlineRegular, { size: 16 }),
          title: (0, import_react31.createElement)(
            "span",
            { style: { display: "inline-flex", alignItems: "baseline", gap: "6px" } },
            "\u5DF2\u5F52\u6863",
            (0, import_react31.createElement)("span", { style: { fontSize: "var(--dshpc-font-xs)", color: "var(--dshpc-fg-3)", fontWeight: 400 } }, "\u5171 8 \u6761")
          ),
          right: [
            (0, import_react31.createElement)(Button, { size: "sm", variant: "ghost" }, "\u64CD\u4F5C"),
            (0, import_react31.createElement)(Button, { size: "sm", variant: "secondary" }, "\u8BBE\u7F6E")
          ]
        })
      )
    ),
    (0, import_react31.createElement)(CodeOnly, { labelKey: "docUsage", code: CODE_CARD_USAGE }),
    (0, import_react31.createElement)(ApiTable, { rows: CARD_API }),
    (0, import_react31.createElement)(ApiTable, { rows: SECTION_HEAD_API })
  );
}
var CODE_CHIP = `// tone \u4E94\u6863 + size \u4E09\u6863\uFF1B\u5C3A\u5BF8\u884C\u56FA\u5B9A\u7531\u5927\u5230\u5C0F\uFF08md \u2192 sm \u2192 xs\uFF09\uFF0C\u540C\u6863\u6587\u6848\u4E0D\u6DF7\u6392
<Chip size="md" tone="warning">\u903E\u671F</Chip>
<Chip size="sm" tone="danger">\u505C\u6EDE</Chip>
<Chip size="xs" tone="success">\u5B8C\u6210</Chip>

// \u4E2D\u6027 # \u6807\u7B7E\uFF08\u8BED\u8A00\u65E0\u5173\uFF09\uFF1B\u4F20 onClick \u624D\u6E32\u67D3\u6210 button
<Chip>#npm</Chip>
<Chip onClick={() => showToast('\u70B9\u4E86 chip')}>#\u53EF\u70B9</Chip>`;
var CODE_MARQUEE = `// \u5916\u5C42\u88C1\u526A\u3001\u5185\u5C42\u6EDA\u52A8\uFF1A\u653E\u4E0D\u4E0B\u624D\u6EDA\uFF0Chover \u4E00\u904D\u505C\u5728\u5C3E\u5B57\uFF0C\u79FB\u5F00\u590D\u4F4D\u6210\u7701\u7565\u53F7
<MarqueeText text="\u8FD9\u662F\u4E00\u6BB5\u5F88\u957F\u7684\u6587\u5B57\uFF0C\u653E\u4E0D\u4E0B\u65F6 hover \u4F1A\u6EDA\u52A8\u5C55\u793A\u5168\u540D" />`;
var CODE_LIVE = `// \u8BA2\u9605\u5185\u90E8\u8282\u62CD\u5668\uFF0C\u8D70\u65F6\u5185\u5BB9\u8C03\u7528\u65B9\u6E32\u67D3
<LiveText render={(nowMs) => new Date(nowMs).toLocaleTimeString()} />`;
var CODE_EMPTY = `// \u4E1A\u52A1\u7A7A\u6001\uFF1A\u53EF\u6302\u4E00\u4E2A\u64CD\u4F5C\u6309\u94AE
<EmptyState text="\u6682\u65E0\u6570\u636E" action={<Button size="sm" variant="outline">\u91CD\u8BD5</Button>} />`;
var CODE_CHIP_USAGE = `pnpm add dsh-plugin-core

import { Chip, MarqueeText, LiveText, EmptyState } from 'dsh-plugin-core/ui'

<Chip tone="success">\u5B8C\u6210</Chip>
<Chip onClick={openTask}>#\u53EF\u70B9</Chip>
<MarqueeText text={taskTitle} />`;
var CHIP_API = [
  { name: "children", type: "ReactNode", def: "\u2014", descKey: "apiChildren" },
  { name: "tone", type: "'neutral' | 'business' | 'success' | 'warning' | 'danger'", def: "'neutral'", descKey: "apiTone" },
  { name: "size", type: "'xs' | 'sm' | 'md'", def: "'sm'", descKey: "apiSize" },
  { name: "onClick", type: "() => void", def: "\u2014", descKey: "apiOnClick" }
];
var TEXT_KIT_API = [
  { name: "MarqueeText \xB7 text", type: "string", def: "\u2014", descKey: "apiText" },
  { name: "LiveText \xB7 render", type: "(nowMs: number) => ReactNode", def: "\u2014", descKey: "apiRender" },
  { name: "EmptyState \xB7 text", type: "ReactNode", def: "\u300C\u6682\u65E0\u6570\u636E\u300D", descKey: "apiText" },
  { name: "EmptyState \xB7 action", type: "ReactNode", def: "\u2014", descKey: "apiAction" }
];
function ChipPage() {
  return (0, import_react31.createElement)(
    "div",
    null,
    (0, import_react31.createElement)(Note, { text: t2("chipNote") }),
    (0, import_react31.createElement)(
      Example,
      { title: "Chip", hint: t2("chipHint"), code: CODE_CHIP },
      (0, import_react31.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "12px" } },
        ...["md", "sm", "xs"].map(
          (sz) => (0, import_react31.createElement)(
            "div",
            { key: sz, style: { display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" } },
            (0, import_react31.createElement)(Chip, { size: sz, tone: "warning" }, t2("chipOverdue")),
            (0, import_react31.createElement)(Chip, { size: sz, tone: "danger" }, t2("chipStalled")),
            (0, import_react31.createElement)(Chip, { size: sz, tone: "success" }, t2("chipDone")),
            (0, import_react31.createElement)(Chip, { size: sz, tone: "business" }, t2("chipDoing")),
            (0, import_react31.createElement)(Chip, { size: sz }, `Tag ${sz.toUpperCase()}`)
          )
        ),
        // 中性 # 标签（语言无关）+ 长文字回归样
        (0, import_react31.createElement)(
          "div",
          { style: { display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" } },
          (0, import_react31.createElement)(Chip, null, "#npm"),
          (0, import_react31.createElement)(Chip, null, "#\u6784\u5EFA"),
          (0, import_react31.createElement)(Chip, { onClick: () => showToast("\u70B9\u4E86 chip") }, "#\u53EF\u70B9"),
          (0, import_react31.createElement)(Chip, null, "\u4E00\u6574\u6BB5\u6BD4\u8F83\u957F\u7684\u6807\u7B7E\u6587\u5B57\uFF0C\u5BBD\u5EA6\u5E94\u8BE5\u8DDF\u7740\u6587\u5B57\u8D70")
        )
      )
    ),
    (0, import_react31.createElement)(
      Example,
      { title: t2("marqueeTitle"), hint: "\u53CC\u5C42\u7ED3\u6784\uFF1A\u5916\u5C42\u88C1\u526A\u3001\u5185\u5C42\u6EDA\u52A8\uFF1B\u8DD1\u4E00\u904D\u505C\u5728\u5C3E\u5B57\uFF0C\u9F20\u6807\u79FB\u5F00\u590D\u4F4D\u6210\u7701\u7565\u53F7", code: CODE_MARQUEE },
      (0, import_react31.createElement)(
        "div",
        { style: { maxWidth: "200px" } },
        (0, import_react31.createElement)(MarqueeText, { text: "\u8FD9\u662F\u4E00\u6BB5\u5F88\u957F\u7684\u6587\u5B57\uFF0C\u653E\u4E0D\u4E0B\u65F6 hover \u4F1A\u6EDA\u52A8\u5C55\u793A\u5168\u540D" })
      )
    ),
    (0, import_react31.createElement)(
      Example,
      { title: t2("liveTitle"), hint: "\u8BA2\u9605\u5185\u90E8\u8282\u62CD\u5668\uFF0C\u8D70\u65F6 Ui \u7531\u8C03\u7528\u65B9\u6E32\u67D3", code: CODE_LIVE },
      (0, import_react31.createElement)(LiveText, { render: (nowMs) => new Date(nowMs).toLocaleTimeString() })
    ),
    (0, import_react31.createElement)(
      Example,
      { title: t2("emptyStateTitle"), hint: "\u4E1A\u52A1\u7A7A\u6001\uFF1A\u65E0\u6570\u636E\u65F6\u7684\u5360\u4F4D\uFF0C\u53EF\u6302\u4E00\u4E2A\u64CD\u4F5C\u6309\u94AE", code: CODE_EMPTY },
      (0, import_react31.createElement)(EmptyState, { text: "\u6682\u65E0\u6570\u636E" })
    ),
    (0, import_react31.createElement)(CodeOnly, { labelKey: "docUsage", code: CODE_CHIP_USAGE }),
    (0, import_react31.createElement)(ApiTable, { rows: CHIP_API }),
    (0, import_react31.createElement)(ApiTable, { rows: TEXT_KIT_API })
  );
}
var CODE_HOST_MODAL = `// \u5BBF\u4E3B\u539F\u751F\u5F39\u7A97\uFF1A\u7EC4\u4EF6\u76F4\u63A5\u7528\u5B98\u65B9 Modal\uFF08\u906E\u7F69/\u5934\u90E8/\u5173\u95ED\u53C9\u5168\u5F52\u5BBF\u4E3B\u7BA1\uFF09
import { Modal } from '@deepseek-ai/dsh-client-ui-primitives'

<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="\u5BBF\u4E3B\u539F\u751F\u5F39\u7A97"
  closeLabel="\u5173\u95ED"
  description="\u6B63\u6587\u533A\u585E\u4EFB\u610F\u5185\u5BB9\uFF0Cfooter \u4EFB\u610F\u6309\u94AE\u7EC4\u5408\u3002"
  footer={
    <>
      <Button variant="outline">\u53D6\u6D88</Button>
      <Button variant="danger">\u5220\u9664</Button>
    </>
  }
>
  <Input value={text} onChange={setText} placeholder="\u81EA\u5B9A\u4E49\u8F93\u5165\u6846\uFF08\u6765\u81EA core \u63A7\u4EF6\uFF09" />
</Modal>

// \u547D\u4EE4\u5F0F\uFF1A\u52A0 skin:"host" \u8D70\u540C\u4E00\u4E2A\u5B98\u65B9 Modal\uFF0C\u8FD4\u56DE Promise
const ok = await confirmModal({
  title: '\u5BBF\u4E3B\u786E\u8BA4\u6846', message: '\u5B98\u65B9 Modal \u5F39\u51FA\u7684\u786E\u8BA4\uFF08danger\uFF09',
  tone: 'danger', confirmText: '\u5220\u9664', cancelText: '\u518D\u60F3\u60F3', skin: 'host',
})
await alertModal({ title: '\u5BBF\u4E3B\u63D0\u793A', message: '\u5173\u95ED\u5373\u786E\u8BA4', skin: 'host' })`;
var CODE_SMALL_MODAL = `// \u6211\u4EEC\u7684\u6807\u51C6\u5C0F\u6846\uFF1A\u540D\u5B57\u5E26 Modal \u540E\u7F00\uFF0C\u4E0D\u8986\u76D6\u5BBF\u4E3B\u539F\u751F
<AlertModal
  severity="warning"
  title="\u64CD\u4F5C\u7ED3\u679C"
  message="\u8FD9\u662F\u4E00\u6761\u8BF4\u660E\u6587\u5B57\uFF1AAlertModal \u7528\u4E8E\u53EA\u9700\u4E00\u4E2A\u786E\u8BA4\u52A8\u4F5C\u7684\u63D0\u793A\u573A\u666F\u3002"
  onConfirm={() => setOpen(false)}
/>
<ConfirmModal
  title="\u5220\u9664\u4EFB\u52A1"
  message="\u5220\u9664\u540E\u4E0D\u53EF\u6062\u590D\uFF0C\u786E\u5B9A\u8981\u5220\u9664\u5417\uFF1F"
  tone="danger"
  confirmText="\u5220\u9664"
  cancelText="\u518D\u60F3\u60F3"
  onConfirm={() => {}}
  onCancel={() => {}}
/>

// \u547D\u4EE4\u5F0F\uFF08Promise\uFF0C\u4E0D\u7528\u7BA1\u5F00\u5173\u72B6\u6001\uFF09
if (await confirmModal({ title: '\u786E\u8BA4\u63D0\u4EA4', message: '\u63D0\u4EA4\u540E\u4E0D\u53EF\u64A4\u9500', tone: 'danger' })) {
  // \u7528\u6237\u70B9\u4E86\u786E\u8BA4
}
await alertModal({ title: '\u63D0\u793A', message: '\u8FD9\u662F\u547D\u4EE4\u5F0F alert\uFF0C\u5173\u95ED\u5373\u786E\u8BA4' })`;
var CODE_LARGE_MODAL = `// \u5185\u5BB9\u5F39\u7A97\uFF1Asize md / lg\uFF0C\u627F\u8F7D\u4EFB\u610F\u5185\u5BB9\uFF08\u4E0D\u662F\u300C\u786E\u5B9A/\u53D6\u6D88\u300D\u547D\u4EE4\u5F0F\uFF09
<Modal title="\u4EFB\u52A1\u8BE6\u60C5" onClose={close} footer={<Button variant="primary">\u77E5\u9053\u4E86</Button>}>
  <div>\u5F39\u7A97\u4E3B\u4F53\u5185\u5BB9\u2014\u2014\u4F1A\u8BDD\u9884\u89C8\u8FD9\u7C7B\u529F\u80FD\u5C31\u7528\u5B83\u6765\u627F\u8F7D\u3002</div>
</Modal>

// lg + headerActions\uFF08\u53F3\u4E0A\u89D2\uFF09+ \u53EF\u6EDA\u52A8\u5185\u5BB9
<Modal
  size="lg"
  title="\u4F1A\u8BDD\u8BB0\u5F55"
  headerActions={<Button variant="outline" size="sm">\u66F4\u591A</Button>}
  onClose={close}
  footer={<><Button variant="outline">\u5173\u95ED</Button><Button variant="primary">\u5B8C\u6210</Button></>}
>
  {items.map((it) => <div key={it.id}>{it.title}</div>)}
</Modal>

// \u65E0 footer\u3001\u5934\u90E8\u81EA\u5B9A\u4E49\u6392\u6CD5\uFF1Atitle \u6536 ReactNode
<Modal
  size="lg"
  title={<><b>\u4EFB\u52A1\u8BE6\u60C5</b><span className="dshpc-modal__sid">sid-2026-1020-7f3a \xB7 5 \u4E2A\u6B65\u9AA4</span></>}
  onClose={close}
>
  <div>\u8FD9\u91CC\u6574\u4E2A\u5F39\u7A97\u90FD\u7531\u8C03\u7528\u65B9\u81EA\u5DF1\u5B9A\u4E49\u3002</div>
</Modal>`;
var CODE_TOAST_NATIVE = `// showToast\uFF1ASonner \u539F\u5473\uFF08\u5BF9\u6BD4\u7528\uFF09
showToast('\u5DF2\u4FDD\u5B58')
showToast('\u4FDD\u5B58\u6210\u529F', { variant: 'success' })
showToast('\u4FDD\u5B58\u5931\u8D25', { variant: 'error' })
showToast('\u6574\u6761\u81EA\u5B9A\u4E49\u8272', { color: '#7c3aed' })
showToast('\u6D88\u5931\u540E\u56DE\u8C03', { onDismiss: () => {} })
showToast('\u9876\u90E8-\u5DE6', { position: 'top-left' })`;
var CODE_TOAST_HOST = `// showHostToast\uFF1A\u76F4\u63A5\u5305\u5B98\u65B9 Toast\uFF08\u9876\u90E8\u6A2A\u5E45\uFF09
showHostToast('\u8FD9\u662F\u5BBF\u4E3B\u539F\u751F\u63D0\u793A')
showHostToast('\u64CD\u4F5C\u6210\u529F', { tone: 'success' })
showHostToast('\u6709\u52A8\u4F5C\u7684\u539F\u751F\u63D0\u793A', { actions: [{ text: '\u67E5\u770B', onClick: () => {} }] })`;
var CODE_TOAST_NOTIFY = `// notify\uFF1A\u7EDF\u4E00\u7070/\u7EFF/\u7EA2/\u9EC4 + \u53F3\u4FA7\u6211\u4EEC\u81EA\u5DF1\u7684\u6309\u94AE\uFF08\u9879\u76EE\u5185\u63A8\u8350\uFF09
notify('\u5DF2\u4FDD\u5B58\u8349\u7A3F')
notify('\u4FDD\u5B58\u6210\u529F', { variant: 'success' })
notify('\u78C1\u76D8\u7A7A\u95F4\u4E0D\u8DB3', { variant: 'warning', description: '\u6E05\u7406\u540E\u91CD\u8BD5' })
notify('\u5DF2\u5220\u9664\u8BE5\u6587\u4EF6', {
  variant: 'success',
  description: '\u53EF\u5728 10 \u79D2\u5185\u64A4\u9500',
  actions: [{ text: '\u64A4\u9500', variant: 'outline', onClick: () => {} }],
})
notify('\u786E\u8BA4\u63D0\u4EA4\u5417\uFF1F', {
  description: '\u63D0\u4EA4\u540E\u5C06\u901A\u77E5\u76F8\u5173\u6210\u5458',
  actions: [
    { text: '\u53D6\u6D88', variant: 'outline', onClick: () => {} },
    { text: '\u63D0\u4EA4', variant: 'primary', onClick: () => {} },
  ],
})`;
var CODE_FEEDBACK_USAGE = `pnpm add dsh-plugin-core

import {
  Modal, AlertModal, ConfirmModal,
  alertModal, confirmModal,
  notify, showToast, showHostToast,
} from 'dsh-plugin-core/ui'

// \u53EA\u95EE\u4E00\u53E5\uFF1A\u547D\u4EE4\u5F0F + Promise\uFF0C\u4E0D\u7528\u7BA1\u5F00\u5173\u72B6\u6001
const ok = await confirmModal({ title: '\u786E\u8BA4\u63D0\u4EA4', message: '\u63D0\u4EA4\u540E\u4E0D\u53EF\u64A4\u9500', tone: 'danger' })

// \u8981\u88C5\u5185\u5BB9\u7684\u5F39\u7A97\uFF1A\u7EC4\u4EF6\u5F0F
<Modal title="\u4EFB\u52A1\u8BE6\u60C5" onClose={close} size="lg">\u2026</Modal>

// \u63D0\u793A\uFF1Anotify \u662F\u9879\u76EE\u5185\u63A8\u8350\uFF08\u7EDF\u4E00\u5361\u7247 + \u6211\u4EEC\u81EA\u5DF1\u7684\u6309\u94AE\uFF09
notify('\u5DF2\u4FDD\u5B58\u8349\u7A3F', { actions: [{ text: '\u64A4\u9500', onClick: undo }] })

// \u8981\u5B98\u65B9Toast \u5C31\u7528 showHostToast\uFF1BshowToast \u662F Sonner \u539F\u5473\uFF0C\u4EC5\u5BF9\u6BD4\u7528`;
var MODAL_API = [
  { name: "title", type: "string | ReactNode", def: "\u2014", descKey: "apiTitle" },
  { name: "message", type: "string", def: "\u2014", descKey: "apiMessage" },
  { name: "severity", type: "'info' | 'success' | 'warning' | 'error'", def: "'info'", descKey: "apiSeverity" },
  { name: "tone", type: "'primary' | 'danger' | 'warning'", def: "'primary'", descKey: "apiToneModal" },
  { name: "confirmText / cancelText", type: "string", def: "\u300C\u786E\u5B9A\u300D/\u300C\u53D6\u6D88\u300D", descKey: "apiConfirmText" },
  { name: "onConfirm / onCancel", type: "() => void", def: "\u2014", descKey: "apiOnConfirm" },
  { name: "size", type: "'sm' | 'md' | 'lg'", def: "'md'", descKey: "apiSize" },
  { name: "headerActions", type: "ReactNode", def: "\u2014", descKey: "apiHeaderActions" },
  { name: "footer", type: "ReactNode", def: "\u2014", descKey: "apiFooter" }
];
var TOAST_API = [
  { name: "variant / tone", type: "'info' | 'success' | 'error' | 'warning'", def: "'info'", descKey: "apiVariant" },
  { name: "description", type: "string", def: "\u2014", descKey: "apiDescription" },
  { name: "actions", type: "ToastAction[]", def: "\u2014", descKey: "apiActions" },
  { name: "durationMs", type: "number", def: "2600", descKey: "apiDurationMs" },
  { name: "position", type: "ToastPosition", def: "'bottom-center'", descKey: "apiPosition" },
  { name: "onDismiss", type: "() => void", def: "\u2014", descKey: "apiOnDismiss" }
];
function FeedbackPage() {
  const [open, setOpen] = (0, import_react31.useState)(false);
  const [openNative, setOpenNative] = (0, import_react31.useState)(false);
  const [alertState, setAlertState] = (0, import_react31.useState)(null);
  const [confirmCfg, setConfirmCfg] = (0, import_react31.useState)(null);
  const [confirmResult, setConfirmResult] = (0, import_react31.useState)("");
  const [largeOpen, setLargeOpen] = (0, import_react31.useState)(false);
  const [largeOpenB, setLargeOpenB] = (0, import_react31.useState)(false);
  const [nativeText, setNativeText] = (0, import_react31.useState)("");
  return (0, import_react31.createElement)(
    "div",
    null,
    (0, import_react31.createElement)(Note, { text: t2("feedbackNote") }),
    (0, import_react31.createElement)(
      Example,
      { title: "\u539F\u751F\u5F39\u7A97\uFF08\u5BBF\u4E3B\uFF09", hint: '\u5BBF\u4E3B\u5185\u6838\u5B98\u65B9 Modal\uFF1A\u906E\u7F69/\u5934\u90E8/\u5173\u95ED\u53C9\u5168\u5F52\u5BBF\u4E3B\u7BA1\uFF1B\u6B63\u6587\u533A\u585E\u4EFB\u610F\u5185\u5BB9\uFF0Cfooter \u4EFB\u610F\u6309\u94AE\u7EC4\u5408\u3002\u547D\u4EE4\u5F0F\u7528 confirmModal/alertModal \u52A0 skin:"host"\uFF0C\u4E0E core \u4E92\u4E0D\u8986\u76D6\u3002', code: CODE_HOST_MODAL },
      (0, import_react31.createElement)(
        "div",
        { style: { display: "flex", flexWrap: "wrap", gap: "8px" } },
        (0, import_react31.createElement)(Button, { variant: "outline", onClick: () => setOpenNative(true) }, "\u6253\u5F00\u5BBF\u4E3B\u539F\u751F\u5F39\u7A97\uFF08\u7EC4\u4EF6\uFF09"),
        (0, import_react31.createElement)(Button, { variant: "ghost", onClick: () => {
          void alertModal({ title: "\u5BBF\u4E3B\u63D0\u793A", message: '\u8FD9\u662F\u5BBF\u4E3B\u6837\u5F0F\u7684\u547D\u4EE4\u5F0F alert\uFF08skin:"host"\uFF09\uFF0C\u5173\u95ED\u5373\u786E\u8BA4' });
        } }, 'alertModal({skin:"host"})'),
        (0, import_react31.createElement)(Button, { variant: "ghost", onClick: async () => {
          const ok = await confirmModal({ title: "\u5BBF\u4E3B\u786E\u8BA4\u6846", message: "\u5B98\u65B9 Modal \u5F39\u51FA\u7684\u786E\u8BA4\uFF08danger\uFF09", tone: "danger", confirmText: "\u5220\u9664", cancelText: "\u518D\u60F3\u60F3", skin: "host" });
          showToast(ok ? "\u5BBF\u4E3B confirm\uFF1A\u4F60\u70B9\u4E86\u5220\u9664" : "\u5BBF\u4E3B confirm\uFF1A\u4F60\u70B9\u4E86\u53D6\u6D88");
        } }, 'confirmModal({skin:"host"})'),
        openNative ? (0, import_react31.createElement)(
          Official.Modal,
          {
            open: openNative,
            onClose: () => setOpenNative(false),
            title: "\u5BBF\u4E3B\u539F\u751F\u5F39\u7A97",
            closeLabel: "\u5173\u95ED",
            description: "\u8FD9\u662F\u5BBF\u4E3B\u5185\u6838\u63D0\u4F9B\u7684 Modal\uFF0C\u4E0B\u9762\u4E00\u6BB5\u662F\u8C03\u7528\u65B9\u585E\u8FDB\u6765\u7684\u81EA\u5B9A\u4E49\u5185\u5BB9\uFF08\u8F93\u5165\u6846 + \u52FE\u9009\uFF09\u3002",
            contentClassName: "dshpc-native-demo-content",
            footer: (0, import_react31.createElement)(
              "div",
              { style: { display: "flex", justifyContent: "flex-end", gap: "8px" } },
              (0, import_react31.createElement)(Button, { variant: "outline", onClick: () => setOpenNative(false) }, "\u53D6\u6D88"),
              (0, import_react31.createElement)(Button, { variant: "danger", onClick: () => setOpenNative(false) }, "\u5220\u9664"),
              (0, import_react31.createElement)(Button, { variant: "primary", onClick: () => setOpenNative(false) }, "\u786E\u8BA4")
            )
          },
          (0, import_react31.createElement)(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: "12px" } },
            (0, import_react31.createElement)(Input, { value: nativeText, onChange: setNativeText, placeholder: "\u81EA\u5B9A\u4E49\u8F93\u5165\u6846\uFF08\u6765\u81EA core \u63A7\u4EF6\uFF09" }),
            (0, import_react31.createElement)(
              "label",
              { style: { display: "flex", gap: "8px", alignItems: "center", fontSize: "13px" } },
              (0, import_react31.createElement)(Checkbox, { checked: false, onChange: () => {
              } }),
              "\u81EA\u5B9A\u4E49\u52FE\u9009\u9879"
            )
          )
        ) : null
      )
    ),
    (0, import_react31.createElement)(
      Example,
      { title: "\u5C0F\u578B\u5F39\u7A97\uFF08\u81EA\u5B9A\u4E49\uFF09", hint: "\u6211\u4EEC\u7684\u6807\u51C6\u5C0F\u6846\uFF1AAlertModal\uFF08\u5355\u6309\u94AE + severity \u56FE\u6807\uFF09/ ConfirmModal\uFF08\u53CC\u6309\u94AE + \u8BED\u4E49\u6863\uFF09\uFF0C\u4EE5\u53CA\u547D\u4EE4\u5F0F alertModal()/confirmModal()\uFF08Promise\uFF09\u3002\u540D\u5B57\u5E26 Modal \u540E\u7F00\uFF0C\u4E0D\u8986\u76D6\u5BBF\u4E3B\u539F\u751F\u3002", code: CODE_SMALL_MODAL },
      (0, import_react31.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "16px" } },
        (0, import_react31.createElement)(
          "div",
          null,
          (0, import_react31.createElement)("div", { style: { fontSize: "12px", color: "var(--dshpc-fg-3)", marginBottom: "6px" } }, "AlertModal\uFF08\u7EC4\u4EF6\uFF09"),
          (0, import_react31.createElement)(
            "div",
            { style: { display: "flex", flexWrap: "wrap", gap: "8px" } },
            (0, import_react31.createElement)(Button, { onClick: () => setAlertState({ sev: "info", titled: true }) }, "info"),
            (0, import_react31.createElement)(Button, { onClick: () => setAlertState({ sev: "success", titled: true }) }, "success"),
            (0, import_react31.createElement)(Button, { onClick: () => setAlertState({ sev: "warning", titled: true }) }, "warning"),
            (0, import_react31.createElement)(Button, { onClick: () => setAlertState({ sev: "error", titled: true }) }, "error"),
            (0, import_react31.createElement)(Button, { variant: "outline", onClick: () => setAlertState({ sev: "warning", titled: false }) }, "\u65E0\u6807\u9898")
          ),
          alertState !== null ? (0, import_react31.createElement)(AlertModal, {
            severity: alertState.sev,
            title: alertState.titled ? "\u64CD\u4F5C\u7ED3\u679C" : void 0,
            message: "\u8FD9\u662F\u4E00\u6761\u8BF4\u660E\u6587\u5B57\uFF1AAlertModal \u7528\u4E8E\u53EA\u9700\u4E00\u4E2A\u786E\u8BA4\u52A8\u4F5C\u7684\u63D0\u793A\u573A\u666F\u3002",
            onConfirm: () => setAlertState(null)
          }) : null
        ),
        (0, import_react31.createElement)(
          "div",
          null,
          (0, import_react31.createElement)("div", { style: { fontSize: "12px", color: "var(--dshpc-fg-3)", marginBottom: "6px" } }, "ConfirmModal\uFF08\u7EC4\u4EF6\uFF09"),
          (0, import_react31.createElement)(
            "div",
            { style: { display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" } },
            (0, import_react31.createElement)(Button, { onClick: () => {
              setConfirmCfg({ tone: "primary", confirmText: "\u786E\u5B9A", cancelText: "\u53D6\u6D88" });
              setConfirmResult("");
            } }, "\u9ED8\u8BA4\uFF08primary\uFF09"),
            (0, import_react31.createElement)(Button, { variant: "outline", onClick: () => {
              setConfirmCfg({ tone: "danger", confirmText: "\u5220\u9664", cancelText: "\u518D\u60F3\u60F3" });
              setConfirmResult("");
            } }, "danger \u53D8\u4F53"),
            (0, import_react31.createElement)(Button, { variant: "ghost", onClick: () => {
              setConfirmCfg({ tone: "warning", confirmText: "\u6211\u5DF2\u77E5\u6653", cancelText: "\u8FD4\u56DE" });
              setConfirmResult("");
            } }, "\u6539\u6587\u6848"),
            confirmResult ? (0, import_react31.createElement)("span", { style: { fontSize: "13px", color: "var(--dshpc-fg-3)" } }, confirmResult) : null
          ),
          confirmCfg !== null ? (0, import_react31.createElement)(ConfirmModal, {
            title: "\u5220\u9664\u4EFB\u52A1",
            message: "\u5220\u9664\u540E\u4E0D\u53EF\u6062\u590D\uFF0C\u786E\u5B9A\u8981\u5220\u9664\u5417\uFF1F",
            tone: confirmCfg.tone,
            confirmText: confirmCfg.confirmText,
            cancelText: confirmCfg.cancelText,
            onConfirm: () => {
              setConfirmCfg(null);
              setConfirmResult(`\u4F60\u70B9\u4E86\uFF1A${confirmCfg.confirmText}\uFF08\u786E\u8BA4\uFF09`);
            },
            onCancel: () => {
              setConfirmCfg(null);
              setConfirmResult(`\u4F60\u70B9\u4E86\uFF1A${confirmCfg.cancelText}\uFF08\u53D6\u6D88\uFF09`);
            }
          }) : null
        ),
        (0, import_react31.createElement)(
          "div",
          null,
          (0, import_react31.createElement)("div", { style: { fontSize: "12px", color: "var(--dshpc-fg-3)", marginBottom: "6px" } }, "\u547D\u4EE4\u5F0F\uFF08Promise\uFF09"),
          (0, import_react31.createElement)(
            "div",
            { style: { display: "flex", flexWrap: "wrap", gap: "8px" } },
            (0, import_react31.createElement)(Button, { variant: "outline", onClick: () => {
              alertModal({ title: "\u63D0\u793A", message: "\u8FD9\u662F\u547D\u4EE4\u5F0F alert\uFF0C\u5173\u95ED\u5373\u786E\u8BA4" }).then(() => showToast("alert \u5DF2\u5173\u95ED"));
            } }, "alertModal()"),
            (0, import_react31.createElement)(Button, { onClick: async () => {
              const ok = await confirmModal({ title: "\u786E\u8BA4\u63D0\u4EA4", message: "\u63D0\u4EA4\u540E\u4E0D\u53EF\u64A4\u9500", tone: "danger", confirmText: "\u63D0\u4EA4", cancelText: "\u53D6\u6D88" });
              showToast(ok ? "\u4F60\u70B9\u4E86\uFF1A\u63D0\u4EA4" : "\u4F60\u70B9\u4E86\uFF1A\u53D6\u6D88");
            } }, "confirmModal()")
          )
        )
      )
    ),
    (0, import_react31.createElement)(
      Example,
      { title: "\u5927\u578B\u5F39\u7A97\uFF08\u81EA\u5B9A\u4E49\uFF09", hint: "\u6211\u4EEC\u7684\u5185\u5BB9\u5F39\u7A97\uFF1AModal\uFF08size md/lg\uFF09\uFF0C\u627F\u8F7D\u4EFB\u610F\u5185\u5BB9\uFF0C\u4E0D\u662F\u300C\u786E\u5B9A/\u53D6\u6D88\u300D\u547D\u4EE4\u5F0F\u3002\u4E09\u5F20\u793A\u4F8B\uFF1A\u9ED8\u8BA4 md / \u5E26 footer / \u65E0 footer\uFF08\u5185\u5BB9\u81EA\u5B9A\u4E49\uFF09\uFF0C\u5934\u90E8\u6392\u6CD5\u53EF\u4E0D\u540C\u3002", code: CODE_LARGE_MODAL },
      (0, import_react31.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "16px" } },
        (0, import_react31.createElement)(
          "div",
          null,
          (0, import_react31.createElement)("div", { style: { fontSize: "12px", color: "var(--dshpc-fg-3)", marginBottom: "6px" } }, "\u9ED8\u8BA4\uFF08md\uFF09"),
          (0, import_react31.createElement)(Button, { onClick: () => setOpen(true) }, "\u6253\u5F00\u5927\u5F39\u7A97\uFF08md \u9ED8\u8BA4\uFF09"),
          open ? (0, import_react31.createElement)(Modal, {
            title: "\u4EFB\u52A1\u8BE6\u60C5",
            onClose: () => setOpen(false),
            footer: (0, import_react31.createElement)(Button, { variant: "primary", onClick: () => setOpen(false) }, "\u77E5\u9053\u4E86")
          }, (0, import_react31.createElement)("div", null, "\u5F39\u7A97\u4E3B\u4F53\u5185\u5BB9\u2014\u2014\u4F1A\u8BDD\u9884\u89C8\u8FD9\u7C7B\u529F\u80FD\u5C31\u7528\u5B83\u6765\u627F\u8F7D\u3002")) : null
        ),
        (0, import_react31.createElement)(
          "div",
          null,
          (0, import_react31.createElement)("div", { style: { fontSize: "12px", color: "var(--dshpc-fg-3)", marginBottom: "6px" } }, "\u5E26 footer\uFF08lg\uFF09"),
          (0, import_react31.createElement)(Button, { variant: "outline", onClick: () => setLargeOpen(true) }, "\u6253\u5F00\u5927\u5F39\u7A97\uFF08\u5E26 footer\uFF09"),
          largeOpen ? (0, import_react31.createElement)(
            Modal,
            {
              size: "lg",
              title: "\u4F1A\u8BDD\u8BB0\u5F55",
              headerActions: (0, import_react31.createElement)(
                Button,
                { variant: "outline", size: "sm", icon: iconOf("chevron", 14) },
                "\u66F4\u591A"
              ),
              onClose: () => setLargeOpen(false),
              footer: (0, import_react31.createElement)(
                "div",
                { style: { display: "flex", justifyContent: "flex-end", gap: "8px" } },
                (0, import_react31.createElement)(Button, { variant: "outline", onClick: () => setLargeOpen(false) }, "\u5173\u95ED"),
                (0, import_react31.createElement)(Button, { variant: "primary", onClick: () => setLargeOpen(false) }, "\u5B8C\u6210")
              )
            },
            (0, import_react31.createElement)(
              "div",
              null,
              Array.from(
                { length: 40 },
                (_, i) => (0, import_react31.createElement)("div", { key: i, style: { padding: "10px 0", borderBottom: "1px solid var(--dshpc-border-faint)", fontSize: "13px" } }, `\u5217\u8868\u9879 ${i + 1}\uFF1A\u8FD9\u662F\u4E00\u6BB5\u53EF\u6EDA\u52A8\u7684\u5185\u5BB9\u793A\u4F8B`)
              ),
              (0, import_react31.createElement)("div", { className: "dshpc-modal__sid" }, "\u5171 128 \u6761 \xB7 \u6700\u8FD1\u66F4\u65B0 2 \u5206\u949F\u524D")
            )
          ) : null
        ),
        (0, import_react31.createElement)(
          "div",
          null,
          (0, import_react31.createElement)("div", { style: { fontSize: "12px", color: "var(--dshpc-fg-3)", marginBottom: "6px" } }, "\u65E0 footer\uFF08\u5185\u5BB9\u81EA\u5B9A\u4E49\uFF09"),
          (0, import_react31.createElement)(Button, { variant: "outline", onClick: () => setLargeOpenB(true) }, "\u6253\u5F00\u5927\u5F39\u7A97\uFF08\u65E0 footer\uFF09"),
          largeOpenB ? (0, import_react31.createElement)(
            Modal,
            {
              size: "lg",
              title: (0, import_react31.createElement)(
                "div",
                null,
                (0, import_react31.createElement)("div", { style: { fontWeight: 600 } }, "\u4EFB\u52A1\u8BE6\u60C5"),
                (0, import_react31.createElement)("div", { className: "dshpc-modal__sid" }, "sid-2026-1020-7f3a \xB7 5 \u4E2A\u6B65\u9AA4")
              ),
              onClose: () => setLargeOpenB(false)
            },
            (0, import_react31.createElement)(
              "div",
              null,
              (0, import_react31.createElement)("div", { style: { fontSize: "13px", lineHeight: "1.7" } }, "\u8FD9\u91CC\u6574\u4E2A\u5F39\u7A97\u90FD\u7531\u8C03\u7528\u65B9\u81EA\u5DF1\u5B9A\u4E49\uFF1A\u6CA1\u6709 footer\uFF0C\u5934\u90E8\u4E5F\u6362\u4E86\u4E00\u79CD\u6392\u6CD5\uFF08\u591A\u6392\u6807\u9898 + \u526F\u6807\u9898\u884C\uFF09\u3002\u5185\u5BB9\u533A\u53EF\u653E\u4EFB\u610F\u4E1A\u52A1\u7EC4\u4EF6\u3002"),
              (0, import_react31.createElement)("div", { style: { marginTop: "12px", border: "1px solid var(--dshpc-border-faint)", borderRadius: "8px", padding: "12px", fontSize: "13px" } }, "\u4EFB\u610F\u5185\u5BB9\uFF0C\u4F8B\u5982\u4E00\u6BB5\u8BF4\u660E\u6216\u4E00\u4E2A\u4E1A\u52A1\u5361\u7247\u3002")
            )
          ) : null
        )
      )
    ),
    (0, import_react31.createElement)(
      Example,
      { title: "Toast \xB7 \u5B98\u65B9 Sonner", hint: "showToast()\uFF1A\u7B2C\u4E09\u65B9\u5E93\u539F\u5473\uFF0C\u5BF9\u6BD4\u7528", code: CODE_TOAST_NATIVE },
      (0, import_react31.createElement)(
        "div",
        { style: { display: "flex", gap: "8px", flexWrap: "wrap" } },
        (0, import_react31.createElement)(Button, { onClick: () => showToast("\u5DF2\u4FDD\u5B58") }, "\u666E\u901A(info)"),
        (0, import_react31.createElement)(Button, { onClick: () => showToast("\u4FDD\u5B58\u6210\u529F", { variant: "success" }) }, "\u6210\u529F"),
        (0, import_react31.createElement)(Button, { onClick: () => showToast("\u4FDD\u5B58\u5931\u8D25", { variant: "error" }) }, "\u5931\u8D25"),
        (0, import_react31.createElement)(Button, { onClick: () => showToast("\u6CE8\u610F\u4E00\u4E0B", { variant: "warning" }) }, "\u8B66\u544A"),
        (0, import_react31.createElement)(Button, { onClick: () => showToast("\u6574\u6761\u81EA\u5B9A\u4E49\u8272", { color: "#7c3aed" }) }, "\u81EA\u5B9A\u4E49\u8272"),
        (0, import_react31.createElement)(
          Button,
          {
            onClick: () => showToast("\u6D88\u5931\u540E\u56DE\u8C03", {
              onDismiss: () => showToast("\u4E0A\u4E00\u6761\u6D88\u5931\u4E86")
            })
          },
          "\u5E26\u56DE\u8C03"
        )
      ),
      (0, import_react31.createElement)(
        "div",
        { style: { display: "flex", gap: "8px", flexWrap: "wrap" } },
        (0, import_react31.createElement)(Button, { onClick: () => showToast("\u9876\u90E8-\u5DE6", { position: "top-left" }) }, "top-left"),
        (0, import_react31.createElement)(Button, { onClick: () => showToast("\u9876\u90E8-\u4E2D", { position: "top-center" }) }, "top-center"),
        (0, import_react31.createElement)(Button, { onClick: () => showToast("\u9876\u90E8-\u53F3", { position: "top-right" }) }, "top-right"),
        (0, import_react31.createElement)(Button, { onClick: () => showToast("\u5E95\u90E8-\u5DE6", { position: "bottom-left" }) }, "bottom-left"),
        (0, import_react31.createElement)(Button, { onClick: () => showToast("\u5E95\u90E8-\u4E2D", { position: "bottom-center" }) }, "bottom-center"),
        (0, import_react31.createElement)(Button, { onClick: () => showToast("\u5E95\u90E8-\u53F3", { position: "bottom-right" }) }, "bottom-right")
      )
    ),
    (0, import_react31.createElement)(
      Example,
      { title: "Toast \xB7 \u5BBF\u4E3B\u539F\u751F", hint: "showHostToast()\uFF1A\u76F4\u63A5\u5305 @deepseek-ai \u5B98\u65B9 Toast\uFF08\u9876\u90E8\u6A2A\u5E45\uFF09", code: CODE_TOAST_HOST },
      (0, import_react31.createElement)(
        "div",
        { style: { display: "flex", gap: "8px", flexWrap: "wrap" } },
        (0, import_react31.createElement)(Button, { onClick: () => showHostToast("\u8FD9\u662F\u5BBF\u4E3B\u539F\u751F\u63D0\u793A") }, "\u666E\u901A"),
        (0, import_react31.createElement)(Button, { onClick: () => showHostToast("\u64CD\u4F5C\u6210\u529F", { tone: "success" }) }, "\u6210\u529F(success)"),
        (0, import_react31.createElement)(
          Button,
          {
            onClick: () => showHostToast("\u6709\u52A8\u4F5C\u7684\u539F\u751F\u63D0\u793A", {
              actions: [{ text: "\u67E5\u770B", onClick: () => showToast("\u70B9\u4E86\u300C\u67E5\u770B\u300D") }]
            })
          },
          "\u5E26\u52A8\u4F5C"
        )
      )
    ),
    (0, import_react31.createElement)(
      Example,
      { title: "Toast \xB7 \u6211\u4EEC\u5C01\u88C5 notify", hint: "notify()\uFF1A\u7EDF\u4E00\u7070/\u7EFF/\u7EA2/\u9EC4 + \u53F3\u4FA7\u6211\u4EEC\u81EA\u5DF1\u7684\u6309\u94AE", code: CODE_TOAST_NOTIFY },
      (0, import_react31.createElement)(
        "div",
        { style: { display: "flex", gap: "8px", flexWrap: "wrap" } },
        (0, import_react31.createElement)(Button, { onClick: () => notify("\u5DF2\u4FDD\u5B58\u8349\u7A3F") }, "\u666E\u901A(info)"),
        (0, import_react31.createElement)(Button, { onClick: () => notify("\u4FDD\u5B58\u6210\u529F", { variant: "success" }) }, "\u6210\u529F"),
        (0, import_react31.createElement)(Button, { onClick: () => notify("\u4FDD\u5B58\u5931\u8D25", { variant: "error" }) }, "\u5931\u8D25"),
        (0, import_react31.createElement)(Button, { onClick: () => notify("\u78C1\u76D8\u7A7A\u95F4\u4E0D\u8DB3", { variant: "warning" }) }, "\u8B66\u544A"),
        (0, import_react31.createElement)(
          Button,
          {
            onClick: () => notify("\u5DF2\u5220\u9664\u8BE5\u6587\u4EF6", {
              variant: "success",
              description: "\u53EF\u5728 10 \u79D2\u5185\u64A4\u9500",
              actions: [{ text: "\u64A4\u9500", variant: "outline", onClick: () => notify("\u5DF2\u64A4\u9500") }]
            })
          },
          "\u5355\u6309\u94AE+\u63CF\u8FF0"
        ),
        (0, import_react31.createElement)(
          Button,
          {
            onClick: () => notify("\u786E\u8BA4\u63D0\u4EA4\u5417\uFF1F", {
              description: "\u63D0\u4EA4\u540E\u5C06\u901A\u77E5\u76F8\u5173\u6210\u5458",
              actions: [
                { text: "\u53D6\u6D88", variant: "outline", onClick: () => notify("\u5DF2\u53D6\u6D88") },
                { text: "\u63D0\u4EA4", variant: "primary", onClick: () => notify("\u5DF2\u63D0\u4EA4", { variant: "success" }) }
              ]
            })
          },
          "\u53CC\u6309\u94AE"
        )
      )
    ),
    (0, import_react31.createElement)(CodeOnly, { labelKey: "docUsage", code: CODE_FEEDBACK_USAGE }),
    (0, import_react31.createElement)(ApiTable, { rows: MODAL_API }),
    (0, import_react31.createElement)(ApiTable, { rows: TOAST_API })
  );
}
var CODE_DOCK = `// 1) \u5EFA\u4E00\u4E2A dock \u63A7\u5236\u5668\uFF08\u5E94\u7528\u7EA7\u5355\u4F8B\uFF1BmaxPanels \u9ED8\u8BA4 3\uFF09
const dock = createPanelDock({ maxPanels: 3 })

// 2) \u6E32\u67D3\uFF1A\u7ED3\u6784\u5199\u5728\u8C03\u7528\u70B9 \u2014\u2014 PanelDock \u8BFB children \u91CC DockPanel \u7684 props \u7EDF\u4E00\u753B
<div style={{ display: 'flex', height: '100%' }}>
  <main style={{ flex: 1, minWidth: 0 }}>\u4E3B\u533A\u5185\u5BB9</main>
  <PanelDock dock={dock}>
    <DockPanel id="files" title="\u6587\u4EF6" icon={<FolderIcon />}>
      <FileBrowser />
    </DockPanel>
    <DockPanel id="preview" title="\u9884\u89C8" width={520} closeButton="floating">
      <FilePreview />
    </DockPanel>
  </PanelDock>
</div>

// 3) \u663E\u9690\u5F52\u72B6\u6001\uFF1A\u53EA\u4F20 id\uFF0C\u4E0D\u4F20\u5185\u5BB9
const result = dock.open('files')   // { ok, reason }\uFF1B\u5230\u4E0A\u9650\u65F6 ok=false
if (!result.ok) showToast('\u6700\u591A\u540C\u65F6\u5F00 3 \u680F')
dock.close('files')
dock.toggle('preview')
dock.isOpen('files')

// 4) \u8BA2\u9605\u72B6\u6001\u9A71\u52A8 UI\uFF08React\uFF09
const state = useSyncExternalStore(dock.subscribe, dock.getSnapshot, dock.getSnapshot)`;
var CODE_DOCK_USAGE = `pnpm add dsh-plugin-core

import { PanelDock, DockPanel, createPanelDock } from 'dsh-plugin-core/ui'

const dock = createPanelDock({ maxPanels: 3 })

<div style={{ display: 'flex', height: '100%' }}>
  <main style={{ flex: 1, minWidth: 0 }}>\u4E3B\u533A</main>
  <PanelDock dock={dock}>
    <DockPanel id="files" title="\u6587\u4EF6">
      <FileBrowser />
    </DockPanel>
  </PanelDock>
</div>

// \u26A0\uFE0F PanelDock \u662F\u5E03\u5C40\u6210\u5458\u4E0D\u662F\u6D6E\u5C42\uFF1A\u5FC5\u987B\u7531\u8C03\u7528\u65B9\u653E\u8FDB\u81EA\u5DF1\u7684 flex \u6839\u5BB9\u5668\uFF1B
//    \u81EA\u6302 document.body \u53EA\u80FD\u906E\u76D6\u3001\u6324\u4E0D\u7A84\u4E3B\u533A\u3002`;
var DOCK_PANEL_API = [
  { name: "id", type: "string", def: "\u2014", descKey: "apiPanelId" },
  { name: "title", type: "ReactNode", def: "\u2014", descKey: "apiPanelTitle" },
  { name: "icon", type: "ReactNode", def: "\u2014", descKey: "apiPanelIcon" },
  { name: "extra", type: "ReactNode", def: "\u2014", descKey: "apiPanelExtra" },
  { name: "header", type: "ReactNode | null", def: "\u2014", descKey: "apiPanelHeader" },
  { name: "closable", type: "boolean", def: "true", descKey: "apiPanelClosable" },
  { name: "closeButton", type: "DockCloseButton", def: "'auto'", descKey: "apiPanelCloseButton" },
  { name: "width / minWidth / maxWidth", type: "number", def: "460 / 320 / \u2014", descKey: "apiPanelWidth" }
];
var DOCK_OPTIONS_API = [
  { name: "maxPanels", type: "number", def: "3", descKey: "apiMaxPanels" },
  { name: "defaultWidth", type: "number", def: "460", descKey: "apiDefaultWidth" },
  { name: "minWidth", type: "number", def: "320", descKey: "apiPanelMinWidth" },
  { name: "storageKey", type: "string | false", def: "'dshpc-dock'", descKey: "apiStorageKey" },
  { name: "onOpen", type: "({ id, created }) => void", def: "\u2014", descKey: "apiOnOpen" },
  { name: "onBeforeClose", type: "({ id, reason }) => boolean | undefined", def: "\u2014", descKey: "apiOnBeforeClose" },
  { name: "onClose", type: "({ id, reason }) => void", def: "\u2014", descKey: "apiOnClose" },
  { name: "onResize", type: "({ id, width }) => void", def: "\u2014", descKey: "apiOnResize" },
  { name: "onLimitReached", type: "({ id }) => void", def: "\u2014", descKey: "apiOnLimitReached" }
];
function LayoutPage() {
  const state = (0, import_react31.useSyncExternalStore)(demoDock.subscribe, demoDock.getSnapshot, demoDock.getSnapshot);
  const [notice, setNotice] = (0, import_react31.useState)(null);
  const open = (id) => {
    const result = demoDock.open(id);
    setNotice(result.ok ? null : t2("dockLimitWarn"));
  };
  const close = (id) => {
    demoDock.close(id);
    setNotice(null);
  };
  const opened = state.ids;
  return (0, import_react31.createElement)(
    "div",
    null,
    (0, import_react31.createElement)(Note, { text: t2("layoutNote") }),
    (0, import_react31.createElement)(
      Example,
      { title: "PanelDock", hint: t2("dockHint"), code: CODE_DOCK },
      (0, import_react31.createElement)(
        "div",
        { style: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" } },
        (0, import_react31.createElement)(Button, { size: "sm", onClick: () => open("A") }, t2("dockBtnOpenA")),
        (0, import_react31.createElement)(Button, { size: "sm", onClick: () => open("B") }, t2("dockBtnOpenB")),
        (0, import_react31.createElement)(Button, { size: "sm", variant: "primary", onClick: () => open("A") }, t2("dockBtnOpenA2")),
        (0, import_react31.createElement)(Button, { size: "sm", onClick: () => close("A") }, t2("dockBtnCloseA")),
        (0, import_react31.createElement)(Button, { size: "sm", onClick: () => open("default") }, t2("dockBtnDefault")),
        (0, import_react31.createElement)(Button, { size: "sm", onClick: () => open("C") }, t2("dockBtnOpenC")),
        (0, import_react31.createElement)(
          Button,
          {
            size: "sm",
            variant: "ghost",
            onClick: () => {
              for (const id of demoDock.ids()) demoDock.close(id);
              setNotice(null);
            }
          },
          t2("dockBtnReset")
        )
      ),
      (0, import_react31.createElement)(
        "div",
        { style: { fontSize: "12px", color: "var(--dshpc-fg-3)" } },
        `${t2("dockOpened")}${opened.length === 0 ? "\u2014" : opened.join(", ")}`,
        notice === null ? "" : `\u3000${notice}`
      ),
      (0, import_react31.createElement)(
        "div",
        { style: { marginTop: "10px", fontSize: "12px", color: "var(--dshpc-fg-3)", lineHeight: "1.9" } },
        t2("dockMainText")
      )
    ),
    (0, import_react31.createElement)(CodeOnly, { labelKey: "docUsage", code: CODE_DOCK_USAGE }),
    (0, import_react31.createElement)(ApiTable, { rows: DOCK_PANEL_API }),
    (0, import_react31.createElement)(ApiTable, { rows: DOCK_OPTIONS_API })
  );
}

// packages/demo/src/sections/blocks.tsx
var import_react40 = require("react");

// dist/explorer/FileBrowser.js
var import_react37 = require("react");

// dist/explorer/preview/index.js
var import_react36 = require("react");

// dist/explorer/types.js
var HTML_KINDS = ["html", "htm"];
var OFFICE_KINDS = ["doc", "docx", "ppt", "pptx"];
var SOURCE_MAX_BYTES = 256 * 1024;
function previewInfoOf(path) {
  const ext = extOf(path);
  const mime = mimeOf(path);
  if (mime !== void 0)
    return { kind: "image", ext, mime };
  if (ext === "pdf")
    return { kind: "pdf", ext, mime: "application/pdf" };
  if (ext === "md" || ext === "markdown")
    return { kind: "md", ext };
  if (HTML_KINDS.includes(ext))
    return { kind: "html", ext };
  if (OFFICE_KINDS.includes(ext))
    return { kind: "office", ext, mime: "application/pdf" };
  return { kind: "text", ext };
}
function unwrapEnvelope(result) {
  if (typeof result === "object" && result !== null) {
    const r = result;
    if (r.ok === false)
      return { kind: "error", error: r.error };
    if (r.ok === true && "value" in r)
      return { kind: "ok", payload: r.value };
  }
  return { kind: "ok", payload: result };
}
function isFailed(value) {
  return typeof value === "object" && value !== null && "failed" in value;
}
function listingOf(result) {
  const envelope = unwrapEnvelope(result);
  if (envelope.kind === "error")
    return { failed: envelope.error };
  const raw = envelope.payload;
  if (typeof raw !== "object" || raw === null) {
    console.warn("[dsh-plugin-core:explorer] list \u8FD4\u56DE\u975E\u5BF9\u8C61");
    return null;
  }
  const r = raw;
  if (typeof r.path !== "string" || !Array.isArray(r.entries) || typeof r.truncated !== "boolean") {
    console.warn("[dsh-plugin-core:explorer] list \u8FD4\u56DE\u5F62\u72B6\u4E0D\u7B26\u5951\u7EA6");
    return null;
  }
  return { path: r.path, entries: r.entries, truncated: r.truncated };
}
function textPageOf(result) {
  const envelope = unwrapEnvelope(result);
  if (envelope.kind === "error")
    return { failed: envelope.error };
  const raw = envelope.payload;
  if (typeof raw !== "object" || raw === null) {
    console.warn("[dsh-plugin-core:explorer] read \u8FD4\u56DE\u975E\u5BF9\u8C61");
    return null;
  }
  const r = raw;
  if (typeof r.text !== "string") {
    console.warn("[dsh-plugin-core:explorer] read \u8FD4\u56DE\u5F62\u72B6\u4E0D\u7B26\u5951\u7EA6\uFF08\u65E0 text \u5B57\u6BB5\uFF09");
    return null;
  }
  const offset = typeof r.offset === "number" ? r.offset : 0;
  const lines = typeof r.lines === "number" ? r.lines : r.text === "" ? 0 : r.text.split("\n").length;
  return { text: r.text, offset, lines, eof: r.eof !== false };
}
function bytesOf(result) {
  const envelope = unwrapEnvelope(result);
  if (envelope.kind === "error")
    return { failed: envelope.error };
  const data = envelope.payload?.data;
  if (data instanceof Uint8Array)
    return data;
  console.warn("[dsh-plugin-core:explorer] readBytes \u8FD4\u56DE\u5F62\u72B6\u4E0D\u7B26\u5951\u7EA6");
  return null;
}
function absolutePathOf(result) {
  const envelope = unwrapEnvelope(result);
  if (envelope.kind === "error")
    return null;
  const raw = envelope.payload;
  if (typeof raw !== "object" || raw === null)
    return null;
  const abs = raw.absolutePath;
  return typeof abs === "string" && abs !== "" ? abs : null;
}
function bareCode(raw) {
  if (typeof raw === "string") {
    const slash = raw.lastIndexOf("/");
    return slash >= 0 ? raw.slice(slash + 1) : raw;
  }
  if (typeof raw === "object" && raw !== null) {
    const code = raw.code;
    if (typeof code === "string")
      return bareCode(code);
  }
  return "";
}
function errView(error) {
  const code = bareCode(error);
  switch (code) {
    case "outside-workspace":
      return { key: "previewOutside" };
    case "not-found":
    case "lookup-not-found":
      return { key: "previewNotFound" };
    case "not-directory":
      return { key: "previewNotDirectory" };
    case "not-regular-file":
      return { key: "previewNotDirectory" };
    case "too-large":
      return { key: "previewTooLarge" };
    case "not-text":
      return { key: "previewNotText" };
    case "invocation-unavailable":
    case "service-unavailable":
      return { key: "previewOfficeUnavailable" };
    default:
      return { key: "explorerFailed" };
  }
}
function sortEntries(entries2) {
  return [...entries2].sort((a, b) => {
    const ad = a.type === "directory" ? 0 : 1;
    const bd = b.type === "directory" ? 0 : 1;
    if (ad !== bd)
      return ad - bd;
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });
}
function listPathOf(dir) {
  return dir === "" ? "." : dir;
}
function createRootCache() {
  const map = /* @__PURE__ */ new Map();
  return {
    get: (sessionId) => map.get(sessionId),
    set: (sessionId, root) => {
      map.set(sessionId, root);
    }
  };
}
function isAbsoluteish(p) {
  return p.startsWith("/") || p.startsWith("\\") || /^[a-zA-Z]:[\\/]/.test(p);
}
function relJoin(dir, name) {
  return dir.replace(/\/+$/, "") === "" ? name : `${dir.replace(/\/+$/, "")}/${name}`;
}
function learnRoot(cache, sessionId, relativePath, absolutePath) {
  const rel = relativePath.replace(/^\/+/, "").replace(/\/+$/, "");
  if (rel === "" || !absolutePath.endsWith(`/${rel}`))
    return null;
  const root = absolutePath.slice(0, absolutePath.length - rel.length - 1);
  cache.set(sessionId, root);
  return root;
}
function relativizeToRoot(cache, sessionId, dir) {
  if (!isAbsoluteish(dir))
    return dir;
  const root = cache.get(sessionId);
  if (root === void 0)
    return dir;
  const norm = root.replace(/\/+$/, "");
  if (dir === norm)
    return "";
  if (dir.startsWith(`${norm}/`))
    return dir.slice(norm.length + 1);
  return dir;
}
async function findAnyFileAbs(workspaceFiles, sessionId, startDir) {
  const stat = workspaceFiles.stat;
  if (stat === void 0)
    return null;
  let frontier = [startDir];
  for (let depth = 0; depth < 3 && frontier.length > 0; depth++) {
    const nextDirs = [];
    for (const dir of frontier.slice(0, 5)) {
      let entries2;
      try {
        const parsed = listingOf(await workspaceFiles.list(sessionId, listPathOf(dir)));
        if (parsed === null || isFailed(parsed))
          continue;
        entries2 = parsed.entries;
      } catch {
        continue;
      }
      const file = entries2.find((entry) => entry.type === "file");
      if (file !== void 0) {
        const rel = relJoin(dir, file.name);
        try {
          const abs = absolutePathOf(await stat(sessionId, rel));
          if (abs !== null)
            return { absolutePath: abs, relativePath: rel };
        } catch {
        }
      }
      for (const entry of entries2) {
        if (entry.type === "directory" && nextDirs.length < 5)
          nextDirs.push(relJoin(dir, entry.name));
      }
    }
    frontier = nextDirs;
  }
  return null;
}
async function absolutizeDir(cache, workspaceFiles, sessionId, dir, canonical, entries2) {
  if (isAbsoluteish(dir))
    return dir;
  const rel = canonical !== "" ? canonical : dir;
  const cached = cache.get(sessionId);
  if (cached !== void 0)
    return `${cached}/${rel}`;
  const stat = workspaceFiles.stat;
  if (stat === void 0)
    return dir;
  const file = entries2.find((entry) => entry.type === "file");
  if (file !== void 0) {
    try {
      const sub = relJoin(rel, file.name);
      const abs = absolutePathOf(await stat(sessionId, sub));
      if (abs?.endsWith(`/${file.name}`) === true && learnRoot(cache, sessionId, sub, abs) !== null) {
        return abs.slice(0, abs.length - file.name.length - 1);
      }
    } catch {
    }
  }
  const found = await findAnyFileAbs(workspaceFiles, sessionId, rel);
  if (found === null)
    return dir;
  const root = learnRoot(cache, sessionId, found.relativePath, found.absolutePath);
  return root === null ? dir : `${root}/${rel}`;
}
function matchesFilter(path, isDir, filter) {
  if (filter === void 0)
    return true;
  if (filter.dirs === true)
    return isDir;
  if (filter.exts === void 0 || filter.exts.length === 0)
    return true;
  if (isDir)
    return true;
  return filter.exts.includes(extOf(path));
}
function crumbsOfDir(dir) {
  const isAbs = isAbsoluteish(dir);
  const segs = dir.split("/").filter((s) => s.length > 0);
  const out = [];
  let acc = "";
  for (const seg of segs) {
    acc = acc === "" ? isAbs ? `/${seg}` : seg : `${acc}/${seg}`;
    out.push({ label: seg, path: acc });
  }
  return out;
}
function baseNameOfPath(p) {
  const i = Math.max(p.lastIndexOf("/"), p.lastIndexOf("\\"));
  return i < 0 ? p : p.slice(i + 1);
}
function dirnameOf(p) {
  return parentOf(p);
}
function pickWorkspaceAnchor(items) {
  let best = null;
  let bestAt = Number.NEGATIVE_INFINITY;
  for (const item of items) {
    const sessionId = item.sessionIds?.[item.sessionIds.length - 1];
    if (typeof item.title !== "string" || item.title === "" || typeof sessionId !== "string" || sessionId === "")
      continue;
    const at = typeof item.updatedAt === "number" && Number.isFinite(item.updatedAt) ? item.updatedAt : Number.NEGATIVE_INFINITY;
    if (best !== null && at <= bestAt)
      continue;
    best = { title: item.title, sessionId };
    bestAt = at;
  }
  return best;
}

// dist/explorer/preview/BytesPreview.js
var import_react32 = require("react");
function BytesPreview(props) {
  ensureControls();
  const tt = props.translate ?? t;
  const [url, setUrl] = (0, import_react32.useState)(null);
  const [failed, setFailed] = (0, import_react32.useState)(null);
  (0, import_react32.useEffect)(() => {
    let alive = true;
    let objectUrl = null;
    setUrl(null);
    setFailed(null);
    props.workspaceFiles.readBytes(props.sessionId, props.path, {}).then((res) => {
      const data = bytesOf(res);
      if (!alive)
        return;
      if (data === null || "failed" in data) {
        setFailed(errView(data === null ? void 0 : data.failed));
        return;
      }
      const blob = new Blob([new Uint8Array(data)], { type: props.mime });
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    }).catch((error) => {
      if (alive)
        setFailed(errView(error));
    });
    return () => {
      alive = false;
      if (objectUrl !== null)
        URL.revokeObjectURL(objectUrl);
    };
  }, [props.workspaceFiles, props.sessionId, props.path, props.mime]);
  if (failed !== null)
    return (0, import_react32.createElement)(EmptyState, { text: tt(failed.key, failed.params), translate: tt });
  if (url === null)
    return (0, import_react32.createElement)("div", { className: "dshpc-fb__note" }, tt("explorerLoading"));
  if (props.kind === "image") {
    return (0, import_react32.createElement)("img", { className: "dshpc-fb__image", src: url, alt: props.path });
  }
  return (0, import_react32.createElement)("iframe", { className: "dshpc-fb__frame", src: url, title: props.path });
}

// dist/explorer/preview/HtmlPreview.js
var import_react34 = require("react");

// dist/explorer/preview/TextPreview.js
var import_react33 = require("react");

// dist/explorer/preview/md-labels.js
function markdownLabels() {
  return {
    code: {
      copyLabel: t("mdCopy"),
      copiedLabel: t("mdCopied"),
      toolbarLabels: { codeLabel: t("mdCode"), wrapLabel: t("mdWrap"), unwrapLabel: t("mdUnwrap") }
    },
    footnotes: t("mdFootnotes")
  };
}

// dist/explorer/preview/TextPreview.js
var PAGE_LINES = 5e3;
function TextPreview(props) {
  ensureControls();
  const tt = props.translate ?? t;
  const [text, setText] = (0, import_react33.useState)("");
  const [truncated, setTruncated] = (0, import_react33.useState)(false);
  const [nextOffset, setNextOffset] = (0, import_react33.useState)(null);
  const [loading, setLoading] = (0, import_react33.useState)(false);
  const [failed, setFailed] = (0, import_react33.useState)(null);
  const accRef = (0, import_react33.useRef)("");
  const load = (0, import_react33.useCallback)(async (offset, append) => {
    setLoading(true);
    try {
      const parsed = textPageOf(await props.workspaceFiles.read(props.sessionId, props.path, { offset, limit: PAGE_LINES }));
      if (parsed === null || "failed" in parsed) {
        setFailed(errView(parsed === null ? void 0 : parsed.failed));
        return;
      }
      setFailed(null);
      const full = append ? accRef.current + parsed.text : parsed.text;
      accRef.current = full;
      setText(full);
      if (props.maxBytes !== void 0) {
        if (parsed.eof) {
          setNextOffset(null);
        } else if (new Blob([full]).size >= props.maxBytes) {
          setTruncated(true);
          setNextOffset(null);
        } else {
          setNextOffset(parsed.offset + parsed.lines);
        }
        return;
      }
      setNextOffset(parsed.eof ? null : parsed.offset + parsed.lines);
    } catch (error) {
      setFailed(errView(error));
    } finally {
      setLoading(false);
    }
  }, [props.workspaceFiles, props.sessionId, props.path, props.maxBytes]);
  (0, import_react33.useEffect)(() => {
    accRef.current = "";
    setText("");
    setTruncated(false);
    setNextOffset(null);
    setFailed(null);
    void load(0, false);
  }, [load]);
  if (failed !== null)
    return (0, import_react33.createElement)(EmptyState, { text: tt(failed.key, failed.params), translate: tt });
  if (text === "" && loading)
    return (0, import_react33.createElement)("div", { className: "dshpc-fb__note" }, tt("explorerLoading"));
  const rendered = props.markdown && !props.sourceView;
  return (0, import_react33.createElement)("div", { className: "dshpc-fb__text" }, truncated ? (0, import_react33.createElement)("div", { className: "dshpc-fb__banner" }, tt("previewTruncated", { n: formatBytes(props.maxBytes ?? 0) })) : null, rendered ? (0, import_react33.createElement)(official_exports.MarkdownText, { text, labels: markdownLabels() }) : (0, import_react33.createElement)(official_exports.CodeBlock, {
    code: text,
    lang: (0, official_exports.languageForPath)(props.path),
    lineNumbers: false,
    wrap: true
  }), nextOffset !== null && props.maxBytes === void 0 ? (0, import_react33.createElement)("div", { className: "dshpc-fb__more" }, (0, import_react33.createElement)(Button, { variant: "outline", size: "sm", loading, onClick: () => void load(nextOffset, true) }, tt("previewLoadMore"))) : null);
}

// dist/explorer/preview/HtmlPreview.js
var HTML_CSP = "default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; media-src data:";
var HTML_FORBID_TAGS = ["noscript", "base", "link", "meta", "iframe", "frame", "object", "embed", "set", "animate", "animatemotion", "animatetransform"];
var HTML_FORBID_ATTRS = ["href", "xlink:href"];
function buildStaticHtml(data) {
  if (typeof DOMParser === "undefined")
    return void 0;
  let source;
  try {
    source = new TextDecoder("utf-8", { fatal: false }).decode(data);
  } catch {
    return void 0;
  }
  let doc;
  try {
    doc = new DOMParser().parseFromString(source, "text/html");
  } catch {
    return void 0;
  }
  for (const tag of HTML_FORBID_TAGS) {
    for (const el of Array.from(doc.getElementsByTagName(tag)))
      el.remove();
  }
  for (const attr of HTML_FORBID_ATTRS) {
    for (const el of Array.from(doc.querySelectorAll(`[${attr}]`)))
      el.removeAttribute(attr);
  }
  const csp = doc.createElement("meta");
  csp.setAttribute("http-equiv", "Content-Security-Policy");
  csp.setAttribute("content", HTML_CSP);
  const head = doc.head ?? doc.documentElement;
  head.insertBefore(csp, head.firstChild);
  return `<!DOCTYPE html>
${doc.documentElement.outerHTML}`;
}
function HtmlPreview(props) {
  ensureControls();
  const tt = props.translate ?? t;
  const [doc, setDoc] = (0, import_react34.useState)(null);
  const [failed, setFailed] = (0, import_react34.useState)(null);
  (0, import_react34.useEffect)(() => {
    if (props.sourceView)
      return;
    let alive = true;
    setDoc(null);
    setFailed(null);
    props.workspaceFiles.readBytes(props.sessionId, props.path, {}).then((res) => {
      const data = bytesOf(res);
      if (!alive)
        return;
      if (data === null || "failed" in data) {
        setFailed(errView(data === null ? void 0 : data.failed));
        return;
      }
      const html = buildStaticHtml(data);
      if (html === void 0) {
        setFailed({ key: "previewRenderFailed" });
        return;
      }
      setDoc(html);
    }).catch((error) => {
      if (alive)
        setFailed(errView(error));
    });
    return () => {
      alive = false;
    };
  }, [props.workspaceFiles, props.sessionId, props.path, props.sourceView]);
  if (props.sourceView) {
    return (0, import_react34.createElement)(TextPreview, {
      workspaceFiles: props.workspaceFiles,
      sessionId: props.sessionId,
      path: props.path,
      markdown: false,
      sourceView: true,
      maxBytes: SOURCE_MAX_BYTES,
      translate: tt
    });
  }
  if (failed !== null)
    return (0, import_react34.createElement)(EmptyState, { text: tt(failed.key, failed.params), translate: tt });
  if (doc === null)
    return (0, import_react34.createElement)("div", { className: "dshpc-fb__note" }, tt("explorerLoading"));
  return (0, import_react34.createElement)("iframe", { className: "dshpc-fb__frame", sandbox: "", srcDoc: doc, title: props.path });
}

// dist/explorer/preview/OfficePreview.js
var import_react35 = require("react");
function OfficePreview(props) {
  ensureControls();
  const tt = props.translate ?? t;
  const [url, setUrl] = (0, import_react35.useState)(null);
  const [failed, setFailed] = (0, import_react35.useState)(null);
  (0, import_react35.useEffect)(() => {
    let alive = true;
    let objectUrl = null;
    setUrl(null);
    setFailed(null);
    const face = props.officeToPdf;
    if (face === null)
      return;
    face.render(props.sessionId, props.path, "foreground").then((res) => {
      const data = bytesOf(res);
      if (!alive)
        return;
      if (data === null || "failed" in data) {
        setFailed(errView(data === null ? void 0 : data.failed));
        return;
      }
      const blob = new Blob([new Uint8Array(data)], { type: "application/pdf" });
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    }).catch((error) => {
      if (alive)
        setFailed(errView(error));
    });
    return () => {
      alive = false;
      if (objectUrl !== null)
        URL.revokeObjectURL(objectUrl);
    };
  }, [props.officeToPdf, props.sessionId, props.path]);
  if (props.officeToPdf === null) {
    return (0, import_react35.createElement)(EmptyState, { text: tt("previewOfficeUnavailable"), translate: tt });
  }
  if (failed !== null)
    return (0, import_react35.createElement)(EmptyState, { text: tt(failed.key, failed.params), translate: tt });
  if (url === null)
    return (0, import_react35.createElement)("div", { className: "dshpc-fb__note" }, tt("explorerLoading"));
  return (0, import_react35.createElement)("iframe", { className: "dshpc-fb__frame", src: url, title: props.path });
}

// dist/explorer/preview/index.js
function FilePreview(props) {
  ensureControls();
  const tt = props.translate ?? t;
  const info = previewInfoOf(props.path);
  const sourceView = props.sourceView === true;
  switch (info.kind) {
    case "image":
    case "pdf":
      return (0, import_react36.createElement)(BytesPreview, {
        workspaceFiles: props.workspaceFiles,
        sessionId: props.sessionId,
        path: props.path,
        kind: info.kind,
        mime: info.mime ?? "application/octet-stream",
        translate: tt
      });
    case "office":
      return (0, import_react36.createElement)(OfficePreview, {
        officeToPdf: props.officeToPdf ?? null,
        sessionId: props.sessionId,
        path: props.path,
        translate: tt
      });
    case "html":
      return (0, import_react36.createElement)(HtmlPreview, {
        workspaceFiles: props.workspaceFiles,
        sessionId: props.sessionId,
        path: props.path,
        sourceView,
        translate: tt
      });
    case "md":
    case "text":
      return (0, import_react36.createElement)(TextPreview, {
        workspaceFiles: props.workspaceFiles,
        sessionId: props.sessionId,
        path: props.path,
        markdown: info.kind === "md",
        sourceView,
        translate: tt
      });
  }
  return null;
}

// dist/explorer/FileBrowser.js
function crumbsMenuEntries(params) {
  const { workspaces, rootName, rootFallbackLabel, crumbs, onPickWorkspace, onLoadDir } = params;
  const out = [];
  const wsEntry = (ws, current3) => (0, import_react37.createElement)("button", {
    key: `ws:${ws}`,
    type: "button",
    role: "menuitem",
    className: "dshpc-fb__menu-item",
    style: { paddingLeft: 8, display: "flex", alignItems: "center", gap: "6px" },
    title: ws,
    // 点当前工作区 = 回到该工作区根目录（浏览深处时唯一的「回根」入口，兄弟 2026-10-10）；
    // 点其他工作区才走 onPickWorkspace（换会话）。
    onClick: () => {
      if (current3)
        onLoadDir?.("");
      else
        onPickWorkspace?.(ws);
    }
  }, (0, import_react37.createElement)("span", { className: "dshpc-fb__menu-icon", style: { color: current3 ? "var(--dshpc-fg)" : "var(--dshpc-fg-2)" } }, (0, import_react37.createElement)(current3 ? official_exports.IconFolderOpenOutlineRegular : official_exports.IconFolderCloseRegular, { size: 13 })), (0, import_react37.createElement)("span", { className: "dshpc-fb__menu-label", style: { fontWeight: current3 ? 600 : 400 } }, ws));
  const pathEntry = (crumb, depth, withArrow = true) => (0, import_react37.createElement)("button", {
    key: `dir:${crumb.path}`,
    type: "button",
    role: "menuitem",
    className: "dshpc-fb__menu-item",
    style: { paddingLeft: 8 },
    title: crumb.path,
    onClick: () => {
      onLoadDir?.(crumb.path);
    }
  }, withArrow ? (0, import_react37.createElement)(import_react37.Fragment, null, Array.from({ length: depth }, (_, s) => (0, import_react37.createElement)("span", { key: `s${s}`, className: "dshpc-fb__menu-chev-slot", "aria-hidden": true })), (0, import_react37.createElement)("span", { className: "dshpc-fb__menu-chev" }, (0, import_react37.createElement)(official_exports.IconChevronRightOutlineRegular, { size: 11 }))) : null, (0, import_react37.createElement)("span", { className: "dshpc-fb__menu-label" }, crumb.label));
  if (workspaces === void 0) {
    if (crumbs.length === 0)
      return [(0, import_react37.createElement)("div", { key: "empty", className: "dshpc-fb__menu-empty" }, rootFallbackLabel)];
    return crumbs.map((crumb, index) => pathEntry(crumb, index === 0 ? 0 : index - 1, index !== 0));
  }
  const segments = rootName !== "" && crumbs.length > 0 && crumbs[0]?.path === "" ? crumbs.slice(1) : crumbs;
  if (rootName !== "" && workspaces.includes(rootName)) {
    out.push(wsEntry(rootName, true));
    segments.forEach((crumb, i) => {
      out.push(pathEntry(crumb, i));
    });
    for (const ws of workspaces) {
      if (ws !== rootName)
        out.push(wsEntry(ws, false));
    }
  } else {
    segments.forEach((crumb, i) => {
      out.push(pathEntry(crumb, i));
    });
    for (const ws of workspaces)
      out.push(wsEntry(ws, false));
  }
  return out;
}
function FileBrowser(props) {
  ensureControls();
  const tt = props.translate ?? t;
  const picker = props.picker === true;
  const cacheRef = (0, import_react37.useRef)(null);
  if (cacheRef.current === null)
    cacheRef.current = props.rootCache ?? createRootCache();
  const rootCache = props.rootCache ?? cacheRef.current;
  const [mode, setMode] = (0, import_react37.useState)("loading");
  const [dir, setDir] = (0, import_react37.useState)("");
  const [listing, setListing] = (0, import_react37.useState)(null);
  const [truncated, setTruncated] = (0, import_react37.useState)(false);
  const [viewing, setViewing] = (0, import_react37.useState)(null);
  const [listErr, setListErr] = (0, import_react37.useState)(null);
  const [crumbsOverflow, setCrumbsOverflow] = (0, import_react37.useState)(false);
  const [menuOpen, setMenuOpen] = (0, import_react37.useState)(false);
  const regionRef = (0, import_react37.useRef)(null);
  const measureRef = (0, import_react37.useRef)(null);
  const [sourceView, setSourceView] = (0, import_react37.useState)(false);
  const [reloadNonce, setReloadNonce] = (0, import_react37.useState)(0);
  const [copied, setCopied] = (0, import_react37.useState)(false);
  const [openDirs, setOpenDirs] = (0, import_react37.useState)(/* @__PURE__ */ new Set());
  const [childCache, setChildCache] = (0, import_react37.useState)({});
  const [, setRootNonce] = (0, import_react37.useState)(0);
  const [outside, setOutside] = (0, import_react37.useState)(false);
  const noteOutside = (parsed) => {
    if (parsed === null || parsed === void 0)
      return;
    if (!isFailed(parsed)) {
      setOutside(false);
      return;
    }
    const code = bareCode(parsed.failed);
    if (code === "outside-workspace" || code === "not-found" || code === "lookup-not-found")
      setOutside(true);
  };
  const fetchDir = (0, import_react37.useCallback)((targetDir) => {
    setDir(targetDir);
    setViewing(null);
    setListErr(null);
    setMenuOpen(false);
    setMode("loading");
    setOpenDirs(/* @__PURE__ */ new Set());
    setChildCache({});
    props.workspaceFiles.list(props.sessionId, listPathOf(targetDir)).then((result) => {
      const parsed = listingOf(result);
      noteOutside(parsed);
      if (isFailed(parsed)) {
        setListErr(errView(parsed.failed));
        setMode("error");
        return;
      }
      if (parsed === null) {
        setListErr({ key: "previewBadPayload" });
        setMode("error");
        return;
      }
      setListing(parsed.entries);
      setTruncated(parsed.truncated);
      setMode("dir");
    }).catch((error) => {
      setListErr(errView(error));
      setMode("error");
    });
  }, [props.workspaceFiles, props.sessionId]);
  const loadDir = (0, import_react37.useCallback)((targetDir) => {
    if (targetDir === dir) {
      fetchDir(targetDir);
      return;
    }
    fetchDir(targetDir);
  }, [dir, fetchDir]);
  (0, import_react37.useEffect)(() => {
    let alive = true;
    setMode("loading");
    setListErr(null);
    setViewing(null);
    setSourceView(false);
    setReloadNonce(0);
    setMenuOpen(false);
    setOpenDirs(/* @__PURE__ */ new Set());
    setChildCache({});
    const ensureRootLearned = (currentDir) => {
      if (rootCache.get(props.sessionId) !== void 0)
        return;
      void (async () => {
        try {
          const parsed = listingOf(await props.workspaceFiles.list(props.sessionId, listPathOf(currentDir)));
          if (!alive || parsed === null || isFailed(parsed))
            return;
          const stat = props.workspaceFiles.stat;
          if (stat === void 0)
            return;
          const rel = parsed.path;
          const file = parsed.entries.find((entry) => entry.type === "file");
          if (file !== void 0) {
            const sub = rel === "" ? file.name : `${rel}/${file.name}`;
            const abs = await stat(props.sessionId, sub).catch(() => null);
            const absPath = typeof abs?.absolutePath === "string" ? abs.absolutePath : null;
            if (absPath !== null && learnRoot(rootCache, props.sessionId, sub, absPath) !== null) {
              setRootNonce((n) => n + 1);
              return;
            }
          }
          const found = await findAnyFileAbs(props.workspaceFiles, props.sessionId, rel);
          if (found !== null && learnRoot(rootCache, props.sessionId, found.relativePath, found.absolutePath) !== null) {
            setRootNonce((n) => n + 1);
          }
        } catch {
        }
      })();
    };
    props.workspaceFiles.list(props.sessionId, listPathOf(props.path)).then(async (result) => {
      if (!alive)
        return;
      const parsed = listingOf(result);
      if (!isFailed(parsed) && parsed !== null) {
        setOutside(false);
        const absDir = await absolutizeDir(rootCache, props.workspaceFiles, props.sessionId, props.path, parsed.path, parsed.entries);
        if (!alive)
          return;
        setDir(absDir);
        setListing(parsed.entries);
        setTruncated(parsed.truncated);
        setMode("dir");
        ensureRootLearned(absDir);
        return;
      }
      let parent = dirnameOf(props.path);
      if (!isAbsoluteish(props.path)) {
        const stat = props.workspaceFiles.stat;
        if (stat !== void 0) {
          try {
            const res = await stat(props.sessionId, props.path);
            const abs = typeof res.absolutePath === "string" ? res.absolutePath : null;
            if (abs !== null) {
              parent = dirnameOf(abs);
              learnRoot(rootCache, props.sessionId, props.path, abs);
            }
          } catch {
          }
        }
      }
      if (!alive)
        return;
      setDir(parent);
      setViewing(props.path);
      setMode("file");
      ensureRootLearned(parent);
      props.workspaceFiles.list(props.sessionId, listPathOf(parent)).then((pres) => {
        if (!alive)
          return;
        const pl = listingOf(pres);
        noteOutside(pl);
        if (!isFailed(pl) && pl !== null) {
          setListing(pl.entries);
          setTruncated(pl.truncated);
        }
      }).catch(() => {
      });
    }).catch(() => {
      if (!alive)
        return;
      const parent = dirnameOf(props.path);
      setDir(parent);
      setViewing(props.path);
      setMode("file");
      ensureRootLearned(parent);
    });
    return () => {
      alive = false;
    };
  }, [props.workspaceFiles, props.sessionId, props.path, rootCache]);
  (0, import_react37.useLayoutEffect)(() => {
    const region = regionRef.current;
    const measure = measureRef.current;
    if (region === null || measure === null)
      return;
    const recompute = () => {
      setCrumbsOverflow(measure.scrollWidth > region.clientWidth + 1);
    };
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(region);
    return () => ro.disconnect();
  }, [dir, viewing, mode, listing]);
  const reload = (0, import_react37.useCallback)(() => {
    if (viewing !== null) {
      setReloadNonce((n) => n + 1);
      return;
    }
    loadDir(dir);
  }, [viewing, dir, loadDir]);
  const copyPath = (0, import_react37.useCallback)(() => {
    const target = viewing ?? dir;
    if (target === "")
      return;
    const rel = relativizeToRoot(rootCache, props.sessionId, target);
    (0, official_exports.writeClipboard)(rel).then((ok) => {
      if (ok) {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }
    }).catch(() => {
    });
  }, [viewing, dir, rootCache, props.sessionId]);
  const toggleDir = (0, import_react37.useCallback)((path) => {
    setOpenDirs((prev) => {
      const next = new Set(prev);
      if (next.has(path))
        next.delete(path);
      else
        next.add(path);
      return next;
    });
    if (!(path in childCache)) {
      setChildCache((prev) => ({ ...prev, [path]: { status: "loading" } }));
      props.workspaceFiles.list(props.sessionId, listPathOf(path)).then((result) => {
        const parsed = listingOf(result);
        setChildCache((prev) => ({
          ...prev,
          [path]: isFailed(parsed) || parsed === null ? { status: "error", error: errView(isFailed(parsed) ? parsed.failed : void 0) } : { status: "ready", entries: parsed.entries, truncated: parsed.truncated }
        }));
      }).catch((error) => {
        setChildCache((prev) => ({ ...prev, [path]: { status: "error", error: errView(error) } }));
      });
    }
  }, [childCache, props.workspaceFiles, props.sessionId]);
  const renderTree = (0, import_react37.useCallback)((entries2, baseDir) => sortEntries(entries2).map((entry) => {
    const childPath = joinPath(baseDir, entry.name);
    const isDir = entry.type === "directory";
    if (!isDir && picker && !matchesFilter(childPath, false, props.filter))
      return null;
    if (!isDir) {
      const pick2 = () => {
        if (picker && props.onPick !== void 0) {
          props.onPick(relativizeToRoot(rootCache, props.sessionId, childPath), false);
          return;
        }
        const parent = dirnameOf(childPath);
        if (parent !== dir)
          loadDir(parent);
        setViewing(childPath);
        setReloadNonce(0);
        setSourceView(false);
      };
      return (0, import_react37.createElement)("div", {
        key: childPath,
        className: `dshpc-fb__row${picker ? " dshpc-fb__row--pick" : ""}`,
        role: "button",
        tabIndex: 0,
        title: picker ? tt("explorerPickFile") : childPath,
        onClick: pick2,
        onKeyDown: (event) => {
          if (event.key === "Enter" || event.key === " ")
            pick2();
        }
      }, (0, import_react37.createElement)("span", { className: "dshpc-fb__row-icon" }, (0, import_react37.createElement)(official_exports.FileTypeIcon, { path: childPath, size: 18 })), (0, import_react37.createElement)("span", { className: "dshpc-fb__row-name" }, entry.name));
    }
    const cached = childCache[childPath];
    const isOpen2 = openDirs.has(childPath);
    const rowAction = () => {
      toggleDir(childPath);
    };
    const actThisDir = (event) => {
      event.stopPropagation();
      if (picker) {
        if (props.onPick !== void 0)
          props.onPick(relativizeToRoot(rootCache, props.sessionId, childPath), true);
        return;
      }
      loadDir(childPath);
    };
    return (0, import_react37.createElement)(import_react37.Fragment, { key: childPath }, (0, import_react37.createElement)(
      "div",
      {
        className: "dshpc-fb__row",
        role: "button",
        tabIndex: 0,
        title: childPath,
        onClick: rowAction,
        onKeyDown: (event) => {
          if (event.key === "Enter" || event.key === " ")
            rowAction();
        }
      },
      // 展开 / 收起：核心 IconButton，20×20 命中位 + 展开时转 90°（与兄弟 .dsh-tdt-sv-tree-toggle 同款）。
      (0, import_react37.createElement)(IconButton, {
        variant: "plain",
        size: "sm",
        className: `dshpc-fb__row-toggle${isOpen2 ? " dshpc-fb__row-toggle--open" : ""}`,
        icon: (0, import_react37.createElement)(official_exports.IconChevronRightOutlineRegular, { size: 16 }),
        label: isOpen2 ? tt("explorerCollapse") : tt("explorerExpand"),
        "aria-expanded": isOpen2,
        onClick: (event) => {
          event.stopPropagation();
          toggleDir(childPath);
        }
      }),
      (0, import_react37.createElement)("span", { className: "dshpc-fb__row-name" }, entry.name),
      props.onPick === void 0 && picker ? null : (0, import_react37.createElement)(Button, {
        variant: "outline",
        size: "sm",
        className: "dshpc-fb__row-act",
        "aria-label": picker ? tt("explorerPickDirAria") : tt("explorerEnter"),
        onClick: actThisDir
      }, tt(picker ? "explorerPickDir" : "explorerEnter"))
    ), isOpen2 ? (0, import_react37.createElement)(
      "div",
      { className: "dshpc-fb__row-children" },
      // 硬性规定：不新建 Loading、不写加载文案 ⇒ 还在拉就空着（源实现用户 2026-10-05）。
      cached === void 0 || cached.status === "loading" ? null : cached.status === "error" ? (0, import_react37.createElement)("div", { className: "dshpc-fb__row-err" }, tt(cached.error.key, cached.error.params)) : (0, import_react37.createElement)(import_react37.Fragment, null, renderTree(cached.entries, childPath), cached.truncated ? (0, import_react37.createElement)("div", { className: "dshpc-fb__row-note" }, tt("explorerTruncated")) : null)
    ) : null);
  }), [childCache, openDirs, picker, props.filter, props.onPick, props.sessionId, rootCache, dir, loadDir, tt]);
  const rootAbs = rootCache.get(props.sessionId);
  const rootLabel = props.rootName ?? (rootAbs !== void 0 ? baseNameOfPath(rootAbs.replace(/\/+$/, "")) : "");
  const crumbs = rootLabel !== "" ? [{ label: rootLabel, path: "" }, ...crumbsOfDir(relativizeToRoot(rootCache, props.sessionId, dir))] : crumbsOfDir(dir);
  const viewingIsMd = viewing !== null && /\.(md|markdown)$/i.test(viewing);
  const viewingIsHtml = viewing !== null && /\.(html|htm)$/i.test(viewing);
  const switchable = viewingIsMd || viewingIsHtml;
  const menuItems = crumbsMenuEntries({
    workspaces: props.workspaces,
    rootName: rootLabel,
    rootFallbackLabel: tt("explorerRootName"),
    crumbs,
    onPickWorkspace: props.onSelectWorkspace,
    onLoadDir: loadDir
  });
  const crumbButton = (label, onClick, current3 = false) => (0, import_react37.createElement)(Button, {
    variant: "ghost",
    size: "sm",
    className: `dshpc-fb__crumb${current3 ? " dshpc-fb__crumb--current" : ""}`,
    disabled: onClick === void 0,
    tabIndex: onClick === void 0 ? -1 : 0,
    onClick
  }, (0, import_react37.createElement)(MarqueeText, { text: label, className: "dshpc-fb__crumb-mq" }));
  const crumbBar = (0, import_react37.createElement)("nav", { className: "dshpc-fb__bar", "aria-label": tt("explorerCrumbsAria") }, (0, import_react37.createElement)(
    "div",
    { className: "dshpc-fb__menu-wrap" },
    (0, import_react37.createElement)(IconButton, {
      variant: "plain",
      size: "md",
      icon: (0, import_react37.createElement)(official_exports.IconChevronDownOutlineRegular, { size: 14 }),
      label: tt("explorerLevels"),
      "aria-expanded": menuOpen,
      onClick: () => setMenuOpen((v) => !v)
    }),
    // 选层下拉 = 自写浮层（抄兄弟 .dsh-tdt-sv-crumbs-*）：透明遮罩点一下即收，
    // 遮罩层序高于 picker 面板（1100）⇒ 菜单开着时点面板也算「点外部」。
    menuOpen ? (0, import_react37.createElement)(import_react37.Fragment, null, (0, import_react37.createElement)("div", {
      className: "dshpc-fb__crumbs-backdrop",
      onClick: () => setMenuOpen(false)
    }), (0, import_react37.createElement)("div", { className: "dshpc-fb__crumbs-menu", role: "menu" }, menuItems)) : null
  ), (0, import_react37.createElement)(
    "div",
    { ref: regionRef, className: "dshpc-fb__crumbs" },
    // 隐藏测量条：与可见态完全同构的 crumb 按钮，确保溢出判定精确。
    (0, import_react37.createElement)("span", { ref: measureRef, className: "dshpc-fb__crumbs-measure", "aria-hidden": true }, crumbs.length === 0 ? crumbButton(tt("explorerRootName")) : crumbs.map((crumb, index) => (0, import_react37.createElement)(import_react37.Fragment, { key: crumb.path }, index > 0 ? (0, import_react37.createElement)(official_exports.IconChevronRightOutlineRegular, { className: "dshpc-fb__crumb-sep", size: 12 }) : null, crumbButton(crumb.label)))),
    // 工作区根目录（crumbs 空）也要有可见的面包屑占位。
    crumbsOverflow ? crumbButton(crumbs.length > 0 ? crumbs[crumbs.length - 1]?.label ?? tt("explorerRootName") : tt("explorerRootName"), void 0, true) : crumbs.length === 0 ? crumbButton(tt("explorerRootName"), void 0, true) : crumbs.map((crumb, index) => (0, import_react37.createElement)(import_react37.Fragment, { key: crumb.path }, index > 0 ? (0, import_react37.createElement)(official_exports.IconChevronRightOutlineRegular, { className: "dshpc-fb__crumb-sep", size: 12 }) : null, crumbButton(crumb.label, () => loadDir(crumb.path))))
  ), (0, import_react37.createElement)("div", { className: "dshpc-fb__actions" }, props.onClose === void 0 ? null : (0, import_react37.createElement)(IconButton, {
    variant: "plain",
    size: "md",
    icon: (0, import_react37.createElement)(official_exports.IconCloseOutlineRegular, { size: 14 }),
    label: tt("previewClose"),
    onClick: props.onClose
  })));
  const crumbBarPlain = (0, import_react37.createElement)("nav", { className: "dshpc-fb__bar", "aria-label": tt("explorerCrumbsAria") }, (0, import_react37.createElement)(MarqueeText, {
    text: dir,
    title: dir,
    className: "dshpc-fb__bar-plain",
    style: { flex: "1 1 auto", minWidth: 0 }
  }), (0, import_react37.createElement)("div", { className: "dshpc-fb__actions" }, props.onClose === void 0 ? null : (0, import_react37.createElement)(IconButton, {
    variant: "plain",
    size: "md",
    icon: (0, import_react37.createElement)(official_exports.IconCloseOutlineRegular, { size: 14 }),
    label: tt("previewClose"),
    onClick: props.onClose
  })));
  const titleBar = viewing === null ? null : (0, import_react37.createElement)("div", { className: "dshpc-fb__title" }, (0, import_react37.createElement)(MarqueeText, {
    text: baseNameOfPath(viewing),
    title: viewing,
    className: "dshpc-fb__title-inner",
    style: { flex: "1 1 auto", minWidth: 0 }
  }), (0, import_react37.createElement)("div", { className: "dshpc-fb__actions" }, switchable ? (0, import_react37.createElement)(Segmented, {
    size: "sm",
    variant: "default",
    label: viewingIsMd ? tt("previewMdSwitchAria") : tt("previewHtmlSwitchAria"),
    value: sourceView ? "source" : "render",
    items: [
      { value: "render", label: tt("previewRender") },
      { value: "source", label: tt("previewSource") }
    ],
    onChange: (next) => setSourceView(next === "source")
  }) : null, (0, import_react37.createElement)(IconButton, {
    variant: "plain",
    size: "md",
    icon: copied ? (0, import_react37.createElement)(official_exports.IconCheckOutlineRegular, { size: 14 }) : (0, import_react37.createElement)(official_exports.IconCopyOutlineRegular, { size: 14 }),
    label: tt("previewCopyPath"),
    onClick: copyPath
  }), (0, import_react37.createElement)(IconButton, {
    variant: "plain",
    size: "md",
    icon: (0, import_react37.createElement)(official_exports.IconRefreshOutlineRegular, { size: 14 }),
    label: tt("previewRefresh"),
    onClick: reload
  })));
  let body;
  if (viewing !== null) {
    body = (0, import_react37.createElement)(FilePreview, {
      key: `${viewing}:${reloadNonce}`,
      workspaceFiles: props.workspaceFiles,
      officeToPdf: props.officeToPdf ?? null,
      sessionId: props.sessionId,
      path: viewing,
      sourceView,
      translate: tt
    });
  } else if (mode === "error" && listErr !== null) {
    body = (0, import_react37.createElement)("div", { className: "dshpc-fb__body" }, (0, import_react37.createElement)("div", { className: "dshpc-fb__err" }, tt(listErr.key, listErr.params)));
  } else if (listing !== null) {
    const visible = listing.filter((entry) => entry.type === "directory" || matchesFilter(joinPath(dir, entry.name), false, picker ? props.filter : void 0));
    body = visible.length === 0 ? (0, import_react37.createElement)("div", { className: "dshpc-fb__body" }, (0, import_react37.createElement)("div", { className: "dshpc-fb__note" }, tt("explorerEmptyDir"))) : (0, import_react37.createElement)("div", { className: "dshpc-fb__tree" }, renderTree(visible, dir), truncated ? (0, import_react37.createElement)("div", { className: "dshpc-fb__row-note" }, tt("explorerTruncated")) : null);
  } else {
    body = (0, import_react37.createElement)("div", { className: "dshpc-fb__body" });
  }
  return (0, import_react37.createElement)("div", {
    className: "dshpc-fb",
    style: props.style ?? void 0
  }, outside ? crumbBarPlain : crumbBar, titleBar, body);
}

// dist/explorer/open.js
var import_react38 = require("react");
var import_client5 = require("react-dom/client");
var PREVIEW_HOST_ID = "dshpc-file-preview-host";
var PREVIEW_PANEL_ID = "file-preview";
function openFilePreview(options) {
  if (typeof document === "undefined")
    return null;
  const previous = document.getElementById(PREVIEW_HOST_ID);
  if (previous !== null)
    previous.remove();
  const container = document.createElement("div");
  container.id = PREVIEW_HOST_ID;
  container.setAttribute("data-dshpc-file-preview", "");
  container.style.cssText = "display:contents";
  options.mount.appendChild(container);
  const dock = createPanelDock({
    maxPanels: 1,
    defaultWidth: options.width ?? 460,
    minWidth: options.minWidth ?? 320,
    // 每次打开都从默认宽度起步（预览是临时面板，不继承上次的落位）。
    storageKey: false,
    // 关钮被点 ⇒ 整个挂载体回收（close 内部幂等，不受 onClose 回调顺序影响）。
    onClose: () => {
      close();
    }
  });
  dock.open(PREVIEW_PANEL_ID);
  let closed = false;
  const root = (0, import_client5.createRoot)(container);
  const close = () => {
    if (closed)
      return;
    closed = true;
    window.removeEventListener("keydown", onKeyDown);
    root.unmount();
    container.remove();
    options.onClose?.();
  };
  const onKeyDown = (event) => {
    if (event.key === "Escape")
      close();
  };
  window.addEventListener("keydown", onKeyDown);
  ensureControls(getStyleKit());
  root.render((0, import_react38.createElement)(
    "div",
    // 高度吃调用方给的 --dshpc-dock-h（demo 的页面行给 100%）；退化成视口高是整页场景。
    { style: { display: "contents", ["--dshpc-dock-h"]: "100%" } },
    (0, import_react38.createElement)(PanelDock, { dock, mainMinWidth: options.mainMinWidth ?? 480, translate: options.translate }, (0, import_react38.createElement)(DockPanel, {
      id: PREVIEW_PANEL_ID,
      // 不要头部（用户 2026-10-21：核心的『无 header』那版）——上面不再多一条线。
      header: null,
      // 关闭钮不用核心浮动的（那是 absolute 固定偏移、不垂直居中）；关掉它的，
      // 改用 FileBrowser 自己的 ✕（和 pick 弹窗同一个 crumb-bar 钮，垂直居中）。
      closeButton: "none",
      ariaLabel: options.title,
      width: options.width ?? 460,
      minWidth: options.minWidth ?? 320,
      maxWidth: options.maxWidth
    }, (0, import_react38.createElement)(FileBrowser, {
      workspaceFiles: options.workspaceFiles,
      officeToPdf: options.officeToPdf ?? null,
      sessionId: options.sessionId,
      path: options.path,
      rootName: options.rootName,
      workspaces: options.workspaces,
      onSelectWorkspace: options.onSelectWorkspace,
      rootCache: options.rootCache,
      translate: options.translate,
      // 传 onClose ⇒ FileBrowser 在面包屑行尾渲染自己的 ✕（垂直居中，与 pick 一致）。
      onClose: close,
      style: { height: "100%", minHeight: 0 }
    })))
  ));
  return { close, path: options.path };
}
var PICKER_WIDTH = 480;
var PICKER_MAX_H = 660;
var PICKER_MIN_H = 240;
function pickWorkspaceFile(options) {
  return new Promise((resolve) => {
    if (typeof document === "undefined") {
      resolve(null);
      return;
    }
    let settled = false;
    const backdrop = document.createElement("div");
    backdrop.setAttribute("data-dshpc-picker-backdrop", "");
    backdrop.style.cssText = "position:fixed;inset:0;z-index:1099;background:rgba(0,0,0,0.28)";
    const panel = document.createElement("div");
    panel.setAttribute("data-dshpc-picker-panel", "");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    const anchor = options.anchor ?? null;
    if (anchor !== null) {
      const rect = anchor.getBoundingClientRect();
      panel.style.cssText = `position:fixed;z-index:1100;display:flex;flex-direction:column;overflow:hidden;right:${Math.max(12, window.innerWidth - rect.left)}px;bottom:${Math.max(12, window.innerHeight - rect.bottom)}px;width:min(${PICKER_WIDTH}px,calc(100vw - 24px));height:${Math.min(PICKER_MAX_H, Math.max(PICKER_MIN_H, rect.top - 12))}px;background:var(--dshpc-surface-2,#fff);border:1px solid var(--dshpc-border,#d0d7de);border-radius:8px;box-shadow:var(--dshpc-shadow-2,none)`;
    } else {
      panel.style.cssText = `position:fixed;z-index:1100;display:flex;flex-direction:column;overflow:hidden;width:min(${PICKER_WIDTH}px,calc(100vw - 24px));height:${PICKER_MAX_H}px;background:var(--dshpc-surface-2,#fff);border:1px solid var(--dshpc-border,#d0d7de);border-radius:8px;box-shadow:var(--dshpc-shadow-2,none)`;
    }
    const finish = (result) => {
      if (settled)
        return;
      settled = true;
      window.removeEventListener("keydown", onKeyDown);
      backdrop.remove();
      root.unmount();
      panel.remove();
      if (result === null)
        options.onCancel?.();
      resolve(result);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape")
        finish(null);
    };
    backdrop.addEventListener("click", () => finish(null));
    window.addEventListener("keydown", onKeyDown);
    document.body.appendChild(backdrop);
    document.body.appendChild(panel);
    ensureControls(getStyleKit());
    const root = (0, import_client5.createRoot)(panel);
    root.render((0, import_react38.createElement)(FileBrowser, {
      workspaceFiles: options.workspaceFiles,
      officeToPdf: options.officeToPdf ?? null,
      sessionId: options.sessionId,
      path: "",
      rootName: options.rootName,
      rootCache: options.rootCache,
      workspaces: options.workspaces,
      onSelectWorkspace: options.onSelectWorkspace,
      picker: true,
      filter: options.filter,
      translate: options.translate,
      onPick: (path, isDir) => finish({ path, isDir }),
      onClose: () => finish(null),
      style: { flex: "1 1 auto", width: "100%", minWidth: 0, minHeight: 0 }
    }));
  });
}

// dist/session/index.js
var import_react39 = require("react");

// dist/session/types.js
var ROLE_LABEL_KEY = {
  user: "sessionRoleUser",
  assistant: "sessionRoleAssistant",
  tool: "sessionRoleTool",
  system: "sessionRoleTool"
};

// dist/session/index.js
function SessionPreview(props) {
  ensureControls();
  const tt = props.translate ?? t;
  const variant = props.variant ?? "modal";
  const [messages, setMessages] = (0, import_react39.useState)([]);
  const [loading, setLoading] = (0, import_react39.useState)(true);
  const [failed, setFailed] = (0, import_react39.useState)(false);
  const [nonce, setNonce] = (0, import_react39.useState)(0);
  (0, import_react39.useEffect)(() => {
    let alive = true;
    setLoading(true);
    setFailed(false);
    props.source.listMessages(props.sessionId).then((list) => {
      if (alive) {
        setMessages(list);
        setLoading(false);
      }
    }).catch(() => {
      if (alive) {
        setMessages([]);
        setFailed(true);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [props.sessionId, props.source, nonce]);
  const body = loading ? (0, import_react39.createElement)("div", { className: "dshpc-ses__note" }, tt("sessionLoading")) : failed ? (0, import_react39.createElement)(EmptyState, {
    text: tt("sessionFailed"),
    translate: tt,
    action: (0, import_react39.createElement)("button", { type: "button", className: "dshpc-error__retry", onClick: () => setNonce(nonce + 1) }, tt("errorRetry"))
  }) : messages.length === 0 ? (0, import_react39.createElement)(EmptyState, { text: tt("sessionEmpty"), translate: tt }) : (0, import_react39.createElement)("div", { className: "dshpc-ses__list" }, messages.map((m) => props.renderMessage !== void 0 ? (0, import_react39.createElement)("div", { key: m.id }, props.renderMessage(m)) : (0, import_react39.createElement)("div", { key: m.id, className: `dshpc-ses__msg dshpc-ses__msg--${m.role}` }, (0, import_react39.createElement)("div", { className: "dshpc-ses__head" }, tt(ROLE_LABEL_KEY[m.role])), (0, import_react39.createElement)("pre", { className: "dshpc-ses__text" }, m.text), (m.attachments ?? []).length === 0 ? null : (0, import_react39.createElement)("div", { className: "dshpc-ses__atts" }, (m.attachments ?? []).map((a) => (0, import_react39.createElement)("button", {
    key: a.path,
    type: "button",
    className: "dshpc-ses__att",
    onClick: () => props.onOpenFile?.(a.path)
  }, a.name, a.bytes === void 0 ? null : ` ${formatBytes(a.bytes)}`))))));
  if (variant === "modal") {
    return (0, import_react39.createElement)(Modal, {
      title: props.title ?? props.sessionId,
      onClose: props.onClose,
      children: (0, import_react39.createElement)("div", { className: "dshpc-ses", style: { minWidth: "min(720px, 88vw)" } }, body)
    });
  }
  return (0, import_react39.createElement)("div", { className: `dshpc-ses dshpc-ses--${variant}` }, props.onClose === void 0 ? null : (0, import_react39.createElement)("div", { className: "dshpc-ses__head" }, (0, import_react39.createElement)("button", { type: "button", className: "dshpc-exp__crumb", onClick: props.onClose }, "\u2715")), body);
}

// packages/demo/src/samples.ts
var SAMPLE_NAMES = ["README.md", "demo.html", "sample.js", "sample.css"];
var MAX_DIRS_PER_LEVEL = 6;
var MAX_DEPTH = 4;
var SKIP = /* @__PURE__ */ new Set(["node_modules", "dist", ".git", "coverage", "build"]);
async function readDir(files, sessionId, dir) {
  try {
    const parsed = listingOf(await files.list(sessionId, listPathOf(dir)));
    if (parsed === null || isFailed(parsed)) return null;
    return parsed.entries;
  } catch {
    return null;
  }
}
function hitOf(dir, entries2) {
  const names = new Set(entries2.filter((entry) => entry.type === "file").map((entry) => entry.name));
  if (!SAMPLE_NAMES.every((name) => names.has(name))) return null;
  return {
    dir,
    md: joinPath(dir, "README.md"),
    html: joinPath(dir, "demo.html"),
    js: joinPath(dir, "sample.js"),
    css: joinPath(dir, "sample.css")
  };
}
async function findSamples(files, sessionId) {
  const root = await readDir(files, sessionId, "");
  if (root === null) return null;
  let frontier = [""];
  const hit = hitOf("", root);
  if (hit !== null) return hit;
  for (let depth = 0; depth < MAX_DEPTH; depth++) {
    const next = [];
    for (const dir of frontier) {
      const listed = dir === "" ? root : await readDir(files, sessionId, dir);
      if (listed === null) continue;
      const subdirs = listed.filter((entry) => entry.type === "directory" && !SKIP.has(entry.name));
      for (const sub of subdirs.slice(0, MAX_DIRS_PER_LEVEL)) {
        const childPath = joinPath(dir, sub.name);
        const childEntries = await readDir(files, sessionId, childPath);
        if (childEntries === null) continue;
        const found = hitOf(childPath, childEntries);
        if (found !== null) return found;
        next.push(childPath);
      }
    }
    if (next.length === 0) return null;
    frontier = next;
  }
  return null;
}

// packages/demo/src/mock.ts
var mockSessionSource = {
  async listMessages(_sessionId) {
    await delay(150);
    return [
      { id: "1", role: "user", text: "\u5E2E\u6211\u628A\u8FD9\u4E2A\u5305\u6784\u5EFA\u4E00\u4E0B" },
      {
        id: "2",
        role: "assistant",
        text: "\u597D\u7684\uFF0C\u6211\u5148\u8DD1\u7C7B\u578B\u68C0\u67E5\uFF0C\u518D\u51FA dist\u3002",
        attachments: [{ name: "build.log", path: "build.log", bytes: 2048 }]
      },
      { id: "3", role: "tool", text: "tsc -p tsconfig.json \u2192 0 error" },
      { id: "4", role: "assistant", text: "\u6784\u5EFA\u5B8C\u6210\uFF0C\u81EA\u68C0\u5168\u8FC7\u3002" }
    ];
  },
  async download(_sessionId, path) {
    return bytesOfText(`\u9884\u89C8\u5047\u6587\u4EF6\uFF1A${path}`);
  }
};
function bytesOfText(text) {
  return new TextEncoder().encode(text);
}
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// packages/demo/src/sections/blocks.tsx
var CODE_OPEN = `// \u53F3\u4FA7\u505C\u9760\u9884\u89C8\uFF1Adock \u6210\u4E3A\u6574\u9875 flex \u884C\u7684\u6700\u540E\u4E00\u4E2A\u5B50\u9879\uFF08\u4E3B\u533A\u88AB\u771F\u6B63\u6324\u7A84\uFF09
const mount = document.querySelector('.page-row')!
openFilePreview({
  mount,
  workspaceFiles: services.workspaceFiles,   // \u5BBF\u4E3B\u4F1A\u8BDD\u4F5C\u7528\u57DF\u670D\u52A1
  officeToPdf: services.officeToPdf,
  sessionId: anchor.sessionId,
  rootName: anchor.title,
  path: 'packages/demo/src/samples/index.md',
  workspaces: workspaces.map((w) => w.title),
  onSelectWorkspace: (name) => { /* \u6362\u4F1A\u8BDD\u91CD\u5F00\u9884\u89C8 */ },
})`;
var CODE_PICK = `// \u951A\u5B9A\u5F39\u7A97\u9009\u6587\u4EF6\uFF1APromise \u8FD4\u56DE\u5DE5\u4F5C\u533A\u76F8\u5BF9\u8DEF\u5F84\uFF08\u4E0D\u81EA\u5DF1\u6302 dock\uFF09
const result = await pickWorkspaceFile({
  workspaceFiles: services.workspaceFiles,
  officeToPdf: services.officeToPdf,
  sessionId: anchor.sessionId,
  anchor: event.currentTarget,   // \u89E6\u53D1\u5143\u7D20\uFF0C\u5F39\u7A97\u636E\u6B64\u5B9A\u4F4D
  rootName: anchor.title,
  workspaces: workspaces.map((w) => w.title),
  filter: { exts: ['ts'], dirs: true },
})
console.log(result?.path)`;
var CODE_SESSION = `// \u4F1A\u8BDD\u9884\u89C8\uFF1Avariant 'modal' = \u5F39\u7A97\uFF1B'inline' = \u5185\u8054\u5757
<SessionPreview
  sessionId="demo-session"
  source={mockSessionSource}      // \u6570\u636E\u6E90\uFF08\u771F\u5B9E\u8D70\u5BBF\u4E3B\uFF1Bdemo \u7528 mock\uFF09
  variant="modal"
  title="\u4F1A\u8BDD\u9884\u89C8"
  onClose={() => setOpen(false)}
  onOpenFile={() => setOpen(false)}
/>`;
var CODE_BLOCKS_USAGE = `pnpm add dsh-plugin-core

import { openFilePreview, pickWorkspaceFile } from 'dsh-plugin-core/explorer'
import { SessionPreview } from 'dsh-plugin-core/session'

// \u53F3\u4FA7\u505C\u9760\u9884\u89C8\uFF08\u5360\u5BBD\u5EA6\u3001\u6324\u7A84\u4E3B\u533A\uFF09
openFilePreview({ mount, workspaceFiles, officeToPdf, sessionId, path, rootName })

// \u951A\u5B9A\u5F39\u7A97\u9009\u6587\u4EF6\uFF08Promise \u8FD4\u56DE\u8DEF\u5F84\uFF0C\u4E0D\u81EA\u5DF1\u6302 dock\uFF09
const r = await pickWorkspaceFile({ workspaceFiles, sessionId, anchor, rootName })

// \u4F1A\u8BDD\u9884\u89C8
<SessionPreview sessionId="..." source={source} variant="modal" />`;
var EXPLORER_API = [
  { name: "mount", type: "HTMLElement", def: "\u2014", descKey: "apiExplorerMount" },
  { name: "workspaceFiles", type: "WorkspaceFilesFace", def: "\u2014", descKey: "apiExplorerFiles" },
  { name: "sessionId", type: "string", def: "\u2014", descKey: "apiExplorerSession" },
  { name: "path", type: "string", def: "\u2014", descKey: "apiExplorerPath" },
  { name: "rootName", type: "string", def: "\u2014", descKey: "apiExplorerRoot" },
  { name: "workspaces", type: "string[]", def: "\u2014", descKey: "apiExplorerWorkspaces" },
  { name: "onSelectWorkspace", type: "(name) => void", def: "\u2014", descKey: "apiExplorerOnSelect" }
];
var PICK_API = [
  { name: "workspaceFiles", type: "WorkspaceFilesFace", def: "\u2014", descKey: "apiExplorerFiles" },
  { name: "anchor", type: "HTMLElement", def: "\u2014", descKey: "apiPickAnchor" },
  { name: "filter", type: "PickFilter", def: "\u2014", descKey: "apiPickFilter" },
  { name: "sessionId / rootName", type: "string", def: "\u2014", descKey: "apiExplorerSession" }
];
var SESSION_API = [
  { name: "sessionId", type: "string", def: "\u2014", descKey: "apiSessionId" },
  { name: "source", type: "SessionSource", def: "\u2014", descKey: "apiSessionSource" },
  { name: "variant", type: "'modal' | 'inline'", def: "'modal'", descKey: "apiSessionVariant" },
  { name: "title", type: "string", def: "\u2014", descKey: "apiSessionTitle" },
  { name: "onClose / onOpenFile", type: "() => void", def: "\u2014", descKey: "apiSessionCallbacks" }
];
function Row2(props) {
  return (0, import_react40.createElement)("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" } }, ...props.children);
}
function Hint(props) {
  return (0, import_react40.createElement)("span", { style: { fontSize: "12px", color: "var(--dshpc-fg-3)" } }, props.text);
}
function ExplorerPage() {
  const services = (0, import_react40.useSyncExternalStore)(fileServices.subscribe, fileServices.getSnapshot);
  const workspaces = (0, import_react40.useSyncExternalStore)(workspaceList.subscribe, workspaceList.getSnapshot);
  const anchor = pickWorkspaceAnchor(workspaces);
  const [samples, setSamples] = (0, import_react40.useState)(null);
  const [probing, setProbing] = (0, import_react40.useState)(false);
  const [picked, setPicked] = (0, import_react40.useState)(null);
  const files = services.workspaceFiles;
  const officeToPdf = services.officeToPdf;
  const sessionId = anchor?.sessionId ?? "";
  const ready = files !== null && anchor !== null;
  (0, import_react40.useEffect)(() => {
    if (files === null || sessionId === "") return;
    let alive = true;
    setProbing(true);
    void findSamples(files, sessionId).then((found) => {
      if (!alive) return;
      setSamples(found);
      setProbing(false);
    });
    return () => {
      alive = false;
    };
  }, [files, sessionId]);
  const openPreview = (sessionId2, rootName, path) => {
    if (files === null) return;
    const mount = pageRow.element;
    if (mount === null) return;
    openFilePreview({
      // 分栏挂载点 = 整页 flex 行（核心 dock 成为它的最后一个子项 ⇒ 主区被真正挤窄）。
      mount,
      workspaceFiles: files,
      officeToPdf,
      sessionId: sessionId2,
      path,
      rootName,
      // ▾ 选层下拉要列全部工作区（当前工作区展开 + 其余罗列，与兄弟项目一致）。
      workspaces: workspaces.map((item) => item.title),
      // ▾ 里点其他工作区 = 换会话重开预览（dock 是命令式挂载 ⇒ 再 open 一次，旧的自动回收）。
      onSelectWorkspace: (name) => {
        const sid = workspaces.find((item) => item.title === name)?.sessionIds?.[0];
        if (sid !== void 0) openPreview(sid, name, "");
      }
    });
  };
  const open = (path) => {
    if (files === null || anchor === null) return;
    openPreview(anchor.sessionId, anchor.title, path);
  };
  const pick2 = (event, filter) => {
    if (files === null || anchor === null) return;
    void pickWorkspaceFile({
      workspaceFiles: files,
      officeToPdf,
      sessionId: anchor.sessionId,
      anchor: event.currentTarget,
      rootName: anchor.title,
      workspaces: workspaces.map((item) => item.title),
      filter
    }).then((result) => {
      setPicked(result === null ? null : `${result.path}${result.isDir ? `\uFF08${t2("pickFolder")}\uFF09` : ""}`);
    });
  };
  return (0, import_react40.createElement)(
    "div",
    null,
    (0, import_react40.createElement)(Note, { text: t2("blocksNote") }),
    (0, import_react40.createElement)(
      Example,
      { title: t2("explorerDataTitle"), hint: t2("explorerDataHint") },
      files === null ? (0, import_react40.createElement)(Hint, { text: t2("explorerFilesNone") }) : anchor === null ? (0, import_react40.createElement)(Hint, { text: t2("explorerAnchorNone") }) : (0, import_react40.createElement)(Hint, {
        text: `${t2("explorerAnchorLabel")}${anchor.title}\uFF5C${t2("explorerSessionLabel")}${anchor.sessionId}\uFF5C${t2("explorerWorkspaces")}${workspaces.length}`
      })
    ),
    (0, import_react40.createElement)(
      Example,
      { title: t2("methodATitle"), hint: t2("methodAHint"), code: CODE_OPEN },
      ready ? (0, import_react40.createElement)(
        Row2,
        null,
        (0, import_react40.createElement)(Button, { variant: "primary", onClick: () => {
          open("");
        } }, t2("openRootPreview")),
        samples !== null ? (0, import_react40.createElement)(
          Row2,
          null,
          (0, import_react40.createElement)(Button, { onClick: () => {
            open(samples.dir);
          } }, t2("openSamplesDir")),
          (0, import_react40.createElement)(Button, { onClick: () => {
            open(samples.md);
          } }, t2("sampleMd")),
          (0, import_react40.createElement)(Button, { onClick: () => {
            open(samples.html);
          } }, t2("sampleHtml")),
          (0, import_react40.createElement)(Button, { onClick: () => {
            open(samples.js);
          } }, t2("sampleJs")),
          (0, import_react40.createElement)(Button, { onClick: () => {
            open(samples.css);
          } }, t2("sampleCss"))
        ) : (0, import_react40.createElement)(Hint, { text: probing ? t2("samplesProbing") : t2("samplesNotFound") })
      ) : (0, import_react40.createElement)(Hint, { text: t2("explorerFilesNone") })
    ),
    (0, import_react40.createElement)(
      Example,
      { title: t2("methodBTitle"), hint: t2("methodBHint"), code: CODE_PICK },
      ready ? (0, import_react40.createElement)(
        Row2,
        null,
        (0, import_react40.createElement)(Button, { onClick: (event) => {
          pick2(event);
        } }, t2("pickAny")),
        (0, import_react40.createElement)(Button, { onClick: (event) => {
          pick2(event, { exts: ["ts"] });
        } }, t2("pickTs")),
        (0, import_react40.createElement)(Button, { onClick: (event) => {
          pick2(event, { dirs: true });
        } }, t2("pickDir")),
        (0, import_react40.createElement)(Hint, { text: picked === null ? t2("pickNone") : `${t2("pickResult")}\uFF1A${picked}` })
      ) : (0, import_react40.createElement)(Hint, { text: t2("explorerFilesNone") })
    ),
    (0, import_react40.createElement)(Example, { title: t2("previewBodyTitle"), hint: t2("previewBodyHint") }, null),
    (0, import_react40.createElement)(CodeOnly, { labelKey: "docUsage", code: CODE_BLOCKS_USAGE }),
    (0, import_react40.createElement)(ApiTable, { rows: EXPLORER_API }),
    (0, import_react40.createElement)(ApiTable, { rows: PICK_API })
  );
}
function SessionPage() {
  const [open, setOpen] = (0, import_react40.useState)(false);
  return (0, import_react40.createElement)(
    Example,
    { title: "SessionPreview", hint: t2("sessionHint"), code: CODE_SESSION },
    (0, import_react40.createElement)(
      Row2,
      null,
      (0, import_react40.createElement)(Button, { variant: "primary", onClick: () => {
        setOpen(true);
      } }, t2("sessionOpenModal")),
      (0, import_react40.createElement)(Button, { onClick: () => {
        setOpen(false);
      } }, t2("sessionClose"))
    ),
    open ? (0, import_react40.createElement)(SessionPreview, {
      sessionId: "demo-session",
      source: mockSessionSource,
      variant: "modal",
      title: t2("sessionPreviewTitle"),
      onClose: () => {
        setOpen(false);
      },
      onOpenFile: () => {
        setOpen(false);
      }
    }) : null,
    (0, import_react40.createElement)(ApiTable, { rows: SESSION_API })
  );
}

// packages/demo/src/sections/utils.tsx
var import_react41 = require("react");
var CODE_DATE = `// \u65E5\u671F\u65F6\u95F4\u683C\u5F0F\u5316\uFF08\u5168\u90E8\u8D70\u5F53\u524D locale\uFF09
formatDateTime('2026-10-18T09:30:05.000Z', { seconds: true })  // 2026-10-18 09:30:05
formatYmd('2026-10-18T09:30:05.000Z')                          // 2026-10-18
formatClock('2026-10-18T09:30:05.000Z')                        // 09:30:05
formatDurationHms(3_725_000)                                   // 1:02:05
formatRange('2026-10-18T09:00', '2026-10-18T10:30')            // 09:00 \u2013 10:30
relativePast('2026-10-18T11:57', now)                          // 3 \u5206\u949F\u524D
relativeFuture('2026-10-18T12:03', now)                        // 3 \u5206\u949F\u540E`;
var CODE_NUMBER = `formatBytes(125_829)   // 123 KB`;
var CODE_I18N = `import { getLocale, setLocale, t } from 'dsh-plugin-core/utils'

getLocale()     // \u5F53\u524D locale\uFF08\u7531\u5BBF\u4E3B\u9A71\u52A8\uFF09
setLocale('en') // \u5207\u8BED\u8A00\uFF08\u5BBF\u4E3B\u8986\u76D6\u65F6\u4EE5\u6B64\u4E3A\u51C6\uFF09
t('someKey')    // \u53D6\u5F53\u524D\u8BED\u8A00\u7684\u6587\u6848`;
var CODE_UTILS_USAGE = `pnpm add dsh-plugin-core

import {
  formatDateTime, formatYmd, formatClock, formatDurationHms, formatRange,
  relativePast, relativeFuture, formatBytes, getLocale, setLocale, t,
} from 'dsh-plugin-core/utils'`;
var DATE_API = [
  { name: "formatDateTime", type: "(iso, opts?) => string", def: "\u2014", descKey: "apiDateDateTime" },
  { name: "formatYmd", type: "(iso) => string", def: "\u2014", descKey: "apiDateYmd" },
  { name: "formatClock", type: "(iso) => string", def: "\u2014", descKey: "apiDateClock" },
  { name: "formatDurationHms", type: "(ms) => string", def: "\u2014", descKey: "apiDateDuration" },
  { name: "formatRange", type: "(from, to) => string", def: "\u2014", descKey: "apiDateRange" },
  { name: "relativePast", type: "(iso, now) => string", def: "\u2014", descKey: "apiDatePast" },
  { name: "relativeFuture", type: "(iso, now) => string", def: "\u2014", descKey: "apiDateFuture" }
];
var NUMBER_API2 = [
  { name: "formatBytes", type: "(bytes) => string", def: "\u2014", descKey: "apiNumberBytes" }
];
var I18N_API = [
  { name: "getLocale", type: "() => string", def: "\u2014", descKey: "apiI18nGet" },
  { name: "setLocale", type: "(locale) => void", def: "\u2014", descKey: "apiI18nSet" },
  { name: "t", type: "(key) => string", def: "\u2014", descKey: "apiI18nT" }
];
var NOW = Date.parse("2026-10-18T12:00:00.000Z");
var DATE_ROWS = [
  ["formatDateTime", formatDateTime("2026-10-18T09:30:05.000Z", { seconds: true })],
  ["formatYmd", formatYmd("2026-10-18T09:30:05.000Z")],
  ["formatClock", formatClock("2026-10-18T09:30:05.000Z")],
  ["formatDurationHms", formatDurationHms(3725e3)],
  ["formatRange", formatRange("2026-10-18T09:00:00.000Z", "2026-10-18T10:30:00.000Z")],
  ["relativePast", relativePast("2026-10-18T11:57:00.000Z", NOW)],
  ["relativeFuture", relativeFuture("2026-10-18T12:03:00.000Z", NOW)]
];
var NUMBER_ROWS = [
  ["formatBytes", formatBytes(125829)]
];
function FnTable(props) {
  return (0, import_react41.createElement)(
    "table",
    { style: { borderCollapse: "collapse", fontSize: "13px" } },
    (0, import_react41.createElement)(
      "thead",
      null,
      (0, import_react41.createElement)(
        "tr",
        null,
        (0, import_react41.createElement)("th", { style: th }, "\u51FD\u6570"),
        (0, import_react41.createElement)("th", { style: th }, "\u8FD4\u56DE\u503C")
      )
    ),
    (0, import_react41.createElement)(
      "tbody",
      null,
      props.rows.map(
        ([fn, out]) => (0, import_react41.createElement)(
          "tr",
          { key: fn },
          (0, import_react41.createElement)("td", { style: td }, fn),
          (0, import_react41.createElement)("td", { style: td }, out)
        )
      )
    )
  );
}
var th = { textAlign: "left", padding: "6px 14px 6px 0", color: "var(--dshpc-fg-3)" };
var td = { padding: "5px 14px 5px 0", borderTop: "1px solid var(--dshpc-border-faint)" };
function DatePage() {
  return (0, import_react41.createElement)(
    "div",
    null,
    (0, import_react41.createElement)(Note, { text: t2("utilsNote") }),
    (0, import_react41.createElement)(Example, { title: "date / time", hint: t2("dateHint"), code: CODE_DATE }, (0, import_react41.createElement)(FnTable, { rows: DATE_ROWS })),
    (0, import_react41.createElement)(CodeOnly, { labelKey: "docUsage", code: CODE_UTILS_USAGE }),
    (0, import_react41.createElement)(ApiTable, { rows: DATE_API })
  );
}
function NumberPage() {
  return (0, import_react41.createElement)(
    "div",
    null,
    (0, import_react41.createElement)(Note, { text: t2("utilsNote") }),
    (0, import_react41.createElement)(Example, { title: "number / bytes", hint: t2("numberHint"), code: CODE_NUMBER }, (0, import_react41.createElement)(FnTable, { rows: NUMBER_ROWS })),
    (0, import_react41.createElement)(CodeOnly, { labelKey: "docUsage", code: CODE_UTILS_USAGE }),
    (0, import_react41.createElement)(ApiTable, { rows: NUMBER_API2 })
  );
}
function TextPage() {
  return (0, import_react41.createElement)(Placeholder, { descKey: "textDesc" });
}
function HttpPage() {
  return (0, import_react41.createElement)(Placeholder, { descKey: "httpDesc" });
}
function I18nPage() {
  return (0, import_react41.createElement)(
    "div",
    null,
    (0, import_react41.createElement)(Note, { text: t2("utilsNote") }),
    (0, import_react41.createElement)(
      Example,
      { title: "getLocale / setLocale", hint: t2("i18nDesc"), code: CODE_I18N },
      (0, import_react41.createElement)(
        "div",
        { style: { display: "flex", alignItems: "center", gap: "10px" } },
        (0, import_react41.createElement)("span", { style: { fontFamily: "var(--dshpc-font-mono)", fontSize: "12px", color: "var(--dshpc-fg-3)" } }, t2("i18nNow")),
        (0, import_react41.createElement)("code", {
          style: {
            fontFamily: "var(--dshpc-font-mono)",
            fontSize: "13px",
            padding: "3px 10px",
            borderRadius: "6px",
            background: "var(--dshpc-open-bg)",
            color: "var(--dshpc-business)"
          }
        }, getLocale())
      )
    ),
    (0, import_react41.createElement)(CodeOnly, { labelKey: "docUsage", code: CODE_UTILS_USAGE }),
    (0, import_react41.createElement)(ApiTable, { rows: I18N_API })
  );
}

// packages/demo/src/sections/reference.tsx
var import_react42 = require("react");
var OUT_OF_SCOPE = ["roadmapOut", "roadmapMirror", "roadmapPreview", "roadmapSkeleton"];
function ReferencePage() {
  return (0, import_react42.createElement)(
    "div",
    null,
    (0, import_react42.createElement)(Note, { text: t2("referenceNote") }),
    (0, import_react42.createElement)(Example, { title: t2("secA11y") }, (0, import_react42.createElement)(Placeholder, { descKey: "a11yDesc" })),
    (0, import_react42.createElement)(
      Example,
      { title: t2("secRoadmap"), hint: t2("roadmapHint") },
      (0, import_react42.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "10px" } },
        OUT_OF_SCOPE.map(
          (key) => (0, import_react42.createElement)(
            "div",
            { key, style: { display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "13px" } },
            (0, import_react42.createElement)("span", { style: { color: "var(--dshpc-fg-4)", flex: "none", lineHeight: "1.7" } }, "\xB7"),
            (0, import_react42.createElement)("span", { style: { color: "var(--dshpc-fg-2)", lineHeight: "1.7" } }, t2(key))
          )
        ),
        (0, import_react42.createElement)(
          "div",
          { style: { marginTop: "2px", fontSize: "12px", color: "var(--dshpc-fg-3)" } },
          t2("roadmapLayout")
        )
      )
    ),
    (0, import_react42.createElement)(
      Example,
      { title: t2("secBuild"), hint: t2("buildDesc") },
      (0, import_react42.createElement)(
        "table",
        { style: { borderCollapse: "collapse", fontSize: "13px" } },
        (0, import_react42.createElement)(
          "tbody",
          null,
          [
            [t2("buildCore"), `v${"0.2.14"}`],
            [t2("buildDemo"), `v${"0.2.14"}`],
            [t2("buildStamp"), "1021-0939-iwdf"]
          ].map(
            ([label, value]) => (0, import_react42.createElement)(
              "tr",
              { key: label },
              (0, import_react42.createElement)("td", { style: { padding: "5px 18px 5px 0", color: "var(--dshpc-fg-3)", whiteSpace: "nowrap" } }, label),
              (0, import_react42.createElement)("td", {
                style: {
                  padding: "5px 14px 5px 0",
                  fontFamily: "var(--dshpc-font-mono)",
                  color: "var(--dshpc-fg)",
                  wordBreak: "break-all"
                }
              }, value)
            )
          )
        )
      )
    )
  );
}

// packages/demo/src/sections/index.tsx
var SECTION_GROUPS = [
  { id: "start", titleKey: "grpStart" },
  { id: "components", titleKey: "grpComponents" },
  { id: "blocks", titleKey: "grpBlocks" },
  { id: "utils", titleKey: "grpUtils" },
  { id: "reference", titleKey: "grpReference" }
];
var ALL_SECTIONS = [
  // 入门：原来的「开始」与「设计基础」两组并成一级，各占一页
  { id: "quickstart", group: "start", titleKey: "secQuickstart", render: () => (0, import_react43.createElement)(QuickstartPage, null) },
  { id: "foundation", group: "start", titleKey: "secFoundation", render: () => (0, import_react43.createElement)(FoundationPage, null) },
  { id: "button", group: "components", titleKey: "secButton", render: () => (0, import_react43.createElement)(ButtonPage, null) },
  { id: "input", group: "components", titleKey: "secInput", render: () => (0, import_react43.createElement)(InputPage, null) },
  { id: "picker", group: "components", titleKey: "secPicker", render: () => (0, import_react43.createElement)(PickerPage, null) },
  { id: "tooltip", group: "components", titleKey: "secTooltip", render: () => (0, import_react43.createElement)(TooltipPage, null) },
  { id: "card", group: "components", titleKey: "secCard", render: () => (0, import_react43.createElement)(CardPage, null) },
  { id: "chip", group: "components", titleKey: "secChip", render: () => (0, import_react43.createElement)(ChipPage, null) },
  { id: "feedback", group: "components", titleKey: "secFeedback", render: () => (0, import_react43.createElement)(FeedbackPage, null) },
  { id: "layout", group: "components", titleKey: "secLayout", render: () => (0, import_react43.createElement)(LayoutPage, null) },
  { id: "explorer", group: "blocks", titleKey: "secExplorer", render: () => (0, import_react43.createElement)(ExplorerPage, null) },
  { id: "session", group: "blocks", titleKey: "secSession", render: () => (0, import_react43.createElement)(SessionPage, null) },
  { id: "date", group: "utils", titleKey: "secDate", render: () => (0, import_react43.createElement)(DatePage, null) },
  { id: "text", group: "utils", titleKey: "secText", render: () => (0, import_react43.createElement)(TextPage, null) },
  { id: "number", group: "utils", titleKey: "secNumber", render: () => (0, import_react43.createElement)(NumberPage, null) },
  { id: "http", group: "utils", titleKey: "secHttp", render: () => (0, import_react43.createElement)(HttpPage, null) },
  { id: "i18n", group: "utils", titleKey: "secI18n", render: () => (0, import_react43.createElement)(I18nPage, null) },
  // 参考：无障碍 / 路线图 / 版本构建三条并成一页
  { id: "reference", group: "reference", titleKey: "secReference", render: () => (0, import_react43.createElement)(ReferencePage, null) }
];
function Placeholder(props) {
  return (0, import_react43.createElement)(
    "div",
    {
      style: {
        marginTop: "4px",
        padding: "16px 18px",
        border: "1px dashed var(--dshpc-border)",
        borderRadius: "8px",
        background: "var(--dshpc-surface-sunken)",
        color: "var(--dshpc-fg-3)"
      }
    },
    (0, import_react43.createElement)("div", {
      style: {
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: ".06em",
        textTransform: "uppercase",
        color: "var(--dshpc-fg-4)",
        marginBottom: "10px"
      }
    }, t2("phTodo")),
    (0, import_react43.createElement)("div", { style: { fontSize: "13px", lineHeight: "1.9", whiteSpace: "pre-line" } }, t2(props.descKey))
  );
}
function SectionHead2(props) {
  return (0, import_react43.createElement)(
    "div",
    { id: `sec-${props.id}`, style: { margin: "28px 0 14px" } },
    (0, import_react43.createElement)("h2", { style: { margin: 0, fontSize: "20px" } }, props.title),
    (0, import_react43.createElement)("div", { style: { height: "3px", width: "36px", background: "var(--dshpc-business)", borderRadius: "2px", marginTop: "6px" } })
  );
}
function Sections(props) {
  const current3 = ALL_SECTIONS.find((s) => s.id === props.active) ?? ALL_SECTIONS[0];
  return (0, import_react43.createElement)(
    "div",
    null,
    (0, import_react43.createElement)(SectionHead2, { id: current3.id, title: t2(current3.titleKey) }),
    current3.render()
  );
}

// packages/demo/src/demo-css.generated.ts
var DEMO_CSS = "/* demo \u9884\u89C8\u7AD9\u7684\u6587\u6863\u9AA8\u67B6\u6837\u5F0F\uFF08Bootstrap \u6587\u6863\u7AD9\u5F0F\uFF1A\u63D0\u793A\u6846 + \u5DE6\u793A\u4F8B\u53F3\u4EE3\u7801 + \u7528\u6CD5 + API \u8868\uFF09\u3002\n   \u771F\u6E90\u5728\u8FD9\u91CC\uFF0C\u7531 scripts/gen-css.mjs \u751F\u6210 demo-css.generated.ts\uFF0C\u8FD0\u884C\u65F6\u7ECF createStyleKit \u6CE8\u5165\u3002\n   \u53EA\u6D88\u8D39 var(--dshpc-*)\uFF1A\u660E\u6697\u4EA4\u7ED9 token\uFF0C\u672C\u6587\u4EF6\u4E0D\u5199\u6B7B\u4EFB\u4F55\u989C\u8272\u3002 */\n\n/* \u5907\u6CE8\u6846\u672C\u4F53\u662F\u6838\u5FC3 StripCard\uFF08\u65B9\u89D2 + \u5DE6 4px \u901A\u9AD8\u8272\u6761 + \u540C\u8272\u7CFB\u6D45\u5E95\uFF09\uFF0C\u8FD9\u91CC\u53EA\u8865\u884C\u5185\u6392\u7248\u3002 */\n.dshpc-doc-note {\n  margin-bottom: 16px;\n}\n\n.dshpc-doc-note__body {\n  display: flex;\n  gap: 8px;\n  font-size: var(--dshpc-font-md);\n  line-height: var(--dshpc-line-md);\n}\n\n.dshpc-doc-note__mark {\n  flex: none;\n  font-weight: 600;\n  color: var(--dshpc-business);\n}\n\n/* \u8FB9\u6846\u76D2\uFF1A\u7528\u6CD5\u5757 / API \u8868\u7684\u5171\u540C\u5916\u58F3 */\n.dshpc-doc-block {\n  border: 1px solid var(--dshpc-border-faint);\n  border-radius: var(--dshpc-radius-md);\n  background: var(--dshpc-surface-1);\n  padding: 12px 14px;\n  margin: 0 0 16px;\n}\n\n.dshpc-doc-label {\n  font-size: var(--dshpc-font-xs);\n  font-weight: 600;\n  letter-spacing: 0.06em;\n  text-transform: uppercase;\n  color: var(--dshpc-fg-4);\n  margin-bottom: 8px;\n}\n\n.dshpc-doc-example {\n  border: 1px solid var(--dshpc-border-faint);\n  border-radius: var(--dshpc-radius-md);\n  background: var(--dshpc-surface-1);\n  overflow: hidden;\n  margin: 0 0 16px;\n}\n\n.dshpc-doc-example__head {\n  padding: 10px 14px;\n  border-bottom: 1px solid var(--dshpc-border-faint);\n}\n\n.dshpc-doc-example__title {\n  font-size: var(--dshpc-font-lg);\n  font-weight: 600;\n  color: var(--dshpc-fg);\n}\n\n.dshpc-doc-example__hint {\n  margin-top: 2px;\n  font-size: var(--dshpc-font-sm);\n  line-height: var(--dshpc-line-sm);\n  color: var(--dshpc-fg-3);\n}\n\n/* \u4E24\u680F\uFF1B\u5BB9\u5668\u7A84\u5230\u653E\u4E0D\u4E0B\u4E24\u5217 300px \u65F6\u81EA\u52A8\u584C\u6210\u4E00\u5217\uFF08\u4EE3\u7801\u843D\u5230\u793A\u4F8B\u4E0B\u65B9\uFF09\u3002 */\n.dshpc-doc-example__body {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n}\n\n.dshpc-doc-example__demo {\n  min-width: 0;\n  padding: 14px;\n}\n\n.dshpc-doc-example__code {\n  min-width: 0;\n  padding: 14px;\n  border-left: 1px solid var(--dshpc-border-faint);\n  background: var(--dshpc-code-surface);\n}\n\n/* \u4EE3\u7801\u53EA\u5728\u5185\u5C42\u6EDA\uFF1A\u8868\u5934\u300C\u4EE3\u7801\u300D\u4E24\u4E2A\u5B57\u4E0D\u88AB\u6EDA\u8D70 */\n.dshpc-doc-example__scroll {\n  max-height: 320px;\n  overflow: auto;\n}\n\n.dshpc-doc-api {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: var(--dshpc-font-md);\n}\n\n.dshpc-doc-api th,\n.dshpc-doc-api td {\n  text-align: left;\n  padding: 6px 10px;\n  border-bottom: 1px solid var(--dshpc-border-faint);\n  vertical-align: top;\n}\n\n.dshpc-doc-api th {\n  font-weight: 600;\n  color: var(--dshpc-fg-3);\n  white-space: nowrap;\n}\n\n.dshpc-doc-api td:first-child {\n  font-family: var(--dshpc-font-mono);\n  white-space: nowrap;\n  color: var(--dshpc-fg);\n}\n";

// packages/demo/src/paths.ts
var MODELS_PATH = "/api/dsh-plugin-core-demo/models";

// packages/demo/src/client/index.tsx
var PANEL_ID = "dsh-plugin-core-demo";
var localeRuntime;
function useLocaleTick() {
  const [, setTick] = (0, import_react44.useState)(0);
  (0, import_react44.useEffect)(() => {
    const rt = localeRuntime;
    if (rt === void 0) return;
    return rt.subscribe(() => {
      setTick((v) => v + 1);
    });
  }, []);
}
function DemoPage() {
  useLocaleTick();
  const [active, setActive] = (0, import_react44.useState)(ALL_SECTIONS[0].id);
  const nav = [];
  SECTION_GROUPS.forEach((group, gi) => {
    nav.push(
      (0, import_react44.createElement)(
        "div",
        {
          key: `group-${group.id}`,
          style: {
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: ".06em",
            textTransform: "uppercase",
            color: "var(--dshpc-fg-4)",
            padding: gi === 0 ? "0 10px 6px" : "16px 10px 6px"
          }
        },
        t2(group.titleKey)
      )
    );
    for (const section of ALL_SECTIONS.filter((s) => s.group === group.id)) {
      nav.push(
        (0, import_react44.createElement)(
          "button",
          {
            key: section.id,
            type: "button",
            onClick: () => {
              setActive(section.id);
            },
            style: {
              display: "block",
              width: "100%",
              textAlign: "left",
              border: "none",
              cursor: "pointer",
              background: active === section.id ? "var(--dshpc-open-bg)" : "transparent",
              color: active === section.id ? "var(--dshpc-business)" : "var(--dshpc-fg)",
              padding: "7px 10px",
              borderRadius: "6px",
              fontSize: "13px",
              marginBottom: "2px"
            }
          },
          t2(section.titleKey)
        )
      );
    }
  });
  return (0, import_react44.createElement)(
    "div",
    {
      // 分栏挂载点：explorer 的 openFilePreview 要把 dock 塞进这一行，主区才被挤窄。
      ref: (element) => {
        pageRow.element = element;
      },
      style: {
        display: "flex",
        alignItems: "stretch",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        // 分栏是页面级布局成员：高度吃这个变量（默认 100vh 是给整页场景的，这里是宿主页面区）。
        ["--dshpc-dock-h"]: "100%"
      }
    },
    (0, import_react44.createElement)(
      "aside",
      {
        style: {
          width: "180px",
          flex: "none",
          height: "100%",
          boxSizing: "border-box",
          padding: "14px 10px",
          overflowY: "auto",
          borderRight: "1px solid var(--dshpc-border-faint)",
          fontFamily: "var(--dshpc-font-md)"
        }
      },
      nav
    ),
    (0, import_react44.createElement)(
      "main",
      { style: { flex: 1, minWidth: 0, minHeight: 0, height: "100%", boxSizing: "border-box", overflowY: "auto", padding: "12px 22px 60px" } },
      (0, import_react44.createElement)(Sections, { active })
    ),
    // 分栏挂在**整页**右侧（真实用法），不是塞进某一节里：任何一页点开都挤窄 main。
    // 内容与头部在 demoPanels() 里声明（DockPanel），这里只管显隐。
    (0, import_react44.createElement)(PanelDock, { dock: demoDock }, ...demoPanels())
  );
}
function OpenPreviewCard(props) {
  return (0, import_react44.createElement)(
    "div",
    {
      role: "button",
      onClick: () => {
        props.open?.();
      },
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        padding: "12px 14px",
        borderRadius: "var(--dshpc-radius-md)",
        border: "1px solid var(--dshpc-border)",
        background: "var(--dshpc-surface-1)"
      }
    },
    (0, import_react44.createElement)(
      "div",
      null,
      (0, import_react44.createElement)("div", { style: { fontWeight: 600, fontSize: "14px" } }, t2("pluginTitle")),
      (0, import_react44.createElement)(
        "div",
        { style: { color: "var(--dshpc-fg-3)", fontSize: "12px", marginTop: "2px" } },
        t2("pluginCardDesc")
      )
    ),
    (0, import_react44.createElement)("span", { style: { color: "var(--dshpc-business)", fontSize: "13px" } }, t2("pluginCardOpen"))
  );
}
function PanelIcon() {
  return (0, import_react44.createElement)(
    "span",
    { style: { display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "13px" } },
    "\u25E7"
  );
}
function apply(ctx) {
  const kit = createStyleKit({ id: "dsh-plugin-core-plugin" });
  setStyleKit(kit);
  ensureControls(kit);
  kit.registerStyle("demo", DEMO_CSS);
  kit.ensureStyles();
  setTooltipRenderer((props) => (0, import_react44.createElement)(import_dsh_client_ui_primitives4.Tooltip, props));
  let jump = () => {
  };
  ctx.inject(["layout"], (sub) => {
    const select = sub?.layout?.selectPanel;
    if (typeof select === "function") jump = (id) => {
      select(id);
    };
  });
  connectHost(ctx, { modelsPath: MODELS_PATH });
  connectFileServices(ctx);
  ctx.inject(["locale"], (sub) => {
    const loc = sub?.locale;
    if (loc === void 0) return;
    localeRuntime = loc;
    try {
      loc.register(PANEL_ID, "zh", { ...DICT2.zh });
      loc.register(PANEL_ID, "en", { ...DICT2.en });
      setDemoTranslate(loc.bind(PANEL_ID));
    } catch {
    }
    const sync = () => {
      setLocale(loc.getLocale().active === "en" ? "en" : "zh");
    };
    sync();
    loc.subscribe(sync);
  });
  ctx.inject(["slots"], (sub) => {
    const slots = sub.slots;
    if (slots === void 0) return;
    slots.inject("sidebar.panellist", () => {
      slots.register(
        { name: "sidebar.panellist", id: PANEL_ID, order: 90, label: () => t2("pluginTitle") },
        PanelIcon
      );
    });
    slots.inject("main", () => {
      slots.register({ name: "main", key: PANEL_ID }, DemoPage);
    });
    slots.inject("settings.plugin.item", () => {
      slots.register(
        {
          name: "settings.plugin.item",
          key: PANEL_ID,
          // 由宿主把「跳整页」的 open 回注给卡片组件
          inject: () => ({ open: () => {
            jump(PANEL_ID);
          } })
        },
        (props) => (0, import_react44.createElement)(OpenPreviewCard, { open: props?.open ?? (() => {
          jump(PANEL_ID);
        }) })
      );
    });
  });
}

return module.exports; } });

