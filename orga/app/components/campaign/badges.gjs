import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';

<template>
  {{#each @badges as |badge|}}
    <PixTooltip @id="badge-tooltip-{{badge.id}}" @position="bottom" @isInline={{true}}>
      <:triggerElement>
        <img
          src={{badge.imageUrl}}
          alt={{badge.altMessage}}
          tabindex="0"
          aria-describedby="badge-tooltip-{{badge.id}}"
        />
      </:triggerElement>
      <:tooltip>
        {{badge.title}}
      </:tooltip>
    </PixTooltip>
  {{/each}}
</template>
