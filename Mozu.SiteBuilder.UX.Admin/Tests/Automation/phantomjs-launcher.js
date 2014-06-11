var fs              = require('fs')
var isWindows       = /^win/i.test(navigator.platform)
var noColor         = false

var ARGV            = require('system').args
var binDir          = isWindows ? ARGV[ 1 ].replace(/.$/, '') : ARGV[ 1 ] + '/'

phantom.injectJs(binDir + 'launcher-common.js')

var safePrint = function (text) {
    if (noColor) text = text.replace(/\x1B\[\d+m([\s\S]*?)\x1B\[\d+m/g, '$1')
    
    console.log(text)
}

var isDebug         = false

var debug = function (text) {
    if (isDebug) safePrint(text) 
}

var quit            = function (code) {
    phantom.exit(code || 0)
}

// starting from 1.3 phantom segfaults when doing "phantom.exit" in the `onConsoleMessage` handler
// so need to delay the exit
var safeExit            = function (code) {
    setTimeout(function () {
        phantom.exit(code || 0)
    }, 0)
}

var convertPath         = function (path) {
    return path
}

var readFile            = function (fileName) {
    return fs.read(fileName)
}

var args            = processArguments(ARGV)
var options         = args.options

if (options.version) {
    var siestaAll   = fs.read(binDir + '../siesta-all.js')
    var match       = /^\/\*[\s\S]*?Siesta (\d.+)\n/.exec(siestaAll)
    
    console.log("PhantomJS : " + phantom.version.major + '.' + phantom.version.minor + '.' + phantom.version.patch)
    if (match) console.log("Siesta    : " + match[ 1 ])
    
    phantom.exit(8);
}

if (args.argv.length == 2 || options.help) {
    console.log([
        'Usage: phantomjs url [OPTIONS]',
        'The `url` should point to your `tests/index.html` file',
        '',
        'Options (all are optional):',
        '--help                     - prints this help message',
        '--version                  - prints versions of Siesta and PhantomJS',
        '',
        '--include regexp           - a regexp to to only include the matching urls of tests',
        '                             this option has an alias: filter',
        '--exclude regexp           - a regexp to exclude the matching urls, takes precedence over `include`',
        
        '--previous-coverage-report - specifies the location of the previous coverage report, which will be',
        '                             combined with the current session. It must be generated in the "raw" format.',
        '                             Can be a file name or directory name, in the latter case',
        '                             file name is assumed to be "raw_coverage_data.json"',
        '--coverage-report-format   - specifies the format of the code coverage report, recognized',
        '                             values are `html`, `lcov` or `raw`.',
        '                             If provided, will enable the code coverage information collection.',
        '                             This option can be repeated several times, resulting in several reports',
        '                             saved in the same directory. Alternatively, several formats can be',
        '                             concatenated with "," or "+": --coverage-report-format=html+raw',
        '--coverage-report-dir      - specifies the output directory for the code coverage report',
        '                             default value is "./coverage/"',          
        '--coverage-unit            - sets the "coverageUnit" harness config option,',
        '                             recognized values are: "file" and "extjs_class"',
        '--coverage-no-source       - if specified, the source code files will not be included in the coverage report.',
        '                             Currently only supported for html report',
        
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
        '--page-pause               - pause between tests pages, in milliseconds, default value is 3000',
        '--page-size                - the number of tests, after which the browser will be restarted, default value is 10',
        '--teamcity                 - enables the special additional output during test suite execution, that allows',
        '                             TeamCity to generate realtime progress information',
        '--team-city                - synonym for --teamcity',
        '--jenkins                  - forces launcher to always exit with 0 exit code (otherwise Jenkins thinks build has failed',
        '                             and will not try to create a report)',         
        
        // empty line to add the line break at the end
        ''
    ].join('\n'));
    
    phantom.exit(6);
}



var harnessURL      = args.argv[ 2 ]

var reportFormat    = options[ 'report-format' ]
var reportFile      = options[ 'report-file' ]

isDebug             = options.debug || false

noColor             = options[ 'no-color' ] || isWindows

var isJenkins       = options[ 'jenkins' ]


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

var coverageOptions = processCoverageOptions(options)



console.log("Launching PhantomJS " + phantom.version.major + '.' + phantom.version.minor + '.' + phantom.version.patch + " at " + constructURL(harnessURL, {}));


var runPage = function (iface, params, callback) {
    
    iface.setWindowSize(params.viewportWidth, params.viewportHeight);
    
    iface.debug("Opening harness page: " + params.url)
    
    var timeoutCheckerId
    
    iface.onPageExit = function () {
        clearInterval(timeoutCheckerId)
        
        var exitCode    = iface.exitCode
        
        iface.close()
        
        callback({
            exitCode        : exitCode,
            pageCount       : iface.pageCount,
            summaryMessage  : iface.summaryMessage,
            combinedReport  : iface.combinedReport,
            
            htmlReport      : iface.htmlReport,
            lcovReport      : iface.lcovReport,
            rawReport       : iface.rawReport
        })
    }
    
    iface.pageParams    = params
    iface.shared        = params.shared
    
    
    iface.open(params.url, function () {
        
        iface.debug("Page opened successfully: " + params.url)
        
        timeoutCheckerId  = setInterval(function () {
            // end the test suite after 3 mins of inactivity
            if (new Date() - iface.lastActivity > 3 * 60 * 1000) {
                safePrint('TIMEOUT: Exit after 3 minutes of inactivity');
                
                phantom.exit(2)
            }
        }, 10 * 1000)
    })
}



var getProceduralInterface = function (reportOptions) {
    
    var currentPage
    var width, height
    var sanityCheckId
    
    var iface = {
        exitCode        : null,
        lastActivity    : new Date(),
        pageCount       : null,
        
        summaryMessage  : null,
        
        // coverage reports
        htmlReport      : null,
        lcovReport      : null,
        rawReport       : null,
        
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
                    currentPage.evaluate(function (pageReports, reportOptions, contentManagerState, coverageInfo, coverageReportFormats) {
                        __PAGE_REPORTS__            = pageReports;
                        __REPORT_OPTIONS__          = reportOptions;
                        __CONTENT_MANAGER_STATE__   = contentManagerState
                        __PREV_COVERAGE_INFO__      = coverageInfo
                        __COVERAGE_REPORT_FORMATS__ = coverageReportFormats
                    }, iface.pageReports, reportOptions, iface.shared.contentManagerState, iface.shared.coverageInfo, coverageOptions.coverageReportFormats)
                },
                
                onConsoleMessage : function (msg) {
                    var match
                    
                    if (match = msg.match(/^__PHANTOMJS__:([\s\S]*)/)) {
                        var command     = match[ 1 ]
                        
                        debug('Received command: ' + command)
                    
                        if (match = command.match(/^exit:(\d+)/)) {
                            iface.exitCode = Number(match[ 1 ])
                            
                            iface.onPageExit()
                            
                            return
                        }
                        
                        if (match = command.match(/^pageCount:(\d+)/)) {
                            iface.pageCount = Number(match[ 1 ])
                        
                            return
                        }
                        
                        if (match = command.match(/^pageReport:([\s\S]*)/)) {
                            iface.pageReports.push(JSON.parse(match[ 1 ]))
                        
                            return
                        }
                        
                        if (match = command.match(/^summaryMessage:([\s\S]*)/)) {
                            iface.summaryMessage = String(match[ 1 ])
                        
                            return
                        }
                        
                        if (match = command.match(/^combinedReport:([\s\S]*)/)) {
                            iface.combinedReport = String(match[ 1 ])
                        
                            return
                        }
                    
                        if (match = command.match(/^keepAlive/)) {
                            iface.lastActivity = new Date()
                        
                            return
                        }
                        
                        if (match = command.match(/^log:([\s\S]+)/)) {
                            safePrint(match[ 1 ])
                        
                            return
                        }
                        
                        if (match = command.match(/^contentManagerState:([\s\S]+)/)) {
                            iface.shared.contentManagerState    = JSON.parse(match[ 1 ])
                        
                            return
                        }
                        
                        if (match = command.match(/^coverageInfo:([\s\S]+)/)) {
                            iface.shared.coverageInfo           = JSON.parse(match[ 1 ])
                        
                            return
                        }
                        
                        if (match = command.match(/^htmlReport:([\s\S]+)/)) {
                            iface.htmlReport                    = JSON.parse(match[ 1 ])
                        
                            return
                        }
                        
                        if (match = command.match(/^lcovReport:([\s\S]+)/)) {
                            iface.lcovReport                    = JSON.parse(match[ 1 ])
                        
                            return
                        }
                        
                        if (match = command.match(/^rawReport:([\s\S]+)/)) {
                            iface.rawReport                     = JSON.parse(match[ 1 ])
                        
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
                
                sanityCheckId = setTimeout(function () {
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
                    
                    if (coverageOptions.enableCodeCoverage) {
                        var hasCoverageOnPage   = String(iface.executeScript("var parent = window.opener || window.parent; try { return typeof IstanbulCollector != 'undefined' } catch(e) { try { return typeof parent.IstanbulCollector != 'undefined' } catch(e) { return false } } ")) == 'true'
                        
                        if (!hasCoverageOnPage) {
                            console.log("[ERROR] You've enabled code coverage, but harness page you are targeting does not contain required classes. Did you include `siesta-coverage-all.js` on the harness page?")
                            
                            iface.close()
                            
                            phantom.exit(5)
                        }
                    }
                    
                    callback && callback()
                }, 100)
            })
        },
        
        
        close : function () {
            clearTimeout(sanityCheckId)
            
            if (currentPage) {
                currentPage.release()
                
                currentPage             = null
                
                iface.lastActivity      = null
                iface.exitCode          = null
            }
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
        
        
        saveReport : function (content) {
            this.saveFile(reportOptions.file, content, 'w')
        },
        
        
        saveFile : function (fileName, content, mode) {
            fs.write(fileName, content, mode || 'w')
        },
        
        
        readFile : function (fileName, mode) {
            if (mode == 'rb') {
                return fs.open(fileName, 'rb').read() 
            } else
                return readFile(fileName)
        },
        
        
        copyFile : function (source, dest) {
            this.saveFile(dest, this.readFile(source, 'rb'), 'wb')
        },
        
        
        copyTree : function (source, dest) {
            fs.copyTree(source, dest)
        },
        
        
        saveHtmlCoverageReport : function (reportDir, reportContent) {
            // "binDir" has trailing slash in PhantomJS!
            
            this.copyFile(binDir + '/coverage/index.html', reportDir + '/index.html')
            this.copyFile(binDir + '/coverage/siesta-coverage-report.css', reportDir + '/css/siesta-coverage-report.css')
            this.copyFile(binDir + '/coverage/siesta-coverage-report.js', reportDir + '/siesta-coverage-report.js')
            
            this.copyFile(binDir + '/../resources/images/leaf.png', reportDir + '/images/leaf.png')
            this.copyFile(binDir + '/../resources/images/ns.png', reportDir + '/images/ns.png')
            
            // "binDir" has trailing slash in PhantomJS!
            this.copyTree(binDir + '../resources/css/fonts', reportDir + '/css/fonts')
            
            this.saveFile(reportDir + '/coverage-data.json', JSON.stringify(reportContent))
        },
        
        
        saveLcovCoverageReport : function (reportDir, reportContent) {
            this.saveFile(reportDir + '/lcov.info', reportContent.lcovReport)
        },
        
        
        saveRawCoverageReport : function (reportDir, reportContent) {
            this.saveFile(reportDir + '/raw_coverage_data.json', JSON.stringify(reportContent))
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

runBrowser(iface, {
    harnessURL      : harnessURL,
    query           : {
        phantom                 : true,
        verbose                 : options.verbose,
        'include'               : options[ 'include' ] || options.filter,
        exclude                 : options[ 'exclude' ],
        
        pause                   : options.pause,
        pageSize                : options[ 'page-size' ],
        
        isTeamCity              : options[ 'team-city' ] || options[ 'teamcity' ],
        isJenkins               : isJenkins,
        
        enableCodeCoverage      : coverageOptions.enableCodeCoverage,
        coverageUnit            : coverageOptions.coverageUnit,
        hasPreviousReport       : Boolean(coverageOptions.previousCoverageReport),
        coverageNoSource        : options[ 'coverage-no-source' ]
    },
    pagePause               : options[ 'page-pause' ],
    
    viewportWidth           : options.width || 1200,
    viewportHeight          : options.height || 800,
    
    reportOptions           : reportOptions,
    
    enableCodeCoverage      : coverageOptions.enableCodeCoverage,
    coverageReportDir       : coverageOptions.coverageReportDir,
    coverageReportFormats   : coverageOptions.coverageReportFormats,
    coverageUnit            : coverageOptions.coverageUnit,
    previousCoverageReport  : coverageOptions.previousCoverageReport
    
}, function (exitCode) {
    safeExit(isJenkins ? 0 : exitCode)
})
