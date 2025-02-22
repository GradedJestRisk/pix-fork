import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { hash } from '@ember/helper';
import { t } from 'ember-intl';

import Details from './trigger/details';

<template>
  <section class="page-section trigger-card">
    <h2 class="trigger-card__title">
      <span>{{t "pages.trainings.training.triggers.prerequisite.title"}}</span>
      {{#if @training.prerequisiteTrigger}}
        <strong class="trigger-card__threshold">Seuil&nbsp;: {{@training.prerequisiteTrigger.threshold}}%</strong>
        <PixTag class="trigger-card__tubes-count" @color="grey-light">
          {{@training.prerequisiteTrigger.tubesCount}}
          sujets
        </PixTag>
      {{/if}}
    </h2>
    <p class="trigger-card__description">{{t "pages.trainings.training.triggers.prerequisite.edit.description"}}</p>

    {{#if @training.prerequisiteTrigger}}
      <Details @areas={{@training.prerequisiteTrigger.areas}} />
    {{else}}
      <PixButtonLink
        class="trigger-card__toggler"
        @route="authenticated.trainings.training.triggers.edit"
        @query={{hash type="prerequisite"}}
        @variant="secondary"
        aria-label={{t "pages.trainings.training.triggers.prerequisite.alternative-title"}}
        @iconBefore="plus"
      >
        {{t "pages.trainings.training.triggers.prerequisite.title"}}
      </PixButtonLink>
    {{/if}}
  </section>

  <section class="page-section trigger-card">
    <h2 class="trigger-card__title">
      <span>{{t "pages.trainings.training.triggers.goal.title"}}</span>
      {{#if @training.goalTrigger}}
        <strong class="trigger-card__threshold">Seuil&nbsp;: {{@training.goalTrigger.threshold}}%</strong>
        <PixTag class="trigger-card__tubes-count" @color="grey-light">
          {{@training.goalTrigger.tubesCount}}
          sujets
        </PixTag>
      {{/if}}
    </h2>
    <p class="trigger-card__description">{{t "pages.trainings.training.triggers.goal.edit.description"}}</p>
    {{#if @training.goalTrigger}}
      <Details @areas={{@training.goalTrigger.areas}} />
    {{else}}
      <PixButtonLink
        class="trigger-card__toggler"
        @route="authenticated.trainings.training.triggers.edit"
        @query={{hash type="goal"}}
        @variant="secondary"
        aria-label={{t "pages.trainings.training.triggers.goal.alternative-title"}}
        @iconBefore="plus"
      >
        {{t "pages.trainings.training.triggers.goal.title"}}
      </PixButtonLink>
    {{/if}}
  </section>
</template>
