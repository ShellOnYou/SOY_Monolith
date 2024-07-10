--
-- PostgreSQL database dump
--

-- Dumped from database version 11.2
-- Dumped by pg_dump version 11.2

-- Started on 2019-04-30 16:30:08 CEST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 206 (class 1259 OID 58042)
-- Name: skill; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.skill (
    skill_code character varying(40) NOT NULL,
    name character varying(100) NOT NULL,
    th_id integer,
    description text
);


ALTER TABLE public.skill OWNER TO postgres;

--
-- TOC entry 3160 (class 0 OID 58042)
-- Dependencies: 206
-- Data for Name: skill; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.skill (skill_code, name, th_id, description) FROM stdin;
AU1	Login / Password	0	\N
AU2	Taper des commandes dans un "terminal"	0	\N
AU3	Demander de l'aide sur une commande	0	\N
AU4	Utiliser les raccourcis claviers dans un terminal	0	\N
AU5	Accéder/lancer un OS linux (via W10, dual boot, VM, syst. distant)	0	\N
AU8	Accéder à l'historique des commandes	0	\N
AU9	Gérer son prompt (invite de commande)	0	\N
GF1	Connaître le chemin relatif ou absolu de fichiers	1	\N
GF2	Se rendre dans un dossier	1	\N
GF3	Gérer le contenu d'un dossier (ajouter/supprimer/renommer son contenu)	1	\N
GF4	Déplacer un fichier / dossier	1	\N
GF5	Changer les droits d'accès à un fichier / dossier,Gérer les droits d'un fichier/dossier	1	\N
GF9	Rechercher un fichier	1	\N
GF10	Visualiser le contenu d’un fichier et naviguer dedans	1	\N
GF12	Créer un fichier depuis un éditeur de texte dans le terminal	1	\N
GF7	Archiver / compresser une arborescence pour la transmettre	1	\N
GF8	Installer une arborescence de fichiers depuis une archive	1	\N
GF11	Lancer un l’exécution d’un fihcier + $PATH	1	\N
GF13	(re)Connaitre le type d’un fichier	1	\N
FC1	Sauvegarder le résultat d'une commande dans un fichier	2	\N
FC2	Transmettre le résultat d'une commande à une autre	2	\N
FC4	Retrouver les lignes de fichiers contenant une information	2	\N
FC6	Donner le contenu d'un fichier en entrée à une commande	2	\N
FC9	Assembler le contenu de fichiers	2	\N
FC10	Substituer une partie d'un fichier	2	\N
FC5	Comparer le contenu de deux fichiers	2	\N
FC7	Récupérer certaines colonnes	2	\N
FC8	Afficher les premières / dernières lignes d'un fichier	2	\N
FC3	Rediriger les erreurs d'une commande vers un fichier	2	\N
GP1	Consulter la liste des processus en activité	3	\N
GP2	Savoir terminer un processus	3	\N
GP3	Lancer un processus en arrière plan	3	\N
GP4	Basculer un processus entre arrière plan et premier plan	3	\N
GP8	Trier les processus en fonction de critères (consommation CPU, mémoire, ...)	3	\N
GP6	Connaître l'utilisateur ayant lancé un processus	3	\N
GP7	Changer la priorité d'un processus	3	\N
VS1	comprendre un script	4	\N
VS3	savoir itérer une ou plusieurs commandes	4	\N
VS4	Gérer les variables (définition, état)	4	\N
VS8	manipuler les variables d'environnement (PATH, SHELL, HOME, ...)	4	\N
VS7	lancer un job de calcul (qsub,...)	4	\N
VS6	programme les exécutions d'un script (cron)	4	\N
VS2	lancer un script au démarrage du système	4	\N
CR1	Se connecter à une machine distance pour y exécuter des commandes   	5	\N
CR2	Copier des fichiers/dossiers entre machines	5	\N
CR3	Tester l'accessibilité d'une machine (ping)	5	\N
CR4	Trouver l'adresse IP d'une machine	5	\N
CR5	Savoir quelles machines sont disponibles sur un réseau	5	\N
CR7	Synchroniser plusieurs espaces de stockage	5	\N
CR8	Distinguer les protocoles associés aux différents types de communication	5	\N
CR6	Savoir quels services sont accessibles (ports sont ouverts) sur le réseau	5	\N
AS5	Installer un logiciel	6	\N
AS6	Ajouter un programme / une commande au système (dossiers /bin, ...)	6	\N
AS1	gérer les utilisateurs	6	\N
AS2	configurer les connexions réseaux	6	\N
AS3	configurer le nom de la machine	6	\N
AS4	Configurer les ports réseaux permettant d'accéder à la machine	6	\N
AS9	Permettre l'accès à des supports de stockage externes (clef USB, dd externe, disque réseau)	6	\N
AS13	Connaître les ports habituellement associés aux différents services réseaux	6	\N
AS10	Gérer les sauvegardes du système de fichiers	6	\N
AS11	Comprendre les logs système	6	\N
AS12	Permettre l'accès au système depuis l'extérieur (ssh, ...)	6	\N
\.


--
-- TOC entry 3037 (class 2606 OID 58049)
-- Name: skill skill_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skill
    ADD CONSTRAINT skill_pkey PRIMARY KEY (skill_code);


--
-- TOC entry 3038 (class 2606 OID 58050)
-- Name: skill skill_th_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skill
    ADD CONSTRAINT skill_th_id_fkey FOREIGN KEY (th_id) REFERENCES public.theme(th_id);


-- Completed on 2019-04-30 16:30:12 CEST

--
-- PostgreSQL database dump complete
--

