#!/usr/bin/env node
'use strict';
// Libraries
var program = require('commander');
var Massive = require('massive');
var moment = require('moment');

// Data process function
var patch_timeseries = function(FeatureCollection){
  for (var i = 0; i < FeatureCollection.features.length; i++){
    if (FeatureCollection.features[i].properties.flood_state[0].state === null){
      FeatureCollection.features[i].properties.flood_state[0].state = 0;
    }
    for (var j = 1; j < FeatureCollection.features[i].properties.flood_state.length; j++){
      if (FeatureCollection.features[i].properties.flood_state[j].state === null){
        FeatureCollection.features[i].properties.flood_state[j].state = FeatureCollection.features[i].properties.flood_state[j-1].state;
      }
    }
  }
  return FeatureCollection;
};

// Program options
program
  .parse(process.argv);

var date = program.args;

// Validate date input
if (!date.length){
  console.error('A date is required [YYYY-MM-DD]');
  process.exit(1);
}
if (moment(date, "YYYY-MM-DD", true).isValid() !== true){
  console.error('Date format must be YYYY-MM-DD');
  process.exit(1);
}
// Create start and end date
var start = date[0]+' 00:00';
var end = date[0]+' 23:59';

// Query
var db = Massive.connectSync({db: "mapjakarta_rem_aug2016"});
db.pier_floodstate_type(function(err, res){
  if (err){
    console.log('[Database error]' +err);
    process.exit(1);
  }
});
db.get_floodstate([start, end], function(err, res){
  if (err){
    console.log('[Database error] '+err);
    process.exit(1);
  }
  console.log(JSON.stringify(patch_timeseries(res[0])));
  process.exit(1);
});
