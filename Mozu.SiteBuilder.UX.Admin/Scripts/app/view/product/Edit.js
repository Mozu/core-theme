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

    initComponent: function() {
        var me = this,
            moreStore = Ext.create('Ext.data.Store', {
                fields: [
                    'text',
                    { name: 'fn', type: 'string' },
                    { name:'state', type:'auto', defaultValue:[]},
                    { name: 'isPreview', type: 'boolean' }
                ]
            });

        moreStore.add([
            { text: 'More', id: 0 },
            { text: 'Delete', id: 1, fn: 'destroyRecord' }
        ]);

        this.record.getProductInSites().each(function(pis) {
            var site = pis.get('site');
            moreStore.insert(1, { text: 'Preview In ' + site.name, id:  pis.id , fn: 'preview', state:[pis] });
        });


        this.additionalActions = [
            {
                xtype: 'selectfield',
                displayField: 'text',
                valueField: 'id',
                queryMode: 'local',
                style: { 'display': 'inline-table' },
                value: 0,
                store: moreStore,
                listeners: {
                    select: function(combo, records, eOpts) {
                        var fn = records[0].get('fn'), state = records[0].get('state');
                        if (fn) {
                            this[fn].apply(this, state);
                        }
                    },
                    scope: this
                }
            }
        ];
        this.formCfg = Ext.apply(this.formCfg || {}, { options: this.options });
        this.callParent(arguments);
    },

    preview: function(pis) {
        window.open('/_gosite/' + pis.getId() + '?redir=' + encodeURIComponent('/product/' + this.record.getId()), 'taco-preview');
    }
    
});