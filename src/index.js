import { ELEMENT_NAME, ELEMENT_TYPE, ELEMENT_VERSION } from "./constants.js";
import { JsEntityRow } from "./js-entity-row.js";

if (!customElements.get(ELEMENT_TYPE)) {
  customElements.define(ELEMENT_TYPE, JsEntityRow);
}

console.info(
  `%c${ELEMENT_NAME} ${ELEMENT_VERSION}`,
  "color: var(--primary-color); font-weight: bold;",
);
