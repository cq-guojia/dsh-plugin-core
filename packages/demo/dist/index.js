// dist/host/index.js
async function buildModelRoutes(llm) {
  const routes = [];
  for (const provider of llm.listProviders()) {
    try {
      const models = await llm.listModels(provider.id);
      if (models.length === 0)
        continue;
      routes.push({
        provider: provider.id,
        displayName: provider.name,
        models: models.map((model) => model.name === void 0 ? { id: model.id } : { id: model.id, name: model.name })
      });
    } catch {
    }
  }
  routes.sort((left, right) => left.displayName.localeCompare(right.displayName));
  return routes;
}
function serveModelCatalog(ctx, options) {
  ctx.inject(["llm", "webServer"], (services) => {
    const llm = services.llm;
    const webServer = services.webServer;
    if (llm === void 0 || webServer === void 0)
      return;
    webServer.register({
      kind: "exact",
      path: options.path,
      handler: async (_req, res) => {
        const routes = await buildModelRoutes(llm);
        res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ routes }));
      }
    });
  });
}
function collectArchivedSessionIds(registry) {
  const out = /* @__PURE__ */ new Set();
  for (const entity of registry.list()) {
    for (const id of entity.archivedSessionIds ?? [])
      out.add(id);
  }
  return [...out];
}
function serveArchivedSessions(ctx, options) {
  ctx.inject(["workspaceRegistry", "webServer"], (services) => {
    const registry = services.workspaceRegistry;
    const webServer = services.webServer;
    if (registry === void 0 || typeof registry.list !== "function" || webServer === void 0)
      return;
    webServer.register({
      kind: "exact",
      path: options.path,
      handler: (_req, res) => {
        const archived = collectArchivedSessionIds(registry);
        res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ archived }));
      }
    });
  });
}

// packages/demo/src/paths.ts
var MODELS_PATH = "/api/dsh-plugin-core-demo/models";
var ARCHIVED_SESSIONS_PATH = "/api/dsh-plugin-core-demo/archived-sessions";

// packages/demo/src/index.ts
var name = "dsh-plugin-core-demo";
var inject = [];
function apply(ctx) {
  serveModelCatalog(ctx, { path: MODELS_PATH });
  serveArchivedSessions(ctx, { path: ARCHIVED_SESSIONS_PATH });
}
export {
  apply,
  inject,
  name
};
