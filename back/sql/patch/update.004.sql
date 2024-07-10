UPDATE UserPlage SET password='6407148f110601dead0d58c52833de40b71a103586814acdd24e600a070df2994e4679a1bb7c4bc32db4c1bf73929405c21c6b67b7a24732a1c78b72737f501f', salt='c8bc87549c11e098', nonce=NULL, enabled=true WHERE user_id=1 OR user_id=2 OR user_id=3;

ALTER TYPE exo_state ADD VALUE 'Draft in progress';
ALTER TYPE exo_state ADD VALUE 'Need to be tested';
ALTER TYPE exo_state ADD VALUE 'Available';
ALTER TYPE exo_state ADD VALUE 'Require correction';

UPDATE Exercise SET state='Draft in progress' WHERE state='Redaction en cours';
UPDATE Exercise SET state='Need to be tested' WHERE state='A tester';
UPDATE Exercise SET state='Available' WHERE state='Disponible';
UPDATE Exercise SET state='Require correction' WHERE state='A corriger';

CREATE TYPE exo_state_new AS ENUM ('Draft in progress', 'Need to be tested', 'Available', 'Require correction');
ALTER TABLE Exercise ALTER COLUMN state TYPE exo_state_new USING (state::text::exo_state_new);
DROP TYPE exo_state;
ALTER TYPE exo_state_new RENAME TO exo_state;