import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'wr-tooltip',
  styleUrl: 'tooltip.css',
  shadow: true,
})
export class WrTooltip {
  @Prop() text!: string;
  @Prop() position: 'top' | 'bottom' | 'left' | 'right' = 'top';

  render() {
    return (
      <div class={`tooltip tooltip-${this.position}`}>
        <span class="tooltip-content">{this.text}</span>
      </div>
    );
  }
}
