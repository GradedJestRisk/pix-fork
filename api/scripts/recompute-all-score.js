#! /usr/bin/env node
const request = require('request-promise-native');

function buildRequestObject(baseUrl, authToken, certifId) {
  const request=  {
    method: 'POST',
    headers: {
      authorization: 'Bearer ' + authToken,
      'Connection': 'keep-alive',
    },
    baseUrl: baseUrl,
    url: `/api/assessments/${certifId}`,
    json: true
  };
  return request;
}

function main() {

  const baseUrl = process.argv[2];
  const authToken = process.argv[3];
  const min = parseInt(process.argv[4]);
  const max = parseInt(process.argv[5]);

    const listCertif = [];
    for (let i = min; i <= max; i++) {
      listCertif.push(i);
    }
    const requests = Promise.all(
      listCertif.map(id => buildRequestObject(baseUrl, authToken, id))
        .map(requestObject => request(requestObject)));

    requests.then((result) => {console.log(result.filter((result) => result.includes('Diff')))})
      .catch((err) => {
        console.log(err);
      });
}

main();
