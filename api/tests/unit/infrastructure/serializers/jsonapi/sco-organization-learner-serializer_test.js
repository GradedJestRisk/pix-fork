import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/sco-organization-learner-serializer.js';
import { OrganizationLearner } from '../../../../../src/shared/domain/models/index.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | sco-organization-learner-serializer', function () {
  describe('#serializeIdentity', function () {
    it('should convert an organizationLearner model object into JSON API data', function () {
      // given
      const organizationLearner = new OrganizationLearner({
        id: 5,
        firstName: 'John',
        lastName: 'Doe',
        birthdate: '2020-01-01',
      });

      const expectedSerializedOrganizationLearner = {
        data: {
          type: 'sco-organization-learners',
          id: '5',
          attributes: {
            'first-name': organizationLearner.firstName,
            'last-name': organizationLearner.lastName,
            birthdate: organizationLearner.birthdate,
          },
        },
      };

      // when
      const json = serializer.serializeIdentity(organizationLearner);

      // then
      expect(json).to.deep.equal(expectedSerializedOrganizationLearner);
    });
  });

  describe('#serializeWithUsernameGeneration', function () {
    it('converts into JSON API data with id set to a unique value being the username', function () {
      // given
      const organizationLearner = {
        firstName: 'John',
        lastName: 'Doe',
        birthdate: '2020-01-01',
        username: 'john.doe0101',
      };

      const expectedSerializedOrganizationLearner = {
        data: {
          attributes: {
            'first-name': organizationLearner.firstName,
            'last-name': organizationLearner.lastName,
            birthdate: organizationLearner.birthdate,
            username: organizationLearner.username,
          },
          id: organizationLearner.username,
          type: 'sco-organization-learners',
        },
      };

      // when
      const json = serializer.serializeWithUsernameGeneration(organizationLearner);

      // then
      expect(json).to.deep.equal(expectedSerializedOrganizationLearner);
    });
  });

  describe('#serializeExternal', function () {
    it('converts into JSON API data with id set to a unique value being the accessToken', function () {
      // given
      const organizationLearner = {
        accessToken: 'some token',
      };

      const expectedSerializedOrganizationLearner = {
        data: {
          attributes: {
            'access-token': organizationLearner.accessToken,
          },
          id: organizationLearner.accessToken,
          type: 'external-users',
        },
      };

      // when
      const json = serializer.serializeExternal(organizationLearner);

      // then
      expect(json).to.deep.equal(expectedSerializedOrganizationLearner);
    });
  });

  describe('#serializeCredentialsForDependent', function () {
    it('should convert into JSON API data', function () {
      // given
      const organizationLearner = {
        generatedPassword: 'generated passw0rd',
        username: 'us3rnam3',
        organizationLearnerId: 3,
      };

      const expectedSerializedOrganizationLearner = {
        data: {
          id: '3',
          attributes: {
            'generated-password': organizationLearner.generatedPassword,
            username: organizationLearner.username,
          },
          type: 'dependent-users',
        },
      };

      // when
      const json = serializer.serializeCredentialsForDependent(organizationLearner);

      // then
      expect(json).to.deep.equal(expectedSerializedOrganizationLearner);
    });
  });
});
