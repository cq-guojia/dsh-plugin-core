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
var import_react31 = require("react");
var import_dsh_client_ui_primitives2 = require("@deepseek-ai/dsh-client-ui-primitives");

// dist/design/tokens-css.js
var TOKENS_CSS_TEMPLATE = `
/* \u2500\u2500 \u6587\u5B57\uFF08\u5BBF\u4E3B label \u56DB\u6863 + \u53CD\u8272\u9762\u7528\u5B57\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
body{
  --dshpc-fg:var(--dsw-alias-label-primary,#1f2328);
  --dshpc-fg-2:var(--dsw-alias-label-secondary,#5c6370);
  --dshpc-fg-3:var(--dsw-alias-label-tertiary,#767d87);
  --dshpc-fg-4:var(--dsw-alias-label-caption,#9aa1ab);
  --dshpc-fg-dim:var(--dsw-alias-label-dimmed,#b9bfc7);
  /* \u53CD\u8272\u9762\u4E0A\u7684\u5B57\uFF08\u5B9E\u5FC3\u94AE / \u89D2\u6807\uFF09\uFF1A\u6697\u8272\u4E0B\u662F bluish-1000\uFF0C\u6545\u7528 -foreground \u800C\u975E -inverted */
  --dshpc-fg-inverse:var(--dsw-alias-label-primary-foreground,#fff);

  /* \u2500\u2500 \u9762\uFF08\u5BBF\u4E3B bg-layer \u4E09\u6863 + \u4E0B\u6C89\u8F68\u9053\u5E95\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  --dshpc-surface-1:var(--dsw-alias-bg-layer-1,#fff);
  --dshpc-surface-2:var(--dsw-alias-bg-layer-2,#fff);
  --dshpc-surface-3:var(--dsw-alias-bg-layer-3,#fff);
  /* \u300C\u9009\u4E2D\u4EAE\u7247\u300D\u7684\u5E95\u76D8\u8272\uFF08\u914D --dshpc-shadow-raised \u7528\uFF09 */
  --dshpc-surface-raised:var(--dsw-alias-bg-layer-1,#fff);
  /* \u8F68\u9053 / \u4E0B\u6C89\u5E95\uFF08\u5B98\u65B9\u5206\u6BB5\u63A7\u4EF6\u8F68\u9053\u7528\u7684\u5C31\u662F\u8FD9\u6761\uFF09 */
  --dshpc-surface-sunken:var(--dsw-alias-interactive-bg-hover,rgba(38,49,72,.06));
  /* \u6574\u9875 / \u7F16\u8F91\u5668\u5E95\uFF08bg-base\uFF09 */
  --dshpc-surface-base:var(--dsw-alias-bg-base,#fff);
  /* \u81EA\u7ED8\u6D6E\u5C42 / \u83DC\u5355\u5361\u7684\u4E0D\u900F\u660E\u5E95\uFF08= base\uFF1B\u4E0D\u8981\u7528\u534A\u900F\u660E\u7684 specific-menu\uFF09 */
  --dshpc-surface-menu:var(--dshpc-surface-base);
  /* markdown \u4EE3\u7801\u5757\u9762 / \u5B57\u4F53\uFF08\u4F1A\u8BDD\u955C\u50CF\u91CC\u7528\u5230\uFF09 */
  --dshpc-code-surface:var(--dsw-alias-markdown-code-block,rgba(128,128,128,.10));
  --dshpc-code-font:var(--dsw-font-markdown-code-block-small,12px/18px var(--ds-font-family-code,monospace));
  /* \u8B66\u544A\u6587\u5B57\u8272\uFF08\u5BBF\u4E3B state-warn-label\uFF09 */
  --dshpc-warning-label:var(--dsw-alias-state-warn-label,#f5a623);
  /* \u56FA\u5B9A\u4E2D\u6027\u5B9E\u9762\uFF08\u81EA\u7ED8\u6D6E\u5C42\u3001\u6DF1\u8272\u4E3B\u9898\u4E0B\u5FC5\u987B\u81EA\u5DF1\u53D8\u7684\u90A3\u51E0\u4E2A\uFF09\u2014\u2014\u53EA\u6709\u5B83\u9700\u8981\u6697\u8272\u8986\u76D6 */
  --dshpc-solid:var(--dsw-static-neutral-00,#fff);
  --dshpc-on-solid:var(--dsw-alias-label-primary,#1f2328);
  /* \u4EA4\u4ED8\u6587\u4EF6\u5361\u90A3\u79CD\u300C\u6D45\u5E95\u76D8 + hover \u52A0\u6DF1\u300D\u4E24\u62CD */
  --dshpc-plate:var(--dsw-static-neutral-50,#fafafa);
  --dshpc-plate-hover:var(--dsw-static-neutral-100,#f5f5f5);
  /* \u26A0\uFE0F \u8FD9\u4E9B**\u56FA\u5B9A\u4E2D\u6027\u9762\u4E00\u5F8B\u7528 rgba \u5B57\u9762\u91CF**\uFF082026-10-19 \u771F\u673A\u6559\u8BAD\uFF09\uFF1A\u4E0D\u8981\u5199\u6210
     \u300Crgba \u56DE\u9000\u884C + \u5D4C --dsw-static-* \u7684 color-mix \u884C\u300D\u4E24\u6761\u540C\u540D\u58F0\u660E\u2014\u2014\u81EA\u5B9A\u4E49\u5C5E\u6027**\u540E\u8005\u6052\u80DC**\uFF0C
     \u54EA\u6015\u5B83\u7684\u503C\u5728\u5BBF\u4E3B\u91CC\u7B97\u4E0D\u51FA\u6765\uFF08static \u53D8\u91CF invalid\uFF09\u21D2 \u6574\u6761 token \u4F5C\u5E9F\u3001rgba \u515C\u5E95\u4E00\u8D77\u88AB\u5E9F\uFF0C
     0.2.6 \u91CC Segmented \u8F68\u9053\u5168\u900F\u660E\u5C31\u662F\u8FD9\u4E48\u6765\u7684\u3002\u8981\u8DDF\u5BBF\u4E3B\u4E3B\u9898\u8054\u52A8\u7684\u9762\u7528 alias token\uFF08\u90A3\u4E9B\u5B9E\u6D4B\u6709\u6548\uFF09\u3002 */
  --dshpc-icon-plate:rgba(255,255,255,.5);
  /* \u8868\u5934\u5E95\uFF1A\u6D45\u8272\u4E3B\u9898**\u504F\u6DF1**\uFF0C\u4E14\u5FC5\u987B**\u6BD4\u6591\u9A6C\u7EB9\uFF08--dshpc-plate\uFF09\u518D\u6DF1\u4E00\u6863**\u2014\u2014
     \u4E24\u8005\u4E0D\u80FD\u649E\u8272\uFF08\u7528\u6237 2026-10-02\uFF1A\u8868\u5934\u8DDF\u6591\u9A6C\u7EB9\u4E00\u6A21\u4E00\u6837\uFF09\u3002 */
  --dshpc-head-bg:var(--dsw-static-neutral-100,#f5f5f5);
  /* \u56FE\u6807\u5C0F\u5E95\u677F\uFF08\u4EA7\u51FA\u7269\uFF09\uFF1A\u6D45\u8272\u4E0B\u8981**\u770B\u5F97\u89C1**\uFF08\u539F\u5148\u53D6 plate \u21D2 \u5728\u767D\u5E95\u4E0A\u7B49\u4E8E\u6CA1\u6709\uFF09\uFF1Bhover \u52A0\u500D\u3002 */
  --dshpc-chip-bg:rgba(15,15,15,.07);
  --dshpc-chip-bg-hover:rgba(15,15,15,.14);
  /* \u5C55\u5F00\u884C\uFF1A**\u5E26\u900F\u660E\u5EA6\u7684\u84DD**\u2014\u2014\u4E0D\u662F\u7070\u3001\u4E5F\u4E0D\u662F\u7EAF\u8272\uFF0C\u900F\u51FA\u5361\u7247\u5E95\u8272\uFF0C\u4E00\u773C\u770B\u51FA\u300C\u8FD9\u662F\u5C55\u5F00\u7684\u300D
     \uFF08\u7528\u6237 2026-10-02\uFF1A\u7070\u8272\u8DDF\u6591\u9A6C\u7EB9\u5206\u4E0D\u51FA\u6765\uFF09\u3002\u5185\u5BB9\u533A\u518D\u6DE1\u4E00\u6863\uFF0C\u5F62\u6210\u300C\u884C\u6DF1 / \u5185\u5BB9\u6D45\u300D\u7684\u533A\u9694\u3002 */
  --dshpc-open-bg:rgba(37,99,235,.10);
  --dshpc-open-bg-soft:rgba(37,99,235,.05);
  --dshpc-card-hover:rgba(37,99,235,.07);

  /* \u2500\u2500 \u63CF\u8FB9\u56DB\u6863\uFF08\u5BBF\u4E3B\u771F\u503C\uFF1Al1 4% / l2 10% / l3 12% / l4 16%\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  --dshpc-border-faint:var(--dsw-alias-border-l1,#0000000a);
  --dshpc-border:var(--dsw-alias-border-l2,#0000001a);
  --dshpc-border-strong:var(--dsw-alias-border-l3,#0000001f);
  --dshpc-border-heavy:var(--dsw-alias-border-l4,#00000029);

  /* \u2500\u2500 \u54C1\u724C / \u8BED\u4E49\u8272 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  /* \u54C1\u724C\u300C\u9762\u300D\u8272\uFF1A\u660E\u8272\u8FD1\u9ED1\u3001\u6697\u8272\u8FD1\u767D\uFF08\u5B98\u65B9 Switch \u9009\u4E2D\u6001\u5373\u6B64\uFF09\uFF0C**\u4E0D\u662F\u84DD\u8272** */
  --dshpc-accent:var(--dsw-alias-brand-primary,#0f1115);
  /* \u84DD\u8272\uFF1A\u5F3A\u8C03 / \u9009\u4E2D / \u7126\u70B9\uFF0C\u4E00\u5F8B\u8D70\u8FD9\u6761 */
  --dshpc-business:var(--dsw-alias-state-business-primary,#3b5bdb);
  --dshpc-success:var(--dsw-alias-state-success-primary,#22c55e);
  /* \u26A0\uFE0F \u662F state-warn\uFF08\u4E0D\u662F state-warning\uFF0C\u540E\u8005\u5BBF\u4E3B\u65E0\u6B64\u5B9A\u4E49\uFF09 */
  --dshpc-warning:var(--dsw-alias-state-warn-primary,#f59e0b);
  --dshpc-danger:var(--dsw-alias-state-error-primary,#ec1313);
  --dshpc-link:var(--dsw-alias-link,#3b5bdb);
  /* \u8BED\u4E49\u8272**\u5B9E\u9762**\u4E0A\u7684\u5B57\uFF08\u89D2\u6807 / \u5B9E\u5FC3\u63D0\u793A\uFF09\uFF1A\u5BBF\u4E3B\u7EA2\u7EFF\u9EC4\u4E09\u8272\u90FD\u662F\u4E2D\u8C03 \u21D2 \u767D\u5B57\u4E24\u4E2A\u4E3B\u9898\u90FD\u53EF\u8BFB\uFF0C
     \u6545\u8FD9\u662F\u4E00\u6761\u4E0E\u4E3B\u9898\u65E0\u5173\u7684\u5E38\u91CF\uFF1B\u4E0D\u8981\u62FF --dshpc-fg-inverse \u9876\u2014\u2014\u5B83\u5728\u6697\u8272\u4E0B\u662F\u8FD1\u9ED1\uFF0C\u538B\u5728\u7EA2\u5E95\u4E0A\u770B\u4E0D\u6E05\u3002 */
  --dshpc-on-signal:#fff;
  /* \u9EC4\u5E95\u4E0A\u7684\u5B57\uFF1A\u9EC4\u8272\u662F\u4E2D\u9AD8\u660E\u5EA6\uFF0C\u767D\u5B57\u770B\u4E0D\u6E05 \u21D2 \u56FA\u5B9A\u6DF1\u8272\uFF08\u4E0E\u4E3B\u9898\u65E0\u5173\uFF09\u3002 */
  --dshpc-on-warning:#1f2328;

  /* \u2500\u2500 \u5B9E\u5FC3\u6309\u94AE\u7684 hover / active \u6D3E\u751F\u6001\uFF082026-10-19 \u7528\u6237\u70B9\u540D\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
     \u539F\u5B9E\u73B0\u662F :hover \u76F4\u63A5\u538B opacity .9\uFF1A\u9ED1\u5E95\u538B 10% \u51E0\u4E4E\u770B\u4E0D\u51FA\u6765\uFF0C\u7528\u6237\u539F\u8BDD\u300C\u5B8C\u5168\u611F\u89C9\u4E0D\u5230\u989C\u8272\u53D8\u4E86\u300D\u3002
     \u21D2 \u6539\u6210\u5BF9\u5E95\u8272\u505A**\u660E\u786E\u7684\u6DF7\u8272**\uFF08\u538B 22% / 34%\uFF09\uFF0C\u4E0D\u7528 opacity\uFF1A
       \xB7 \u4EAE\u8272\u4E3B\u9898\uFF1A\u9ED1\u5E95\uFF08--dshpc-accent\uFF09\u63BA\u767D\u63D0\u4EAE\uFF1B\u7EA2 / \u7EFF / \u9EC4 / \u84DD\u5E95\u63BA\u9ED1\u538B\u6DF1\uFF1B
       \xB7 \u6697\u8272\u4E3B\u9898\uFF1A\u53CD\u8FC7\u6765\uFF08\u6697\u5E95\u63BA\u767D\u3001\u4EAE\u5E95\u63BA\u9ED1\uFF09\u3002
     \u6DF7\u8272\u5BF9\u8C61\u662F**\u56FA\u5B9A\u4E2D\u6027\u8272\u5B57\u9762\u91CF**\uFF08#fff / #000\uFF09\uFF0C\u4E0D\u4F9D\u8D56\u5BBF\u4E3B static-neutral \u662F\u5426\u5B58\u5728\uFF1B
     \u65E7\u5185\u6838\u4E0D\u8BA4 color-mix \u65F6\u6574\u6761\u58F0\u660E\u4F5C\u5E9F \u21D2 \u56DE\u843D\u5404\u6863\u539F\u8272\uFF08\u53EF\u63A5\u53D7\uFF1A\u4ECD\u53EF\u70B9\uFF0C\u53EA\u662F\u6CA1\u6709 hover \u53CD\u9988\uFF09\u3002 */
  --dshpc-accent-hover:color-mix(in srgb,var(--dshpc-accent) 78%,#ffffff);
  --dshpc-accent-active:color-mix(in srgb,var(--dshpc-accent) 64%,#ffffff);
  --dshpc-danger-hover:color-mix(in srgb,var(--dshpc-danger) 78%,#000000);
  --dshpc-danger-active:color-mix(in srgb,var(--dshpc-danger) 64%,#000000);
  --dshpc-success-hover:color-mix(in srgb,var(--dshpc-success) 78%,#000000);
  --dshpc-success-active:color-mix(in srgb,var(--dshpc-success) 64%,#000000);
  --dshpc-warning-hover:color-mix(in srgb,var(--dshpc-warning) 78%,#000000);
  --dshpc-warning-active:color-mix(in srgb,var(--dshpc-warning) 64%,#000000);
  --dshpc-business-hover:color-mix(in srgb,var(--dshpc-business) 78%,#000000);
  --dshpc-business-active:color-mix(in srgb,var(--dshpc-business) 64%,#000000);
  /* \u8BED\u4E49\u8272**\u6D45\u5E95**\uFF1A\u72B6\u6001\u8272\u7CFB\u7684\u300C\u4E00\u5757\u5E95\u8272\u300D\u2014\u2014\u6267\u884C\u8BB0\u5F55\u9875\u6BCF\u6761\u6D41\u6C34\u8D26\u7684\u5757\u5E95\u5C31\u662F\u5B83
     \uFF08\u7528\u6237 2026-10-04\uFF1A\u6B63\u5E38\u6001\u7ED9\u540C\u8272\u7CFB\u5F88\u6D45\u7684\u900F\u660E\u5E95\u3001\u5931\u8D25\u7528\u7EA2\u5E95\u900F\u51FA\u6765\uFF09\u3002
     \u7528 \u300Ccolor-mix\u300D \u73B0\u7B97\u800C\u4E0D\u5199\u6B7B rgba\uFF1A\u72B6\u6001\u8272\u672C\u8EAB\u8DDF\u968F\u5BBF\u4E3B alias\uFF0C\u4E3B\u9898\u4E00\u6362\u81EA\u52A8\u6210\u7ACB\u3002
     \u26A0\uFE0F **\u6DF1\u8272\u4E0B\u8981\u66F4\u6DE1**\uFF1A\u7528\u6237 2026-10-04\u300C\u6DF1\u8272\u98CE\u683C\u7684\u7EFF\u8272\u548C\u7EA2\u8272\u597D\u50CF\u90FD\u6709\u70B9\u6DF1\u300D\u21D2 dark \u6BB5
     \u628A\u8FD9\u56DB\u6761\u538B\u5230 5%\uFF08\u66F4\u8D34\u8FD1\u9762\u677F\u5E95\u3001\u5B58\u5728\u611F\u66F4\u5F31\uFF09\uFF1B\u6D45\u8272\u6BB5\u7EF4\u6301 8%\u3002\u4E24\u7AEF\u5404\u81EA\u7ED9\u503C\uFF0C\u4E0D\u5171\u7528\u4E00\u6761\u66F2\u7EBF\u3002
     \u547D\u540D\u6536\u5728 tokens.ts \u5355\u70B9\uFF08\u672C\u4ED3\u786C\u89C4\u77E9\uFF1A\u4E1A\u52A1\u6587\u4EF6\u4E0D\u8BB8\u81EA\u9020 --dshpc-*\uFF09\u3002 */
  --dshpc-success-soft:color-mix(in srgb,var(--dshpc-success) 8%,transparent);
  --dshpc-warning-soft:color-mix(in srgb,var(--dshpc-warning) 8%,transparent);
  --dshpc-danger-soft:color-mix(in srgb,var(--dshpc-danger) 8%,transparent);
  --dshpc-business-soft:color-mix(in srgb,var(--dshpc-business) 8%,transparent);

  /* \u26A0\uFE0F 2026-10-18 \u7528\u6237\u62CD\u677F\uFF1A\u5BBF\u4E3B alias \u7684 hover\uFF08\u6697\u8272\u767D 8% / \u4EAE\u8272 6%\uFF09**\u592A\u5F31**\uFF0C
     \u300C\u79FB\u4E0A\u53BB\u8981\u4ED4\u7EC6\u770B\u624D\u770B\u5F97\u51FA\u6765\u300D\u21D2 \u4E0D\u518D\u59D4\u6258\u5BBF\u4E3B hover \u522B\u540D\uFF0C\u6539\u4E3A\u81EA\u63BA\u4E2D\u6027\u8272\u5E76\u52A0\u91CD\uFF1A
     \u4EAE\u8272\u63BA\u9ED1 10%\u3001\u6697\u8272\u63BA\u767D 14%\uFF08active \u518D\u52A0\u4E00\u6863\uFF09\u3002\u6309\u94AE / \u5206\u6BB5\u8F68\u9053 / \u5404\u7C7B hover \u5E95\u540C\u65F6\u53D7\u76CA\u3002
     \u26A0\uFE0F \u5FC5\u987B\u4FDD\u7559 rgba \u515C\u5E95\u884C\u5728\u524D\uFF08\u672C\u6587\u4EF6\u60EF\u4F8B\uFF0C\u89C1 icon-plate \u6CE8\u91CA\uFF09\uFF1A\u63BA\u7684\u662F**\u56FA\u5B9A\u4E2D\u6027\u8272**
     \uFF08neutral-900=#0f0f0f / neutral-00=#fff\uFF09\uFF0C\u9884\u8BA1\u7B97\u65E0\u635F\uFF1B\u65E7\u5185\u6838\u4E0D\u8BA4 color-mix \u65F6\u8D70\u515C\u5E95\uFF0C
     \u5426\u5219\u6574\u6761 background:var(--seg-track) \u4F5C\u5E9F \u21D2 \u5206\u6BB5\u8F68\u9053\u900F\u660E\uFF08\u771F\u8E29\u8FC7\uFF1A\u9884\u89C8\u7AD9\u8F68\u9053\u6D88\u5931\uFF09\u3002 */
  --dshpc-hover:rgba(15,15,15,.10);
  --dshpc-active:rgba(15,15,15,.18);
  /* \u5206\u6BB5\u63A7\u4EF6\u8F68\u9053\u5E95\uFF1A\u4E13\u7528 token\uFF08rgba \u5B57\u9762\u91CF\u3001\u4E0D\u501F --dshpc-hover \u4E2D\u8F6C\uFF09\u2014\u2014
     2026-10-19 \u6559\u8BAD\uFF1A\u53D8\u91CF\u94FE\u4E2D\u95F4\u4EFB\u4F55\u4E00\u73AF invalid \u21D2 background \u6574\u6761\u4F5C\u5E9F\u3001\u8F68\u9053\u5168\u900F\u660E\u3002
     \u4EAE\u8272\uFF1A\u9ED1 7%\uFF08\u6BD4 hover \u7684 10% \u6DE1\u4E00\u6863\uFF0C\u9009\u4E2D\u767D\u7247\u624D\u8DF3\u5F97\u51FA\uFF09\u3002 */
  --dshpc-seg-track:rgba(15,15,15,.07);
  --dshpc-mask:var(--dsw-alias-bg-mask-1,#0000003d);
  /* \u300C\u9009\u4E2D\u9762\u300D\uFF082026-10-06\uFF0C\u4EFB\u52A1\u65E5\u7A0B\u9875\u9996\u521B\uFF09= \u5F53\u524D\u5E95\u8272**\u671D\u66F4\u6DF1\u63BA 12% \u6587\u5B57\u8272**\uFF1A
     \u6D45\u8272\u4E3B\u9898\u4E0B\u6587\u5B57\u8272\u662F\u9ED1 \u21D2 \u9009\u4E2D\u9762\u6BD4\u5E38\u6001\u5E95\u8272**\u6DF1\u4E00\u6863**\u3002\u6DF1\u8272\u5206\u652F\u89C1 body[data-ds-dark-theme]\uFF08\u671D\u80CC\u666F\u8272\u63BA\uFF09\u3002
     \u8BED\u4E49\uFF1A\u6807\u8BB0\u300C\u6B63\u5728\u770B\u7684\u4E1C\u897F\u300D\uFF0C\u6BD4\u5E38\u6001\u660E\u663E\u3001\u53C8\u4E0D\u8BB8\u76D6\u4F4F\u5185\u5BB9\uFF08\u4E0D\u8BB8\u7528\u534A\u900F\u660E\u53E0\u72B6\u6001\u8272\uFF09\u3002 */
  --dshpc-selected-bg:color-mix(in srgb,var(--dshpc-surface-1) 88%,var(--dshpc-fg));
  /* \u4EFB\u52A1\u65E5\u7A0B\u9875\u672C\u6708\u683C\u9ED8\u8BA4\u5E95\uFF082026-10-06 \u2192 \u7EED2\uFF09\uFF1A\u6D45\u8272\u4E0B\u7ED9**\u6DE1\u84DD**\uFF08business 8% \u900F\u767D\u5E95\uFF09\u2014\u2014
     \u53C2\u7167\u7528\u6237\u53C2\u8003\u7A3F\u91CC\u672A\u9009\u4E2D\u65E5\u7A0B\u5757 / Tuesday \u5217\u7684\u90A3\u79CD\u84DD\u3001\u518D\u6D45\u4E00\u70B9\u70B9\uFF1B
     \u76F8\u90BB\u6708\u8865\u4F4D\u683C\u4ECD\u8D70 --dshpc-surface-2\uFF08\u66F4\u7070\uFF09\uFF0C\u4E0D\u53D7\u5F71\u54CD\u3002
     \u6DF1\u8272\u6BB5\u7EF4\u6301 #23262e\uFF08\u7528\u6237\uFF1A\u6DF1\u8272 UI \u5DF2\u5DEE\u4E0D\u591A\uFF0C\u4E0D\u52A8\uFF09\u3002 */
  --dshpc-cal-cell-bg:color-mix(in srgb,var(--dshpc-business) 8%,var(--dshpc-surface-1));
  /* \u4EFB\u52A1\u65E5\u7A0B\u9875\u300C\u70B9\u5F00\u67D0\u5929\u300D\u5C55\u5F00\u7684\u9762\u677F\u5E95\uFF082026-10-06 \u7EED\uFF09\uFF1A\u6D45\u8272\u4E0B**\u65E0\u9650\u63A5\u8FD1\u767D\u3001\u53EA\u5E26\u4E00\u4E01\u70B9\u7070**
     \uFF08neutral-50 = #fafafa\uFF09\u2014\u2014\u9762\u677F\u91CC\u88C5\u534A\u900F\u660E\u6267\u884C\u8BB0\u5F55\u5217\u8868\uFF0C\u5E95\u518D\u6DF1\u6574\u7247\u5C31\u53D1\u7CCA\u53D1\u7070\uFF1B
     \u6DF1\u8272\u6BB5\u6CBF\u7528\u539F selected-bg \u6697\u503C\uFF0C\u4FDD\u6301\u4E0D\u52A8\u3002 */
  --dshpc-cal-panel-bg:var(--dsw-static-neutral-50,#fafafa);
  /* \u4EFB\u52A1\u65E5\u7A0B\u9875\u672C\u6708\u683C hover \u5E95\uFF08\u6D45\u8272\u6BB5\uFF0C2026-10-06 \u7EED3\uFF09\uFF1A\u4E0D\u518D\u8D70\u7070\u8272\u901A\u7528\u4EA4\u4E92\u5E95\u2014\u2014
     \u9F20\u6807\u79FB\u4E0A\u53BB\u5E94\u662F\u300C\u66F4\u4EAE\u4E00\u70B9\u70B9\u7684\u84DD\u300D\uFF08\u4E0E\u6DF1\u8272\u6BB5\u540C\u8BED\u4E49\uFF1Ahover = \u63D0\u4EAE\u7684\u84DD\uFF0C\u4E0D\u662F\u7070\u4E0B\u53BB\uFF09\u3002
     \u6D53\u5EA6**\u4ECB\u4E8E**\u8868\u5934\u84DD\uFF0814%\uFF09\u4E0E\u672A\u9009\u4E2D\u683C\u84DD\uFF088%\uFF09\u4E4B\u95F4\u3001\u7565\u504F\u8868\u5934\u4E00\u4FA7\uFF1Abusiness 12% \u900F\u767D\u5E95
     \uFF08\u6BD4\u8868\u5934\u6D45\u4E00\u70B9\u3001\u6BD4\u672A\u9009\u4E2D\u683C\u6DF1\u4E00\u70B9\uFF09\u3002 */
  --dshpc-cal-cell-hover:color-mix(in srgb,var(--dshpc-business) 12%,var(--dshpc-surface-1));

  /* \u2500\u2500 \u6295\u5F71 / \u7126\u70B9 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  --dshpc-shadow-1:var(--dsw-elevation-soft,0 4px 16px 0 #00000008);
  /* \u4EAE\u7247\u81EA\u5E26\u7684\u6D6E\u8D77\u611F\uFF08\u9009\u4E2D\u6001\u7528\uFF1B\u4E0E --dshpc-surface-raised \u914D\u5BF9\uFF09 */
  --dshpc-shadow-raised:var(--dsw-elevation-soft,0 4px 16px 0 #00000008);
  --dshpc-shadow-2:var(--dsw-shadow-lv3,0 12px 32px 0 #00000014);
  /* \u952E\u76D8\u7126\u70B9\u73AF\u3002\u26A0\uFE0F \u4E0D\u7528\u5BBF\u4E3B --dsw-focus-ring-color\uFF1A\u5B83\u9ED8\u8BA4\u503C\u662F transparent\uFF08\u515C\u5E95\u4E0D\u751F\u6548\u3001\u4F1A\u9690\u8EAB\uFF09 */
  --dshpc-focus:var(--dsw-alias-state-business-primary,#3b5bdb);

  /* \u2500\u2500 \u5706\u89D2\uFF08\u5BBF\u4E3B\u771F\u503C 4 / 8 / 12 / 16 / 20 / 28\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  --dshpc-radius-xs:var(--dsw-radius-xs,4px);
  --dshpc-radius-sm:var(--dsw-radius-sm,8px);
  --dshpc-radius-md:var(--dsw-radius-md,12px);
  --dshpc-radius-lg:var(--dsw-radius-lg,16px);
  --dshpc-radius-xl:var(--dsw-radius-xl,20px);
  --dshpc-radius-panel:var(--dsw-radius-panel,28px);
  /* \u5168\u5706\uFF08\u80F6\u56CA\u6807\u7B7E\uFF09\uFF1A\u5BBF\u4E3B\u7684 radius \u6863\u6700\u5927\u53EA\u6709 28px\uFF0C\u6491\u4E0D\u6EE1 24px \u9AD8\u7684 chip */
  --dshpc-radius-pill:999px;

  /* \u2500\u2500 \u95F4\u8DDD\u56DB\u62CD\uFF08\u53EA\u8BB8\u7528\u8FD9\u56DB\u6863\uFF0C\u4E0D\u8BB8\u51FA\u73B0 5 / 7 / 9px\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  --dshpc-space-1:4px;
  --dshpc-space-2:8px;
  --dshpc-space-3:12px;
  --dshpc-space-4:16px;

  /* \u2500\u2500 \u63A7\u4EF6\u9AD8\u5EA6\uFF1A\u79BB\u6563\u4E09\u6863\uFF08\u63A7\u4EF6\u7528 size="sm|md|lg" \u9009\uFF1B\u8C03\u7528\u70B9\u4E0D\u8BB8\u81EA\u5B9A\u4E49\u9AD8\u5EA6\uFF0C
       \u771F\u4E0D\u591F\u7528\u624D\u5141\u8BB8\u5728\u8C03\u7528\u70B9\u672C\u5730\u8986\u76D6 --dshpc-control-h-*\uFF0C\u5C5E\u4F8B\u5916\u800C\u975E\u5E38\u6001\uFF09\u2500\u2500 */
  --dshpc-control-h-sm:24px;
  --dshpc-control-h-md:28px;
  --dshpc-control-h-lg:32px;

  /* \u2500\u2500 \u5B57\u53F7 / \u884C\u9AD8\uFF1A\u76F4\u7ED1\u5BBF\u4E3B\u5B57\u53F7\u65CF\uFF08\u5BBF\u4E3B\u771F\u503C 11 / 12 / 13 / 14 / 16\uFF09\u2500\u2500\u2500\u2500\u2500 */
  --dshpc-font-xs:var(--dsw-font-xxxs-11-font-size,11px);
  --dshpc-font-sm:var(--dsw-font-xxs-12-font-size,12px);
  --dshpc-font-md:var(--dsw-font-xs-13-font-size,13px);
  --dshpc-font-lg:var(--dsw-font-s-14-font-size,14px);
  --dshpc-font-xl:var(--dsw-font-base-16-font-size,16px);
  --dshpc-line-xs:var(--dsw-font-xxxs-11-line-height,14px);
  --dshpc-line-sm:var(--dsw-font-xxs-12-line-height,18px);
  --dshpc-line-md:var(--dsw-font-xs-13-line-height,20px);
  --dshpc-line-lg:var(--dsw-font-s-14-line-height,22px);
  --dshpc-line-xl:var(--dsw-font-base-16-line-height,24px);
  --dshpc-font-mono:var(--ds-font-family-code,monospace);

  /* \u2500\u2500 \u5C42\u7EA7\u9636\u68AF\uFF08\u4E1A\u52A1\u6587\u4EF6\u4E0D\u8BB8\u518D\u5199\u88F8 z-index\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  /* \u9875\u9762\u7EA7\u9884\u89C8\u5206\u680F \u2192 \u62BD\u5C49\uFF08\u65B0\u5EFA/\u7F16\u8F91\uFF09\u2192 \u5F39\u7A97/\u786E\u8BA4\u6846 \u2192 \u6D6E\u5C42\u83DC\u5355 \u2192 \u6D6E\u5C42\u63D0\u793A */
  /* \u5185\u5BB9\u5C42\u5438\u9876\uFF08\u5929\u6807\u7B7E / \u8868\u5934\u8FD9\u7C7B\u300C\u8DDF\u7740\u6EDA\u4F46\u538B\u4F4F\u540C\u5C42\u5185\u5BB9\u300D\u7684\u5143\u7D20\uFF09\uFF1A\u53EA\u538B\u540C\u5C42\u5144\u5F1F\uFF0C
     \u5FC5\u987B\u4F4E\u4E8E\u4E0B\u9762\u6240\u6709\u6D6E\u5C42\u6863 \u2014\u2014 \u6240\u4EE5\u5B83\u4E0D\u662F\u300C\u5F00\u65B0\u6D6E\u5C42\u6863\u300D\uFF0C\u800C\u662F\u5185\u5BB9\u5C42\u5185\u90E8\u7684\u6392\u5E8F\u4F4D\u3002 */
  --dshpc-z-sticky:10;
  --dshpc-z-dock:1030;
  --dshpc-z-drawer:1040;
  --dshpc-z-modal:1070;
  --dshpc-z-menu:1100;
  --dshpc-z-tip:1200;

  /* \u2500\u2500 \u52A8\u6548 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  --dshpc-dur:var(--ds-transition-duration,.2s);
  --dshpc-dur-fast:var(--ds-transition-duration-fast,.12s);
  --dshpc-ease:var(--ds-ease-in-out,cubic-bezier(.4,0,.2,1));
  /* \u8FD0\u884C\u4E2D\u72B6\u6001\u7684\u8109\u52A8\u65F6\u957F\uFF082026-10-06 \u7EDF\u4E00\u524D\u540E\u4E24\u7AEF\uFF1A\u4EFB\u52A1\u914D\u7F6E\u91CC\u7684\u7EFF\u547C\u5438 \u2192 \u84DD\u3001\u653E\u6162\uFF1B
     \u6267\u884C\u8BB0\u5F55\u91CC\u7684\u84DD\u95EA \u2192 \u653E\u6162\u4E00\u70B9\u3002\u4E24\u8005\u7528\u540C\u4E00\u4E2A\u503C\uFF0C\u52A8\u753B\u5F62\u72B6\u672C\u5C31\u4E00\u81F4\uFF09\u3002 */
  --dshpc-dur-run:500ms;
}

/* \u2500\u2500 \u660E\u6697\u5DEE\u5F02\u7684**\u552F\u4E00**\u843D\u70B9 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   \u5224\u636E = body[data-ds-dark-theme]\uFF08\u5BBF\u4E3B 0.2.0-rc.2 \u6E90\u7801\u6838\u5B9E\uFF1A\u542F\u52A8\u811A\u672C toggleAttribute \u5199\u5165\uFF0C
   \u552F\u4E00\u660E\u6697\u5224\u636E\uFF1B\u63D2\u4EF6\u7981\u6B62\u7528 prefers-color-scheme \u2014\u2014 \u5B83\u8DDF\u7684\u662F\u7CFB\u7EDF\u3001\u4E0D\u662F\u7528\u6237\u5728\u5BBF\u4E3B\u91CC\u7684\u9009\u62E9\uFF09\u3002
   \u4E0B\u9762\u53EA\u653E alias \u8868\u8FBE\u4E0D\u4E86\u7684\u300C\u56FA\u5B9A\u4E2D\u6027\u9762\u300D\uFF1B\u989C\u8272\u82E5\u80FD\u9760 alias \u81EA\u52A8\u8DDF\u968F\uFF0C\u4E00\u5F8B\u4E0D\u8981\u5199\u5728\u8FD9\u91CC\u3002 */
body[data-ds-dark-theme]{
  --dshpc-solid:var(--dsw-static-neutral-900,#0f0f0f);
  --dshpc-on-solid:var(--dsw-static-neutral-00,#fff);
  /* \u5B9E\u5FC3\u6309\u94AE hover / active\uFF08\u6697\u8272\u7248\uFF09\uFF1A\u9ED1\u5E95\uFF08\u6D45\u8272\u4E3B\u9898\u7684\u8FD1\u9ED1 \u2192 \u6697\u8272\u4E0B\u7684\u8FD1\u767D\uFF09\u63BA\u9ED1\u538B\u6DF1\uFF1B
     \u7EA2 / \u7EFF / \u9EC4 / \u84DD\u63BA\u767D\u63D0\u4EAE\u3002\u4E0E\u4EAE\u8272\u6BB5\u65B9\u5411\u76F8\u53CD\uFF0C\u4FDD\u8BC1\u4E24\u79CD\u4E3B\u9898\u4E0B\u300C\u4E00\u773C\u770B\u51FA\u53D8\u4E86\u300D\u3002 */
  --dshpc-accent-hover:color-mix(in srgb,var(--dshpc-accent) 80%,#000000);
  --dshpc-accent-active:color-mix(in srgb,var(--dshpc-accent) 66%,#000000);
  --dshpc-danger-hover:color-mix(in srgb,var(--dshpc-danger) 78%,#ffffff);
  --dshpc-danger-active:color-mix(in srgb,var(--dshpc-danger) 64%,#ffffff);
  --dshpc-success-hover:color-mix(in srgb,var(--dshpc-success) 78%,#ffffff);
  --dshpc-success-active:color-mix(in srgb,var(--dshpc-success) 64%,#ffffff);
  --dshpc-warning-hover:color-mix(in srgb,var(--dshpc-warning) 78%,#ffffff);
  --dshpc-warning-active:color-mix(in srgb,var(--dshpc-warning) 64%,#ffffff);
  --dshpc-business-hover:color-mix(in srgb,var(--dshpc-business) 78%,#ffffff);
  --dshpc-business-active:color-mix(in srgb,var(--dshpc-business) 64%,#ffffff);
  /* \u6697\u8272 hover \u63BA\u767D 14% / active 24%\uFF08\u5BF9\u9F50\u4E0A\u9762 2026-10-18 \u7684\u52A0\u91CD\u62CD\u677F\uFF09\u3002rgba \u515C\u5E95\u884C\u540C\u4E0A\u3002 */
  --dshpc-hover:rgba(255,255,255,.14);
  --dshpc-active:rgba(255,255,255,.24);
  /* \u5206\u6BB5\u8F68\u9053\uFF08\u6697\u8272\u7248\uFF09\uFF1A\u767D 10%\u2014\u2014\u6BD4 hover \u6DE1\u4E00\u6863\uFF0C\u9009\u4E2D\u4EAE\u7247\u624D\u8DF3\u5F97\u51FA\u3002 */
  --dshpc-seg-track:rgba(255,255,255,.10);
  --dshpc-plate:var(--dsw-static-neutral-850,#212123);
  --dshpc-plate-hover:var(--dsw-static-neutral-800,#292929);
  --dshpc-icon-plate:rgba(255,255,255,.05);
  /* \u6697\u8272\u4E3B\u9898**\u53CD\u8FC7\u6765**\uFF1A\u8868\u5934\u8981\u6BD4\u5361\u7247\u9762**\u4EAE**\u3001\u6BD4\u6591\u9A6C\u7EB9\u518D**\u6D45\u4E00\u6863**\uFF08\u7528\u6237\uFF1A\u7EAF\u9ED1\u80CC\u666F\u6CA1\u6CD5\u770B\uFF09\u3002 */
  --dshpc-head-bg:var(--dshpc-surface-2);
  /* \u6697\u8272\u5E95\u677F**\u5FAE\u4EAE**\uFF1Bhover **\u66F4\u4EAE**\uFF08\u539F\u5148 hover \u53D6 plate-hover \u53CD\u800C\u66F4\u6DE1 \u21D2 \u9F20\u6807\u79FB\u4E0A\u53BB\u5C31\u6CA1\u4E86\uFF09\u3002 */
  --dshpc-chip-bg:rgba(255,255,255,.08);
  --dshpc-chip-bg-hover:rgba(255,255,255,.16);
  /* \u6697\u8272\u4E0B\u84DD\u8272\u8981\u66F4\u4EAE\u3001\u900F\u660E\u5EA6\u7565\u9AD8\u624D\u538B\u5F97\u4F4F\u6DF1\u5E95\u3002 */
  --dshpc-open-bg:rgba(96,165,250,.18);
  --dshpc-open-bg-soft:rgba(96,165,250,.08);
  --dshpc-card-hover:rgba(96,165,250,.13);
  /* \u8BED\u4E49\u8272**\u6D45\u5E95**\uFF08\u6DF1\u8272\u7248\uFF09\uFF1A\u7528\u6237\u5ACC\u6DF1\u8272\u7684\u7EFF / \u7EA2\u300C\u6709\u70B9\u6DF1\u300D\u21D2 \u538B\u5230 **5%**\uFF08\u6D45\u8272\u6BB5\u662F 8%\uFF09\uFF0C
     \u66F4\u8D34\u8FD1\u9762\u677F\u5E95\u8272\u3001\u5B58\u5728\u611F\u66F4\u5F31\uFF1B\u5757\u5E95\u4E0E\u72B6\u6001\u8272\u7AD6\u6761\u4ECD\u540C\u6E90\uFF08\u7AD6\u6761\u662F\u5B9E\u8272\uFF0C\u4E0D\u53D7\u8FD9\u6761\u5F71\u54CD\uFF09\u3002 */
  --dshpc-success-soft:color-mix(in srgb,var(--dshpc-success) 5%,transparent);
  --dshpc-warning-soft:color-mix(in srgb,var(--dshpc-warning) 5%,transparent);
  --dshpc-danger-soft:color-mix(in srgb,var(--dshpc-danger) 5%,transparent);
  --dshpc-business-soft:color-mix(in srgb,var(--dshpc-business) 5%,transparent);
  /* \u300C\u9009\u4E2D\u9762\u300D\uFF08\u6DF1\u8272\u7248\uFF0C2026-10-06\uFF09\uFF1A\u63BA **~40% \u80CC\u666F\u8272**\uFF08--dshpc-surface-base\uFF09\u21D2 \u65E0\u9650\u63A5\u8FD1\u9875\u9762\u80CC\u666F\u7684\u9ED1\u3001
     \u53EA\u6BD4\u80CC\u666F\u7565\u6DF1\u4E00\u70B9\u70B9\uFF08\u7528\u6237\uFF1A\u6DF1\u8272\u4E0B\u5C55\u5F00\u533A\u538B\u7740\u4EFB\u52A1\u900F\u660E\u7EFF\u4F1A\u53D1\u7070\uFF0C\u5E95\u8272\u8981\u5C3D\u91CF\u8D34\u8FD1\u80CC\u666F\u624D\u4E0D\u663E\u7070\uFF09\u3002
     \u26A0\uFE0F \u6DF1\u8272\u4E0B\u4E0D\u80FD\u63BA\u6587\u5B57\u8272 \u2014\u2014 \u90A3\u662F\u767D\uFF0C\u4F1A\u53D8\u4EAE\uFF0C\u9009\u4E2D\u53CD\u800C\u6BD4\u672C\u6708\u65E5\u671F\u6D45\u3002 */
  --dshpc-selected-bg:color-mix(in srgb,var(--dshpc-surface-1) 60%,var(--dshpc-surface-base));
  /* \u4EFB\u52A1\u65E5\u7A0B\u9875\u672C\u6708\u683C\u7684\u9ED8\u8BA4\u5E95\uFF08\u6DF1\u8272\u7248\uFF0C2026-10-06\uFF09\uFF1A\u6DF1\u7684\u3001\u5E26\u70B9\u7070\u84DD\u7684\u6697\u8272\uFF08\u7528\u6237\u7ED9\u7684\u53C2\u8003\u56FE \u2248 #23262e\uFF09\uFF0C
     \u6BD4\u539F\u6765\u7684\u5361\u7247\u9762\u66F4\u6C89\u3001\u66F4\u504F\u84DD\u7070\uFF1B\u9009\u4E2D\u683C\u4ECD\u8D70 --dshpc-selected-bg\uFF08\u66F4\u6697\u4E00\u6863\uFF09\uFF0C\u5C42\u7EA7\u4E0D\u53D8\u3002 */
  --dshpc-cal-cell-bg:#23262e;
  /* \u4EFB\u52A1\u65E5\u7A0B\u9875\u672C\u6708\u683C hover \u5E95\uFF08\u6DF1\u8272\u6BB5\uFF0C2026-10-06\uFF09\uFF1A\u539F\u5148\u8D70 --dshpc-hover\uFF08\u5BBF\u4E3B\u6D45\u8272\u53E0\u52A0\uFF09\u5728\u6DF1\u5E95\u4E0A\u663E\u5F97
     \u300C\u7070\u53D1\u4EAE\u300D\uFF0C\u4E0D\u597D\u770B \u21D2 \u6362\u6210\u66F4\u8D34\u5E95\u7684\u84DD\u8C03\u5FAE\u4EAE\uFF08\u4E0E open-bg-soft \u540C\u65CF\uFF09\uFF0Chover \u65F6\u4E0D\u523A\u773C\u3001\u53C8\u6709\u53CD\u9988\u3002 */
  --dshpc-cal-cell-hover:rgba(96,165,250,.12);
  /* \u4EFB\u52A1\u65E5\u7A0B\u9875\u5C55\u5F00\u9762\u677F\u5E95\uFF08\u6DF1\u8272\u6BB5\uFF0C2026-10-06 \u7EED\uFF09\uFF1A\u4E0E\u539F selected-bg \u6697\u503C\u4E00\u81F4\uFF0C\u6DF1\u8272 UI \u4E0D\u52A8 */
  --dshpc-cal-panel-bg:color-mix(in srgb,var(--dshpc-surface-1) 60%,var(--dshpc-surface-base));
}
\``;

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

