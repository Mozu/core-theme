/*

Siesta 1.1.8
Copyright(c) 2009-2013 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Role('Siesta.Harness.Report.JSON', {
    
    requires    : [ 
        'flattenDescriptors', 'allPassed' 
    ],
    
    
    methods : {
        
        generateJSONReport : function (params) {
            params                  = params || {}
            
            var unifiedReport       = this.combinePageReports(params.pageReports || this.generateUnifiedPageReport({ descriptors : this.descriptors, asJSON : true}))
            
            return params.asJSON ? unifiedReport : JSON.stringify(unifiedReport)
        }
    }
})
//eof Siesta.Harness.Report.JUnit


