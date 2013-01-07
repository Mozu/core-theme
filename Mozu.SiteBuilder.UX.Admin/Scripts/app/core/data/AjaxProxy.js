/**
* @author Jason Cochran
* The Mozu Ajax Proxy is a subclass of {@link Ext.data.proxy.Ajax}, preconfigured for the most common Mozu settings, and enhanced with logging and caching.
* 
*/

    Ext.define('Taco.core.data.AjaxProxy', {
        extend: 'Ext.data.proxy.Ajax',
        alias: 'proxy.ajaxproxy',
        constructor: function (config) {
            
            var me = this;
            this.callParent([config]);
            me.on('exception', function() {
                console.log('ajaxproxy-exception', arguments);
            }, me);
         
        },
        actionMethods: {
            create: 'POST',
            read: 'GET',
            update: 'POST',
            destroy: 'POST',
            duplicate: 'POST'
        },
        afterRequest: function ( request, success ){
            var me = this;
            this.callParent(request, success);
            if (success && request && request.action != 'read' && this.model && this.model.$className) {
                this.signalCacheFlush();
            }
            
        },
        duplicate: function() {
            return this.doRequest.apply(this, arguments);
        },
        /**
         * Flushes the global application signal cache.
         */
        signalCacheFlush: function () {
            Taco.app.signalCacheFlush({ model: this.model.$className });
        },
        encodeFilters: function (filters) {
            var min = [],
                length = filters.length,
                i = 0;

            for (; i < length; i++) {
                min[i] = {
                    property: filters[i].property,
                    value: filters[i].value
                };
                if (filters[i].comparison) {
                    min[i].comparison = filters[i].comparison;
                }
            }
            return this.applyEncoding(min);
        },

        
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: 'message'

        }

    }
    //,
    //function () {
    //    Ext.apply(this.prototype, {
    //        actionMethods: {
    //            create: 'POST',
    //            read: 'GET',
    //            update: 'POST',
    //            destroy: 'POST',
    //            duplicate: 'POST'
    //        },

    //        duplicate: function() {
    //            return this.doRequest.apply(this, arguments);
    //        }
    //    });
    //}
   );
