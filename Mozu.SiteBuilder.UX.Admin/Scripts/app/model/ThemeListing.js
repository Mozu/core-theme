/**
 * @class Taco.model.ThemeListing
 */


Ext.define('Taco.model.ThemeListing', {
    extend: 'Taco.core.data.Model',
    idProperty:'id',
    fields: [
        {
            name: 'leaf',
            type: 'boolean',
            defaultValue: false
        }, {
            name: 'loaded',
            type: 'boolean',
            defaultValue: false
        }, {
            name: 'name',
            type: 'string',
        }, {
            name: 'version',
            type: 'string',
        }, {
            name: 'id',
            type: 'string',
        }, {
            name: 'installDate',
            type: 'date',
            dateFormat: 'c',
            nullable: true
        }, {
            name: 'author',
            type: 'string',
            isHidden: true
        }, {
            name: 'applied',
            convert: function(value, record) {
                return Ext.Array.filter(Ext.Array.map(['Desktop', 'Mobile', 'Tablet'], function(v) {
                    var c;
                    if (record.get('leaf')) {
                        return record.get('isSelected' + v) ? v : false;
                    }

                    if (record.raw && record.raw.items) {
                        c = Ext.Array.findBy(record.raw.items, function(r) {
                            return r['isSelected' + v];
                        });
                    }

                    if (c) {
                        return v + ' (' + c.version + ')';
                    }
                }), function(v) { return v; }).join(', ');
            }
        }, {
            name: 'isSelectedDesktop',
            type: 'boolean',
            persist: false // *** This field is immutable
        }, {
            name: 'isSelectedMobile',
            type: 'boolean',
            persist: false // *** This field is immutable
        }, {
            name: 'isSelectedTablet',
            type: 'boolean',
            persist: false // *** This field is immutable
        }
    ],

    applyTheme: function(cfg) {

        var options = Ext.apply({}, {
            method: 'POST',
            url: '/admin/app/themes/apply/' + this.getId() + '/' + cfg.apply, 
            params:  {
                id: this.getId(),
                apply: cfg.apply 
            },
            success: function (resp) {
                if (JSON.parse(resp.responseText).success) {
                    cfg.success.apply(cfg.scope || this, arguments);
                }
                else {
                    Taco.app.fireEvent('setmessage', 'Unable to apply Theme', 'error');
                }
            }
        }, cfg);
        
        Ext.Ajax.request(options);
    },

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/themes/list',
            update: '/admin/app/themes/update'
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    }
});