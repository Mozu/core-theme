/*

Siesta 1.1.8
Copyright(c) 2009-2013 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Siesta.Test.Browser.meta.extend({

    override : {
        
        /**
         * **This feature is available only in Standard package**.
         * 
         * Only useful along with {@link Siesta.Harness.Browser.separateContext separateContext} option 
         * 
         * Wait for the page load to occur and runs the callback. The callback will receive a "window" object.
         * Should be used when you are doing a redirect / refresh of the test page:
         * 
         *      t.waitForPageLoad(function (window) {
         *          ...
         *      })
         * 
         * @method
         * @member Siesta.Test.Browser 
         */
        waitForPageLoad : function (callback, scope) {
            var me              = this
            var global          = this.global
            
            
            var onLoadHappened  = false
            
            var onLoadHandler   = function () {
                if (iframe.removeEventListener)
                    iframe.removeEventListener('load', onLoadHandler)
                else
                    iframe.detachEvent('onload', onLoadHandler)
                    
                onLoadHappened  = true
            }
            
            var iframe          = this.scopeProvider.iframe
            
            if (iframe.addEventListener)
                iframe.addEventListener('load', onLoadHandler, false)
            else
                iframe.attachEvent('onload', onLoadHandler)
                
            this.waitFor(
                function () { return onLoadHappened }, 
                function () {
                    var async       = me.beginAsync()    
                    
                    // allow the "dom ready" handlers to process first
                    me.setTimeout(function () {
                        me.endAsync(async)
                        
                        callback && me.processCallbackFromTest(callback, [ global ], scope || me)
                    }, 50)
                }
            )
        },
        
        
        /**
         * **This feature is available only in Standard package**.
         * 
         * This method will just call the `setTimeout` method from the scope of the test page.
         * 
         * Usually you don't need to use it - you can just call `setTimeout`, but if your test scripts resides in the
         * separate context, you need to use this method for `setTimeout` functionality. See documentation for {@link Siesta.Harness.Browser#separateContext separateContext}
         * option and <a href="#!/guide/testing_page_refresh">Testing with page refresh</a> guide.
         * 
         * @param {Function} func The function to call after specified `delay`
         * @param {Number} delay The time to wait (in ms) before calling the `func`
         * @return {Number} timeoutId The id of the timeout, can be passed to {@link #clearTimeout} to cancel the function execution.
         * 
         * @method
         * @member Siesta.Test.Browser 
         */
        setTimeout : function (func, delay) {
            var pageSetTimeout = this.global.setTimeout
            
            pageSetTimeout(func, delay)
        },
        
        
        /**
         * **This feature is available only in Standard package**.
         * 
         * This method will just call the `clearTimeout` method from the scope of the test page.
         * 
         * Usually you don't need to use it - you can just call `clearTimeout`, but if your test scripts resides in the
         * separate context, you need to use this method for `clearTimeout` functionality. See documentation for {@link Siesta.Harness.Browser#separateContext separateContext}
         * option and <a href="#!/guide/testing_page_refresh">Testing with page refresh</a> guide.
         * 
         * @param {Number} timeoutId The id of the timeout, recevied from the {@link #setTimeout} call
         * 
         * @method
         * @member Siesta.Test.Browser 
         */
        clearTimeout : function (id) {
            var pageClearTimeout = this.global.clearTimeout
            
            pageClearTimeout(id)
        }
    }
});
