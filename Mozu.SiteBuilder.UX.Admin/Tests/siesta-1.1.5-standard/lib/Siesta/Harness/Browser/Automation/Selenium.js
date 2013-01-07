/*

Siesta 1.1.5
Copyright(c) 2009-2012 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Role('Siesta.Harness.Browser.Automation.Selenium', {
    
    requires    : [ 'getQueryParam' ],
    
    has : {
        isSelenium              : false
    },
    
    override : {
        
        start : function () {
            if (this.getQueryParam('selenium') != null) {
                this.isAutomated        = true
                this.isSelenium         = true
                
                this.testPageSize       = 10
            }
            
            this.SUPERARG(arguments)
        }
    },
    
    
    before : {
        launch : function () {
            // show UI for selenium?
            if (this.isSelenium && typeof Ext != 'undefined') this.needUI = true
        }
    }
    
})
//eof Siesta.Harness.Browser.Automation


