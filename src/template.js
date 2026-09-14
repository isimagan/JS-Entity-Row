import { TEMPLATE_REGEX } from "./constants.js";

export function createTemplateHelpers(states) {
  return {
    state: (entityId) => states[entityId]?.state,
    attr: (entityId, attribute) => states[entityId]?.attributes?.[attribute],
    hasEntity: (entityId) => Boolean(states[entityId]),
  };
}

export function evaluateTemplate(value, { config, hass, entity }) {
  if (typeof value !== "string") return value;

  const match = value.match(TEMPLATE_REGEX);
  if (!match) return value;

  const states = hass?.states ?? {};
  const helpers = createTemplateHelpers(states);

  try {
    return Function(
      "hass",
      "entity",
      "states",
      "config",
      "user",
      "helpers",
      `"use strict";\n${match[1]}`,
    )(hass, entity, states, config, hass?.user, helpers);
  } catch (error) {
    console.error("[js-entity-row] Template error:", error, value);
    return undefined;
  }
}

export function readBoolean(value, fallback, context, optionName) {
  if (value === undefined || value === null) return fallback;
  const result = evaluateTemplate(value, context);
  if (typeof result === "boolean") return result;
  console.warn(`[js-entity-row] ${optionName} must resolve to a boolean.`);
  return fallback;
}
