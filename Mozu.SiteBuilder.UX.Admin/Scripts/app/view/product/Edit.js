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
        var me = this;

        this.moreStore = Ext.create('Ext.data.Store', {
                fields: [
                    'text',
                    { name: 'fn', type: 'string' },
                    { name:'state', type:'auto', defaultValue:[]},
                    { name: 'isPreview', type: 'boolean' }
                ]
            });

        this.moreStore.add([
            { text: 'More', id: 0 },
            { text: 'Preview In', id: 1},
            { text: 'Delete', id: 2, fn: 'destroyRecord' }
        ]);


        this.updateMoreStore();

        this.mon(this.record.getProductInSites(), 'datachanged', this.updateMoreStore, this);

        this.additionalActions = [
            {
                xtype: 'selectfield',
                displayField: 'text',
                valueField: 'id',
                queryMode: 'local',
                style: { 'display': 'inline-table' },
                value: 0,
                store: this.moreStore,
                listConfig : {
                    itemTpl: '<tpl if="isPreview">&nbsp;&nbsp;</tpl>{text}'
                },
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
    
    updateMoreStore: function () {

        var me = this;
        this.moreStore.filterBy(function(record) {
            return record.get('isPreview') !== true;
        });
        Ext.each(me.record.getProductInSites().data.items,function (pis) {
            var site = pis.get('site');
            me.moreStore.insert(2, { text: '  '+  site.name, id: pis.id, fn: 'preview', state: [pis] , isPreview:true});
        });
    },

    preview: function(pis) {
        window.open('/_gosite/' + pis.getId() + '?redir=' + encodeURIComponent('/product/' + this.record.getId()), 'taco-preview');
    }
    
});