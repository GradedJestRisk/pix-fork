import _ from 'lodash';

import { random } from '../../../../../src/shared/infrastructure/utils/random.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Infrastructure | Utils | Random', function () {
  describe('#binaryTreeRandom', function () {
    context('randomDistributionTest', function () {
      it('should have a decent distribution', function () {
        const sampleSize = 100000;
        const treeSize = 5;
        const seeds = _.range(0, sampleSize);

        const results = seeds.map(() => random.binaryTreeRandom(50, treeSize));

        const resultDistribution = _.countBy(results);

        const computeDistance = (value, expected) => Math.abs(value / sampleSize - expected / 100);

        const RESULTS_AVERAGE_DISTRIBUTION = [50, 25, 12.5, 6.25, 6.25];

        expect(computeDistance(resultDistribution[0], RESULTS_AVERAGE_DISTRIBUTION[0])).to.be.lessThan(0.01);
        expect(computeDistance(resultDistribution[1], RESULTS_AVERAGE_DISTRIBUTION[1])).to.be.lessThan(0.01);
        expect(computeDistance(resultDistribution[2], RESULTS_AVERAGE_DISTRIBUTION[2])).to.be.lessThan(0.01);
        expect(computeDistance(resultDistribution[3], RESULTS_AVERAGE_DISTRIBUTION[3])).to.be.lessThan(0.01);
        expect(computeDistance(resultDistribution[4], RESULTS_AVERAGE_DISTRIBUTION[4])).to.be.lessThan(0.01);
      });
    });
  });
});
