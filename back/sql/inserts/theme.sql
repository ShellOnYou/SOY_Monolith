--
-- PostgreSQL database dump
--

-- Dumped from database version 11.2
-- Dumped by pg_dump version 11.2

-- Started on 2019-04-30 16:29:26 CEST

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
-- TOC entry 205 (class 1259 OID 58036)
-- Name: theme; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.theme (
    th_id integer NOT NULL,
    name character varying(40) NOT NULL
);


ALTER TABLE public.theme OWNER TO postgres;

--
-- TOC entry 204 (class 1259 OID 58034)
-- Name: theme_th_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.theme_th_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.theme_th_id_seq OWNER TO postgres;

--
-- TOC entry 3167 (class 0 OID 0)
-- Dependencies: 204
-- Name: theme_th_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.theme_th_id_seq OWNED BY public.theme.th_id;


--
-- TOC entry 3036 (class 2604 OID 58039)
-- Name: theme th_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.theme ALTER COLUMN th_id SET DEFAULT nextval('public.theme_th_id_seq'::regclass);


--
-- TOC entry 3161 (class 0 OID 58036)
-- Dependencies: 205
-- Data for Name: theme; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.theme (th_id, name) FROM stdin;
0	Accès à un système Unix
1	Gestion de fichiers
2	Filtres commandes
3	Gestion des processus
4	Variables & Scripts shells
5	Communication & Réseau
6	Administration système
\.


--
-- TOC entry 3168 (class 0 OID 0)
-- Dependencies: 204
-- Name: theme_th_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.theme_th_id_seq', 1, false);


--
-- TOC entry 3038 (class 2606 OID 58041)
-- Name: theme theme_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.theme
    ADD CONSTRAINT theme_pkey PRIMARY KEY (th_id);


-- Completed on 2019-04-30 16:29:29 CEST

--
-- PostgreSQL database dump complete
--

