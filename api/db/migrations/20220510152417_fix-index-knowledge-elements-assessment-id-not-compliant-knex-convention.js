const up = function (knex) {
  return knex.raw(
    'ALTER INDEX IF EXISTS "knowledge-elements_assessmentId_idx" RENAME TO "knowledge_elements_assessmentid_index"',
  );
};
// eslint-disable-next-line no-empty-function
const down = function () {};
export { down, up };