// dist/ui/controls-css.js
var SEGMENTED_CSS = ` /* \u2500\u2500 \u5206\u6BB5\u63A7\u4EF6 P2 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 2026-10-19\uFF1A\u6309\u7528\u6237\u70B9\u540D\u300C\u539F\u5C01\u4E0D\u52A8\u7167\u5144\u5F1F\u9879\u76EE dsh-task-dispatch-table \u6284\u300D\u2014\u2014 \u89C4\u5219\u7ED3\u6784\u3001\u5199\u6CD5\u3001transition \u5168\u90E8\u5BF9\u9F50\u5144\u5F1F\u539F\u6587\uFF08\u5355\u884C\u89C4\u5219\u3001item \u65E0\u8FB9\u6846\u3001hover \u53EA\u63D0\u4EAE\u6587\u5B57\uFF09\uFF0C \u53EA\u628A\u524D\u7F00 / \u53D8\u91CF\u540D\u6362\u6210\u672C\u4ED3\u53E3\u5F84\u30020.2.2-0.2.8 \u771F\u673A\u4E0A\u300C\u8F68\u9053\u900F\u660E\u3001gap \u5931\u6548\u300D\u81EA\u67E5\u591A\u8F6E\u65E0\u679C \u21D2 \u4E0D\u518D\u81EA\u521B\u5199\u6CD5\uFF0C\u56DE\u5230\u5144\u5F1F\u540C\u6B3E\u3002 \u7528\u6237\u989D\u5916\u8981\u7684\u4E24\u5904\uFF08\u5144\u5F1F\u6CA1\u6709\uFF0C\u4FDD\u7559\uFF09\uFF1Aweekday \u65B9\u5757\u95F4\u8DDD gap:6px\uFF1B\u6BB5\u5185\u4E2D\u6027\u8BA1\u6570 __count\u3002 */ .dshpc-seg{display:inline-flex;} .dshpc-seg{align-items:center;} .dshpc-seg{gap:2px;} .dshpc-seg{padding:2px;} .dshpc-seg{border-radius:var(--dshpc-radius-md);} .dshpc-seg{background:var(--dshpc-seg-track);} .dshpc-seg--default{--seg-track:var(--dshpc-seg-track);--seg-thumb:var(--dshpc-surface-raised);border:0;padding:2px;background:var(--seg-track);} .dshpc-seg--inset{--seg-track:var(--dshpc-seg-track);--seg-thumb:var(--dshpc-surface-raised);border:0;padding:3px;background:var(--seg-track);} .dshpc-seg__item{appearance:none;display:inline-flex;align-items:center;gap:4px;box-sizing:border-box;height:calc(var(--dshpc-control-h-sm) - 6px);padding:0 12px;border:0;border-radius:var(--dshpc-radius-sm);background:transparent;color:var(--dshpc-fg-2);font-family:inherit;font-size:var(--dshpc-font-xs);font-weight:500;white-space:nowrap;cursor:pointer;flex:none;transition:color var(--dshpc-dur-fast) var(--dshpc-ease),background-color var(--dshpc-dur-fast) var(--dshpc-ease),box-shadow var(--dshpc-dur-fast) var(--dshpc-ease);} .dshpc-seg--md .dshpc-seg__item{height:calc(var(--dshpc-control-h-md) - 6px);} .dshpc-seg--lg .dshpc-seg__item{height:calc(var(--dshpc-control-h-lg) - 6px);} .dshpc-seg__item:hover:not([aria-pressed='true']):not(:disabled){color:var(--dshpc-fg);} .dshpc-seg__item[aria-pressed='true']{background:var(--seg-thumb);box-shadow:var(--dshpc-shadow-raised);color:var(--dshpc-fg);font-weight:600;} .dshpc-seg__item:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:-2px;} .dshpc-seg__item:disabled{cursor:default;opacity:.4;} /* \u6BB5\u5185\u89D2\u6807\uFF08\u5982\u300C\u5F02\u5E38\u300D\u7684\u6570\u91CF\uFF09\uFF1A\u8BED\u4E49\u8272\u5B9E\u9762 + \u53CD\u767D\u5B57\uFF0C0 \u7531\u7EC4\u4EF6\u4FA7\u4E0D\u6E32\u67D3\u3002\u5FC5\u987B\u662F\u6B63\u5706\uFF08\u7528\u6237 2026-10-03\uFF09\u3002 */ .dshpc-seg__badge{display:inline-flex;align-items:center;justify-content:center;flex:none;width:16px;height:16px;padding:0;overflow:hidden;border-radius:50%;background:var(--dshpc-danger);color:var(--dshpc-on-signal);font-size:10px;line-height:16px;font-weight:500;font-variant-numeric:tabular-nums;} /* \u6BB5\u5185\u4E2D\u6027\u8BA1\u6570\uFF08\u5982\u7B5B\u9009\u6761\u300C\u5168\u90E8 11\u300D\uFF09\uFF1A\u7EAF\u6587\u5B57\u3001\u65E0\u5E95\u65E0\u8FB9\uFF08\u5BF9\u9F50 task-ledger .dtl-seg__num \u62CD\u677F\u53E3\u5F84\uFF09\uFF1B0 \u7531\u7EC4\u4EF6\u4FA7\u4E0D\u6E32\u67D3\u3002 */ .dshpc-seg__count{display:inline;flex:none;margin-left:3px;padding:0;border:0;border-radius:0;background:none;color:var(--dshpc-fg-3);font-size:10px;line-height:1;font-weight:400;font-variant-numeric:tabular-nums;} /* block\uFF1A\u6491\u6EE1\u7236\u5BBD\uFF08\u8868\u5355\u884C\u7528\uFF09\uFF0C\u5404\u6BB5\u7B49\u5206 */ .dshpc-seg--block{display:flex;width:100%;} .dshpc-seg--block .dshpc-seg__item{flex:1 1 auto;justify-content:center;} /* weekday\uFF1A\u661F\u671F\u591A\u9009\u65B9\u5757\u3002\u57FA\u7840\u63D2\u4EF6\u7684\u7279\u6B8A\u5316\u5B9A\u5236\uFF08\u7528\u6237 2026-10-01\uFF1A\u539F WeekdayPicker \u5373\u300C\u84DD\u5E95 + \u8FD1\u4F3C\u65B9\u5F62\u300D\uFF09\uFF1A \u6BCF\u683C\u6B63\u65B9\u5F62\uFF08\u5BBD = \u6BB5\u9AD8\uFF09\u3001\u9009\u4E2D\u54C1\u724C\u84DD\u53CD\u767D\u5B57\u3001**\u65E0\u5916\u63CF\u8FB9**\uFF082026-10-18 \u91CD\u7533\uFF09\u3001 \u65B9\u5757\u4E4B\u95F4\u95F4\u8DDD gap:6px\uFF082026-10-18\uFF1A\u4E0D\u518D 2px \u6324\u6210\u4E00\u5768 \u2014\u2014 \u8FD9\u4E00\u6761\u5144\u5F1F\u6CA1\u6709\u3001\u662F\u7528\u6237\u989D\u5916\u8981\u7684\uFF09\u3002 */ .dshpc-seg--weekday{--seg-track:var(--dshpc-seg-track);gap:6px;border:0;padding:3px;background:var(--seg-track);} .dshpc-seg--weekday .dshpc-seg__item{width:calc(var(--dshpc-control-h-lg) - 8px);padding:0;justify-content:center;} .dshpc-seg--weekday .dshpc-seg__item[aria-pressed='true']{background:var(--dshpc-business);color:var(--dshpc-fg-inverse);box-shadow:var(--dshpc-shadow-raised);} @media (prefers-reduced-motion: reduce){.dshpc-seg__item{transition:none;}}
/* \u5B9E\u9A8C\u63A2\u9488\uFF082026-10-19\uFF0C\u5B9A\u4F4D\u540E\u5220\uFF09\uFF1A\u4E0E .dshpc-seg \u57FA\u7840\u89C4\u5219\u9010\u5B57\u540C\u5185\u5BB9\u3001\u53EA\u6362\u7C7B\u540D\u3002
   \u8BCA\u65AD\u91CC\u67E5\u5B83\u6D3B\u4E0D\u6D3B\uFF1A\u6D3B \u21D2 \u89E6\u96F7\u7684\u662F\u300Cdshpc-seg\u300D\u8FD9\u4E2A\u540D\u5B57\u672C\u8EAB\uFF0C\u4E0D\u662F\u5185\u5BB9\u3002 */
.dshpc-segprobe{display:inline-flex;align-items:center;gap:2px;padding:2px;border-radius:var(--dshpc-radius-md);background:var(--dshpc-seg-track);} `;
var BUTTON_CSS = ` /* \u2500\u2500 \u6309\u94AE / \u56FE\u6807\u94AE P2 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 \u4E0E Segmented \u540C\u4E00\u6761\u9AD8\u5EA6\u7EAA\u5F8B\uFF1A--dshpc-control-h-sm(24) / -md(28) / -lg(32)\uFF0C \u6709\u8FB9\u6846\u7684 variant \u7528 1px \u771F\u8FB9\u6846 + \u5185\u90E8 padding \u8865\u56DE\uFF0C**\u6709\u8FB9 / \u65E0\u8FB9\u540C\u9AD8**\u3002 \u4E09\u6761\u53D7\u63A7\u8F74\uFF082026-10-19 \u91CD\u5199\uFF0C\u5BF9\u9F50\u4E3B\u6D41 UI \u6846\u67B6\u7684\u5206\u7C7B\u53E3\u5F84\uFF09\uFF1A \xB7 variant \u2014\u2014 \u5916\u89C2\u6863 = \u5F62\u6001 + \u8BED\u4E49\u8272\uFF0C\u5171 10 \u6863\uFF1A primary / secondary / outline / ghost / danger / success / warning / info / danger-outline\uFF08\u7EA2\u5B57\u63CF\u8FB9\uFF09/ link\uFF08\u884C\u5185\u94FE\u63A5\uFF09 \xB7 size \u2014\u2014 sm / md / lg \xB7 block \u2014\u2014 \u6491\u6EE1\u7236\u5BBD \u6BCF\u4E00\u6863**\u53EA\u586B 5 \u4E2A\u5C40\u90E8\u53D8\u91CF**\uFF08--btn-bg / -fg / -border / -bg-hover / -bg-active\uFF09\uFF0C \u7ED3\u6784\u4E0E\u4EA4\u4E92\u53EA\u6709\u4E0A\u9762\u8FD9\u4E00\u4EFD\uFF1B\u4EFB\u4F55\u6863\u4F4D\u90FD\u4E0D\u8BB8\u518D\u5199\u4E00\u904D display/height/padding\u3002 \u81EA\u5B9A\u4E49\u989C\u8272\uFF08Button \u7684 color \u53C2\u6570\uFF09\u540C\u6837\u53EA\u8986\u76D6\u8FD9 5 \u4E2A\u53D8\u91CF\uFF08token \u8986\u76D6\uFF0C\u4E0D\u662F\u65B0\u76AE\u80A4\uFF09\u3002 \u26A0\uFE0F hover \u4E0D\u518D\u7528 opacity \u538B\u4E00\u5C42\uFF08\u7528\u6237 2026-10-19\uFF1A\u300C\u9ED1\u8272\u548C\u7EA2\u8272\u7684\u6309\u94AE\u79FB\u4E0A\u53BB\u53D8\u5316\u592A\u5C0F\uFF0C \u5B8C\u5168\u611F\u89C9\u4E0D\u5230\u989C\u8272\u53D8\u4E86\u300D\uFF09\u21D2 \u8D70 --dshpc-*-hover / -active \u7684\u660E\u786E\u6DF7\u8272\uFF0C\u89C1 tokens-css.ts\u3002 */ .dshpc-btn{--btn-bg:transparent;--btn-fg:var(--dshpc-fg);--btn-border:transparent;--btn-pad:12px; --btn-bg-hover:var(--dshpc-hover);--btn-bg-active:var(--dshpc-active);--btn-fg-hover:var(--btn-fg); appearance:none;display:inline-flex;align-items:center;justify-content:center;gap:6px; box-sizing:border-box;border:1px solid var(--btn-border);border-radius:var(--dshpc-radius-md); background-color:var(--btn-bg);color:var(--btn-fg);font-family:inherit;font-weight:500;white-space:nowrap;cursor:pointer; transition:background-color var(--dshpc-dur-fast) var(--dshpc-ease),border-color var(--dshpc-dur-fast) var(--dshpc-ease),color var(--dshpc-dur-fast) var(--dshpc-ease),box-shadow var(--dshpc-dur-fast) var(--dshpc-ease),transform var(--dshpc-dur-fast) var(--dshpc-ease);} .dshpc-btn--sm{--btn-pad:10px;height:var(--dshpc-control-h-sm);padding:0 var(--btn-pad);font-size:var(--dshpc-font-sm);line-height:1;} .dshpc-btn--md{--btn-pad:12px;height:var(--dshpc-control-h-md);padding:0 var(--btn-pad);font-size:var(--dshpc-font-md);line-height:1;} .dshpc-btn--lg{--btn-pad:14px;height:var(--dshpc-control-h-lg);padding:0 var(--btn-pad);font-size:var(--dshpc-font-md);line-height:1;} /* block\uFF1A\u6491\u6EE1\u7236\u5BBD\uFF08\u8868\u5355\u5E95\u680F / \u62BD\u5C49\u5E95\u90E8\u7684\u4E3B\u64CD\u4F5C\uFF09 */ .dshpc-btn--block{display:flex;width:100%;} /* block + \u524D\u7F6E\u56FE\u6807 \u21D2 \u6587\u5B57\u89C6\u89C9\u5C45\u4E2D\uFF082026-10-19 \u7528\u6237\u70B9\u540D\uFF09\uFF1A \u5185\u5BB9\u7EC4 [\u56FE\u6807 + \u95F4\u8DDD + \u6587\u5B57] \u6574\u4F53\u5728\u76D2\u5185\u5C45\u4E2D\u65F6\uFF0C**\u6587\u5B57**\u7684\u4E2D\u5FC3\u4F1A\u88AB\u56FE\u6807\u63A8\u53F3\u534A\u683C\u3002 \u628A\u53F3\u5185\u8FB9\u8DDD\u8865\u4E0A\u300C\u56FE\u6807\u5BBD + \u95F4\u8DDD\u300D\uFF0C\u53EF\u7528\u76D2\u968F\u4E4B\u5DE6\u79FB\u540C\u91CF \u21D2 \u6587\u5B57\u843D\u56DE\u89C6\u89C9\u4E2D\u5FC3\uFF0C\u56FE\u6807\u8D34\u5DE6\u4FA7\u3002 \u56FE\u6807\u5BBD\u6309 1.2em \u4F30\uFF08\u5B98\u65B9\u56FE\u6807 14/16px vs \u5B57\u53F7 12/13px\uFF09\uFF0Cem \u968F\u5B57\u53F7\u6863\u81EA\u52A8\u7F29\u653E\u3002 */ .dshpc-btn--block.dshpc-btn--icon-start{padding-right:calc(var(--btn-pad) + 1.2em + 6px);} .dshpc-btn__icon,.dshpc-btn__icon-end{display:inline-flex;align-items:center;justify-content:center;flex:none;line-height:0;} .dshpc-btn__icon svg,.dshpc-btn__icon-end svg{display:block;margin:0;} /* loading\uFF1A\u4E0D\u6362 DOM \u7ED3\u6784\uFF0C\u53EA\u5728\u6587\u6848\u524D\u63D2\u4E00\u4E2A\u540C\u8272\u5C0F\u5708\uFF08\u5C3A\u5BF8\u968F\u5B57\u53F7\uFF0C\u7F29\u653E\u4E0D\u4F9D\u8D56\u5E38\u91CF\uFF09 */ .dshpc-btn__spinner{display:block;flex:none;width:12px;height:12px;box-sizing:border-box; border:1.5px solid currentColor;border-right-color:transparent;border-radius:999px; animation:dshpc-btn-spin .7s linear infinite;} /* shortcut: 12px \u662F\u56FA\u5B9A\u503C\uFF0C\u4E0D\u968F\u6309\u94AE\u5B57\u53F7\u7F29\u653E\uFF1B\u8981\u66F4\u5927\u5C31\u6539\u8FD9\u4E00\u5904\u3002 */ @keyframes dshpc-btn-spin{to{transform:rotate(360deg)}} /* \u4EA4\u4E92\u6001\uFF1A\u989C\u8272\u53D8\u5316\u5199\u5728\u53D8\u91CF\u4E0A \u21D2 \u6240\u6709\u6863\u4F4D\u4E00\u6B21\u751F\u6548\uFF0C\u4E14\u53D8\u5316\u5E45\u5EA6\u7531 token \u51B3\u5B9A\uFF08\u591F\u660E\u663E\uFF09 */ .dshpc-btn:hover:not(:disabled){background-color:var(--btn-bg-hover);color:var(--btn-fg-hover);} .dshpc-btn:active:not(:disabled){background-color:var(--btn-bg-active);transform:translateY(1px);} .dshpc-btn:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:2px;} .dshpc-btn:disabled{cursor:default;opacity:.5;} .dshpc-btn--primary{--btn-bg:var(--dshpc-accent);--btn-fg:var(--dshpc-fg-inverse); --btn-bg-hover:var(--dshpc-accent-hover);--btn-bg-active:var(--dshpc-accent-active);} /* secondary\uFF1A\u4E2D\u6027\u5B9E\u5FC3\uFF08\u7070\u9762\uFF09\uFF0C\u7528\u4E8E\u300C\u53D6\u6D88 / \u6B21\u8981\u300D\u8FD9\u7C7B\u4E0E\u4E3B\u64CD\u4F5C\u5E76\u6392\u7684\u6309\u94AE */ .dshpc-btn--secondary{--btn-bg:var(--dshpc-hover);--btn-fg:var(--dshpc-fg); --btn-bg-hover:var(--dshpc-active);--btn-bg-active:var(--dshpc-active);} .dshpc-btn--outline{--btn-bg:var(--dshpc-surface-1);--btn-border:var(--dshpc-border-strong); --btn-bg-hover:var(--dshpc-hover);--btn-bg-active:var(--dshpc-active);} .dshpc-btn--ghost{--btn-fg:var(--dshpc-fg-2);--btn-fg-hover:var(--dshpc-fg); --btn-bg-hover:var(--dshpc-hover);--btn-bg-active:var(--dshpc-active);} .dshpc-btn--danger{--btn-bg:var(--dshpc-danger);--btn-fg:var(--dshpc-on-signal); --btn-bg-hover:var(--dshpc-danger-hover);--btn-bg-active:var(--dshpc-danger-active);} .dshpc-btn--success{--btn-bg:var(--dshpc-success);--btn-fg:var(--dshpc-on-signal); --btn-bg-hover:var(--dshpc-success-hover);--btn-bg-active:var(--dshpc-success-active);} .dshpc-btn--warning{--btn-bg:var(--dshpc-warning);--btn-fg:var(--dshpc-on-warning); --btn-bg-hover:var(--dshpc-warning-hover);--btn-bg-active:var(--dshpc-warning-active);} .dshpc-btn--info{--btn-bg:var(--dshpc-business);--btn-fg:var(--dshpc-on-signal); --btn-bg-hover:var(--dshpc-business-hover);--btn-bg-active:var(--dshpc-business-active);} /* danger-outline\uFF1A\u7EA2\u5B57\u63CF\u8FB9\uFF08\u7834\u574F\u6027\u6B21\u8981\u64CD\u4F5C\uFF0C\u5982\u5361\u7247\u4E0A\u7684\u300C\u5220\u9664\u300D\uFF09\u3002 \u26A0\uFE0F \u65E7\u4FEE\u9970\u7C7B danger-ink \u4FDD\u7559\u4E3A\u522B\u540D\uFF08\u6D88\u8D39\u65B9\u53EF\u80FD\u8FD8\u5728\u6302\uFF09\uFF0C\u4E24\u8005\u540C\u4E00\u5957\u76AE\u80A4\u3002 */ .dshpc-btn--danger-outline,.dshpc-btn--danger-ink{--btn-border:var(--dshpc-danger);--btn-fg:var(--dshpc-danger); --btn-fg-hover:var(--dshpc-danger);--btn-bg-hover:var(--dshpc-danger-soft);--btn-bg-active:var(--dshpc-danger-soft);} /* link\uFF1A\u884C\u5185\u6587\u5B57\u94FE\u63A5\u578B\uFF08\u4F1A\u8BDD / \u4EA7\u51FA\u6587\u4EF6\u540D\uFF09\uFF0C\u65E0\u5E95\u65E0\u8FB9\u3001\u54C1\u724C\u84DD\u3001hover \u4E0B\u5212\u7EBF */ .dshpc-btn--link{--btn-fg:var(--dshpc-link);--btn-fg-hover:var(--dshpc-link); --btn-bg-hover:transparent;--btn-bg-active:transparent; height:auto;padding:0;border:0;background:none;font-weight:400;text-align:left;} .dshpc-btn--link:hover:not(:disabled){text-decoration:underline;} /* \u56FE\u6807\u94AE\uFF1A\u7EAF\u56FE\u6807\uFF0C\u65B9\u5F62\uFF1B\u5C3A\u5BF8\u6863\u7684\u5BBD\u9AD8\u4E0E\u540C\u6863\u6587\u5B57\u6309\u94AE\u7B49\u9AD8 */ .dshpc-iconbtn{appearance:none;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box; border:1px solid transparent;border-radius:var(--dshpc-radius-sm);background:transparent;color:var(--dshpc-fg-2); font-family:inherit;cursor:pointer;flex:none; transition:background-color var(--dshpc-dur-fast) var(--dshpc-ease),border-color var(--dshpc-dur-fast) var(--dshpc-ease),color var(--dshpc-dur-fast) var(--dshpc-ease),opacity var(--dshpc-dur-fast) var(--dshpc-ease);} .dshpc-iconbtn--sm{width:var(--dshpc-control-h-sm);height:var(--dshpc-control-h-sm);font-size:var(--dshpc-font-sm);} .dshpc-iconbtn--md{width:var(--dshpc-control-h-md);height:var(--dshpc-control-h-md);font-size:var(--dshpc-font-md);} .dshpc-iconbtn--lg{width:var(--dshpc-control-h-lg);height:var(--dshpc-control-h-lg);font-size:var(--dshpc-font-md);} .dshpc-iconbtn--plain{color:var(--dshpc-fg-2);} .dshpc-iconbtn--outline{background:var(--dshpc-surface-1);border-color:var(--dshpc-border);color:var(--dshpc-fg-2);} .dshpc-iconbtn--danger{color:var(--dshpc-danger);} .dshpc-iconbtn:hover:not(:disabled){background:var(--dshpc-hover);color:var(--dshpc-fg);} .dshpc-iconbtn--danger:hover:not(:disabled){background:var(--dshpc-danger-soft);color:var(--dshpc-danger);} .dshpc-iconbtn:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:2px;} .dshpc-iconbtn:disabled{cursor:default;opacity:.4;} /* \u2500\u2500 \u884C\u5F0F\u6587\u4EF6\u6309\u94AE\uFF08\u56FE\u6807 + \u6587\u4EF6\u540D\uFF09P2\uFF1A**\u5168\u7AD9\u552F\u4E00\u5B9E\u73B0**\uFF082026-10-04 \u6536\u7F16\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 \u7528\u9014\uFF1A\u300C\u4EA7\u51FA\u7269 / \u9644\u4EF6\u300D\u90A3\u79CD**\u4E00\u884C\u4E00\u4E2A\u6587\u4EF6**\u7684\u6E05\u5355\u9879\uFF08\u57FA\u7840\u4FE1\u606F\u53F3\u680F\u4EA7\u51FA\u7269\u6E05\u5355\u3001\u9644\u4EF6\u533A\u3001 \u6267\u884C\u8BB0\u5F55\u9875\u7684\u5C55\u5F00\u533A\uFF09\u3002\u5E73\u65F6\u900F\u660E\u3001**\u9F20\u6807\u79FB\u4E0A\u53BB\u624D\u51FA\u6D45\u5E95**\uFF08\u6CBF\u7528\u7528\u6237 2026-10-03 \u5B9A\u7684\u89C2\u611F\uFF09\u3002 \u4E24\u4E2A\u5F62\u6001\u4FEE\u9970\u7C7B\uFF1A --block   \u6491\u6EE1\u7236\u5BBD\uFF08\u6E05\u5355\u91CC\u4E00\u9879\u4E00\u884C\uFF09 --inline  \u5185\u5BB9\u5BBD\uFF08\u8DDF\u5728\u6587\u5B57\u540E\u5934\uFF0C\u5982\u9644\u4EF6\u884C\uFF09 \u6536\u7F16\u539F\u56E0\uFF1A\u8FD9\u4EFD\u76AE\u80A4\u6B64\u524D\u53EA\u5199\u5728 task-list.tsx \u7684 TASK_LIST_CSS \u91CC\uFF08\u65E7\u540D .dshpc-info-out\uFF09\uFF0C \u6267\u884C\u8BB0\u5F55\u9875\u5C55\u5F00\u533A\u8981\u7528\u540C\u4E00\u79CD\u89C2\u611F \u21D2 \u4E0A\u63D0\u57FA\u7840\u5C42\uFF0C\u907F\u514D\u518D\u51FA\u73B0\u300C\u5404\u5199\u4E00\u4EFD\u5916\u89C2\u300D\uFF08\u540C\u540D\u4E0D\u540C\u76AE\u7684\u5751\u521A\u8E29\u8FC7\uFF09\u3002 */ .dshpc-filechip{appearance:none;-webkit-appearance:none;border:0;border-radius:var(--dshpc-radius-xs); background:transparent;color:var(--dshpc-fg);font:inherit;text-align:left;cursor:pointer;min-width:0; transition:background-color var(--dshpc-dur) var(--dshpc-ease);} .dshpc-filechip:hover:not(:disabled){background:var(--dshpc-chip-bg);} .dshpc-filechip:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:1px;} .dshpc-filechip:disabled{cursor:default;background:transparent;color:var(--dshpc-fg-3);} .dshpc-filechip--block{display:flex;align-items:center;gap:6px;width:100%;box-sizing:border-box; padding:4px 6px;font-size:var(--dshpc-font-xs);} .dshpc-filechip--inline{display:inline-flex;align-items:center;gap:4px;padding:2px 6px;font-size:var(--dshpc-font-sm);} @media (prefers-reduced-motion: reduce){.dshpc-btn,.dshpc-iconbtn,.dshpc-filechip{transition:none;}} `;
var FIELD_CSS = ` /* \u2500\u2500 \u8F93\u5165\u7C7B P3 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */ .dshpc-input{box-sizing:border-box;border:1px solid var(--dshpc-border);border-radius:var(--dshpc-radius-md); background:var(--dshpc-surface-1);color:var(--dshpc-fg);font-family:inherit;outline:none; transition:border-color var(--dshpc-dur-fast) var(--dshpc-ease),box-shadow var(--dshpc-dur-fast) var(--dshpc-ease);} .dshpc-input--sm{height:var(--dshpc-control-h-sm);padding:0 8px;font-size:var(--dshpc-font-sm);line-height:var(--dshpc-line-sm);} .dshpc-input--md{height:var(--dshpc-control-h-md);padding:0 10px;font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);} .dshpc-input--lg{height:var(--dshpc-control-h-lg);padding:0 12px;font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);} .dshpc-input::placeholder{color:var(--dshpc-fg-dim);} .dshpc-input:focus{border-color:var(--dshpc-focus);box-shadow:0 0 0 1px var(--dshpc-focus);} .dshpc-input--error{border-color:var(--dshpc-danger);} .dshpc-input:disabled{cursor:default;opacity:.5;} .dshpc-pfx{display:inline-flex;align-items:center;box-sizing:border-box;overflow:hidden; border:1px solid var(--dshpc-border);border-radius:var(--dshpc-radius-md);background:var(--dshpc-surface-1);color:var(--dshpc-fg);} .dshpc-pfx--sm{height:var(--dshpc-control-h-sm);} .dshpc-pfx--md{height:var(--dshpc-control-h-md);} .dshpc-pfx--lg{height:var(--dshpc-control-h-lg);} /* md / lg \u6863\u5B57\u53F7\u8DDF\u6863\u8D70\uFF08\u4E0E\u540C\u6863\u4E0B\u62C9\u540C\u5B57\u53F7\uFF09\uFF1A\u6B64\u524D\u5199\u6B7B sm(12px)\uFF0C\u540C\u6392\u4E0B\u62C9\u662F 13px \u21D2 \u663E\u5F97\u300Cinput \u5B57\u5C0F\u300D\u3002 */ .dshpc-pfx--md .dshpc-pfx__label,.dshpc-pfx--lg .dshpc-pfx__label{font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);} .dshpc-pfx--md .dshpc-pfx__input,.dshpc-pfx--lg .dshpc-pfx__input{font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);} .dshpc-pfx--error{border-color:var(--dshpc-danger);} .dshpc-pfx:focus-within{border-color:var(--dshpc-focus);box-shadow:0 0 0 1px var(--dshpc-focus);} .dshpc-pfx__label{padding:0 8px;color:var(--dshpc-fg-2);font-size:var(--dshpc-font-sm);line-height:var(--dshpc-line-sm);white-space:nowrap;border-right:1px solid var(--dshpc-border);} .dshpc-pfx__input{flex:1 1 auto;min-width:0;height:100%;padding:0 8px;border:0;background:transparent;color:var(--dshpc-fg); font-family:inherit;font-size:var(--dshpc-font-sm);line-height:var(--dshpc-line-sm);outline:none;} .dshpc-pfx__input::placeholder{color:var(--dshpc-fg-dim);} .dshpc-num{display:inline-flex;align-items:center;justify-content:space-between;box-sizing:border-box;overflow:hidden; border:1px solid var(--dshpc-border);border-radius:var(--dshpc-radius-md);background:var(--dshpc-surface-1);color:var(--dshpc-fg);} /* \u4E2D\u6BB5\uFF1A\u6570\u5B57 + \u540E\u7F00\u6210\u7EC4\u5C45\u4E2D\uFF1B\u5BB9\u5668\u88AB\u6D88\u8D39\u7AEF\u62C9\u5BBD\u65F6\u5403\u6389\u5168\u90E8\u4F59\u91CF\uFF0C\u4E24\u7AEF \u2212 / + \u56E0\u6B64\u9489\u6B7B\u5728\u5DE6\u53F3\u8FB9\u7F18\u3002 */ .dshpc-num__mid{display:flex;align-items:center;justify-content:center;flex:1 1 auto;min-width:0;} .dshpc-num--sm{height:var(--dshpc-control-h-sm);} .dshpc-num--md{height:var(--dshpc-control-h-md);} .dshpc-num--lg{height:var(--dshpc-control-h-lg);} .dshpc-num--md .dshpc-num__input,.dshpc-num--lg .dshpc-num__input{font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);} .dshpc-num--md .dshpc-num__suffix,.dshpc-num--lg .dshpc-num__suffix{font-size:var(--dshpc-font-md);} .dshpc-num--disabled{opacity:.5;} .dshpc-num__input{width:36px;height:100%;padding:0 2px;border:0;background:transparent;color:var(--dshpc-fg); font-family:inherit;font-size:var(--dshpc-font-sm);line-height:var(--dshpc-line-sm);text-align:center;outline:none;} .dshpc-num__suffix{padding:0 6px;color:var(--dshpc-fg-2);font-size:var(--dshpc-font-sm);white-space:nowrap;} .dshpc-num .dshpc-iconbtn{border-radius:0;color:var(--dshpc-fg-2);flex:none;} /* \u5B98\u65B9 Switch \u5305\u88C5\u7EDF\u4E00\uFF1A\u9009\u4E2D = success \u7EFF\u3002 \uFF08\u5408\u5E76\u539F\u5148 task-editor-css / task-list \u4E24\u5904\u5C31\u5730\u8986\u76D6\uFF1B\u9009\u62E9\u5668\u5E26\u5305\u88C5\u7C7B + role\uFF0C\u7279\u5F02\u6027\u9AD8\u4E8E\u5B98\u65B9\u3002\uFF09 */ .dshpc-switch button[role='switch'][aria-checked='true']{background:var(--dshpc-success);} /* \u591A\u884C\u6587\u672C\u8F93\u5165\uFF08\u63D0\u793A\u8BCD\u7B49\uFF0CP3\uFF09\uFF1A\u5361\u5185\u65E0\u8FB9\u6846\uFF08\u89C6\u89C9\u91CD\u5FC3\u5728\u6574\u5F20\u5361\u4E0A\uFF09\uFF0C\u5360\u4F4D\u8272\u8D70 dimmed\uFF1B\u6821\u9A8C\u4E0D\u901A\u8FC7\u63CF\u7EA2\u76D2\u3002 \uFF08\u4ECE task-editor-css \u7684 .dshpc-ed-prompt \u4E0A\u63D0\u800C\u6765\uFF1B\u4E1A\u52A1\u6587\u4EF6\u4E0D\u518D\u81EA\u5199 textarea \u76AE\u80A4\u3002\uFF09 */ .dshpc-textarea{display:block;width:100%;box-sizing:border-box;min-height:132px;padding:2px;border:none;outline:none;background:0 0;color:var(--dshpc-fg);font:inherit;font-size:var(--dshpc-font-lg);line-height:1.6;resize:vertical;} .dshpc-textarea::placeholder{color:var(--dshpc-fg-dim);} .dshpc-textarea--error{box-shadow:0 0 0 1px var(--dshpc-danger);} /* \u62D6\u62FD\u5206\u9694\u6761\uFF08\u7F16\u8F91\u5206\u680F / \u9884\u89C8 dock \u5171\u7528\uFF0CU20 #3\uFF09\uFF1A6px \u547D\u4E2D\u533A\uFF0Ccol-resize\uFF0C\u4E0D\u753B\u7EBF\uFF0Chover/\u6309\u4E0B\u6D6E\u51FA\u6D45\u5E26\u3002 \u5177\u4F53 z-index \u7531 .dshpc-ed-resizer / .dshpc-sv-resizer \u5404\u81EA\u8865\u3002 */ .dshpc-resizer{position:absolute;top:0;bottom:0;left:0;width:6px;cursor:col-resize;background:0 0;touch-action:none;user-select:none;} .dshpc-resizer:hover,.dshpc-resizer:active{background:var(--dshpc-hover,rgba(38,49,72,.06));} @media (prefers-reduced-motion: reduce){.dshpc-input,.dshpc-pfx{transition:none;}} `;
var DATETIME_CSS = ` /* \u2500\u2500 \u65E5\u671F / \u65F6\u95F4 P4 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */ .dshpc-dtf-wrap{display:inline-flex;position:relative;min-width:0;} /* \u26A0\uFE0F \u8FB9\u6846\u7C97\u7EC6 / \u5706\u89D2\u5FC5\u987B\u4E0E\u4E0B\u62C9\u951A\u70B9\uFF08dshpc-ed-field \u7684 fieldButtonStyle\uFF09\u5B8C\u5168\u4E00\u81F4 \uFF08\u7528\u6237 2026-10-02 \u70B9\u540D\uFF1A\u540C\u6392\u7684\u65E5\u671F\u6846\u4E0E\u4E0B\u62C9\u6846\u770B\u7740\u4E0D\u662F\u4E00\u5957\uFF09\u21D2 \u8FD9\u91CC\u4E5F\u662F 0.5px + radius-md\u3002 */ .dshpc-dtf{display:inline-flex;align-items:center;gap:6px;box-sizing:border-box;height:var(--dshpc-control-h-lg); min-width:0;max-width:100%;padding:0 8px;border:0.5px solid var(--dshpc-border-heavy);border-radius:var(--dshpc-radius-md); background:var(--dshpc-surface-1);color:var(--dshpc-fg);font:inherit;font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md); cursor:pointer;transition:background-color var(--dshpc-dur-fast) var(--dshpc-ease),border-color var(--dshpc-dur-fast) var(--dshpc-ease);} /* \u65E5\u671F / \u65F6\u95F4\u951A\u70B9\uFF1A\u4E09\u6863\u9AD8\u5EA6\uFF08\u9ED8\u8BA4 lg=32\uFF09\u3002base \u5DF2\u542B lg \u9AD8\u5EA6\u4F5C\u515C\u5E95\uFF0C\u4E0B\u9762\u4E09\u6863\u6309 size \u8986\u76D6\u3002 */ .dshpc-dtf--sm{height:var(--dshpc-control-h-sm);padding:0 6px;font-size:var(--dshpc-font-sm);line-height:var(--dshpc-line-sm);} .dshpc-dtf--md{height:var(--dshpc-control-h-md);padding:0 8px;font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);} .dshpc-dtf--lg{height:var(--dshpc-control-h-lg);padding:0 8px;font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);} .dshpc-dtf:hover:not(:disabled){background:var(--dshpc-hover);} .dshpc-dtf:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:2px;} .dshpc-dtf:disabled{cursor:not-allowed;opacity:.6;} .dshpc-dtf__label{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left;} .dshpc-dtf__label--ph{color:var(--dshpc-fg-dim);} .dshpc-dtf__icon{display:inline-flex;width:16px;height:16px;align-items:center;justify-content:center;flex:none;color:var(--dshpc-fg-3);} .dshpc-layer{position:fixed;z-index:var(--dshpc-z-menu);box-sizing:border-box;padding:8px;background:var(--dshpc-surface-1); box-shadow:var(--dshpc-shadow-2);border-radius:var(--dshpc-radius-md);color:var(--dshpc-fg);font-size:var(--dshpc-font-md);} .dshpc-cal__head{display:flex;align-items:center;justify-content:space-between;gap:4px;margin-bottom:4px;} .dshpc-cal__title{flex:1 1 auto;text-align:center;font-size:var(--dshpc-font-md);font-weight:600;color:var(--dshpc-fg);} .dshpc-cal__grid{display:grid;grid-template-columns:repeat(7,32px);gap:2px;} .dshpc-cal__weekday{height:24px;display:flex;align-items:center;justify-content:center;font-size:var(--dshpc-font-sm);color:var(--dshpc-fg-3);} .dshpc-cal__cell{width:32px;height:32px;padding:0;display:flex;align-items:center;justify-content:center; border:1px solid transparent;border-radius:var(--dshpc-radius-md);background:transparent;color:var(--dshpc-fg); font:inherit;font-size:var(--dshpc-font-md);cursor:pointer; transition:background-color var(--dshpc-dur-fast) var(--dshpc-ease),color var(--dshpc-dur-fast) var(--dshpc-ease);} .dshpc-cal__cell--hover{background:var(--dshpc-hover);} .dshpc-cal__cell--out{color:var(--dshpc-fg-dim);} .dshpc-cal__cell--today{border-color:var(--dshpc-business);} .dshpc-cal__cell[aria-pressed='true']{background:var(--dshpc-accent);color:var(--dshpc-fg-inverse);} .dshpc-cal__foot{margin-top:6px;padding-top:6px;border-top:1px solid var(--dshpc-border);} .dshpc-time__cols{display:flex;gap:4px;} .dshpc-time__list{width:56px;max-height:196px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;} .dshpc-time__opt{padding:5px 0;border:0;border-radius:var(--dshpc-radius-sm);background:transparent;color:var(--dshpc-fg-2); font:inherit;font-size:var(--dshpc-font-md);cursor:pointer;transition:background-color var(--dshpc-dur-fast) var(--dshpc-ease),color var(--dshpc-dur-fast) var(--dshpc-ease);} .dshpc-time__opt[aria-selected='true']{background:var(--dshpc-hover);color:var(--dshpc-fg);font-weight:600;} .dshpc-time__foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:6px;padding-top:6px;border-top:1px solid var(--dshpc-border);} @media (prefers-reduced-motion: reduce){.dshpc-dtf,.dshpc-cal__cell,.dshpc-time__opt{transition:none;}} `;
var SELECT_CSS = ` /* \u4E0B\u62C9 / \u65E5\u5386 / \u65F6\u5206\u951A\u70B9\uFF1A\u952E\u76D8\u53EF\u8FBE\u6027\u63CF\u8FB9 + \u6821\u9A8C\u63CF\u7EA2\uFF08\u7C7B\u540D\u4ECE\u4E1A\u52A1\u5C42\u6CBF\u7528\uFF0C\u76AE\u80A4\u5F52\u4F4D\u57FA\u7840\u5C42\uFF09 */ .dshpc-ed-field:focus-visible{outline:2px solid var(--dshpc-business);outline-offset:1px;} .dshpc-ed-field--error{border-color:var(--dshpc-danger)!important;box-shadow:0 0 0 1px var(--dshpc-danger);} /* \u6574\u884C\u4E0B\u62C9\uFF1A\u5B98\u65B9 Menu \u7684\u5305\u88C5 span \u662F inline-flex\uFF08shrink-to-fit\uFF09\uFF0C\u8981\u8FDE\u5B83\u4E00\u8D77\u6491\u6EE1 */ .dshpc-ed-selectwrap{width:100%;} /* \u7701\u7565\u53F7\u4E09\u4EF6\u5957\uFF08ui-style-guide \xA7\u4E09\u300C\u5F85\u62BD\u8C61 #1\u300D\u7684\u6536\u655B\u70B9\uFF09\uFF1A**\u65B0\u4EE3\u7801\u4E00\u5F8B\u6302\u8FD9\u4E2A\u7C7B**\uFF0C\u4E0D\u518D\u5404\u5199\u4E00\u904D\u3002 \u26A0\uFE0F \u5DF2\u6709 19 \u5904\u65E7\u5199\u6CD5\u5F85\u9010\u6B65\u6536\u7F16\uFF082026-10-04 \u8D77\u65B0\u589E\u7684\u8C03\u7528\u70B9\u4E0D\u8BB8\u518D\u624B\u5199\u8FD9\u4E09\u6761\u5C5E\u6027\uFF09\u3002 */ .dshpc-ellipsis{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;} /* \u8DD1\u9A6C\u706F\u6587\u672C\uFF08MarqueeText\uFF09\uFF1A\u53CC\u5C42\u2014\u2014\u5916\u5C42\u53EA\u88C1\u526A\uFF0C\u5185\u5C42\u624D transform \u6EDA\u52A8\uFF1B\u975E hover \u5185\u5C42\u81EA\u5E26\u7701\u7565\u53F7 */ .dshpc-mq{display:block;overflow:hidden;white-space:nowrap;} .dshpc-mq .dshpc-mq-in{display:inline-block;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis;vertical-align:top;} /* \u26A0\uFE0F \u8DD1\u6CD5\uFF08\u7528\u6237 2026-10-03 \u62CD\u677F\uFF09\uFF1A**\u8DD1\u4E00\u904D\u3001\u505C\u5728\u5C3E\u5B57**\uFF08\u64AD\u653E 1 \u6B21 + forwards\uFF09\uFF0C\u4E0D\u6765\u56DE\u5F39\u3001\u4E0D\u65E0\u9650\u8DD1\u3002 \u6EDA\u8DDD = \u7CBE\u786E\u6EA2\u51FA\u91CF \u21D2 \u505C\u4E0B\u65F6\u6700\u540E\u4E00\u4E2A\u5B57\u6B63\u597D\u8D34\u53F3\u7F18\uFF0C**\u4E0D\u4F1A\u8DD1\u8FDB\u9ED1\u5757**\uFF08\u9ED1\u5757\u662F\u65E7\u624B\u5199\u7248\u628A \u5185\u5C42\u76D2\u5B50\u88C1\u4E86\u3001\u6309\u300C\u534A\u622A\u6587\u672C\u300D\u5E73\u79FB\u5BFC\u81F4\u7684\uFF09\u3002\u9F20\u6807\u79FB\u5F00 \u21D2 :hover \u5931\u6548 \u21D2 \u81EA\u52A8\u590D\u4F4D\u56DE\u7701\u7565\u53F7\u6001\u3002 */ .dshpc-mq-run:hover .dshpc-mq-in{max-width:none;overflow:visible;animation:dshpc-mq-scroll var(--dshpc-mq-dur,6s) linear .4s 1 forwards;} @keyframes dshpc-mq-scroll{from{transform:translateX(0)}to{transform:translateX(var(--dshpc-mq-dist,-40px))}} `;
var LOADING_CSS = ` /* \u8FD0\u884C\u4E2D / loading \u7684\u6D3B\u52A8\u6307\u793A\uFF1A\u4E09\u4E2A\u5C0F\u65B9\u5757\u4F9D\u6B21\u8109\u52A8\u3002 */ @keyframes dshpc-run-block { 0%, 80%, 100% { opacity: 0.25; transform: scale(0.8) } 40% { opacity: 1; transform: scale(1) } } .dshpc-run-blocks { display: inline-flex; align-items: center; gap: 3px; } .dshpc-run-blocks > i { width: 5px; height: 5px; border-radius: 1px; background: currentColor; animation: dshpc-run-block 1.2s ease-in-out infinite; } .dshpc-run-blocks > i:nth-child(2) { animation-delay: 0.15s; } .dshpc-run-blocks > i:nth-child(3) { animation-delay: 0.3s; } @media (prefers-reduced-motion: reduce) { .dshpc-run-blocks > i { animation: none; opacity: 1; } } `;
var BACK_TO_TOP_CSS = ` /* \u56DE\u5230\u9876\u90E8\u60AC\u6D6E\u94AE\uFF1A\u5706\u94AE\u3001\u5B9E\u9762\u3001\u6295\u5F71\uFF1B\u9ED8\u8BA4\u9690\u8EAB\uFF0C\u6EDA\u8FC7\u9608\u503C\u52A0 .is-visible \u624D\u663E\u5F62\u3002 \u6A2A\u5411 left \u7531\u7EC4\u4EF6\u6309\u4E3B\u5185\u5BB9\u5217\u53F3\u7F18\u5B9E\u65F6\u7B97\u51FA\uFF08\u8D34\u5728\u5176\u53F3\u4FA7\u5916\u4FA7\uFF09\uFF0C\u4E0D\u5199\u6B7B\u3002 */ .dshpc-backtotop{ position:fixed; bottom:var(--dshpc-space-4); z-index:var(--dshpc-z-dock); width:44px;height:44px; display:inline-flex;align-items:center;justify-content:center; padding:0;margin:0; box-sizing:border-box; border:1px solid var(--dshpc-border); border-radius:50%; background:var(--dshpc-solid); color:var(--dshpc-on-solid); box-shadow:var(--dshpc-shadow-2); cursor:pointer; opacity:0; transform:translateY(8px) scale(.92); transition:opacity var(--dshpc-dur) var(--dshpc-ease), transform var(--dshpc-dur) var(--dshpc-ease), background-color var(--dshpc-dur-fast) var(--dshpc-ease); pointer-events:none; } .dshpc-backtotop.is-visible{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;} .dshpc-backtotop:hover{background:var(--dshpc-hover);} .dshpc-backtotop:active{background:var(--dshpc-active);} .dshpc-backtotop:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:2px;} @media (prefers-reduced-motion: reduce){ .dshpc-backtotop{transition:opacity var(--dshpc-dur-fast) linear;transform:none;} } `;
var HINT_CSS = ` /* \u2500\u2500 \u95EE\u53F7\u63D0\u793A P4\uFF08\u7528\u6237 2026-10-18\uFF1A\u5BF9\u9F50\u771F\u5B9E\u63D2\u4EF6 HelpButton\u2014\u2014**\u5E26\u5708\u7684\u95EE\u53F7\u56FE\u6807**\uFF09\u2500\u2500 \u672C\u4F53 14px \u7EC6\u5708 + \u5708\u5185 ?\uFF0C\u989C\u8272 fg-3\u3001hover \u53EA\u63D0\u4EAE\u4E0D\u52A0\u5E95\uFF08\u4E0E dshpc-ed-help \u540C\u89C4\u77E9\uFF09\u3002 \u6C14\u6CE1\u4E0D\u5728\u672C\u6587\u4EF6\uFF1A2026-10-19 \u7528\u6237\u62CD\u677F\u300C\u95EE\u53F7\u5FC5\u987B\u7528\u5B98\u65B9 Tooltip \u90A3\u4E00\u4E2A\u300D\u21D2 \u6C14\u6CE1\u7531\u6CE8\u5165\u7684 \u5B98\u65B9\u7EC4\u4EF6\u6E32\u67D3\uFF08src/ui/tooltip.ts\uFF09\uFF0C\u8FD9\u91CC\u53EA\u7BA1\u95EE\u53F7\u56FE\u6807\u672C\u8EAB\u3002 */ .dshpc-hint{display:inline-flex;align-items:center;justify-content:center;flex:none; box-sizing:border-box;width:14px;height:14px;padding:0;border:1px solid currentColor;border-radius:50%;background:transparent; color:var(--dshpc-fg-3);font-family:inherit;font-size:8px;font-weight:600;line-height:12px;cursor:help;vertical-align:middle; transition:color var(--dshpc-dur-fast) var(--dshpc-ease);} .dshpc-hint:hover,.dshpc-hint:focus-visible{color:var(--dshpc-fg);background:0 0;} .dshpc-hint:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:1px;} `;

