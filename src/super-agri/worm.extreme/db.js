/**
 * Created by qtisa on 2017/6/26.
 */


const {readFileSync, writeFileSync} = require('fs');
const {join} = require('path');

var bills = JSON.parse(readFileSync('C:\\Users\\qtisa\\Desktop\\KN_ZWYD.json').toString());


writeFileSync(join(__dirname, './bills.json'), JSON.stringify(bills.RECORDS));
