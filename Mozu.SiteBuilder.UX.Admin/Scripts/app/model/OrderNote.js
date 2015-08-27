/**
 * @class Taco.model.OrderNote
 */
Ext.define('Taco.model.OrderNote', {
    extend: 'Taco.core.data.Model',
    statics: {
        userCache:{}
    },
    fields: [{
        "name": "id",
        "type": "string",
        "useNull": true
    }, {
        "name": "text",
        "type": "string",
        "useNull": true
    }, {
        "name": "createDate",
        "type": "date",
        "useNull": true,
        "dateFormat": "c",
        defaultValue:new Date(),
        "persist": false
    }, {
        "name": "createBy",
        "type": "string",
        defaultValue: Taco.user.id,
        "useNull": true
    }, {
        "name": "updateDate",
        "type": "date",
        "useNull": true,
        defaultValue: new Date(),
        "dateFormat": "c",
        "persist": false
    }, {
        "name": "updateBy",
        "type": "string",
        "useNull": true
    },
     {
         "name": "createByName",
         "type": "string",
         "useNull": true,
         "persist": false,
         convert: function location(v, record) {
             return record.getCreatorUserName(v, record);

         }
     }],
    getCreatorUserName: function (v, record) {
        var userStore, cache = this.statics().userCache, user = cache[record.data.createBy];
        if (v) {
            return v;
        }
        if (!user) {
            Ext.ModelManager.getModel('Taco.model.AdminUser').load(record.data.createBy, {
                success: function (user) {
                    cache[record.data.createBy] = user;
                    record.set('createByName', user.get('firstName') + ' ' + user.get('lastName'));
                }
            });
            return record.data.createBy;
        }
        else {
            return  user.get('firstName') + ' ' + user.get('lastName');
        
        }
    },
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/order/ordernote/list',
            create: '/admin/app/order/ordernote/create',
            update: '/admin/app/order/ordernote/edit',
            destroy: '/admin/app/order/ordernote/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        },
        writer: {
            allowSingle: true,
            type: 'json'
        }
    }
});