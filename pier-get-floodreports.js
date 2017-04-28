#!/usr/bin/env node

'use strict';
// Libraries
var program = require('commander');
var Massive = require('massive');
var moment = require('moment');

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
var start = date[0]+' 00:00+07';
var end = date[0]+' 23:59+07';

// Query
var db = Massive.connectSync({db: "mapjakarta_aug2016"});
db.get_floodreports([start, end], function(err, res){
  if (err){
    console.log('[Database error] '+err);
    process.exit(1);
  }
  console.log(JSON.stringify(res[0]));
  process.exit(1);
});
