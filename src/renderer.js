import { stateForIcon } from "./model.js";
import { ROW_STYLES } from "./styles.js";

function appendVisual(container, model, hass) {
  const badge = document.createElement("state-badge");
  badge.hass = hass;
  badge.stateObj = stateForIcon(model);
  badge.overrideIcon = model.icon || undefined;
  badge.overrideImage = model.image || undefined;
  badge.color = model.color || undefined;
  badge.stateColor = true;
  container.append(badge);
}

export function renderRow(root, model, hass) {
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
