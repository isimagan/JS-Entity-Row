import { runConfiguredAction } from "./actions.js";

const HOLD_DELAY = 500;
const DOUBLE_TAP_DELAY = 250;

export class RowInteractions {
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
}
