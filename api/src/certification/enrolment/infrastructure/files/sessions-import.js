import { Parser } from '@json2csv/plainjs';

const { omit } = lodash;

import lodash from 'lodash';

import {
  COMPLEMENTARY_CERTIFICATION_SUFFIX,
  headers,
} from '../../../shared/infrastructure/utils/csv/sessions-import.js';

function getCsvHeaders({ habilitationLabels, shouldDisplayBillingModeColumns = true }) {
  const complementaryCertificationsHeaders = _getComplementaryCertificationsHeaders(habilitationLabels);
  const fields = _getHeadersAsArray(complementaryCertificationsHeaders, shouldDisplayBillingModeColumns);
  const json2csvParser = new Parser({
    withBOM: true,
    includeEmptyRows: false,
    fields,
    delimiter: ';',
  });
  return json2csvParser.parse([]);
}

function _getComplementaryCertificationsHeaders(habilitationLabels) {
  return habilitationLabels?.map((habilitationLabel) => `${habilitationLabel} ${COMPLEMENTARY_CERTIFICATION_SUFFIX}`);
}

function _getHeadersAsArray(complementaryCertificationsHeaders = [], shouldDisplayBillingModeColumns) {
  const certificationCenterCsvHeaders = shouldDisplayBillingModeColumns
    ? headers
    : omit(headers, ['billingMode', 'prepaymentCode']);

  const csvHeaders = Object.keys(certificationCenterCsvHeaders).reduce((arr, key) => [...arr, headers[key]], []);
  return [...csvHeaders, ...complementaryCertificationsHeaders];
}

export { getCsvHeaders };
