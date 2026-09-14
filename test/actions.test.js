import test from "node:test";
import assert from "node:assert/strict";
import { actionConfig } from "../src/actions.js";

const context = { config: {}, hass: { states: {} }, entity: undefined };

test("tap defaults to more-info only with an entity", () => {
  assert.deepEqual(actionConfig({ entity: "light.kitchen" }, "tap", context), { action: "more-info" });
  assert.deepEqual(actionConfig({}, "tap", context), { action: "none" });
});

test("actions may be returned by JavaScript", () => {
  const config = { tap_action: "[[[ return { action: 'navigate', navigation_path: '/lights' }; ]]]" };
  assert.deepEqual(actionConfig(config, "tap", { ...context, config }), {
    action: "navigate",
    navigation_path: "/lights",
  });
});
