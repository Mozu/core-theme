/*

Siesta 1.1.8
Copyright(c) 2009-2013 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Role('Siesta.Harness.Report.JUnit', {
    
    requires    : [ 
        'flattenDescriptors', 'allPassed' 
    ],
    
    
    methods : {
        
        convertDateToISO8601 : function (date) {
            var prependZeroIfNeeded = function (number, howMany) {
                if (!howMany || howMany == 1) return number < 10 ? '0' + number : number 
                
                return number < 10 ? '00' + number : number < 100 ? '0' + number : number
            }
            
            return date.getFullYear() + '-' + prependZeroIfNeeded(date.getMonth() + 1) + '-' + prependZeroIfNeeded(date.getDate()) + 
                'T' + prependZeroIfNeeded(date.getHours()) + ':' + prependZeroIfNeeded(date.getMinutes()) + ':' + prependZeroIfNeeded(date.getSeconds()) +
                '.' + prependZeroIfNeeded(date.getMilliseconds(), 2)
                
        },
        
        
        generateJUnitReport : function (options) {
            options                 = options || {}
            
            var unifiedReport       = this.combinePageReports(options.pageReports || this.generateUnifiedPageReport({ descriptors : this.descriptors, asJSON : true}))
            
            var me          = this
            
            var testSuiteNode   = new Siesta.Util.XMLNode({
                tag         : 'testsuite',
                
                attributes  : {
                    name        : this.title || 'No title',
                    timestamp   : this.convertDateToISO8601(this.startDate),
                    time        : ((this.endDate || new Date()) - this.startDate) / 1000,
                    //                                     Browser                                                                      NodeJS
                    hostname    : typeof window != 'undefined' && window.location && window.location.host || typeof require != 'undefined' && require('os') && require('os').hostname() || 'localhost'
                }
            })
            
            var properties  = options.properties
            
            if (properties) {
                var propertiesNode  = testSuiteNode.appendChild({
                    tag         : 'properties'
                })
                
                Joose.O.each(properties, function (value, name) {
                    propertiesNode.appendChild({
                        tag         : 'property',
                        
                        attributes  : {
                            name        : name,
                            value       : value
                        }
                    })
                })
            }
            
            var totalTests      = 0
            var totalErrors     = 0
            var totalFailures   = 0
            
            Joose.A.each(unifiedReport.testCases, function (testInfo) {
                totalTests++
                
                var testCaseNode    = new Siesta.Util.XMLNode({
                    tag             : 'testcase',
                    
                    attributes      : {
                        name        : testInfo.url,
                        classname   : me.getDescriptorConfig(me.getScriptDescriptor(testInfo.url), 'testClass').meta.name || 'Siesta.Test'
                    }
                })
                
                if (testInfo.fileIsMissing) {
                    totalErrors++
                    
                    testCaseNode.appendChild({
                        tag             : 'error',
                        textContent     : "Can't open test file: " + testInfo.url
                    })
                    
                } else {
                    testCaseNode.setAttribute('time', (testInfo.endDate - testInfo.startDate) / 1000)
                    
                    if (testInfo.hasOwnProperty('exception')) {
                        totalErrors++
                        
                        testCaseNode.appendChild({
                            tag             : 'error',
                            attributes      : {
                                type        : testInfo.exceptionType
                            },
                            textContent     : testInfo.exception
                        })
                    } else {
                        // test has failed, but w/o exception - some other reason
                        if (!testInfo.passed) totalFailures++
                    }
                        
                    Joose.A.each(testInfo.assertions, function (assertion) {
                        
                        if (!assertion.passed && !assertion.isTodo) testCaseNode.appendChild({
                            tag         : 'failure',
                            
                            attributes  : {
                                message     : assertion.description || '',
                                type        : assertion.name || 'FAIL'
                            },
                            
                            textContent : assertion.annotation || ''
                        })
                    })
                }
                
                testSuiteNode.appendChild(testCaseNode)
            })
            
            testSuiteNode.setAttribute('tests', totalTests)
            testSuiteNode.setAttribute('errors', totalErrors)
            testSuiteNode.setAttribute('failures', totalFailures)
            
            return testSuiteNode + ''
        }
    }
})
//eof Siesta.Harness.Report.JUnit


