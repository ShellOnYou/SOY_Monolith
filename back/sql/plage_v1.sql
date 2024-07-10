--
-- PostgreSQL database dump
--

CREATE DATABASE IF NOT EXISTS plage;

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'SQL_ASCII';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: etudiant; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE IF NOT EXISTS etudiant (
    num_etud character varying(20) NOT NULL,
    gen_id character varying(100) NOT NULL,
    prenom character varying(40) NOT NULL,
    nom character varying(40) NOT NULL,
    groupe character varying(3),
    email character varying(40) NOT NULL,
    enabled boolean DEFAULT false,
    session character varying(10) NOT NULL
);


ALTER TABLE public.etudiant OWNER TO postgres;

--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE IF NOT EXISTS session (
    date_debut timestamp without time zone NOT NULL,
    date_fin timestamp without time zone NOT NULL,
    nb_rendus_attendus integer,
    id character varying(10) NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- Name: sujet; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE IF NOT EXISTS sujet (
    date_proposition timestamp without time zone NOT NULL,
    date_echeance timestamp without time zone NOT NULL,
    fichier character varying(40) NOT NULL,
    consignes text,
    etudiant character varying(20),
    id integer NOT NULL,
    url character varying(200),
    fichier_data bytea,
    envoye boolean
);


ALTER TABLE public.sujet OWNER TO postgres;

--
-- Name: sujet_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE sujet_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sujet_id_seq OWNER TO postgres;

--
-- Name: sujet_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE sujet_id_seq OWNED BY sujet.id;


--
-- Name: travail_rendu; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE IF NOT EXISTS travail_rendu (
    date timestamp without time zone DEFAULT now() NOT NULL,
    fichier character varying(60) NOT NULL,
    commentaires character varying(100),
    est_rendu_final boolean NOT NULL,
    note character varying(5),
    res_analyse text,
    etudiant character varying(20) NOT NULL,
    id integer NOT NULL,
    sujet integer,  
    fichier_data bytea
);


ALTER TABLE public.travail_rendu OWNER TO postgres;

--
-- Name: travail_rendu_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE travail_rendu_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.travail_rendu_id_seq OWNER TO postgres;

--
-- Name: travail_rendu_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE travail_rendu_id_seq OWNED BY travail_rendu.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY sujet ALTER COLUMN id SET DEFAULT nextval('sujet_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY travail_rendu ALTER COLUMN id SET DEFAULT nextval('travail_rendu_id_seq'::regclass);

ALTER TABLE ONLY etudiant
    ADD CONSTRAINT etudiant_pkey PRIMARY KEY (num_etud);


--
-- Name: session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: sujet_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY sujet
    ADD CONSTRAINT sujet_pkey PRIMARY KEY (id);


--
-- Name: travail_rendu_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY travail_rendu
    ADD CONSTRAINT travail_rendu_pkey PRIMARY KEY (id);


--
-- Name: etudiant_session_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY etudiant
    ADD CONSTRAINT etudiant_session_fkey FOREIGN KEY (session) REFERENCES session(id);


--
-- Name: sujet_etudiant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY sujet
    ADD CONSTRAINT sujet_etudiant_fkey FOREIGN KEY (etudiant) REFERENCES etudiant(num_etud);


--
-- Name: travail_rendu_etudiant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY travail_rendu
    ADD CONSTRAINT travail_rendu_etudiant_fkey FOREIGN KEY (etudiant) REFERENCES etudiant(num_etud);


--
-- Name: travail_rendu_sujet_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY travail_rendu
    ADD CONSTRAINT travail_rendu_sujet_fkey FOREIGN KEY (sujet) REFERENCES sujet(id);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

