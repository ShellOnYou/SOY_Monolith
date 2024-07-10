DROP TABLE IF EXISTS UserRole CASCADE;
DROP TABLE IF EXISTS UserPlage CASCADE;
DROP TABLE IF EXISTS TargetProfile CASCADE;
DROP TABLE IF EXISTS Theme CASCADE;
DROP TABLE IF EXISTS Skill CASCADE;
DROP TABLE IF EXISTS Exercise CASCADE;
DROP TABLE IF EXISTS NAM CASCADE;
DROP TABLE IF EXISTS ExerciseLevel CASCADE;
DROP TABLE IF EXISTS ExerciseProduction CASCADE;
DROP TABLE IF EXISTS PlageSession CASCADE;
DROP TABLE IF EXISTS SequenceList CASCADE;
DROP TABLE IF EXISTS TPLevel CASCADE;
DROP TABLE IF EXISTS Course CASCADE;
DROP TABLE IF EXISTS AcquiredSkill CASCADE;
DROP TABLE IF EXISTS StudentStatement CASCADE;
DROP TABLE IF EXISTS CoursePC CASCADE;
DROP TABLE IF EXISTS UserCourse CASCADE;
DROP TABLE IF EXISTS SequenceExercise CASCADE;
DROP TABLE IF EXISTS Activity CASCADE;
DROP TABLE IF EXISTS HTTPLogging CASCADE;
DROP TABLE IF EXISTS LMSContent CASCADE;
DROP TABLE IF EXISTS LMSLogging CASCADE;
DROP TABLE IF EXISTS CourseTP CASCADE;

DROP TYPE IF EXISTS exo_state;
DROP TYPE IF EXISTS loc;

CREATE TYPE exo_state AS ENUM ('Draft in progress', 'Need to be tested', 'Available', 'Require correction');
CREATE TYPE loc AS ENUM('en', 'fr');

CREATE TABLE UserRole(
    role_id serial NOT NULL,
    name varchar(40) NOT NULL,
    PRIMARY KEY (role_id)
);

CREATE TABLE UserPlage(
    user_id serial NOT NULL,
    lastname varchar(40) NOT NULL,
    firstname varchar(40) NOT NULL,
    tdgroup varchar(40),
    email varchar(40) NOT NULL,
    enabled boolean NOT NULL,
    role_id int,
    avatar bytea,
    password varchar(128) NOT NULL,
    organization varchar(40),
    country varchar(40),
    locale loc NOT NULL,
    student_number varchar(40),
    nonce varchar(128),
    salt varchar(16) NOT NULL,
    PRIMARY KEY (user_id),
     FOREIGN KEY (role_id) REFERENCES UserRole(role_id),
    CONSTRAINT uniqueemail_UserPlage UNIQUE (email)
);

CREATE TABLE TargetProfile(
    tp_id serial NOT NULL,
    job varchar(40) NOT NULL,
    level varchar(40),
    sector varchar(40) NOT NULL,
    PRIMARY KEY (tp_id)
);

CREATE TABLE Theme(
    th_id serial NOT NULL,
    name varchar(40) NOT NULL,
    locale loc NOT NULL,
    ref_id int,
    PRIMARY KEY (th_id)
);

CREATE TABLE Skill(
    skill_code varchar(40) NOT NULL,
    name varchar(100) NOT NULL,
    th_id int,
    description text,
    locale loc NOT NULL,
    ref_code varchar(40),
    PRIMARY KEY (skill_code),
     FOREIGN KEY (th_id) REFERENCES Theme(th_id)
);

CREATE TABLE Exercise(
    ex_id serial NOT NULL,
    template_statement text,
    template_archive bytea,
    state exo_state NOT NULL,
    author int NOT NULL,
    name varchar(40) NOT NULL,
    statement_creation_script bytea,
    marking_script bytea,
    locale loc NOT NULL,
    ref_id int,
    PRIMARY KEY (ex_id),
     FOREIGN KEY (author) REFERENCES UserPlage(user_id),
    CONSTRAINT uniquename_Exercise UNIQUE (name)
);

CREATE TABLE NAM(
    nam_id serial NOT NULL,
    name varchar(40) NOT NULL,
    locale loc NOT NULL,
    id_ref int,
    PRIMARY KEY(nam_id)
);

