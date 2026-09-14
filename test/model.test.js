import test from "node:test";
import assert from "node:assert/strict";
import { createRowModel, stateForIcon } from "../src/model.js";

const entity = {
  entity_id: "light.kitchen",
  state: "on",
  attributes: {
    friendly_name: "Kitchen",
    icon: "mdi:lightbulb",
    entity_picture: "/local/kitchen.png",
  },
};
const hass = { states: { "light.kitchen": entity }, user: { name: "Martin" } };

test("uses entity defaults and picture", () => {
  const model = createRowModel({ entity: "light.kitchen" }, hass);
  assert.equal(model.name, "Kitchen");
  assert.equal(model.state, "on");
  assert.equal(model.image, "/local/kitchen.png");
  assert.equal(model.icon, "");
  assert.equal(model.visible, true);
});

test("explicit image and icon priority is deterministic", () => {
  assert.equal(createRowModel({ entity: "light.kitchen", icon: "mdi:star" }, hass).image, "");
  const model = createRowModel({ entity: "light.kitchen", icon: "mdi:star", image: "/x.png" }, hass);
  assert.equal(model.image, "/x.png");
  assert.equal(model.icon, "");
});

test("evaluates templates with the JS Badge variables", () => {
  const model = createRowModel(
    {
      entity: "light.kitchen",
      name: "[[[ return `${entity.attributes.friendly_name}: ${helpers.state('light.kitchen')}`; ]]]",
      condition: "[[[ return states['light.kitchen'].state === 'on'; ]]]",
    },
    hass,
  );
  assert.equal(model.name, "Kitchen: on");
  assert.equal(model.visible, true);
});

test("condition defaults to visible and invalid templates fail open", () => {
  assert.equal(createRowModel({}, hass).visible, true);
  assert.equal(createRowModel({ condition: "[[[ throw new Error('bad'); ]]]" }, hass).visible, true);
});

test("explicit active overrides the icon state", () => {
  const model = createRowModel({ entity: "light.kitchen", active: false }, hass);
  assert.equal(stateForIcon(model).state, "off");
  assert.equal(entity.state, "on");
});

test("active also controls the fallback icon without an entity", () => {
  const model = createRowModel({ active: true }, hass);
  assert.equal(stateForIcon(model).state, "on");
  assert.equal(stateForIcon(model).entity_id, "binary_sensor.js_entity_row");
});
