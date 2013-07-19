/**
 * @class Taco.store.Navigation
 */
Ext.define('Taco.store.Navigation', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.NavigationItem',
    autoLoad: true,
    filters:[{
            filterFn: function (record) {
                var ret = true;
                if (record.raw.behaviorIds && record.raw.behaviorIds.length) {
                    Ext.each(record.raw.behaviorIds, function (behaviorId) {
                        if (Taco.User.behaviors.indexOf(behaviorId) == -1) {
                            ret = false;
                            return false;
                        }
                        return true;
                    });
                }
                return ret;
                
            }
        }
    ],
    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/Scripts/app/mocks/navigation.json'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        }
    }
});