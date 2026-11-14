--
-- PostgreSQL database dump
--


-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10




--
-- Name: community_photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_photos (
    id text NOT NULL,
    place_id text NOT NULL,
    kind text DEFAULT 'other'::text NOT NULL,
    mime text NOT NULL,
    data bytea NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: community_places; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_places (
    id text NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    governorate text DEFAULT ''::text NOT NULL,
    area text DEFAULT ''::text NOT NULL,
    address text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    lat double precision NOT NULL,
    lng double precision NOT NULL,
    answers jsonb DEFAULT '{}'::jsonb NOT NULL,
    answers_note text DEFAULT ''::text NOT NULL,
    status text DEFAULT 'unverified'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: community_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_reports (
    id text NOT NULL,
    place_id text NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: community_photos community_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_photos
    ADD CONSTRAINT community_photos_pkey PRIMARY KEY (id);


--
-- Name: community_places community_places_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_places
    ADD CONSTRAINT community_places_pkey PRIMARY KEY (id);


--
-- Name: community_reports community_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_reports
    ADD CONSTRAINT community_reports_pkey PRIMARY KEY (id);


--
-- Name: community_photos community_photos_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_photos
    ADD CONSTRAINT community_photos_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.community_places(id) ON DELETE CASCADE;


--
-- Name: community_reports community_reports_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_reports
    ADD CONSTRAINT community_reports_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.community_places(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


