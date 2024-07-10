ALTER TABLE UserPlage ADD COLUMN nonce varchar(128);
ALTER TABLE UserPlage ADD COLUMN salt varchar(16);
ALTER TABLE UserPlage ALTER COLUMN password SET DATA TYPE varchar(128);
