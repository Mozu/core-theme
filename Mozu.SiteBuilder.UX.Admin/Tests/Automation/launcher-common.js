// Exit codes:
// 0 - all tests passed
// 1 - there were test failures
// 2 - inactivity timeout while running the test suite
// 3 - no supported browsers available on this machine
// 4 - no tests to run (probably `include` doesn't match any test url or `exclude` match anything)
// 5 - can't open harness page
// 6 - wrong arguments
// 7 - something was wrong (applicable for Selenium only)
// 8 - exit after printing version
// 9 - java is not installed or not available in PATH

//============================================================================================================
// simple parser for the command-line arguments 

var processArguments = function (args) {

    var options     = {}
    var argv        = []
    
    var currentOption
    
    var addOption = function (option, value) {
        if (options.hasOwnProperty(option)) {
            var prevValue   = options[ option ]
            
            if (!(prevValue instanceof Array)) options[ option ] = [ prevValue ]
            
            options[ option ].push(value)
            
        } else
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
// eof processArguments


//============================================================================================================
// helper for appending query parameters after the base url: http://base.url/?param1=value&param2=value 

var constructURL = function (baseURL, options) {
    options         = options || {}
    
    if (!baseURL.match(/^https?:\/\//)) baseURL = 'http://' + baseURL
    
    var isFirst     = true
    
    for (var name in options) {
        var value       = options[ name ]
        
        // ignore `null` and `undefined` values
        if (value == null) continue
        
        var delimeter       = isFirst ? (baseURL.match(/\?/) ? '&' : '?') : '&'
        
        baseURL     += delimeter + name + '=' + encodeURIComponent(options[ name ])
        
        isFirst     = false
    }
    
    return baseURL
}

// browser sniffing

var parseBrowser = function (uaString) {
    var browser = 'unknown'
    var version = ''
    
    var match
    
    if (match = /Firefox\/((?:\d+\.?)+)/.exec(uaString)) {
        browser     = "Firefox"
        version     = match[ 1 ]
    }
    
    if (match = /Chrome\/((?:\d+\.?)+)/.exec(uaString)) {
        browser     = "Chrome"
        version     = match[ 1 ]
    }
    
    if (match = /MSIE\s*((?:\d+\.?)+)/.exec(uaString)) {
        browser     = "IE"
        version     = match[ 1 ]
    }
    
    if (uaString.match(/trident/i) && (match = /rv.(\d\d\.?\d?)/.exec(uaString))) {
        browser     = "IE"
        version     = match[ 1 ]
    }
    
    if (match = /Apple.*Version\/((?:\d+\.?)+)\s*(?=Safari\/((?:\d+\.?)+))/.exec(uaString)) {
        browser     = "Safari"
        version     = match[ 1 ] + ' (' + match[ 2 ] + ')'
    }
    
    return {
        name        : browser,
        version     : version
    }
}


var parseOS = function (platform) {
    if (/Win/.test(platform)) return "Windows"
    
    if (/Mac/.test(platform)) return "MacOS"
    
    if (/Linux/.test(platform)) return "Linux"
    
    return "unknown"
}

// requires "convertPath", "readFile", "quit"
var processCoverageOptions = function (options) {
    var coverageReportFormats    = options[ 'coverage-report-format' ] || ''
    if (!(coverageReportFormats instanceof Array)) coverageReportFormats = [ coverageReportFormats ]
    
    coverageReportFormats.forEach(function (format, index, arr) {
        var formats     = format.split(/\+|,/)
        
        if (formats.length == 1) return
        
        arr[ index ]    = formats
    })
    
    coverageReportFormats       = Array.prototype.concat.apply([], coverageReportFormats).filter(function (format) { return Boolean(format) })
    
    coverageReportFormats.forEach(function (format) {
        if (format != 'html' && format != 'raw' && format != 'lcov') {
            print([
                'Unrecognized coverage report format: ' + format
            ].join('\n'));
            
            quit(6)
        }
    })
    
    var coverageReportDir       = options[ 'coverage-report-dir' ] || convertPath('./coverage/')
    
    // remove "/" at the end if presented
    coverageReportDir           = coverageReportDir.replace(/\/?$/, '')
    
    var enableCodeCoverage      = coverageReportFormats.length > 0
    var coverageUnit            = options[ 'coverage-unit' ]
    
    if (coverageUnit && coverageUnit != 'file' && coverageUnit != 'extjs_class') {
        print([
            'Unrecognized coverage unit: ' + coverageUnit
        ].join('\n'));
        
        quit(6)
    }
    
    var previousCoverageReport  = options[ 'previous-coverage-report' ]
    
    if (previousCoverageReport) {
        var report
        
        try {
            report              = readFile(previousCoverageReport)
        } catch (e) {
            try {
                report          = readFile(previousCoverageReport.replace(/(\\|\/)?$/, '/') + 'raw_coverage_data.json')
            } catch (e) {
                print([
                    "Can't read the content of the previous raw coverage report: " + e
                ].join('\n'));
                
                quit(6)
            }
        }
        
        try {
            report              = JSON.parse(report)
            
            if (!report.coverageUnit || !report.rawReport) throw ""
        } catch (e) {
            print([
                "Previous raw coverage report is not a valid JSON or has wrong format"
            ].join('\n'));
            
            quit(6)
        }
        
        previousCoverageReport  = report
    }
    
    return {
        enableCodeCoverage          : enableCodeCoverage,
        coverageUnit                : coverageUnit,
        previousCoverageReport      : previousCoverageReport,
        coverageReportFormats       : coverageReportFormats,
        coverageReportDir           : coverageReportDir
    }
}

//============================================================================================================
// running a test suite in a single browser (webdriver instance)

// browserInterface should have the following methods:
// - open(url, callback)
// - executeScript(scriptText)
// - setWindowSize(width, height)
// - debug(text)
// - print(text)
// - close()
// - sleep(timeout, callback)
// - saveReport(string)
// - saveHtmlCoverageReport(dir, content), saveRawCoverageReport(dir, content), saveLcovCoverageReport(dir, content)

// - browserName property


var pollStep = function (iface, data) {
    var pageState       = JSON.parse(iface.executeScript("return Siesta.my.activeHarness.getPageState()"))
    
    var newActivity     = pageState.lastActivity
    
    if (!data.lastActivityToken) {
        data.lastActivityToken      = newActivity
        data.timeOfLastActivity     = new Date()
    }

    var result  = {
        exitCode        : pageState.exitCode
    }
    
    if (newActivity == data.lastActivityToken) {
        
        if (new Date() - data.timeOfLastActivity > 3 * 60 * 1000) {
            result.exitCode         = 2
        }
        
    } else {
        data.lastActivityToken      = newActivity
        data.timeOfLastActivity     = new Date()
    }
    
    var log = pageState.log
    
    if (log != '__NULL__') result.log = log
    
    return result
}


var pollPage = function (iface, sync, callback, pollData) {
    pollData            = pollData || {}
    
    do {
        var pollResult      = pollStep(iface, pollData)
        
        if (pollResult.hasOwnProperty('log')) iface.print(pollResult.log)
        
        if (pollResult.exitCode != null)
            iface.sleep(1000, function () {
                callback(pollResult.exitCode)
            })
        else {
            iface.sleep(1000, function () {
                if (!sync) pollPage(iface, sync, callback, pollData)
            })
        }
    } while (pollResult.exitCode == null && sync)
}


var runPage = function (iface, params, callback) {
    var currentPage         = params.currentPage
    var enableCodeCoverage  = params.enableCodeCoverage
    var shared              = params.shared
    
    iface.setWindowSize(params.viewportWidth, params.viewportHeight);
    
    iface.debug("Opening harness page: " + params.url)
    
    iface.open(params.url, function () {
        iface.debug("Page opened successfully: " + params.url)
        
        var pageCount       = Number(iface.executeScript("return Siesta.my.activeHarness.pageCount"))
        
        iface.debug("Page count: " + pageCount + ", curent page: " + currentPage)
        
        if (enableCodeCoverage && shared.contentManagerState) {
            iface.executeScript('__CONTENT_MANAGER_STATE__ = ' + JSON.stringify(shared.contentManagerState))
        }
        
        pollPage(iface, params.sync, function (exitCode) {
            iface.debug("Page completed with exit code: " + exitCode)
            
            if (exitCode == 2) iface.print("TIMEOUT: 3 minutes of inactivity")
            
            var result                      = {
                exitCode        : exitCode,
                pageCount       : pageCount
            }
            
            // nothing to do
            if (pageCount == 0) {
                iface.close()
                callback(result)
                return
            }
            
            var isLastPage                  = currentPage == pageCount - 1
            
            result.pageReport               = JSON.parse(iface.executeScript('return Siesta.my.activeHarness.generateUnifiedPageReport()'))
            
            if (enableCodeCoverage) {
                // for last page we don't need to update the content manager state (since it won't be used anywhere)
                if (!isLastPage)
                    // update the content manager state after every page, because it may change across several tests
                    // if they use ExtJS loader hook
                    shared.contentManagerState  = JSON.parse(iface.executeScript('return Siesta.my.activeHarness.getContentManagerState(true)'))
                
                // also get coverage report for the current page
                shared.coverageInfo         = JSON.parse(iface.executeScript(
                    'return Siesta.my.activeHarness.getRawTotalCoverageInfo(true,' + JSON.stringify(shared.coverageInfo) + ')'
                ))
            }
            
            // is last page 
            if (isLastPage) {
                // for last page only call the callback, closing iface for the last page is responsibility of the "runBrowser"
                // since it needs to run the report generation scripts
                callback(result)
            } else {
                iface.debug("Closing non-last page")
                iface.close()
                
                iface.sleep(params.pagePause || 3000, function () {
                    callback(result)
                })
            }
        })
    })
}


var runBrowser = function (iface, params, callback) {
    iface.debug("Started browser session: " + iface.browserName)
    
    var pageReports     = []
    
    var currentPage     = 0
    var pageCount       = null
    
    var reportOptions   = params.reportOptions
    var query           = params.query
    
    var exitCodeSum     = 0
    
    var previousCoverageReport  = params.previousCoverageReport
    
    var shared          = previousCoverageReport ? {
        coverageInfo        : previousCoverageReport.rawReport,
        contentManagerState : previousCoverageReport.contentManagerState
    } : {}
    
    var doPage = function () {
        query.page      = currentPage
        
        runPage(
            iface, 
            {
                url                 : constructURL(params.harnessURL, query),
                
                viewportWidth       : params.viewportWidth,
                viewportHeight      : params.viewportHeight,
                
                currentPage         : currentPage,
                
                sync                : params.sync,
                pagePause           : params.pagePause,
                
                enableCodeCoverage  : params.enableCodeCoverage,
                
                shared              : shared
            }, 
            function (result) {
                if (!currentPage) pageCount = result.pageCount
                
                exitCodeSum += result.exitCode
                
                // no tests to run
                if (!pageCount) {
                    callback && callback()
                    
                    return
                }
                
                var isLastPage      = currentPage == pageCount - 1

                pageReports.push(result.pageReport)
                
                if (isLastPage) {
                    if (result.summaryMessage)
                        // PHANTOMJS
                        iface.print(result.summaryMessage)
                    else {
                        // WEBDRIVER
                        // we split the call to `getAutomatedSummaryMessage` to 2 calls
                        // in 1st the just set the __PAGE_REPORTS__ global
                        // in 2nd we'll do actual call to `getAutomatedSummaryMessage`
                        // reason is, the Firefox, starting from v23, 24 started crashing sporadically
                        // if JSON is provided as the argument
                        iface.executeScript('__PAGE_REPORTS__ = ' + JSON.stringify(pageReports))
                        
                        iface.print(String(iface.executeScript('return Siesta.my.activeHarness.getAutomatedSummaryMessage()')))
                    }
                    
                    if (reportOptions) {
                        if (result.combinedReport)
                            // PHANTOMJS
                            iface.saveReport(result.combinedReport)
                        else {
                            // WEBDRIVER
                            reportOptions.pageReports    = pageReports
                            
                            // we split the call to `getAutomatedSummaryMessage` to 2 calls
                            // in 1st the just set the __PAGE_REPORTS__ global
                            // in 2nd we'll do actual call to `getAutomatedSummaryMessage`
                            // reason is, the Firefox, starting from v23, 24 started crashing sporadically
                            // if JSON is provided as the argument
                            iface.executeScript('__REPORT_OPTIONS__ = ' + JSON.stringify(reportOptions))
                            
                            iface.saveReport(String(iface.executeScript('return Siesta.my.activeHarness.generateReport()')))
                        }
                    }
                    
                    if (params.enableCodeCoverage) {
                        var reportDir   = params.coverageReportDir
                        
                        params.coverageReportFormats.forEach(function (format) {
                            switch (format) {
                                case 'html' : 
                                    //                                          PHANTOMJS            WebDriver
                                    iface.saveHtmlCoverageReport(reportDir, result.htmlReport || JSON.parse(iface.executeScript(
                                        'return Siesta.my.activeHarness.generateCoverageHtmlReport(true)'
                                    )))
                                    break;
                                case 'lcov' : 
                                    iface.saveLcovCoverageReport(reportDir, result.lcovReport || JSON.parse(iface.executeScript(
                                        'return Siesta.my.activeHarness.generateCoverageLcovReport(true)'
                                    )))
                                    break;
                                case 'raw' : 
                                    iface.saveRawCoverageReport(reportDir, result.rawReport || JSON.parse(iface.executeScript(
                                        'return Siesta.my.activeHarness.generateCoverageRawReport(true)'
                                    )))
                                    break;
                            }
                        })
                    }
                    
                    iface.debug("Closing last page")
                    iface.close()
                    
                    callback && callback(exitCodeSum)
                } else {
                    currentPage++
                    
                    if (!params.sync) doPage()
                }
            }
        )
    }
    
    doPage()
    
    if (params.sync) for (var i = 2; i <= pageCount; i++) doPage()
}

