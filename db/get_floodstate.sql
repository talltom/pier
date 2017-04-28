SELECT 'FeatureCollection' AS type,
        array_to_json(array_agg(f)) AS features
        FROM (
          SELECT 'Feature' AS type,
          ST_AsGeoJSON(ST_Transform(bd.the_geom, 32748))::json AS geometry,
          row_to_json(l) AS properties
          FROM (SELECT p.rw as rw, array_to_json(array_agg((ts, state)::_pier_flood_state_type)) as flood_state
            FROM (SELECT index.rw, index.ts AT TIME ZONE 'ICT' as ts, d.state
              FROM (SELECT rw.rw, ts.ts
                FROM (SELECT rw
                  FROM rem_status_log
                  WHERE changed >= $1::timestamp WITH TIME ZONE AND changed <= $2::timestamp WITH TIME ZONE GROUP BY rw)
                as rw,
                generate_series($1::timestamp WITH TIME ZONE, $2::timestamp WITH TIME ZONE, '1 hour') as ts
              ORDER BY ts.ts) as index
            LEFT JOIN (SELECT c.ts_max as ts_max, rem_status_log.state, c.rw
                FROM (SELECT max(changed) as ts_max, rw
                  FROM rem_status_log
                  WHERE changed >= $1::timestamp WITH TIME ZONE AND changed <= $2::timestamp WITH TIME ZONE
                  GROUP BY (rw, date_trunc('hour', changed))) as c,
                  rem_status_log
                  WHERE c.ts_max = rem_status_log.changed
                  AND c.rw = rem_status_log.rw
                ) as d
            ON date_trunc('hour', index.ts) = date_trunc('hour',d.ts_max)
            AND index.rw = d.rw
            ORDER BY (index.rw, index.ts)) AS p GROUP BY p.rw) AS l,
            jkt_rw_boundary bd
          WHERE l.rw = bd.pkey
          GROUP BY (bd.the_geom, l.*)) As f;
