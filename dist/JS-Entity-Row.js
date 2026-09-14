// version.json
var version_default = {
  version: "1.0.0"
};

// src/constants.js
var ELEMENT_TYPE = "js-entity-row";
var ELEMENT_NAME = "JS Entity Row";
var ELEMENT_VERSION = version_default.version;
var TEMPLATE_REGEX = /^\s*\[\[\[\s*([\s\S]*?)\s*\]\]\]\s*$/;

// src/template.js
function createTemplateHelpers(states) {
  return {
    state: (entityId) => states[entityId]?.state,
    attr: (entityId, attribute) => states[entityId]?.attributes?.[attribute],
    hasEntity: (entityId) => Boolean(states[entityId])
  };
}
function evaluateTemplate(value, { config, hass, entity }) {
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
      `"use strict";
${match[1]}`
    )(hass, entity, states, config, hass?.user, helpers);
  } catch (error) {
    console.error("[js-entity-row] Template error:", error, value);
    return void 0;
  }
}
function readBoolean(value, fallback, context, optionName) {
  if (value === void 0 || value === null) return fallback;
  const result = evaluateTemplate(value, context);
  if (typeof result === "boolean") return result;
  console.warn(`[js-entity-row] ${optionName} must resolve to a boolean.`);
  return fallback;
}

// src/model.js
function normalizeText(value, fallback = "") {
  if (value === void 0 || value === null || value === false) return fallback;
  return String(value);
}
function getEntity(config, hass) {
  return config.entity ? hass?.states?.[config.entity] : void 0;
}
function formatState(config, hass, entity) {
  if (config.entity && !entity) return "Entity not found";
  if (!entity) return "-";
  return hass?.formatEntityState?.(entity) ?? entity.state ?? "-";
}
function createRowModel(config, hass) {
  const entity = getEntity(config, hass);
  const context = { config, hass, entity };
  const read = (value) => evaluateTemplate(value, context);
  const explicitIcon = config.icon !== void 0 && config.icon !== null;
  const explicitImage = config.image !== void 0 && config.image !== null;
  const image = normalizeText(
    explicitImage ? read(config.image) : !explicitIcon ? entity?.attributes?.entity_picture : ""
  );
  const icon = normalizeText(
    explicitIcon ? read(config.icon) : entity?.attributes?.icon ?? "mdi:ab-testing"
  );
  return {
    entity,
    visible: readBoolean(config.condition, true, context, "condition"),
    active: config.active === void 0 || config.active === null ? void 0 : readBoolean(config.active, void 0, context, "active"),
    name: normalizeText(
      read(config.name ?? entity?.attributes?.friendly_name ?? config.entity ?? "Row"),
      "Row"
    ),
    secondary: normalizeText(read(config.secondary)),
    state: normalizeText(read(config.state ?? formatState(config, hass, entity)), "-"),
    image,
    icon: image ? "" : icon,
    color: normalizeText(read(config.color))
  };
}
function stateForIcon(model) {
  const base = model.entity ?? {
    entity_id: "binary_sensor.js_entity_row",
    state: "off",
    attributes: {}
  };
  if (model.active === void 0) return base;
  const attributes = { ...base.attributes };
  if (model.active) attributes.brightness ??= 255;
  return {
    ...base,
    state: model.active ? "on" : "off",
    attributes
  };
}

// src/styles.js
var ROW_STYLES = `
  :host { display: block; }
  :host([hidden]) { display: none !important; }
  .row {
    display: flex;
    align-items: center;
    min-height: 40px;
    color: var(--primary-text-color);
  }
  .visual {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    margin-inline-end: 16px;
    flex: 0 0 40px;
  }
  state-badge { flex: 0 0 auto; }
  .info {
    min-width: 0;
    flex: 1 1 auto;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
  .name, .secondary, .state {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .secondary {
    color: var(--secondary-text-color);
    font-size: var(--ha-font-size-s, 12px);
    line-height: 16px;
  }
  .state {
    margin-inline-start: 16px;
    text-align: end;
    flex: 0 1 auto;
    color: var(--secondary-text-color);
  }
`;

// src/renderer.js
function appendVisual(container, model, hass) {
  const badge = document.createElement("state-badge");
  badge.hass = hass;
  badge.stateObj = stateForIcon(model);
  badge.overrideIcon = model.icon || void 0;
  badge.overrideImage = model.image || void 0;
  badge.color = model.color || void 0;
  badge.stateColor = true;
  container.append(badge);
}
function renderRow(root, model, hass) {
  root.innerHTML = `
    <style>${ROW_STYLES}</style>
    <div class="row">
      <div class="visual"></div>
      <div class="info" role="button" tabindex="0">
        <div class="name"></div>
        <div class="secondary"></div>
      </div>
      <div class="state"></div>
    </div>
  `;
  root.querySelector(".name").textContent = model.name;
  const secondary = root.querySelector(".secondary");
  secondary.textContent = model.secondary;
  secondary.hidden = !model.secondary;
  root.querySelector(".state").textContent = model.state;
  appendVisual(root.querySelector(".visual"), model, hass);
  return root.querySelector(".info");
}

