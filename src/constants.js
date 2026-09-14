import version from "../version.json" with { type: "json" };

export const ELEMENT_TYPE = "js-entity-row";
export const ELEMENT_NAME = "JS Entity Row";
export const ELEMENT_VERSION = version.version;
export const TEMPLATE_REGEX = /^\s*\[\[\[\s*([\s\S]*?)\s*\]\]\]\s*$/;
