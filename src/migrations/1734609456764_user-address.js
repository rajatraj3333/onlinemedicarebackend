/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.sql(
        `
        create table useraddress(
         id serial not null,
         user_id int,
         address_id int not null,
         address varchar(250) not null,
         street varchar(40),
         phone int not null,
         roles designation,
        constraint fk_address foreign key(user_id) references users(user_id)
        )
        `
    )
};

exports.down = pgm => {};
