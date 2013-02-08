/*
 * Mozu automated Siesta tester.
 * Based on phantomjs-launcher.js by Bryntum.
 * Run without arguments for usage.
 * (c) Practically no rights reserved, Volusion, Inc.
 * Blame Zetlen
 */
var isWindows       = /^win/i.test(navigator.platform)
var noColor         = false

var ARGV = require('system').args
var baseDir = isWindows ? ARGV[1].replace(/.$/, '') : ARGV[1] + '/'

phantom.injectJs(baseDir + 'siesta-1.1.8-standard/bin/launcher-common.js')

var safePrint = function (text) {
    if (noColor) text = text.replace(/\x1B\[\d+m([\s\S]*?)\x1B\[\d+m/g, '$1')
    
    console.log(text)
}

var isDebug = false

var debug = function (text) {
    if (isDebug) safePrint(text) 
}


// starting from 1.3 phantom segfaults when doing "phantom.exit" in the `onConsoleMessage` handler
// so need to delay the exit
var safeExit            = function (code) {
    setTimeout(function () {
        phantom.exit(code || 0)
    }, 0)
}

var args            = processArguments(ARGV)
var options         = args.options

if (options.version) {
    var fs          = require('fs')
    
    var siestaAll   = fs.read(baseDir + '../siesta-all.js')
    var match       = /^\/\*[\s\S]*?Siesta (\d.+)\n/.exec(siestaAll)
    
    console.log("PhantomJS : " + phantom.version.major + '.' + phantom.version.minor + '.' + phantom.version.patch)
    if (match) console.log("Siesta    : " + match[ 1 ])
    
    phantom.exit(8);
}

if (args.argv.length == 2 || options.help) {
    console.log([
        'Usage: admintests localdomain [OPTIONS]',
        'The `localdomain` should point to the local address where Mozu is running, often `localhost` or `localhost:8080` or some other port.',
        '',
        'Options (all are optional):',
        '--help                     - prints this help message',
        '--version                  - prints versions of Siesta and PhantomJS',
        '',
        '--filter filter_value      - a text of regexp to filter the urls of tests',
        '--verbose                  - enable the output from all assertions (not only from failed ones)',
        '--debug                    - enable diagnostic messages',
        '--report-format            - create a report after the test suite execution',
        '                             recognizable formats are: "JSON, JUnit"',
        '--report-file              - required when `report-format` is provided. ',
        '                             Specifies the file to save the report to.',
        '--width                    - width of the viewport, in pixels',
        '--height                   - height of the viewport, in pixels',
        '--no-color                 - disable the coloring of the output',
        '--pause                    - pause between individual tests, in milliseconds',
        
        // empty line to add the line break at the end
        ''
    ].join('\n'));
    
    phantom.exit(6);
}



var localdomain = args.argv[2];
var harnessURL = "http://" + localdomain + "/admin/Tests";

var reportFormat    = options[ 'report-format' ]
var reportFile      = options[ 'report-file' ]

isDebug             = options.debug || false

noColor             = options[ 'no-color' ] || isWindows


if (reportFormat && reportFormat != 'JSON' && reportFormat != 'JUnit') {
    console.log([
        'Unrecognized report format: ' + reportFormat
    ].join('\n'));
    
    phantom.exit(6)
}

if (reportFormat && !reportFile) {
    console.log([
        '`report-file` option is required, when `report-format` option is specified'
    ].join('\n'));
    
    phantom.exit(6)
}

if (reportFile && !reportFormat) reportFormat = 'JSON'

console.log("Launching PhantomJS " + phantom.version.major + '.' + phantom.version.minor + '.' + phantom.version.patch + " at " + constructURL(harnessURL, {}));



var pollPage = function (iface, callback) {
    var timeoutCheckerId  = setInterval(function () {
        // end the test suite after 3 mins of inactivity
        if (new Date() - iface.lastActivity > 3 * 60 * 1000) {
            safePrint('TIMEOUT: Exit after 3 minutes of inactivity');
            
            phantom.exit(2)
        }
    }, 10 * 1000)
    

    var isDoneCheckerId = setInterval(function () {
        if (iface.exitCode != null) {
            clearInterval(timeoutCheckerId)
            clearInterval(isDoneCheckerId)
            
            callback({
                exitCode        : iface.exitCode,
                pageCount       : iface.pageCount,
                summaryMessage  : iface.summaryMessage,
                combinedReport  : iface.combinedReport
            })
        }
    }, 1000)
}


var runPage = function (iface, params, callback) {
    
    iface.setWindowSize(params.viewportWidth, params.viewportHeight);
    
    iface.debug("Opening harness page: " + params.url)
    
    iface.open(params.url, function () {
        
        iface.debug("Page opened successfully: " + params.url)
        
        pollPage(iface, function (pageResult) {
            
            var result      = {
                exitCode        : pageResult.exitCode,
                pageCount       : pageResult.pageCount,
                summaryMessage  : pageResult.summaryMessage,
                combinedReport  : pageResult.combinedReport
            }
            
            iface.close()
            
            callback && callback(result)
        })
    })
}



var getProceduralInterface = function (reportOptions) {
    
    var currentPage
    var width, height
    
    var iface = {
        exitCode        : null,
        lastActivity    : new Date(),
        pageCount       : null,
        
        summaryMessage  : null,
        
        pageReports     : [],
        combinedReport  : null,
        
        browserName     : 'PhantomJS',
        
        debug : function (text) {
            debug(text)
        },
        
        
        print : function (text) {
            safePrint(text)
        },
        
        
        open : function (url, callback) {
    
            currentPage = new WebPage({
            
                settings : {
                    localToRemoteUrlAccessEnabled   : true
                },
                
                viewportSize : { 
                    width   : width, 
                    height  : height
                },
            
                // Check for server error during page load. Log status code, then exit.
                onResourceReceived : function (resource) {
                    if (resource.url === url && resource.status > 400) {
                        console.log('Failed to load URL: ' + url + '(status: ' + resource.status + ')');
                        phantom.exit(5)
                    }
                },
                
                onInitialized : function () {
                    currentPage.evaluate(function (pageReports, reportOptions) {
                        __PAGE_REPORTS__    = pageReports;
                        __REPORT_OPTIONS__ = reportOptions;
                    }, iface.pageReports, reportOptions)
                },
                
                onConsoleMessage : function (msg) {
                    var match
                    
                    if (match = msg.match(/^__PHANTOMJS__:([\s\S]*)/)) {
                        var command     = match[ 1 ]
                        
                        debug('Received command: ' + command)
                    
                        if (match = command.match(/exit:(\d+)/)) {
                            iface.exitCode = Number(match[ 1 ])
                        
                            return
                        }
                        
                        if (match = command.match(/pageCount:(\d+)/)) {
                            iface.pageCount = Number(match[ 1 ])
                        
                            return
                        }
                        
                        if (match = command.match(/pageReport:([\s\S]*)/)) {
                            iface.pageReports.push(JSON.parse(match[ 1 ]))
                        
                            return
                        }
                        
                        if (match = command.match(/summaryMessage:([\s\S]*)/)) {
                            iface.summaryMessage = String(match[ 1 ])
                        
                            return
                        }
                        
                        if (match = command.match(/combinedReport:([\s\S]*)/)) {
                            iface.combinedReport = String(match[ 1 ])
                        
                            return
                        }
                    
                        if (match = command.match(/keepAlive/)) {
                            iface.lastActivity = new Date()
                        
                            return
                        }
                        
                        if (match = command.match(/log:([\s\S]+)/)) {
                            safePrint(match[ 1 ])
                        
                            return
                        }
                        
                        throw "Unknown phantomjs command: " + command
                    } else
                        console.log(msg)
                }
            })
            
            // see http://code.google.com/p/phantomjs/issues/detail?id=504
            var initialOpen     = true
            
            currentPage.open(url, function (status) {
                if (!initialOpen) return 
                
                initialOpen = false
                
                if (status !== "success") {
                    console.log("Failed to load the URL: " + url)
            
                    phantom.exit(5)
                }
                
                setTimeout(function () {
                    if (iface.executeScript("var parent = window.opener || window.parent; return typeof Siesta == 'undefined' && (!parent || typeof parent.Siesta == 'undefined')")) {
                        console.log("[ERROR] Can't find Siesta on the harness page - page loading failed?")
                        
                        iface.close()
                        
                        phantom.exit(5)
                    }
                    
                    var siestaIsAutomated   = iface.executeScript("var parent = window.opener || window.parent; try { return typeof Siesta.Harness.Browser.Automation != 'undefined' } catch(e) { try { return typeof parent.Siesta.Harness.Browser.Automation != 'undefined' } catch(e) { return false } }")
                    
                    if (!siestaIsAutomated) {
                        console.log("[ERROR] The harness page you are targeting contains Siesta Lite distribution. To use automation facilities, \nmake sure harness page uses `siesta-all.js` from Standard or Trial packages")
                        
                        iface.close()
                        
                        phantom.exit(5)
                    }
                    
                    callback && callback()
                }, 100)
            })
        },
        
        
        close : function () {
            currentPage.release()
            
            currentPage             = null
            
            iface.lastActivity      = null
            iface.exitCode          = null
        },
        
        
        setWindowSize : function (w, h) {
            width       = w
            height      = h
        },
        
        
        executeScript   : function (text) {
            var func = eval('(function() {' + text + '})')
            
            return currentPage.evaluate(func)
        },
        
        
        sleep : function (timeout, func) {
            setTimeout(func, timeout)
        },
        
        
        saveReport: function (content) {
            var fs = require('fs')
            
            fs.write(reportOptions.file, content, 'w')
        }
    }
    
    return iface
}
// eof `getProceduralInterface`


var reportOptions       = reportFormat ? {
    format      : reportFormat,
    file        : reportFile
} : null



var iface   = getProceduralInterface(reportOptions)
var page = new WebPage({
    settings : {
        localToRemoteUrlAccessEnabled   : true
    }
})
function failInit() {
    console.log([
        "Loading admin page failed! Check that your localdomain is correct and working."
    ].join("\n"));
    phantom.exit(1);
}

function beginTests() {
    console.log('Loading harness at ' + harnessURL);
    page.release();
    runBrowser(iface, {
        harnessURL: harnessURL,
        query: {
            phantom: true,
            verbose: options.verbose,
            filter: options.filter,
            pause: options.pause
        },
        viewportWidth: options.width || 1200,
        viewportHeight: options.height || 800,
        reportOptions: reportOptions
    }, function (exitCode) {
        safeExit(exitCode)
    })
}


// test whether we're logged in
// TODO: ‎( ͡° ͜ʖ ͡°)
console.log('Testing active login...')


function getUrl(pg) {
    return pg.evaluate(function () { return window.location.href })
}

page.open('http://' + localdomain + '/admin', function (status) {
    if (status !== "success") return failInit();
    var pageUrl = getUrl(page);
    console.log('Login attempt took us to ' + pageUrl);
    if (pageUrl.indexOf('auth') !== -1) {
        // we're not logged in, let's force a login
        page.onLoadFinished = function () {
            page.onLoadFinished = null;
            pageUrl = getUrl(page);
            console.log("testUser function took us to " + pageUrl);
            if (pageUrl.indexOf('auth/login') === -1) return failInit();
            page.open('http://' + localdomain + '/admin/auth/ChangeRole?id=1173', function () {
                if (page.cookies.some(function (c) { return c.name === "sbAdminAuth" })) return beginTests();
                return failInit();
            });
        };
        return page.evaluate(function () { testUser(); });
    }

    var derp = page.evaluate(function () { return !!window.Ext; })
    console.log('Ext object is: ' + derp);
    if (derp) return beginTests();
    return failInit();

});


// BEGIN OLD CODE
/*
var isWindows       = /^win/i.test(navigator.platform)

var safePrint = function (text) {
    if (isWindows) text = text.replace(/\x1B\[\d+m([\s\S]*?)\x1B\[\d+m/g, '$1')
    
    console.log(text)
}

// starting from 1.3 phantom segfaults when doing "phantom.exit" in the `onConsoleMessage` handler
// so need to delay the exit
var safeExit            = function (code) {
    setTimeout(function () {
        phantom.exit(code || 0)
    }, 0)
}

var evaluateWithArgs    = function (page, func, args) {
    var funcSource      = func.toString()
    
    for (var name in args) funcSource = funcSource.replace("VARS_"+name, "'" + args[ name ] + "'")    
    
    return page.evaluate(funcSource)
}


var processArguments = function (args) {

    var options     = {}
    var argv        = []
    
    var currentOption
    
    var addOption = function (option, value) {
        options[ option ] = value
        
        currentOption = null
    }
    
    for (var i = 0; i < args.length; i++) {
        var arg     = args[ i ]
        
        var match   = /--([\w_-]+)(?=\=(.*)|$)/.exec(arg)
        
        // we get a switch like, --option or --option=value
        if (match) {
            // dealing with current state first
            if (currentOption) addOption(currentOption, true)
            
            // now processing a new match
            if (match[ 2 ] != undefined)
                addOption(match[ 1 ], match[ 2 ])
            else
                currentOption = match[ 1 ]
            
        } else
            if (currentOption) 
                addOption(currentOption, arg)
            else
                argv.push(arg)
    }
    
    if (currentOption) addOption(currentOption, true)
    
    return {
        options     : options,
        argv        : argv
    }
}

var args = processArguments(phantom.args)


if (!args.argv.length || args.options.help) {
    console.log([
        'Usage: admintests localdomain [OPTIONS]',
        'The `localdomain` should point to the local address where Mozu is running, often `localhost` or `localhost:8080` or some other port.',
        '',
        'Options (all are optional):',
        '--filter filter_value      - a text of regexp to filter the urls of tests',
        '--verbose                  - enable the output from all assertions (not only from failed ones)',
    
        '--report-format            - create a report after the test suite execution',
        '                             recognizable formats are: "JSON, JUnit"',
        '--report-file              - required when `report-format` is provided. ',
        '                             Specifies the file to save the report to.'
    ].join('\n'));
    
    phantom.exit(1)
}

var localdomain     = args.argv[0]
var filter          = args.options.filter
var reportFormat    = args.options[ 'report-format' ] || 'text'
var reportFile      = args.options[ 'report-file' ]

if (reportFormat != 'text' && reportFormat != 'JSON' && reportFormat != 'JUnit') {
    console.log([
        'Unrecognized report format: ' + reportFormat
    ].join('\n'));
    
    phantom.exit(1)
}

if (reportFormat != 'text' && !reportFile) {
    console.log([
        '`report-file` option is required, when `report-format` option is specified'
    ].join('\n'));
    
    phantom.exit(1)
}

if (!localdomain) {
    console.log([
        'Please supply your local domain, e.g. localhost or localhost:89 or taco.'
    ].join('\n'));

    phantom.exit(1);
}

var url = "http://" + localdomain + "/admin/Tests/MozuTestSuite.html?phantom=true";

if (filter) {
    url         += '&filter=' + encodeURIComponent(filter)
}

if (args.options.verbose) {
    url         += '&verbose=true'
}


// http://code.google.com/p/phantomjs/issues/detail?id=132
var exitWithReport      = function (code, exitByInactivityTimeout) {
    
    if (reportFormat != 'text') {
        var serializedReport    = evaluateWithArgs(page, function () {
            return __ACTIVE_HARNESS__.generateReport({
                format      : VARS_reportFormat,
                timeout     : VARS_exitByInactivityTimeout
            })
        }, {
            reportFormat                : reportFormat,
            exitByInactivityTimeout     : exitByInactivityTimeout || ''
        })
        
        var fs                  = require('fs')
        
        fs.write(reportFile, serializedReport, 'w')
    }
    
    safeExit(code)
}

var lastActivity       = new Date()



var page = new WebPage({
    settings : {
        localToRemoteUrlAccessEnabled   : true
    }
})



function beginTests() {

    page.viewportSize = { width : 1200, height : 800 }

    page.onConsoleMessage = function (msg) {
        var match

        if (
            msg == 'Sorry, trial version only allows test suites with no more than 10 files'
                ||
            msg == 'Sorry, trial version only allows 30 assertions per test file'
        ) {
            safePrint(msg);
            safeExit(10)
            return
        }

        if (match = msg.match(/^__PHANTOMJS__:(.+)/)) {
            var command     = match[ 1 ]

            if (match = command.match(/exit\((\d+)?\)/)) {
                exitWithReport(match[ 1 ])

                return
            }

            if (match = command.match(/keepAlive/)) {
                lastActivity = new Date()

                return
            }
        } else
            safePrint(msg);
    }


    setInterval(function () {
        // end the test suite after 3 mins of inactivity
        if (new Date() - lastActivity > 3 * 60 * 1000) {
            safePrint('TIMEOUT: Exit after 3 minutes of inactivity');
            exitWithReport(10, true)
        }
    }, 10 * 1000)


    page.open(encodeURI(url), function (status) {
        if (status !== "success") {
            console.log("Can't load the URL: " + url)

            phantom.exit(1)
        }
    })

    console.log("Launching PhantomJS at " + url);

}


            

            */