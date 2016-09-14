#!/usr/bin/env node

'use strict';
// Libraries
var program = require('commander');
var Massive = require('massive');
var moment = require('moment');

// Data process function
var patch_timeseries = function(FeatureCollection){
  for (var i = 0; i < FeatureCollection.features.length; i++){
    // Fill in empty first value
    if (FeatureCollection.features[i].properties.flood_state[0].state === null){
      FeatureCollection.features[i].properties.flood_state[0].state = 0;
    }
    // Patch timeseries with preceeding value
    for (var j = 1; j < FeatureCollection.features[i].properties.flood_state.length; j++){
      if (FeatureCollection.features[i].properties.flood_state[j].state === null){
        FeatureCollection.features[i].properties.flood_state[j].state = FeatureCollection.features[i].properties.flood_state[j-1].state;
      }
    }
  }
  return FeatureCollection;
};

// Create multiple feature attributes for each timestep
var explode_timeseries = function(FeatureCollection){
  for (var i = 0; i < FeatureCollection.features.length; i++){
    for (var j = 0; j < FeatureCollection.features[i].properties.flood_state.length; j++){
      if (FeatureCollection.features[i].properties.flood_state[j].state > 0){
        console.log(FeatureCollection.features[i].properties.flood_state[j].state);
      }
      var ts = FeatureCollection.features[i].properties.flood_state[j].ts;
      FeatureCollection.features[i].properties[ts] = FeatureCollection.features[i].properties.flood_state[j].state;
    }
  }
  return FeatureCollection;
};

// Suppress receeded flood areas
var suppress_receded_flood_areas = function(FeatureCollection){
  // Reverse iterate removing features where no flooding at time steps
  var i = FeatureCollection.features.length;
  while (i--){
    var sum_state = 0;
    for (var j = 0; j < FeatureCollection.features[i].properties.flood_state.length; j++){
      sum_state += FeatureCollection.features[i].properties.flood_state[j].state;
    }
    if (sum_state === 0){
      FeatureCollection.features.splice(i,1);
    }
  }
  return FeatureCollection;
};

// Program options
program
  .option('-e, --explode', 'Explode time series into multiple attributes')
  .option('-s, --suppress', 'Suppress areas where floods have receeded (recommended)')
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
  var result = patch_timeseries(res[0]);

  if (program.suppress){
    result = suppress_receded_flood_areas(result);
  }

  if (program.explode){
    result = explode_timeseries(result);
  }
  console.log(JSON.stringify(result));
  process.exit(1);
});
