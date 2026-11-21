// Public, read-only tools. The generator embeds the same catalog used by MCP.
(() => {
  'use strict';
  const context = document.modelContext ?? navigator.modelContext;
  if (!context || typeof context.registerTool !== 'function') return;
  const catalog = __PUBLIC_CATALOG__;
  const result = data => ({ content: [{ type: 'text', text: JSON.stringify(data) }], structuredContent: data });
  function execute(name, input = {}) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Arguments must be an object');
    if (name !== 'estimate_project') {
      if (Object.keys(input).length) throw new Error('This tool takes no arguments');
      return name === 'list_systems' ? { systems: catalog.products, services: catalog.estimate.systems } : catalog.contact;
    }
    if (Object.keys(input).some(key => !['systems', 'model'].includes(key))) throw new Error('Unknown argument');
    const systems = input.systems, model = Object.hasOwn(input, 'model') ? input.model : 'template';
    if (!Array.isArray(systems) || !systems.length || systems.length > 6 || new Set(systems).size !== systems.length ||
        systems.some(key => typeof key !== 'string' || !Object.hasOwn(catalog.estimate.systems, key)) ||
        typeof model !== 'string' || !Object.hasOwn(catalog.estimate.models, model)) throw new Error('Invalid systems or model');
    const tier = catalog.estimate.rates[model].find(rate => systems.length <= rate.count);
    return { currency: 'THB', min: tier.min, max: tier.max, plus: !!tier.plus, model,
      unit: model === 'retainer' ? 'month' : 'project', timeline: tier.time,
      systems, estimateOnly: true, note: catalog.estimateNote, pricingUrl: catalog.site.origin + '/pricing' };
  }
  for (const definition of catalog.tools) {
    const tool = { ...definition, annotations: { readOnlyHint: true, consequentialHint: false },
      execute: async (input, options) => {
        options?.signal?.throwIfAborted();
        try { return result(execute(definition.name, input)); }
        catch (error) { return { content: [{ type: 'text', text: error.message }], isError: true }; }
      }
    };
    try { Promise.resolve(context.registerTool(tool)).catch(() => {}); } catch { /* Unsupported draft: keep the normal page usable. */ }
  }
})();
