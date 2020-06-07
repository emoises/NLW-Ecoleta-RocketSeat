import Knex from 'knex';

export async function up(Knex: Knex) {
  return Knex.schema.createTable('point_items', (table) => {
    table.increments('id').primary();

    table.string('point_id')
        .notNullable()
        .references('id')
        .inTable('points');
        
    table.string('item_id')
        .notNullable()
        .references('id')
        .inTable('items');
  });
}

export async function down(Knex: Knex) {
  return Knex.schema.dropTable('point_items');
}