// dist/ui/picker-css.js
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

// dist/ui/feedback-css.js
var FEEDBACK_CSS = `
.dshpc-modal-mask{
  position:fixed;inset:0;z-index:1070;display:flex;align-items:center;justify-content:center;
  background:rgba(15,23,42,.45);
}
.dshpc-modal{
  display:flex;flex-direction:column;max-width:min(960px,92vw);max-height:86vh;
  background:var(--dshpc-surface-base);border:1px solid var(--dshpc-border);
  border-radius:10px;box-shadow:0 16px 48px rgba(15,23,42,.24);overflow:hidden;
}
.dshpc-modal__head{
  display:flex;align-items:center;gap:8px;padding:12px 14px;
  border-bottom:1px solid var(--dshpc-border-faint);color:var(--dshpc-fg);font-size:14px;
}
.dshpc-modal__title{flex:1;min-width:0}
/* \u5173\u95ED\u6309\u94AE\uFF1A24\xD724 \u65B9\u89D2\u56FE\u6807\u4F4D\uFF0C\u4E0D\u501F\u7528 Picker \u7684\u89E6\u53D1\u5668\u76AE\u80A4\uFF08\u90A3\u4EFD\u5E26 min-width:120px\uFF09\u3002 */
.dshpc-modal__close{
  display:inline-flex;align-items:center;justify-content:center;flex:none;
  width:24px;height:24px;padding:0;border:none;border-radius:var(--dshpc-radius-sm);
  background:transparent;color:var(--dshpc-fg-3);font-family:inherit;font-size:12px;line-height:1;cursor:pointer;
  transition:background-color var(--dshpc-dur-fast) var(--dshpc-ease),color var(--dshpc-dur-fast) var(--dshpc-ease);
}
.dshpc-modal__close:hover{background:var(--dshpc-hover);color:var(--dshpc-fg)}
.dshpc-modal__close:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:1px}
.dshpc-modal__body{flex:1;min-height:0;overflow:auto;padding:12px 14px}
.dshpc-modal__foot{
  display:flex;justify-content:flex-end;gap:8px;padding:10px 14px;
  border-top:1px solid var(--dshpc-border-faint);
}
.dshpc-toast-host{
  position:fixed;z-index:1090;left:50%;bottom:32px;transform:translateX(-50%);
  display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;
}
.dshpc-toast{
  padding:8px 14px;border-radius:8px;font-size:13px;color:var(--dshpc-fg);
  background:var(--dshpc-surface-menu);border:1px solid var(--dshpc-border);
  box-shadow:0 8px 24px rgba(15,23,42,.16);
}
.dshpc-toast--success{color:var(--dshpc-success);border-color:color-mix(in srgb,var(--dshpc-success) 40%,transparent)}
.dshpc-toast--error{color:var(--dshpc-danger);border-color:color-mix(in srgb,var(--dshpc-danger) 40%,transparent)}
.dshpc-empty{
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
  padding:24px;color:var(--dshpc-fg-3);font-size:13px;text-align:center;
}
.dshpc-error{
  padding:12px 14px;border-radius:8px;font-size:13px;
  color:var(--dshpc-danger);background:color-mix(in srgb,var(--dshpc-danger) 10%,transparent);
  border:1px solid color-mix(in srgb,var(--dshpc-danger) 30%,transparent);
}
.dshpc-error__retry{
  margin-top:8px;color:var(--dshpc-link);cursor:pointer;background:none;border:none;padding:0;
}
`;