CREATE TABLE ExerciseLevel(
    skill_code varchar(40) NOT NULL,
    ex_id int NOT NULL,
    nam_id int,
     FOREIGN KEY (skill_code) REFERENCES Skill(skill_code),
     FOREIGN KEY (ex_id) REFERENCES Exercise(ex_id),
     FOREIGN KEY (nam_id) REFERENCES NAM(nam_id),
    CONSTRAINT pk0_ExerciseLevel PRIMARY KEY (skill_code,ex_id)
);

CREATE TABLE ExerciseProduction(
    ep_id serial NOT NULL,
    ex_id int,
    user_id int,
    comment text,
    is_final boolean NOT NULL,
    mark decimal(4,2) NOT NULL,
    processing_log text NOT NULL,
    working_time varchar(40) NOT NULL,
    production_data bytea NOT NULL,
    PRIMARY KEY (ep_id),
     FOREIGN KEY (ex_id) REFERENCES Exercise(ex_id),
     FOREIGN KEY (user_id) REFERENCES UserPlage(user_id)
);

CREATE TABLE PlageSession(
    ps_id serial,
    tp_id int,
    name varchar(40),
    secret_key varchar(40),
    PRIMARY KEY (ps_id),
     FOREIGN KEY (tp_id) REFERENCES TargetProfile(tp_id)
);

CREATE TABLE SequenceList(
    seq_id serial NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    universe varchar(40),
    ps_id int NOT NULL,
     FOREIGN KEY (ps_id) REFERENCES PlageSession(ps_id),
    PRIMARY KEY (seq_id)
);

CREATE TABLE TPLevel(
    tp_id serial NOT NULL,
    skill_code varchar(40) NOT NULL,
    nam_id int NOT NULL,
    description varchar(40),
     FOREIGN KEY (tp_id) REFERENCES TargetProfile(tp_id),
     FOREIGN KEY (skill_code) REFERENCES Skill(skill_code),
     FOREIGN KEY (nam_id) REFERENCES NAM(nam_id),
    CONSTRAINT pk0_TPLevel PRIMARY KEY (tp_id,skill_code)
);

CREATE TABLE Course(
    c_id serial,
    name varchar(40) NOT NULL,
    available boolean NOT NULL  DEFAULT false,
    description text,
    PRIMARY KEY (c_id)
);

CREATE TABLE AcquiredSkill(
    user_id serial NOT NULL,
    skill_code varchar(40) NOT NULL,
     FOREIGN KEY (user_id) REFERENCES UserPlage(user_id),
     FOREIGN KEY (skill_code) REFERENCES Skill(skill_code),
    CONSTRAINT pk0_AcquiredSkill PRIMARY KEY (user_id,skill_code)
);

CREATE TABLE StudentStatement(
    user_id serial NOT NULL,
    ex_id int NOT NULL,
    availability_date date NOT NULL,
    deadline_date date NOT NULL,
    submission_date date NOT NULL,
    is_sended boolean NOT NULL  DEFAULT false,
    statement text,
    file bytea,
     FOREIGN KEY (user_id) REFERENCES UserPlage(user_id),
     FOREIGN KEY (ex_id) REFERENCES Exercise(ex_id),
    CONSTRAINT pk0_Statement PRIMARY KEY (user_id,ex_id)
);

CREATE TABLE CourseTP(
    tp_id int NOT NULL,
    c_id int NOT NULL,
    ctp_id serial NOT NULL,
     FOREIGN KEY (tp_id) REFERENCES TargetProfile(tp_id),
     FOREIGN KEY (c_id) REFERENCES Course(c_id),
    PRIMARY KEY (ctp_id)
);

CREATE TABLE UserCourse(
    user_id serial NOT NULL,
    c_id int NOT NULL,
     FOREIGN KEY (user_id) REFERENCES UserPlage(user_id),
     FOREIGN KEY (c_id) REFERENCES Course(c_id),
    CONSTRAINT pk0_UserCourse PRIMARY KEY (user_id,c_id)
);

