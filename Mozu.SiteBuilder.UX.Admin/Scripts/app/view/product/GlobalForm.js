/**
 * @class Taco.view.product.GlobalForm
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.GlobalForm', {
    //extend: 'Taco.core.ux.form.Form',
    extend: 'Taco.core.ux.form.NavForm2',
    alias: 'widget.productglobalform',
    requires: [
        'Taco.view.product.subform.General',
        'Taco.view.product.subform.Inventory',
        'Taco.view.product.subform.Properties',
        'Taco.view.product.subform.Extras',
        'Taco.view.product.subform.Shipping',
        'Taco.view.product.subform.SEO'
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

        this.navStore = Ext.create('Ext.data.Store', {
            fields: ['title']
        });

        this.callParent(arguments);

        this.buildForm();
    },

    buildForm: function () {
        var items = [],
            subFormCfg = {
                isGlobal: true,
                product: this.record,
                persistChangesToModel: true
            };

        items = [
            Ext.create('Taco.view.product.subform.General', subFormCfg)
        ];

        if (!this.isSingleSite) {
            Ext.Array.push(items, [
                Ext.create('Taco.view.product.subform.Inventory', subFormCfg),
                Ext.create('Taco.view.product.subform.Properties', subFormCfg),
                Ext.create('Taco.view.product.subform.Extras', subFormCfg)
            ]);
        }

        Ext.Array.push(items, [
            Ext.create('Taco.view.product.subform.Shipping', subFormCfg),
            Ext.create('Taco.view.product.subform.SEO', subFormCfg)
        ]);

        this.navStore.loadRawData(items);

        // if (this.rendered) {
        //     this.removeAll();
        //     this.add(items);   
        // } else {
        //     this.items = items;
        // }
        this.formContainer.removeAll();
        this.formContainer.add(items);
    },

    addSaveTasks: function (tasks) {
        if (this.isSingleSite) {
            return tasks;
        }

        tasks.add([{
            key: 'save-product-record',
            saveRecord: this.record
        }]);

        return tasks;
    }
});