// dist/ui/card-css.js
var CARD_CSS = `
.dshpc-card{
  position:relative;padding:12px 14px;background:var(--dshpc-surface-1);
  --card-accent:var(--dshpc-business);
}
/* \u6863\u4F4D \u2192 token\uFF08\u7167 records-timeline \u7684 tone \u6A21\u5F0F\uFF1A\u4E00\u4E2A\u53D8\u91CF\u5207\u6863\uFF0C\u4E0D\u5199 5 \u5957\u89C4\u5219\uFF09\u3002 */
.dshpc-card--success{--card-accent:var(--dshpc-success)}
.dshpc-card--warning{--card-accent:var(--dshpc-warning)}
.dshpc-card--danger{--card-accent:var(--dshpc-danger)}
.dshpc-card--neutral{--card-accent:var(--dshpc-fg-4)}

/* \u5916\u89C2\u4E00\uFF1A\u5706\u89D2 + 1px \u8FB9\u6846\uFF0C\u8272\u6761\u4E0A\u4E0B\u7559\u8DDD\uFF08\u77ED\u6761\uFF09\u3002 */
.dshpc-card--bordered{border-radius:8px;border:1px solid var(--dshpc-border)}
.dshpc-card--bordered .dshpc-card__bar{top:8px;bottom:8px;border-radius:2px}

/* \u5916\u89C2\u4E8C\uFF1A\u65E0\u5706\u89D2\u65E0\u8FB9\u6846\uFF0C\u8272\u6761\u901A\u9AD8\u3002 */
.dshpc-card--strip{border-radius:0;border:none}
.dshpc-card--strip .dshpc-card__bar{top:0;bottom:0;border-radius:0}

/* \u8272\u6761\uFF1A\u7EDD\u5BF9\u5B9A\u4F4D + top/bottom \u21D2 \u8DDF\u7740\u5185\u5BB9\u9AD8\u5EA6\u81EA\u9002\u5E94\uFF1B\u4E0A\u4E0B\u662F\u5426\u7559\u8DDD\u7531\u5916\u89C2\u51B3\u5B9A\u3002 */
.dshpc-card__bar{position:absolute;left:0;width:3px;background:var(--card-accent)}

.dshpc-card__head{display:flex;align-items:flex-start;gap:8px;min-width:0}
.dshpc-card__main{flex:1;min-width:0}
.dshpc-card__side{display:flex;align-items:center;gap:6px;flex:none}
.dshpc-card__toggle{
  display:inline-flex;align-items:center;justify-content:center;
  width:24px;height:24px;padding:0;background:none;border:none;border-radius:6px;
  color:var(--dshpc-fg-3);cursor:pointer;
}
.dshpc-card__toggle:hover{background:var(--dshpc-surface-sunken);color:var(--dshpc-fg)}
.dshpc-card__caret{display:inline-block;font-size:10px;transition:transform .15s ease}
.dshpc-card__caret.is-open{transform:rotate(180deg)}
.dshpc-card__panel{margin-top:8px;padding-top:8px;border-top:1px solid var(--dshpc-border-faint)}
`;

// dist/ui/chip-css.js
var CHIP_CSS = `
.dshpc-chip{
  display:inline-flex;align-items:center;justify-content:center;gap:4px;padding:1px 8px;
  box-sizing:border-box;border-radius:var(--dshpc-radius-pill,999px);border:none;
  background:var(--dshpc-chip-bg);color:var(--dshpc-fg);
  font-family:inherit;font-size:11px;line-height:18px;margin:0;
  /* 2026-10-18\uFF1Achip \u662F flex \u884C\u91CC\u7684\u5E38\u7528\u9879\uFF0C\u7981\u6B62\u88AB\u538B\u7F29\u6362\u884C\uFF08\u9884\u89C8\u7AD9\u51FA\u73B0\u8FC7\u6587\u5B57\u7AD6\u6392\u3001\u4E92\u76F8\u53E0\u538B\u7684\u6324\u538B\uFF09\u3002 */
  white-space:nowrap;flex:none;
  appearance:none;-webkit-appearance:none;
}
/* \u53EF\u70B9\u6001\uFF1Abutton \u6E32\u67D3\uFF08\u89C1 Chip.ts\uFF09\uFF0C\u5149\u6807 + hover \u52A0\u6DF1\u3002 */
.dshpc-chip--clickable{cursor:pointer;transition:background-color var(--dshpc-dur-fast) var(--dshpc-ease);}
.dshpc-chip--clickable:hover:not(:disabled){background:var(--dshpc-chip-bg-hover)}
.dshpc-chip:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:1px}
.dshpc-chip:disabled{cursor:default;color:var(--dshpc-fg-3)}
@media (prefers-reduced-motion: reduce){.dshpc-chip{transition:none}}
`;

// dist/explorer/explorer-css.js
var EXPLORER_CSS = `
.dshpc-exp{display:flex;flex-direction:column;height:100%;min-height:0;color:var(--dshpc-fg);font-size:13px}
.dshpc-exp__crumbs{
  display:flex;align-items:center;gap:2px;flex-wrap:wrap;padding:6px 8px;
  border-bottom:1px solid var(--dshpc-border-faint);
}
.dshpc-exp__crumb{
  background:none;border:none;padding:2px 4px;border-radius:4px;cursor:pointer;
  color:var(--dshpc-link);font:inherit;
}
.dshpc-exp__crumb--current{color:var(--dshpc-fg);font-weight:600;cursor:default}
.dshpc-exp__sep{color:var(--dshpc-fg-4)}
.dshpc-exp__tools{display:flex;gap:6px;margin-left:auto}
.dshpc-exp__body{display:flex;flex:1;min-height:0}
.dshpc-exp__tree{width:220px;flex:none;overflow:auto;border-right:1px solid var(--dshpc-border-faint)}
.dshpc-exp__item{
  display:flex;align-items:center;gap:6px;padding:4px 8px;cursor:pointer;white-space:nowrap;
}
.dshpc-exp__item:hover{background:var(--dshpc-surface-sunken)}
.dshpc-exp__item--active{background:var(--dshpc-open-bg)}
.dshpc-exp__icon{width:14px;flex:none;color:var(--dshpc-fg-3)}
.dshpc-exp__name{overflow:hidden;text-overflow:ellipsis}
.dshpc-exp__size{margin-left:auto;color:var(--dshpc-fg-4);font-size:11px}
.dshpc-exp__preview{flex:1;min-width:0;overflow:auto;padding:8px}
.dshpc-exp__note{padding:6px 8px;color:var(--dshpc-fg-3);font-size:11px}
.dshpc-exp__text{
  margin:0;padding:8px;border-radius:6px;background:var(--dshpc-code-surface);
  font:var(--dshpc-code-font);white-space:pre-wrap;word-break:break-all;
}
.dshpc-exp__image{max-width:100%;border-radius:6px;border:1px solid var(--dshpc-border-faint)}
`;

// dist/session/session-css.js
var SESSION_CSS = `
.dshpc-ses{display:flex;flex-direction:column;min-height:0;color:var(--dshpc-fg);font-size:13px}
.dshpc-ses--sidebar{height:100%;border-left:1px solid var(--dshpc-border-faint);background:var(--dshpc-surface-base)}
.dshpc-ses--page{height:100%;background:var(--dshpc-surface-base)}
.dshpc-ses__list{flex:1;min-height:0;overflow:auto;padding:8px 12px;display:flex;flex-direction:column;gap:10px}
.dshpc-ses__msg{padding:8px 10px;border-radius:8px;background:var(--dshpc-surface-2);border:1px solid var(--dshpc-border-faint)}
.dshpc-ses__msg--user{background:var(--dshpc-open-bg-soft)}
.dshpc-ses__head{display:flex;align-items:center;gap:6px;margin-bottom:4px;color:var(--dshpc-fg-3);font-size:11px}
.dshpc-ses__text{margin:0;white-space:pre-wrap;word-break:break-word;line-height:1.6}
.dshpc-ses__atts{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.dshpc-ses__att{
  display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;
  background:var(--dshpc-chip-bg);color:var(--dshpc-fg);cursor:pointer;border:none;font:inherit;font-size:12px;
}
.dshpc-ses__att:hover{background:var(--dshpc-chip-bg-hover)}
.dshpc-ses__note{padding:12px;color:var(--dshpc-fg-3);text-align:center}
`;

