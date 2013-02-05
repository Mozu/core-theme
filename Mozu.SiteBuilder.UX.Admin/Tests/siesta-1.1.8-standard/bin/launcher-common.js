// Exit codes:
// 0 - all tests passed
// 1 - there were test failures
// 2 - inactivity timeout while running the test suite
// 3 - no supported browsers available on this machine
// 4 - no tests to run (probably filter doesn't match any test url)
// 5 - can't open harness page
// 6 - wrong arguments
// 7 - something was wrong (applicabale for selenium only)
// 8 - exit after printing version


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
    
    iface.setWindowSize(params.viewportWidth, params.viewportHeight);
    
    iface.debug("Opening harness page: " + params.url)
    
    iface.open(params.url, function () {
        
        iface.debug("Page opened successfully: " + params.url)
        
        var pageCount       = Number(iface.executeScript("return Siesta.my.activeHarness.pageCount"))
        
        pollPage(iface, params.sync, function (exitCode) {
            
            if (exitCode == 2) iface.print("TIMEOUT: 3 minutes of inactivity")
            
            var result      = {
                exitCode        : exitCode,
                pageCount       : pageCount
            }
            
            result.pageReport   = JSON.parse(iface.executeScript('return Siesta.my.activeHarness.generateUnifiedPageReport()'))
            
            // last page
            if (params.currentPage == pageCount - 1) {
                params.pageReports.push(result.pageReport)
                
                result.summaryMessage   = String(iface.executeScript('return Siesta.my.activeHarness.getSummaryMessage(Siesta.my.activeHarness.allPagesPassed(' + JSON.stringify(params.pageReports) + '))'))
                
                if (params.reportOptions) {
                    params.reportOptions.pageReports    = params.pageReports
                    
                    result.combinedReport   = String(iface.executeScript('return Siesta.my.activeHarness.generateReport(' + JSON.stringify(params.reportOptions) + ')'))
                }
            } 
            
            iface.close()
            
            callback && iface.sleep(params.pagePause || 3000, function () {
                callback(result)
            })
        })
    })
}


var runBrowser = function (iface, params, callback) {
    iface.debug("Started browser session: " + iface.browserName)
    
    var pageReports     = []
    var currentPage     = 0
    var pageCount       = null
    
    var query           = params.query
    
    var exitCodeSum     = 0
    
    var doPage = function () {
        query.page      = currentPage
        
        runPage(
            iface, 
            {
                url             : constructURL(params.harnessURL, query),
                viewportWidth   : params.viewportWidth,
                viewportHeight  : params.viewportHeight,
                currentPage     : currentPage, 
                pageReports     : pageReports,
                reportOptions   : params.reportOptions,
                sync            : params.sync,
                pagePause       : params.pagePause
            }, 
            function (result) {
                if (!currentPage) pageCount = result.pageCount
                
                exitCodeSum += result.exitCode
                
                // no tests to run
                if (!pageCount) {
                    callback && callback()
                    
                    return
                }
                
                if (currentPage == pageCount - 1) {
                    iface.print(result.summaryMessage)
                    if (params.reportOptions) iface.saveReport(result.combinedReport)
                    
                    callback && callback(exitCodeSum)
                } else {
                    pageReports.push(result.pageReport)
                    
                    currentPage++
                    
                    if (!params.sync) doPage()
                }
            }
        )
    }
    
    doPage()
    
    if (params.sync) for (var i = 2; i <= pageCount; i++) doPage()
}

