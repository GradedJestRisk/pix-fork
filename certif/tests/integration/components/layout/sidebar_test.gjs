import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import Sidebar from 'pix-certif/components/layout/sidebar';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupRenderingIntlTest from '../../../helpers/setup-intl-rendering';

const LINK_SCO = 'http://cloud.pix.fr/s/GqwW6dFDDrHezfS';
const LINK_OTHER = 'http://cloud.pix.fr/s/fLSG4mYCcX7GDRF';

module('Integration | Component | Layout | Sidebar', function (hooks) {
  setupRenderingIntlTest(hooks);

  let store;
  let currentAllowedCertificationCenterAccess;
  let certificationPointOfContact;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
      id: '123',
      name: 'allowedCenter',
      type: 'NOT_SCO',
    });
    certificationPointOfContact = {
      firstName: 'Alain',
      lastName: 'Cendy',
    };

    class CurrentUserStub extends Service {
      currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      certificationPointOfContact = certificationPointOfContact;
      updateCurrentCertificationCenter = sinon.stub();
    }

    this.owner.register('service:current-user', CurrentUserStub);
  });

  module('Sessions link', function () {
    test('should display the sessions link', async function (assert) {
      // given
      // when
      const screen = await render(<template><Sidebar /></template>);

      // then
      assert.dom(screen.queryByLabelText(t('navigation.main.sessions-label'))).exists();
    });

    module('when certif center is blocked', function () {
      test('should not display the sessions link', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
          id: '456',
          isAccessBlockedCollege: true,
          isAccessBlockedLycee: false,
          isAccessBlockedAEFE: false,
          isAccessBlockedAgri: false,
        });
        certificationPointOfContact = {
          firstName: 'Alain',
          lastName: 'Proviste',
        };

        class CurrentUserStub extends Service {
          currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
          certificationPointOfContact = certificationPointOfContact;
          updateCurrentCertificationCenter = sinon.stub();
        }

        this.owner.register('service:current-user', CurrentUserStub);

        // when
        const screen = await render(<template><Sidebar /></template>);

        // then
        assert.dom(screen.queryByLabelText(t('navigation.main.sessions-label'))).doesNotExist();
      });
    });
  });

  module('Documentation link', function () {
    test('should return the dedicated link for non SCO isManagingStudents certification center', async function (assert) {
      // given / when
      const screen = await render(<template><Sidebar /></template>);

      // then
      assert
        .dom(screen.getByRole('link', { name: t('navigation.main.documentation') }))
        .hasAttribute('href', LINK_OTHER);
    });

    test('should return the dedicated link for SCO isManagingStudents certification center', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        id: '555',
        name: 'AllowedCenter',
        type: 'SCO',
        isRelatedToManagingStudentsOrganization: true,
      });
      certificationPointOfContact = {
        firstName: 'Alain',
        lastName: 'Térieur',
      };

      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
        certificationPointOfContact = certificationPointOfContact;
        updateCurrentCertificationCenter = sinon.stub();
      }

      this.owner.register('service:current-user', CurrentUserStub);

      // when
      const screen = await render(<template><Sidebar /></template>);

      // then
      assert.dom(screen.getByRole('link', { name: t('navigation.main.documentation') })).hasAttribute('href', LINK_SCO);
    });
  });
});