CREATE TABLE SequenceExercise(
    seq_id int NOT NULL,
    ex_id int NOT NULL,
    min_rating varchar(40),
    rank int NOT NULL,
     FOREIGN KEY (seq_id) REFERENCES SequenceList(seq_id),
     FOREIGN KEY (ex_id) REFERENCES Exercise(ex_id),
    CONSTRAINT pk0_SequenceExercise PRIMARY KEY (seq_id,ex_id)
);

CREATE TABLE Activity(
    act_code varchar(40) NOT NULL,
    act_nom varchar(40) NOT NULL,
    PRIMARY KEY (act_code)
);

CREATE TABLE HTTPLogging(
    httpl_id serial NOT NULL,
    user_id int,
    ip varchar(40) NOT NULL,
    request varchar(40),
    result varchar(40) NOT NULL,
    PRIMARY KEY (httpl_id),
     FOREIGN KEY (user_id) REFERENCES UserPlage(user_id)
);

CREATE TABLE LMSContent(
    lmsc_id serial NOT NULL,
    name varchar(40) NOT NULL,
    description text,
    url varchar(40) NOT NULL,
    act_code varchar(40),
    PRIMARY KEY (lmsc_id),
    CONSTRAINT uniquename_LMSContent UNIQUE (name),
     FOREIGN KEY (act_code) REFERENCES Activity(act_code)
);

CREATE TABLE LMSLogging(
    user_id int,
    duration varchar(40),
    consult_date date,
    content_rating varchar(40),
    comment text,
    lmsc_id int,
    lmsl_id serial NOT NULL,
     FOREIGN KEY (user_id) REFERENCES UserPlage(user_id),
     FOREIGN KEY (lmsc_id) REFERENCES LMSContent(lmsc_id),
    CONSTRAINT pk0_LMSLogging PRIMARY KEY (lmsl_id)
);

ALTER TABLE Exercise ADD CONSTRAINT Exercise_fk FOREIGN KEY (ref_id) REFERENCES Exercise (ex_id);
ALTER TABLE NAM ADD CONSTRAINT NAM_fk FOREIGN KEY (id_ref) REFERENCES NAM (nam_id);
ALTER TABLE Skill ADD CONSTRAINT Skill_fk FOREIGN KEY (ref_code) REFERENCES Skill (skill_code);
ALTER TABLE Theme ADD CONSTRAINT Theme_fk FOREIGN KEY (ref_id) REFERENCES Theme (th_id);

INSERT INTO Theme (name, locale, ref_id) VALUES ('Accessing a Unix operating system', 'en', 1);
INSERT INTO Theme (name, locale, ref_id) VALUES ('Managing files', 'en', 2);
INSERT INTO Theme (name, locale, ref_id) VALUES ('Filtering commands', 'en', 3);
INSERT INTO Theme (name, locale, ref_id) VALUES ('Handling processes', 'en', 4);
INSERT INTO Theme (name, locale, ref_id) VALUES ('Variables & shell scripts', 'en', 5);
INSERT INTO Theme (name, locale, ref_id) VALUES ('Communcations & networks', 'en', 6);
INSERT INTO Theme (name, locale, ref_id) VALUES ('OS adminstration', 'en', 7);

INSERT INTO Theme (name, locale, ref_id) VALUES ('Acces e un systeme Unix', 'fr', 1);
INSERT INTO Theme (name, locale, ref_id) VALUES ('Gestion de fichiers', 'fr', 2);
INSERT INTO Theme (name, locale, ref_id) VALUES ('Filtres commandes', 'fr', 3);
INSERT INTO Theme (name, locale, ref_id) VALUES ('Gestion des processus', 'fr', 4);
INSERT INTO Theme (name, locale, ref_id) VALUES ('Variables & Scripts shells', 'fr', 5);
INSERT INTO Theme (name, locale, ref_id) VALUES ('Communication & Reseau', 'fr', 6);
INSERT INTO Theme (name, locale, ref_id) VALUES ('Administration systeme', 'fr', 7);

INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AU1', 'Login / Password', '1', 'en', 'AU1');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AU2', 'Enter commands in a "terminal"', '1', 'en', 'AU2');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AU3', 'Ask help for a command', '1', 'en', 'AU3');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AU4', 'Use keyboard shortcuts in a terminal', '1', 'en', 'AU4');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AU5', 'Access / launch a linux OS (via W10, dual boot, VM, remote system)', '1', 'en', 'AU5');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AU8', 'Access command history', '1', 'en', 'AU8');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AU9', 'Customize the command prompt', '1', 'en', 'AU9');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GF1', 'Know the relative or absolute path of files', '2', 'en', 'GF1');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GF2', 'Go in a folder', '2', 'en', 'GF2');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GF3', 'Manage the content of a folder (creating, renaming, filling it with files, list its content)', '2', 'en', 'GF3');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GF4', 'Move a file / folder', '2', 'en', 'GF4');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GF5', 'Change access rights to a file / folder, Manage rights of a file / folder', '2', 'en', 'GF5');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GF9', 'Search a file', '2', 'en', 'GF9');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GF10', 'View the contents of a file and navigate in it', '2', 'en', 'GF10');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GF12', 'Create a file from a text editor in the terminal', '2', 'en', 'GF12');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GF7', 'Archive / compress a tree to transmit it', '2', 'en', 'GF7');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GF8', 'Install a folder and file tree from an archive', '2', 'en', 'GF8');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GF11', 'Start running a + $PATH file', '2', 'en', 'GF11');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GF13', 'Know the type of a file', '2', 'en', 'GF13');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('FC1', 'Save the result of a command in a file', '3', 'en', 'FC1');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('FC2', 'Transmit the result of a command to another one', '3', 'en', 'FC2');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('FC4', 'Find information in specific lines of files', '3', 'en', 'FC4');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('FC6', 'Give the contents of an input file to a command', '3', 'en', 'FC6');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('FC9', 'Assemble the contents of files', '3', 'en', 'FC9');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('FC10', 'Substitute part of a file', '3', 'en', 'FC10');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('FC5', 'Compare the contents of two files', '3', 'en', 'FC5');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('FC7', 'Retrieve some columns', '3', 'en', 'FC7');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('FC8', 'Display the first / last lines of a file', '3', 'en', 'FC8');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('FC3', 'Redirect errors from a command to a file', '3', 'en', 'FC3');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GP1', 'Consult the list of active processes', '4', 'en', 'GP1');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GP2', 'To know how to terminate a process', '4', 'en', 'GP2');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GP3', 'Start a process in the background', '4', 'en', 'GP3');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GP4', 'Switch a process between background and foreground', '4', 'en', 'GP4');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GP8', 'Sort processes according to criteria (CPU consumption, memory, ...)', '4', 'en', 'GP8');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GP6', 'Know which user launched a process', '4', 'en', 'GP6');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GP7', 'Change the priority of a process', '4', 'en', 'GP7');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('VS1', 'Understand a script', '5', 'en', 'VS1');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('VS3', 'Know how to iterate one or more commands', '5', 'en', 'VS3');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('VS4', 'Manage variables(definition, state)', '5', 'en', 'VS4');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('VS8', 'Manipulate environment variables (PATH, SHELL, HOME, ...)', '5', 'en', 'VS8');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('VS7', 'Start a calculation job (qsub, ...)', '5', 'en', 'VS7');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('VS6', 'Program the executions of a script (cron)', '5', 'en', 'VS6');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('VS2', 'Start a script at system startup', '5', 'en', 'VS2');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('CR1', 'Connect to a remote machine to execute commands', '6', 'en', 'CR1');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('CR2', 'Copy files/folders between machines', '6', 'en', 'CR2');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('CR3', 'Test the accessibility of a machine(ping)', '6', 'en', 'CR3');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('CR4', 'Find the IP address of a machine', '6', 'en', 'CR4');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('CR5', 'Know which machines are available on a network', '6', 'en', 'CR5');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('CR7', 'Synchronize several data storage', '6', 'en', 'CR7');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('CR8', 'Distinguish the protocols associated with different types of communication', '6', 'en', 'CR8');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('CR6', 'Know which services are accessible (ports are open) on the network', '6', 'en', 'CR6');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AS5', 'Install a software', '7', 'en', 'AS5');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AS6', 'Add a program / command to the system (folders / bin, ...)', '7', 'en', 'AS6');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AS1', 'Manage users', '7', 'en', 'AS1');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AS2', 'Configure network connections', '7', 'en', 'AS2');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AS3', 'Configure the machine name', '7', 'en', 'AS3');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AS4', 'Configure network ports to access the machine', '7', 'en', 'AS4');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AS9', 'Allow access to external storage media (USB key, external dd, network disk)', '7', 'en', 'AS9');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AS13', 'Know the ports usually associated with different network services', '7', 'en', 'AS13');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AS10', 'Manage file system backups', '7', 'en', 'AS10');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AS11', 'Understand system logs', '7', 'en', 'AS11');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AS12', 'Allow access to the system from outside (ssh, ...)', '7', 'en', 'AS12');

INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AU1', 'S''identifier sur une machine', '1', 'fr', 'AU1fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AU2', 'Taper des commandes dans un "terminal"', '1', 'fr', 'AU2fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AU3', 'Demander de l''aide sur une commande', '1', 'fr', 'AU3fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AU4', 'Utiliser les raccourcis claviers dans un terminal', '1', 'fr', 'AU4fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AU5', 'Acceder/lancer un OS linux (via W10, dual boot, VM, syst. distant)', '1', 'fr', 'AU5fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AU8', 'Acceder e l''historique des commandes', '1', 'fr', 'AU8fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AU9', 'Gerer son prompt (invite de commande)', '1', 'fr', 'AU9fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GF1', 'Connaitre le chemin relatif ou absolu de fichiers', '2', 'fr', 'GF1fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GF2', 'Se rendre dans un dossier', '2', 'fr', 'GF2fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GF3', 'Gerer le contenu d''un dossier (ajouter/supprimer/renommer son contenu)', '2', 'fr', 'GF3fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GF4', 'Deplacer un fichier / dossier', '2', 'fr', 'GF4fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GF5', 'Changer les droits d''acces e un fichier / dossier, Gerer les droits d''un fichier/dossier', '2', 'fr', 'GF5fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GF9', 'Rechercher un fichier', '2', 'fr', 'GF9fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GF10', 'Visualiser le contenu d''un fichier et naviguer dedans', '2', 'fr', 'GF10fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GF12', 'Creer un fichier depuis un editeur de texte dans le terminal', '2', 'fr', 'GF12fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GF7', 'Archiver / compresser une arborescence pour la transmettre', '2', 'fr', 'GF7fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GF8', 'Installer une arborescence de fichiers depuis une archive', '2', 'fr', 'GF8fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GF11', 'Lancer un l’execution d''un fichier + $PATH', '2', 'fr', 'GF11fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GF13', '(re)Connaitre le type d''un fichier', '2', 'fr', 'GF13fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('FC1', 'Sauvegarder le resultat d''une commande dans un fichier', '3', 'fr', 'FC1fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('FC2', 'Transmettre le resultat d''une commande e une autre', '3', 'fr', 'FC2fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('FC4', 'Retrouver les lignes de fichiers contenant une information', '3', 'fr', 'FC4fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('FC6', 'Donner le contenu d''un fichier en entree e une commande', '3', 'fr', 'FC6fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('FC9', 'Assembler le contenu de fichiers', '3', 'fr', 'FC9fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('FC10', 'Substituer une partie d''un fichier', '3', 'fr', 'FC10fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('FC5', 'Comparer le contenu de deux fichiers', '3', 'fr', 'FC5fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('FC7', 'Recuperer certaines colonnes', '3', 'fr', 'FC7fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('FC8', 'Afficher les premieres / dernieres lignes d''un fichier', '3', 'fr', 'FC8fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('FC3', 'Rediriger les erreurs d''une commande vers un fichier', '3', 'fr', 'FC3fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GP1', 'Consulter la liste des processus en activite', '4', 'fr', 'GP1fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GP2', 'Savoir terminer un processus', '4', 'fr', 'GP2fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GP3', 'Lancer un processus en arriere plan', '4', 'fr', 'GP3fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GP4', 'Basculer un processus entre arriere plan et premier plan', '4', 'fr', 'GP4fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GP8', 'Trier les processus en fonction de criteres (consommation CPU, memoire, ...)', '4', 'fr', 'GP8fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GP6', 'Connaitre l''utilisateur ayant lance un processus', '4', 'fr', 'GP6fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('GP7', 'Changer la priorite d''un processus', '4', 'fr', 'GP7fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('VS1', 'Comprendre un script', '5', 'fr', 'VS1fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('VS3', 'Savoir iterer une ou plusieurs commandes', '5', 'fr', 'VS3fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('VS4', 'Gerer les variables (definition, etat)', '5', 'fr', 'VS4fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('VS8', 'Manipuler les variables d''environnement (PATH, SHELL, HOME, ...)', '5', 'fr', 'VS8fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('VS7', 'Lancer un job de calcul (qsub,...)', '5', 'fr', 'VS7fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('VS6', 'Programme les executions d''un script (cron)', '5', 'fr', 'VS6fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('VS2', 'Lancer un script au demarrage du systeme', '5', 'fr', 'VS2fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('CR1', 'Se connecter e une machine distance pour y executer des commandes', '6', 'fr', 'CR1fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('CR2', 'Copier des fichiers/dossiers entre machines', '6', 'fr', 'CR2fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('CR3', 'Tester l''accessibilite d''une machine (ping)', '6', 'fr', 'CR3fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('CR4', 'Trouver l''adresse IP d''une machine', '6', 'fr', 'CR4fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('CR5', 'Savoir quelles machines sont disponibles sur un reseau', '6', 'fr', 'CR5fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('CR7', 'Synchroniser plusieurs espaces de stockage', '6', 'fr', 'CR7fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('CR8', 'Distinguer les protocoles associes aux differents types de communication', '6', 'fr', 'CR8fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('CR6', 'Savoir quels services sont accessibles (ports sont ouverts) sur le reseau', '6', 'fr', 'CR6fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AS5', 'Installer un logiciel', '7', 'fr', 'AS5fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AS6', 'Ajouter un programme / une commande au systeme (dossiers /bin, ...)', '7', 'fr', 'AS6fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AS1', 'Gerer les utilisateurs', '7', 'fr', 'AS1fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AS2', 'Configurer les connexions reseaux', '7', 'fr', 'AS2fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AS3', 'Configurer le nom de la machine', '7', 'fr', 'AS3fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AS4', 'Configurer les ports reseaux permettant d''acceder e la machine', '7', 'fr', 'AS4fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AS9', 'Permettre l''acces e des supports de stockage externes (clef USB, dd externe, disque reseau)', '7', 'fr', 'AS9fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AS13', 'Connaitre les ports habituellement associes aux differents services reseaux', '7', 'fr', 'AS13fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AS10', 'Gerer les sauvegardes du systeme de fichiers', '7', 'fr', 'AS10fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AS11', 'Comprendre les logs systeme', '7', 'fr', 'AS11fr');
INSERT INTO Skill (ref_code, name, th_id, locale, skill_code) VALUES ('AS12', 'Permettre l''acces au systeme depuis l''exterieur (ssh, ...)', '7', 'fr', 'AS12fr');

INSERT INTO UserRole (name) VALUES ('Administrateur');
INSERT INTO UserRole (name) VALUES ('Enseignant');
INSERT INTO UserRole (name) VALUES ('etudiant');

INSERT INTO UserPlage (lastname, firstname, tdgroup, email, enabled, role_id, avatar, password, organization, country, locale, salt, nonce)
    VALUES ('Berry', 'Vincent', 'TD1', 'test.plage@yopmail.com', 'true', '1', NULL, '6407148f110601dead0d58c52833de40b71a103586814acdd24e600a070df2994e4679a1bb7c4bc32db4c1bf73929405c21c6b67b7a24732a1c78b72737f501f', 'Polytech', 'France', 'fr', 'c8bc87549c11e098', NULL);
INSERT INTO UserPlage (lastname, firstname, tdgroup, email, enabled, role_id, avatar, password, organization, country, locale, salt, nonce)
    VALUES ('Combes', 'Stephane', 'TD1', 'test.plage.ens@yopmail.com', 'true', '2', NULL, '6407148f110601dead0d58c52833de40b71a103586814acdd24e600a070df2994e4679a1bb7c4bc32db4c1bf73929405c21c6b67b7a24732a1c78b72737f501f', 'Polytech', 'France', 'fr', 'c8bc87549c11e098', NULL);
INSERT INTO UserPlage (lastname, firstname, tdgroup, email, enabled, role_id, avatar, password, organization, country, locale, salt, nonce)
    VALUES ('Gonzales', 'Degadezo', 'TD1', 'test.plage.etu@yopmail.com', 'true', '3', NULL, '6407148f110601dead0d58c52833de40b71a103586814acdd24e600a070df2994e4679a1bb7c4bc32db4c1bf73929405c21c6b67b7a24732a1c78b72737f501f', 'Polytech', 'France', 'fr', 'c8bc87549c11e098', NULL);

INSERT INTO Activity (act_code, act_nom) VALUES ('A1', 'Test');

INSERT INTO NAM (name, locale, id_ref) VALUES ('Beginner', 'en', 1);
INSERT INTO NAM (name, locale, id_ref) VALUES ('Advanced', 'en', 2);
INSERT INTO NAM (name, locale, id_ref) VALUES ('Master', 'en', 3);
INSERT INTO NAM (name, locale, id_ref) VALUES ('Expert', 'en', 4);
INSERT INTO NAM (name, locale, id_ref) VALUES ('Novice', 'fr', 1);
INSERT INTO NAM (name, locale, id_ref) VALUES ('Avance', 'fr', 2);
INSERT INTO NAM (name, locale, id_ref) VALUES ('Maitre', 'fr', 3);
INSERT INTO NAM (name, locale, id_ref) VALUES ('Expert', 'fr', 4);


INSERT INTO Exercise (name, state, author, locale, ref_id) VALUES ('Exercise Test 1', 'Draft in progress', 1, 'en', 1);
INSERT INTO Exercise (name, state, author, locale, ref_id) VALUES ('Exercise Test 2', 'Draft in progress', 1, 'en', 2);
INSERT INTO Exercise (name, state, author, locale, ref_id) VALUES ('Exercise Test 3', 'Draft in progress', 1, 'en', 3);
INSERT INTO Exercise (name, state, author, locale, ref_id) VALUES ('Exercise Test 4', 'Draft in progress', 1, 'en', 4);
INSERT INTO Exercise (name, state, author, locale, ref_id) VALUES ('Exercise Test 5', 'Draft in progress', 1, 'en', 5);
INSERT INTO Exercise (name, state, author, locale, ref_id) VALUES ('Exercise Test 6', 'Draft in progress', 1, 'en', 6);
INSERT INTO Exercise (name, state, author, locale, ref_id) VALUES ('Exercise Test 7', 'Draft in progress', 1, 'en', 7);
INSERT INTO TargetProfile (job, level, sector) VALUES ('Testeur de plage', 'Geek', 'WebDev');
INSERT INTO Course (name, available, description) VALUES ('Test', false, 'Une description');
INSERT INTO Course (name, available, description) VALUES ('Test 2', false, 'Une description');
INSERT INTO CourseTP (tp_id, c_id) VALUES (1, 1);
INSERT INTO PlageSession (tp_id, name) VALUES (1, 'Session de test');
INSERT INTO SequenceList (start_date, end_date, universe, ps_id) VALUES ('05/01/2019', '05/01/2020', 'Dallas', 1);
INSERT INTO SequenceExercise (seq_id, ex_id, min_rating, rank) VALUES (1, 1, 50, 1);
INSERT INTO SequenceExercise (seq_id, ex_id, min_rating, rank) VALUES (1, 2, 50, 2);
INSERT INTO SequenceExercise (seq_id, ex_id, min_rating, rank) VALUES (1, 3, 50, 3);
INSERT INTO SequenceExercise (seq_id, ex_id, min_rating, rank) VALUES (1, 4, 50, 4);
INSERT INTO SequenceExercise (seq_id, ex_id, min_rating, rank) VALUES (1, 5, 50, 5);
INSERT INTO SequenceExercise (seq_id, ex_id, min_rating, rank) VALUES (1, 6, 50, 7);
INSERT INTO SequenceExercise (seq_id, ex_id, min_rating, rank) VALUES (1, 7, 50, 6);
INSERT INTO UserCourse (user_id, c_id) VALUES (1, 1);
INSERT INTO UserCourse (user_id, c_id) VALUES (1, 2);