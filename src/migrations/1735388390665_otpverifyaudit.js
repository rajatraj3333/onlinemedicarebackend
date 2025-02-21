/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.sql(
        `
        create type otpstatus as enum ('used','notused'); 
         create table otpverifyaudit(
              id  serial,
              user_id int unique not null,
              created_at timestamp not null,
              otp int not null,
              status otpstatus

         )
        `
    )
};

exports.down = pgm => {};
