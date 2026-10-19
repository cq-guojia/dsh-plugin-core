window.__ModuleLoader__.load({ id: "dsh-plugin-core-demo", factory: (require) => {
var module = { exports: {} }; var exports = module.exports;

"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/demo/src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply
});
module.exports = __toCommonJS(index_exports);
var import_react29 = require("react");
var import_dsh_client_ui_primitives2 = require("@deepseek-ai/dsh-client-ui-primitives");

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
    const entries = [...domains.entries()];
    entries.sort((a, b) => a[0] === TOKENS_DOMAIN ? -1 : b[0] === TOKENS_DOMAIN ? 1 : 0);
    return entries.map(([, css]) => css).join("\n");
  };
  const flush = () => {
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
      flush();
  };
  const registerStyle = (domain, css) => {
    if (domains.get(domain) === css)
      return;
    domains.set(domain, css);
    dirty = true;
    if (tag?.isConnected === true)
      flush();
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
var FIELD_CSS = "\n/* \u2500\u2500 \u8F93\u5165\u7C7B P3 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.dshpc-input{box-sizing:border-box;border:1px solid var(--dshpc-border);border-radius:var(--dshpc-radius-md);\n  background:var(--dshpc-surface-1);color:var(--dshpc-fg);font-family:inherit;outline:none;\n  transition:border-color var(--dshpc-dur-fast) var(--dshpc-ease),box-shadow var(--dshpc-dur-fast) var(--dshpc-ease);}\n.dshpc-input--sm{height:var(--dshpc-control-h-sm);padding:0 8px;font-size:var(--dshpc-font-sm);line-height:var(--dshpc-line-sm);}\n.dshpc-input--md{height:var(--dshpc-control-h-md);padding:0 10px;font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);}\n.dshpc-input--lg{height:var(--dshpc-control-h-lg);padding:0 12px;font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);}\n.dshpc-input::placeholder{color:var(--dshpc-fg-dim);}\n.dshpc-input:focus{border-color:var(--dshpc-focus);box-shadow:0 0 0 1px var(--dshpc-focus);}\n.dshpc-input--error{border-color:var(--dshpc-danger);}\n.dshpc-input:disabled{cursor:default;opacity:.5;}\n\n.dshpc-pfx{display:inline-flex;align-items:center;box-sizing:border-box;overflow:hidden;\n  border:1px solid var(--dshpc-border);border-radius:var(--dshpc-radius-md);background:var(--dshpc-surface-1);color:var(--dshpc-fg);}\n.dshpc-pfx--sm{height:var(--dshpc-control-h-sm);}\n.dshpc-pfx--md{height:var(--dshpc-control-h-md);}\n.dshpc-pfx--lg{height:var(--dshpc-control-h-lg);}\n/* md / lg \u6863\u5B57\u53F7\u8DDF\u6863\u8D70\uFF08\u4E0E\u540C\u6863\u4E0B\u62C9\u540C\u5B57\u53F7\uFF09\uFF1A\u6B64\u524D\u5199\u6B7B sm(12px)\uFF0C\u540C\u6392\u4E0B\u62C9\u662F 13px \u21D2 \u663E\u5F97\u300Cinput \u5B57\u5C0F\u300D\u3002 */\n.dshpc-pfx--md .dshpc-pfx__label,.dshpc-pfx--lg .dshpc-pfx__label{font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);}\n.dshpc-pfx--md .dshpc-pfx__input,.dshpc-pfx--lg .dshpc-pfx__input{font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);}\n.dshpc-pfx--error{border-color:var(--dshpc-danger);}\n.dshpc-pfx:focus-within{border-color:var(--dshpc-focus);box-shadow:0 0 0 1px var(--dshpc-focus);}\n.dshpc-pfx__label{padding:0 8px;color:var(--dshpc-fg-2);font-size:var(--dshpc-font-sm);line-height:var(--dshpc-line-sm);white-space:nowrap;border-right:1px solid var(--dshpc-border);}\n.dshpc-pfx__input{flex:1 1 auto;min-width:0;height:100%;padding:0 8px;border:0;background:transparent;color:var(--dshpc-fg);\n  font-family:inherit;font-size:var(--dshpc-font-sm);line-height:var(--dshpc-line-sm);outline:none;}\n.dshpc-pfx__input::placeholder{color:var(--dshpc-fg-dim);}\n\n.dshpc-num{display:inline-flex;align-items:center;justify-content:space-between;box-sizing:border-box;overflow:hidden;\n  border:1px solid var(--dshpc-border);border-radius:var(--dshpc-radius-md);background:var(--dshpc-surface-1);color:var(--dshpc-fg);}\n/* \u4E2D\u6BB5\uFF1A\u6570\u5B57 + \u540E\u7F00\u6210\u7EC4\u5C45\u4E2D\uFF1B\u5BB9\u5668\u88AB\u6D88\u8D39\u7AEF\u62C9\u5BBD\u65F6\u5403\u6389\u5168\u90E8\u4F59\u91CF\uFF0C\u4E24\u7AEF \u2212 / + \u56E0\u6B64\u9489\u6B7B\u5728\u5DE6\u53F3\u8FB9\u7F18\u3002 */\n.dshpc-num__mid{display:flex;align-items:center;justify-content:center;flex:1 1 auto;min-width:0;}\n.dshpc-num--sm{height:var(--dshpc-control-h-sm);}\n.dshpc-num--md{height:var(--dshpc-control-h-md);}\n.dshpc-num--lg{height:var(--dshpc-control-h-lg);}\n.dshpc-num--md .dshpc-num__input,.dshpc-num--lg .dshpc-num__input{font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);}\n.dshpc-num--md .dshpc-num__suffix,.dshpc-num--lg .dshpc-num__suffix{font-size:var(--dshpc-font-md);}\n.dshpc-num--disabled{opacity:.5;}\n.dshpc-num__input{width:36px;height:100%;padding:0 2px;border:0;background:transparent;color:var(--dshpc-fg);\n  font-family:inherit;font-size:var(--dshpc-font-sm);line-height:var(--dshpc-line-sm);text-align:center;outline:none;}\n.dshpc-num__suffix{padding:0 6px;color:var(--dshpc-fg-2);font-size:var(--dshpc-font-sm);white-space:nowrap;}\n.dshpc-num .dshpc-iconbtn{border-radius:0;color:var(--dshpc-fg-2);flex:none;}\n\n/* \u5B98\u65B9 Switch \u5305\u88C5\u7EDF\u4E00\uFF1A\u9009\u4E2D = success \u7EFF\u3002\n   \uFF08\u5408\u5E76\u539F\u5148 task-editor-css / task-list \u4E24\u5904\u5C31\u5730\u8986\u76D6\uFF1B\u9009\u62E9\u5668\u5E26\u5305\u88C5\u7C7B + role\uFF0C\u7279\u5F02\u6027\u9AD8\u4E8E\u5B98\u65B9\u3002\uFF09 */\n.dshpc-switch button[role='switch'][aria-checked='true']{background:var(--dshpc-success);}\n\n/* \u591A\u884C\u6587\u672C\u8F93\u5165\uFF08\u63D0\u793A\u8BCD\u7B49\uFF0CP3\uFF09\uFF1A**\u8FB9\u6846 / \u5706\u89D2 / \u5E95 / \u7126\u70B9\u6001\u4E0E Input \u540C\u4E00\u5957\u53E3\u5F84**\uFF08\u7528\u6237 2026-10-20\uFF1A\n   \u300C\u591A\u884C\u8F93\u5165\u5E94\u8BE5\u548C input \u7684\u8FB9\u513F\u662F\u4E00\u4E2A\u9053\u7406\uFF0C\u5305\u62EC\u5706\u89D2\u5728\u5185\uFF0C\u90FD\u662F\u4E00\u4E2A\u4E1C\u897F\u300D\uFF09\u3002\n   \u26A0\uFE0F \u65E7\u610F\u56FE\u300C\u5361\u5185\u65E0\u8FB9\u6846\u3001\u89C6\u89C9\u91CD\u5FC3\u5728\u6574\u5F20\u5361\u4E0A\u300D\u5DF2\u4F5C\u5E9F \u2014\u2014 \u73B0\u5728\u5B83\u5C31\u662F\u4E00\u53EA\u5E26\u6846\u7684\u591A\u884C\u8F93\u5165\u6846\u3002\n   \uFF08\u4ECE task-editor-css \u7684 .dshpc-ed-prompt \u4E0A\u63D0\u800C\u6765\uFF1B\u4E1A\u52A1\u6587\u4EF6\u4E0D\u518D\u81EA\u5199 textarea \u76AE\u80A4\u3002\uFF09 */\n.dshpc-textarea{display:block;width:100%;box-sizing:border-box;min-height:132px;padding:8px 12px;\n  border:1px solid var(--dshpc-border);border-radius:var(--dshpc-radius-md);outline:none;\n  background:var(--dshpc-surface-1);color:var(--dshpc-fg);font-family:inherit;font-size:var(--dshpc-font-lg);line-height:1.6;resize:vertical;\n  transition:border-color var(--dshpc-dur-fast) var(--dshpc-ease),box-shadow var(--dshpc-dur-fast) var(--dshpc-ease);}\n.dshpc-textarea::placeholder{color:var(--dshpc-fg-dim);}\n.dshpc-textarea:focus{border-color:var(--dshpc-focus);box-shadow:0 0 0 1px var(--dshpc-focus);}\n/* \u6821\u9A8C\u4E0D\u901A\u8FC7\uFF1A\u4E0E Input \u4E00\u81F4\uFF0C\u8D70\u8FB9\u6846\u63CF\u7EA2\uFF08\u65E7\u7248\u662F box-shadow \u63CF\u7EA2\u76D2\uFF0C\u4E0E Input \u4E0D\u540C\u53E3\u5F84\uFF09 */\n.dshpc-textarea--error{border-color:var(--dshpc-danger);}\n.dshpc-textarea:disabled{cursor:default;opacity:.5;}\n@media (prefers-reduced-motion: reduce){.dshpc-textarea{transition:none;}}\n\n/* \u62D6\u62FD\u5206\u9694\u6761\uFF08\u7F16\u8F91\u5206\u680F / \u9884\u89C8 dock \u5171\u7528\uFF0CU20 #3\uFF09\uFF1A6px \u547D\u4E2D\u533A\uFF0Ccol-resize\uFF0C\u4E0D\u753B\u7EBF\uFF0Chover/\u6309\u4E0B\u6D6E\u51FA\u6D45\u5E26\u3002\n   \u5177\u4F53 z-index \u7531 .dshpc-ed-resizer / .dshpc-sv-resizer \u5404\u81EA\u8865\u3002 */\n.dshpc-resizer{position:absolute;top:0;bottom:0;left:0;width:6px;cursor:col-resize;background:0 0;touch-action:none;user-select:none;}\n.dshpc-resizer:hover,.dshpc-resizer:active{background:var(--dshpc-hover,rgba(38,49,72,.06));}\n\n@media (prefers-reduced-motion: reduce){.dshpc-input,.dshpc-pfx{transition:none;}}\n";

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
.dshpc-picker__caret{color:var(--dshpc-fg-3);font-size:10px}
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
var FEEDBACK_CSS = "\n.dshpc-modal-mask{\n  position:fixed;inset:0;z-index:1070;display:flex;align-items:center;justify-content:center;\n  background:rgba(15,23,42,.45);\n}\n.dshpc-modal{\n  display:flex;flex-direction:column;max-width:min(960px,92vw);max-height:86vh;\n  background:var(--dshpc-surface-base);border:1px solid var(--dshpc-border);\n  border-radius:10px;box-shadow:0 16px 48px rgba(15,23,42,.24);overflow:hidden;\n}\n.dshpc-modal__head{\n  display:flex;align-items:center;gap:8px;padding:12px 14px;\n  border-bottom:1px solid var(--dshpc-border-faint);color:var(--dshpc-fg);font-size:14px;\n}\n.dshpc-modal__title{flex:1;min-width:0}\n/* \u5173\u95ED\u6309\u94AE\uFF1A24\xD724 \u65B9\u89D2\u56FE\u6807\u4F4D\uFF0C\u4E0D\u501F\u7528 Picker \u7684\u89E6\u53D1\u5668\u76AE\u80A4\uFF08\u90A3\u4EFD\u5E26 min-width:120px\uFF09\u3002 */\n.dshpc-modal__close{\n  display:inline-flex;align-items:center;justify-content:center;flex:none;\n  width:24px;height:24px;padding:0;border:none;border-radius:var(--dshpc-radius-sm);\n  background:transparent;color:var(--dshpc-fg-3);font-family:inherit;font-size:12px;line-height:1;cursor:pointer;\n  transition:background-color var(--dshpc-dur-fast) var(--dshpc-ease),color var(--dshpc-dur-fast) var(--dshpc-ease);\n}\n.dshpc-modal__close:hover{background:var(--dshpc-hover);color:var(--dshpc-fg)}\n.dshpc-modal__close:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:1px}\n.dshpc-modal__body{flex:1;min-height:0;overflow:auto;padding:12px 14px}\n.dshpc-modal__foot{\n  display:flex;justify-content:flex-end;gap:8px;padding:10px 14px;\n  border-top:1px solid var(--dshpc-border-faint);\n}\n.dshpc-toast-host{\n  position:fixed;z-index:1090;left:50%;bottom:32px;transform:translateX(-50%);\n  display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;\n}\n.dshpc-toast{\n  padding:8px 14px;border-radius:8px;font-size:13px;color:var(--dshpc-fg);\n  background:var(--dshpc-surface-menu);border:1px solid var(--dshpc-border);\n  box-shadow:0 8px 24px rgba(15,23,42,.16);\n}\n.dshpc-toast--success{color:var(--dshpc-success);border-color:color-mix(in srgb,var(--dshpc-success) 40%,transparent)}\n.dshpc-toast--error{color:var(--dshpc-danger);border-color:color-mix(in srgb,var(--dshpc-danger) 40%,transparent)}\n.dshpc-empty{\n  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;\n  padding:24px;color:var(--dshpc-fg-3);font-size:13px;text-align:center;\n}\n.dshpc-error{\n  padding:12px 14px;border-radius:8px;font-size:13px;\n  color:var(--dshpc-danger);background:color-mix(in srgb,var(--dshpc-danger) 10%,transparent);\n  border:1px solid color-mix(in srgb,var(--dshpc-danger) 30%,transparent);\n}\n.dshpc-error__retry{\n  margin-top:8px;color:var(--dshpc-link);cursor:pointer;background:none;border:none;padding:0;\n}\n";

// dist/ui/card-css.generated.js
var CARD_CSS = "\n.dshpc-card{\n  position:relative;padding:12px 14px;background:var(--dshpc-surface-1);\n  --card-accent:var(--dshpc-business);\n}\n/* \u6863\u4F4D \u2192 token\uFF08\u7167 records-timeline \u7684 tone \u6A21\u5F0F\uFF1A\u4E00\u4E2A\u53D8\u91CF\u5207\u6863\uFF0C\u4E0D\u5199 5 \u5957\u89C4\u5219\uFF09\u3002 */\n.dshpc-card--success{--card-accent:var(--dshpc-success)}\n.dshpc-card--warning{--card-accent:var(--dshpc-warning)}\n.dshpc-card--danger{--card-accent:var(--dshpc-danger)}\n.dshpc-card--neutral{--card-accent:var(--dshpc-fg-4)}\n\n/* \u5916\u89C2\u4E00\uFF1A\u5706\u89D2 + 1px \u8FB9\u6846\uFF0C\u8272\u6761\u4E0A\u4E0B\u7559\u8DDD\uFF08\u77ED\u6761\uFF09\u3002 */\n.dshpc-card--bordered{border-radius:8px;border:1px solid var(--dshpc-border)}\n.dshpc-card--bordered .dshpc-card__bar{top:8px;bottom:8px;border-radius:2px}\n\n/* \u5916\u89C2\u4E8C\uFF1A\u65E0\u5706\u89D2\u65E0\u8FB9\u6846\uFF0C\u8272\u6761\u901A\u9AD8\u3002 */\n.dshpc-card--strip{border-radius:0;border:none}\n.dshpc-card--strip .dshpc-card__bar{top:0;bottom:0;border-radius:0}\n\n/* \u8272\u6761\uFF1A\u7EDD\u5BF9\u5B9A\u4F4D + top/bottom \u21D2 \u8DDF\u7740\u5185\u5BB9\u9AD8\u5EA6\u81EA\u9002\u5E94\uFF1B\u4E0A\u4E0B\u662F\u5426\u7559\u8DDD\u7531\u5916\u89C2\u51B3\u5B9A\u3002 */\n.dshpc-card__bar{position:absolute;left:0;width:3px;background:var(--card-accent)}\n\n.dshpc-card__head{display:flex;align-items:flex-start;gap:8px;min-width:0}\n.dshpc-card__main{flex:1;min-width:0}\n.dshpc-card__side{display:flex;align-items:center;gap:6px;flex:none}\n.dshpc-card__toggle{\n  display:inline-flex;align-items:center;justify-content:center;\n  width:24px;height:24px;padding:0;background:none;border:none;border-radius:6px;\n  color:var(--dshpc-fg-3);cursor:pointer;\n}\n.dshpc-card__toggle:hover{background:var(--dshpc-surface-sunken);color:var(--dshpc-fg)}\n.dshpc-card__caret{display:inline-block;font-size:10px;transition:transform .15s ease}\n.dshpc-card__caret.is-open{transform:rotate(180deg)}\n.dshpc-card__panel{margin-top:8px;padding-top:8px;border-top:1px solid var(--dshpc-border-faint)}\n";

// dist/ui/chip-css.generated.js
var CHIP_CSS = "\n/* \u4E09\u6761\u5C40\u90E8\u53D8\u91CF\u627F\u8F7D\u914D\u8272\uFF1Aneutral \u8D70\u65E7\u7070\u9762\uFF1B\u8BED\u4E49\u6863\u6362\u5E95\u5B57\u914D\u5BF9\uFF082026-10-20 \u7528\u6237\u8981\u591A\u8272\u591A\u5C3A\u5BF8\u6807\u7B7E\uFF09\u3002 */\n.dshpc-chip{--chip-bg:var(--dshpc-chip-bg);--chip-fg:var(--dshpc-fg);--chip-bg-hover:var(--dshpc-chip-bg-hover);\n  display:inline-flex;align-items:center;justify-content:center;gap:4px;padding:1px 8px;\n  box-sizing:border-box;border-radius:var(--dshpc-radius-pill,999px);border:none;\n  background:var(--chip-bg);color:var(--chip-fg);\n  font-family:inherit;font-size:11px;line-height:18px;margin:0;\n  /* 2026-10-18\uFF1Achip \u662F flex \u884C\u91CC\u7684\u5E38\u7528\u9879\uFF0C\u7981\u6B62\u88AB\u538B\u7F29\u6362\u884C\uFF08\u9884\u89C8\u7AD9\u51FA\u73B0\u8FC7\u6587\u5B57\u7AD6\u6392\u3001\u4E92\u76F8\u53E0\u538B\u7684\u6324\u538B\uFF09\u3002 */\n  white-space:nowrap;flex:none;\n  appearance:none;-webkit-appearance:none;\n}\n/* md \u6863\uFF1A\u5361\u7247\u5143\u4FE1\u606F\u884C\u7B49\u7A0D\u5927\u573A\u666F\uFF1Bsm \u5373\u65E7\u7248\u9ED8\u8BA4\uFF0C\u9010\u50CF\u7D20\u4E0D\u52A8\u3002 */\n.dshpc-chip--md{padding:2px 10px;font-size:12px;line-height:20px;}\n/* \u8BED\u4E49\u8272\u5B9E\u5FC3\u6863\uFF1A\u5E95 / \u5B57 / hover \u914D\u5BF9\u4E0E Button \u540C\u6E90\uFF08\u9EC4\u5E95\u4E2D\u9AD8\u660E\u5EA6 \u21D2 \u5B57\u7528 --dshpc-on-warning\uFF09\u3002 */\n.dshpc-chip--business{--chip-bg:var(--dshpc-business);--chip-fg:var(--dshpc-on-signal);--chip-bg-hover:var(--dshpc-business-hover);}\n.dshpc-chip--success{--chip-bg:var(--dshpc-success);--chip-fg:var(--dshpc-on-signal);--chip-bg-hover:var(--dshpc-success-hover);}\n.dshpc-chip--warning{--chip-bg:var(--dshpc-warning);--chip-fg:var(--dshpc-on-warning);--chip-bg-hover:var(--dshpc-warning-hover);}\n.dshpc-chip--danger{--chip-bg:var(--dshpc-danger);--chip-fg:var(--dshpc-on-signal);--chip-bg-hover:var(--dshpc-danger-hover);}\n/* \u53EF\u70B9\u6001\uFF1Abutton \u6E32\u67D3\uFF08\u89C1 Chip.ts\uFF09\uFF0C\u5149\u6807 + hover \u52A0\u6DF1\u3002 */\n.dshpc-chip--clickable{cursor:pointer;transition:background-color var(--dshpc-dur-fast) var(--dshpc-ease);}\n.dshpc-chip--clickable:hover:not(:disabled){background:var(--chip-bg-hover)}\n.dshpc-chip:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:1px}\n.dshpc-chip:disabled{cursor:default;color:var(--dshpc-fg-3)}\n@media (prefers-reduced-motion: reduce){.dshpc-chip{transition:none}}\n";

// dist/explorer/explorer-css.generated.js
var EXPLORER_CSS = "\n.dshpc-exp{display:flex;flex-direction:column;height:100%;min-height:0;color:var(--dshpc-fg);font-size:13px}\n.dshpc-exp__crumbs{\n  display:flex;align-items:center;gap:2px;flex-wrap:wrap;padding:6px 8px;\n  border-bottom:1px solid var(--dshpc-border-faint);\n}\n.dshpc-exp__crumb{\n  background:none;border:none;padding:2px 4px;border-radius:4px;cursor:pointer;\n  color:var(--dshpc-link);font:inherit;\n}\n.dshpc-exp__crumb--current{color:var(--dshpc-fg);font-weight:600;cursor:default}\n.dshpc-exp__sep{color:var(--dshpc-fg-4)}\n.dshpc-exp__tools{display:flex;gap:6px;margin-left:auto}\n.dshpc-exp__body{display:flex;flex:1;min-height:0}\n.dshpc-exp__tree{width:220px;flex:none;overflow:auto;border-right:1px solid var(--dshpc-border-faint)}\n.dshpc-exp__item{\n  display:flex;align-items:center;gap:6px;padding:4px 8px;cursor:pointer;white-space:nowrap;\n}\n.dshpc-exp__item:hover{background:var(--dshpc-surface-sunken)}\n.dshpc-exp__item--active{background:var(--dshpc-open-bg)}\n.dshpc-exp__icon{width:14px;flex:none;color:var(--dshpc-fg-3)}\n.dshpc-exp__name{overflow:hidden;text-overflow:ellipsis}\n.dshpc-exp__size{margin-left:auto;color:var(--dshpc-fg-4);font-size:11px}\n.dshpc-exp__preview{flex:1;min-width:0;overflow:auto;padding:8px}\n.dshpc-exp__note{padding:6px 8px;color:var(--dshpc-fg-3);font-size:11px}\n.dshpc-exp__text{\n  margin:0;padding:8px;border-radius:6px;background:var(--dshpc-code-surface);\n  font:var(--dshpc-code-font);white-space:pre-wrap;word-break:break-all;\n}\n.dshpc-exp__image{max-width:100%;border-radius:6px;border:1px solid var(--dshpc-border-faint)}\n";

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
  MARQUEE_CSS
].join("\n");
var current = createStyleKit({ id: "dsh-plugin-core-ui" });
function setStyleKit(kit) {
  current = kit;
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
var import_react = require("react");

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
    explorerUnsupported: "\u6682\u4E0D\u652F\u6301\u9884\u89C8\u8BE5\u7C7B\u578B",
    explorerRoot: "\u5DE5\u4F5C\u533A",
    explorerUp: "\u4E0A\u4E00\u7EA7",
    explorerRefresh: "\u5237\u65B0",
    explorerTruncated: "\u6761\u76EE\u8FC7\u591A\uFF0C\u5DF2\u622A\u65AD",
    explorerEmptyDir: "\u7A7A\u76EE\u5F55",
    cardToggle: "\u5C55\u5F00/\u6536\u8D77",
    modalClose: "\u5173\u95ED",
    emptyText: "\u6682\u65E0\u6570\u636E",
    errorTitle: "\u51FA\u9519\u4E86",
    errorRetry: "\u91CD\u8BD5",
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
    explorerUnsupported: "Preview not supported",
    explorerRoot: "Workspace",
    explorerUp: "Up",
    explorerRefresh: "Refresh",
    explorerTruncated: "Too many entries, truncated",
    explorerEmptyDir: "Empty folder",
    cardToggle: "Expand/Collapse",
    modalClose: "Close",
    emptyText: "No data",
    errorTitle: "Something went wrong",
    errorRetry: "Retry",
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

// dist/ui/Picker.js
function Picker(props) {
  ensureControls();
  const tt = props.translate ?? t;
  const mode = props.mode ?? "single";
  const size = props.size ?? "md";
  const placement = props.placement ?? "down";
  const clearable = props.clearable === true;
  const showLabels = props.showLabels !== false;
  const groups = (0, import_react.useMemo)(() => toGroups(props.groups, props.options), [props.groups, props.options]);
  const controlled = props.value !== void 0;
  const [inner, setInner] = (0, import_react.useState)(() => toArray(props.defaultValue));
  const selected = controlled ? toArray(props.value) : inner;
  const emit = (next) => {
    if (!controlled)
      setInner(next);
    props.onChange?.(mode === "single" ? next[0] ?? "" : next);
  };
  const [open, setOpen] = (0, import_react.useState)(false);
  const [query, setQuery] = (0, import_react.useState)("");
  const [active, setActive] = (0, import_react.useState)(-1);
  const rootRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
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
  (0, import_react.useEffect)(() => {
    if (open)
      return;
    setQuery("");
    setActive(-1);
  }, [open]);
  const shown = filterGroups(groups, query);
  const flat = flattenOptions(shown);
  const atMax = mode === "multiple" && props.max !== void 0 && selected.length >= props.max;
  const summary = selected.length === 0 ? props.placeholder ?? tt("pickerPlaceholder") : mode === "multiple" && !showLabels ? tt("pickerSelected", { n: selected.length }) : labelsOf(groups, selected).join("\u3001") || (props.placeholder ?? tt("pickerPlaceholder"));
  const pick = (value) => {
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
        pick(hit.value);
    }
  };
  return (0, import_react.createElement)("div", {
    className: `dshpc-picker${props.className === void 0 ? "" : ` ${props.className}`}`,
    ref: rootRef,
    onKeyDown
  }, (0, import_react.createElement)("button", {
    type: "button",
    "aria-label": props.ariaLabel,
    "aria-expanded": open,
    className: `dshpc-picker__trigger dshpc-picker__trigger--${size}`,
    disabled: props.disabled === true,
    onClick: () => {
      if (props.disabled !== true)
        setOpen(!open);
    }
  }, (0, import_react.createElement)("span", null, summary), (0, import_react.createElement)("span", { className: "dshpc-picker__caret" }, "\u25BE")), open ? (0, import_react.createElement)("div", {
    className: placement === "up" ? "dshpc-picker__menu dshpc-picker__menu--up" : "dshpc-picker__menu"
  }, props.degraded === true ? (0, import_react.createElement)("div", { className: "dshpc-picker__degraded" }, tt("pickerDegraded")) : null, atMax ? (0, import_react.createElement)("div", { className: "dshpc-picker__degraded" }, tt("pickerMaxReached", { n: props.max ?? 0 })) : null, props.searchable === true ? (0, import_react.createElement)("input", {
    className: "dshpc-picker__search",
    placeholder: tt("pickerSearch"),
    value: query,
    onChange: (e) => setQuery(e.target.value)
  }) : null, flat.length === 0 && groups.length === 0 ? (0, import_react.createElement)("div", { className: "dshpc-picker__empty" }, tt("pickerEmpty")) : flat.length === 0 ? (0, import_react.createElement)("div", { className: "dshpc-picker__empty" }, tt("pickerNoMatch")) : [
    clearable && mode === "single" && selected.length > 0 ? (0, import_react.createElement)("div", {
      key: "__clear__",
      className: "dshpc-picker__option dshpc-picker__option--clear",
      onClick: clear
    }, tt("pickerClear")) : null,
    ...shown.map((g) => (0, import_react.createElement)("div", { key: g.value || "_" }, g.label === "" ? null : (0, import_react.createElement)("div", { className: "dshpc-picker__group-label" }, g.label), g.options.map((o) => {
      const activeCls = [
        "dshpc-picker__option",
        selected.includes(o.value) ? "dshpc-picker__option--active" : "",
        o.disabled === true || atMax ? "dshpc-picker__option--disabled" : ""
      ].filter((s) => s !== "").join(" ");
      const idx = flat.indexOf(o);
      return (0, import_react.createElement)("div", {
        key: o.value,
        className: activeCls,
        "data-active": idx === active ? "true" : void 0,
        onClick: () => {
          if (o.disabled !== true && !atMax)
            pick(o.value);
        }
      }, mode === "multiple" ? (0, import_react.createElement)("span", { className: "dshpc-picker__tick" }, selected.includes(o.value) ? "\u2713" : "") : null, (0, import_react.createElement)("span", null, o.label));
    })))
  ]) : null);
}
function toArray(v) {
  if (v === void 0)
    return [];
  return Array.isArray(v) ? [...v] : [v];
}

