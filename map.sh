#!/usr/bin/env bash

mkdir -p tmp
rm -rf tmp/*
ogr2ogr -f GeoJSON -where "ADM0_A3 IN ('JPN', 'TWN', 'CHN', 'KOR', 'PRK', 'IDN', 'PHL', 'MYS', 'THA', 'VNM', 'KHM', 'LAO', 'MNG', 'RUS')" tmp/subunits.json data/ne_50m_admin_0_map_subunits.shp
ogr2ogr -f GeoJSON -where "ADM0_A3 IN ('JPN', 'TWN', 'CHN', 'KOR', 'PRK', 'IDN', 'PHL', 'MYS', 'THA', 'VNM', 'KHM', 'LAO', 'MNG', 'RUS') AND SCALERANK < 8" tmp/places.json data/ne_50m_populated_places_simple.shp
./node_modules/.bin/topojson -o tmp/east-asia.json --id-property SU_A3 --properties name=NAME -- tmp/subunits.json tmp/places.json
