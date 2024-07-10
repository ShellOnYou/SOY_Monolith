ALTER TABLE TargetProfile RENAME TO Profile;
ALTER TABLE CourseTP RENAME TO CourseProfile;
ALTER TABLE TPLevel RENAME TO ProfileLevel;

ALTER TABLE Profile RENAME COLUMN tp_id TO p_id;
ALTER TABLE PlageSession RENAME COLUMN tp_id TO p_id;
ALTER TABLE CourseProfile RENAME COLUMN tp_id TO p_id;
ALTER TABLE CourseProfile RENAME COLUMN ctp_id TO cp_id;
ALTER TABLE ProfileLevel RENAME COLUMN tp_id TO p_id;
ALTER TABLE NAM RENAME COLUMN id_ref TO ref_id;

ALTER TABLE PlageSession ADD COLUMN start_date DATE;
ALTER TABLE PlageSession ADD COLUMN end_date DATE;
ALTER TABLE SequenceList DROP COLUMN start_date;
ALTER TABLE SequenceList DROP COLUMN end_date;
ALTER TABLE StudentStatement DROP COLUMN submission_date;

ALTER TABLE SequenceList ADD COLUMN ex_id INT;
ALTER TABLE SequenceList ADD COLUMN rank INT;
ALTER TABLE SequenceList ADD COLUMN min_rating DECIMAL(4,2);
ALTER TABLE SequenceList ADD COLUMN p_id INT;
ALTER TABLE ExerciseProduction ADD COLUMN submission_date DATE;
UPDATE ExerciseProduction SET submission_date='2019-06-25';
ALTER TABLE ExerciseProduction ALTER COLUMN submission_date SET NOT NULL;

UPDATE SequenceList SET rank=0, min_rating=0, ex_id=1, p_id=1 WHERE seq_id = 1;

ALTER TABLE SequenceList ALTER COLUMN ex_id SET NOT NULL;
ALTER TABLE SequenceList ALTER COLUMN rank SET NOT NULL;
ALTER TABLE SequenceList ALTER COLUMN min_rating SET NOT NULL;
ALTER TABLE SequenceList ALTER COLUMN p_id SET NOT NULL;

ALTER TABLE SequenceList ADD CONSTRAINT Exercise_fk FOREIGN KEY (ex_id) REFERENCES Exercise (ex_id);
ALTER TABLE SequenceList ADD CONSTRAINT Profile_fk FOREIGN KEY (p_id) REFERENCES Profile (p_id);
DROP TABLE SequenceExercise;

CREATE TABLE UserSession(
    user_id INT NOT NULL,
    ps_id INT NOT NULL,
     FOREIGN KEY (user_id) REFERENCES UserPlage(user_id),
     FOREIGN KEY (ps_id) REFERENCES PlageSession(ps_id),
    PRIMARY KEY (user_id,ps_id)
);

ALTER TABLE PlageSession ALTER COLUMN start_date DROP NOT NULL;
ALTER TABLE PlageSession ALTER COLUMN end_date DROP NOT NULL;
ALTER TABLE PlageSession ADD COLUMN author INT;
ALTER TABLE PlageSession ADD CONSTRAINT PlageUser_fk FOREIGN KEY (author) REFERENCES UserPlage (user_id);
UPDATE PlageSession SET author=1;
ALTER TABLE PlageSession ALTER COLUMN author SET NOT NULL;
ALTER TABLE PlageSession ADD COLUMN description TEXT;
ALTER TABLE Profile ADD COLUMN description TEXT;
ALTER TABLE Profile ADD COLUMN ref_id INT;
ALTER TABLE Profile ADD COLUMN locale loc;
ALTER TABLE Profile ADD CONSTRAINT Profile_fk FOREIGN KEY (ref_id) REFERENCES Profile (p_id);
UPDATE Profile SET locale='en';
UPDATE Profile SET ref_id=1 WHERE p_id=1;
ALTER TABLE Profile ALTER COLUMN locale SET NOT NULL;

ALTER TABLE StudentStatement DROP COLUMN submission_date;
ALTER TABLE StudentStatement ALTER COLUMN availability_date DROP NOT NULL;

ALTER TABLE ExerciseProduction ALTER COLUMN user_id TYPE INT;
ALTER TABLE AcquiredSkill ALTER COLUMN user_id TYPE INT;
ALTER TABLE StudentStatement ALTER COLUMN user_id TYPE INT;
