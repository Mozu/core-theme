Ext.define('Taco.store.ProductHandlingFeeRules', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.HandlingFeeRule',
        remoteFilter: false,
        remoteSort: false,
        pageSize: 50,
        storeManagerConfig: {
            clearFilters: true,
            contextLevel: 's',
            clearSort: true,
            autoLoad: true,
            createOnly:true,
        },
        proxy: {
            type: 'ajax',
           
            api: {
                read: '/admin/app/shipping/HandlingRules/read',
                create: '/admin/app/shipping/HandlingRules/create',
                update: '/admin/app/shipping/HandlingRules/edit',
                destroy: '/admin/app/shipping/HandlingRules/delete'
            },
            extraParams: {
                applysTo: 'product'
            },
            

            reader: {
                type: 'json',
                root: 'items',
                successProperty: 'success',
                messageProperty: "message"
            },
            writer: {
                allowSingle: false,
                type: 'json'
            }
        }
       
       

    });