// src/actions.js
var ACTION_PROPERTY = Object.freeze({
  tap: "tap_action",
  hold: "hold_action",
  double_tap: "double_tap_action"
});
function actionConfig(config, action, context) {
  const property = ACTION_PROPERTY[action];
  if (!property) return { action: "none" };
  const fallback = action === "tap" && config.entity ? { action: "more-info" } : { action: "none" };
  const configured = config[property];
  if (configured === void 0 || configured === null) return fallback;
  return evaluateTemplate(configured, context) ?? fallback;
}
function fireHassAction(host, baseConfig, action, configuredAction) {
  const event = new Event("hass-action", { bubbles: true, composed: true });
  event.detail = {
    action,
    config: { ...baseConfig, [`${action}_action`]: configuredAction }
  };
  host.dispatchEvent(event);
}
function parseDelay(value) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, value);
  if (typeof value !== "string") return 0;
  const match = value.trim().toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(ms|s)?$/);
  if (!match) return 0;
  return Number(match[1]) * (match[2] === "s" ? 1e3 : 1);
}
var wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
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
    action.target
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
async function runConfiguredAction(host, hass, config, action) {
  const entity = config.entity ? hass?.states?.[config.entity] : void 0;
  const configuredAction = actionConfig(config, action, { config, hass, entity });
  if (isMultiAction(configuredAction)) {
    await runSequence(host, hass, config, configuredAction);
  } else if (isServiceAction(configuredAction)) {
    await runService(hass, configuredAction);
  } else if (configuredAction?.action !== "none") {
    fireHassAction(host, config, action, configuredAction);
  }
}

// src/interactions.js
var HOLD_DELAY = 500;
var DOUBLE_TAP_DELAY = 250;
var RowInteractions = class {
  constructor(host) {
    this.host = host;
  }
  update(hass, config) {
    this.hass = hass;
    this.config = config;
  }
  bind(target) {
    target.addEventListener("pointerdown", () => this.pointerDown());
    target.addEventListener("pointerup", () => this.pointerUp());
    target.addEventListener("pointerleave", () => this.pointerUp());
    target.addEventListener("pointercancel", () => this.pointerUp());
    target.addEventListener("click", (event) => this.click(event));
    target.addEventListener("dblclick", (event) => this.doubleClick(event));
    target.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.run("tap");
      }
    });
  }
  run(action) {
    void runConfiguredAction(this.host, this.hass, this.config, action).catch((error) => {
      console.error(`[js-entity-row] ${action} action failed:`, error);
    });
  }
  pointerDown() {
    clearTimeout(this.holdTimer);
    this.holdTriggered = false;
    this.holdTimer = setTimeout(() => {
      this.holdTriggered = true;
      this.run("hold");
    }, HOLD_DELAY);
  }
  pointerUp() {
    clearTimeout(this.holdTimer);
  }
  click(event) {
    if (this.holdTriggered) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    clearTimeout(this.tapTimer);
    this.tapTimer = setTimeout(() => this.run("tap"), DOUBLE_TAP_DELAY);
  }
  doubleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    clearTimeout(this.tapTimer);
    this.run("double_tap");
  }
};

// src/js-entity-row.js
var JsEntityRow = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._interactions = new RowInteractions(this);
  }
  setConfig(config) {
    if (!config || typeof config !== "object") {
      throw new Error("JS Entity Row requires a configuration object.");
    }
    this._config = config;
    this._render();
  }
  set hass(hass) {
    this._hass = hass;
    this._render();
  }
  _render() {
    if (!this.shadowRoot) return;
    const model = createRowModel(this._config, this._hass);
    this.hidden = !model.visible;
    if (!model.visible) {
      this.shadowRoot.replaceChildren();
      return;
    }
    const actionTarget = renderRow(this.shadowRoot, model, this._hass);
    this._interactions.update(this._hass, this._config);
    this._interactions.bind(actionTarget);
  }
};

// src/index.js
if (!customElements.get(ELEMENT_TYPE)) {
  customElements.define(ELEMENT_TYPE, JsEntityRow);
}
console.info(
  `%c${ELEMENT_NAME} ${ELEMENT_VERSION}`,
  "color: var(--primary-color); font-weight: bold;"
);
