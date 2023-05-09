const up = function (knex) {
  return knex.schema.table('badges', (table) => {
    table.string('certifiedImageUrl', 500);
  });
};

const down = function (knex) {
  return knex.schema.table('badges', function (table) {
    table.dropColumn('certifiedImageUrl');
  });
};

export { up, down };
