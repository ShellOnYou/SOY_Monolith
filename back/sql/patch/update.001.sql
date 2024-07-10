
ALTER TABLE ProfilCible DROP CONSTRAINT ProfilCible_pkey CASCADE;
ALTER TABLE ProfilCible RENAME COLUMN pc_id TO tp_id;
ALTER TABLE ProfilCible ADD PRIMARY KEY (tp_id);
ALTER TABLE ProfilCible RENAME TO TargetProfile;

ALTER TABLE PlageSession RENAME COLUMN pc_id TO tp_id;
ALTER TABLE PlageSession ADD CONSTRAINT TargetProfile_fk FOREIGN KEY (tp_id) REFERENCES TargetProfile (tp_id);

ALTER INDEX pk0_Sequence RENAME TO pk0_SequenceList;

ALTER TABLE NiveauPC DROP CONSTRAINT pk0_NiveauPC CASCADE;
ALTER TABLE NiveauPC RENAME COLUMN pc_id TO tp_id;
ALTER TABLE NiveauPC RENAME COLUMN npc_desc TO description;
ALTER TABLE NiveauPC RENAME TO TPLevel;
ALTER TABLE TPLevel ADD CONSTRAINT TargetProfile_fk FOREIGN KEY (tp_id) REFERENCES TargetProfile (tp_id);
ALTER TABLE TPLevel ADD PRIMARY KEY (tp_id, skill_code);

ALTER TABLE Course DROP CONSTRAINT Course_pkey CASCADE;
ALTER TABLE Course RENAME COLUMN p_id TO c_id;
ALTER TABLE Course ADD PRIMARY KEY (c_id);

ALTER TABLE UserCourse DROP CONSTRAINT pk0_Choisir CASCADE;
ALTER TABLE UserCourse RENAME COLUMN p_id TO c_id;
ALTER TABLE UserCourse ADD CONSTRAINT Course_fk FOREIGN KEY (c_id) REFERENCES Course (c_id);
ALTER TABLE UserCourse ADD PRIMARY KEY (user_id, c_id);

ALTER TABLE UserPlage ADD COLUMN student_number VARCHAR(40);
ALTER TABLE SequenceExercise ADD COLUMN rank INT NOT NULL;

DROP TABLE CoursePC;

CREATE TABLE CourseTP(
    tp_id int NOT NULL,
    c_id int NOT NULL,
    ctp_id serial NOT NULL,
     FOREIGN KEY (tp_id) REFERENCES TargetProfile(tp_id),
     FOREIGN KEY (c_id) REFERENCES Course(c_id),
    PRIMARY KEY (ctp_id)
);

ALTER TABLE UserPlage ADD CONSTRAINT uniqueemail_UserPlage UNIQUE (email)