// dist/ui/ModelPicker.js
var import_react2 = require("react");
function ModelPicker(props) {
  ensureControls();
  const tt = props.translate ?? t;
  const value = props.value;
  const variant = props.variant ?? "flat";
  const cur = value ?? "";
  if (variant === "flat") {
    return (0, import_react2.createElement)(Picker, {
      options: flattenOptions(props.groups),
      value,
      defaultValue: props.defaultValue,
      placeholder: tt("modelModel"),
      degraded: props.degraded,
      disabled: props.disabled,
      clearable: props.clearable,
      searchable: props.searchable ?? true,
      size: props.size,
      placement: props.placement,
      className: props.className,
      onChange: (v) => props.onChange?.(typeof v === "string" ? v : v[0] ?? "")
    });
  }
  const group = groupOf(props.groups, cur);
  const provider = group?.value ?? "";
  return (0, import_react2.createElement)("div", { className: "dshpc-picker__row" }, (0, import_react2.createElement)(Picker, {
    options: props.groups.map((g) => ({ value: g.value, label: g.label })),
    value: provider === "" ? void 0 : provider,
    placeholder: tt("modelProvider"),
    disabled: props.disabled,
    // 换供应商 ⇒ 清空已选模型（旧的模型不属于新供应商）；参数不用，故不命名
    onChange: () => props.onChange?.("")
  }), (0, import_react2.createElement)(Picker, {
    options: group?.options ?? [],
    value,
    defaultValue: props.defaultValue,
    placeholder: tt("modelModel"),
    degraded: props.degraded,
    disabled: props.disabled === true || provider === "",
    clearable: props.clearable,
    searchable: props.searchable ?? true,
    size: props.size,
    placement: props.placement,
    className: props.className,
    onChange: (v) => props.onChange?.(typeof v === "string" ? v : v[0] ?? "")
  }));
}

// dist/ui/WorkspacePicker.js
var import_react3 = require("react");
function WorkspacePicker(props) {
  ensureControls();
  const tt = props.translate ?? t;
  return (0, import_react3.createElement)(Picker, {
    options: props.workspaces.map((w) => ({ value: w, label: w })),
    value: props.value,
    defaultValue: props.defaultValue,
    mode: props.mode,
    max: props.max,
    onChange: props.onChange,
    clearable: props.clearable,
    searchable: props.searchable ?? true,
    placeholder: props.placeholder ?? tt("explorerRoot"),
    disabled: props.disabled,
    size: props.size,
    placement: props.placement,
    className: props.className
  });
}
function FilePicker(props) {
  ensureControls();
  const tt = props.translate ?? t;
  return (0, import_react3.createElement)(Picker, {
    options: props.files.map((f) => ({ value: f, label: f })),
    value: props.value,
    defaultValue: props.defaultValue,
    mode: props.mode,
    max: props.max,
    onChange: props.onChange,
    clearable: props.clearable,
    searchable: props.searchable ?? true,
    placeholder: props.placeholder ?? tt("pickerPlaceholder"),
    disabled: props.disabled,
    size: props.size,
    placement: props.placement,
    className: props.className
  });
}

