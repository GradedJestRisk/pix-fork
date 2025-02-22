const TABLE_NAME = 'campaigns';

const up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.string('name').notNullable();
    t.string('code').default('').notNullable().index();
    t.integer('organizationId').unsigned().references('organizations.id').index();
    t.integer('creatorId').unsigned().references('users.id');
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
  });
};

const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { down, up };
