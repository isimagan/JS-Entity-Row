# Building plan

Based on [lovelace-template-entity-row](https://github.com/thomasloven/lovelace-template-entity-row).

## Version 1

| Parameter | Required | Type | JS | Default | Default with entity | Description |
| --- | :---: | --- | :---: | --- | --- | --- |
| `entity` | No | entity ID | ❌ | — | — | Supplies entity defaults and enables the default more-info action. |
| `name` | No | string | ✅ | `Row` | Entity name | Primary row text. |
| `icon` | No | string | ✅ | `mdi:ab-testing` | Entity icon | Explicit icon disables the entity picture. |
| `image` | No | string | ✅ | — | Entity picture | Explicit image has priority over the icon. |
| `state` | No | string | ✅ | `-` | Formatted entity state | Right-aligned state text. |
| `secondary` | No | string | ✅ | — | — | Secondary text below the name. |
| `color` | No | CSS color | ✅ | Automatic | Automatic | Overrides the icon color. |
| `active` | No | boolean | ✅ | Automatic | Entity state | Explicit value overrides the entity's active icon state. |
| `condition` | No | boolean | ✅ | `true` | `true` | The row is hidden only when this resolves to `false`. |
| `tap_action` | No | action | ✅ | `none` | `more-info` | Tap the name/secondary area. |
| `hold_action` | No | action | ✅ | `none` | `none` | Hold the name/secondary area. |
| `double_tap_action` | No | action | ✅ | `none` | `none` | Double-tap the name/secondary area. |

JavaScript templates use `[[[ return ... ]]]` and receive `entity`, `states`,
`hass`, `config`, `user` and `helpers`, matching JS Badge. Errors are logged and
handled without breaking the parent Entities card. `condition` fails open.

All actions support sequential multi-actions using `action: multi-actions` and an
`actions` array. `action: multi-action` is accepted as an alias. Delay steps are
supported.

## Future version

The state area will support three mutually exclusive presentations in this order:

1. Action button when `button_text` is defined.
2. Toggle when `toggle` is `true`.
3. State string.

| Parameter | Type | Description |
| --- | --- | --- |
| `button_text` | string / JS | Shows an action button with this text. |
| `toggle` | boolean / JS | Shows a toggle when `true`. |
| `state` | string / JS | State text when neither button nor toggle is active. |
| `toggle_action` | action / JS | Toggle interaction; supports multi-actions. |
| `button_action` | action / JS | Button interaction; supports multi-actions. |
