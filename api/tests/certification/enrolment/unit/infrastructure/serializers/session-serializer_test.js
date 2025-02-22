import { SessionEnrolment } from '../../../../../../src/certification/enrolment/domain/models/SessionEnrolment.js';
import * as serializer from '../../../../../../src/certification/enrolment/infrastructure/serializers/session-serializer.js';
import { SESSION_STATUSES } from '../../../../../../src/certification/shared/domain/constants.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Certification | enrolment | Serializer | session-serializer', function () {
  describe('#serialize()', function () {
    let session;
    let expectedJsonApi;

    beforeEach(function () {
      expectedJsonApi = {
        data: {
          type: 'session-enrolments',
          id: '12',
          attributes: {
            'certification-center-id': 123,
            address: 'Nice',
            room: '28D',
            'access-code': '',
            examiner: 'Antoine Toutvenant',
            date: '2017-01-20',
            time: '14:30',
            status: SESSION_STATUSES.CREATED,
            description: '',
            'supervisor-password': 'SOWHAT',
          },
          relationships: {
            'certification-candidates': {
              links: {
                related: '/api/sessions/12/certification-candidates',
              },
            },
          },
        },
      };
      session = new SessionEnrolment({
        id: 12,
        certificationCenterId: 123,
        address: 'Nice',
        room: '28D',
        examiner: 'Antoine Toutvenant',
        date: '2017-01-20',
        time: '14:30',
        description: '',
        accessCode: '',
        invigilatorPassword: 'SOWHAT',
      });
    });

    context('when session does not have a link to an existing certification center', function () {
      it('should convert a SessionEnrolment model object into JSON API data including supervisor password', function () {
        // when
        const json = serializer.serialize(session);

        // then
        expect(json).to.deep.equal(expectedJsonApi);
      });
    });
  });

  describe('#deserialize()', function () {
    const jsonApiSession = {
      data: {
        type: 'session-enrolments',
        id: '12',
        attributes: {
          address: 'Nice',
          room: '28D',
          'access-code': '',
          examiner: 'Antoine Toutvenant',
          date: '2017-01-20',
          time: '14:30',
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
          status: SESSION_STATUSES.CREATED,
          description: '',
          'certification-center-id': 42,
        },
        relationships: {
          'certification-candidates': {
            links: {
              related: '/api/sessions/12/certification-candidates',
            },
          },
        },
      },
    };

    beforeEach(function () {
      jsonApiSession.data.attributes.date = '2017-01-20';
    });

    it('should convert JSON API data to a Session', function () {
      // when
      const session = serializer.deserialize(jsonApiSession);

      // then
      expect(session).to.be.instanceOf(SessionEnrolment);
      expect(session.id).to.equal('12');
      expect(session.certificationCenterId).to.equal(42);
      expect(session.address).to.equal('Nice');
      expect(session.room).to.equal('28D');
      expect(session.examiner).to.equal('Antoine Toutvenant');
      expect(session.date).to.equal('2017-01-20');
      expect(session.time).to.equal('14:30');
      expect(session.description).to.equal('');
    });
  });
});
