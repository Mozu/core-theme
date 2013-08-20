Ext.define('Taco.view.product.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.product.Form',
        'Ext.button.Button'
    ],
    
    formCls: 'Taco.view.product.Form',

    initComponent: function () {
        var me = this;

        this.additionalActions = [{
            xtype: 'button',
            itemId: 'moreButton',
            ui: 'action',
            scale: 'medium',
            text: 'More',
            menuAlign: 'tr-br?',
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
        
        this.formCfg = Ext.apply(this.formCfg || {}, { options: this.options });

        this.callParent(arguments);
    },

    preview: function (pis) {
        window.open('/_gosite/' + pis.getId() + '?environment=preview&redir=' + encodeURIComponent('/product/' + this.record.getId()), 'taco-preview');
    }
});