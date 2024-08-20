import Component from '@glimmer/component';

import Card from '../card';

export default class PreviousChallenges extends Component {
  incrementIndex(index) {
    return index + 1;
  }

  <template>
    <section class="admin-form__content">
      <Card class="admin-form__card previous-challenges" @title="Précédentes épreuves">
        <div class="previous-challenges__container">
          {{#each @challenges as |challenge index|}}
            <div class="previous-challenges__result {{challenge.result}}">
              <p class="previous-challenges__result__count">Épreuve {{this.incrementIndex index}}</p>
              <h2>{{challenge.skill.name}}</h2>
              <p class="previous-challenges__result__focused">Focus : {{if challenge.focused "Oui" "Non"}}</p>
              <p class="previous-challenges__result__timed">Temps imparti: {{if challenge.timer "Oui" "Non"}}</p>
            </div>
          {{/each}}
        </div>
      </Card>
    </section>
  </template>
}
