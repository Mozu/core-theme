/**
*  @class Taco.core.util.ExceptionWhiner
*  Whines about exceptions. Should eventually handle every type of exception that regular store operations throws, and munge them into human-readable litanies of abuse.
*  @singleton
*  @author james_zetlen
*/
Ext.define('Taco.core.util.ExceptionWhiner', {

    singleton: true,

    /**
     * Takes an array of any kind of exception and returns an HTML list.
     */
    createHtmlList: function (exc) {
        if (!Ext.isArray(exc)) exc = [exc];
        return this.tpls.htmlList.apply({ errors: Ext.Array.map(exc, this.convertExceptionToString, this) });
    },

    /**
     * Takes exceptions of various types and outputs their error messages as strings.
     * @param {Object/Ext.util.Operation} exception The exception to process.
     * @returns {string} The string message.
     */
    convertExceptionToString: function (exc) {
        // TODO: Obviously this only works for one kind of exception. It should work for more?
        return exc && exc.error && exc.error.remoteException && exc.error.remoteException.getMessage();
    },

    tpls: {
        htmlList: new Ext.XTemplate(
            '<ul class="' + Taco.baseCSSPrefix + '"errorlist">',
                '<tpl for="errors">',
                '<li>{.}</li>',
                '</tpl>',
            '</ul>'
        )
    }

});
// Copyright (c) 2013 Volusion, Inc.