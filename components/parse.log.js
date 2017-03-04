'use strict';

/* log output helper */ require('console.table');

// dependencies
var fs = require('fs');
var readline = require('readline');
var stream = require('stream');
var parseString  = require('xml2js').parseString;
var chalk = require('chalk');

module.exports = function parser(input) {

    if(!input){
        console.log(chalk.bold.red('WARNING: \t no input provided!'));
        return;
    }

    var instream = fs.createReadStream(input);
    var outstream = new stream;
    outstream.readable = true;

    var rl = readline.createInterface({
        input: instream,
        output: outstream,
        terminal: false
    });

    // store for records in error
    var flaggedRecords = [];
    // tracks how many records we've processed which are unaffected
    var okRecords = 0;
    // matches data between to square brackets i.e [ some date ]
    var regEx =/\[(.*)\]/;

    rl.on('line', function(line) {

        // prepare the log txt data for xml parsing
        var xmlData;

        try {
            xmlData = line.match(regEx)[1];
        } catch (e) {
            console.log(chalk.bold.red('ERROR: \t', e.message));
            return
        }

        parseString(xmlData, function (err, result) {

            // retrieve values from xml result
            var t = result.transactions.transaction[0];
            var transactionId = t.externalTransactionIdentifier[0];
            var monetaryAmount = parseFloat(t.monetaryAmount[0].amount[0]);
            var withdrawable = parseFloat(t.transactionWalletAmounts[0].monetaryAmount[0].amount[0]);
            var nonWithdrawable = parseFloat(t.transactionWalletAmounts[0].monetaryAmount[1].amount[0]);
            var bonusFunds = parseFloat(t.transactionWalletAmounts[0].monetaryAmount[2].amount[0]);

            // calculations for identifying transactions in error
            var walletTotal = parseFloat(withdrawable + nonWithdrawable + bonusFunds);
            var diff = parseFloat(monetaryAmount - walletTotal);

            // if error found  add to store
            if(monetaryAmount.toFixed(2) !== walletTotal.toFixed(2)) {
                var flagRecord = {
                    Transaction: transactionId,
                    MonetaryAmount: monetaryAmount.toFixed(2),
                    Withdrawable: withdrawable.toFixed(2),
                    NonWithdrawable: nonWithdrawable.toFixed(2),
                    BonusFunds: bonusFunds.toFixed(2),
                    Diff: diff.toFixed(2)
                }
                flaggedRecords.push(flagRecord);
            } else {
                okRecords += 1;
            }
        });
    }).on('close', function() {
        // complete, update console with results.
        console.log('Processing complete total flagged issues found:', flaggedRecords.length);
        console.log('Record found but OK: ', okRecords);
        if(flaggedRecords.length > 0) {
            console.table(flaggedRecords);
        }
    });
}