// dist/ui/Modal.js
var import_react4 = require("react");
function Modal(props) {
  ensureControls();
  const tt = props.translate ?? t;
  const closeOnMask = props.closeOnMask !== false;
  const escClose = props.escClose !== false;
  (0, import_react4.useEffect)(() => {
    if (!escClose || props.onClose === void 0)
      return;
    const onKey = (e) => {
      if (e.key === "Escape")
        props.onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [escClose, props.onClose]);
  return (0, import_react4.createElement)("div", {
    className: "dshpc-modal-mask",
    onClick: () => {
      if (closeOnMask)
        props.onClose?.();
    }
  }, (0, import_react4.createElement)("div", {
    className: "dshpc-modal",
    style: props.maxWidth === void 0 ? void 0 : { maxWidth: props.maxWidth },
    onClick: (e) => e.stopPropagation()
  }, props.hideHeader === true || props.title === void 0 && props.onClose === void 0 ? null : (0, import_react4.createElement)("div", { className: "dshpc-modal__head" }, (0, import_react4.createElement)("div", { className: "dshpc-modal__title" }, props.title ?? ""), props.onClose === void 0 ? null : (0, import_react4.createElement)("button", {
    type: "button",
    className: "dshpc-modal__close",
    "aria-label": tt("modalClose"),
    onClick: () => props.onClose?.()
  }, "\u2715")), (0, import_react4.createElement)("div", { className: "dshpc-modal__body" }, props.children ?? null), props.footer === void 0 ? null : (0, import_react4.createElement)("div", { className: "dshpc-modal__foot" }, props.footer)));
}

// dist/ui/Card.js
var import_react5 = require("react");
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
  return (0, import_react5.createElement)("div", { className: classes, style }, (0, import_react5.createElement)("span", { className: "dshpc-card__bar", "aria-hidden": true }), (0, import_react5.createElement)("div", { className: "dshpc-card__head" }, (0, import_react5.createElement)("div", { className: "dshpc-card__main" }, props.children ?? null), props.action === void 0 && props.onToggle === void 0 ? null : (0, import_react5.createElement)("div", { className: "dshpc-card__side" }, props.action ?? null, props.onToggle === void 0 ? null : (0, import_react5.createElement)("button", {
    type: "button",
    className: "dshpc-card__toggle",
    "aria-label": tt("cardToggle"),
    "aria-expanded": props.expanded === true,
    onClick: props.onToggle
  }, (0, import_react5.createElement)("span", { className: props.expanded === true ? "dshpc-card__caret is-open" : "dshpc-card__caret" }, "\u25BE")))), props.panel === void 0 || props.expanded !== true ? null : (0, import_react5.createElement)("div", { className: "dshpc-card__panel" }, props.panel));
}
function Card(props) {
  return CardShell("bordered", props);
}
function StripCard(props) {
  return CardShell("strip", props);
}

// dist/ui/Chip.js
var import_react6 = require("react");
function Chip(props) {
  ensureControls();
  const clickable = props.onClick !== void 0;
  const tone = props.tone ?? "neutral";
  const size = props.size ?? "sm";
  return (0, import_react6.createElement)(clickable ? "button" : "span", {
    type: clickable ? "button" : void 0,
    className: `dshpc-chip${tone !== "neutral" ? ` dshpc-chip--${tone}` : ""}${size !== "sm" ? ` dshpc-chip--${size}` : ""}${clickable ? " dshpc-chip--clickable" : ""}${props.className === void 0 ? "" : ` ${props.className}`}`,
    onClick: props.onClick
  }, props.children ?? null);
}

// dist/ui/Toast.js
var HOST_ID = "dshpc-toast-host";
var DEFAULT_MS = 2600;
function showToast(message, opts) {
  if (typeof document === "undefined")
    return;
  ensureControls();
  const variant = opts?.variant ?? "info";
  const host = ensureHost();
  const el = document.createElement("div");
  el.className = `dshpc-toast${variant === "info" ? "" : ` dshpc-toast--${variant}`}`;
  el.textContent = message;
  host.appendChild(el);
  setTimeout(() => {
    el.remove();
    if (host.childElementCount === 0)
      host.remove();
  }, opts?.durationMs ?? DEFAULT_MS);
}
function ensureHost() {
  const found = document.getElementById(HOST_ID);
  if (found !== null)
    return found;
  const host = document.createElement("div");
  host.id = HOST_ID;
  host.className = "dshpc-toast-host";
  document.body.appendChild(host);
  return host;
}

// dist/ui/EmptyState.js
var import_react7 = require("react");
function EmptyState(props) {
  ensureControls();
  const tt = props.translate ?? t;
  return (0, import_react7.createElement)("div", { className: "dshpc-empty" }, props.icon ?? null, (0, import_react7.createElement)("div", null, props.text ?? tt("emptyText")), props.action ?? null);
}

// dist/ui/ErrorBoundary.js
var import_react8 = require("react");
var ErrorBoundary = class extends import_react8.Component {
  constructor() {
    super(...arguments);
    this.state = { error: null };
    this.retry = () => {
      this.setState({ error: null });
    };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    this.props.onError?.(error, info);
  }
  render() {
    const err = this.state.error;
    if (err === null)
      return this.props.children ?? null;
    ensureControls();
    if (this.props.fallback !== void 0)
      return this.props.fallback(err, this.retry);
    const tt = this.props.translate ?? t;
    return (0, import_react8.createElement)("div", { className: "dshpc-error" }, (0, import_react8.createElement)("div", null, `${tt("errorTitle")}\uFF1A${err.message}`), (0, import_react8.createElement)("button", { type: "button", className: "dshpc-error__retry", onClick: this.retry }, tt("errorRetry")));
  }
};

// dist/ui/Button.js
var import_react9 = require("react");
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
  return (0, import_react9.createElement)("button", attrs, loading ? (0, import_react9.createElement)("svg", {
    className: "dshpc-btn__spinner",
    viewBox: "0 0 12 12",
    width: 12,
    height: 12,
    "aria-hidden": true
  }, (0, import_react9.createElement)("circle", {
    cx: 6,
    cy: 6,
    r: 4.75,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    // 周长 ≈ 29.85，画 22 的弧 + 足够长的空缺 ⇒ 一个约 270° 的开口环
    strokeDasharray: "22 30"
  })) : icon !== void 0 && icon !== null ? (0, import_react9.createElement)("span", { className: "dshpc-btn__icon" }, icon) : null, children, iconRight !== void 0 && iconRight !== null ? (0, import_react9.createElement)("span", { className: "dshpc-btn__icon-end" }, iconRight) : null);
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
  return (0, import_react9.createElement)("button", attrs, icon);
}

// dist/ui/Segmented.js
var import_react10 = require("react");
function Segmented(props) {
  ensureControls();
  ensureControls();
  const size = props.size ?? "lg";
  const variant = props.variant ?? "default";
  const multiple = props.multiple === true;
  const value = props.value;
  const onChange = props.onChange;
  return (0, import_react10.createElement)("div", {
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
    return (0, import_react10.createElement)("button", {
      key: item.value,
      type: "button",
      className: "dshpc-seg__item",
      // 选中态用 aria-pressed 表达 ⇒ 读屏可读，皮肤也只认这一个选择器
      "aria-pressed": on,
      disabled,
      onClick: handle
    }, item.label, item.count !== void 0 && item.count > 0 ? (0, import_react10.createElement)("span", { className: "dshpc-seg__count" }, String(item.count)) : null, item.badge !== void 0 && item.badge > 0 ? (0, import_react10.createElement)("span", { className: "dshpc-seg__badge" }, String(item.badge)) : null);
  }));
}

