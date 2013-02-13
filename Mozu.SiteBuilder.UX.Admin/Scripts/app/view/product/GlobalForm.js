/**
 * @class Taco.view.product.GlobalForm
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.GlobalForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.productglobalform',
    requires: [
        'Taco.view.product.subform.General',
        'Taco.view.product.subform.Inventory',
        'Taco.view.product.subform.Properties',
        'Taco.view.product.subform.Extras',
        'Taco.view.product.subform.Shipping'
    ],
    persistChangesToModel: true,
    mixins: {
        scrollspy: 'Taco.core.ux.ScrollSpy' // TODO: resolve JS error with this and getEl()
    },
    constructor: function () {
        this.callParent(arguments);
        this.mixins.scrollspy.constructor.call(this);
    },
    scrollSpyOffset: 150,
    title: 'Global',
    header: false,
    bodyCls: [Taco.baseCSSPrefix + 'product-admin-form', Taco.baseCSSPrefix + 'global-admin-form'],

    initComponent: function () {
        var subformCfg = {
            isGlobal: true,
            product: this.record,
            persistChangesToModel: true
        };

        this.items = [
            {
                xtype: 'combobox',
                fieldLabel: 'Status',
                labelAlign: 'top',
                allowBlank: false,
                forceSelection: true,
                store: ['Hide in website', 'Show on website'],
                value: 'Hide in website'
            },
            Ext.create('Taco.view.product.subform.General', subformCfg),
            Ext.create('Taco.view.product.subform.Inventory', subformCfg),
            Ext.create('Taco.view.product.subform.Properties', subformCfg),
            Ext.create('Taco.view.product.subform.Extras', subformCfg),
            Ext.create('Taco.view.product.subform.Shipping', subformCfg)
        ];

        this.callParent( arguments );
    },

    addSaveTasks: function (tasks) {
        if (this.isSingleSite) {
            return;
        }

        tasks.add([{
            key: 'save-product-record',
            saveRecord: this.record
        }]);

        return tasks;
    }
});