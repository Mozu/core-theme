/*

Siesta 1.1.5
Copyright(c) 2009-2012 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Siesta.Harness.Browser.my.meta.extend({
    
    has : {
        
        /**
         * @cfg {Boolean} separateContext When set to `true`, the test scripts (your *.t.js files) will be executed in separate context.
         * They will not be included on the test page itself. Thus such tests will survive any page redirects or refreshes 
         * (for example after form submit, etc).
         * 
         * Note, when using this option, all "preload" files will still be loaded into test page context, not in the test script context.
         * Setting this option to `true` will disable the `overrideSetTimeout` option for this test.
         * 
         * This option can also (and probably should only) be specified in the test file descriptor.
         * 
         * **This option is available only in Standard package**.
         * 
         * @member Siesta.Harness.Browser
         */
        separateContext             : false,
        
        testScopesByURL             : null
    },
    
    before : {
        
        start : function () {
            this.testScopesByURL = {}
        }
    },
        
    override : {
        
        // in case of "separateContext" we don't need to run any seeding script - the test script will ran in different context
        prepareScopeSeeding : function (scopeProvider, desc, contentManager) {
            if (!this.getDescriptorConfig(desc, 'separateContext')) this.SUPERARG(arguments)
        },
        
        
        launchTest : function (options, callback) {
            var me                          = this
            var desc                        = options.desc
            var url                         = desc.url
            
            // 
            if (!this.getDescriptorConfig(desc, 'separateContext')) return this.SUPERARG(arguments)
            
            var testScriptScopeProvider     = this.testScopesByURL[ url ] = new Scope.Provider.IFrame({
                seedingCode     : this.getSeedingCode()
            })
            
            if (this.cachePreload && options.contentManager.hasContentOf(url))
                testScriptScopeProvider.addPreload({
                    type        : 'js', 
                    content     : options.contentManager.getContentOf(url)
                })
            else
                testScriptScopeProvider.seedingScript = this.resolveURL(url, options.scopeProvider, desc)
                
            var testHolder  = options.testHolder
            
            if (!this.getDescriptorConfig(desc, 'transparentEx')) testScriptScopeProvider.addOnErrorHandler(function (msg, url, lineNumber) {
                var test = testHolder.test
                
                test.nbrExceptions++;
                test.failWithException(msg + ' ' + url + ' ' + lineNumber)
            })
                
            var sup     = this.SUPER
            
            testScriptScopeProvider.setup(function () {
                var startTestAnchor     = testScriptScopeProvider.scope.StartTest
                
                options.startTestAnchor = startTestAnchor
                options.runFunc         = startTestAnchor && startTestAnchor.args && startTestAnchor.args[ 0 ]
                
                sup.call(me, options, callback)
            })
        },
        
        
        getNewTestConfiguration : function (desc, scopeProvider, contentManager, options, runFunc, startTestAnchor) {
            var config          = this.SUPERARG(arguments)
            
            if (this.getDescriptorConfig(desc, 'separateContext')) {
                // disable the overriding of `setTimeout` for scripts on separate page
                config.overrideSetTimeout   = false
                
                //                             a little bit hackish - will be set in the `launchTest`
                //                                      |
                //                                     \/
                var testScriptScopeProvider = this.testScopesByURL[ desc.url ]
                
                config.originalSetTimeout   = testScriptScopeProvider.scope.setTimeout
                config.originalClearTimeout = testScriptScopeProvider.scope.clearTimeout
            }
            
            return config
        },
        
        
        cleanupScopeForURL : function (url) {
            this.SUPER(url)
            
            var testScriptScopeProvider = this.testScopesByURL[ url ]
            
            if (testScriptScopeProvider) {
                delete this.testScopesByURL[ url ]
                
                testScriptScopeProvider.cleanup()
            }
        }
    }
})


