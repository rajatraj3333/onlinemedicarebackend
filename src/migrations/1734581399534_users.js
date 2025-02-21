/* eslint-disable camelcase */

const { sql } = require("node-pg-migrate/dist/operations/other");

exports.shorthands = undefined;

exports.up = (pgm)=> pgm.sql(`
create table users (
id  serial ,
user_id int not null primary key,
first_name varchar(35) not null,
last_name varchar (35) not null,
email varchar(75) not null,
password text not null
)
`);



exports.down = pgm => {};
