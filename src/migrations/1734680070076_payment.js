/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.sql(`
        create table payment(
        id serial , 
        payment_id int,
        order_id int,
        payment_date timestamp,
        user_id int,
        doctor_id int,
        amount int,
        status boolean
)
        `)
};

exports.down = pgm => {};
