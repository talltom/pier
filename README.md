Pier
====
#### Data analysis platform for [CogniCity](https://github.com/smart-facility/cognicity-server)

## Install
```sh
$ cd pier
$ npm install
$ npm link
```

## Dependencies
* Node >= v4.4.5
* NPM >= 3.10.5
* Local copy of cognicity-rem Postgres database

## Commands
### get-floodstate
```sh
$ pier get-floodstate 2016-03-09
```
##### Description
Get historical extents of flooding from the [Risk Evaluation Matrix](https://github.com/smart-facility/cognicity-rem-server) database as geojson.

##### Parameters
* Day must be specified as a ISO 8601 date [YYYY-MM-DD]

#### Options
* -e --explode Explode time series into multiple attributes
* -s --suppress Suppress areas where floods have receded (recommended)

##### Output
* geojson feature collection representing polygons of all districts which experienced flooding on the specified day
* data is written to stdout
* Flood state is downsampled to hourly interval
* Polygon attribute *flood_state* lists flood heights for each hour over the 24 hour period
* Data specification: https://petajakarta.org/banjir/en/data/v2/#flooded
