import PixButton from '@1024pix/pix-ui/components/pix-button';
import { fn } from '@ember/helper';
import Component from '@glimmer/component';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';

export default class CertificationCenterInvitations extends Component {
  get sortedCertificationCenterInvitations() {
    return this.args.certificationCenterInvitations.sortBy('updatedAt').reverse();
  }

  <template>
    <section class="page-section">
      <header class="page-section__header">
        <h2 class="page-section__title">Invitations</h2>
      </header>
      <div class="content-text content-text--small">
        <div class="table-admin">
          {{#if this.sortedCertificationCenterInvitations}}
            <table>
              <thead>
                <tr>
                  <th>Adresse e-mail</th>
                  <th>Rôle</th>
                  <th>Date de dernier envoi</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {{#each this.sortedCertificationCenterInvitations as |invitation|}}
                  <tr aria-label="Invitation en attente de {{invitation.email}}">
                    <td>{{invitation.email}}</td>
                    <td>{{invitation.roleLabel}}</td>
                    <td>{{dayjsFormat invitation.updatedAt "DD/MM/YYYY [-] HH:mm"}}</td>
                    <td>
                      <PixButton
                        @size="small"
                        @variant="error"
                        class="certification-center-invitations-actions__button"
                        aria-label="Annuler l’invitation de {{invitation.email}}"
                        @triggerAction={{fn @onCancelCertificationCenterInvitation invitation}}
                        @iconBefore="delete"
                      >
                        Annuler l’invitation
                      </PixButton>
                    </td>
                  </tr>
                {{/each}}
              </tbody>
            </table>
          {{else}}
            <p class="certification-center-invitations__message">Aucune invitation en attente</p>
          {{/if}}
        </div>
      </div>
    </section>
  </template>
}
