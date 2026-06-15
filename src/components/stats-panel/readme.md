# web-stats-panel



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute | Description | Type                               | Default                                               |
| --------------------- | --------- | ----------- | ---------------------------------- | ----------------------------------------------------- |
| `events` _(required)_ | --        |             | `RrwebEvent[]`                     | `undefined`                                           |
| `layout`              | `layout`  |             | `"bottom" \| "modal" \| "sidebar"` | `'sidebar'`                                           |
| `metrics`             | --        |             | `StatsMetric[]`                    | `['clicks', 'scrolls', 'inputs', 'duration', 'path']` |


## Dependencies

### Used by

 - [web-replayer](../replayer)

### Depends on

- [stats-chart](.)

### Graph
```mermaid
graph TD;
  web-stats-panel --> stats-chart
  web-replayer --> web-stats-panel
  style web-stats-panel fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
