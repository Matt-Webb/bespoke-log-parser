'use strict';

// module dependencies.
var fs = require('fs'),
    chalk = require('chalk'),
    logParser = require('./components/parse.log');

// file name for markets passed in on the command line
var dataSource = process.argv[2];

// error handling
if(!dataSource) {
    console.log(chalk.bold.red('WARNING: \t You need to pass your markets text file as an argument on the command line. Please try again.'));
    console.log(chalk.yellow('Example: \t $ node run.js log.xml'));
    process.exit(1);
    return
}

// run check for discrepancies in logs:
logParser(dataSource);

console.log('\t|----- complete -----|');
