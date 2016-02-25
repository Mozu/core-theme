/**
 * @class  Taco.view.priceList.form.Conditions
 * @description Price List Conditions Form
 */
Ext.define('Taco.view.priceList.form.Conditions', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-priceList-conditions',
    requires: [
        'Taco.core.util.Validation',
        'Taco.store.CustomerSegments',
        'Ext.ux.form.field.BoxSelect',
        'Ext.container.Container',
        'Taco.view.customers.segments.Modal'
    ],
    ui: 'subform',
    margin: '0 0 20 0',

    title: 'Customers',
    record: null,

    initComponent: function() {
        var me = this,
            segStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.CustomerSegments');

        this.segmentsList = Ext.create('Ext.ux.form.field.BoxSelect', {
                name: 'customerSegments',
                itemId: 'customer-segments-select',
                flex: 9,
                store: segStore,
                getStore: function () {
                    return segStore;
                },
                hideTrigger: true,
                triggerOnClick: false,
                forceSelection: true,
                disableKeyFilter: true,
                typeAhead: false,
                displayField: 'name',
                fieldLabel: 'Customer Segments',
                valueField: 'code',
                style: {
                    display: 'inline-table',
                    verticalAlign: 'bottom'
                }
                //tooltip: Ext.create('Taco.core.ux.content.Tooltip', {
                //    elementId: 'customer-segments-select',
                //    hoverTarget: 'label',
                //    messageKey: 'discount.conditions.customerSegments',
                //    arrowPosition: 'left',
                //    offsetLeft: -140
                //})
            }
        );

        this.segmentsBox = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            width: '100%',
            items: [
                this.segmentsList, {
                    xtype: 'button',
                    scale: 'medium',
                    ui: 'action',
                    text: 'Add',
                    margin: '0 0 0 10',
                    flex: 1,
                    maxWidth: 70,
                    //width: '20%',
                    style: {
                        verticalAlign: 'bottom'
                    },
                    handler: function () {
                        this.launchSegmentModal(this.segmentsList);
                    },
                    scope: this
                }
            ]
        });

        Ext.tip.QuickTipManager.init();

        // tree control?
        //   catalog
        //      sites
        //

        //   vbox
        //     hbox -
        //        1. vbox
        //          hbox
        //              1.name
        //              2.master cat
        //          hbox
        //              1.code
        //              2.status
        //        2. description field

        this.items = [{
            xtype: 'panel',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                this.segmentsBox
            ]
        }];

        this.callParent(arguments);
    },

    launchSegmentModal: function (list) {
        var gridStore = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.CustomerSegments',
            clearFilters: true,
            clearSort: true,
            autoLoad: true
        });

        this.modal = Ext.create('Taco.view.customers.segments.Modal', {
            store: gridStore,
            listeners: {
                savesuccess: function (modal, values) {
                    list.addValue(values);
                },
                scope: this
            }
        });
    },

    beforeSave: function () {
        Ext.Object.merge(this.record.data, this.form.getValues());
        return true;
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});