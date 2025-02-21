/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.sql(
        `
        create type bookstatus as enum ('approved','rejected');
        create table patient (
        id serial ,
        patient_id int not null primary key,
        slottime text,
        user_id int not null,
        doctor_id int not null,
        status varchar(10) not null,
        booking_status bookstatus ,
        booking_url text ,
        constraint fr_patuserkey foreign key (user_id) references users(user_id),
         constraint fr_patdockey foreign key (doctor_id) references doctor(doctor_id)
                );
        `
    )
};

exports.down = pgm => {};