// dist/ui/Textarea.js
var import_react11 = require("react");
function Textarea(props) {
  ensureControls();
  const { value, onChange, placeholder, error, disabled, id, rows, spellCheck, className, style } = props;
  return (0, import_react11.createElement)("textarea", {
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
}

// dist/ui/Checkbox.js
var import_react12 = require("react");
function Checkbox(props) {
  const { checked, onChange, label, accentColor, disabled, className } = props;
  return (0, import_react12.createElement)("label", {
    className: `dshpc-checkbox${className !== void 0 && className !== "" ? ` ${className}` : ""}`,
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: "8px",
      fontSize: "var(--dshpc-font-md)",
      lineHeight: "var(--dshpc-line-md)",
      cursor: disabled === true ? "default" : "pointer"
    }
  }, (0, import_react12.createElement)("input", {
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
  }), label !== void 0 ? (0, import_react12.createElement)("span", null, label) : null);
}

// dist/ui/MarqueeText.js
var import_react13 = require("react");
function MarqueeText(props) {
  const outerRef = (0, import_react13.useRef)(null);
  const innerRef = (0, import_react13.useRef)(null);
  const [dist, setDist] = (0, import_react13.useState)(0);
  const measure = (0, import_react13.useCallback)(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (outer === null || inner === null)
      return;
    setDist(Math.max(0, Math.ceil(inner.scrollWidth - outer.clientWidth)));
  }, []);
  (0, import_react13.useLayoutEffect)(() => {
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
  (0, import_react13.useEffect)(() => {
    measure();
  }, [props.text, measure]);
  const run = dist > 0;
  return (0, import_react13.createElement)("span", {
    ref: outerRef,
    className: (run ? "dshpc-mq dshpc-mq-run" : "dshpc-mq") + (props.className === void 0 ? "" : ` ${props.className}`),
    title: props.title,
    style: props.style
  }, (0, import_react13.createElement)("span", {
    ref: innerRef,
    className: "dshpc-mq-in",
    style: {
      ...run ? { "--dshpc-mq-dist": `${-dist}px`, "--dshpc-mq-dur": `${Math.max(3, Math.round(dist / 30))}s` } : null
    }
  }, props.text));
}

// dist/ui/SectionHead.js
var import_react14 = require("react");
function SectionHead(props) {
  return (0, import_react14.createElement)("div", {
    style: { display: "flex", alignItems: "center", gap: "var(--dshpc-space-2)", marginBottom: "var(--dshpc-space-3)" }
  }, (0, import_react14.createElement)("span", { style: { display: "inline-flex", alignItems: "center", flex: "none", color: "var(--dshpc-fg-3)" } }, props.icon), (0, import_react14.createElement)("span", { style: { fontSize: "var(--dshpc-font-lg)", lineHeight: "var(--dshpc-line-lg)", fontWeight: 600, color: "var(--dshpc-fg)", flex: "none" } }, props.title), props.right === void 0 ? null : (0, import_react14.createElement)("div", { style: { marginLeft: "auto", display: "flex", alignItems: "center", gap: "var(--dshpc-space-2)", minWidth: 0 } }, props.right));
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
var import_react15 = require("react");
function FieldHint(props) {
  ensureControls();
  const { text, side, align, maxWidth, className, style } = props;
  const anchor = (0, import_react15.createElement)("span", {
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

// dist/ui/LiveText.js
var import_react17 = require("react");

// dist/ui/ticker.js
var import_react16 = require("react");
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
  const [, force] = (0, import_react17.useState)(0);
  const renderRef = (0, import_react17.useRef)(props.render);
  renderRef.current = props.render;
  (0, import_react17.useEffect)(() => subscribeTicker(() => force((v) => v + 1)), []);
  return (0, import_react17.createElement)("span", { style: props.style }, renderRef.current(Date.now()));
}

// dist/ui/Field.js
var import_react18 = require("react");
function sizeClass(size) {
  return size === "lg" ? "--lg" : size === "md" ? "--md" : "--sm";
}
function Input(props) {
  ensureControls();
  const { value, onChange, placeholder, size = "lg", error, disabled, type, className, style } = props;
  return (0, import_react18.createElement)("input", {
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
  });
}
function NumberInput(props) {
  ensureControls();
  const { value, onChange, min = -Infinity, max = Infinity, step = 1, size = "lg", inputWidth, disabled, suffix, label, decreaseLabel = "\u51CF\u5C11", increaseLabel = "\u589E\u52A0", className, style } = props;
  const [text, setText] = (0, import_react18.useState)(String(value));
  (0, import_react18.useEffect)(() => {
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
  return (0, import_react18.createElement)(
    "div",
    {
      className: `dshpc-num dshpc-num${sizeClass(size)}${disabled === true ? " dshpc-num--disabled" : ""}${className !== void 0 && className !== "" ? ` ${className}` : ""}`,
      style
    },
    (0, import_react18.createElement)(IconButton, { variant: "plain", size, icon: "\u2212", label: decreaseLabel, disabled, onClick: () => {
      bump(-1);
    } }),
    // 中段（数字 + 后缀）成组居中：消费端把宽度拉大时，「−」钉最左、「+」钉最右、数字组始终居中
    // （用户 2026-10-18：加减号必须在最左 / 最右，宽度由消费端调）。
    (0, import_react18.createElement)("span", { className: "dshpc-num__mid" }, (0, import_react18.createElement)("input", {
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
    }), suffix !== void 0 ? (0, import_react18.createElement)("span", { className: "dshpc-num__suffix" }, suffix) : null),
    (0, import_react18.createElement)(IconButton, { variant: "plain", size, icon: "+", label: increaseLabel, disabled, onClick: () => {
      bump(1);
    } })
  );
}

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
  const h29 = Math.floor(totalSec / 3600);
  const m = Math.floor(totalSec % 3600 / 60);
  const s = totalSec % 60;
  return h29 > 0 ? `${h29}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`;
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
  ico: "image/x-icon"
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
function crumbsOf(path) {
  return path.split("/").filter((s) => s !== "");
}
function parentOf(path) {
  const cut = path.lastIndexOf("/");
  return cut < 0 ? "" : path.slice(0, cut);
}
function joinPath(dir, name) {
  return dir === "" ? name : `${dir}/${name}`;
}

// packages/demo/src/sections/index.tsx
var import_react28 = require("react");

// packages/demo/src/i18n.ts
var DICT2 = {
  zh: {
    grpStart: "\u5F00\u59CB",
    grpFoundation: "\u8BBE\u8BA1\u57FA\u7840",
    grpComponents: "\u63A7\u4EF6",
    grpBlocks: "\u4E1A\u52A1\u6A21\u5757",
    grpUtils: "\u901A\u7528\u65B9\u6CD5",
    grpReference: "\u53C2\u8003",
    secOverview: "\u6982\u89C8",
    secInstall: "\u5B89\u88C5\u4E0E\u521D\u59CB\u5316",
    secQuickstart: "\u5199\u4E00\u4E2A\u63D2\u4EF6",
    secTokens: "Token \u8272\u677F",
    secDark: "\u6697\u8272\u4E3B\u9898",
    secInject: "\u6837\u5F0F\u6CE8\u5165\u4E0E\u9694\u79BB",
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
    layoutDesc: "\u5F85\u8865\uFF1A\n\xB7 BackToTop \u56DE\u5230\u9876\u90E8\n\xB7 startResizeLayoutWidth \u62D6\u62FD\u6539\u4FA7\u680F\u5BBD\u5EA6\n\xB7 SidebarLayout / SplitPane \u2014\u2014 \u9700\u6C42\u6587\u6863\u5DF2\u8BB0\u4E3A\u5F85\u8865\uFF0C\u7EC4\u4EF6\u5C1A\u672A\u5B9E\u73B0\n\xB7 \u4E3A\u4EC0\u4E48\u73B0\u5728\u53EA\u6709\u5E95\u5C42\u51FD\u6570\u6CA1\u6709\u7EC4\u4EF6",
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
    btnLabelSave: "\u4FDD\u5B58\u4FEE\u6539",
    btnLabelCancel: "\u53D6\u6D88",
    btnLabelDelete: "\u5220\u9664",
    btnLabelMixed: "\u4FDD\u5B58 Save",
    btnIconOnly: "icon only",
    btnHintTitle: "\u95EE\u53F7\u63D0\u793A\uFF08FieldHint\uFF09",
    btnHintHint: "\u72EC\u7ACB\u7EC4\u4EF6\uFF0C\u653E\u54EA\u90FD\u884C\uFF1A\u6807\u9898\u540E / \u6309\u94AE\u540E / \u4E00\u6BB5\u6587\u5B57\u540E / \u8F93\u5165\u6846\u540E\uFF1B\u9F20\u6807\u60AC\u505C\u6216\u952E\u76D8\u805A\u7126\u6D6E\u51FA\u6C14\u6CE1",
    demoInputFamily: "Input \u5BB6\u65CF",
    inputHint: "Input / PrefixedInput / NumberInput / Textarea\uFF0C\u90FD\u652F\u6301 error \u63CF\u7EA2\uFF1B\u884C\u5C3E\u53EF\u6302 FieldHint \u95EE\u53F7\u63D0\u793A",
    fieldHintDate: "\u4EFB\u52A1\u81EA\u8BE5\u65E5\u8D77\u5F00\u59CB\u6267\u884C\u3002\u53EF\u63D0\u524D\u521B\u5EFA\u4EFB\u52A1\uFF0C\u81F3\u8BE5\u65E5\u81EA\u52A8\u5F00\u8DD1\uFF1B\u300C\u6BCF N \u5468\u300D\u4EA6\u81EA\u8BE5\u65E5\u8D77\u7B97\u9996\u5468\u3002",
    switchTip: "\u5B98\u65B9 Switch\uFF08\u542F\u7528\u8BED\u4E49\uFF0C\u4E0D\u662F\u52FE\u9009\uFF09+ Checkbox + Segmented",
    checkboxHint: "\u5916\u89C2\u5BF9\u9F50\u771F\u5B9E\u63D2\u4EF6\uFF1A\u7070\u5E95 inset\uFF08\u65E0\u5916\u63CF\u8FB9\uFF09\uFF1B\u5E26\u63CF\u8FB9\u7684 default \u4EC5\u4F9B\u7279\u6B8A\u573A\u5408\uFF08\u6700\u53F3\uFF0C\u53EF\u70B9\u7740\u73A9\uFF09\uFF1B\u661F\u671F\u65B9\u5757\u662F\u591A\u9009\u3002\u6587\u6848\u968F\u8BED\u8A00\u5207\u6362",
    pickerHint: "\u5355\u9009 / \u591A\u9009 / \u4E0A\u9650 / \u641C\u7D22 / \u5206\u7EC4 / \u7A7A\u6001 / \u964D\u7EA7\u2014\u2014\u5168\u90E8\u53EF\u7528 props \u63A7\u5236",
    modelPickerHint: "flat \u4E00\u4E2A\u4E0B\u62C9 / cascade \u5148\u9009\u4F9B\u5E94\u5546\u518D\u9009\u6A21\u578B\u2014\u2014\u540C\u4E00\u4EFD\u6570\u636E\u4E24\u79CD\u5F62\u6001",
    workspacePickerHint: "\u6570\u636E\u8C03\u7528\u65B9\u7ED9\uFF08\u8981\u8DE8 host\u2194client \u8FB9\u754C\uFF0C\u7EC4\u4EF6\u53D6\u4E0D\u5230\uFF09",
    tooltipTitle: "Tooltip\uFF08\u9F20\u6807\u60AC\u505C\u63D0\u793A\uFF09",
    tooltipHint: "\u5B98\u65B9 Tooltip\uFF1Aside \u4E0A / \u4E0B / \u53F3 \xD7 align \u5C45\u4E2D / \u8D34\u8FB9\uFF1B\u951A\u70B9\u53EF\u4EE5\u662F\u6309\u94AE\u6216\u4E00\u6BB5\u6587\u5B57\uFF1B\u957F\u6587\u672C\u6309 maxWidth \u81EA\u52A8\u6298\u884C\uFF1B\u6700\u53F3\u4E00\u9897\u662F\u300C\u540D\u5B57 + \u6B63\u6587\u300D\u4E24\u6BB5\u5F0F\u2014\u2014\u6587\u672C\u91CC\u7684 \\n \u5C31\u662F\u771F\u5B9E\u6362\u884C",
    tooltipAnchorText: "\u6587\u5B57\u951A\u70B9",
    tooltipAnchorButton: "\u6309\u94AE\u951A\u70B9",
    tooltipLong: "\u957F\u6587\u672C\u6362\u884C",
    tooltipName: "\u5F20\u4E09\u4E30",
    tooltipRich: "\u5BCC\u5361\u7247",
    tooltipMultiline: "\u4E24\u6BB5\u5F0F",
    tooltipLongText: "\u8FD9\u662F\u4E00\u6BB5\u8DB3\u591F\u957F\u7684\u63D0\u793A\u6587\u5B57\uFF1A\u6C14\u6CE1\u9047\u5230 maxWidth \u4F1A\u81EA\u52A8\u6362\u884C\uFF0C\u800C\u4E0D\u4F1A\u4E00\u8DEF\u6491\u5230\u534A\u4E2A\u5C4F\u5E55\u5BBD\uFF0C anchored \u5143\u7D20\u5728\u8FB9\u7F18\u65F6\u5B98\u65B9\u8FD8\u4F1A\u81EA\u52A8\u628A\u6C14\u6CE1\u6536\u56DE\u89C6\u53E3\u5185\u3002",
    demoCardTitle: "Card\uFF08\u5706\u89D2 + \u8FB9\u6846 + \u77ED\u8272\u6761\uFF09",
    demoStripTitle: "StripCard\uFF08\u65E0\u8FB9\u6846 + \u901A\u9AD8\u7AD6\u7EBF\uFF09",
    cardHint: "\u6392\u7248\u5B8C\u5168\u7531\u8C03\u7528\u65B9\u51B3\u5B9A\u2014\u2014\u771F\u5B9E\u63D2\u4EF6\u7684\u5F62\u6001\uFF1A\u6807\u9898\u884C + \u53F3\u4FA7\u5143\u4FE1\u606F + chips \u884C\uFF1Baccent \u4E94\u6863\u89C1\u4E0B\u65B9\u901F\u89C8",
    stripHint: "\u540C\u4E00\u4E2A\u8272\u6761\u673A\u5236\uFF0C\u5916\u89C2\u662F\u901A\u9AD8\u8D34\u9876\u5230\u5E95\u2014\u2014\u771F\u5B9E\u63D2\u4EF6\u7684\u5F62\u6001\uFF1A\u6807\u9898 + \u5143\u4FE1\u606F\u884C + \u53F3\u4FA7\u65F6\u95F4/\u64CD\u4F5C",
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
    loadingNote: "Loading \u662F\u8D34\u5230\u4E3B\u5BB9\u5668\u53F3\u4E0B\u89D2\u7684\u6307\u793A\u5668\uFF08anchorId \u9ED8\u8BA4 dshpc-main\uFF09\uFF0C\u6B64\u5904\u4E0D\u6E32\u67D3\u4EE5\u514D\u906E\u6321\u3002",
    explorerHint: "\u9762\u5305\u5C51 + \u76EE\u5F55\u6811 + \u9884\u89C8\uFF1BworkspaceFiles \u662F mock \u7684\uFF08\u771F\u5B9E\u63D2\u4EF6\u4ECE ctx \u53D6\u51FA\u540E\u6CE8\u5165\uFF09",
    previewBodyTitle: "FilePreview \u9884\u89C8\u4F53\uFF08\u53EF\u5355\u72EC\u7528\uFF09",
    previewBodyHint: "\u4E0A\u9762\u90A3\u5757\u5DF2\u7ECF\u5305\u542B\u5B83\u2014\u2014ExplorerPanel \u5185\u90E8\u6E32\u67D3\u7684\u5C31\u662F FilePreview\u3002\n\u5B83\u540C\u65F6\u4E5F\u662F\u4E00\u6761\u72EC\u7ACB\u5B50\u8DEF\u5F84 dsh-plugin-core/explorer/preview\uFF1A\u53EA\u6709\u4E00\u4E2A\u6587\u4EF6\u8981\u663E\u793A\u65F6\uFF08\u4F1A\u8BDD\u9644\u4EF6\u3001\u5DE5\u5177\u8F93\u51FA\uFF09\u4E0D\u5FC5\u642C\u51FA\u6574\u4E2A\u9762\u677F\u3002\n\u26A0\uFE0F \u672C\u9875\u4E0D\u53E6\u6302\u4E00\u5757\u5355\u72EC\u6E32\u67D3\uFF1A\u9884\u89C8\u4F53\u7684 path / files \u7531\u7236\u7EC4\u4EF6\u6CE8\u5165\uFF0C\u8981\u8131\u79BB\u9762\u677F\u5C55\u793A\u5F97\u5148\u51C6\u5907\u4E00\u4EFD\u81EA\u5DF1\u7684\u6570\u636E\uFF0C\u5C5E\u4E8E\u5F85\u8865\u3002",
    sessionHint: "\u4E09\u79CD\u627F\u8F7D\uFF1Amodal / sidebar / page\uFF1Bsource \u662F mock \u7684\uFF1BrenderMessage \u53EF\u63A5\u7BA1\u5BCC\u5185\u5BB9",
    dateHint: "\u89E3\u6790\u5931\u8D25\u4E0D\u629B\u9519\u3001\u7ED9\u515C\u5E95\u3001\u4E0D\u7F16\u9020\uFF1B\u6240\u6709\u51FD\u6570\u65E0 UI \u4F9D\u8D56\uFF0CNode \u91CC\u4E5F\u80FD\u8DD1",
    numberHint: "formatBytes \u6309 1024 \u8FDB\u5236\u3001\u5355\u4F4D\u81EA\u52A8\u8FDB\u4F4D\uFF1BformatCount \u7ED9\u5927\u6570\u52A0\u5343\u5206\u4F4D",
    roadmapHint: "\u4E0B\u9762\u662F\u300C\u660E\u786E\u4E0D\u63D0\u4F9B\u300D\u7684\u90E8\u5206\u2014\u2014\u5199\u5728\u8FD9\u91CC\u662F\u4E3A\u4E86\u8BA9\u4F60\u4E0D\u7528\u731C\uFF0C\u4E5F\u8BA9\u540E\u6765\u4EBA\u77E5\u9053\u8FB9\u754C\u5728\u54EA\u3002",
    roadmapOut: "\u8BBE\u7F6E\u9875\u9AA8\u67B6\u3001i18n \u6846\u67B6\uFF08\u63D2\u4EF6\u6587\u6848\u63D2\u4EF6\u81EA\u7BA1\uFF09\u3001host \u5BBF\u4E3B\u7C7B\u578B\u9762",
    roadmapMirror: "\u5B98\u65B9\u4F1A\u8BDD UI \u7684\u5B8C\u6574\u955C\u50CF\uFF08\u5DE5\u5177\u5361 / \u4EE3\u7801\u5757 / \u63A8\u7406\u884C\uFF09\u2014\u2014session \u76EE\u524D\u53EA\u6709\u6700\u7B80\u6E32\u67D3\uFF0C\u5BCC\u5185\u5BB9\u8D70 renderMessage \u6269\u5C55\u70B9",
    roadmapPreview: "\u4EE3\u7801\u8BED\u6CD5\u9AD8\u4EAE / PDF / Office \u9884\u89C8\u2014\u2014explorer \u7684\u9884\u89C8\u53EA\u6709\u6587\u672C\u4E0E\u56FE\u7247",
    roadmapSkeleton: "SidebarLayout / SplitPane\u2014\u2014\u73B0\u53EA\u6709\u5E95\u5C42 resizer \u51FD\u6570\uFF0C\u7EC4\u4EF6\u5F85\u8865",
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
    pluginTitle: "\u7EC4\u4EF6\u9884\u89C8",
    pluginCardDesc: "\u6253\u5F00 dsh-plugin-core \u7684\u63A7\u4EF6\u4E0E\u4E1A\u52A1\u7EC4\u4EF6\u5C55\u793A\u9875",
    pluginCardOpen: "\u6253\u5F00 \u203A"
  },
  en: {
    grpStart: "Getting started",
    grpFoundation: "Foundations",
    grpComponents: "Components",
    grpBlocks: "Blocks",
    grpUtils: "Utilities",
    grpReference: "Reference",
    secOverview: "Overview",
    secInstall: "Install & init",
    secQuickstart: "Write a plugin",
    secTokens: "Token palette",
    secDark: "Dark theme",
    secInject: "Style injection & isolation",
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
    layoutDesc: "To be added:\n\xB7 BackToTop\n\xB7 startResizeLayoutWidth \u2014 drag to resize a sidebar\n\xB7 SidebarLayout / SplitPane \u2014 logged as pending in the requirements doc, component not built yet\n\xB7 Why only the low-level helper exists today",
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
    btnLabelSave: "Save changes",
    btnLabelCancel: "Cancel",
    btnLabelDelete: "Delete",
    btnLabelMixed: "Save \u4FDD\u5B58",
    btnIconOnly: "icon only",
    btnHintTitle: "Question-mark hint (FieldHint)",
    btnHintHint: "Standalone component, drop it anywhere: after a title, a button, a sentence, or an input; hover or keyboard-focus to reveal",
    demoInputFamily: "Input family",
    inputHint: "Input / PrefixedInput / NumberInput / Textarea, all support error highlighting; a FieldHint question-mark tip can hang at the row end",
    fieldHintDate: 'The task runs starting from this date. You can create it ahead of time and it auto-starts on that day; "every N weeks" also counts its first week from this date.',
    switchTip: "Official Switch (enable semantics, not a tick) + Checkbox + Segmented",
    checkboxHint: "Looks match the real plugin: grey inset background (no outer border); the bordered default (rightmost, clickable) is for special cases; the weekday squares are multi-select. Labels follow the locale",
    pickerHint: "Single / multi / max / search / grouped / empty / degraded \u2014 all driven by props",
    modelPickerHint: "flat: one dropdown / cascade: pick provider then model \u2014 same data, two shapes",
    workspacePickerHint: "Data is supplied by the caller (crosses the host\u2194client boundary; the component cannot fetch it)",
    tooltipTitle: "Tooltip (hover hint)",
    tooltipHint: "Official Tooltip: side top / bottom / right x align center / end; anchor can be a button or a span of text; long labels wrap at maxWidth; the rightmost one is a two-part hint (name + body) where \\n in the text is a real line break",
    tooltipAnchorText: "Text anchor",
    tooltipAnchorButton: "Button anchor",
    tooltipLong: "Long label",
    tooltipName: "Alex Chen",
    tooltipRich: "Rich card",
    tooltipMultiline: "Two-part",
    tooltipLongText: "A deliberately long hint: the bubble wraps at maxWidth instead of stretching to half the viewport, and the official layer pulls it back inside the viewport near the edges.",
    demoCardTitle: "Card (rounded + border + accent bar)",
    demoStripTitle: "StripCard (borderless + full-height stripe)",
    cardHint: "Layout is entirely up to the caller \u2014 the real-plugin shape: title row + right-side meta + chips row; five accent tiers below",
    stripHint: "Same accent-bar mechanism, but full-height edge-to-edge \u2014 real-plugin shape: title + meta row + right-side time/actions",
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
    loadingNote: "Loading is an indicator pinned to the bottom-right of the main container (anchorId defaults to dshpc-main); not rendered here to avoid covering content.",
    explorerHint: "Breadcrumb + directory tree + preview; workspaceFiles is mocked (a real plugin reads it from ctx and injects)",
    previewBodyTitle: "FilePreview (usable on its own)",
    previewBodyHint: "The block above already includes it \u2014 ExplorerPanel renders FilePreview inside.\nIt is also a separate subpath, dsh-plugin-core/explorer/preview: when there is only one file to show (a session attachment, a tool result) you do not need the whole panel.\n\u26A0\uFE0F No standalone render here: the preview body takes its path and files from the parent, so showing it outside the panel needs its own data source \u2014 still to be added.",
    sessionHint: "Three carriers: modal / sidebar / page; source is mocked; renderMessage can take over rich content",
    dateHint: "No throw on parse failure \u2014 falls back gracefully and never fabricates; all functions are UI-free and run in Node too",
    numberHint: "formatBytes is 1024-based with automatic unit scaling; formatCount adds thousands separators",
    roadmapHint: "The list below is what this package explicitly does NOT provide \u2014 written down so nobody has to guess, and so the boundary stays visible.",
    roadmapOut: "A settings-page skeleton, an i18n framework (plugin copy is the plugin\u2019s own job), a host typings surface",
    roadmapMirror: "A full mirror of the official session UI (tool cards / code blocks / reasoning rows) \u2014 session renders only the minimal shape today; rich content goes through the renderMessage hook",
    roadmapPreview: "Syntax highlighting / PDF / Office preview \u2014 the explorer preview handles text and images only",
    roadmapSkeleton: "SidebarLayout / SplitPane \u2014 only the low-level resizer exists; the components are pending",
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

// packages/demo/src/sections/start.tsx
var import_react19 = require("react");
function OverviewPage() {
  return (0, import_react19.createElement)(Placeholder, { descKey: "overviewDesc" });
}
function InstallPage() {
  return (0, import_react19.createElement)(Placeholder, { descKey: "installDesc" });
}
function QuickstartPage() {
  return (0, import_react19.createElement)(Placeholder, { descKey: "quickstartDesc" });
}

// packages/demo/src/sections/foundation.tsx
var import_react20 = require("react");
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
function TokensPage() {
  return (0, import_react20.createElement)(
    Demo,
    { title: t2("demoTokenPalette"), hint: t2("tokensHint") },
    (0, import_react20.createElement)(
      "div",
      { style: { display: "flex", flexWrap: "wrap", gap: "10px" } },
      TOKENS.map(
        (item) => (0, import_react20.createElement)(
          "div",
          { key: item.cssVar, style: { width: "104px" } },
          (0, import_react20.createElement)("div", {
            style: {
              height: "40px",
              borderRadius: "6px",
              background: `var(${item.cssVar})`,
              border: "1px solid var(--dshpc-border-faint)"
            }
          }),
          (0, import_react20.createElement)("div", { style: { fontSize: "11px", marginTop: "4px" } }, item.label),
          (0, import_react20.createElement)("div", { style: { fontSize: "10px", color: "var(--dshpc-fg-4)" } }, item.cssVar)
        )
      )
    )
  );
}
function DarkPage() {
  const dark = typeof document !== "undefined" && document.body.hasAttribute("data-ds-dark-theme");
  return (0, import_react20.createElement)(
    Demo,
    { title: "body[data-ds-dark-theme]", hint: t2("darkHint") },
    (0, import_react20.createElement)(
      "div",
      { style: { display: "flex", alignItems: "center", gap: "10px" } },
      (0, import_react20.createElement)(
        "span",
        { style: { fontFamily: "var(--dshpc-font-mono)", fontSize: "12px", color: "var(--dshpc-fg-3)" } },
        t2("darkNow")
      ),
      (0, import_react20.createElement)("code", {
        style: {
          fontFamily: "var(--dshpc-font-mono)",
          fontSize: "13px",
          padding: "3px 10px",
          borderRadius: "6px",
          background: "var(--dshpc-open-bg)",
          color: dark ? "var(--dshpc-success)" : "var(--dshpc-fg-2)"
        }
      }, dark ? "true\uFF08\u6697\u8272\uFF09" : "false\uFF08\u4EAE\u8272\uFF09")
    )
  );
}
function InjectPage() {
  return (0, import_react20.createElement)(
    Demo,
    {
      title: t2("demoStyleInject"),
      hint: t2("injectHint"),
      code: `import { createStyleKit } from 'dsh-plugin-core/design'
import { ensureControls, setStyleKit } from 'dsh-plugin-core/ui'

setStyleKit(createStyleKit({ id: 'dsh-plugin-core-demo-ui' }))
ensureControls()`
    },
    (0, import_react20.createElement)("div", { style: { color: "var(--dshpc-fg-3)", fontSize: "12px" } }, t2("designInjectNote"))
  );
}
function NamingPage() {
  return (0, import_react20.createElement)(Placeholder, { descKey: "namingDesc" });
}

// packages/demo/src/sections/controls.tsx
var import_react21 = require("react");
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
var BUTTON_ICONS = [
  { name: "plus", Icon: import_dsh_client_ui_primitives.IconPlusOutlineRegular },
  { name: "check", Icon: import_dsh_client_ui_primitives.IconCheckOutlineRegular },
  { name: "close", Icon: import_dsh_client_ui_primitives.IconCloseOutlineRegular },
  { name: "refresh", Icon: import_dsh_client_ui_primitives.IconRefreshOutlineRegular },
  { name: "copy", Icon: import_dsh_client_ui_primitives.IconCopyOutlineRegular },
  { name: "search", Icon: import_dsh_client_ui_primitives.IconSearchOutlineRegular },
  { name: "edit", Icon: import_dsh_client_ui_primitives.IconEditOutlineRegular },
  { name: "play", Icon: import_dsh_client_ui_primitives.IconPlayOutlineRegular },
  { name: "send", Icon: import_dsh_client_ui_primitives.IconPaperPlaneOutlineRegular },
  { name: "clock", Icon: import_dsh_client_ui_primitives.IconClockOutlineRegular },
  { name: "sparkle", Icon: import_dsh_client_ui_primitives.IconSparkleRegular },
  { name: "chevron", Icon: import_dsh_client_ui_primitives.IconChevronDownOutlineRegular }
];
function iconOf(name, size = 14) {
  const found = BUTTON_ICONS.find((item) => item.name === name);
  return found === void 0 ? null : (0, import_react21.createElement)(found.Icon, { size });
}
function StarSvg() {
  return (0, import_react21.createElement)(
    "svg",
    { width: 14, height: 14, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true },
    (0, import_react21.createElement)("path", {
      d: "M8 1.6l1.9 4 4.4.6-3.2 3 .8 4.3L8 11.4l-3.9 2.1.8-4.3-3.2-3 4.4-.6z",
      stroke: "currentColor",
      strokeWidth: 1.2,
      strokeLinejoin: "round"
    })
  );
}
var ICON_SIZE = { sm: 12, md: 14, lg: 16 };
var VARIANTS = [
  { value: "primary", icon: "check" },
  { value: "secondary", icon: "copy" },
  { value: "outline", icon: "edit" },
  { value: "ghost", icon: "refresh" },
  { value: "danger", icon: "close" },
  { value: "success", icon: "play" },
  { value: "warning", icon: "clock" },
  { value: "info", icon: "send" },
  { value: "danger-outline", icon: "close" },
  { value: "link", icon: "search" }
];
var CUSTOM_COLORS = ["#7c3aed", "#0ea5e9", "#f97316", "#16a34a"];
function tipAnchor(text, side, align) {
  const props = { label: text, side };
  if (align !== void 0) props.align = align;
  return (0, import_react21.createElement)(import_dsh_client_ui_primitives.Tooltip, props, (0, import_react21.createElement)("button", {
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
  return (0, import_react21.createElement)("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" } }, props.children);
}
function Labeled(props) {
  return (0, import_react21.createElement)(
    "div",
    { style: { display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" } },
    (0, import_react21.createElement)("span", { style: { width: "auto", minWidth: "64px", flex: "none", whiteSpace: "normal", color: "var(--dshpc-fg-3)", fontSize: "12px" } }, props.label),
    props.children
  );
}
function ButtonPage() {
  return (0, import_react21.createElement)(
    "div",
    null,
    // 文案与语言
    (0, import_react21.createElement)(
      Demo,
      { title: t2("btnTextTitle"), hint: t2("btnTextHint") },
      (0, import_react21.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "12px" } },
        (0, import_react21.createElement)(
          Labeled,
          { label: "locale" },
          (0, import_react21.createElement)(Button, { variant: "primary", icon: iconOf("check", ICON_SIZE.lg) }, t2("btnLabelSave")),
          (0, import_react21.createElement)(Button, { variant: "outline" }, t2("btnLabelCancel")),
          (0, import_react21.createElement)(Button, { variant: "danger", icon: iconOf("close", ICON_SIZE.lg) }, t2("btnLabelDelete"))
        ),
        (0, import_react21.createElement)(
          Labeled,
          { label: "en" },
          (0, import_react21.createElement)(Button, { variant: "primary" }, "Save"),
          (0, import_react21.createElement)(Button, { variant: "outline" }, "Cancel"),
          (0, import_react21.createElement)(Button, { variant: "ghost" }, "Learn more")
        ),
        (0, import_react21.createElement)(
          Labeled,
          { label: "zh" },
          (0, import_react21.createElement)(Button, { variant: "primary" }, "\u4FDD\u5B58"),
          (0, import_react21.createElement)(Button, { variant: "outline" }, "\u53D6\u6D88"),
          (0, import_react21.createElement)(Button, { variant: "ghost" }, "\u4E86\u89E3\u66F4\u591A")
        ),
        (0, import_react21.createElement)(
          Labeled,
          { label: "zh + en" },
          (0, import_react21.createElement)(Button, { variant: "primary", icon: iconOf("sparkle", ICON_SIZE.lg) }, t2("btnLabelMixed")),
          (0, import_react21.createElement)(Button, { variant: "outline" }, "\u590D\u5236 Copy"),
          (0, import_react21.createElement)(Button, { variant: "secondary" }, "\u91CD\u8BD5 Retry")
        )
      )
    ),
    // 10 档外观
    (0, import_react21.createElement)(
      Demo,
      { title: t2("btnVariantTitle"), hint: t2("btnVariantHint") },
      (0, import_react21.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "10px" } },
        (0, import_react21.createElement)(Row, null, VARIANTS.map((item) => (0, import_react21.createElement)(Button, { key: item.value, variant: item.value, icon: iconOf(item.icon, ICON_SIZE.lg) }, item.value))),
        (0, import_react21.createElement)(Row, null, VARIANTS.map((item) => (0, import_react21.createElement)(Button, { key: item.value, variant: item.value, size: "sm", icon: iconOf(item.icon, ICON_SIZE.sm) }, item.value)))
      )
    ),
    // 尺寸 / 图标位置 / block
    (0, import_react21.createElement)(
      Demo,
      { title: t2("btnSizeTitle"), hint: t2("btnSizeHint") },
      (0, import_react21.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "12px" } },
        (0, import_react21.createElement)(
          Labeled,
          { label: "size" },
          ["sm", "md", "lg"].map((size) => (0, import_react21.createElement)(Button, { key: size, size, variant: "outline", icon: iconOf("plus", ICON_SIZE[size]) }, size))
        ),
        // icon 收的是 ReactNode：官方图标组件 / 自绘 SVG / 一个字符，三种来源各一颗
        (0, import_react21.createElement)(
          Labeled,
          { label: "icon" },
          (0, import_react21.createElement)(Button, { variant: "primary", icon: iconOf("send", ICON_SIZE.lg) }, "\u5B98\u65B9\u56FE\u6807"),
          (0, import_react21.createElement)(Button, { variant: "outline", icon: (0, import_react21.createElement)(StarSvg, null) }, "\u81EA\u7ED8 SVG"),
          (0, import_react21.createElement)(Button, { variant: "ghost", icon: "+" }, "\u4E00\u4E2A\u5B57\u7B26")
        ),
        (0, import_react21.createElement)(
          Labeled,
          { label: "iconRight" },
          (0, import_react21.createElement)(Button, { variant: "outline", iconRight: iconOf("chevron", ICON_SIZE.lg) }, "\u66F4\u591A"),
          (0, import_react21.createElement)(Button, { variant: "primary" }, "\u4E0B\u4E00\u6B65")
        ),
        // block + 前置图标：文字要在视觉中心，不能整组内容居中（那样文字会被图标推右）
        (0, import_react21.createElement)(
          Labeled,
          { label: "block" },
          (0, import_react21.createElement)(
            "div",
            { style: { width: "260px" } },
            (0, import_react21.createElement)(Button, { variant: "primary", block: true, icon: iconOf("check", ICON_SIZE.lg) }, "\u6491\u6EE1\u7236\u5BBD"),
            (0, import_react21.createElement)("div", { style: { height: "8px" } }),
            (0, import_react21.createElement)(Button, { variant: "outline", block: true }, "\u65E0\u56FE\u6807\u5BF9\u7167")
          )
        ),
        (0, import_react21.createElement)(
          Labeled,
          { label: t2("btnIconOnly") },
          BUTTON_ICONS.slice(0, 6).map((item) => (0, import_react21.createElement)(IconButton, { key: item.name, icon: (0, import_react21.createElement)(item.Icon, { size: 16 }), label: item.name }))
        )
      )
    ),
    // 状态
    (0, import_react21.createElement)(
      Demo,
      { title: t2("btnStateTitle"), hint: t2("btnStateHint") },
      (0, import_react21.createElement)(
        Row,
        null,
        (0, import_react21.createElement)(Button, { variant: "primary" }, "\u9ED8\u8BA4"),
        (0, import_react21.createElement)(Button, { variant: "primary", disabled: true }, "\u7981\u7528"),
        (0, import_react21.createElement)(Button, { variant: "danger", disabled: true, icon: iconOf("close", ICON_SIZE.lg) }, "\u7981\u7528"),
        (0, import_react21.createElement)(Button, { variant: "outline", loading: true }, "\u52A0\u8F7D\u4E2D"),
        (0, import_react21.createElement)(Button, { variant: "primary", loading: true, icon: iconOf("refresh", ICON_SIZE.lg) }, "\u63D0\u4EA4\u4E2D")
      )
    ),
    // 自定义颜色
    (0, import_react21.createElement)(
      Demo,
      { title: t2("btnColorTitle"), hint: t2("btnColorHint") },
      (0, import_react21.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "10px" } },
        (0, import_react21.createElement)(Row, null, CUSTOM_COLORS.map((color) => (0, import_react21.createElement)(Button, { key: color, variant: "primary", color, icon: iconOf("sparkle", ICON_SIZE.lg) }, color))),
        (0, import_react21.createElement)(Row, null, CUSTOM_COLORS.map((color) => (0, import_react21.createElement)(Button, { key: color, variant: "outline", color }, color)))
      )
    )
  );
}
function InputPage() {
  const [text, setText] = (0, import_react21.useState)("");
  const [num, setNum] = (0, import_react21.useState)(3);
  const [checked, setChecked] = (0, import_react21.useState)(true);
  const [seg, setSeg] = (0, import_react21.useState)("week");
  const [filter, setFilter] = (0, import_react21.useState)("all");
  const [multi, setMulti] = (0, import_react21.useState)(["1"]);
  return (0, import_react21.createElement)(
    "div",
    null,
    // Input 家族
    (0, import_react21.createElement)(
      Demo,
      { title: t2("demoInputFamily"), hint: t2("inputHint") },
      (0, import_react21.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "10px", maxWidth: "380px" } },
        (0, import_react21.createElement)(
          "div",
          { style: { display: "flex", alignItems: "center", gap: "6px" } },
          (0, import_react21.createElement)("span", { style: { color: "var(--dshpc-fg-2)", fontSize: "13px", flex: "none" } }, "\u5F00\u59CB\u65F6\u95F4"),
          (0, import_react21.createElement)(Input, { value: text, onChange: setText, placeholder: "\u9009\u62E9\u65E5\u671F" }),
          (0, import_react21.createElement)(FieldHint, { text: t2("fieldHintDate") })
        ),
        (0, import_react21.createElement)(Input, { value: "bad value", onChange: () => {
        }, error: true, placeholder: "\u6821\u9A8C\u5931\u8D25\u6001" }),
        // ⚠️ 外层是 flex column（默认 align-items:stretch）会把 .dshpc-num 拉到全宽；
        //    组件本身是内容自适应宽（inline-flex 无 width），演示区还原成它本来的短宽。
        (0, import_react21.createElement)(NumberInput, { value: num, onChange: setNum, min: 0, max: 10, suffix: "\u6B21", style: { alignSelf: "flex-start" } }),
        (0, import_react21.createElement)(Textarea, { value: text, onChange: setText, placeholder: "\u591A\u884C\u8F93\u5165" })
      )
    ),
    // 问号提示：证明它不属于 Input 家族，随处可挂
    (0, import_react21.createElement)(
      Demo,
      { title: t2("btnHintTitle"), hint: t2("btnHintHint") },
      (0, import_react21.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "10px" } },
        (0, import_react21.createElement)(
          Row,
          null,
          (0, import_react21.createElement)("b", { style: { fontSize: "13px" } }, "\u4E00\u4E2A\u6807\u9898"),
          (0, import_react21.createElement)(FieldHint, { text: "\u6302\u5728\u6807\u9898\u540E\u9762\uFF1A\u8BF4\u660E\u8FD9\u4E00\u5757\u662F\u5E72\u4EC0\u4E48\u7684\u3002" })
        ),
        (0, import_react21.createElement)(
          Row,
          null,
          (0, import_react21.createElement)(Button, { variant: "outline" }, "\u4E00\u4E2A\u6309\u94AE"),
          (0, import_react21.createElement)(FieldHint, { text: "\u6302\u5728\u6309\u94AE\u540E\u9762\uFF1A\u89E3\u91CA\u8FD9\u4E2A\u64CD\u4F5C\u4F1A\u53D1\u751F\u4EC0\u4E48\u3002" })
        ),
        (0, import_react21.createElement)(
          Row,
          null,
          (0, import_react21.createElement)("span", { style: { fontSize: "13px" } }, "\u4E00\u6BB5\u666E\u901A\u6587\u5B57"),
          (0, import_react21.createElement)(FieldHint, { text: "\u6302\u5728\u4EFB\u4F55\u6587\u5B57\u540E\u9762\u90FD\u884C\uFF0C\u5B83\u53EA\u662F\u4E00\u4E2A 14px \u7684\u5185\u8054\u5143\u7D20\u3002" })
        )
      )
    ),
    // Switch / Checkbox / Segmented
    (0, import_react21.createElement)(
      Demo,
      { title: t2("switchTip"), hint: t2("checkboxHint") },
      (0, import_react21.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "14px", alignItems: "flex-start" } },
        (0, import_react21.createElement)(
          "div",
          { style: { display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" } },
          // 「启用」是开关语义，用官方 Switch（用户 2026-10-20：不要用勾去启用）。
          // 官方 Switch 只画胶囊本体，label 是 aria-label，可见文案由调用方自己画在旁边 ——
          // 文案单独挂 onClick 使其可点（不能挂外层：点胶囊会冒泡触发两次翻转）。
          (0, import_react21.createElement)(
            "span",
            { style: { display: "inline-flex", alignItems: "center", gap: "8px" } },
            (0, import_react21.createElement)(import_dsh_client_ui_primitives.Switch, { checked, onChange: setChecked, label: "\u542F\u7528" }),
            (0, import_react21.createElement)("span", {
              style: { fontSize: "13px", cursor: "pointer", userSelect: "none" },
              onClick: () => {
                setChecked(!checked);
              }
            }, "\u542F\u7528")
          ),
          (0, import_react21.createElement)(Checkbox, { checked, onChange: setChecked, label: "\u591A\u9009" }),
          (0, import_react21.createElement)(Segmented, {
            variant: "inset",
            items: [
              { value: "day", label: "\u65E5" },
              { value: "week", label: "\u5468" },
              { value: "month", label: "\u6708" }
            ],
            value: seg,
            onChange: setSeg
          }),
          (0, import_react21.createElement)(Segmented, {
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
          (0, import_react21.createElement)(Segmented, {
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
          (0, import_react21.createElement)(Segmented, {
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
        (0, import_react21.createElement)(Segmented, {
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
        (0, import_react21.createElement)(Segmented, {
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
        (0, import_react21.createElement)(Segmented, {
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
        (0, import_react21.createElement)(Segmented, {
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
    (0, import_react21.createElement)(Placeholder, { descKey: "inputMissingDesc" })
  );
}
var MODELS = [
  {
    value: "openai",
    label: "OpenAI",
    options: [
      { value: "openai/gpt-4", label: "GPT-4" },
      { value: "openai/gpt-3", label: "GPT-3.5" }
    ]
  },
  {
    value: "anthropic",
    label: "Anthropic",
    options: [{ value: "anthropic/claude", label: "Claude" }]
  }
];
function PickerPage() {
  const [single, setSingle] = (0, import_react21.useState)(void 0);
  const [multi, setMulti] = (0, import_react21.useState)([]);
  const [model, setModel] = (0, import_react21.useState)("");
  const [ws, setWs] = (0, import_react21.useState)(void 0);
  const [file, setFile] = (0, import_react21.useState)(void 0);
  return (0, import_react21.createElement)(
    "div",
    null,
    (0, import_react21.createElement)(
      Demo,
      { title: "Picker", hint: t2("pickerHint") },
      (0, import_react21.createElement)(
        "div",
        { style: { display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-start" } },
        (0, import_react21.createElement)(Picker, {
          options: [
            { value: "a", label: "\u9009\u9879 A" },
            { value: "b", label: "\u9009\u9879 B" },
            { value: "c", label: "\u9009\u9879 C" }
          ],
          value: single,
          onChange: (v) => setSingle(v),
          searchable: true,
          clearable: true,
          placeholder: "\u5355\u9009\uFF08\u53EF\u641C\u7D22/\u53EF\u6E05\u9664\uFF09"
        }),
        (0, import_react21.createElement)(Picker, {
          groups: MODELS,
          value: multi,
          mode: "multiple",
          max: 2,
          onChange: (v) => setMulti(v),
          searchable: true,
          placeholder: "\u591A\u9009\uFF08\u4E0A\u9650 2\uFF09"
        }),
        (0, import_react21.createElement)(Picker, {
          options: [{ value: "x", label: "\u964D\u7EA7\u793A\u4F8B" }],
          degraded: true,
          disabled: true,
          placeholder: "\u964D\u7EA7 + \u7981\u7528"
        })
      )
    ),
    (0, import_react21.createElement)(
      Demo,
      { title: "ModelPicker", hint: t2("modelPickerHint") },
      (0, import_react21.createElement)(
        "div",
        { style: { display: "flex", gap: "12px", flexWrap: "wrap" } },
        (0, import_react21.createElement)(ModelPicker, { groups: MODELS, value: model, onChange: setModel, variant: "flat" }),
        (0, import_react21.createElement)(ModelPicker, { groups: MODELS, value: model, onChange: setModel, variant: "cascade" })
      )
    ),
    (0, import_react21.createElement)(
      Demo,
      { title: "WorkspacePicker / FilePicker", hint: t2("workspacePickerHint") },
      (0, import_react21.createElement)(
        "div",
        { style: { display: "flex", gap: "12px", flexWrap: "wrap" } },
        (0, import_react21.createElement)(WorkspacePicker, {
          workspaces: ["nas", "code", "docs"],
          value: ws,
          onChange: (v) => setWs(v),
          clearable: true
        }),
        (0, import_react21.createElement)(FilePicker, {
          files: ["README.md", "package.json", "src/index.ts"],
          value: file,
          onChange: (v) => setFile(v),
          clearable: true
        })
      )
    ),
    (0, import_react21.createElement)(Placeholder, { descKey: "pickerLogicDesc" })
  );
}
function TooltipPage() {
  return (0, import_react21.createElement)(
    Demo,
    { title: t2("tooltipTitle"), hint: t2("tooltipHint") },
    (0, import_react21.createElement)(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: "12px" } },
      (0, import_react21.createElement)(
        Labeled,
        { label: t2("tooltipAnchorButton") },
        tipAnchor("top \xB7 center", "top", "center"),
        tipAnchor("top \xB7 end", "top", "end"),
        tipAnchor("bottom \xB7 center", "bottom", "center"),
        tipAnchor("bottom \xB7 end", "bottom", "end"),
        tipAnchor("right", "right")
      ),
      (0, import_react21.createElement)(
        Labeled,
        { label: t2("tooltipAnchorText") },
        (0, import_react21.createElement)(
          import_dsh_client_ui_primitives.Tooltip,
          { label: t2("tooltipHint"), side: "top" },
          (0, import_react21.createElement)("span", {
            style: { borderBottom: "1px dashed var(--dshpc-border-strong)", cursor: "pointer", fontSize: "13px" }
          }, t2("tooltipAnchorText"))
        ),
        (0, import_react21.createElement)(
          import_dsh_client_ui_primitives.Tooltip,
          { label: t2("tooltipLongText"), side: "bottom", maxWidth: 240 },
          (0, import_react21.createElement)("span", {
            style: { borderBottom: "1px dashed var(--dshpc-border-strong)", cursor: "pointer", fontSize: "13px" }
          }, t2("tooltipLong"))
        )
      ),
      // 两段式：第一行名字（短）、\n 真实换行、第二行正文（长，受 maxWidth 折行）
      (0, import_react21.createElement)(
        Labeled,
        { label: t2("tooltipMultiline") },
        (0, import_react21.createElement)(
          import_dsh_client_ui_primitives.Tooltip,
          { label: `${t2("tooltipName")}
${t2("tooltipLongText")}`, side: "top", maxWidth: 260 },
          (0, import_react21.createElement)("span", {
            style: { borderBottom: "1px dashed var(--dshpc-border-strong)", cursor: "pointer", fontSize: "13px" }
          }, t2("tooltipName"))
        )
      ),
      // 富卡片：官方 HoverCard（宿主工作区列表那种「标题 + 正文」卡就是它）；content 收任意 ReactNode
      (0, import_react21.createElement)(
        Labeled,
        { label: t2("tooltipRich") },
        (0, import_react21.createElement)(import_dsh_client_ui_primitives.HoverCard, {
          variant: "compact",
          openDelayMs: 200,
          anchor: (0, import_react21.createElement)("span", {
            style: { borderBottom: "1px dashed var(--dshpc-border-strong)", cursor: "pointer", fontSize: "13px" }
          }, t2("tooltipName")),
          // ⚠️ 官方 HoverCard 的 compact 变体（.card）背景是硬编码 `#2C2C2E` 且**不设 color**
          // （来源见 docs/design/external/dsh-host.md §10），卡片又被 portal 到 document.body，
          // 文字色因此退化成继承：亮色下继承到近黑 ⇒ 黑字压深底。背景恒深 ⇒ 内容色必须由调用方给，
          // 这里取官方 Tooltip 在同一个深底场景用的常量 `--dsw-static-neutral-bluish-00`（#fff）。
          content: (0, import_react21.createElement)(
            "div",
            {
              style: {
                padding: "4px 2px",
                minWidth: "220px",
                color: "var(--dsw-static-neutral-bluish-00,#fff)"
              }
            },
            (0, import_react21.createElement)("div", { style: { fontWeight: 600, fontSize: "14px", marginBottom: "4px" } }, t2("tooltipName")),
            (0, import_react21.createElement)("div", { style: { fontSize: "12px", lineHeight: 1.6, whiteSpace: "pre-line", opacity: 0.78 } }, t2("tooltipLongText"))
          )
        })
      )
    )
  );
}
function CardPage() {
  const [open, setOpen] = (0, import_react21.useState)(false);
  return (0, import_react21.createElement)(
    "div",
    null,
    (0, import_react21.createElement)(
      Demo,
      { title: t2("demoCardTitle"), hint: t2("cardHint") },
      (0, import_react21.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "10px", maxWidth: "640px" } },
        // 真实形态示例（任务卡同款排版）
        (0, import_react21.createElement)(
          Card,
          { accent: "business" },
          (0, import_react21.createElement)(
            "div",
            { style: { display: "flex", alignItems: "baseline", gap: "8px" } },
            (0, import_react21.createElement)(
              "div",
              { style: { fontWeight: 600, flex: "1 1 auto", minWidth: 0, fontSize: "var(--dshpc-font-md)" } },
              "\u5C06 OpenSSH \u4E0A\u6240\u6709 NPM \u5B89\u88C5\u8FC1\u79FB\u5230 PNPM"
            ),
            (0, import_react21.createElement)("div", { style: { color: "var(--dshpc-fg-3)", fontSize: "var(--dshpc-font-xs)", flex: "none" } }, "2026-10-18 \u521B\u5EFA")
          ),
          (0, import_react21.createElement)(
            "div",
            { style: { display: "flex", alignItems: "center", gap: "6px", marginTop: "6px", flexWrap: "wrap" } },
            (0, import_react21.createElement)(Chip, null, "NAS-Docker"),
            (0, import_react21.createElement)(Chip, null, "#npm"),
            (0, import_react21.createElement)(Chip, null, "#pnpm"),
            (0, import_react21.createElement)(Chip, null, "#OpenSSH"),
            (0, import_react21.createElement)(Chip, null, "#\u8FC1\u79FB")
          )
        ),
        // accent 速览：单行紧凑卡，只看色条档位
        (0, import_react21.createElement)(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" } },
          ["business", "success", "warning", "danger", "neutral"].map(
            (a) => (0, import_react21.createElement)(
              Card,
              { key: a, accent: a, style: { padding: "8px 12px" } },
              (0, import_react21.createElement)("div", { style: { fontSize: "var(--dshpc-font-sm)", color: "var(--dshpc-fg-2)" } }, `accent="${a}"`)
            )
          )
        )
      )
    ),
    (0, import_react21.createElement)(
      Demo,
      { title: t2("demoStripTitle"), hint: t2("stripHint") },
      (0, import_react21.createElement)(
        "div",
        { style: { maxWidth: "640px", background: "var(--dshpc-surface-sunken)", borderRadius: "8px", overflow: "hidden" } },
        (0, import_react21.createElement)(
          StripCard,
          {
            accent: "business",
            action: (0, import_react21.createElement)("span", { style: { color: "var(--dshpc-fg-3)", fontSize: "var(--dshpc-font-xs)", flex: "none" } }, "2026-10-18 \u5F00\u59CB \xB7 \u4ECA\u5929")
          },
          (0, import_react21.createElement)("div", { style: { fontWeight: 600, fontSize: "var(--dshpc-font-md)" } }, "DAY:1 - Docker \u955C\u50CF\u7248\u672C\u68C0\u67E5\u5668"),
          (0, import_react21.createElement)(
            "div",
            { style: { display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", flexWrap: "wrap" } },
            (0, import_react21.createElement)(Chip, null, "NAS-Docker"),
            (0, import_react21.createElement)(
              "span",
              { style: { color: "var(--dshpc-fg-3)", fontSize: "var(--dshpc-font-xs)" } },
              "\u8BA1\u5212 02:00 \xB7 \u5B9E\u9645 02:00 \xB7 \u65F6\u957F 04:02 \xB7 2.4M"
            )
          )
        ),
        (0, import_react21.createElement)(
          StripCard,
          { accent: "success" },
          (0, import_react21.createElement)("div", { style: { fontWeight: 600, fontSize: "var(--dshpc-font-md)" } }, "\u6267\u884C\u6210\u529F"),
          (0, import_react21.createElement)("div", { style: { color: "var(--dshpc-fg-3)", fontSize: "var(--dshpc-font-xs)", marginTop: "4px" } }, "\u8017\u65F6 12s \xB7 3 \u4E2A\u6587\u4EF6\u53D8\u66F4")
        ),
        (0, import_react21.createElement)(
          StripCard,
          {
            accent: "warning",
            expanded: open,
            onToggle: () => setOpen(!open),
            action: (0, import_react21.createElement)(Button, { size: "sm", variant: "ghost" }, "\u67E5\u770B\u4F1A\u8BDD"),
            panel: (0, import_react21.createElement)("div", { style: { fontSize: "12px", color: "var(--dshpc-fg-3)" } }, "\u5C55\u5F00\u540E\u7684\u8BE6\u60C5\u9762\u677F")
          },
          (0, import_react21.createElement)("div", { style: { fontWeight: 600, fontSize: "var(--dshpc-font-md)" } }, "\u6709\u8B66\u544A\uFF08\u53EF\u6298\u53E0\uFF0C\u70B9\u53F3\u4FA7\u7BAD\u5934\uFF09"),
          (0, import_react21.createElement)("div", { style: { color: "var(--dshpc-fg-3)", fontSize: "var(--dshpc-font-xs)", marginTop: "4px" } }, "\u8017\u65F6 8s \xB7 1 \u4E2A\u8B66\u544A")
        )
      )
    ),
    (0, import_react21.createElement)(
      Demo,
      { title: t2("sectionHeadTitle"), hint: "\u5206\u533A\u6807\u9898\uFF1Aicon + \u6807\u9898 + \u53F3\u4FA7\u64CD\u4F5C\u533A\u4E09\u6BB5\u5F0F" },
      (0, import_react21.createElement)(SectionHead, { icon: "\u25B8", title: "\u5206\u533A\u6807\u9898", right: (0, import_react21.createElement)(Button, { size: "sm" }, "\u64CD\u4F5C") })
    )
  );
}
function ChipPage() {
  return (0, import_react21.createElement)(
    "div",
    null,
    (0, import_react21.createElement)(
      Demo,
      { title: "Chip", hint: t2("chipHint") },
      (0, import_react21.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "12px" } },
        // 语义色实心档：状态标签（逾期 / 停滞这类），文案随 locale 切中英
        (0, import_react21.createElement)(
          "div",
          { style: { display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" } },
          (0, import_react21.createElement)(Chip, { tone: "warning" }, t2("chipOverdue")),
          (0, import_react21.createElement)(Chip, { tone: "danger" }, t2("chipStalled")),
          (0, import_react21.createElement)(Chip, { tone: "success" }, t2("chipDone")),
          (0, import_react21.createElement)(Chip, { tone: "business" }, t2("chipDoing"))
        ),
        // 尺寸对比：同一组文案 sm / md 各一行，好挑
        (0, import_react21.createElement)(
          "div",
          { style: { display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" } },
          (0, import_react21.createElement)(Chip, { size: "md", tone: "warning" }, t2("chipOverdue")),
          (0, import_react21.createElement)(Chip, { size: "md", tone: "danger" }, t2("chipStalled")),
          (0, import_react21.createElement)(Chip, { size: "md" }, "Tag MD"),
          (0, import_react21.createElement)(Chip, null, "Tag SM")
        ),
        // 中性 # 标签（语言无关）+ 长文字回归样
        (0, import_react21.createElement)(
          "div",
          { style: { display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" } },
          (0, import_react21.createElement)(Chip, null, "#npm"),
          (0, import_react21.createElement)(Chip, null, "#\u6784\u5EFA"),
          (0, import_react21.createElement)(Chip, { onClick: () => showToast("\u70B9\u4E86 chip") }, "#\u53EF\u70B9"),
          (0, import_react21.createElement)(Chip, null, "\u4E00\u6574\u6BB5\u6BD4\u8F83\u957F\u7684\u6807\u7B7E\u6587\u5B57\uFF0C\u5BBD\u5EA6\u5E94\u8BE5\u8DDF\u7740\u6587\u5B57\u8D70")
        )
      )
    ),
    (0, import_react21.createElement)(
      Demo,
      { title: t2("marqueeTitle"), hint: "\u53CC\u5C42\u7ED3\u6784\uFF1A\u5916\u5C42\u88C1\u526A\u3001\u5185\u5C42\u6EDA\u52A8\uFF1B\u8DD1\u4E00\u904D\u505C\u5728\u5C3E\u5B57\uFF0C\u9F20\u6807\u79FB\u5F00\u590D\u4F4D\u6210\u7701\u7565\u53F7" },
      (0, import_react21.createElement)(
        "div",
        { style: { maxWidth: "200px" } },
        (0, import_react21.createElement)(MarqueeText, { text: "\u8FD9\u662F\u4E00\u6BB5\u5F88\u957F\u7684\u6587\u5B57\uFF0C\u653E\u4E0D\u4E0B\u65F6 hover \u4F1A\u6EDA\u52A8\u5C55\u793A\u5168\u540D" })
      )
    ),
    (0, import_react21.createElement)(
      Demo,
      { title: t2("liveTitle"), hint: "\u8BA2\u9605\u5185\u90E8\u8282\u62CD\u5668\uFF0C\u8D70\u65F6 Ui \u7531\u8C03\u7528\u65B9\u6E32\u67D3" },
      (0, import_react21.createElement)(LiveText, { render: (nowMs) => new Date(nowMs).toLocaleTimeString() })
    ),
    (0, import_react21.createElement)(
      Demo,
      { title: t2("emptyStateTitle"), hint: "\u4E1A\u52A1\u7A7A\u6001\uFF1A\u65E0\u6570\u636E\u65F6\u7684\u5360\u4F4D\uFF0C\u53EF\u6302\u4E00\u4E2A\u64CD\u4F5C\u6309\u94AE" },
      (0, import_react21.createElement)(EmptyState, { text: "\u6682\u65E0\u6570\u636E" })
    )
  );
}
function Boom() {
  throw new Error("\u6F14\u793A\uFF1A\u5B50\u7EC4\u4EF6\u629B\u9519\u88AB\u8FB9\u754C\u63A5\u4F4F");
}
function FeedbackPage() {
  const [open, setOpen] = (0, import_react21.useState)(false);
  const [boom, setBoom] = (0, import_react21.useState)(false);
  return (0, import_react21.createElement)(
    "div",
    null,
    (0, import_react21.createElement)(
      Demo,
      { title: "Modal", hint: t2("feedbackModalHint") },
      (0, import_react21.createElement)(
        "div",
        null,
        (0, import_react21.createElement)(Button, { onClick: () => setOpen(true) }, "\u6253\u5F00\u5F39\u7A97"),
        open ? (0, import_react21.createElement)(Modal, {
          title: "\u4EFB\u52A1\u8BE6\u60C5",
          onClose: () => setOpen(false),
          footer: (0, import_react21.createElement)(Button, { variant: "primary", onClick: () => setOpen(false) }, "\u77E5\u9053\u4E86")
        }, (0, import_react21.createElement)("div", null, "\u5F39\u7A97\u4E3B\u4F53\u5185\u5BB9\u2014\u2014\u4F1A\u8BDD\u9884\u89C8\u8FD9\u7C7B\u529F\u80FD\u5C31\u7528\u5B83\u6765\u627F\u8F7D\u3002")) : null
      )
    ),
    (0, import_react21.createElement)(
      Demo,
      { title: "toast", hint: t2("feedbackToastHint") },
      (0, import_react21.createElement)(
        "div",
        { style: { display: "flex", gap: "8px" } },
        (0, import_react21.createElement)(Button, { onClick: () => showToast("\u5DF2\u4FDD\u5B58") }, "\u666E\u901A"),
        (0, import_react21.createElement)(Button, { onClick: () => showToast("\u4FDD\u5B58\u6210\u529F", { variant: "success" }) }, "\u6210\u529F"),
        (0, import_react21.createElement)(Button, { onClick: () => showToast("\u4FDD\u5B58\u5931\u8D25", { variant: "error" }) }, "\u5931\u8D25")
      )
    ),
    (0, import_react21.createElement)(
      Demo,
      { title: "ErrorBoundary / Loading" },
      (0, import_react21.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "12px" } },
        (0, import_react21.createElement)(
          "div",
          { style: { border: "1px solid var(--dshpc-border-faint)", borderRadius: "8px", padding: "10px" } },
          boom ? (0, import_react21.createElement)(ErrorBoundary, null, (0, import_react21.createElement)(Boom, null)) : (0, import_react21.createElement)(Button, { variant: "danger", onClick: () => setBoom(true) }, "\u70B9\u6211\u629B\u9519\uFF08\u770B\u8FB9\u754C\u515C\u5E95\uFF09")
        ),
        (0, import_react21.createElement)("div", { style: { color: "var(--dshpc-fg-3)", fontSize: "12px" } }, t2("loadingNote"))
      )
    )
  );
}
function LayoutPage() {
  return (0, import_react21.createElement)(Placeholder, { descKey: "layoutDesc" });
}

// packages/demo/src/sections/blocks.tsx
var import_react25 = require("react");

// dist/explorer/ExplorerPanel.js
var import_react23 = require("react");

// dist/explorer/preview/index.js
var import_react22 = require("react");

// dist/explorer/types.js
function previewKindOf(path) {
  if (mimeOf(path) !== void 0)
    return "image";
  const ext = extOf(path);
  if (ext === "")
    return "text";
  const textLike = /* @__PURE__ */ new Set([
    "txt",
    "md",
    "markdown",
    "json",
    "yaml",
    "yml",
    "toml",
    "ini",
    "csv",
    "log",
    "ts",
    "tsx",
    "js",
    "jsx",
    "mjs",
    "cjs",
    "py",
    "go",
    "rs",
    "java",
    "c",
    "h",
    "cpp",
    "sh",
    "bash",
    "sql",
    "html",
    "css",
    "xml"
  ]);
  return textLike.has(ext) ? "text" : "unsupported";
}

// dist/explorer/preview/index.js
function FilePreview(props) {
  ensureControls();
  const tt = props.translate ?? t;
  const kind = previewKindOf(props.path);
  const [text, setText] = (0, import_react22.useState)(null);
  const [imageUrl, setImageUrl] = (0, import_react22.useState)(null);
  const [failed, setFailed] = (0, import_react22.useState)(false);
  (0, import_react22.useEffect)(() => {
    let alive = true;
    let url = null;
    setText(null);
    setImageUrl(null);
    setFailed(false);
    const run = async () => {
      if (kind === "text") {
        const res = await props.workspaceFiles.read(props.sessionId, props.path, {});
        if (alive)
          setText(res.text);
        return;
      }
      if (kind === "image") {
        const res = await props.workspaceFiles.readBytes(props.sessionId, props.path, {});
        const mime = mimeOf(props.path) ?? "application/octet-stream";
        const blob = new Blob([new Uint8Array(res.data)], { type: mime });
        url = URL.createObjectURL(blob);
        if (alive)
          setImageUrl(url);
        return;
      }
    };
    run().catch(() => {
      if (alive)
        setFailed(true);
    });
    return () => {
      alive = false;
      if (url !== null)
        URL.revokeObjectURL(url);
    };
  }, [props.path, props.sessionId, props.workspaceFiles, kind]);
  if (kind === "unsupported") {
    return (0, import_react22.createElement)(EmptyState, { text: tt("explorerUnsupported"), translate: tt });
  }
  if (failed)
    return (0, import_react22.createElement)(EmptyState, { text: tt("explorerFailed"), translate: tt });
  if (kind === "image") {
    return imageUrl === null ? (0, import_react22.createElement)("div", { className: "dshpc-exp__note" }, tt("explorerLoading")) : (0, import_react22.createElement)("img", { className: "dshpc-exp__image", src: imageUrl, alt: props.path });
  }
  return text === null ? (0, import_react22.createElement)("div", { className: "dshpc-exp__note" }, tt("explorerLoading")) : (0, import_react22.createElement)("pre", { className: "dshpc-exp__text" }, text);
}

// dist/explorer/ExplorerPanel.js
function ExplorerPanel(props) {
  ensureControls();
  const tt = props.translate ?? t;
  const [dir, setDir] = (0, import_react23.useState)(props.path ?? "");
  const [entries, setEntries] = (0, import_react23.useState)([]);
  const [truncated, setTruncated] = (0, import_react23.useState)(false);
  const [loading, setLoading] = (0, import_react23.useState)(true);
  const [failed, setFailed] = (0, import_react23.useState)(false);
  const [selected, setSelected] = (0, import_react23.useState)(null);
  const [nonce, setNonce] = (0, import_react23.useState)(0);
  (0, import_react23.useEffect)(() => {
    let alive = true;
    setLoading(true);
    setFailed(false);
    props.workspaceFiles.list(props.sessionId, dir === "" ? "." : dir).then((res) => {
      if (!alive)
        return;
      setEntries([...res.entries]);
      setTruncated(res.truncated);
      setLoading(false);
    }).catch(() => {
      if (!alive)
        return;
      setEntries([]);
      setFailed(true);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [dir, props.sessionId, props.workspaceFiles, nonce]);
  const crumbs = crumbsOf(dir);
  const goto = (next) => {
    setSelected(null);
    props.onSelect?.(null);
    setDir(next);
  };
  const crumbBar = (0, import_react23.createElement)("div", { className: "dshpc-exp__crumbs" }, (0, import_react23.createElement)("button", { type: "button", className: "dshpc-exp__crumb", onClick: () => goto("") }, tt("explorerRoot")), crumbs.map((c, i) => {
    const isLast = i === crumbs.length - 1;
    const upto = crumbs.slice(0, i + 1).join("/");
    return (0, import_react23.createElement)("span", { key: upto }, (0, import_react23.createElement)("span", { className: "dshpc-exp__sep" }, " / "), (0, import_react23.createElement)("button", {
      type: "button",
      className: `dshpc-exp__crumb${isLast ? " dshpc-exp__crumb--current" : ""}`,
      onClick: () => goto(upto)
    }, c));
  }), (0, import_react23.createElement)("span", { className: "dshpc-exp__tools" }, (0, import_react23.createElement)("button", {
    type: "button",
    className: "dshpc-exp__crumb",
    disabled: dir === "",
    onClick: () => goto(parentOf(dir))
  }, tt("explorerUp")), (0, import_react23.createElement)("button", { type: "button", className: "dshpc-exp__crumb", onClick: () => setNonce(nonce + 1) }, tt("explorerRefresh"))));
  const tree = loading ? (0, import_react23.createElement)("div", { className: "dshpc-exp__note" }, tt("explorerLoading")) : failed ? (0, import_react23.createElement)(EmptyState, { text: tt("explorerFailed"), translate: tt }) : entries.length === 0 ? (0, import_react23.createElement)("div", { className: "dshpc-exp__note" }, props.emptyText ?? tt("explorerEmptyDir")) : (0, import_react23.createElement)("div", { className: "dshpc-exp__tree" }, [...entries].sort((a, b) => {
    if (a.type !== b.type)
      return a.type === "directory" ? -1 : 1;
    return a.name.localeCompare(b.name);
  }).map((e) => {
    const full = joinPath(dir, e.name);
    const isDir = e.type === "directory";
    return (0, import_react23.createElement)("div", {
      key: full,
      className: `dshpc-exp__item${selected === full ? " dshpc-exp__item--active" : ""}`,
      onClick: () => {
        if (isDir)
          goto(full);
        else {
          setSelected(full);
          props.onSelect?.(full);
          props.onOpenFile?.(full);
        }
      }
    }, (0, import_react23.createElement)("span", { className: "dshpc-exp__icon" }, isDir ? "\u25B8" : "\xB7"), (0, import_react23.createElement)("span", { className: "dshpc-exp__name" }, e.name), e.size === void 0 ? null : (0, import_react23.createElement)("span", { className: "dshpc-exp__size" }, formatBytes(e.size)));
  }), truncated ? (0, import_react23.createElement)("div", { className: "dshpc-exp__note" }, tt("explorerTruncated")) : null);
  return (0, import_react23.createElement)("div", { className: "dshpc-exp" }, crumbBar, (0, import_react23.createElement)("div", { className: "dshpc-exp__body" }, tree, (0, import_react23.createElement)("div", { className: "dshpc-exp__preview" }, selected === null ? null : (0, import_react23.createElement)(FilePreview, {
    workspaceFiles: props.workspaceFiles,
    sessionId: props.sessionId,
    path: selected,
    translate: tt
  }))));
}

// dist/session/index.js
var import_react24 = require("react");

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
  const [messages, setMessages] = (0, import_react24.useState)([]);
  const [loading, setLoading] = (0, import_react24.useState)(true);
  const [failed, setFailed] = (0, import_react24.useState)(false);
  const [nonce, setNonce] = (0, import_react24.useState)(0);
  (0, import_react24.useEffect)(() => {
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
  const body = loading ? (0, import_react24.createElement)("div", { className: "dshpc-ses__note" }, tt("sessionLoading")) : failed ? (0, import_react24.createElement)(EmptyState, {
    text: tt("sessionFailed"),
    translate: tt,
    action: (0, import_react24.createElement)("button", { type: "button", className: "dshpc-error__retry", onClick: () => setNonce(nonce + 1) }, tt("errorRetry"))
  }) : messages.length === 0 ? (0, import_react24.createElement)(EmptyState, { text: tt("sessionEmpty"), translate: tt }) : (0, import_react24.createElement)("div", { className: "dshpc-ses__list" }, messages.map((m) => props.renderMessage !== void 0 ? (0, import_react24.createElement)("div", { key: m.id }, props.renderMessage(m)) : (0, import_react24.createElement)("div", { key: m.id, className: `dshpc-ses__msg dshpc-ses__msg--${m.role}` }, (0, import_react24.createElement)("div", { className: "dshpc-ses__head" }, tt(ROLE_LABEL_KEY[m.role])), (0, import_react24.createElement)("pre", { className: "dshpc-ses__text" }, m.text), (m.attachments ?? []).length === 0 ? null : (0, import_react24.createElement)("div", { className: "dshpc-ses__atts" }, (m.attachments ?? []).map((a) => (0, import_react24.createElement)("button", {
    key: a.path,
    type: "button",
    className: "dshpc-ses__att",
    onClick: () => props.onOpenFile?.(a.path)
  }, a.name, a.bytes === void 0 ? null : ` ${formatBytes(a.bytes)}`))))));
  if (variant === "modal") {
    return (0, import_react24.createElement)(Modal, {
      title: props.title ?? props.sessionId,
      onClose: props.onClose,
      children: (0, import_react24.createElement)("div", { className: "dshpc-ses", style: { minWidth: "min(720px, 88vw)" } }, body)
    });
  }
  return (0, import_react24.createElement)("div", { className: `dshpc-ses dshpc-ses--${variant}` }, props.onClose === void 0 ? null : (0, import_react24.createElement)("div", { className: "dshpc-ses__head" }, (0, import_react24.createElement)("button", { type: "button", className: "dshpc-exp__crumb", onClick: props.onClose }, "\u2715")), body);
}

// packages/demo/src/mock.ts
var TREE = {
  ".": [
    { name: "src", type: "directory" },
    { name: "docs", type: "directory" },
    { name: "README.md", type: "file", size: 731 },
    { name: "package.json", type: "file", size: 605 },
    { name: "logo.png", type: "file", size: 24576 }
  ],
  src: [
    { name: "index.ts", type: "file", size: 1204 },
    { name: "ui", type: "directory" }
  ],
  "src/ui": [{ name: "Picker.ts", type: "file", size: 4180 }],
  docs: [{ name: "requirements.md", type: "file", size: 8960 }]
};
var TEXT = {
  "README.md": "# dsh-plugin-core\n\nDSH \u63D2\u4EF6\u5171\u4EAB\u5E95\u5EA7\u3002\n",
  "package.json": '{\n  "name": "dsh-plugin-core"\n}\n',
  "src/index.ts": "export * from './ui/index.js'\n",
  "src/ui/Picker.ts": "export function Picker() { /* ... */ }\n",
  "docs/requirements.md": "# \u9700\u6C42\u6587\u6863\n\n\uFF08\u9884\u89C8\u7528\u5047\u6570\u636E\uFF09\n"
};
var mockWorkspaceFiles = {
  async read(sessionId, path) {
    await delay(120);
    return { offset: 0, text: TEXT[path] ?? "\uFF08\u9884\u89C8\uFF1A\u8BE5\u6587\u4EF6\u65E0\u5047\u6570\u636E\uFF09", lines: 1, eof: true };
  },
  async readBytes(sessionId, path) {
    await delay(120);
    return {
      offset: 0,
      eof: true,
      data: new Uint8Array([
        137,
        80,
        78,
        71,
        13,
        10,
        26,
        10,
        0,
        0,
        0,
        13,
        73,
        72,
        68,
        82,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1,
        8,
        6,
        0,
        0,
        0,
        31,
        21,
        196,
        137,
        0,
        0,
        0,
        10,
        73,
        68,
        65,
        84,
        120,
        156,
        99,
        0,
        1,
        0,
        0,
        5,
        0,
        1,
        13,
        10,
        45,
        180,
        0,
        0,
        0,
        0,
        73,
        69,
        78,
        68,
        174,
        66,
        96,
        130
      ])
    };
  },
  async list(sessionId, path) {
    await delay(120);
    const key = path === "." || path === "" ? "." : path;
    const entries = TREE[key];
    if (entries === void 0) throw new Error("not-directory");
    return { path, entries: entries.map((e) => ({ ...e })), truncated: false };
  }
};
var mockSessionSource = {
  async listMessages(sessionId) {
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
      { id: "4", role: "assistant", text: "\u6784\u5EFA\u5B8C\u6210\uFF0C33 \u6761\u81EA\u68C0\u5168\u8FC7\u3002" }
    ];
  },
  async download(sessionId, path) {
    return new TextEncoder().encode(`\u9884\u89C8\u5047\u6587\u4EF6\uFF1A${path}`);
  }
};
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// packages/demo/src/sections/blocks.tsx
function ExplorerPage() {
  const [selected, setSelected] = (0, import_react25.useState)(null);
  return (0, import_react25.createElement)(
    "div",
    null,
    (0, import_react25.createElement)(
      Demo,
      { title: "ExplorerPanel", hint: t2("explorerHint") },
      (0, import_react25.createElement)(
        "div",
        { style: { display: "flex", gap: "16px", flexWrap: "wrap" } },
        (0, import_react25.createElement)(
          "div",
          {
            style: {
              width: "520px",
              height: "380px",
              overflow: "hidden",
              border: "1px solid var(--dshpc-border)",
              borderRadius: "8px"
            }
          },
          (0, import_react25.createElement)(ExplorerPanel, {
            workspaceFiles: mockWorkspaceFiles,
            sessionId: "demo-session",
            path: "",
            onSelect: setSelected
          })
        ),
        (0, import_react25.createElement)(
          "div",
          { style: { fontSize: "12px", color: "var(--dshpc-fg-3)", alignSelf: "center" } },
          selected === null ? "\u70B9\u5DE6\u4FA7\u6587\u4EF6\u8BD5\u8BD5" : `\u5DF2\u9009\u4E2D\uFF1A${selected}`
        )
      )
    ),
    (0, import_react25.createElement)(
      Demo,
      { title: t2("previewBodyTitle"), hint: t2("previewBodyHint") },
      null
    )
  );
}
function SessionPage() {
  const [open, setOpen] = (0, import_react25.useState)(false);
  return (0, import_react25.createElement)(
    Demo,
    { title: "SessionPreview", hint: t2("sessionHint") },
    (0, import_react25.createElement)(
      "div",
      { style: { display: "flex", gap: "12px", flexWrap: "wrap" } },
      (0, import_react25.createElement)(Button, { variant: "primary", onClick: () => setOpen(true) }, "\u6253\u5F00\u4F1A\u8BDD\u9884\u89C8\uFF08modal\uFF09"),
      (0, import_react25.createElement)(Button, { onClick: () => setOpen(false) }, "\u5173\u95ED")
    ),
    open ? (0, import_react25.createElement)(SessionPreview, {
      sessionId: "demo-session",
      source: mockSessionSource,
      variant: "modal",
      title: "\u4F1A\u8BDD\u9884\u89C8\uFF08\u5047\u6570\u636E\uFF09",
      onClose: () => setOpen(false),
      onOpenFile: () => setOpen(false)
    }) : null
  );
}

// packages/demo/src/sections/utils.tsx
var import_react26 = require("react");
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
  return (0, import_react26.createElement)(
    "table",
    { style: { borderCollapse: "collapse", fontSize: "13px" } },
    (0, import_react26.createElement)(
      "thead",
      null,
      (0, import_react26.createElement)(
        "tr",
        null,
        (0, import_react26.createElement)("th", { style: th }, "\u51FD\u6570"),
        (0, import_react26.createElement)("th", { style: th }, "\u8FD4\u56DE\u503C")
      )
    ),
    (0, import_react26.createElement)(
      "tbody",
      null,
      props.rows.map(
        ([fn, out]) => (0, import_react26.createElement)(
          "tr",
          { key: fn },
          (0, import_react26.createElement)("td", { style: td }, fn),
          (0, import_react26.createElement)("td", { style: td }, out)
        )
      )
    )
  );
}
var th = { textAlign: "left", padding: "6px 14px 6px 0", color: "var(--dshpc-fg-3)" };
var td = { padding: "5px 14px 5px 0", borderTop: "1px solid var(--dshpc-border-faint)" };
function DatePage() {
  return (0, import_react26.createElement)(Demo, { title: "date / time", hint: t2("dateHint") }, (0, import_react26.createElement)(FnTable, { rows: DATE_ROWS }));
}
function NumberPage() {
  return (0, import_react26.createElement)(Demo, { title: "number / bytes", hint: t2("numberHint") }, (0, import_react26.createElement)(FnTable, { rows: NUMBER_ROWS }));
}
function TextPage() {
  return (0, import_react26.createElement)(Placeholder, { descKey: "textDesc" });
}
function HttpPage() {
  return (0, import_react26.createElement)(Placeholder, { descKey: "httpDesc" });
}
function I18nPage() {
  return (0, import_react26.createElement)(
    "div",
    null,
    (0, import_react26.createElement)(
      Demo,
      { title: "getLocale / setLocale", hint: t2("i18nDesc") },
      (0, import_react26.createElement)(
        "div",
        { style: { display: "flex", alignItems: "center", gap: "10px" } },
        (0, import_react26.createElement)("span", { style: { fontFamily: "var(--dshpc-font-mono)", fontSize: "12px", color: "var(--dshpc-fg-3)" } }, t2("i18nNow")),
        (0, import_react26.createElement)("code", {
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
    (0, import_react26.createElement)(Placeholder, { descKey: "i18nDesc" })
  );
}

// packages/demo/src/sections/reference.tsx
var import_react27 = require("react");
function A11yPage() {
  return (0, import_react27.createElement)(Placeholder, { descKey: "a11yDesc" });
}
var OUT_OF_SCOPE = ["roadmapOut", "roadmapMirror", "roadmapPreview", "roadmapSkeleton"];
function RoadmapPage() {
  return (0, import_react27.createElement)(
    Demo,
    { title: "out of scope", hint: t2("roadmapHint") },
    (0, import_react27.createElement)(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: "10px" } },
      OUT_OF_SCOPE.map(
        (key) => (0, import_react27.createElement)(
          "div",
          { key, style: { display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "13px" } },
          (0, import_react27.createElement)("span", { style: { color: "var(--dshpc-fg-4)", flex: "none", lineHeight: "1.7" } }, "\xB7"),
          (0, import_react27.createElement)("span", { style: { color: "var(--dshpc-fg-2)", lineHeight: "1.7" } }, t2(key))
        )
      ),
      // SidebarLayout / SplitPane 属于「待补」但没那么绝对，单独标一行
      (0, import_react27.createElement)(
        "div",
        { style: { marginTop: "2px", fontSize: "12px", color: "var(--dshpc-fg-3)" } },
        t2("roadmapLayout")
      )
    )
  );
}
function BuildPage() {
  const rows = [
    [t2("buildCore"), `v${"0.2.14"}`],
    [t2("buildDemo"), `v${"0.2.14"}`],
    [t2("buildStamp"), "1020-0725-7jts"]
  ];
  return (0, import_react27.createElement)(
    Demo,
    { title: "version / build", hint: t2("buildDesc") },
    (0, import_react27.createElement)(
      "table",
      { style: { borderCollapse: "collapse", fontSize: "13px" } },
      (0, import_react27.createElement)(
        "tbody",
        null,
        rows.map(
          ([label, value]) => (0, import_react27.createElement)(
            "tr",
            { key: label },
            (0, import_react27.createElement)("td", { style: { padding: "5px 18px 5px 0", color: "var(--dshpc-fg-3)", whiteSpace: "nowrap" } }, label),
            (0, import_react27.createElement)("td", {
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
  );
}

// packages/demo/src/sections/index.tsx
var SECTION_GROUPS = [
  { id: "start", titleKey: "grpStart" },
  { id: "foundation", titleKey: "grpFoundation" },
  { id: "components", titleKey: "grpComponents" },
  { id: "blocks", titleKey: "grpBlocks" },
  { id: "utils", titleKey: "grpUtils" },
  { id: "reference", titleKey: "grpReference" }
];
var ALL_SECTIONS = [
  { id: "overview", group: "start", titleKey: "secOverview", render: () => (0, import_react28.createElement)(OverviewPage, null) },
  { id: "install", group: "start", titleKey: "secInstall", render: () => (0, import_react28.createElement)(InstallPage, null) },
  { id: "quickstart", group: "start", titleKey: "secQuickstart", render: () => (0, import_react28.createElement)(QuickstartPage, null) },
  { id: "tokens", group: "foundation", titleKey: "secTokens", render: () => (0, import_react28.createElement)(TokensPage, null) },
  { id: "dark", group: "foundation", titleKey: "secDark", render: () => (0, import_react28.createElement)(DarkPage, null) },
  { id: "inject", group: "foundation", titleKey: "secInject", render: () => (0, import_react28.createElement)(InjectPage, null) },
  { id: "naming", group: "foundation", titleKey: "secNaming", render: () => (0, import_react28.createElement)(NamingPage, null) },
  { id: "button", group: "components", titleKey: "secButton", render: () => (0, import_react28.createElement)(ButtonPage, null) },
  { id: "input", group: "components", titleKey: "secInput", render: () => (0, import_react28.createElement)(InputPage, null) },
  { id: "picker", group: "components", titleKey: "secPicker", render: () => (0, import_react28.createElement)(PickerPage, null) },
  { id: "tooltip", group: "components", titleKey: "secTooltip", render: () => (0, import_react28.createElement)(TooltipPage, null) },
  { id: "card", group: "components", titleKey: "secCard", render: () => (0, import_react28.createElement)(CardPage, null) },
  { id: "chip", group: "components", titleKey: "secChip", render: () => (0, import_react28.createElement)(ChipPage, null) },
  { id: "feedback", group: "components", titleKey: "secFeedback", render: () => (0, import_react28.createElement)(FeedbackPage, null) },
  { id: "layout", group: "components", titleKey: "secLayout", render: () => (0, import_react28.createElement)(LayoutPage, null) },
  { id: "explorer", group: "blocks", titleKey: "secExplorer", render: () => (0, import_react28.createElement)(ExplorerPage, null) },
  { id: "session", group: "blocks", titleKey: "secSession", render: () => (0, import_react28.createElement)(SessionPage, null) },
  { id: "date", group: "utils", titleKey: "secDate", render: () => (0, import_react28.createElement)(DatePage, null) },
  { id: "text", group: "utils", titleKey: "secText", render: () => (0, import_react28.createElement)(TextPage, null) },
  { id: "number", group: "utils", titleKey: "secNumber", render: () => (0, import_react28.createElement)(NumberPage, null) },
  { id: "http", group: "utils", titleKey: "secHttp", render: () => (0, import_react28.createElement)(HttpPage, null) },
  { id: "i18n", group: "utils", titleKey: "secI18n", render: () => (0, import_react28.createElement)(I18nPage, null) },
  { id: "a11y", group: "reference", titleKey: "secA11y", render: () => (0, import_react28.createElement)(A11yPage, null) },
  { id: "roadmap", group: "reference", titleKey: "secRoadmap", render: () => (0, import_react28.createElement)(RoadmapPage, null) },
  { id: "build", group: "reference", titleKey: "secBuild", render: () => (0, import_react28.createElement)(BuildPage, null) }
];
function Demo(props) {
  return (0, import_react28.createElement)(
    "section",
    {
      style: {
        marginBottom: "28px",
        padding: "16px 18px",
        border: "1px solid var(--dshpc-border-faint)",
        borderRadius: "8px",
        background: "var(--dshpc-surface-1)"
      }
    },
    (0, import_react28.createElement)("h3", { style: { margin: "0 0 2px", fontSize: "15px" } }, props.title),
    props.hint === void 0 ? null : (0, import_react28.createElement)("div", { style: { color: "var(--dshpc-fg-3)", fontSize: "12px", marginBottom: "12px" } }, props.hint),
    (0, import_react28.createElement)("div", { style: { marginBottom: props.code === void 0 ? 0 : "12px" } }, props.children ?? null),
    props.code === void 0 ? null : (0, import_react28.createElement)(
      "pre",
      {
        style: {
          margin: 0,
          padding: "10px 12px",
          borderRadius: "6px",
          overflowX: "auto",
          background: "var(--dshpc-code-surface)",
          color: "var(--dshpc-fg)",
          font: "var(--dshpc-code-font)",
          fontSize: "12px"
        }
      },
      props.code
    )
  );
}
function Placeholder(props) {
  return (0, import_react28.createElement)(
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
    (0, import_react28.createElement)("div", {
      style: {
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: ".06em",
        textTransform: "uppercase",
        color: "var(--dshpc-fg-4)",
        marginBottom: "10px"
      }
    }, t2("phTodo")),
    (0, import_react28.createElement)("div", { style: { fontSize: "13px", lineHeight: "1.9", whiteSpace: "pre-line" } }, t2(props.descKey))
  );
}
function SectionHead2(props) {
  return (0, import_react28.createElement)(
    "div",
    { id: `sec-${props.id}`, style: { margin: "28px 0 14px" } },
    (0, import_react28.createElement)("h2", { style: { margin: 0, fontSize: "20px" } }, props.title),
    (0, import_react28.createElement)("div", { style: { height: "3px", width: "36px", background: "var(--dshpc-business)", borderRadius: "2px", marginTop: "6px" } })
  );
}
function Sections(props) {
  const current3 = ALL_SECTIONS.find((s) => s.id === props.active) ?? ALL_SECTIONS[0];
  return (0, import_react28.createElement)(
    "div",
    null,
    (0, import_react28.createElement)(SectionHead2, { id: current3.id, title: t2(current3.titleKey) }),
    current3.render()
  );
}

// packages/demo/src/client/index.tsx
var PANEL_ID = "dsh-plugin-core-demo";
var localeRuntime;
function useLocaleTick() {
  const [, setTick] = (0, import_react29.useState)(0);
  (0, import_react29.useEffect)(() => {
    const rt = localeRuntime;
    if (rt === void 0) return;
    return rt.subscribe(() => {
      setTick((v) => v + 1);
    });
  }, []);
}
function DemoPage() {
  useLocaleTick();
  const [active, setActive] = (0, import_react29.useState)(ALL_SECTIONS[0].id);
  const nav = [];
  SECTION_GROUPS.forEach((group, gi) => {
    nav.push(
      (0, import_react29.createElement)(
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
        (0, import_react29.createElement)(
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
  return (0, import_react29.createElement)(
    "div",
    { style: { display: "flex", alignItems: "stretch", height: "100%", minHeight: 0, overflow: "hidden" } },
    (0, import_react29.createElement)(
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
    (0, import_react29.createElement)(
      "main",
      { style: { flex: 1, minWidth: 0, minHeight: 0, height: "100%", boxSizing: "border-box", overflowY: "auto", padding: "12px 22px 60px" } },
      (0, import_react29.createElement)(Sections, { active })
    )
  );
}
function OpenPreviewCard(props) {
  return (0, import_react29.createElement)(
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
    (0, import_react29.createElement)(
      "div",
      null,
      (0, import_react29.createElement)("div", { style: { fontWeight: 600, fontSize: "14px" } }, t2("pluginTitle")),
      (0, import_react29.createElement)(
        "div",
        { style: { color: "var(--dshpc-fg-3)", fontSize: "12px", marginTop: "2px" } },
        t2("pluginCardDesc")
      )
    ),
    (0, import_react29.createElement)("span", { style: { color: "var(--dshpc-business)", fontSize: "13px" } }, t2("pluginCardOpen"))
  );
}
function PanelIcon() {
  return (0, import_react29.createElement)(
    "span",
    { style: { display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "13px" } },
    "\u25E7"
  );
}
function apply(ctx) {
  const kit = createStyleKit({ id: "dsh-plugin-core-plugin" });
  setStyleKit(kit);
  ensureControls(kit);
  kit.ensureStyles();
  setTooltipRenderer((props) => (0, import_react29.createElement)(import_dsh_client_ui_primitives2.Tooltip, props));
  let jump = () => {
  };
  ctx.inject(["layout"], (sub) => {
    const select = sub?.layout?.selectPanel;
    if (typeof select === "function") jump = (id) => {
      select(id);
    };
  });
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
        (props) => (0, import_react29.createElement)(OpenPreviewCard, { open: props?.open ?? (() => {
          jump(PANEL_ID);
        }) })
      );
    });
  });
}

return module.exports; } });