// dist/ui/css.js
var CONTROLS_DOMAIN = "controls";
var CONTROLS_CSS = [
  SEGMENTED_CSS,
  BUTTON_CSS,
  FIELD_CSS,
  DATETIME_CSS,
  SELECT_CSS,
  LOADING_CSS,
  BACK_TO_TOP_CSS,
  HINT_CSS,
  PICKER_CSS,
  FEEDBACK_CSS,
  EXPLORER_CSS,
  SESSION_CSS,
  CARD_CSS,
  CHIP_CSS
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
  return (0, import_react6.createElement)(clickable ? "button" : "span", {
    type: clickable ? "button" : void 0,
    className: `dshpc-chip${clickable ? " dshpc-chip--clickable" : ""}${props.className === void 0 ? "" : ` ${props.className}`}`,
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
  return (0, import_react9.createElement)("button", attrs, loading ? (0, import_react9.createElement)("span", { className: "dshpc-btn__spinner", "aria-hidden": true }) : icon !== void 0 && icon !== null ? (0, import_react9.createElement)("span", { className: "dshpc-btn__icon" }, icon) : null, children, iconRight !== void 0 && iconRight !== null ? (0, import_react9.createElement)("span", { className: "dshpc-btn__icon-end" }, iconRight) : null);
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
    className: `dshpc-seg dshpc-seg--${variant} dshpc-seg--${size}${props.block === true ? " dshpc-seg--block" : ""}${props.className !== void 0 ? ` ${props.className}` : ""}`,
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
  const h31 = Math.floor(totalSec / 3600);
  const m = Math.floor(totalSec % 3600 / 60);
  const s = totalSec % 60;
  return h31 > 0 ? `${h31}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`;
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
var import_react30 = require("react");

// packages/demo/src/sections/design.tsx
var import_react19 = require("react");

// packages/demo/src/i18n.ts
var DICT2 = {
  zh: {
    sessionHint: "\u4E09\u79CD\u627F\u8F7D\uFF1Amodal / sidebar / page\uFF1Bsource \u662F mock \u7684\uFF1BrenderMessage \u53EF\u63A5\u7BA1\u5BCC\u5185\u5BB9",
    explorerHint: "\u9762\u5305\u5C51 + \u76EE\u5F55\u6811 + \u9884\u89C8\uFF1BworkspaceFiles \u662F mock \u7684\uFF08\u771F\u5B9E\u63D2\u4EF6\u4ECE ctx \u53D6\u51FA\u540E\u6CE8\u5165\uFF09",
    utilsHint: "\u89E3\u6790\u5931\u8D25\u4E0D\u629B\u9519\u3001\u7ED9\u515C\u5E95\u3001\u4E0D\u7F16\u9020\uFF1B\u6240\u6709\u51FD\u6570\u65E0 UI \u4F9D\u8D56",
    displayCardHint: "\u6392\u7248\u5B8C\u5168\u7531\u8C03\u7528\u65B9\u51B3\u5B9A\u2014\u2014\u771F\u5B9E\u63D2\u4EF6\u7684\u5F62\u6001\uFF1A\u6807\u9898\u884C + \u53F3\u4FA7\u5143\u4FE1\u606F + chips \u884C\uFF1Baccent \u4E94\u6863\u89C1\u4E0B\u65B9\u901F\u89C8",
    displayStripHint: "\u540C\u4E00\u4E2A\u8272\u6761\u673A\u5236\uFF0C\u5916\u89C2\u662F\u901A\u9AD8\u8D34\u9876\u5230\u5E95\u2014\u2014\u771F\u5B9E\u63D2\u4EF6\u7684\u5F62\u6001\uFF1A\u6807\u9898 + \u5143\u4FE1\u606F\u884C + \u53F3\u4FA7\u65F6\u95F4/\u64CD\u4F5C",
    displayChipHint: "chip \u53EA\u6709\u300C\u80F6\u56CA\u6807\u7B7E\u300D\u4E00\u5957\u76AE\u80A4\uFF1A\u5BBD\u5EA6\u6309\u6587\u5B57\u6491\u5F00\u3001\u4E0D\u6362\u884C\uFF1B\u6700\u540E\u4E00\u9897\u662F\u957F\u6587\u5B57\uFF0C\u82E5\u88AB\u538B\u6210 28px \u7AD6\u6392\u5C31\u662F\u53C8\u6DF7\u8FDB\u4E86\u56FE\u6807\u6309\u94AE\u7684\u5B9A\u5BBD\u89C4\u5219",
    feedbackModalHint: "\u81EA\u7ED8 overlay\uFF08\u4E0D\u7528 portal\uFF09\uFF1B\u70B9\u906E\u7F69 / Esc / \u2715 \u90FD\u80FD\u5173\u3002\u6807\u9898\u680F\u7684 \u2715 \u662F 24\xD724 \u56FE\u6807\u4F4D\uFF0C\u4E0D\u8BE5\u51FA\u73B0\u8FB9\u6846\u6216 120px \u5BBD\u7684\u5E95\u8272\u5757",
    feedbackToastHint: "\u547D\u4EE4\u5F0F showToast\uFF0C\u4E0D\u8981\u6C42\u6302\u7EC4\u4EF6",
    pickerHint: "\u5355\u9009 / \u591A\u9009 / \u4E0A\u9650 / \u641C\u7D22 / \u5206\u7EC4 / \u7A7A\u6001 / \u964D\u7EA7\u2014\u2014\u5168\u90E8\u53EF\u7528 props \u63A7\u5236",
    modelPickerHint: "flat \u4E00\u4E2A\u4E0B\u62C9 / cascade \u5148\u9009\u4F9B\u5E94\u5546\u518D\u9009\u6A21\u578B\u2014\u2014\u540C\u4E00\u4EFD\u6570\u636E\u4E24\u79CD\u5F62\u6001",
    workspacePickerHint: "\u6570\u636E\u8C03\u7528\u65B9\u7ED9\uFF08\u8981\u8DE8 host\u2194client \u8FB9\u754C\uFF0C\u7EC4\u4EF6\u53D6\u4E0D\u5230\uFF09",
    buttonHint: "10 \u6863\u5916\u89C2 \xD7 3 \u6863\u9AD8\u5EA6 \xD7 \u56FE\u6807 / \u72B6\u6001 / \u81EA\u5B9A\u4E49\u989C\u8272",
    btnTextTitle: "\u6309\u94AE\u6587\u6848\u4E0E\u8BED\u8A00",
    btnTextHint: "\u6587\u6848\u7531\u8C03\u7528\u65B9\u7ED9\uFF1A\u4E2D\u6587\u73AF\u5883\u51FA\u4E2D\u6587\u3001\u82F1\u6587\u73AF\u5883\u51FA\u82F1\u6587\uFF1B\u4E2D\u82F1\u5E76\u6392\u7684\u7EC4\u5408\u4E5F\u652F\u6301\uFF08\u6700\u53F3\u4E00\u9897\uFF09",
    btnVariantTitle: "\u5916\u89C2\u6863\uFF0810 \u6863\uFF09",
    btnVariantHint: "\u5B9E\u5FC3\uFF1Aprimary / secondary / danger / success / warning / info\uFF1B\u7EBF\u6846\uFF1Aoutline / danger-outline\uFF1B\u65E0\u5E95\uFF1Aghost / link",
    btnSizeTitle: "\u5C3A\u5BF8 / \u56FE\u6807 / block",
    btnSizeHint: "sm 24 \xB7 md 28 \xB7 lg 32 \u540C\u9AD8\uFF1Bicon \u6536\u7684\u662F ReactNode\u2014\u2014\u5B98\u65B9\u56FE\u6807\u7EC4\u4EF6\u3001\u81EA\u7ED8 SVG\u3001\u751A\u81F3\u4E00\u4E2A\u5B57\u7B26\u90FD\u884C\uFF0C\u4E0D\u662F\u540D\u5B57\u4E5F\u4E0D\u662F class\uFF08\u4E0B\u9762\u4E09\u9897\u5206\u522B\u662F\u8FD9\u4E09\u79CD\uFF09\uFF1BiconRight \u540E\u7F6E\u3001block \u6491\u6EE1\u7236\u5BBD",
    btnIconOnly: "icon only",
    tooltipTitle: "Tooltip\uFF08\u9F20\u6807\u60AC\u505C\u63D0\u793A\uFF09",
    tooltipHint: "\u5B98\u65B9 Tooltip\uFF1Aside \u4E0A / \u4E0B / \u53F3 \xD7 align \u5C45\u4E2D / \u8D34\u8FB9\uFF1B\u951A\u70B9\u53EF\u4EE5\u662F\u6309\u94AE\u6216\u4E00\u6BB5\u6587\u5B57\uFF1B\u957F\u6587\u672C\u6309 maxWidth \u81EA\u52A8\u6298\u884C\uFF1B\u6700\u53F3\u4E00\u9897\u662F\u300C\u540D\u5B57 + \u6B63\u6587\u300D\u4E24\u6BB5\u5F0F\u2014\u2014\u6587\u672C\u91CC\u7684 \n \u5C31\u662F\u771F\u5B9E\u6362\u884C",
    tooltipAnchorText: "\u6587\u5B57\u951A\u70B9",
    tooltipAnchorButton: "\u6309\u94AE\u951A\u70B9",
    tooltipLong: "\u957F\u6587\u672C\u6362\u884C",
    tooltipName: "\u5F20\u4E09\u4E30",
    tooltipRich: "\u5BCC\u5361\u7247",
    tooltipMultiline: "\u4E24\u6BB5\u5F0F",
    tooltipLongText: "\u8FD9\u662F\u4E00\u6BB5\u8DB3\u591F\u957F\u7684\u63D0\u793A\u6587\u5B57\uFF1A\u6C14\u6CE1\u9047\u5230 maxWidth \u4F1A\u81EA\u52A8\u6362\u884C\uFF0C\u800C\u4E0D\u4F1A\u4E00\u8DEF\u6491\u5230\u534A\u4E2A\u5C4F\u5E55\u5BBD\uFF0C anchored \u5143\u7D20\u5728\u8FB9\u7F18\u65F6\u5B98\u65B9\u8FD8\u4F1A\u81EA\u52A8\u628A\u6C14\u6CE1\u6536\u56DE\u89C6\u53E3\u5185\u3002",
    btnHintTitle: "\u95EE\u53F7\u63D0\u793A\uFF08FieldHint\uFF09",
    btnHintHint: "\u72EC\u7ACB\u7EC4\u4EF6\uFF0C\u653E\u54EA\u90FD\u884C\uFF1A\u6807\u9898\u540E / \u6309\u94AE\u540E / \u4E00\u6BB5\u6587\u5B57\u540E / \u8F93\u5165\u6846\u540E\uFF1B\u9F20\u6807\u60AC\u505C\u6216\u952E\u76D8\u805A\u7126\u6D6E\u51FA\u6C14\u6CE1",
    btnStateTitle: "\u72B6\u6001",
    btnStateHint: "disabled \u534A\u900F\u660E\u4E0D\u53EF\u70B9\uFF1Bloading \u524D\u7F6E\u540C\u8272\u5C0F\u5708\u5E76\u81EA\u52A8\u7981\u7528",
    btnColorTitle: "\u81EA\u5B9A\u4E49\u989C\u8272",
    btnColorHint: "color \u4F20\u4EFB\u610F CSS \u8272\u503C\uFF1A\u5B9E\u5FC3\u6863\u4F5C\u5E95\u8272\u3001\u7EBF\u6846\u4E0E\u6587\u5B57\u6863\u4F5C\u4E3B\u8272\uFF1Bhover / \u6309\u4E0B\u81EA\u52A8\u6309\u8BE5\u8272\u6DF7\u51FA",
    btnLabelSave: "\u4FDD\u5B58\u4FEE\u6539",
    btnLabelCancel: "\u53D6\u6D88",
    btnLabelDelete: "\u5220\u9664",
    btnLabelMixed: "\u4FDD\u5B58 Save",
    inputHint: "Input / PrefixedInput / NumberInput / Textarea\uFF0C\u90FD\u652F\u6301 error \u63CF\u7EA2\uFF1B\u884C\u5C3E\u53EF\u6302 FieldHint \u95EE\u53F7\u63D0\u793A",
    checkboxHint: "\u5916\u89C2\u5BF9\u9F50\u771F\u5B9E\u63D2\u4EF6\uFF1A\u7070\u5E95 inset\uFF08\u65E0\u5916\u63CF\u8FB9\uFF09\uFF1B\u5E26\u63CF\u8FB9\u7684 default \u4EC5\u4F9B\u7279\u6B8A\u573A\u5408\uFF08\u6700\u53F3\uFF0C\u53EF\u70B9\u7740\u73A9\uFF09\uFF1B\u661F\u671F\u65B9\u5757\u662F\u591A\u9009\u3002\u6587\u6848\u968F\u8BED\u8A00\u5207\u6362",
    segDay: "\u65E5",
    segWeek: "\u5468",
    segMonth: "\u6708",
    segAll: "\u5168\u90E8",
    segDoing: "\u8FDB\u884C\u4E2D",
    segClaimed: "\u5F85\u8BA4\u9886",
    segBlocked: "\u963B\u585E",
    segStalled: "\u505C\u6EDE",
    segPreview: "\u9884\u89C8",
    segSource: "\u6E90\u7801",
    weekday1: "\u4E00",
    weekday2: "\u4E8C",
    weekday3: "\u4E09",
    weekday4: "\u56DB",
    weekday5: "\u4E94",
    weekday6: "\u516D",
    weekday7: "\u65E5",
    designTokenHint: "\u989C\u8272\u5168\u90E8\u6765\u81EA design \u7684 token\uFF1B\u5207\u6362\u53F3\u4E0A\u89D2\u660E\u6697\uFF0C\u4E0B\u9762\u4F1A\u8DDF\u7740\u53D8",
    designInjectHint: "\u63A7\u4EF6\u6E32\u67D3\u524D\u8C03\u4E00\u6B21 setStyleKit + ensureControls\uFF0Ctoken \u4E0E\u63A7\u4EF6 CSS \u7531 kit \u6CE8\u5165 <head>",
    fieldHintDate: "\u4EFB\u52A1\u81EA\u8BE5\u65E5\u8D77\u5F00\u59CB\u6267\u884C\u3002\u53EF\u63D0\u524D\u521B\u5EFA\u4EFB\u52A1\uFF0C\u81F3\u8BE5\u65E5\u81EA\u52A8\u5F00\u8DD1\uFF1B\u300C\u6BCF N \u5468\u300D\u4EA6\u81EA\u8BE5\u65E5\u8D77\u7B97\u9996\u5468\u3002",
    loadingNote: "Loading \u662F\u8D34\u5230\u4E3B\u5BB9\u5668\u53F3\u4E0B\u89D2\u7684\u6307\u793A\u5668\uFF08anchorId \u9ED8\u8BA4 dshpc-main\uFF09\uFF0C\u6B64\u5904\u4E0D\u6E32\u67D3\u4EE5\u514D\u906E\u6321\u3002",
    secDesign: "\u8BBE\u8BA1\u57FA\u7840",
    secButtons: "\u6309\u94AE\u4E0E\u8F93\u5165",
    secPickers: "\u9009\u62E9\u5668",
    secFeedback: "\u5F39\u7A97\u4E0E\u53CD\u9988",
    secDisplay: "\u5361\u7247\u4E0E\u5C55\u793A",
    secUtils: "\u901A\u7528\u65B9\u6CD5",
    secExplorer: "\u5DE5\u4F5C\u533A\u6D4F\u89C8",
    secSession: "\u4F1A\u8BDD\u9884\u89C8",
    demoTokenPalette: "token \u8272\u677F",
    demoStyleInject: "\u6837\u5F0F\u6CE8\u5165\u673A\u5236",
    demoInputFamily: "Input \u5BB6\u65CF",
    demoUtilsTitle: "\u65E5\u671F / \u5B57\u7B26\u4E32 / \u5B57\u8282",
    demoCardTitle: "Card\uFF08\u5706\u89D2 + \u8FB9\u6846 + \u77ED\u8272\u6761\uFF09",
    demoStripTitle: "StripCard\uFF08\u65E0\u8FB9\u6846 + \u901A\u9AD8\u7AD6\u7EBF\uFF09",
    designInjectNote: "\u672C\u9884\u89C8\u63D2\u4EF6\u81EA\u5DF1\u5C31\u662F\u8FD9\u4E48\u505A\u521D\u59CB\u5316\u7684\u2014\u2014\u9884\u89C8\u4E0E\u771F\u5B9E\u63D2\u4EF6\u8D70\u540C\u4E00\u6761\u8DEF\u3002",
    pluginTitle: "\u7EC4\u4EF6\u9884\u89C8",
    pluginCardDesc: "\u6253\u5F00 dsh-plugin-core \u7684\u63A7\u4EF6\u4E0E\u4E1A\u52A1\u7EC4\u4EF6\u5C55\u793A\u9875",
    pluginCardOpen: "\u6253\u5F00 \u203A"
  },
  en: {
    sessionHint: "Three carriers: modal / sidebar / page; source is mocked; renderMessage can take over rich content",
    explorerHint: "Breadcrumb + directory tree + preview; workspaceFiles is mocked (a real plugin reads it from ctx and injects)",
    utilsHint: "No throw on parse failure \u2014 falls back gracefully and never fabricates; all functions are UI-free",
    displayCardHint: "Layout is entirely up to the caller \u2014 the real-plugin shape: title row + right-side meta + chips row; five accent tiers below",
    displayStripHint: "Same accent-bar mechanism, but full-height edge-to-edge \u2014 real-plugin shape: title + meta row + right-side time/actions",
    displayChipHint: "Chip has one pill skin only: width hugs the text, no wrap; the last one is long text \u2014 if squeezed into a 28px vertical stack, the icon-button fixed-width rule crept back in",
    feedbackModalHint: "Hand-rolled overlay (no portal); click backdrop / Esc / \u2715 all close it. The header \u2715 is a 24\xD724 icon slot \u2014 no border or 120px-wide color block should appear",
    feedbackToastHint: "Imperative showToast \u2014 no component mounting required",
    pickerHint: "Single / multi / max / search / grouped / empty / degraded \u2014 all driven by props",
    modelPickerHint: "flat: one dropdown / cascade: pick provider then model \u2014 same data, two shapes",
    workspacePickerHint: "Data is supplied by the caller (crosses the host\u2194client boundary; the component cannot fetch it)",
    buttonHint: "10 variants \xD7 3 sizes \xD7 icons / states / custom colors",
    btnTextTitle: "Button labels & language",
    btnTextHint: "Labels come from the caller: Chinese in zh, English in en; a mixed zh+en label is fine too (rightmost)",
    btnVariantTitle: "Variants (10)",
    btnVariantHint: "Solid: primary / secondary / danger / success / warning / info; outlined: outline / danger-outline; flat: ghost / link",
    btnSizeTitle: "Sizes / icons / block",
    btnSizeHint: "sm 24 \xB7 md 28 \xB7 lg 32, same height; icon takes any ReactNode \u2014 an official icon component, your own SVG, even a single character (not a name, not a class); iconRight trails, block fills the parent",
    btnIconOnly: "icon only",
    tooltipTitle: "Tooltip (hover hint)",
    tooltipHint: "Official Tooltip: side top / bottom / right x align center / end; anchor can be a button or a span of text; long labels wrap at maxWidth; the rightmost one is a two-part hint (name + body) where \n in the text is a real line break",
    tooltipAnchorText: "Text anchor",
    tooltipAnchorButton: "Button anchor",
    tooltipLong: "Long label",
    tooltipName: "Alex Chen",
    tooltipRich: "Rich card",
    tooltipMultiline: "Two-part",
    tooltipLongText: "A deliberately long hint: the bubble wraps at maxWidth instead of stretching to half the viewport, and the official layer pulls it back inside the viewport near the edges.",
    btnHintTitle: "Question-mark hint (FieldHint)",
    btnHintHint: "Standalone component, drop it anywhere: after a title, a button, a sentence, or an input; hover or keyboard-focus to reveal",
    btnStateTitle: "States",
    btnStateHint: "disabled is dimmed and unclickable; loading shows a same-color spinner and disables itself",
    btnColorTitle: "Custom colors",
    btnColorHint: "Pass any CSS color as color: solid variants use it as fill, outlined/text variants as the accent; hover/press are mixed from it",
    btnLabelSave: "Save changes",
    btnLabelCancel: "Cancel",
    btnLabelDelete: "Delete",
    btnLabelMixed: "Save \u4FDD\u5B58",
    inputHint: "Input / PrefixedInput / NumberInput / Textarea, all support error highlighting; a FieldHint question-mark tip can hang at the row end",
    checkboxHint: "Looks match the real plugin: grey inset background (no outer border); the bordered default (rightmost, clickable) is for special cases; the weekday squares are multi-select. Labels follow the locale",
    segDay: "Day",
    segWeek: "Week",
    segMonth: "Month",
    segAll: "All",
    segDoing: "Doing",
    segClaimed: "Open",
    segBlocked: "Blocked",
    segStalled: "Stalled",
    segPreview: "Render",
    segSource: "Source",
    weekday1: "Mo",
    weekday2: "Tu",
    weekday3: "We",
    weekday4: "Th",
    weekday5: "Fr",
    weekday6: "Sa",
    weekday7: "Su",
    designTokenHint: "All colors come from design tokens; switch light/dark at top-right and these update with it",
    designInjectHint: "Call setStyleKit + ensureControls once before controls render; the kit injects tokens and control CSS into <head>",
    fieldHintDate: 'The task runs starting from this date. You can create it ahead of time and it auto-starts on that day; "every N weeks" also counts its first week from this date.',
    loadingNote: "Loading is an indicator pinned to the bottom-right of the main container (anchorId defaults to dshpc-main); not rendered here to avoid covering content.",
    secDesign: "Design basics",
    secButtons: "Buttons & inputs",
    secPickers: "Pickers",
    secFeedback: "Modal & feedback",
    secDisplay: "Cards & display",
    secUtils: "Utilities",
    secExplorer: "Workspace browsing",
    secSession: "Session preview",
    demoTokenPalette: "Token palette",
    demoStyleInject: "Style injection",
    demoInputFamily: "Input family",
    demoUtilsTitle: "Date / String / Bytes",
    demoCardTitle: "Card (rounded + border + accent bar)",
    demoStripTitle: "StripCard (borderless + full-height stripe)",
    designInjectNote: "This preview plugin initializes itself exactly this way \u2014 preview and real plugin take the same path.",
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

// packages/demo/src/sections/design.tsx
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
function DesignSection() {
  return (0, import_react19.createElement)(
    "div",
    null,
    (0, import_react19.createElement)(
      Demo,
      { title: t2("demoTokenPalette"), hint: t2("designTokenHint") },
      (0, import_react19.createElement)(
        "div",
        { style: { display: "flex", flexWrap: "wrap", gap: "10px" } },
        TOKENS.map(
          (t3) => (0, import_react19.createElement)(
            "div",
            { key: t3.cssVar, style: { width: "104px" } },
            (0, import_react19.createElement)("div", {
              style: {
                height: "40px",
                borderRadius: "6px",
                background: `var(${t3.cssVar})`,
                border: "1px solid var(--dshpc-border-faint)"
              }
            }),
            (0, import_react19.createElement)("div", { style: { fontSize: "11px", marginTop: "4px" } }, t3.label),
            (0, import_react19.createElement)("div", { style: { fontSize: "10px", color: "var(--dshpc-fg-4)" } }, t3.cssVar)
          )
        )
      )
    ),
    (0, import_react19.createElement)(
      Demo,
      {
        title: t2("demoStyleInject"),
        hint: t2("designInjectHint"),
        code: `import { createStyleKit } from 'dsh-plugin-core/design'
import { ensureControls, setStyleKit } from 'dsh-plugin-core/ui'

setStyleKit(createStyleKit({ id: 'dsh-plugin-core-demo-ui' }))
ensureControls()`
      },
      (0, import_react19.createElement)(
        "div",
        { style: { color: "var(--dshpc-fg-3)", fontSize: "12px" } },
        t2("designInjectNote")
      )
    )
  );
}

// packages/demo/src/sections/buttons.tsx
var import_react20 = require("react");
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
  return found === void 0 ? null : (0, import_react20.createElement)(found.Icon, { size });
}
function StarSvg() {
  return (0, import_react20.createElement)(
    "svg",
    { width: 14, height: 14, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true },
    (0, import_react20.createElement)("path", {
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
  return (0, import_react20.createElement)(import_dsh_client_ui_primitives.Tooltip, props, (0, import_react20.createElement)("button", {
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
  return (0, import_react20.createElement)("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" } }, props.children);
}
function Labeled(props) {
  return (0, import_react20.createElement)(
    "div",
    { style: { display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" } },
    (0, import_react20.createElement)("span", { style: { width: "auto", minWidth: "64px", flex: "none", whiteSpace: "normal", color: "var(--dshpc-fg-3)", fontSize: "12px" } }, props.label),
    props.children
  );
}
function ButtonsSection() {
  const [text, setText] = (0, import_react20.useState)("");
  const [num, setNum] = (0, import_react20.useState)(3);
  const [checked, setChecked] = (0, import_react20.useState)(true);
  const [seg, setSeg] = (0, import_react20.useState)("week");
  const [filter, setFilter] = (0, import_react20.useState)("all");
  const [multi, setMulti] = (0, import_react20.useState)(["1"]);
  const [view, setView] = (0, import_react20.useState)("render");
  return (0, import_react20.createElement)(
    "div",
    null,
    // ── 文案与语言 ──────────────────────────────────────────────────────
    (0, import_react20.createElement)(
      Demo,
      { title: t2("btnTextTitle"), hint: t2("btnTextHint") },
      (0, import_react20.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "12px" } },
        (0, import_react20.createElement)(
          Labeled,
          { label: "locale" },
          (0, import_react20.createElement)(Button, { variant: "primary", icon: iconOf("check", ICON_SIZE.lg) }, t2("btnLabelSave")),
          (0, import_react20.createElement)(Button, { variant: "outline" }, t2("btnLabelCancel")),
          (0, import_react20.createElement)(Button, { variant: "danger", icon: iconOf("close", ICON_SIZE.lg) }, t2("btnLabelDelete"))
        ),
        (0, import_react20.createElement)(
          Labeled,
          { label: "en" },
          (0, import_react20.createElement)(Button, { variant: "primary" }, "Save"),
          (0, import_react20.createElement)(Button, { variant: "outline" }, "Cancel"),
          (0, import_react20.createElement)(Button, { variant: "ghost" }, "Learn more")
        ),
        (0, import_react20.createElement)(
          Labeled,
          { label: "zh" },
          (0, import_react20.createElement)(Button, { variant: "primary" }, "\u4FDD\u5B58"),
          (0, import_react20.createElement)(Button, { variant: "outline" }, "\u53D6\u6D88"),
          (0, import_react20.createElement)(Button, { variant: "ghost" }, "\u4E86\u89E3\u66F4\u591A")
        ),
        (0, import_react20.createElement)(
          Labeled,
          { label: "zh + en" },
          (0, import_react20.createElement)(Button, { variant: "primary", icon: iconOf("sparkle", ICON_SIZE.lg) }, t2("btnLabelMixed")),
          (0, import_react20.createElement)(Button, { variant: "outline" }, "\u590D\u5236 Copy"),
          (0, import_react20.createElement)(Button, { variant: "secondary" }, "\u91CD\u8BD5 Retry")
        )
      )
    ),
    // ── 10 档外观 ──────────────────────────────────────────────────────
    (0, import_react20.createElement)(
      Demo,
      { title: t2("btnVariantTitle"), hint: t2("btnVariantHint") },
      (0, import_react20.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "10px" } },
        (0, import_react20.createElement)(Row, null, VARIANTS.map((item) => (0, import_react20.createElement)(Button, { key: item.value, variant: item.value, icon: iconOf(item.icon, ICON_SIZE.lg) }, item.value))),
        (0, import_react20.createElement)(Row, null, VARIANTS.map((item) => (0, import_react20.createElement)(Button, { key: item.value, variant: item.value, size: "sm", icon: iconOf(item.icon, ICON_SIZE.sm) }, item.value)))
      )
    ),
    // ── 尺寸 / 图标位置 / block ─────────────────────────────────────────
    (0, import_react20.createElement)(
      Demo,
      { title: t2("btnSizeTitle"), hint: t2("btnSizeHint") },
      (0, import_react20.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "12px" } },
        (0, import_react20.createElement)(
          Labeled,
          { label: "size" },
          ["sm", "md", "lg"].map((size) => (0, import_react20.createElement)(Button, { key: size, size, variant: "outline", icon: iconOf("plus", ICON_SIZE[size]) }, size))
        ),
        // icon 收的是 ReactNode：官方图标组件 / 自绘 SVG / 一个字符，三种来源各一颗
        (0, import_react20.createElement)(
          Labeled,
          { label: "icon" },
          (0, import_react20.createElement)(Button, { variant: "primary", icon: iconOf("send", ICON_SIZE.lg) }, "\u5B98\u65B9\u56FE\u6807"),
          (0, import_react20.createElement)(Button, { variant: "outline", icon: (0, import_react20.createElement)(StarSvg, null) }, "\u81EA\u7ED8 SVG"),
          (0, import_react20.createElement)(Button, { variant: "ghost", icon: "+" }, "\u4E00\u4E2A\u5B57\u7B26")
        ),
        (0, import_react20.createElement)(
          Labeled,
          { label: "iconRight" },
          (0, import_react20.createElement)(Button, { variant: "outline", iconRight: iconOf("chevron", ICON_SIZE.lg) }, "\u66F4\u591A"),
          (0, import_react20.createElement)(Button, { variant: "primary" }, "\u4E0B\u4E00\u6B65")
        ),
        // block + 前置图标：文字要在视觉中心，不能整组内容居中（那样文字会被图标推右）
        (0, import_react20.createElement)(
          Labeled,
          { label: "block" },
          (0, import_react20.createElement)(
            "div",
            { style: { width: "260px" } },
            (0, import_react20.createElement)(Button, { variant: "primary", block: true, icon: iconOf("check", ICON_SIZE.lg) }, "\u6491\u6EE1\u7236\u5BBD"),
            (0, import_react20.createElement)("div", { style: { height: "8px" } }),
            (0, import_react20.createElement)(Button, { variant: "outline", block: true }, "\u65E0\u56FE\u6807\u5BF9\u7167")
          )
        ),
        (0, import_react20.createElement)(
          Labeled,
          { label: t2("btnIconOnly") },
          BUTTON_ICONS.slice(0, 6).map((item) => (0, import_react20.createElement)(IconButton, { key: item.name, icon: (0, import_react20.createElement)(item.Icon, { size: 16 }), label: item.name }))
        )
      )
    ),
    // ── Tooltip：官方悬停提示，side × align 全组合 + 双锚点类型 + 长文本换行 ──
    (0, import_react20.createElement)(
      Demo,
      { title: t2("tooltipTitle"), hint: t2("tooltipHint") },
      (0, import_react20.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "12px" } },
        (0, import_react20.createElement)(
          Labeled,
          { label: t2("tooltipAnchorButton") },
          tipAnchor("top \xB7 center", "top", "center"),
          tipAnchor("top \xB7 end", "top", "end"),
          tipAnchor("bottom \xB7 center", "bottom", "center"),
          tipAnchor("bottom \xB7 end", "bottom", "end"),
          tipAnchor("right", "right")
        ),
        (0, import_react20.createElement)(
          Labeled,
          { label: t2("tooltipAnchorText") },
          (0, import_react20.createElement)(
            import_dsh_client_ui_primitives.Tooltip,
            { label: t2("tooltipHint"), side: "top" },
            (0, import_react20.createElement)("span", {
              style: { borderBottom: "1px dashed var(--dshpc-border-strong)", cursor: "pointer", fontSize: "13px" }
            }, t2("tooltipAnchorText"))
          ),
          (0, import_react20.createElement)(
            import_dsh_client_ui_primitives.Tooltip,
            { label: t2("tooltipLongText"), side: "bottom", maxWidth: 240 },
            (0, import_react20.createElement)("span", {
              style: { borderBottom: "1px dashed var(--dshpc-border-strong)", cursor: "pointer", fontSize: "13px" }
            }, t2("tooltipLong"))
          )
        ),
        // 两段式：第一行名字（短）、\n 真实换行、第二行正文（长，受 maxWidth 折行）
        (0, import_react20.createElement)(
          Labeled,
          { label: t2("tooltipMultiline") },
          (0, import_react20.createElement)(
            import_dsh_client_ui_primitives.Tooltip,
            { label: `${t2("tooltipName")}
${t2("tooltipLongText")}`, side: "top", maxWidth: 260 },
            (0, import_react20.createElement)("span", {
              style: { borderBottom: "1px dashed var(--dshpc-border-strong)", cursor: "pointer", fontSize: "13px" }
            }, t2("tooltipName"))
          )
        ),
        // 富卡片：官方 HoverCard（宿主工作区列表那种「标题 + 正文」卡就是它）；content 收任意 ReactNode
        (0, import_react20.createElement)(
          Labeled,
          { label: t2("tooltipRich") },
          (0, import_react20.createElement)(import_dsh_client_ui_primitives.HoverCard, {
            variant: "compact",
            openDelayMs: 200,
            anchor: (0, import_react20.createElement)("span", {
              style: { borderBottom: "1px dashed var(--dshpc-border-strong)", cursor: "pointer", fontSize: "13px" }
            }, t2("tooltipName")),
            content: (0, import_react20.createElement)(
              "div",
              { style: { padding: "4px 2px", minWidth: "220px" } },
              (0, import_react20.createElement)("div", { style: { fontWeight: 600, fontSize: "14px", marginBottom: "4px" } }, t2("tooltipName")),
              (0, import_react20.createElement)("div", { style: { fontSize: "12px", lineHeight: 1.6, whiteSpace: "pre-line" } }, t2("tooltipLongText"))
            )
          })
        )
      )
    ),
    // ── 问号提示：证明它不属于 Input 家族，随处可挂 ──────────────────────
    (0, import_react20.createElement)(
      Demo,
      { title: t2("btnHintTitle"), hint: t2("btnHintHint") },
      (0, import_react20.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "10px" } },
        (0, import_react20.createElement)(
          Row,
          null,
          (0, import_react20.createElement)("b", { style: { fontSize: "13px" } }, "\u4E00\u4E2A\u6807\u9898"),
          (0, import_react20.createElement)(FieldHint, { text: "\u6302\u5728\u6807\u9898\u540E\u9762\uFF1A\u8BF4\u660E\u8FD9\u4E00\u5757\u662F\u5E72\u4EC0\u4E48\u7684\u3002" })
        ),
        (0, import_react20.createElement)(
          Row,
          null,
          (0, import_react20.createElement)(Button, { variant: "outline" }, "\u4E00\u4E2A\u6309\u94AE"),
          (0, import_react20.createElement)(FieldHint, { text: "\u6302\u5728\u6309\u94AE\u540E\u9762\uFF1A\u89E3\u91CA\u8FD9\u4E2A\u64CD\u4F5C\u4F1A\u53D1\u751F\u4EC0\u4E48\u3002" })
        ),
        (0, import_react20.createElement)(
          Row,
          null,
          (0, import_react20.createElement)("span", { style: { fontSize: "13px" } }, "\u4E00\u6BB5\u666E\u901A\u6587\u5B57"),
          (0, import_react20.createElement)(FieldHint, { text: "\u6302\u5728\u4EFB\u4F55\u6587\u5B57\u540E\u9762\u90FD\u884C\uFF0C\u5B83\u53EA\u662F\u4E00\u4E2A 14px \u7684\u5185\u8054\u5143\u7D20\u3002" })
        )
      )
    ),
    // ── 状态 ───────────────────────────────────────────────────────────
    (0, import_react20.createElement)(
      Demo,
      { title: t2("btnStateTitle"), hint: t2("btnStateHint") },
      (0, import_react20.createElement)(
        Row,
        null,
        (0, import_react20.createElement)(Button, { variant: "primary" }, "\u9ED8\u8BA4"),
        (0, import_react20.createElement)(Button, { variant: "primary", disabled: true }, "\u7981\u7528"),
        (0, import_react20.createElement)(Button, { variant: "danger", disabled: true, icon: iconOf("close", ICON_SIZE.lg) }, "\u7981\u7528"),
        (0, import_react20.createElement)(Button, { variant: "outline", loading: true }, "\u52A0\u8F7D\u4E2D"),
        (0, import_react20.createElement)(Button, { variant: "primary", loading: true, icon: iconOf("refresh", ICON_SIZE.lg) }, "\u63D0\u4EA4\u4E2D")
      )
    ),
    // ── 自定义颜色 ─────────────────────────────────────────────────────
    (0, import_react20.createElement)(
      Demo,
      { title: t2("btnColorTitle"), hint: t2("btnColorHint") },
      (0, import_react20.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "10px" } },
        (0, import_react20.createElement)(Row, null, CUSTOM_COLORS.map((color) => (0, import_react20.createElement)(Button, { key: color, variant: "primary", color, icon: iconOf("sparkle", ICON_SIZE.lg) }, color))),
        (0, import_react20.createElement)(Row, null, CUSTOM_COLORS.map((color) => (0, import_react20.createElement)(Button, { key: color, variant: "outline", color }, color)))
      )
    ),
    // ── Input 家族 ─────────────────────────────────────────────────────
    (0, import_react20.createElement)(
      Demo,
      { title: t2("demoInputFamily"), hint: t2("inputHint") },
      (0, import_react20.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "10px", maxWidth: "380px" } },
        (0, import_react20.createElement)(
          "div",
          { style: { display: "flex", alignItems: "center", gap: "6px" } },
          (0, import_react20.createElement)("span", { style: { color: "var(--dshpc-fg-2)", fontSize: "13px", flex: "none" } }, "\u5F00\u59CB\u65F6\u95F4"),
          (0, import_react20.createElement)(Input, { value: text, onChange: setText, placeholder: "\u9009\u62E9\u65E5\u671F" }),
          (0, import_react20.createElement)(FieldHint, { text: t2("fieldHintDate") })
        ),
        (0, import_react20.createElement)(Input, { value: "bad value", onChange: () => {
        }, error: true, placeholder: "\u6821\u9A8C\u5931\u8D25\u6001" }),
        (0, import_react20.createElement)(NumberInput, { value: num, onChange: setNum, min: 0, max: 10, suffix: "\u6B21" }),
        (0, import_react20.createElement)(Textarea, { value: text, onChange: setText, placeholder: "\u591A\u884C\u8F93\u5165" })
      )
    ),
    // ── Checkbox / Segmented ───────────────────────────────────────────
    (0, import_react20.createElement)(
      Demo,
      { title: "Checkbox / Segmented", hint: t2("checkboxHint") },
      (0, import_react20.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "14px", alignItems: "flex-start" } },
        (0, import_react20.createElement)(
          "div",
          { style: { display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" } },
          (0, import_react20.createElement)(Checkbox, { checked, onChange: setChecked, label: "\u542F\u7528" }),
          (0, import_react20.createElement)(Segmented, {
            variant: "inset",
            className: "dsh-tdt-seg dsh-tdt-seg--inset",
            items: [
              { value: "day", label: "\u65E5" },
              { value: "week", label: "\u5468" },
              { value: "month", label: "\u6708" }
            ],
            value: seg,
            onChange: setSeg
          }),
          (0, import_react20.createElement)(Segmented, {
            variant: "inset",
            size: "sm",
            className: "dsh-tdt-seg dsh-tdt-seg--inset",
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
        (0, import_react20.createElement)(Segmented, {
          variant: "inset",
          className: "dsh-tdt-seg dsh-tdt-seg--inset",
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
        (0, import_react20.createElement)(Segmented, {
          multiple: true,
          className: "dshpc-seg--weekday dsh-tdt-seg dsh-tdt-seg--weekday",
          label: "\u661F\u671F",
          items: [1, 2, 3, 4, 5, 6, 7].map((n) => ({
            value: String(n),
            label: t2(`weekday${n}`)
          })),
          value: multi,
          onChange: setMulti
        }),
        // default 变体（外描边）：预览顶栏切换这类小场景在用
        (0, import_react20.createElement)(Segmented, {
          size: "sm",
          variant: "default",
          className: "dsh-tdt-seg dsh-tdt-seg--default",
          label: "default \u5916\u89C2\u793A\u4F8B",
          items: [
            { value: "render", label: t2("segPreview") },
            { value: "source", label: t2("segSource") }
          ],
          value: view,
          onChange: setView
        })
      )
    )
  );
}

// packages/demo/src/sections/pickers.tsx
var import_react21 = require("react");
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
function PickersSection() {
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
    )
  );
}

// packages/demo/src/sections/feedback.tsx
var import_react22 = require("react");
function Boom() {
  throw new Error("\u6F14\u793A\uFF1A\u5B50\u7EC4\u4EF6\u629B\u9519\u88AB\u8FB9\u754C\u63A5\u4F4F");
}
function FeedbackSection() {
  const [open, setOpen] = (0, import_react22.useState)(false);
  const [boom, setBoom] = (0, import_react22.useState)(false);
  return (0, import_react22.createElement)(
    "div",
    null,
    (0, import_react22.createElement)(
      Demo,
      {
        title: "Modal",
        hint: t2("feedbackModalHint")
      },
      (0, import_react22.createElement)(
        "div",
        null,
        (0, import_react22.createElement)(Button, { onClick: () => setOpen(true) }, "\u6253\u5F00\u5F39\u7A97"),
        open ? (0, import_react22.createElement)(Modal, {
          title: "\u4EFB\u52A1\u8BE6\u60C5",
          onClose: () => setOpen(false),
          footer: (0, import_react22.createElement)(Button, { variant: "primary", onClick: () => setOpen(false) }, "\u77E5\u9053\u4E86")
        }, (0, import_react22.createElement)("div", null, "\u5F39\u7A97\u4E3B\u4F53\u5185\u5BB9\u2014\u2014\u4F1A\u8BDD\u9884\u89C8\u8FD9\u7C7B\u529F\u80FD\u5C31\u7528\u5B83\u6765\u627F\u8F7D\u3002")) : null
      )
    ),
    (0, import_react22.createElement)(
      Demo,
      { title: "toast", hint: t2("feedbackToastHint") },
      (0, import_react22.createElement)(
        "div",
        { style: { display: "flex", gap: "8px" } },
        (0, import_react22.createElement)(Button, { onClick: () => showToast("\u5DF2\u4FDD\u5B58") }, "\u666E\u901A"),
        (0, import_react22.createElement)(Button, { onClick: () => showToast("\u4FDD\u5B58\u6210\u529F", { variant: "success" }) }, "\u6210\u529F"),
        (0, import_react22.createElement)(Button, { onClick: () => showToast("\u4FDD\u5B58\u5931\u8D25", { variant: "error" }) }, "\u5931\u8D25")
      )
    ),
    (0, import_react22.createElement)(
      Demo,
      { title: "Loading / EmptyState / ErrorBoundary" },
      (0, import_react22.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "12px" } },
        (0, import_react22.createElement)(EmptyState, { text: "\u6682\u65E0\u6570\u636E" }),
        (0, import_react22.createElement)(
          "div",
          { style: { border: "1px solid var(--dshpc-border-faint)", borderRadius: "8px", padding: "10px" } },
          boom ? (0, import_react22.createElement)(ErrorBoundary, null, (0, import_react22.createElement)(Boom, null)) : (0, import_react22.createElement)(Button, { variant: "danger", onClick: () => setBoom(true) }, "\u70B9\u6211\u629B\u9519\uFF08\u770B\u8FB9\u754C\u515C\u5E95\uFF09")
        ),
        (0, import_react22.createElement)(
          "div",
          { style: { color: "var(--dshpc-fg-3)", fontSize: "12px" } },
          t2("loadingNote")
        )
      )
    )
  );
}

