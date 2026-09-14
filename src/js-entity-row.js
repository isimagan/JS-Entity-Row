import { createRowModel } from "./model.js";
import { renderRow } from "./renderer.js";
import { RowInteractions } from "./interactions.js";

export class JsEntityRow extends HTMLElement {
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
}
