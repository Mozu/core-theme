var page = require('webpage').create(),

    fs = require("fs"),
    system = require('system'),
    baseDir = system.args[1],
    port = system.args[2],
    url = "http://localhost:"+ port +"/admin/tests/buildIndex.html?phantom=true&include=fart&pageSize=1&page=0";





var system = require('system');
if (system.args.length === 1) {
    console.log('Try to pass some args when invoking this script!');
}
function testReady() {
    console.log('__PHANTOMJS__:testReady');


    setTimeout(function () {
        var line = system.stdin.readLine();

        if (line == 'exit') {
            phantom.exit();
        }

        runTest(line.trim());
    }, 100);

}

function runTest(url) {
    console.log('[testing url-' + url + "-]");
 
    var res = page.evaluate(function (url) {
        try {
            var found = false;
            for (x in Siesta.my.activeHarness.descriptorsById) {
                if (x.toLowerCase() == url.toLowerCase()) {
                    found = true;
                }
            }
            
            return found;
        } catch (e) {
            return e.toString();
        }

    }, url);

    if (res !== true) {
        console.log("__PHANTOMJS__:errorFindingTest:" + url);

        
        setTimeout(function () {
            console.log('calling test ready from failed lookup--' + res);
            this.testReady();

        }, 1000);
        return;
    }

    res = page.evaluate(function (url) {
        try {
            var testDescriptor ;

            for (x in Siesta.my.activeHarness.descriptorsById) {
                if (x.toLowerCase() == url.toLowerCase()) {
                    testDescriptor = Siesta.my.activeHarness.descriptorsById[x];
                }
            }

            Siesta.my.activeHarness.launch([testDescriptor]);
            return true;
        } catch (e) {
            return e.toString();
        }

    }, url);

    if (res !== true) {
        console.log(res);
        setTimeout(function () {
            console.log('calling test ready from faulted launch');
            this.testReady();

        }, 1000);
        return;
    }
}

page.onConsoleMessage = function (msg) {
    var match;
    console.log(msg);
    if (match = msg.match(/^__PHANTOMJS__:([\s\S]*)/)) {
        var command = match[1];


        if (match = command.match(/^exit:(\d+)/)) {

            exitCode = Number(match[1]);
            if (exitCode != 4) {
                testReady();
            }


            return;
        }


        if (match = command.match(/^pageReport:([\s\S]*)/)) {
            console.log(msg);
            return;
        }

        if (match = command.match(/^summaryMessage:([\s\S]*)/)) {
            //summaryMessage = String(match[1]);
            //console.log(summaryMessage);
            return;
        }


        if (match = command.match(/^log:([\s\S]+)/)) {
            //console.log(match[1]);
            return;
        }


    } else {
        //console.log(msg); 
    }

};
page.open(url, function (status) {
    console.log(status);


    var intervalId = setInterval(function () {
        var isLoaded = page.evaluate(function () {
            if (Siesta.my.activeHarness.descriptors && Siesta.my.activeHarness.descriptors.length) {
                Siesta.my.activeHarness.includeTests = null;
                __REPORT_OPTIONS__ = null;
                __PAGE_REPORTS__ = [];
                return true;
            }
            return false;

        });
        if (!isLoaded) {
            return;
        }
        window.clearInterval(intervalId);

        testReady();

    }, 100);
});


//phantom.exit(0);