// packages/demo/src/sections/display.tsx
var import_react23 = require("react");
function DisplaySection() {
  const [open, setOpen] = (0, import_react23.useState)(false);
  return (0, import_react23.createElement)(
    "div",
    null,
    (0, import_react23.createElement)(
      Demo,
      { title: t2("demoCardTitle"), hint: t2("displayCardHint") },
      (0, import_react23.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "10px", maxWidth: "640px" } },
        // 真实形态示例（任务卡同款排版）
        (0, import_react23.createElement)(
          Card,
          { accent: "business" },
          (0, import_react23.createElement)(
            "div",
            { style: { display: "flex", alignItems: "baseline", gap: "8px" } },
            (0, import_react23.createElement)(
              "div",
              { style: { fontWeight: 600, flex: "1 1 auto", minWidth: 0, fontSize: "var(--dshpc-font-md)" } },
              "\u5C06 OpenSSH \u4E0A\u6240\u6709 NPM \u5B89\u88C5\u8FC1\u79FB\u5230 PNPM"
            ),
            (0, import_react23.createElement)("div", { style: { color: "var(--dshpc-fg-3)", fontSize: "var(--dshpc-font-xs)", flex: "none" } }, "2026-10-18 \u521B\u5EFA")
          ),
          (0, import_react23.createElement)(
            "div",
            { style: { display: "flex", alignItems: "center", gap: "6px", marginTop: "6px", flexWrap: "wrap" } },
            (0, import_react23.createElement)(Chip, null, "NAS-Docker"),
            (0, import_react23.createElement)(Chip, null, "#npm"),
            (0, import_react23.createElement)(Chip, null, "#pnpm"),
            (0, import_react23.createElement)(Chip, null, "#OpenSSH"),
            (0, import_react23.createElement)(Chip, null, "#\u8FC1\u79FB")
          )
        ),
        // accent 速览：单行紧凑卡，只看色条档位
        (0, import_react23.createElement)(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" } },
          ["business", "success", "warning", "danger", "neutral"].map(
            (a) => (0, import_react23.createElement)(
              Card,
              { key: a, accent: a, style: { padding: "8px 12px" } },
              (0, import_react23.createElement)("div", { style: { fontSize: "var(--dshpc-font-sm)", color: "var(--dshpc-fg-2)" } }, `accent="${a}"`)
            )
          )
        )
      )
    ),
    (0, import_react23.createElement)(
      Demo,
      { title: t2("demoStripTitle"), hint: t2("displayStripHint") },
      (0, import_react23.createElement)(
        "div",
        { style: { maxWidth: "640px", background: "var(--dshpc-surface-sunken)", borderRadius: "8px", overflow: "hidden" } },
        (0, import_react23.createElement)(
          StripCard,
          {
            accent: "business",
            action: (0, import_react23.createElement)("span", { style: { color: "var(--dshpc-fg-3)", fontSize: "var(--dshpc-font-xs)", flex: "none" } }, "2026-10-18 \u5F00\u59CB \xB7 \u4ECA\u5929")
          },
          (0, import_react23.createElement)("div", { style: { fontWeight: 600, fontSize: "var(--dshpc-font-md)" } }, "DAY:1 - Docker \u955C\u50CF\u7248\u672C\u68C0\u67E5\u5668"),
          (0, import_react23.createElement)(
            "div",
            { style: { display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", flexWrap: "wrap" } },
            (0, import_react23.createElement)(Chip, null, "NAS-Docker"),
            (0, import_react23.createElement)(
              "span",
              { style: { color: "var(--dshpc-fg-3)", fontSize: "var(--dshpc-font-xs)" } },
              "\u8BA1\u5212 02:00 \xB7 \u5B9E\u9645 02:00 \xB7 \u65F6\u957F 04:02 \xB7 2.4M"
            )
          )
        ),
        (0, import_react23.createElement)(
          StripCard,
          { accent: "success" },
          (0, import_react23.createElement)("div", { style: { fontWeight: 600, fontSize: "var(--dshpc-font-md)" } }, "\u6267\u884C\u6210\u529F"),
          (0, import_react23.createElement)("div", { style: { color: "var(--dshpc-fg-3)", fontSize: "var(--dshpc-font-xs)", marginTop: "4px" } }, "\u8017\u65F6 12s \xB7 3 \u4E2A\u6587\u4EF6\u53D8\u66F4")
        ),
        (0, import_react23.createElement)(
          StripCard,
          {
            accent: "warning",
            expanded: open,
            onToggle: () => setOpen(!open),
            action: (0, import_react23.createElement)(Button, { size: "sm", variant: "ghost" }, "\u67E5\u770B\u4F1A\u8BDD"),
            panel: (0, import_react23.createElement)("div", { style: { fontSize: "12px", color: "var(--dshpc-fg-3)" } }, "\u5C55\u5F00\u540E\u7684\u8BE6\u60C5\u9762\u677F")
          },
          (0, import_react23.createElement)("div", { style: { fontWeight: 600, fontSize: "var(--dshpc-font-md)" } }, "\u6709\u8B66\u544A\uFF08\u53EF\u6298\u53E0\uFF0C\u70B9\u53F3\u4FA7\u7BAD\u5934\uFF09"),
          (0, import_react23.createElement)("div", { style: { color: "var(--dshpc-fg-3)", fontSize: "var(--dshpc-font-xs)", marginTop: "4px" } }, "\u8017\u65F6 8s \xB7 1 \u4E2A\u8B66\u544A")
        )
      )
    ),
    (0, import_react23.createElement)(
      Demo,
      {
        title: "Chip / SectionHead / MarqueeText / LiveText",
        hint: t2("displayChipHint")
      },
      (0, import_react23.createElement)(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "12px" } },
        (0, import_react23.createElement)(
          "div",
          { style: { display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" } },
          (0, import_react23.createElement)(Chip, null, "#npm"),
          (0, import_react23.createElement)(Chip, null, "#\u6784\u5EFA"),
          (0, import_react23.createElement)(Chip, { onClick: () => showToast("\u70B9\u4E86 chip") }, "#\u53EF\u70B9"),
          (0, import_react23.createElement)(Chip, null, "\u4E00\u6574\u6BB5\u6BD4\u8F83\u957F\u7684\u6807\u7B7E\u6587\u5B57\uFF0C\u5BBD\u5EA6\u5E94\u8BE5\u8DDF\u7740\u6587\u5B57\u8D70")
        ),
        (0, import_react23.createElement)(SectionHead, { icon: "\u25B8", title: "\u5206\u533A\u6807\u9898", right: (0, import_react23.createElement)(Button, { size: "sm" }, "\u64CD\u4F5C") }),
        (0, import_react23.createElement)(
          "div",
          { style: { maxWidth: "200px" } },
          (0, import_react23.createElement)(MarqueeText, { text: "\u8FD9\u662F\u4E00\u6BB5\u5F88\u957F\u7684\u6587\u5B57\uFF0C\u653E\u4E0D\u4E0B\u65F6 hover \u4F1A\u6EDA\u52A8\u5C55\u793A\u5168\u540D" })
        ),
        (0, import_react23.createElement)(LiveText, { render: (nowMs) => new Date(nowMs).toLocaleTimeString() })
      )
    )
  );
}

// packages/demo/src/sections/utils.tsx
var import_react24 = require("react");
var NOW = Date.parse("2026-10-18T12:00:00.000Z");
var ROWS = [
  ["formatDateTime", formatDateTime("2026-10-18T09:30:05.000Z", { seconds: true }), "2026-10-18 09:30:05"],
  ["formatYmd", formatYmd("2026-10-18T09:30:05.000Z"), "2026-10-18"],
  ["formatClock", formatClock("2026-10-18T09:30:05.000Z"), "09:30:05"],
  ["formatDurationHms", formatDurationHms(3725e3), "1:02:05"],
  ["formatRange", formatRange("2026-10-18T09:00:00.000Z", "2026-10-18T10:30:00.000Z"), "\u540C\u5929\u533A\u95F4"],
  ["relativePast", relativePast("2026-10-18T11:57:00.000Z", NOW), "3 \u5206\u949F\u524D"],
  ["relativeFuture", relativeFuture("2026-10-18T12:03:00.000Z", NOW), "3 \u5206\u949F\u540E"],
  ["formatBytes", formatBytes(125829), "123 KB"]
];
function UtilsSection() {
  return (0, import_react24.createElement)(
    Demo,
    { title: t2("demoUtilsTitle"), hint: t2("utilsHint") },
    (0, import_react24.createElement)(
      "table",
      { style: { borderCollapse: "collapse", fontSize: "13px" } },
      (0, import_react24.createElement)(
        "thead",
        null,
        (0, import_react24.createElement)(
          "tr",
          null,
          (0, import_react24.createElement)("th", { style: th }, "\u51FD\u6570"),
          (0, import_react24.createElement)("th", { style: th }, "\u8FD4\u56DE\u503C")
        )
      ),
      (0, import_react24.createElement)(
        "tbody",
        null,
        ROWS.map(
          ([fn, out]) => (0, import_react24.createElement)(
            "tr",
            { key: fn },
            (0, import_react24.createElement)("td", { style: td }, fn),
            (0, import_react24.createElement)("td", { style: td }, out)
          )
        )
      )
    )
  );
}
var th = { textAlign: "left", padding: "6px 14px 6px 0", color: "var(--dshpc-fg-3)" };
var td = { padding: "5px 14px 5px 0", borderTop: "1px solid var(--dshpc-border-faint)" };

// packages/demo/src/sections/explorer.tsx
var import_react27 = require("react");

// dist/explorer/ExplorerPanel.js
var import_react26 = require("react");

// dist/explorer/preview/index.js
var import_react25 = require("react");

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
  const [text, setText] = (0, import_react25.useState)(null);
  const [imageUrl, setImageUrl] = (0, import_react25.useState)(null);
  const [failed, setFailed] = (0, import_react25.useState)(false);
  (0, import_react25.useEffect)(() => {
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
    return (0, import_react25.createElement)(EmptyState, { text: tt("explorerUnsupported"), translate: tt });
  }
  if (failed)
    return (0, import_react25.createElement)(EmptyState, { text: tt("explorerFailed"), translate: tt });
  if (kind === "image") {
    return imageUrl === null ? (0, import_react25.createElement)("div", { className: "dshpc-exp__note" }, tt("explorerLoading")) : (0, import_react25.createElement)("img", { className: "dshpc-exp__image", src: imageUrl, alt: props.path });
  }
  return text === null ? (0, import_react25.createElement)("div", { className: "dshpc-exp__note" }, tt("explorerLoading")) : (0, import_react25.createElement)("pre", { className: "dshpc-exp__text" }, text);
}

