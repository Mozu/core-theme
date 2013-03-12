/**
 * @class Taco.model.ThemeListing
 */


Ext.define('Taco.model.ThemeListing', {
    extend: 'Taco.core.data.Model',
    idProperty:'id',
    fields: [{
        name: 'name',
        type: 'string',
        isHidden: true
    },
        {
            name: 'id',
            type: 'string',
            isHidden: true
        }, {
        name: 'author',
        type: 'string',
        isHidden: true,
        persist: false // *** This field is immutable
    }, {
        name: 'isSelectedDesktop',
        type: 'boolean',
        isHidden: true
    }, {
        name: 'isSelectedMobile',
        type: 'boolean',
        isHidden: true
    }, {
        name:'thumbnail',
        type:'string',
        persist: false // *** No need to send Base64 string back to server
    }, {
        name: 'isDesktop',
        type: 'boolean',
        persist: false // *** This field is immutable
    }, {
        name: 'isMobile',
        type: 'boolean',
        persist: false // *** This field is immutable
    }],
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/testing/theme/list',
            update: '/admin/app/testing/theme/update'
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