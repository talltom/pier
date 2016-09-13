#!/usr/bin/env node
'use strict';

/* pier - Data platform for CogniCity
*
* Tomas Holderness - September 2016
* GPLv3
*/

var program = require('commander');

program
  .version('0.0.1')
  .command('get-floodstate [date]', 'get flood extents as geojson')
  .parse(process.argv);
