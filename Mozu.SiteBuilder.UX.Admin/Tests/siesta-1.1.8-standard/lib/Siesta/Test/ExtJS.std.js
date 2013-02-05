/*

Siesta 1.1.8
Copyright(c) 2009-2013 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Siesta.Test.ExtJS.meta.extend({

    override : {
        
        /**
         * **This feature is available only in Standard package**.
         * 
         * The same as {@link Siesta.Test.Browser#waitForPageLoad}, but additionally passes the ExtJS object as the second argument
         * 
         *      t.waitForPageLoad(function (window, Ext) {
         *          ...
         *      })
         * 
         * @method
         * @member Siesta.Test.ExtJS
         */
        waitForPageLoad : function (callback, scope) {
            
            this.SUPER(function (window) {
                callback.call(this, window, window.Ext)
            }, scope || this)
        }
    }
});
