import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';

export default class OrganizationPlacesOrCreditInfo extends Component {
  @service currentUser;

  get canShowCredit() {
    return this.currentUser.isAdminInOrganization && this.currentUser.organization.credit > 0;
  }

  <template>
    {{#if this.currentUser.prescriber.placesManagement}}
      <div class="organization-places-or-credit-info hide-on-mobile">
        {{#if (eq @placesCount 0)}}
          <span class="organization-places-or-credit-info__warning">
            <PixIcon @name="warning" @plainIcon={{true}} class="warning-icon" />
            {{t "navigation.places.number" count=@placesCount}}</span>
        {{else}}
          <span>{{t "navigation.places.number" count=@placesCount}}</span>
        {{/if}}
        {{#if this.currentUser.isAdminInOrganization}}
          <LinkTo @route="authenticated.places" class="organization-places-or-credit-info__link">
            {{t "navigation.places.link"}}
          </LinkTo>
        {{/if}}
      </div>
    {{else if this.canShowCredit}}
      <div class="organization-places-or-credit-info organization-places-or-credit-info--inline hide-on-mobile">
        <span>{{t "navigation.credits.number" count=this.currentUser.organization.credit}}</span>

        <PixTooltip @id="credit-info-tooltip" @position="bottom-left" @isWide={{true}} @isLight={{true}}>
          <:triggerElement>
            <PixIcon
              @name="help"
              @plainIcon={{true}}
              class="info-icon"
              tabindex="0"
              aria-describedby="credit-info-tooltip"
            />
          </:triggerElement>
          <:tooltip>
            {{t "navigation.credits.tooltip-text" htmlSafe=true}}
          </:tooltip>
        </PixTooltip>
      </div>
    {{/if}}
  </template>
}
