import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import MenuBar from 'pix-admin/components/layout/menu-bar';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | menu-bar', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display principal navigation', async function (assert) {
    // given
    const currentUser = this.owner.lookup('service:currentUser');
    currentUser.adminMember = { isSuperAdmin: true };

    // when
    const screen = await render(<template><MenuBar /></template>);

    // then
    assert.dom(screen.getByRole('navigation', { name: 'Navigation principale' })).exists();
  });

  test('should contain link to "organizations" management page', async function (assert) {
    // given
    const currentUser = this.owner.lookup('service:currentUser');
    currentUser.adminMember = { isSuperAdmin: true };

    // when
    const screen = await render(<template><MenuBar /></template>);

    // then
    assert.dom(screen.getByRole('link', { name: 'Organisations' })).exists();
  });

  module('Target Profiles tab', function () {
    module('when admin member have "SUPER_ADMIN", "SUPPORT" or "METIER" as role', function () {
      test('should contain link to "Target Profiles" page', async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { isSuperAdmin: true };

        // when
        const screen = await render(<template><MenuBar /></template>);

        // then
        assert.dom(screen.getByRole('link', { name: 'Profils cibles' })).exists();
      });
    });

    module('when admin member have "CERTIF" as role', function () {
      test('should not contain link to "Target Profiles" management page', async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { isCertif: true };

        // when
        const screen = await render(<template><MenuBar /></template>);

        // then
        assert.dom(screen.queryByRole('link', { name: 'Profils cibles' })).doesNotExist();
      });
    });
  });

  module('Autonomous course tab', function () {
    module('when admin member has "SUPER_ADMIN" as role', function () {
      test('should contain link to "Autonomous course" page', async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { isSuperAdmin: true };

        // when
        const screen = await render(<template><MenuBar /></template>);

        // then
        assert.dom(screen.getByRole('link', { name: 'Parcours autonomes' })).exists();
      });
    });

    module('when admin member has "SUPPORT" as role', function () {
      test('should contain link to "Autonomous course" page', async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { isSupport: true };

        // when
        const screen = await render(<template><MenuBar /></template>);

        // then
        assert.dom(screen.getByRole('link', { name: 'Parcours autonomes' })).exists();
      });
    });

    module('when admin member has "METIER" as role', function () {
      test('should contain link to "Autonomous course" page', async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { isMetier: true };

        // when
        const screen = await render(<template><MenuBar /></template>);

        // then
        assert.dom(screen.getByRole('link', { name: 'Parcours autonomes' })).exists();
      });
    });

    module('when admin member has "CERTIF" as role', function () {
      test('should not contain link to "Autonomous course" management page', async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { isCertif: true };

        // when
        const screen = await render(<template><MenuBar /></template>);

        // then
        assert.dom(screen.queryByRole('link', { name: 'Parcours autonomes' })).doesNotExist();
      });
    });
  });

  module('Trainings tab', function () {
    module('when admin member have "SUPER_ADMIN", "SUPPORT" or "METIER" as role', function () {
      test('should contain link to "Trainings" page', async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { isSuperAdmin: true };

        // when
        const screen = await render(<template><MenuBar /></template>);

        // then
        assert.dom(screen.getByRole('link', { name: 'Contenus formatifs' })).exists();
      });
    });

    module('when admin member have "CERTIF" as role', function () {
      test('should not contain link to "Trainings" page', async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { isCertif: true };

        // when
        const screen = await render(<template><MenuBar /></template>);

        // then
        assert.dom(screen.queryByRole('link', { name: 'Contenus formatifs' })).doesNotExist();
      });
    });
  });

  module('Team tab', function () {
    test('should contain link to "team" management page when admin member have "SUPER_ADMIN" as role', async function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.adminMember = { isSuperAdmin: true };

      // when
      const screen = await render(<template><MenuBar /></template>);

      // then
      assert.dom(screen.getByRole('link', { name: 'Équipe' })).exists();
    });

    test('should not contain link to "team" management page when admin member have "SUPPORT", "CERTIF" or "METIER" as role', async function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.adminMember = { isSuperAdmin: false };

      // when
      const screen = await render(<template><MenuBar /></template>);

      // then
      assert.dom(screen.queryByRole('link', { name: 'Équipe' })).doesNotExist();
    });
  });

  test('should contain link to "users" management page', async function (assert) {
    // given
    const currentUser = this.owner.lookup('service:currentUser');
    currentUser.adminMember = { isSuperAdmin: true };

    // when
    const screen = await render(<template><MenuBar /></template>);

    // then
    assert.dom(screen.getByRole('link', { name: 'Utilisateurs' })).exists();
  });

  test('should contain link to "sessions" management page', async function (assert) {
    // given
    const currentUser = this.owner.lookup('service:currentUser');
    currentUser.adminMember = { isSuperAdmin: true };

    // when
    const screen = await render(<template><MenuBar /></template>);

    // then
    assert.dom(screen.getByRole('link', { name: 'Sessions de certifications' })).exists();
  });

  module('Certifications tab', function () {
    test('should contain link to "certifications" management page when admin member have access to certification actions scope', async function (assert) {
      // given
      class AccessControlStub extends Service {
        hasAccessToCertificationActionsScope = true;
      }
      this.owner.register('service:accessControl', AccessControlStub);

      // when
      const screen = await render(<template><MenuBar /></template>);

      // then
      assert.dom(screen.getByRole('link', { name: 'Certifications' })).exists();
    });

    test('should not contain link to "certifications" management page when admin member does not have access to certification actions scope', async function (assert) {
      // given
      class AccessControlStub extends Service {
        hasAccessToCertificationActionsScope = false;
      }
      this.owner.register('service:accessControl', AccessControlStub);

      // when
      const screen = await render(<template><MenuBar /></template>);

      // then
      assert.dom(screen.queryByRole('link', { name: 'Certifications' })).doesNotExist();
    });
  });

  module('Complementary certifications tab', function () {
    test('should contain link to "complementary certifications" management page', async function (assert) {
      // given
      class AccessControlStub extends Service {
        hasAccessToComplementaryCertificationsScope = true;
      }
      this.owner.register('service:accessControl', AccessControlStub);

      // when
      const screen = await render(<template><MenuBar /></template>);

      // then
      assert.dom(screen.getByRole('link', { name: 'Certifications complémentaires' })).exists();
    });
  });

  test('should contain link to "certification centers" management page', async function (assert) {
    // given
    const currentUser = this.owner.lookup('service:currentUser');
    currentUser.adminMember = { isSuperAdmin: true };

    // when
    const screen = await render(<template><MenuBar /></template>);

    // then
    assert.dom(screen.getByRole('link', { name: 'Centres de certification' })).exists();
  });

  module('Administration tab', function () {
    module('when user is Super Admin', function () {
      test('should contain link to "Administration" management page', async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { isSuperAdmin: true };

        // when
        const screen = await render(<template><MenuBar /></template>);

        // then
        assert.dom(screen.getByRole('link', { name: 'Administration' })).exists();
      });
    });

    module('when user is Certif, Metier or Support', function () {
      test('should not contain link to "Administration" management page', async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { isSuperAdmin: false };

        // when
        const screen = await render(<template><MenuBar /></template>);

        // then
        assert.dom(screen.queryByRole('link', { name: 'Administration' })).doesNotExist();
      });
    });
  });

  module('Tools tab', function () {
    module('when user is Super Admin', function () {
      test('should contain link to "tools" management page', async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { isSuperAdmin: true };

        // when
        const screen = await render(<template><MenuBar /></template>);

        // then
        assert.dom(screen.getByRole('link', { name: 'Outils' })).exists();
      });
    });

    module('when user is Metier', function () {
      test('should not contain link to "tools" management page', async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { isMetier: true };

        // when
        const screen = await render(<template><MenuBar /></template>);

        // then
        assert.dom(screen.queryByRole('link', { name: 'Outils' })).exists();
      });
    });

    module('when user is Certif or Support', function () {
      test('should not contain link to "tools" management page', async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { isSuperAdmin: false, isMetier: false };

        // when
        const screen = await render(<template><MenuBar /></template>);

        // then
        assert.dom(screen.queryByRole('link', { name: 'Outils' })).doesNotExist();
      });
    });
  });

  test('should contain link to "logout"', async function (assert) {
    // given
    const currentUser = this.owner.lookup('service:currentUser');
    currentUser.adminMember = { isSuperAdmin: true };

    // when
    const screen = await render(<template><MenuBar /></template>);

    // then
    assert.dom(screen.getByRole('link', { name: 'Se déconnecter' })).exists();
  });
});
