/*

Siesta 1.1.5
Copyright(c) 2009-2012 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Role('Siesta.Harness.Browser.Automation.PhantomJS', {
    
    requires    : [ 'getQueryParam' ],
    
    has : {
        isPhantomJS             : false
    },
    
    
    override : {
        
        start : function () {
            if (this.getQueryParam('phantom') != null) {
                this.isAutomated        = true
                this.isPhantomJS        = true
            }
            
            this.SUPERARG(arguments)
        },
        
        
        launch : function () {
            this.SUPERARG(arguments)
            
            if (this.isPhantomJS) console.log('__PHANTOMJS__:pageCount:' + this.pageCount)
        }
    },
    
    
    after : {
        
        onTestUpdate : function (test, result) {
            if (this.isPhantomJS) console.log('__PHANTOMJS__:keepAlive')
        },
        
        
        log : function () {
            if (this.isPhantomJS) console.log('__PHANTOMJS__:log:' + Array.prototype.slice.call(arguments).join(' '))
        },
        
        
        exit : function (code) {
            code = code || 0
            
            if (this.isPhantomJS) {
                var pageReport      = this.generateUnifiedPageReport({ asJSON : true })
                
                console.log('__PHANTOMJS__:pageReport:' + JSON.stringify(pageReport))
                
                if (this.testPage == this.pageCount - 1) {
                    __PAGE_REPORTS__.push(pageReport)
                    
                    var allReports      = __PAGE_REPORTS__
                    
                    console.log('__PHANTOMJS__:summaryMessage:' + this.getSummaryMessage(this.allPagesPassed(allReports)))
                    
                    if (__REPORT_OPTIONS__) {
                        __REPORT_OPTIONS__.pageReports      = allReports
                        
                        console.log('__PHANTOMJS__:combinedReport:' + this.generateReport(__REPORT_OPTIONS__))
                    }
                }
                
                console.log('__PHANTOMJS__:exit:' + code)
            }
        }
    }
})

