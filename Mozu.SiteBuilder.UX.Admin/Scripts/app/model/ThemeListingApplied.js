/**
 * @class Taco.model.ThemeListing
 */


Ext.define('Taco.model.ThemeListingApplied', {
    extend: 'Taco.core.data.Model',
    idProperty:'id',
    fields: [
        {
            name: 'leaf',
            type: 'boolean',
            persist: false,
            defaultValue: false
        }, {
            name: 'name',
            type: 'string',
            isHidden: true
        }, {
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
            name: 'isSelectedTablet',
            type: 'boolean',
            isHidden: true
        }, {
            name: 'isSelected',
            convert: function (value, record) {
                return record.get('isSelectedDesktop') || record.get('isSelectedMobile') || record.get('isSelectedTablet');
            }
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
        }, {
            name: 'isTablet',
            type: 'boolean',
            persist: false // *** This field is immutable
        }
    ],
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/themes/applied'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        }
    }
});