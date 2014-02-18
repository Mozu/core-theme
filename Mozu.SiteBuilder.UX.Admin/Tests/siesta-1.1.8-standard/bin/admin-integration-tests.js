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
console.log('baseDir:' + baseDir);
console.log('ARGV1:' + ARGV[1]);

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
var harnessURL = "http://" + localdomain + "/admin/Tests/index-no-ui.html";
console.log("harnessURL= " + harnessURL);

var reportFormat    = options[ 'report-format' ]
var reportFile      = options[ 'report-file' ]

isDebug             = options.debug || false

noColor             = options[ 'no-color' ] || isWindows

var tenantId = (args.argv[3] !== undefined) ? args.argv[3] : null;
console.log('tenantId=' +tenantId);


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

function getUrlOrigin(pg) {
    return pg.evaluate(function() { return window.location.origin; });
}

//from http://stackoverflow.com/questions/9246438/how-to-submit-a-form-using-phantomjs

function login(email, password, callback) {
    var pageOrigin = getUrlOrigin(page);
    var postBack = '&postbackUrl=http://' + localdomain + '/admin/auth/pants';
    var redirectUrl = '&redirectUrl=%2fadmin' + postBack;
    var retUrl = 'ReturnUrl=/login/to?scopeType=Tenant' + redirectUrl;
    var postData = 'Email=' + email + '&Password=' + password + '&' + retUrl;
    var postTarget = pageOrigin + '/login/home/login';
    console.log('*************');
    console.log(postTarget);
    console.log(postData);

    page.open(postTarget, 'post', postData, function (status) {
        if (status !== 'success') {
            console.log('Unable to post!');
            failInit();
        } else {
            console.log('success posting!');
            callback(pageOrigin, redirectUrl);
        }
    });

}

function getFirstTenantUrl(pg) {
    var tenantUrl = pg.evaluate(function () { return $('.scopes-container-sitebuilder > p > a:first').prop('href'); });
    console.log('jQuery first tenantUrl=' + tenantUrl);
    return tenantUrl;
}

function handleLoginAndTenantSelection(email, password) {
    
    login(email, password, function (pageOrigin, redirectUrl) {

        var pageUrl = getUrl(page);
        console.log("After login: " + pageUrl);
        console.log('redirectUrl: ' + redirectUrl);

        var tenantReturnUrl;
        if (tenantId === null) {
            console.log('tenantId is null');
            var tenantLoginUrl = getFirstTenantUrl(page);
            tenantReturnUrl = tenantLoginUrl + redirectUrl;
        } else {
            tenantReturnUrl = pageOrigin + '/login/to?scopeType=Tenant&scopeId=' + tenantId + redirectUrl;
            console.debug('TenantId has value');
        }
        console.log("tenantReturnUrl=" + tenantReturnUrl);
        try {
            page.open(tenantReturnUrl, function (tenantStatus) {
                if (tenantStatus !== 'success') {
                    console.log('Unable to open tenantReturnUrl');
                    console.log(tenantReturnUrl);
                    failInit();
                } else {
                    console.log('successfully opened tenantReturnUrl ' + tenantReturnUrl);
                    page.onLoadFinished = function (loadStatus) {
                        page.onLoadFinished = null;
                        console.log('Status: ' + loadStatus);
                        var postTenantPageUrl = getUrl(page);
                        console.log('TenantReturnUrl took us to ' + postTenantPageUrl);
                        beginTests();
                    };
                }
            });
        } catch (e) {
            console.log("errrrrrrrror");
            console.log(e.message);
            failInit();
        }
    });
    
}

page.open('http://' + localdomain + '/admin', function(status) {
    if (status !== "success")
        return failInit();
    console.log('Status: ' + status);
    var pageUrl = getUrl(page);
    console.log('Login attempt took us to ' + pageUrl);

    if (pageUrl.indexOf('login') != -1) {
        return handleLoginAndTenantSelection('MozuSbRoboTest@volusion.com', 'Volusion1!'); //MozuQA@volusion.com
    } else {
        return beginTests();
    }

});
    //handleLogin

    //page.onError = function (msg, trace) {
        //    console.log("onError____");
        //    console.log(msg);
        //    trace.forEach(function (item) {
        //        console.log('  ', item.file, ':', item.line);
        //    });
        //};
    
        
    //login(pageOrigin, 'MozuQA@volusion.com', 'Volusion1!', null, function (redirectUrl) {
    //    var tenantLoginUrl = getFirstTenantUrl(page);
    //    var tenantReturnUrl = tenantLoginUrl + redirectUrl;
    //    console.log("****TenantReturnUrl " + tenantReturnUrl);
        
        //page.onError = function (msg, trace) {
        //    console.log("onError____");
        //    console.log(msg);
        //    trace.forEach(function (item) {
        //        console.log('  ', item.file, ':', item.line);
        //    });
        //};
    //    try {
    //        page.open(tenantReturnUrl, function (tenantStatus) {
    //            console.log('My Status: ' + tenantStatus);
    //            if (status !== 'success') {
    //                console.log('Unable to open Tenant Return URL');
    //                console.log(tenantReturnUrl);
    //                failInit();
                    
    //            } else {
    //                console.log('success opening tenantReturnUrl');
    //                page.onLoadFinished = function (loadStatus) {
    //                    console.log('Status: ' + loadStatus);
    //                    openTestsIndex();
    //                    // Do other things here...
    //                };
    //            }
    //            //phantom.exit();
    //        });
    //    } catch (e) {
    //        console.log("errrrrrrrror");
    //        console.log(e.message);
    //    }
    //});



    //if (pageUrl.indexOf('auth') !== -1) {
    //    // we're not logged in, let's force a login
    //    page.onLoadFinished = function () {
    //        page.onLoadFinished = null;
    //        pageUrl = getUrl(page);
    //        console.log("testUser function took us to " + pageUrl);

            

    //        if (pageUrl.indexOf('auth/login') === -1) return failInit();
    //        page.open('http://' + localdomain + '/admin/auth/ChangeRole?id=1173', function () {
    //            if (page.cookies.some(function (c) { return c.name === "sbAdminAuth" })) return beginTests();
    //            return failInit();
    //        });
    //    };
    //    return page.evaluate(function () { testUser(); });
    //}

    //var derp = page.evaluate(function () { return !!window.Ext; })
    //console.log('Ext object is: ' + derp);
    //if (derp) return beginTests();
    //return failInit();

//}
//);

