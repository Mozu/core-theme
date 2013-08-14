/**
 * @class Taco.view.product.Edit
 * @author Michael Speed Elder
 * Date: 1/21/13
 * Time: 3:02 PM
 *
 *
 */

Ext.define('Taco.view.product.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.product.Form'
    ],
    formCls: 'Taco.view.product.Form',

    initComponent: function () {
        var me = this;

        // this.moreStore = Ext.create('Ext.data.Store', {
        //         fields: [
        //             'text',
        //             { name: 'fn', type: 'string' },
        //             { name: 'state', type: 'auto', defaultValue:[] },
        //             { name: 'isPreview', type: 'boolean' }
        //         ]
        //     });

        // this.moreStore.add([
        //     { text: 'Preview In', id: 1},
        //     { text: 'Delete', id: 2, fn: 'destroyRecord' }
        // ]);

        // this.updateMoreStore();

        this.additionalActions = [{
            xtype: 'button',
            itemId: 'moreButton',
            text: 'More',
            frame: false,
            menu: {
                plain: true,
                shadow: false,
                items: [{
                    itemId: 'preview',
                    text: 'Preview in',
                    menu: {
                        plain: true,
                        shadow: false,
                        defaults: {
                            plain: true
                        },
                        items: []
                    }
                }, {
                    itemId: 'delete',
                    text: 'Delete',
                    handler: Ext.bind(me.destroyRecord, me)
                }],
                listeners: {
                    show: function (menu) {
                        var previewItem = menu.items.get('preview'),
                            previewSites = [];

                        if (previewItem && previewItem.menu) {
                            previewMenu = previewItem.menu;

                            Ext.each(me.record.getProductInSites().data.items,function (pis) {
                                var site = pis.get('site');

                                previewSites.push({
                                    itemId: site.id,
                                    text: site.name,
                                    handler: Ext.bind(me.preview, me, [pis])
                                });
                            });

                            if (!Ext.Array.equals(Ext.Array.pluck(previewSites, 'itemId'), previewMenu.items.keys)) {
                                previewMenu.removeAll();
                                previewMenu.add(previewSites);
                            }
                        }
                    },
                    scope: this
                }
            }
        }];

        // this.additionalActions = [{
        //     xtype: 'selectfield',
        //     displayField: 'text',
        //     valueField: 'id',
        //     queryMode: 'local',
        //     style: { 'display': 'inline-table' },
        //     value: 0,
        //     store: this.moreStore,
        //     listConfig : {
        //         itemTpl: '<tpl if="isPreview">&nbsp;&nbsp;</tpl>{text}',
        //         listeners: {
        //             beforeitemclick: function (boundList, record) {
        //                 var fn = record.get('fn'), state = record.get('state');
        //                 if (fn) {
        //                     return this[fn].apply(this, state);
        //                 } else {
        //                     return false;
        //                 }
        //             },
        //             scope: this
        //         }
        //     },
        //     displayTpl:'More'
        // }];
        
        this.formCfg = Ext.apply(this.formCfg || {}, { options: this.options });

        this.callParent(arguments);

        // this.mon(this.record.getProductInSites(), 'datachanged', this.updateMoreStore, this);
    },
    
    updateMoreStore: function () {
        var me = this;

        // this.moreStore.filterBy(function(record) {
        //     return record.get('isPreview') !== true;
        // });

        // Ext.each(me.record.getProductInSites().data.items,function (pis) {
        //     var site = pis.get('site');
        //     me.moreStore.insert(1, { text: '  '+  site.name, id: pis.id, fn: 'preview', state: [pis] , isPreview:true});
        // });
    },

    preview: function (pis) {
        window.open('/_gosite/' + pis.getId() + '?environment=preview&redir=' + encodeURIComponent('/product/' + this.record.getId()), 'taco-preview');
    }
});