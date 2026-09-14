# JS Entity Row

A Home Assistant entity row with client-side JavaScript templates. It is inspired
by [lovelace-template-entity-row](https://github.com/thomasloven/lovelace-template-entity-row),
but uses the same `[[[ return ... ]]]` syntax as JS Badge instead of Jinja.

This is an entity row, not a standalone card. Use it inside an Entities card.

## Installation

### HACS

1. Open HACS and select **Custom repositories**.
2. Add `https://github.com/isimagan/JS-Entity-Row` as a **Dashboard** repository.
3. Install **JS Entity Row**. HACS adds the dashboard resource automatically.
4. Refresh the browser.

### Manual

Copy `dist/JS-Entity-Row.js` to `config/www/JS-Entity-Row.js`, then add it as a
JavaScript module under **Settings → Dashboards → Resources**:

```text
/local/JS-Entity-Row.js
```

## Basic usage

```yaml
type: entities
entities:
  - type: custom:js-entity-row
    entity: light.kitchen
```

## Parameters

The JavaScript column shows whether the value supports a
`[[[ return ... ]]]` template.

| Parameter | Default without entity | Default with entity | JavaScript |
| --- | --- | --- | :---: |
| `entity` | — | — | ❌ |
| `name` | `Row` | Entity name | ✅ |
| `icon` | `mdi:ab-testing` | Entity icon | ✅ |
| `image` | — | Entity picture | ✅ |
| `state` | `-` | Formatted entity state | ✅ |
| `secondary` | — | — | ✅ |
| `color` | Home Assistant default | Home Assistant default | ✅ |
| `active` | Automatic | Entity state | ✅ |
| `condition` | `true` | `true` | ✅ |
| `tap_action` | `none` | `more-info` | ✅ |
| `hold_action` | `none` | `none` | ✅ |
| `double_tap_action` | `none` | `none` | ✅ |

An explicit `image` takes priority over `icon`. An explicit `icon` disables the
entity picture. If `active` is set, it overrides the entity's active/inactive icon
state; otherwise Home Assistant determines the icon state from the entity.

When `condition` returns `false`, the row is hidden. It defaults to `true`. The
`condition` and `active` templates must return actual booleans.

## JavaScript templates

Templates use triple brackets and must return a value:

```yaml
type: custom:js-entity-row
entity: sensor.battery
name: Battery
state: "[[[ return `${entity.state} %`; ]]]"
icon: "[[[ return Number(entity.state) < 20 ? 'mdi:battery-alert' : 'mdi:battery'; ]]]"
color: "[[[ return Number(entity.state) < 20 ? 'red' : 'green'; ]]]"
condition: "[[[ return entity !== undefined; ]]]"
```

Available variables:

- `entity` — the configured entity's state object, or `undefined`
- `states` — all Home Assistant state objects
- `hass` — the Home Assistant object
- `config` — the complete row configuration
- `user` — the current Home Assistant user
- `helpers` — `state(id)`, `attr(id, name)` and `hasEntity(id)` helpers

Template errors are logged to the browser console. They do not break the entire
Entities card; text falls back safely and an invalid `condition` leaves the row
visible.

Only use JavaScript templates you trust. They execute in your browser.

## Actions

Actions are triggered from the name/secondary-text area.

```yaml
type: custom:js-entity-row
entity: light.kitchen
tap_action:
  action: toggle
hold_action:
  action: more-info
double_tap_action:
  action: navigate
  navigation_path: /lovelace/lights
```

The entire action configuration may be templated:

```yaml
tap_action: >
  [[[ return entity.state === 'on'
    ? { action: 'toggle' }
    : { action: 'more-info' }; ]]]
```

### Multi-actions

Use `multi-action` or `multi-actions` with an `actions` array. Steps run in order.
A step containing only `delay` pauses the sequence; delays support milliseconds
and seconds.

```yaml
tap_action:
  action: multi-actions
  actions:
    - action: perform-action
      perform_action: light.turn_on
      target:
        entity_id: light.kitchen
    - delay: 500ms
    - action: navigate
      navigation_path: /lovelace/lights
```

## Planned

A later release will add a state-area action button and toggle, with
`button_text`, `toggle`, `button_action` and `toggle_action`. The display priority
will be button, toggle, then state text. These are intentionally not part of the
first release.

## Development

```bash
npm install
npm test
npm run build
```