// dist/explorer/ExplorerPanel.js
function ExplorerPanel(props) {
  ensureControls();
  const tt = props.translate ?? t;
  const [dir, setDir] = (0, import_react26.useState)(props.path ?? "");
  const [entries, setEntries] = (0, import_react26.useState)([]);
  const [truncated, setTruncated] = (0, import_react26.useState)(false);
  const [loading, setLoading] = (0, import_react26.useState)(true);
  const [failed, setFailed] = (0, import_react26.useState)(false);
  const [selected, setSelected] = (0, import_react26.useState)(null);
  const [nonce, setNonce] = (0, import_react26.useState)(0);
  (0, import_react26.useEffect)(() => {
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
  const crumbBar = (0, import_react26.createElement)("div", { className: "dshpc-exp__crumbs" }, (0, import_react26.createElement)("button", { type: "button", className: "dshpc-exp__crumb", onClick: () => goto("") }, tt("explorerRoot")), crumbs.map((c, i) => {
    const isLast = i === crumbs.length - 1;
    const upto = crumbs.slice(0, i + 1).join("/");
    return (0, import_react26.createElement)("span", { key: upto }, (0, import_react26.createElement)("span", { className: "dshpc-exp__sep" }, " / "), (0, import_react26.createElement)("button", {
      type: "button",
      className: `dshpc-exp__crumb${isLast ? " dshpc-exp__crumb--current" : ""}`,
      onClick: () => goto(upto)
    }, c));
  }), (0, import_react26.createElement)("span", { className: "dshpc-exp__tools" }, (0, import_react26.createElement)("button", {
    type: "button",
    className: "dshpc-exp__crumb",
    disabled: dir === "",
    onClick: () => goto(parentOf(dir))
  }, tt("explorerUp")), (0, import_react26.createElement)("button", { type: "button", className: "dshpc-exp__crumb", onClick: () => setNonce(nonce + 1) }, tt("explorerRefresh"))));
  const tree = loading ? (0, import_react26.createElement)("div", { className: "dshpc-exp__note" }, tt("explorerLoading")) : failed ? (0, import_react26.createElement)(EmptyState, { text: tt("explorerFailed"), translate: tt }) : entries.length === 0 ? (0, import_react26.createElement)("div", { className: "dshpc-exp__note" }, props.emptyText ?? tt("explorerEmptyDir")) : (0, import_react26.createElement)("div", { className: "dshpc-exp__tree" }, [...entries].sort((a, b) => {
    if (a.type !== b.type)
      return a.type === "directory" ? -1 : 1;
    return a.name.localeCompare(b.name);
  }).map((e) => {
    const full = joinPath(dir, e.name);
    const isDir = e.type === "directory";
    return (0, import_react26.createElement)("div", {
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
    }, (0, import_react26.createElement)("span", { className: "dshpc-exp__icon" }, isDir ? "\u25B8" : "\xB7"), (0, import_react26.createElement)("span", { className: "dshpc-exp__name" }, e.name), e.size === void 0 ? null : (0, import_react26.createElement)("span", { className: "dshpc-exp__size" }, formatBytes(e.size)));
  }), truncated ? (0, import_react26.createElement)("div", { className: "dshpc-exp__note" }, tt("explorerTruncated")) : null);
  return (0, import_react26.createElement)("div", { className: "dshpc-exp" }, crumbBar, (0, import_react26.createElement)("div", { className: "dshpc-exp__body" }, tree, (0, import_react26.createElement)("div", { className: "dshpc-exp__preview" }, selected === null ? null : (0, import_react26.createElement)(FilePreview, {
    workspaceFiles: props.workspaceFiles,
    sessionId: props.sessionId,
    path: selected,
    translate: tt
  }))));
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

// packages/demo/src/sections/explorer.tsx
function ExplorerSection() {
  const [selected, setSelected] = (0, import_react27.useState)(null);
  return (0, import_react27.createElement)(
    Demo,
    {
      title: "ExplorerPanel",
      hint: t2("explorerHint")
    },
    (0, import_react27.createElement)(
      "div",
      { style: { display: "flex", gap: "16px", flexWrap: "wrap" } },
      (0, import_react27.createElement)(
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
        (0, import_react27.createElement)(ExplorerPanel, {
          workspaceFiles: mockWorkspaceFiles,
          sessionId: "demo-session",
          path: "",
          onSelect: setSelected
        })
      ),
      (0, import_react27.createElement)(
        "div",
        { style: { fontSize: "12px", color: "var(--dshpc-fg-3)", alignSelf: "center" } },
        selected === null ? "\u70B9\u5DE6\u4FA7\u6587\u4EF6\u8BD5\u8BD5" : `\u5DF2\u9009\u4E2D\uFF1A${selected}`
      )
    )
  );
}

// packages/demo/src/sections/session.tsx
var import_react29 = require("react");

// dist/session/index.js
var import_react28 = require("react");

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
  const [messages, setMessages] = (0, import_react28.useState)([]);
  const [loading, setLoading] = (0, import_react28.useState)(true);
  const [failed, setFailed] = (0, import_react28.useState)(false);
  const [nonce, setNonce] = (0, import_react28.useState)(0);
  (0, import_react28.useEffect)(() => {
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
  const body = loading ? (0, import_react28.createElement)("div", { className: "dshpc-ses__note" }, tt("sessionLoading")) : failed ? (0, import_react28.createElement)(EmptyState, {
    text: tt("sessionFailed"),
    translate: tt,
    action: (0, import_react28.createElement)("button", { type: "button", className: "dshpc-error__retry", onClick: () => setNonce(nonce + 1) }, tt("errorRetry"))
  }) : messages.length === 0 ? (0, import_react28.createElement)(EmptyState, { text: tt("sessionEmpty"), translate: tt }) : (0, import_react28.createElement)("div", { className: "dshpc-ses__list" }, messages.map((m) => props.renderMessage !== void 0 ? (0, import_react28.createElement)("div", { key: m.id }, props.renderMessage(m)) : (0, import_react28.createElement)("div", { key: m.id, className: `dshpc-ses__msg dshpc-ses__msg--${m.role}` }, (0, import_react28.createElement)("div", { className: "dshpc-ses__head" }, tt(ROLE_LABEL_KEY[m.role])), (0, import_react28.createElement)("pre", { className: "dshpc-ses__text" }, m.text), (m.attachments ?? []).length === 0 ? null : (0, import_react28.createElement)("div", { className: "dshpc-ses__atts" }, (m.attachments ?? []).map((a) => (0, import_react28.createElement)("button", {
    key: a.path,
    type: "button",
    className: "dshpc-ses__att",
    onClick: () => props.onOpenFile?.(a.path)
  }, a.name, a.bytes === void 0 ? null : ` ${formatBytes(a.bytes)}`))))));
  if (variant === "modal") {
    return (0, import_react28.createElement)(Modal, {
      title: props.title ?? props.sessionId,
      onClose: props.onClose,
      children: (0, import_react28.createElement)("div", { className: "dshpc-ses", style: { minWidth: "min(720px, 88vw)" } }, body)
    });
  }
  return (0, import_react28.createElement)("div", { className: `dshpc-ses dshpc-ses--${variant}` }, props.onClose === void 0 ? null : (0, import_react28.createElement)("div", { className: "dshpc-ses__head" }, (0, import_react28.createElement)("button", { type: "button", className: "dshpc-exp__crumb", onClick: props.onClose }, "\u2715")), body);
}

// packages/demo/src/sections/session.tsx
function SessionSection() {
  const [open, setOpen] = (0, import_react29.useState)(false);
  return (0, import_react29.createElement)(
    Demo,
    {
      title: "SessionPreview",
      hint: t2("sessionHint")
    },
    (0, import_react29.createElement)(
      "div",
      { style: { display: "flex", gap: "12px", flexWrap: "wrap" } },
      (0, import_react29.createElement)(Button, { variant: "primary", onClick: () => setOpen(true) }, "\u6253\u5F00\u4F1A\u8BDD\u9884\u89C8\uFF08modal\uFF09"),
      (0, import_react29.createElement)(Button, { onClick: () => setOpen(false) }, "\u5173\u95ED")
    ),
    open ? (0, import_react29.createElement)(Modalish, null) : null
  );
  function Modalish() {
    return (0, import_react29.createElement)(SessionPreview, {
      sessionId: "demo-session",
      source: mockSessionSource,
      variant: "modal",
      title: "\u4F1A\u8BDD\u9884\u89C8\uFF08\u5047\u6570\u636E\uFF09",
      onClose: () => setOpen(false),
      onOpenFile: (path) => setOpen(false)
    });
  }
}

// packages/demo/src/sections/index.tsx
function Demo(props) {
  return (0, import_react30.createElement)(
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
    (0, import_react30.createElement)("h3", { style: { margin: "0 0 2px", fontSize: "15px" } }, props.title),
    props.hint === void 0 ? null : (0, import_react30.createElement)("div", { style: { color: "var(--dshpc-fg-3)", fontSize: "12px", marginBottom: "12px" } }, props.hint),
    (0, import_react30.createElement)("div", { style: { marginBottom: props.code === void 0 ? 0 : "12px" } }, props.children ?? null),
    props.code === void 0 ? null : (0, import_react30.createElement)(
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
function SectionHead2(props) {
  return (0, import_react30.createElement)(
    "div",
    { id: `sec-${props.id}`, style: { margin: "28px 0 14px" } },
    (0, import_react30.createElement)("h2", { style: { margin: 0, fontSize: "20px" } }, props.title),
    (0, import_react30.createElement)("div", { style: { height: "3px", width: "36px", background: "var(--dshpc-business)", borderRadius: "2px", marginTop: "6px" } })
  );
}
var ALL_SECTIONS = [
  { id: "design", titleKey: "secDesign", render: () => (0, import_react30.createElement)(DesignSection, null) },
  { id: "buttons", titleKey: "secButtons", render: () => (0, import_react30.createElement)(ButtonsSection, null) },
  { id: "pickers", titleKey: "secPickers", render: () => (0, import_react30.createElement)(PickersSection, null) },
  { id: "feedback", titleKey: "secFeedback", render: () => (0, import_react30.createElement)(FeedbackSection, null) },
  { id: "display", titleKey: "secDisplay", render: () => (0, import_react30.createElement)(DisplaySection, null) },
  { id: "utils", titleKey: "secUtils", render: () => (0, import_react30.createElement)(UtilsSection, null) },
  { id: "explorer", titleKey: "secExplorer", render: () => (0, import_react30.createElement)(ExplorerSection, null) },
  { id: "session", titleKey: "secSession", render: () => (0, import_react30.createElement)(SessionSection, null) }
];
function Sections(props) {
  const current3 = ALL_SECTIONS.find((s) => s.id === props.active) ?? ALL_SECTIONS[0];
  return (0, import_react30.createElement)(
    "div",
    null,
    (0, import_react30.createElement)(SectionHead2, { id: current3.id, title: t2(current3.titleKey) }),
    current3.render()
  );
}

// packages/demo/src/legacy-tdt.ts
var LEGACY_TDT_TOKENS_CSS = `
/* \u2500\u2500 \u6587\u5B57\uFF08\u5BBF\u4E3B label \u56DB\u6863 + \u53CD\u8272\u9762\u7528\u5B57\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
body{
  --tdt-fg:var(--dsw-alias-label-primary,#1f2328);
  --tdt-fg-2:var(--dsw-alias-label-secondary,#5c6370);
  --tdt-fg-3:var(--dsw-alias-label-tertiary,#767d87);
  --tdt-fg-4:var(--dsw-alias-label-caption,#9aa1ab);
  --tdt-fg-dim:var(--dsw-alias-label-dimmed,#b9bfc7);
  /* \u53CD\u8272\u9762\u4E0A\u7684\u5B57\uFF08\u5B9E\u5FC3\u94AE / \u89D2\u6807\uFF09\uFF1A\u6697\u8272\u4E0B\u662F bluish-1000\uFF0C\u6545\u7528 -foreground \u800C\u975E -inverted */
  --tdt-fg-inverse:var(--dsw-alias-label-primary-foreground,#fff);

  /* \u2500\u2500 \u9762\uFF08\u5BBF\u4E3B bg-layer \u4E09\u6863 + \u4E0B\u6C89\u8F68\u9053\u5E95\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  --tdt-surface-1:var(--dsw-alias-bg-layer-1,#fff);
  --tdt-surface-2:var(--dsw-alias-bg-layer-2,#fff);
  --tdt-surface-3:var(--dsw-alias-bg-layer-3,#fff);
  /* \u300C\u9009\u4E2D\u4EAE\u7247\u300D\u7684\u5E95\u76D8\u8272\uFF08\u914D --tdt-shadow-raised \u7528\uFF09 */
  --tdt-surface-raised:var(--dsw-alias-bg-layer-1,#fff);
  /* \u8F68\u9053 / \u4E0B\u6C89\u5E95\uFF08\u5B98\u65B9\u5206\u6BB5\u63A7\u4EF6\u8F68\u9053\u7528\u7684\u5C31\u662F\u8FD9\u6761\uFF09 */
  --tdt-surface-sunken:var(--dsw-alias-interactive-bg-hover,rgba(38,49,72,.06));
  /* \u6574\u9875 / \u7F16\u8F91\u5668\u5E95\uFF08bg-base\uFF09 */
  --tdt-surface-base:var(--dsw-alias-bg-base,#fff);
  /* \u81EA\u7ED8\u6D6E\u5C42 / \u83DC\u5355\u5361\u7684\u4E0D\u900F\u660E\u5E95\uFF08= base\uFF1B\u4E0D\u8981\u7528\u534A\u900F\u660E\u7684 specific-menu\uFF09 */
  --tdt-surface-menu:var(--tdt-surface-base);
  /* markdown \u4EE3\u7801\u5757\u9762 / \u5B57\u4F53\uFF08\u4F1A\u8BDD\u955C\u50CF\u91CC\u7528\u5230\uFF09 */
  --tdt-code-surface:var(--dsw-alias-markdown-code-block,rgba(128,128,128,.10));
  --tdt-code-font:var(--dsw-font-markdown-code-block-small,12px/18px var(--ds-font-family-code,monospace));
  /* \u8B66\u544A\u6587\u5B57\u8272\uFF08\u5BBF\u4E3B state-warn-label\uFF09 */
  --tdt-warning-label:var(--dsw-alias-state-warn-label,#f5a623);
  /* \u56FA\u5B9A\u4E2D\u6027\u5B9E\u9762\uFF08\u81EA\u7ED8\u6D6E\u5C42\u3001\u6DF1\u8272\u4E3B\u9898\u4E0B\u5FC5\u987B\u81EA\u5DF1\u53D8\u7684\u90A3\u51E0\u4E2A\uFF09\u2014\u2014\u53EA\u6709\u5B83\u9700\u8981\u6697\u8272\u8986\u76D6 */
  --tdt-solid:var(--dsw-static-neutral-00,#fff);
  --tdt-on-solid:var(--dsw-alias-label-primary,#1f2328);
  /* \u4EA4\u4ED8\u6587\u4EF6\u5361\u90A3\u79CD\u300C\u6D45\u5E95\u76D8 + hover \u52A0\u6DF1\u300D\u4E24\u62CD */
  --tdt-plate:var(--dsw-static-neutral-50,#fafafa);
  --tdt-plate-hover:var(--dsw-static-neutral-100,#f5f5f5);
  /* \u65E7\u5185\u6838\u56DE\u9000\uFF08Chrome <111 \u4E0D\u8BA4 color-mix \u21D2 \u8FD9\u6761\u751F\u6548\uFF1B\u65B0\u5185\u6838\u88AB\u4E0B\u9762\u90A3\u6761\u8986\u76D6\uFF09\u3002
     \u8FD9\u51E0\u4E2A\u662F**\u56FA\u5B9A\u4E2D\u6027\u9762**\u3001\u4E0D\u9760\u8DDF\u968F\u5BBF\u4E3B\u4E3B\u9898\u8272\uFF0C\u6545\u53EF\u4EE5\u65E0\u635F\u5730\u7ED9\u660E\u6587\u56DE\u9000\u3002 */
  --tdt-icon-plate:rgba(255,255,255,.5);
  --tdt-icon-plate:color-mix(in srgb,var(--dsw-static-neutral-00,#fff) 50%,transparent);
  /* \u8868\u5934\u5E95\uFF1A\u6D45\u8272\u4E3B\u9898**\u504F\u6DF1**\uFF0C\u4E14\u5FC5\u987B**\u6BD4\u6591\u9A6C\u7EB9\uFF08--tdt-plate\uFF09\u518D\u6DF1\u4E00\u6863**\u2014\u2014
     \u4E24\u8005\u4E0D\u80FD\u649E\u8272\uFF08\u7528\u6237 2026-10-02\uFF1A\u8868\u5934\u8DDF\u6591\u9A6C\u7EB9\u4E00\u6A21\u4E00\u6837\uFF09\u3002 */
  --tdt-head-bg:var(--dsw-static-neutral-100,#f5f5f5);
  /* \u56FE\u6807\u5C0F\u5E95\u677F\uFF08\u4EA7\u51FA\u7269\uFF09\uFF1A\u6D45\u8272\u4E0B\u8981**\u770B\u5F97\u89C1**\uFF08\u539F\u5148\u53D6 plate \u21D2 \u5728\u767D\u5E95\u4E0A\u7B49\u4E8E\u6CA1\u6709\uFF09\uFF1Bhover \u52A0\u500D\u3002 */
  --tdt-chip-bg:rgba(15,15,15,.07);
  --tdt-chip-bg:color-mix(in srgb,var(--dsw-static-neutral-900,#0f0f0f) 7%,transparent);
  --tdt-chip-bg-hover:rgba(15,15,15,.14);
  --tdt-chip-bg-hover:color-mix(in srgb,var(--dsw-static-neutral-900,#0f0f0f) 14%,transparent);
  /* \u5C55\u5F00\u884C\uFF1A**\u5E26\u900F\u660E\u5EA6\u7684\u84DD**\u2014\u2014\u4E0D\u662F\u7070\u3001\u4E5F\u4E0D\u662F\u7EAF\u8272\uFF0C\u900F\u51FA\u5361\u7247\u5E95\u8272\uFF0C\u4E00\u773C\u770B\u51FA\u300C\u8FD9\u662F\u5C55\u5F00\u7684\u300D
     \uFF08\u7528\u6237 2026-10-02\uFF1A\u7070\u8272\u8DDF\u6591\u9A6C\u7EB9\u5206\u4E0D\u51FA\u6765\uFF09\u3002\u5185\u5BB9\u533A\u518D\u6DE1\u4E00\u6863\uFF0C\u5F62\u6210\u300C\u884C\u6DF1 / \u5185\u5BB9\u6D45\u300D\u7684\u533A\u9694\u3002 */
  --tdt-open-bg:rgba(37,99,235,.10);
  --tdt-open-bg-soft:rgba(37,99,235,.05);
  --tdt-card-hover:rgba(37,99,235,.07);

  /* \u2500\u2500 \u63CF\u8FB9\u56DB\u6863\uFF08\u5BBF\u4E3B\u771F\u503C\uFF1Al1 4% / l2 10% / l3 12% / l4 16%\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  --tdt-border-faint:var(--dsw-alias-border-l1,#0000000a);
  --tdt-border:var(--dsw-alias-border-l2,#0000001a);
  --tdt-border-strong:var(--dsw-alias-border-l3,#0000001f);
  --tdt-border-heavy:var(--dsw-alias-border-l4,#00000029);

  /* \u2500\u2500 \u54C1\u724C / \u8BED\u4E49\u8272 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  /* \u54C1\u724C\u300C\u9762\u300D\u8272\uFF1A\u660E\u8272\u8FD1\u9ED1\u3001\u6697\u8272\u8FD1\u767D\uFF08\u5B98\u65B9 Switch \u9009\u4E2D\u6001\u5373\u6B64\uFF09\uFF0C**\u4E0D\u662F\u84DD\u8272** */
  --tdt-accent:var(--dsw-alias-brand-primary,#0f1115);
  /* \u84DD\u8272\uFF1A\u5F3A\u8C03 / \u9009\u4E2D / \u7126\u70B9\uFF0C\u4E00\u5F8B\u8D70\u8FD9\u6761 */
  --tdt-business:var(--dsw-alias-state-business-primary,#3b5bdb);
  --tdt-success:var(--dsw-alias-state-success-primary,#22c55e);
  /* \u26A0\uFE0F \u662F state-warn\uFF08\u4E0D\u662F state-warning\uFF0C\u540E\u8005\u5BBF\u4E3B\u65E0\u6B64\u5B9A\u4E49\uFF09 */
  --tdt-warning:var(--dsw-alias-state-warn-primary,#f59e0b);
  --tdt-danger:var(--dsw-alias-state-error-primary,#ec1313);
  --tdt-link:var(--dsw-alias-link,#3b5bdb);
  /* \u8BED\u4E49\u8272**\u5B9E\u9762**\u4E0A\u7684\u5B57\uFF08\u89D2\u6807 / \u5B9E\u5FC3\u63D0\u793A\uFF09\uFF1A\u5BBF\u4E3B\u7EA2\u7EFF\u9EC4\u4E09\u8272\u90FD\u662F\u4E2D\u8C03 \u21D2 \u767D\u5B57\u4E24\u4E2A\u4E3B\u9898\u90FD\u53EF\u8BFB\uFF0C
     \u6545\u8FD9\u662F\u4E00\u6761\u4E0E\u4E3B\u9898\u65E0\u5173\u7684\u5E38\u91CF\uFF1B\u4E0D\u8981\u62FF --tdt-fg-inverse \u9876\u2014\u2014\u5B83\u5728\u6697\u8272\u4E0B\u662F\u8FD1\u9ED1\uFF0C\u538B\u5728\u7EA2\u5E95\u4E0A\u770B\u4E0D\u6E05\u3002 */
  --tdt-on-signal:#fff;
  /* \u8BED\u4E49\u8272**\u6D45\u5E95**\uFF1A\u72B6\u6001\u8272\u7CFB\u7684\u300C\u4E00\u5757\u5E95\u8272\u300D\u2014\u2014\u6267\u884C\u8BB0\u5F55\u9875\u6BCF\u6761\u6D41\u6C34\u8D26\u7684\u5757\u5E95\u5C31\u662F\u5B83
     \uFF08\u7528\u6237 2026-10-04\uFF1A\u6B63\u5E38\u6001\u7ED9\u540C\u8272\u7CFB\u5F88\u6D45\u7684\u900F\u660E\u5E95\u3001\u5931\u8D25\u7528\u7EA2\u5E95\u900F\u51FA\u6765\uFF09\u3002
     \u7528 \u300Ccolor-mix\u300D \u73B0\u7B97\u800C\u4E0D\u5199\u6B7B rgba\uFF1A\u72B6\u6001\u8272\u672C\u8EAB\u8DDF\u968F\u5BBF\u4E3B alias\uFF0C\u4E3B\u9898\u4E00\u6362\u81EA\u52A8\u6210\u7ACB\u3002
     \u26A0\uFE0F **\u6DF1\u8272\u4E0B\u8981\u66F4\u6DE1**\uFF1A\u7528\u6237 2026-10-04\u300C\u6DF1\u8272\u98CE\u683C\u7684\u7EFF\u8272\u548C\u7EA2\u8272\u597D\u50CF\u90FD\u6709\u70B9\u6DF1\u300D\u21D2 dark \u6BB5
     \u628A\u8FD9\u56DB\u6761\u538B\u5230 5%\uFF08\u66F4\u8D34\u8FD1\u9762\u677F\u5E95\u3001\u5B58\u5728\u611F\u66F4\u5F31\uFF09\uFF1B\u6D45\u8272\u6BB5\u7EF4\u6301 8%\u3002\u4E24\u7AEF\u5404\u81EA\u7ED9\u503C\uFF0C\u4E0D\u5171\u7528\u4E00\u6761\u66F2\u7EBF\u3002
     \u547D\u540D\u6536\u5728 tokens.ts \u5355\u70B9\uFF08\u672C\u4ED3\u786C\u89C4\u77E9\uFF1A\u4E1A\u52A1\u6587\u4EF6\u4E0D\u8BB8\u81EA\u9020 --tdt-*\uFF09\u3002 */
  --tdt-success-soft:color-mix(in srgb,var(--tdt-success) 8%,transparent);
  --tdt-warning-soft:color-mix(in srgb,var(--tdt-warning) 8%,transparent);
  --tdt-danger-soft:color-mix(in srgb,var(--tdt-danger) 8%,transparent);
  --tdt-business-soft:color-mix(in srgb,var(--tdt-business) 8%,transparent);

  /* \u2500\u2500 \u4EA4\u4E92\u5E95 / \u906E\u7F69 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  --tdt-hover:var(--dsw-alias-interactive-bg-hover,rgba(38,49,72,.06));
  --tdt-active:var(--dsw-alias-interactive-bg-active,#2631481a);
  --tdt-mask:var(--dsw-alias-bg-mask-1,#0000003d);
  /* \u300C\u9009\u4E2D\u9762\u300D\uFF082026-10-06\uFF0C\u4EFB\u52A1\u65E5\u7A0B\u9875\u9996\u521B\uFF09= \u5F53\u524D\u5E95\u8272**\u671D\u66F4\u6DF1\u63BA 12% \u6587\u5B57\u8272**\uFF1A
     \u6D45\u8272\u4E3B\u9898\u4E0B\u6587\u5B57\u8272\u662F\u9ED1 \u21D2 \u9009\u4E2D\u9762\u6BD4\u5E38\u6001\u5E95\u8272**\u6DF1\u4E00\u6863**\u3002\u6DF1\u8272\u5206\u652F\u89C1 body[data-ds-dark-theme]\uFF08\u671D\u80CC\u666F\u8272\u63BA\uFF09\u3002
     \u8BED\u4E49\uFF1A\u6807\u8BB0\u300C\u6B63\u5728\u770B\u7684\u4E1C\u897F\u300D\uFF0C\u6BD4\u5E38\u6001\u660E\u663E\u3001\u53C8\u4E0D\u8BB8\u76D6\u4F4F\u5185\u5BB9\uFF08\u4E0D\u8BB8\u7528\u534A\u900F\u660E\u53E0\u72B6\u6001\u8272\uFF09\u3002 */
  --tdt-selected-bg:color-mix(in srgb,var(--tdt-surface-1) 88%,var(--tdt-fg));
  /* \u4EFB\u52A1\u65E5\u7A0B\u9875\u672C\u6708\u683C\u9ED8\u8BA4\u5E95\uFF082026-10-06 \u2192 \u7EED2\uFF09\uFF1A\u6D45\u8272\u4E0B\u7ED9**\u6DE1\u84DD**\uFF08business 8% \u900F\u767D\u5E95\uFF09\u2014\u2014
     \u53C2\u7167\u7528\u6237\u53C2\u8003\u7A3F\u91CC\u672A\u9009\u4E2D\u65E5\u7A0B\u5757 / Tuesday \u5217\u7684\u90A3\u79CD\u84DD\u3001\u518D\u6D45\u4E00\u70B9\u70B9\uFF1B
     \u76F8\u90BB\u6708\u8865\u4F4D\u683C\u4ECD\u8D70 --tdt-surface-2\uFF08\u66F4\u7070\uFF09\uFF0C\u4E0D\u53D7\u5F71\u54CD\u3002
     \u6DF1\u8272\u6BB5\u7EF4\u6301 #23262e\uFF08\u7528\u6237\uFF1A\u6DF1\u8272 UI \u5DF2\u5DEE\u4E0D\u591A\uFF0C\u4E0D\u52A8\uFF09\u3002 */
  --tdt-cal-cell-bg:color-mix(in srgb,var(--tdt-business) 8%,var(--tdt-surface-1));
  /* \u4EFB\u52A1\u65E5\u7A0B\u9875\u300C\u70B9\u5F00\u67D0\u5929\u300D\u5C55\u5F00\u7684\u9762\u677F\u5E95\uFF082026-10-06 \u7EED\uFF09\uFF1A\u6D45\u8272\u4E0B**\u65E0\u9650\u63A5\u8FD1\u767D\u3001\u53EA\u5E26\u4E00\u4E01\u70B9\u7070**
     \uFF08neutral-50 = #fafafa\uFF09\u2014\u2014\u9762\u677F\u91CC\u88C5\u534A\u900F\u660E\u6267\u884C\u8BB0\u5F55\u5217\u8868\uFF0C\u5E95\u518D\u6DF1\u6574\u7247\u5C31\u53D1\u7CCA\u53D1\u7070\uFF1B
     \u6DF1\u8272\u6BB5\u6CBF\u7528\u539F selected-bg \u6697\u503C\uFF0C\u4FDD\u6301\u4E0D\u52A8\u3002 */
  --tdt-cal-panel-bg:var(--dsw-static-neutral-50,#fafafa);
  /* \u4EFB\u52A1\u65E5\u7A0B\u9875\u672C\u6708\u683C hover \u5E95\uFF08\u6D45\u8272\u6BB5\uFF0C2026-10-06 \u7EED3\uFF09\uFF1A\u4E0D\u518D\u8D70\u7070\u8272\u901A\u7528\u4EA4\u4E92\u5E95\u2014\u2014
     \u9F20\u6807\u79FB\u4E0A\u53BB\u5E94\u662F\u300C\u66F4\u4EAE\u4E00\u70B9\u70B9\u7684\u84DD\u300D\uFF08\u4E0E\u6DF1\u8272\u6BB5\u540C\u8BED\u4E49\uFF1Ahover = \u63D0\u4EAE\u7684\u84DD\uFF0C\u4E0D\u662F\u7070\u4E0B\u53BB\uFF09\u3002
     \u6D53\u5EA6**\u4ECB\u4E8E**\u8868\u5934\u84DD\uFF0814%\uFF09\u4E0E\u672A\u9009\u4E2D\u683C\u84DD\uFF088%\uFF09\u4E4B\u95F4\u3001\u7565\u504F\u8868\u5934\u4E00\u4FA7\uFF1Abusiness 12% \u900F\u767D\u5E95
     \uFF08\u6BD4\u8868\u5934\u6D45\u4E00\u70B9\u3001\u6BD4\u672A\u9009\u4E2D\u683C\u6DF1\u4E00\u70B9\uFF09\u3002 */
  --tdt-cal-cell-hover:color-mix(in srgb,var(--tdt-business) 12%,var(--tdt-surface-1));

  /* \u2500\u2500 \u6295\u5F71 / \u7126\u70B9 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  --tdt-shadow-1:var(--dsw-elevation-soft,0 4px 16px 0 #00000008);
  /* \u4EAE\u7247\u81EA\u5E26\u7684\u6D6E\u8D77\u611F\uFF08\u9009\u4E2D\u6001\u7528\uFF1B\u4E0E --tdt-surface-raised \u914D\u5BF9\uFF09 */
  --tdt-shadow-raised:var(--dsw-elevation-soft,0 4px 16px 0 #00000008);
  --tdt-shadow-2:var(--dsw-shadow-lv3,0 12px 32px 0 #00000014);
  /* \u952E\u76D8\u7126\u70B9\u73AF\u3002\u26A0\uFE0F \u4E0D\u7528\u5BBF\u4E3B --dsw-focus-ring-color\uFF1A\u5B83\u9ED8\u8BA4\u503C\u662F transparent\uFF08\u515C\u5E95\u4E0D\u751F\u6548\u3001\u4F1A\u9690\u8EAB\uFF09 */
  --tdt-focus:var(--dsw-alias-state-business-primary,#3b5bdb);

  /* \u2500\u2500 \u5706\u89D2\uFF08\u5BBF\u4E3B\u771F\u503C 4 / 8 / 12 / 16 / 20 / 28\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  --tdt-radius-xs:var(--dsw-radius-xs,4px);
  --tdt-radius-sm:var(--dsw-radius-sm,8px);
  --tdt-radius-md:var(--dsw-radius-md,12px);
  --tdt-radius-lg:var(--dsw-radius-lg,16px);
  --tdt-radius-xl:var(--dsw-radius-xl,20px);
  --tdt-radius-panel:var(--dsw-radius-panel,28px);

  /* \u2500\u2500 \u95F4\u8DDD\u56DB\u62CD\uFF08\u53EA\u8BB8\u7528\u8FD9\u56DB\u6863\uFF0C\u4E0D\u8BB8\u51FA\u73B0 5 / 7 / 9px\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  --tdt-space-1:4px;
  --tdt-space-2:8px;
  --tdt-space-3:12px;
  --tdt-space-4:16px;

  /* \u2500\u2500 \u63A7\u4EF6\u9AD8\u5EA6\uFF1A\u79BB\u6563\u4E09\u6863\uFF08\u63A7\u4EF6\u7528 size="sm|md|lg" \u9009\uFF1B\u8C03\u7528\u70B9\u4E0D\u8BB8\u81EA\u5B9A\u4E49\u9AD8\u5EA6\uFF0C
       \u771F\u4E0D\u591F\u7528\u624D\u5141\u8BB8\u5728\u8C03\u7528\u70B9\u672C\u5730\u8986\u76D6 --tdt-control-h-*\uFF0C\u5C5E\u4F8B\u5916\u800C\u975E\u5E38\u6001\uFF09\u2500\u2500 */
  --tdt-control-h-sm:24px;
  --tdt-control-h-md:28px;
  --tdt-control-h-lg:32px;

  /* \u2500\u2500 \u5B57\u53F7 / \u884C\u9AD8\uFF1A\u76F4\u7ED1\u5BBF\u4E3B\u5B57\u53F7\u65CF\uFF08\u5BBF\u4E3B\u771F\u503C 11 / 12 / 13 / 14 / 16\uFF09\u2500\u2500\u2500\u2500\u2500 */
  --tdt-font-xs:var(--dsw-font-xxxs-11-font-size,11px);
  --tdt-font-sm:var(--dsw-font-xxs-12-font-size,12px);
  --tdt-font-md:var(--dsw-font-xs-13-font-size,13px);
  --tdt-font-lg:var(--dsw-font-s-14-font-size,14px);
  --tdt-font-xl:var(--dsw-font-base-16-font-size,16px);
  --tdt-line-xs:var(--dsw-font-xxxs-11-line-height,14px);
  --tdt-line-sm:var(--dsw-font-xxs-12-line-height,18px);
  --tdt-line-md:var(--dsw-font-xs-13-line-height,20px);
  --tdt-line-lg:var(--dsw-font-s-14-line-height,22px);
  --tdt-line-xl:var(--dsw-font-base-16-line-height,24px);
  --tdt-font-mono:var(--ds-font-family-code,monospace);

  /* \u2500\u2500 \u5C42\u7EA7\u9636\u68AF\uFF08\u4E1A\u52A1\u6587\u4EF6\u4E0D\u8BB8\u518D\u5199\u88F8 z-index\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  /* \u9875\u9762\u7EA7\u9884\u89C8\u5206\u680F \u2192 \u62BD\u5C49\uFF08\u65B0\u5EFA/\u7F16\u8F91\uFF09\u2192 \u5F39\u7A97/\u786E\u8BA4\u6846 \u2192 \u6D6E\u5C42\u83DC\u5355 \u2192 \u6D6E\u5C42\u63D0\u793A */
  /* \u5185\u5BB9\u5C42\u5438\u9876\uFF08\u5929\u6807\u7B7E / \u8868\u5934\u8FD9\u7C7B\u300C\u8DDF\u7740\u6EDA\u4F46\u538B\u4F4F\u540C\u5C42\u5185\u5BB9\u300D\u7684\u5143\u7D20\uFF09\uFF1A\u53EA\u538B\u540C\u5C42\u5144\u5F1F\uFF0C
     \u5FC5\u987B\u4F4E\u4E8E\u4E0B\u9762\u6240\u6709\u6D6E\u5C42\u6863 \u2014\u2014 \u6240\u4EE5\u5B83\u4E0D\u662F\u300C\u5F00\u65B0\u6D6E\u5C42\u6863\u300D\uFF0C\u800C\u662F\u5185\u5BB9\u5C42\u5185\u90E8\u7684\u6392\u5E8F\u4F4D\u3002 */
  --tdt-z-sticky:10;
  --tdt-z-dock:1030;
  --tdt-z-drawer:1040;
  --tdt-z-modal:1070;
  --tdt-z-menu:1100;
  --tdt-z-tip:1200;

  /* \u2500\u2500 \u52A8\u6548 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  --tdt-dur:var(--ds-transition-duration,.2s);
  --tdt-dur-fast:var(--ds-transition-duration-fast,.12s);
  --tdt-ease:var(--ds-ease-in-out,cubic-bezier(.4,0,.2,1));
  /* \u8FD0\u884C\u4E2D\u72B6\u6001\u7684\u8109\u52A8\u65F6\u957F\uFF082026-10-06 \u7EDF\u4E00\u524D\u540E\u4E24\u7AEF\uFF1A\u4EFB\u52A1\u914D\u7F6E\u91CC\u7684\u7EFF\u547C\u5438 \u2192 \u84DD\u3001\u653E\u6162\uFF1B
     \u6267\u884C\u8BB0\u5F55\u91CC\u7684\u84DD\u95EA \u2192 \u653E\u6162\u4E00\u70B9\u3002\u4E24\u8005\u7528\u540C\u4E00\u4E2A\u503C\uFF0C\u52A8\u753B\u5F62\u72B6\u672C\u5C31\u4E00\u81F4\uFF09\u3002 */
  --tdt-dur-run:500ms;
}

/* \u2500\u2500 \u660E\u6697\u5DEE\u5F02\u7684**\u552F\u4E00**\u843D\u70B9 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   \u5224\u636E = body[data-ds-dark-theme]\uFF08\u5BBF\u4E3B 0.2.0-rc.2 \u6E90\u7801\u6838\u5B9E\uFF1A\u542F\u52A8\u811A\u672C toggleAttribute \u5199\u5165\uFF0C
   \u552F\u4E00\u660E\u6697\u5224\u636E\uFF1B\u63D2\u4EF6\u7981\u6B62\u7528 prefers-color-scheme \u2014\u2014 \u5B83\u8DDF\u7684\u662F\u7CFB\u7EDF\u3001\u4E0D\u662F\u7528\u6237\u5728\u5BBF\u4E3B\u91CC\u7684\u9009\u62E9\uFF09\u3002
   \u4E0B\u9762\u53EA\u653E alias \u8868\u8FBE\u4E0D\u4E86\u7684\u300C\u56FA\u5B9A\u4E2D\u6027\u9762\u300D\uFF1B\u989C\u8272\u82E5\u80FD\u9760 alias \u81EA\u52A8\u8DDF\u968F\uFF0C\u4E00\u5F8B\u4E0D\u8981\u5199\u5728\u8FD9\u91CC\u3002 */
body[data-ds-dark-theme]{
  --tdt-solid:var(--dsw-static-neutral-900,#0f0f0f);
  --tdt-on-solid:var(--dsw-static-neutral-00,#fff);
  --tdt-plate:var(--dsw-static-neutral-850,#212123);
  --tdt-plate-hover:var(--dsw-static-neutral-800,#292929);
  --tdt-icon-plate:rgba(255,255,255,.05);
  --tdt-icon-plate:color-mix(in srgb,var(--dsw-static-neutral-00,#fff) 5%,transparent);
  /* \u6697\u8272\u4E3B\u9898**\u53CD\u8FC7\u6765**\uFF1A\u8868\u5934\u8981\u6BD4\u5361\u7247\u9762**\u4EAE**\u3001\u6BD4\u6591\u9A6C\u7EB9\u518D**\u6D45\u4E00\u6863**\uFF08\u7528\u6237\uFF1A\u7EAF\u9ED1\u80CC\u666F\u6CA1\u6CD5\u770B\uFF09\u3002 */
  --tdt-head-bg:var(--tdt-surface-2);
  /* \u6697\u8272\u5E95\u677F**\u5FAE\u4EAE**\uFF1Bhover **\u66F4\u4EAE**\uFF08\u539F\u5148 hover \u53D6 plate-hover \u53CD\u800C\u66F4\u6DE1 \u21D2 \u9F20\u6807\u79FB\u4E0A\u53BB\u5C31\u6CA1\u4E86\uFF09\u3002 */
  --tdt-chip-bg:rgba(255,255,255,.08);
  --tdt-chip-bg:color-mix(in srgb,var(--dsw-static-neutral-00,#fff) 8%,transparent);
  --tdt-chip-bg-hover:rgba(255,255,255,.16);
  --tdt-chip-bg-hover:color-mix(in srgb,var(--dsw-static-neutral-00,#fff) 16%,transparent);
  /* \u6697\u8272\u4E0B\u84DD\u8272\u8981\u66F4\u4EAE\u3001\u900F\u660E\u5EA6\u7565\u9AD8\u624D\u538B\u5F97\u4F4F\u6DF1\u5E95\u3002 */
  --tdt-open-bg:rgba(96,165,250,.18);
  --tdt-open-bg-soft:rgba(96,165,250,.08);
  --tdt-card-hover:rgba(96,165,250,.13);
  /* \u8BED\u4E49\u8272**\u6D45\u5E95**\uFF08\u6DF1\u8272\u7248\uFF09\uFF1A\u7528\u6237\u5ACC\u6DF1\u8272\u7684\u7EFF / \u7EA2\u300C\u6709\u70B9\u6DF1\u300D\u21D2 \u538B\u5230 **5%**\uFF08\u6D45\u8272\u6BB5\u662F 8%\uFF09\uFF0C
     \u66F4\u8D34\u8FD1\u9762\u677F\u5E95\u8272\u3001\u5B58\u5728\u611F\u66F4\u5F31\uFF1B\u5757\u5E95\u4E0E\u72B6\u6001\u8272\u7AD6\u6761\u4ECD\u540C\u6E90\uFF08\u7AD6\u6761\u662F\u5B9E\u8272\uFF0C\u4E0D\u53D7\u8FD9\u6761\u5F71\u54CD\uFF09\u3002 */
  --tdt-success-soft:color-mix(in srgb,var(--tdt-success) 5%,transparent);
  --tdt-warning-soft:color-mix(in srgb,var(--tdt-warning) 5%,transparent);
  --tdt-danger-soft:color-mix(in srgb,var(--tdt-danger) 5%,transparent);
  --tdt-business-soft:color-mix(in srgb,var(--tdt-business) 5%,transparent);
  /* \u300C\u9009\u4E2D\u9762\u300D\uFF08\u6DF1\u8272\u7248\uFF0C2026-10-06\uFF09\uFF1A\u63BA **~40% \u80CC\u666F\u8272**\uFF08--tdt-surface-base\uFF09\u21D2 \u65E0\u9650\u63A5\u8FD1\u9875\u9762\u80CC\u666F\u7684\u9ED1\u3001
     \u53EA\u6BD4\u80CC\u666F\u7565\u6DF1\u4E00\u70B9\u70B9\uFF08\u7528\u6237\uFF1A\u6DF1\u8272\u4E0B\u5C55\u5F00\u533A\u538B\u7740\u4EFB\u52A1\u900F\u660E\u7EFF\u4F1A\u53D1\u7070\uFF0C\u5E95\u8272\u8981\u5C3D\u91CF\u8D34\u8FD1\u80CC\u666F\u624D\u4E0D\u663E\u7070\uFF09\u3002
     \u26A0\uFE0F \u6DF1\u8272\u4E0B\u4E0D\u80FD\u63BA\u6587\u5B57\u8272 \u2014\u2014 \u90A3\u662F\u767D\uFF0C\u4F1A\u53D8\u4EAE\uFF0C\u9009\u4E2D\u53CD\u800C\u6BD4\u672C\u6708\u65E5\u671F\u6D45\u3002 */
  --tdt-selected-bg:color-mix(in srgb,var(--tdt-surface-1) 60%,var(--tdt-surface-base));
  /* \u4EFB\u52A1\u65E5\u7A0B\u9875\u672C\u6708\u683C\u7684\u9ED8\u8BA4\u5E95\uFF08\u6DF1\u8272\u7248\uFF0C2026-10-06\uFF09\uFF1A\u6DF1\u7684\u3001\u5E26\u70B9\u7070\u84DD\u7684\u6697\u8272\uFF08\u7528\u6237\u7ED9\u7684\u53C2\u8003\u56FE \u2248 #23262e\uFF09\uFF0C
     \u6BD4\u539F\u6765\u7684\u5361\u7247\u9762\u66F4\u6C89\u3001\u66F4\u504F\u84DD\u7070\uFF1B\u9009\u4E2D\u683C\u4ECD\u8D70 --tdt-selected-bg\uFF08\u66F4\u6697\u4E00\u6863\uFF09\uFF0C\u5C42\u7EA7\u4E0D\u53D8\u3002 */
  --tdt-cal-cell-bg:#23262e;
  /* \u4EFB\u52A1\u65E5\u7A0B\u9875\u672C\u6708\u683C hover \u5E95\uFF08\u6DF1\u8272\u6BB5\uFF0C2026-10-06\uFF09\uFF1A\u539F\u5148\u8D70 --tdt-hover\uFF08\u5BBF\u4E3B\u6D45\u8272\u53E0\u52A0\uFF09\u5728\u6DF1\u5E95\u4E0A\u663E\u5F97
     \u300C\u7070\u53D1\u4EAE\u300D\uFF0C\u4E0D\u597D\u770B \u21D2 \u6362\u6210\u66F4\u8D34\u5E95\u7684\u84DD\u8C03\u5FAE\u4EAE\uFF08\u4E0E open-bg-soft \u540C\u65CF\uFF09\uFF0Chover \u65F6\u4E0D\u523A\u773C\u3001\u53C8\u6709\u53CD\u9988\u3002 */
  --tdt-cal-cell-hover:rgba(96,165,250,.12);
  /* \u4EFB\u52A1\u65E5\u7A0B\u9875\u5C55\u5F00\u9762\u677F\u5E95\uFF08\u6DF1\u8272\u6BB5\uFF0C2026-10-06 \u7EED\uFF09\uFF1A\u4E0E\u539F selected-bg \u6697\u503C\u4E00\u81F4\uFF0C\u6DF1\u8272 UI \u4E0D\u52A8 */
  --tdt-cal-panel-bg:color-mix(in srgb,var(--tdt-surface-1) 60%,var(--tdt-surface-base));
}
`;
var LEGACY_TDT_SEGMENTED_CSS = `
/* \u2500\u2500 \u5206\u6BB5\u63A7\u4EF6\uFF08\u6ED1\u52A8\u5757\uFF09P1 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   \u7ED3\u6784\u4E00\u5957 + \u4E24\u4E2A\u53D7\u63A7\u8F74\uFF1Asize(sm|md|lg) \xD7 variant(default|inset)\u3002
   \u53D8\u4F53**\u53EA\u8986\u76D6\u4E24\u4E2A\u989C\u8272\u53D8\u91CF**\uFF08--seg-track \u8F68\u9053\u5E95 / --seg-thumb \u9009\u4E2D\u5757\uFF09\uFF0C
   \u8FD9\u6B63\u662F\u300C\u540C\u4E00\u4EFD\u6837\u5F0F\u3001\u53EA\u91CD\u8F7D\u989C\u8272\u300D\u7684\u843D\u5730\u5F62\u6001\u3002 */
/* \u4E24\u5957\u57FA\u7840\u6837\u5F0F\uFF082026-10-01 \u7528\u6237\u62CD\u677F\uFF1A\u4FDD\u7559\u300C\u7EAF\u9ED1\u9762\u300D\u4E0E\u300C\u7070\u5E95\u9762\u300D\u4E24\u5957\uFF0C\u4E0D\u53EF\u5408\u5E76\uFF09\uFF1A
   - default = \u7EAF\u9ED1\u9762\uFF1A\u8F68\u9053=\u7B2C\u4E8C\u5C42\u9762 + \u5916\u63CF\u8FB9\uFF0C\u9009\u4E2D=\u4EAE\u7247\u5E95\uFF1B
   - inset = \u7070\u5E95\u9762\uFF1A\u6284\u300C\u7248\u672C\u300D\u5F00\u5173\u89C2\u611F\uFF08\u8F68\u9053=\u4EA4\u4E92\u7070 hover \u5E95\u3001\u65E0\u5916\u63CF\u8FB9\u3001\u9009\u4E2D=\u4EAE\u7247\u5E95\uFF09\uFF0C\u7528\u6237\u89C9\u5F97\u6BD4\u539F\u7070\u5E95\u90A3\u5957\u597D\u770B\u3002
   \u26A0\uFE0F \u9AD8\u5EA6\u5BF9\u9F50\u89C4\u5219\uFF082026-10-01 \u7528\u6237\u62CD\u677F\uFF0C\u540C\u65E5\u4FEE\u6B63 +2\uFF09\uFF1A\u6709\u8FB9 / \u65E0\u8FB9\u603B\u9AD8\u5FC5\u987B == \u63A7\u4EF6 token\uFF0C\u8FB9\u6846\u5728\u5185\u90E8\u8865\u56DE\uFF0C\u4E0D\u8BB8\u989D\u5916\u6491\u9AD8\u3002
   \u51E0\u4F55 = \u6BB5\u9AD8 = token \u2212 6px\uFF08\u4E0A\u4E0B\u5404 2px padding + 1px \u8FB9\u6846\uFF09\uFF1Bdefault \u771F\u8FB9\u6846 1px + padding 2px\uFF0C
   inset \u65E0\u8FB9\u6846\u6545 padding \u6536 3px \u628A\u7F3A\u7684 1px \u8865\u56DE\uFF0C\u4E24\u79CD\u5916\u89C2\u603B\u9AD8\u90FD == token\uFF0824/28/32\uFF09\uFF0C\u4E0D\u518D\u591A +2px\u3002
   \u4EE5\u540E Button / Input \u7684\u6709\u8FB9 / \u65E0\u8FB9\u540C\u6B64\u89C4\u5219\u3002 */
.dsh-tdt-seg{display:inline-flex;align-items:center;gap:2px;padding:2px;border-radius:var(--tdt-radius-md);background:var(--seg-track);}
.dsh-tdt-seg--default{--seg-track:var(--tdt-surface-2);--seg-thumb:var(--tdt-surface-raised);border:1px solid var(--tdt-border);}
.dsh-tdt-seg--inset{--seg-track:var(--tdt-hover);--seg-thumb:var(--tdt-surface-raised);border:0;padding:3px;}

.dsh-tdt-seg__item{appearance:none;display:inline-flex;align-items:center;gap:4px;box-sizing:border-box;
  height:calc(var(--tdt-control-h-sm) - 6px);padding:0 12px;border:0;border-radius:var(--tdt-radius-sm);
  background:transparent;color:var(--tdt-fg-2);font-family:inherit;font-size:var(--tdt-font-sm);line-height:var(--tdt-line-sm);
  font-weight:400;white-space:nowrap;cursor:pointer;
  transition:color var(--tdt-dur-fast) var(--tdt-ease),background-color var(--tdt-dur-fast) var(--tdt-ease),box-shadow var(--tdt-dur-fast) var(--tdt-ease);}
.dsh-tdt-seg--md .dsh-tdt-seg__item{height:calc(var(--tdt-control-h-md) - 6px);}
.dsh-tdt-seg--lg .dsh-tdt-seg__item{height:calc(var(--tdt-control-h-lg) - 6px);}
.dsh-tdt-seg__item:hover:not([aria-pressed='true']):not(:disabled){color:var(--tdt-fg);}
.dsh-tdt-seg__item[aria-pressed='true']{background:var(--seg-thumb);box-shadow:var(--tdt-shadow-raised);color:var(--tdt-fg);font-weight:600;}
.dsh-tdt-seg__item:focus-visible{outline:2px solid var(--tdt-focus);outline-offset:-2px;}
.dsh-tdt-seg__item:disabled{cursor:default;opacity:.4;}

/* \u6BB5\u5185\u89D2\u6807\uFF08\u5982\u300C\u5F02\u5E38\u300D\u7684\u6570\u91CF\uFF09\uFF1A\u8BED\u4E49\u8272\u5B9E\u9762 + \u53CD\u767D\u5B57\uFF0C0 \u7531\u7EC4\u4EF6\u4FA7\u4E0D\u6E32\u67D3\u3002
   \u26A0\uFE0F **\u5FC5\u987B\u662F\u6B63\u5706**\uFF08\u7528\u6237 2026-10-03\uFF1A\u300C\u591A\u4F4D\u6570\u7ED9\u5B83\u6491\u5F00\u4E86\uFF0C\u90A3\u4E0D\u662F\u5706\u7684\u5C31\u6CA1\u529E\u6CD5\u4E86\u300D\uFF09\uFF1A
   \u56FA\u5B9A 16\xD716 + border-radius:50% + padding:0 + overflow:hidden \u21D2 \u4E00\u4F4D\u6570 / \u4E24\u4F4D\u6570\u90FD\u662F\u540C\u4E00\u4E2A\u5706\uFF0C
   \u6570\u5B57\u7F29\u5230 10px \u585E\u5F97\u4E0B\uFF1B\u4E0D\u518D\u7528 min-width + \u5DE6\u53F3 padding\uFF08\u90A3\u4F1A\u8BA9\u5BBD\u5EA6\u968F\u4F4D\u6570\u589E\u957F\u53D8\u692D\u5706\uFF09\u3002 */
.dsh-tdt-seg__badge{display:inline-flex;align-items:center;justify-content:center;flex:none;
  width:16px;height:16px;padding:0;overflow:hidden;
  border-radius:50%;background:var(--tdt-danger);color:var(--tdt-on-signal);
  font-size:10px;line-height:16px;font-weight:500;font-variant-numeric:tabular-nums;}

/* block\uFF1A\u6491\u6EE1\u7236\u5BBD\uFF08\u8868\u5355\u884C\u7528\uFF09\uFF0C\u5404\u6BB5\u7B49\u5206 */
.dsh-tdt-seg--block{display:flex;width:100%;}
.dsh-tdt-seg--block .dsh-tdt-seg__item{flex:1 1 auto;justify-content:center;}

/* weekday\uFF1A\u661F\u671F\u591A\u9009\u65B9\u5757\uFF08\u4EFB\u52A1\u65B0\u589E / \u7F16\u8F91\u9875\uFF09\u3002\u57FA\u7840\u63D2\u4EF6\u7684\u7279\u6B8A\u5316\u5B9A\u5236\uFF08\u7528\u6237 2026-10-01 \u660E\u786E\u8981\u6C42\uFF1A
   \u539F WeekdayPicker \u5373\u300C\u84DD\u5E95 + \u8FD1\u4F3C\u65B9\u5F62\u300D\uFF0C\u7EDF\u4E00\u5230 Segmented \u540E\u7531\u8FD9\u4E00\u4FEE\u9970\u7C7B\u8865\u56DE\u4E24\u5904\u5DEE\u5F02\uFF09\uFF1A
   - \u6BCF\u683C\u505A\u6210\u6B63\u65B9\u5F62\uFF08\u5BBD = \u6BB5\u9AD8\uFF09\uFF1B
   - \u9009\u4E2D\u6001\u7528\u54C1\u724C\u84DD\uFF08--tdt-business\uFF09\u3001\u53CD\u767D\u5B57\uFF0C\u8F68\u9053\u7528 hover \u7070\uFF08\u4E0E\u539F\u81EA\u7ED8\u8F68\u9053\u4E00\u81F4\uFF09\u3002
   \u76AE\u80A4\u96C6\u4E2D\u5728\u6B64\u3001\u4E0D\u5185\u8054\uFF1B\u8C03\u7528\u70B9\u53EA\u6302 .dsh-tdt-seg--weekday \u4E00\u4E2A\u4FEE\u9970\u7C7B\uFF0C\u7B26\u5408\u300C\u76AE\u80A4\u53EA\u5728 controls-css\u300D\u7684\u89C4\u77E9\u3002 */
.dsh-tdt-seg--weekday{--seg-track:var(--tdt-hover);}
.dsh-tdt-seg--weekday .dsh-tdt-seg__item{width:calc(var(--tdt-control-h-lg) - 6px);padding:0;justify-content:center;}
.dsh-tdt-seg--weekday .dsh-tdt-seg__item[aria-pressed='true']{background:var(--tdt-business);color:var(--tdt-fg-inverse);box-shadow:var(--tdt-shadow-raised);}

@media (prefers-reduced-motion: reduce){.dsh-tdt-seg__item{transition:none;}}
`;

// packages/demo/src/probes.ts
var KIT_TAG_ID = "dsh-plugin-core-plugin";
function countOccur(haystack, needle) {
  let n = 0;
  let i = haystack.indexOf(needle);
  while (i >= 0) {
    n++;
    i = haystack.indexOf(needle, i + needle.length);
  }
  return n;
}
function selectorsOf(css) {
  const body = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out = [];
  for (const chunk of body.split("}")) {
    const brace = chunk.lastIndexOf("{");
    if (brace < 0) continue;
    const sel = chunk.slice(0, brace).split("{").pop()?.trim() ?? "";
    if (sel === "" || sel.startsWith("@")) continue;
    out.push(sel);
  }
  return out;
}
function readSheets() {
  const out = [];
  const add = (sheet) => {
    if (sheet === null) return;
    try {
      const rules = Array.from(sheet.cssRules);
      const selectors = [];
      for (const r of rules) {
        if (r instanceof CSSStyleRule) selectors.push(r.selectorText);
      }
      out.push({ count: rules.length, selectors });
    } catch {
      out.push({ count: -1, selectors: [] });
    }
  };
  for (const sheet of Array.from(document.styleSheets)) add(sheet);
  const adopted = document.adoptedStyleSheets;
  for (const sheet of Array.from(adopted ?? [])) add(sheet);
  return out;
}
function describeRoot(el) {
  const root = el.getRootNode();
  if (root === document) return "document";
  if (typeof ShadowRoot !== "undefined" && root instanceof ShadowRoot) return "shadow";
  return root.nodeName;
}
function collectSegProbes() {
  if (typeof document === "undefined") return [{ id: "P0", text: "no document" }];
  const lines = [];
  const allTags = Array.from(document.querySelectorAll("style"));
  const segTags = allTags.filter((t3) => (t3.textContent ?? "").includes("dshpc-seg"));
  lines.push({
    id: "P1",
    text: `style \u6807\u7B7E\u603B ${String(allTags.length)}\uFF0C\u542B dshpc-seg ${String(segTags.length)} \u4E2A [${segTags.map((t3) => t3.id === "" ? "(\u65E0id)" : t3.id).join(", ")}]`
  });
  const kitTag = document.getElementById(KIT_TAG_ID);
  const kitCss = kitTag?.textContent ?? "";
  lines.push({
    id: "P2",
    text: kitTag === null ? `\u627E\u4E0D\u5230 #${KIT_TAG_ID}` : `#${KIT_TAG_ID} len ${String(kitCss.length)}\uFF0C\u6587\u672C\u91CC '.dshpc-seg{' \xD7 ${String(countOccur(kitCss, ".dshpc-seg{"))}`
  });
  const sheets = readSheets();
  const readable = sheets.filter((s) => s.count >= 0);
  lines.push({
    id: "P3",
    text: `sheets \u603B ${String(sheets.length)}\uFF0C\u53EF\u8BFB ${String(readable.length)}\uFF0C\u89C4\u5219\u5408\u8BA1 ${String(readable.reduce((a, s) => a + s.count, 0))}\uFF0C\u8BFB\u4E0D\u4E86 ${String(sheets.length - readable.length)}`
  });
  const cssomSeg = readable.flatMap((s) => s.selectors.filter((x) => x.startsWith(".dshpc-seg")));
  lines.push({
    id: "P4",
    text: `CSSOM \u91CC .dshpc-seg* \u5171 ${String(cssomSeg.length)} \u6761\uFF1A${cssomSeg.slice(0, 6).join(" | ") || "(\u65E0)"}`
  });
  const textSeg = selectorsOf(kitCss).filter((x) => x.startsWith(".dshpc-seg"));
  const present = new Set(cssomSeg);
  const missing = textSeg.filter((x) => !present.has(x));
  lines.push({
    id: "P5",
    text: `\u6587\u672C\u91CC .dshpc-seg* ${String(textSeg.length)} \u6761\uFF0CCSSOM \u7F3A ${String(missing.length)} \u6761\uFF1A${missing.slice(0, 6).join(" | ") || "(\u65E0)"}`
  });
  const el = document.querySelector(".dshpc-seg");
  if (el === null) {
    lines.push({ id: "P6", text: "\u9875\u9762\u4E0A\u6CA1\u6709 .dshpc-seg \u5143\u7D20\uFF08\u6362\u5230\u300C\u6ED1\u52A8\u5757\u300D\u90A3\u8282\u518D\u770B\uFF09" });
    return lines;
  }
  lines.push({
    id: "P6",
    text: `\u5143\u7D20 class="${el.className}"\uFF0Cmatches ${String(el.matches(".dshpc-seg"))}\uFF0C\u6839 ${describeRoot(el)}\uFF0Cdisplay=${getComputedStyle(el).display}`
  });
  const clone = document.createElement("div");
  clone.className = "dshpc-seg";
  clone.style.cssText = "position:fixed;left:-9999px;top:0";
  document.body.appendChild(clone);
  const cloneDisplay = getComputedStyle(clone).display;
  clone.remove();
  lines.push({ id: "P7", text: `\u88F8 div.dshpc-seg \u7684 display=${cloneDisplay}` });
  el.classList.add("dshpc-segprobe");
  const probeDisplay = getComputedStyle(el).display;
  el.classList.remove("dshpc-segprobe");
  lines.push({ id: "P8", text: `\u771F\u5B9E\u5143\u7D20\u4E34\u65F6\u52A0 .dshpc-segprobe \u21D2 display=${probeDisplay}` });
  const fresh = document.createElement("style");
  fresh.setAttribute("data-probe", "seg-fresh");
  fresh.textContent = ".dshpc-seg{display:inline-flex}";
  document.head.appendChild(fresh);
  const freshDisplay = getComputedStyle(el).display;
  let freshRules = -1;
  try {
    freshRules = fresh.sheet?.cssRules.length ?? -1;
  } catch {
    freshRules = -1;
  }
  fresh.remove();
  lines.push({
    id: "P9",
    text: `\u4E34\u65F6\u6807\u7B7E\u53EA\u5199 .dshpc-seg{display:inline-flex} \u21D2 display=${freshDisplay}\uFF08cssRules ${String(freshRules)}\uFF09\uFF0C\u5DF2\u5220`
  });
  return lines;
}

// packages/demo/src/client/index.tsx
var PANEL_ID = "dsh-plugin-core-demo";
var localeRuntime;
function useLocaleTick() {
  const [, setTick] = (0, import_react31.useState)(0);
  (0, import_react31.useEffect)(() => {
    const rt = localeRuntime;
    if (rt === void 0) return;
    return rt.subscribe(() => {
      setTick((v) => v + 1);
    });
  }, []);
}
function DemoPage() {
  useLocaleTick();
  const [active, setActive] = (0, import_react31.useState)(ALL_SECTIONS[0].id);
  const [diag, setDiag] = (0, import_react31.useState)("seg: \u2026");
  const [diag2, setDiag2] = (0, import_react31.useState)("btn: \u2026");
  const [probes, setProbes] = (0, import_react31.useState)([]);
  (0, import_react31.useEffect)(() => {
    const el = document.querySelector(".dshpc-seg");
    if (el === null) {
      setDiag("seg: no element");
      return;
    }
    const cs = getComputedStyle(el);
    let rule = "no-rule";
    let sheets = 0;
    for (const sh of Array.from(document.styleSheets)) {
      let rules;
      try {
        rules = sh.cssRules;
        sheets++;
      } catch {
        continue;
      }
      for (const r of Array.from(rules)) {
        if (r instanceof CSSStyleRule && r.selectorText === ".dshpc-seg") {
          rule = r.style.cssText.slice(0, 90);
        }
      }
    }
    const probe = (sel) => {
      const el2 = document.querySelector(sel);
      if (el2 === null) return "none";
      let r = "no-rule";
      for (const sh of Array.from(document.styleSheets)) {
        let rules;
        try {
          rules = sh.cssRules;
        } catch {
          continue;
        }
        for (const rr of Array.from(rules)) {
          if (rr instanceof CSSStyleRule && rr.selectorText === sel) r = "live";
        }
      }
      return `${getComputedStyle(el2).display}/${r}`;
    };
    setDiag(`seg ${cs.backgroundColor} gap ${cs.gap} display ${cs.display}
rule(${sheets} sheets): ${rule}
wk ${probe(".dshpc-seg--weekday")} df ${probe(".dshpc-seg--default")} tdt ${probe(".dsh-tdt-seg")} probe ${probe(".dshpc-segprobe")}`);
  }, [active]);
  (0, import_react31.useEffect)(() => {
    const el = document.querySelector(".dshpc-btn");
    if (el === null) {
      setDiag2("btn: no element");
      return;
    }
    const cs = getComputedStyle(el);
    let rule = "no-rule";
    for (const sh of Array.from(document.styleSheets)) {
      let rules;
      try {
        rules = sh.cssRules;
      } catch {
        continue;
      }
      for (const r of Array.from(rules)) {
        if (r instanceof CSSStyleRule && r.selectorText === ".dshpc-btn") rule = r.style.cssText.slice(0, 60);
      }
    }
    setDiag2(`btn ${cs.display} align ${cs.alignItems} lh ${cs.lineHeight}
rule: ${rule}`);
  }, [active]);
  const dark = typeof document !== "undefined" && document.body.hasAttribute("data-ds-dark-theme");
  (0, import_react31.useEffect)(() => {
    const timer = setTimeout(() => {
      const lines = collectSegProbes().map((l) => `${l.id} ${l.text}`);
      setProbes(lines);
      console.log(`[probe] build ${"1019-2113-sh85"}
${lines.join("\n")}`);
    }, 150);
    return () => {
      clearTimeout(timer);
    };
  }, [active]);
  const buildBadge = (0, import_react31.createElement)(
    "div",
    {
      title: `core v${"0.2.14"} \xB7 demo v${"0.2.14"} \xB7 build ${"1019-2113-sh85"}
\u6BCF\u6B21 build \u90FD\u4F1A\u751F\u6210\u65B0\u7684\u7F16\u7801`,
      style: {
        fontFamily: "var(--dshpc-font-mono)",
        fontSize: "11px",
        lineHeight: "16px",
        color: "var(--dshpc-business)",
        padding: "0 2px 8px",
        wordBreak: "break-all"
      }
    },
    `build ${"1019-2113-sh85"}`
  );
  return (0, import_react31.createElement)(
    "div",
    { style: { display: "flex", alignItems: "stretch", height: "100%", minHeight: 0, overflow: "hidden" } },
    (0, import_react31.createElement)(
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
      buildBadge,
      ALL_SECTIONS.map(
        (s) => (0, import_react31.createElement)(
          "button",
          {
            key: s.id,
            type: "button",
            onClick: () => {
              setActive(s.id);
            },
            style: {
              display: "block",
              width: "100%",
              textAlign: "left",
              border: "none",
              cursor: "pointer",
              background: active === s.id ? "var(--dshpc-open-bg)" : "transparent",
              color: active === s.id ? "var(--dshpc-business)" : "var(--dshpc-fg)",
              padding: "7px 10px",
              borderRadius: "6px",
              fontSize: "13px",
              marginBottom: "2px"
            }
          },
          t2(s.titleKey)
        )
      ),
      // 底部常驻：bundle 的真实版本 + 当前暗色判据 + Segmented 实测（查「改了没生效」类问题的锚点）。
      (0, import_react31.createElement)(
        "div",
        {
          style: {
            marginTop: "18px",
            paddingTop: "10px",
            borderTop: "1px solid var(--dshpc-border-faint)",
            color: "var(--dshpc-fg-3)",
            fontSize: "11px",
            fontFamily: "var(--dshpc-font-mono)"
          }
        },
        (0, import_react31.createElement)("div", null, `core v${"0.2.14"}`),
        (0, import_react31.createElement)("div", null, `demo v${"0.2.14"}`),
        (0, import_react31.createElement)("div", { title: "body[data-ds-dark-theme]" }, `dark: ${dark ? "yes" : "no"}`),
        (0, import_react31.createElement)("div", { title: "\u5B9E\u6D4B\u9875\u9762\u4E0A\u7B2C\u4E00\u4E2A .dshpc-seg \u7684\u8F68\u9053\u5E95\u8272\u4E0E\u95F4\u8DDD" }, diag),
        (0, import_react31.createElement)("div", { title: "\u5B9E\u6D4B\u9875\u9762\u4E0A\u7B2C\u4E00\u4E2A .dshpc-btn" }, diag2),
        ...probes.map((line) => (0, import_react31.createElement)("div", { key: line, style: { marginTop: "4px", whiteSpace: "pre-wrap" } }, line))
      )
    ),
    (0, import_react31.createElement)(
      "main",
      { style: { flex: 1, minWidth: 0, minHeight: 0, height: "100%", boxSizing: "border-box", overflowY: "auto", padding: "12px 22px 60px" } },
      (0, import_react31.createElement)(Sections, { active, onNavigate: setActive })
    )
  );
}
function OpenPreviewCard(props) {
  return (0, import_react31.createElement)(
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
    (0, import_react31.createElement)(
      "div",
      null,
      (0, import_react31.createElement)("div", { style: { fontWeight: 600, fontSize: "14px" } }, t2("pluginTitle")),
      (0, import_react31.createElement)(
        "div",
        { style: { color: "var(--dshpc-fg-3)", fontSize: "12px", marginTop: "2px" } },
        t2("pluginCardDesc")
      )
    ),
    (0, import_react31.createElement)("span", { style: { color: "var(--dshpc-business)", fontSize: "13px" } }, t2("pluginCardOpen"))
  );
}
function PanelIcon() {
  return (0, import_react31.createElement)(
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
  setTooltipRenderer((props) => (0, import_react31.createElement)(import_dsh_client_ui_primitives2.Tooltip, props));
  {
    const el = document.createElement("style");
    el.setAttribute("data-legacy-tdt", "1");
    el.textContent = `${LEGACY_TDT_TOKENS_CSS}
${LEGACY_TDT_SEGMENTED_CSS}`;
    document.head.appendChild(el);
  }
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
        (props) => (0, import_react31.createElement)(OpenPreviewCard, { open: props?.open ?? (() => {
          jump(PANEL_ID);
        }) })
      );
    });
  });
}

return module.exports; } });

