/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.sql(`
        create table doctor ( 
         id serial ,
         doctor_id int not null primary key,
         name varchar(40) not null,
         fullname varchar(80) not null,
         department varchar(25) not null,
         notavailable text[],
         joiningdate varchar(12) not null,
         lastdate varchar(12),
         fees int not null
        ) 
          
        `);
};

exports.down = pgm => {};
