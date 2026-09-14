import { evaluateTemplate } from "./template.js";

const ACTION_PROPERTY = Object.freeze({
  tap: "tap_action",
  hold: "hold_action",
  double_tap: "double_tap_action",
});

export function actionConfig(config, action, context) {
  const property = ACTION_PROPERTY[action];
  if (!property) return { action: "none" };
  const fallback =
    action === "tap" && config.entity
      ? { action: "more-info" }
      : { action: "none" };
  const configured = config[property];
  if (configured === undefined || configured === null) return fallback;
  return evaluateTemplate(configured, context) ?? fallback;
}

function fireHassAction(host, baseConfig, action, configuredAction) {
  const event = new Event("hass-action", { bubbles: true, composed: true });
  event.detail = {
    action,
    config: { ...baseConfig, [`${action}_action`]: configuredAction },
  };
  host.dispatchEvent(event);
}

function parseDelay(value) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, value);
  if (typeof value !== "string") return 0;
  const match = value.trim().toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(ms|s)?$/);
  if (!match) return 0;
  return Number(match[1]) * (match[2] === "s" ? 1000 : 1);
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function isMultiAction(action) {
  return ["multi-action", "multi-actions"].includes(action?.action);
}

function isServiceAction(action) {
  return ["perform-action", "call-service", "call_service"].includes(action?.action);
}

async function runService(hass, action) {
  const serviceName = action.perform_action ?? action.service;
  const separator = serviceName?.indexOf(".") ?? -1;
  if (separator < 1 || !hass?.callService) {
    console.warn("[js-entity-row] Invalid service action:", action);
    return;
  }
  await hass.callService(
    serviceName.slice(0, separator),
    serviceName.slice(separator + 1),
    action.data ?? action.service_data ?? {},
    action.target,
  );
}

async function runStep(host, hass, config, step) {
  if (!step || step.action === "none") return;
  if (Object.hasOwn(step, "delay")) {
    await wait(parseDelay(step.delay));
  } else if (isMultiAction(step)) {
    await runSequence(host, hass, config, step);
  } else if (isServiceAction(step)) {
    await runService(hass, step);
  } else {
    fireHassAction(host, config, "tap", step);
  }
}

async function runSequence(host, hass, config, action) {
  const sequence = action.actions ?? action.sequence ?? [];
  if (!Array.isArray(sequence)) {
    console.warn("[js-entity-row] Multi-action sequence must be an array.");
    return;
  }
  for (const step of sequence) await runStep(host, hass, config, step);
}

export async function runConfiguredAction(host, hass, config, action) {
  const entity = config.entity ? hass?.states?.[config.entity] : undefined;
  const configuredAction = actionConfig(config, action, { config, hass, entity });
  if (isMultiAction(configuredAction)) {
    await runSequence(host, hass, config, configuredAction);
  } else if (isServiceAction(configuredAction)) {
    await runService(hass, configuredAction);
  } else if (configuredAction?.action !== "none") {
    fireHassAction(host, config, action, configuredAction);
  }
}
