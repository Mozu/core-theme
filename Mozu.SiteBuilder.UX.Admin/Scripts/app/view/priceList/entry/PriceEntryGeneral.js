/**
 * @class  Taco.view.priceList.entry.PriceEntryGeneral
 * @description Price List PriceEntryGeneral Form
 */
Ext.define('Taco.view.priceList.entry.PriceEntryGeneral', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-priceList-price-entry-general',
    requires: [
        'Ext.form.field.ComboBox',
        'Ext.form.field.Date',
        'Taco.core.ux.TooltipLabel',
        'Taco.core.util.Validation',
        'Taco.shared.view.field.ProductPickerField',
        'Taco.view.priceList.widget.PriceListComboBox',
        'Taco.core.ux.picker.CheckboxTreeModal'
    ],
    ui: 'subform',
    margin: '0 0 20 0',

    title: 'Product',
    record: null,

    initComponent: function() {
        var me = this,
            mc = Taco.app.context.getMasterCatalog(),
            defaultCurrency = mc.currencyCode;

        Ext.tip.QuickTipManager.init();

        var currencyData = Ext.Array.map(mc.getSupportedCurrencies(), function (currency) {
            return {
                id: currency,
                name: currency
            };
        });

        var currencyStore = Ext.create('Ext.data.Store', {
            fields: ['id','name'],
            data: currencyData,
            autoLoad: true
        });

        me.productPickerField = Ext.create('Taco.shared.view.field.ProductPickerField', {
            name: 'productCode',
            plugins: [
                'inputmask'
            ],
            width: '100%',
            allowBlank: false,
            flex: 1,
            style: 'padding:5px',
            fieldBodyCls: 'order-addproducttoolbar-cell',
            pageSize: me.productsPerPage,
            disabled: !me.record.phantom,
            value: !me.record.phantom ? me.record.get('productCode') : '',
            displayTpl: Ext.create('Ext.XTemplate',
                '<tpl if="values && values.productName"><span class="product-name">{productName}</span> <span class="product-code">{productCode}</span></tpl>'
            ),
            liveMode: true,
            defaultFilters: [ { property: 'iscurrentlyactive', value: true } ],
            getErrors: function() {
                return (!this.getValue()) ? ["This field is required"] : [];
            },
            listeners: {
                focus: {
                    fn: this.onFocus,
                    scope:me
                },
                blur: {
                    fn: this.onBlur,
                    scope:me
                },
                cleartriggerfocus: {
                    fn: this.onFocus,
                    scope: me
                },
                cleartriggerblur: {
                    fn: this.onBlur,
                    scope: me
                },
                // custom event added as part of the InputMask plugin; need to cancel the event to prevent the field from reseting itself since will be reseting all fields when this field is reset;
                'beforecleartriggerclick': function (field) {

                    // reset everything in the toolbar but need to be carefull
                    this.reset();

                    // cancel event to prevent the default behavior from completing;
                    return false;
                },
                'specialkey': {
                    fn: function (field, e) {
                        // if field doesnt have a flyout menu expanded and hits key up. pass focus to grid's last row;
                        if (!field.isExpanded && (e.getKey() == e.LEFT || e.getKey() == e.UP || (e.getKey() == e.TAB && e.shiftKey))) {

                            // this is a bug fix for Extjs 4.2.2 that isn't needed in the 4.2.3 nightly
                            field.triggerBlur();
                            field.blur();

                            // need to defer the execution for this because of a bug in Extjs 4.2.2; problem doesn't exist in Extjs 4.3 nightly
                            Ext.defer(function () {
                                this.fireEvent('gridfocus', field, e);
                            }, 1, this);
                        }
                    },
                    scope: me
                },
                'expand':{
                    fn: function (field, eOpts) {


                    },
                    scope:this
                },
                beforeselect: {
                    fn: this.onBeforeProductSelect,
                    scope: this
                }
            }
        });

        me.effectiveDate = Ext.widget({
            xtype: 'datetime',
            fieldLabel: 'Active Start Date',
            name: 'startDate',
            width: '50%',
            flex: 1,
            margin: '0 20 0 0',
            itemId: 'startDateFld',
            pickerOffset: 4,
            value: !this.record.phantom ? this.record.get('startDate') : '',
            readOnly: !this.record.phantom,
            allowBlank: true,
            validateOnBlank: true
        });

        me.expirationDate = Ext.widget({
            xtype: 'datetime',
            fieldLabel: 'Active End Date',
            name: 'endDate',
            itemId: 'endDateFld',
            width: '50%',
            flex: 1,
            pickerOffset: 4,
            value: this.record ? this.record.get('endDate') : '',
            allowBlank: true,
            validateOnBlank: true
        });

        // product picker
        // currency
        //  start date
        //  end date

        //   vbox
        //     vbox
        //        productPicker
        //     hbox
        //       vbox
        //         currency code
        //       hbox
        //          start date
        //          end date

        this.items = [{
            xtype: 'panel',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                //row 1
                {
                    xtype: 'panel',
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [
                        me.productPickerField
                    ]
                },
                //row 2
                {
                    xtype: 'panel',
                    width: '100%',
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'panel',
                            layout: {
                                type: 'vbox',
                                align: 'top'
                            },
                            width: '50%',
                            items: [
                                {
                                    xtype: 'combobox',
                                    name: 'currencyCode',
                                    fieldLabel: 'Currency Code',
                                    width: '100%',
                                    margin: '0 30 0 0',
                                    valueField: 'id',
                                    displayField: 'name',
                                    readOnly: !me.record.phantom,
                                    queryMode: 'local',
                                    valueNotFoundText: 'not found',
                                    editable: false,
                                    forceSelection: true,
                                    value: !me.record.phantom ? me.record.get('currencyCode') : defaultCurrency,
                                    defaultValue: !me.record.phantom ? me.record.get('currencyCode') : defaultCurrency,
                                    store: currencyStore,
                                    listeners: {
                                        afterrender: function () {
                                            if (!this.getValue()) {
                                                this.setValue(this.defaultValue);
                                            }
                                        },
                                        change: function() {
                                            //todo: fire event for change currency so price form can listen.
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            xtype: 'panel',
                            layout: {
                                type: 'hbox',
                                align: 'top'
                            },
                            width: '50%',
                            items: [
                                me.effectiveDate,
                                me.expirationDate
                            ]
                        }
                    ]
                }
            ]
        }];
        me.mon(Taco.app, 'price-entry-loaded', me.onPriceEntryLoaded, me);
        this.callParent(arguments);
    },

    onPriceEntryLoaded: function (record) {
        this.productPickerField.setValue(record.get('productCode'));
        this.productPickerField.inputMask.show(record.get('productName'));
    },

    ///**
    // * Opens a modal with a TreePanel.
    // * @private
    // */
    //launchSiteModal: function(list) {
    //    var catalogChildren = Ext.Array.map(Taco.app.context.getMasterCatalog().catalogs, function (cat) {
    //        var siteChildren = Ext.Array.map(cat.sites, function (site) {
    //            return {
    //                id: site.id,
    //                name: site.name,
    //                parentId: cat.id,
    //                type: 'site',
    //                expanded: true,
    //                loaded: true,
    //                leaf: 'true'
    //            };
    //        });
    //        return {
    //            id: cat.id,
    //            name: cat.name,
    //            type: 'catalog',
    //            expanded: true,
    //            loaded: true,
    //            children: siteChildren
    //        };
    //    }),
    //
    //    siteTreeStore = Ext.create('Ext.data.TreeStore', {
    //        root: {
    //            expanded: true,
    //            children: catalogChildren
    //        }
    //    });
    //
    //    this.modal = Ext.widget('checkbox-tree-modal', {
    //        title: 'Select Sites',
    //        displayField: 'name',
    //        store: siteTreeStore
    //    });
    //
    //    this.modal.on({
    //        savesuccess: function(modal, values) {
    //            list.addValue(values);
    //            list.store.reload();
    //            this.parentForm.getForm().checkValidity();
    //        },
    //        aftercancelclose: function() {
    //            list.store.reload();
    //        },
    //        scope: this
    //    });
    //},

    // after product is selected in the productPickerfield but before the combo is closed;
    onBeforeProductSelect: function (combo, record, index, e) {
        var me = this,
            productPickerField = combo,
            productCode = record.get('productCode'),
            isConfigurable = record.get('isConfigurable'),
            price,
            win,
            productCodeToAdd;
        combo.setValue(productCode);
        combo.collapse();
        combo.inputMask.show(record.get('productName'));
        // cancel the selection so that the same product can be reselected again;
        return false;
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