class JsEntityRow extends HTMLElement {
  setConfig(config) {
    if (!config || typeof config !== "object") {
      throw new Error("Invalid configuration");
    }
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _value(value, fallback = "") {
    if (value === undefined) return fallback;
    if (typeof value !== "string") return value;
    const match = value.match(/^\[\[\[([\s\S]*)\]\]\]$/);
    if (!match) return value;
    const entity = this._config.entity ? this._hass?.states[this._config.entity] : undefined;
    try {
      return Function("hass", "states", "entity", match[1])(
        this._hass,
        this._hass?.states ?? {},
        entity
      );
    } catch (error) {
      console.error("JS Entity Row template error", error);
      return fallback;
    }
  }

  _render() {
    if (!this._config || !this._hass) return;
    const entity = this._config.entity ? this._hass.states[this._config.entity] : undefined;
    const visible = this._value(this._config.condition, true);
    this.style.display = visible === false ? "none" : "";
    if (visible === false) return;

    const name = this._value(this._config.name, entity?.attributes?.friendly_name ?? "Row");
    const icon = this._value(this._config.icon, entity?.attributes?.icon ?? "mdi:ab-testing");
    const state = this._value(this._config.state, entity?.state ?? "");
    const secondary = this._value(this._config.secondary, "");
    const color = this._value(this._config.color, "var(--state-icon-color)");

    this.innerHTML = `<style>
      .row{display:flex;align-items:center;min-height:40px;gap:16px;cursor:pointer}
      ha-icon{color:${color};flex:none}
      .info{min-width:0;flex:1}.name,.secondary{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .secondary{color:var(--secondary-text-color);font-size:12px}.state{color:var(--secondary-text-color)}
    </style><div class="row"><ha-icon icon="${icon}"></ha-icon><div class="info"><div class="name">${name}</div>
    ${secondary ? `<div class="secondary">${secondary}</div>` : ""}</div><div class="state">${state}</div></div>`;
    this.querySelector(".row")?.addEventListener("click", () => {
      if (!this._config.entity) return;
      const event = new Event("hass-more-info", { bubbles: true, composed: true });
      event.detail = { entityId: this._config.entity };
      this.dispatchEvent(event);
    });
  }

  getCardSize() { return 1; }
}

if (!customElements.get("js-entity-row")) {
  customElements.define("js-entity-row", JsEntityRow);
}
window.customCards = window.customCards || [];
window.customCards.push({
  type: "js-entity-row",
  name: "JS Entity Row",
  description: "An entity row with JavaScript-templated values."
});
