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
     * lets know if 
     */
    wasHandled:function (exc) {
        if (!Ext.isArray(exc)) exc = [exc];
        var ret = false;
        Ext.Array.each(exc, function (item) {
            if (item && item.error && item.error.remoteException) {
                if (item.error.remoteException.wasHandled) {
                    ret = true;
                }
            }
        });
        return ret;
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
    },

    /**
     * Handles data store sync failure and fires error setmessage event if
     * exception wasn't already handled.
     * @param {Object} from service with exceptions list.
     */
    handleSyncFailure: function (m) {
        var errText;
        if (m.exceptions && this.wasHandled(m.exceptions)) {
            return;
        }
        errText = (m.exceptions) 
            ? this.createHtmlList(m.exceptions)
            : "Unknown error.";
        Taco.app.fireEvent('setmessage', errText, 'error');
    },

    /**
     * Uses message from response to fire Error event.
     * @param {} resp 
     * @returns {} 
     */
    handleRemoteFailure: function (resp) {
        var json = Ext.decode(resp.responseText, true);
        Taco.app.fireEvent('setmessage', json.message, 'error');
    }

});
// Copyright (c) 2013 Volusion, Inc.