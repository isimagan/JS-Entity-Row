# JS Entity Row

A Home Assistant dashboard entity row with JavaScript-templated values.

## Install with HACS

1. Open HACS and choose **Custom repositories**.
2. Add `https://github.com/isimagan/JS-Entity-Row` as **Dashboard**.
3. Download **JS Entity Row**. HACS adds the dashboard resource automatically.
4. Refresh the browser.

## Basic use

```yaml
type: entities
entities:
  - type: custom:js-entity-row
    entity: light.living_room
    name: '[[[ return entity?.attributes?.friendly_name ?? "Living room"; ]]]'
    state: '[[[ return entity?.state; ]]]'
```

Values wrapped in `[[[ ... ]]]` are evaluated with `hass`, `states`, and `entity` available.
