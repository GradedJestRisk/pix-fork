import PixButton from '@1024pix/pix-ui/components/pix-button';
import { fn } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';
import formatDate from 'pix-admin/helpers/format-date';

export default class OrganizationLearnerInformation extends Component {
  @service accessControl;

  <template>
    <header class="page-section__header">
      <h2 class="page-section__title">Informations prescrit</h2>
    </header>

    <div class="organization-learners-table content-text content-text--small">
      <table class="table-admin">
        <thead>
          <tr>
            <th>Prénom</th>
            <th>Nom</th>
            <th>DDN</th>
            <th>Classe / Groupe</th>
            <th class="table__column--wide">Organisation</th>
            <th>Création</th>
            <th>Dernière MAJ</th>
            <th class="table__column--small">Actif</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {{#each @user.organizationLearners as |organizationLearner|}}
            <tr aria-label="Inscription">
              <td>{{organizationLearner.firstName}}</td>
              <td>{{organizationLearner.lastName}}</td>
              <td>{{formatDate organizationLearner.birthdate}}</td>
              <td>
                {{if organizationLearner.division organizationLearner.division}}
                {{if organizationLearner.group organizationLearner.group}}
              </td>
              <td>
                <LinkTo @route="authenticated.organizations.get" @model={{organizationLearner.organizationId}}>
                  {{organizationLearner.organizationName}}
                </LinkTo>
              </td>
              <td>{{formatDate organizationLearner.createdAt}}</td>
              <td>{{formatDate organizationLearner.updatedAt}}</td>
              <td class="table-admin-organization-learners-status">
                {{#if organizationLearner.isDisabled}}
                  <FaIcon
                    @icon="circle-xmark"
                    class="organization-learners-table__status--isDisabled"
                    aria-label="Inscription désactivée"
                  />
                {{else}}
                  <FaIcon
                    @icon="circle-check"
                    class="organization-learners-table__status--isEnabled"
                    aria-label="Inscription activée"
                  />
                {{/if}}
              </td>
              <td>
                {{#if this.accessControl.hasAccessToUsersActionsScope}}
                  {{#if organizationLearner.canBeDissociated}}
                    <PixButton
                      @triggerAction={{fn @toggleDisplayDissociateModal organizationLearner}}
                      @size="small"
                      @variant="error"
                    >
                      Dissocier
                    </PixButton>
                  {{/if}}
                {{/if}}
              </td>
            </tr>
          {{else}}
            <tr>
              <td colspan="9" class="table-admin-empty">Aucun résultat</td>
            </tr>
          {{/each}}
        </tbody>
      </table>
    </div>
  </template>
}
