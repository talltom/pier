SELECT 'FeatureCollection' AS type, array_to_json(array_agg(f)) AS features
FROM (SELECT 'Feature' AS type,
			ST_ASGeoJSON(ST_Transform(lg.the_geom, 32748))::json AS geometry,
				row_to_json(
					(SELECT l FROM
						(SELECT lg.pkey,
						lg.created_at at time zone 'ICT' created_at,
						lg.source,
						lg.status,
						lg.url,
						lg.image_url,
						lg.title,
						lg.text)
					 AS l)
				 ) AS properties
				 FROM  all_reports  AS lg, jkt_rw_boundary as rw
WHERE lg.created_at >= $1::timestamp WITH TIME ZONE
	AND lg.created_at <= $2::timestamp WITH TIME ZONE
	AND ST_Within(lg.the_geom, rw.the_geom)
) AS f ;
--SELECT $1::timestamp WITH TIME ZONE, $2::timestamp WITH TIME ZONE;
