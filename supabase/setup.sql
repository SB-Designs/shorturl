CREATE TABLE urls (
  id serial PRIMARY KEY,
  short varchar(10) UNIQUE,
  long text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
