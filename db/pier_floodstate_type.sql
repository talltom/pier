DROP TYPE IF EXISTS _pier_flood_state_type;
CREATE TYPE _pier_flood_state_type AS (
  ts timestamp,
  state integer
);
