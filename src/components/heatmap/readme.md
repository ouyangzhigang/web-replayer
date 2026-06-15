# web-heatmap



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute      | Description | Type                                     | Default     |
| --------------------- | -------------- | ----------- | ---------------------------------------- | ----------- |
| `colorScheme`         | `color-scheme` |             | `"cool" \| "custom" \| "warm"`           | `'warm'`    |
| `events` _(required)_ | --             |             | `RrwebEvent[]`                           | `undefined` |
| `opacity`             | `opacity`      |             | `number`                                 | `0.6`       |
| `type`                | `type`         |             | `"all" \| "click" \| "move" \| "scroll"` | `'all'`     |


## Dependencies

### Used by

 - [web-replayer](../replayer)

### Depends on

- [heatmap-canvas](.)

### Graph
```mermaid
graph TD;
  web-heatmap --> heatmap-canvas
  web-replayer --> web-heatmap
  style web-heatmap fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
