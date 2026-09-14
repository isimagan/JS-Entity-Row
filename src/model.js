import { evaluateTemplate, readBoolean } from "./template.js";

function normalizeText(value, fallback = "") {
  if (value === undefined || value === null || value === false) return fallback;
  return String(value);
}

export function getEntity(config, hass) {
  return config.entity ? hass?.states?.[config.entity] : undefined;
}

export function formatState(config, hass, entity) {
  if (config.entity && !entity) return "Entity not found";
  if (!entity) return "-";
  return hass?.formatEntityState?.(entity) ?? entity.state ?? "-";
}

export function createRowModel(config, hass) {
  const entity = getEntity(config, hass);
  const context = { config, hass, entity };
  const read = (value) => evaluateTemplate(value, context);
  const explicitIcon = config.icon !== undefined && config.icon !== null;
  const explicitImage = config.image !== undefined && config.image !== null;

  const image = normalizeText(
    explicitImage ? read(config.image) : !explicitIcon ? entity?.attributes?.entity_picture : "",
  );
  const icon = normalizeText(
    explicitIcon ? read(config.icon) : entity?.attributes?.icon ?? "mdi:ab-testing",
  );

  return {
    entity,
    visible: readBoolean(config.condition, true, context, "condition"),
    active:
      config.active === undefined || config.active === null
        ? undefined
        : readBoolean(config.active, undefined, context, "active"),
    name: normalizeText(
      read(config.name ?? entity?.attributes?.friendly_name ?? config.entity ?? "Row"),
      "Row",
    ),
    secondary: normalizeText(read(config.secondary)),
    state: normalizeText(read(config.state ?? formatState(config, hass, entity)), "-"),
    image,
    icon: image ? "" : icon,
    color: normalizeText(read(config.color)),
  };
}

export function stateForIcon(model) {
  const base = model.entity ?? {
    entity_id: "binary_sensor.js_entity_row",
    state: "off",
    attributes: {},
  };
  if (model.active === undefined) return base;
  const attributes = { ...base.attributes };
  if (model.active) attributes.brightness ??= 255;
  return {
    ...base,
    state: model.active ? "on" : "off",
    attributes,
  };
}
