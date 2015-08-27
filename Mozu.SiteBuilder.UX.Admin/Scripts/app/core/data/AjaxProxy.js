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
      
        duplicate: function() {
            return this.doRequest.apply(this, arguments);
        },
        
       
        

        
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: 'message'

        }

    }
   );
