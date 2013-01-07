/*

Siesta 1.1.5
Copyright(c) 2009-2012 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Role('Siesta.Harness.Browser.Automation', {
    
    does        : [
        Siesta.Role.ConsoleReporter
    ],
    
    has : {
        // a regex to test the url (can be provided by automation launchers) only matched tests will be run
        testFilter          : null,
        
        testPage            : null,
        testPageSize        : 5,
        
        pageCount           : null,
        
        outputLog           : '__NULL__',
        
        lastActivity        : null,
        exitCode            : null,
        
        launchedDesc        : null
    },
    
    
    override : {
        
        setup : function () {
            if (this.isAutomated) {
                this.speedRun           = true
                this.runCore            = 'sequential'
                this.transparentEx      = false
                this.keepResults        = false
                this.keepNLastResults   = 0
                this.needUI             = false
                this.needSummaryMessage = false
                
                this.waitForTimeout     = this.waitForTimeout * 3
                this.defaultTimeout     = this.defaultTimeout * 3
                
                var filter              = this.getQueryParam('filter')
                
                if (filter) this.testFilter = decodeURIComponent(filter)
                
    
                var page                = this.getQueryParam('page')
                
                if (page) this.testPage = Number(page)
    
                
                if (this.getQueryParam('verbose')) this.verbosity++
                
                var pause               = this.getQueryParam('pause')
                
                this.pauseBetweenTests  = pause != null ? pause : 3000
                
                this.lastActivity       = new Date()
            }
            
            this.SUPERARG(arguments)
        },
        
        
        launch : function (descriptors, callback, errback) {
            var testFilter  = this.testFilter
            var filtered    = []
            
            if (testFilter) {
                testFilter      = new RegExp(testFilter)
                
                Joose.A.each(this.flattenDescriptors(descriptors), function (desc) {
                    if (testFilter.test(desc.url)) filtered.push(desc)
                })
            } else
                filtered    = this.flattenDescriptors(descriptors)
                
            var testPageSize    = this.testPageSize
            var testPage        = this.testPage
                
            if (testPage != null) {
                this.pageCount      = Math.ceil(filtered.length / testPageSize)
                filtered            = filtered.slice(testPage * testPageSize, (testPage + 1) * testPageSize)
            }
            
            if (this.isAutomated && !filtered.length) {
                this.warn("Filter regexp doesn't match any test URL - exiting")
                this.exit(4)
                
                return
            }
            
            this.SUPER(this.launchedDesc = filtered, callback, errback)
        }
    },
    
    
    after : {
        
        onTestUpdate : function () {
            if (this.isAutomated) this.lastActivity = new Date()
        }
    },
    
    
    methods : {
        
        getPageState : function () {
            var res = JSON.stringify({
                lastActivity        : this.lastActivity - 0,
                log                 : this.flushLog(),
                exitCode            : this.exitCode
            })
            
            return res
        },
        
        
        allPagesPassed : function (pageReports) {
            var allPassed       = true
            
            Joose.A.each(pageReports, function (pageReport) {
                if (!pageReport.passed) {
                    allPassed = false
                    return false
                }
            })
            
            return allPassed
        },
        
        
        flushLog : function () {
            var result  = this.outputLog.replace(/\n$/, '');
            
            this.outputLog = '__NULL__'
            
            return result
        },
        
        
        getLastActivity : function () {
            return this.lastActivity - 0
        },
        
        
        log : function () {
            if (this.isAutomated) {
                var str     = Array.prototype.slice.call(arguments).join(' ') + '\n'
                
                if (this.outputLog == '__NULL__')
                    this.outputLog = str
                else
                    this.outputLog += str 
            }
        },
        
        
        exit : function (code) {
            if (this.isAutomated) this.exitCode = code || 0
        },
        
        
        generateUnifiedPageReport : function (params) {
            params          = params || {}
            var me          = this
            
            var report = {
                testSuiteName       : this.title || '',
                
                startDate           : this.startDate - 0,
                endDate             : (this.endDate || new Date()) - 0,
                
                passed              : this.allPassed(),
                
                testCases           : []
            }
            
            Joose.A.each(this.flattenDescriptors(params.descriptors || this.launchedDesc || this.descriptors), function (descriptor) {
                var test    = me.getTestByURL(descriptor.url)
                
                // ignore missing tests (could be skipped by test filtering)
                if (!test) return
                
                var testReport  = {}
                
                if (descriptor.isMissing) 
                    testReport.fileIsMissing  = true
                else {
                    Joose.O.extend(testReport, {
                        url             : test.url,
                        
                        startDate       : test.startDate - 0,
                        endDate         : test.endDate - 0,
                        
                        passed          : test.isPassed()
                    })
                    
                    if (test.isFailedWithException()) {
                        testReport.exception        = test.failedException + ''
                        testReport.exceptionType    = me.typeOf(test.failedException)
                    }
                    
                    var assertions      = testReport.assertions = []
                    
                    test.eachAssertion(function (assertion) {
                        
                        var assertionInfo   = {
                            passed      : assertion.passed,
                            description : assertion.description || 'No description'
                        }
                        
                        if (assertion.isTodo)       assertionInfo.isTodo        = true
                        if (assertion.annotation)   assertionInfo.annotation    = assertion.annotation
                        
                        assertions.push(assertionInfo)
                    })
                }
                
                report.testCases.push(testReport)
            })
            
            return params.asJSON ? report : JSON.stringify(report)
        },
        
        
        combinePageReports : function (pageReports) {
            if (!pageReports || !pageReports.length) throw "No pages to combine"
            
            var combinedReport
            
            Joose.A.each(pageReports, function (pageReport, index) {
                // first page
                if (!index) {
                    combinedReport              = Joose.O.copy(pageReport)
                    
                    combinedReport.testCases    = combinedReport.testCases.slice()
                } else
                    combinedReport.testCases.push.apply(combinedReport.testCases, pageReport.testCases)
                    
                if (index == pageReports.length - 1)
                    combinedReport.endDate      = pageReport.endDate
            })
            
            combinedReport.passed   = this.allPagesPassed(pageReports)
            
            return combinedReport
        }
    }
})
//eof Siesta.Harness.Browser.Automation


Siesta.Harness.Browser.my.meta.extend({
    does : [ 
        Siesta.Harness.Browser.Automation,
        Siesta.Harness.Browser.Automation.PhantomJS, 
        Siesta.Harness.Browser.Automation.Selenium 
    ] 
})


Siesta.Harness.meta.extend({
    does : [ 
        Siesta.Harness.Report.JSON,
        Siesta.Harness.Report.JUnit
    ] 
})