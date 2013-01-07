var fs = require('fs'),
    util = require('util'),
    eyes = require('eyes'),
    Theme = require('../src/theme'),
    core3 = new Theme('Core3', { themesDir: '../Themes' }),
    xmlbuf = fs.readFileSync(core3.getPath('settings')),
    xml2js = require('xml2js'),
    iconv = require('iconv-lite'),
    parser = new xml2js.Parser();

parser.on('end', function (r) {
    console.log(eyes.inspector({ maxLength: false })(r.settings || r, false, null, true));
});


var xmlStr = iconv.decode(xmlbuf, 'utf8');
while (xmlStr.charAt(0) !== "<") xmlStr = xmlStr.substring(1);
parser.parseString(xmlStr);
