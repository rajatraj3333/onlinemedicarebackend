/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.sql(`
         create table otpverify(
              id  serial,
              user_id int unique not null,
              created_at timestamp not null,
              otp int not null

         )
        
        `)
};

exports.down = pgm => {};
