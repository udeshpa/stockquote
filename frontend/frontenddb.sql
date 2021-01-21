-- Table: public.epuser

-- DROP TABLE public.epuser;

CREATE TABLE public.epuser
(
    userid character varying(35) COLLATE pg_catalog."default" NOT NULL,
    fname character varying(25) COLLATE pg_catalog."default",
    lname character varying(25) COLLATE pg_catalog."default",
    CONSTRAINT user_pkey PRIMARY KEY (userid)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.epuser
    OWNER to udaydeshpande;

-- Table: public.paymentplan

-- DROP TABLE public.paymentplan;

CREATE TABLE public.paymentplan
(
    paypalplanid character varying(35) COLLATE pg_catalog."default" NOT NULL,
    planname character varying(35) COLLATE pg_catalog."default",
    productid character varying(35) COLLATE pg_catalog."default",
    CONSTRAINT paymentplan_pkey PRIMARY KEY (paypalplanid)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.paymentplan
    OWNER to udaydeshpande;

-- Table: public.product

-- DROP TABLE public.product;

CREATE TABLE public.product
(
    prodname character varying(25) COLLATE pg_catalog."default",
    description character varying(50) COLLATE pg_catalog."default",
    imageurl character varying(75) COLLATE pg_catalog."default",
    homeurl character varying(75) COLLATE pg_catalog."default",
    productid character varying(35) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT productid_unique UNIQUE (productid)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.product
    OWNER to udaydeshpande;

-- Table: public.subscription

-- DROP TABLE public.subscription;

CREATE TABLE public.subscription
(
    subsriptionid integer NOT NULL DEFAULT nextval('subscriptions_subsriptionid_seq'::regclass),
    paypalsubscriptionid character varying(25) COLLATE pg_catalog."default" NOT NULL,
    starttime date,
    autorenewal boolean NOT NULL DEFAULT false,
    userid character varying(35) COLLATE pg_catalog."default" NOT NULL,
    substatus character varying(10) COLLATE pg_catalog."default",
    planid character varying(35) COLLATE pg_catalog."default",
    CONSTRAINT subscriptions_pkey PRIMARY KEY (subsriptionid)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.subscription
    OWNER to udaydeshpande;

