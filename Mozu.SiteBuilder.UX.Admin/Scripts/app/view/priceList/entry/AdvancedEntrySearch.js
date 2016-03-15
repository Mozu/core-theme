/**
 * @class Taco.view.priceList.entry.AdvancedEntrySearch
 */
Ext.define('Taco.view.priceList.entry.AdvancedEntrySearch', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Ext.form.field.ComboBox',
        'Taco.core.ux.form.field.AdminUser',
        'Ext.ux.form.field.BoxSelect',
        'Ext.form.FieldContainer',
        'Taco.core.ux.form.DateTime',
        'Taco.shared.view.field.ProductPickerField'
    ],

    productsPerPage: 25,

    defaults: {
        width: 500,
        xtype: 'textfield'
    },

    initComponent: function () {
        var me = this;

        me.productPickerField = Ext.create('Taco.shared.view.field.ProductPickerField', {
            name: 'productName',
            plugins: [
                'inputmask'
            ],
            width: '100%',
            flex: 10,
            style: 'padding:5px',
            fieldBodyCls: 'order-addproducttoolbar-cell',
            pageSize: me.productsPerPage,
            valueField: 'productCode',
            displayField: 'productName',
            displayTpl: Ext.create('Ext.XTemplate',
                '<tpl if="values && values.productName"><span class="product-name">{productName}</span> <span class="product-code">{productCode}</span></tpl>'
            ),
            liveMode: true,
            defaultFilters: [
                { property: 'iscurrentlyactive', value: true },
                { property: 'includeVariations', value: true }
            ],
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
                'beforecleartriggerclick': function () {


                    // reset everything in the toolbar but need to be carefull
                    this.setValue(null);
                    this.inputMask.reset();

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

        this.items = [
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
            {
                xtype: 'fieldcontainer',
                fieldLabel: 'Start Date Range',
                layout: {
                    type: 'hbox'
                },
                items: [{
                    xtype: 'datetime',
                    // allows the field to consume an iso format value;
                    altFormats: "c",
                    name: 'startDateFrom',
                    flex: 1
                }, {
                    xtype: 'component',
                    html: 'to',
                    margin: '7 10'
                }, {
                    xtype: 'datetime',
                    // allows the field to consume an iso format value;
                    altFormats: "c",
                    name: 'startDateTo',
                    flex: 1
                }]
            },
            {
                xtype: 'fieldcontainer',
                fieldLabel: 'End Date Range',
                layout: {
                    type: 'hbox'
                },
                items: [{
                    xtype: 'datetime',
                    // allows the field to consume an iso foramt value;
                    altFormats: "c",
                    name: 'endDateFrom',
                    flex: 1
                }, {
                    xtype: 'component',
                    html: 'to',
                    margin: '7 10'
                }, {
                    xtype: 'datetime',
                    // allows the field to consume an iso foramt value;
                    altFormats: "c",
                    name: 'endDateTo',
                    flex: 1
                }]
            },
            {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                width: '100%',
                items: [
                    me.createStaticCombobox('currencyCode', 'Currency',
                        Ext.Array.map(Taco.app.context.getMasterCatalog().getSupportedCurrencies(), function (currencyCode) {
                            return {
                                name: currencyCode,
                                id: currencyCode
                            };
                        }), 0)]
            },
            {
                xtype: 'taco-adminuserfield',
                name: 'modifiedBy',
                fieldLabel: 'Modified By',
                flex: 1,
                forceSelection: false
            },
            {
                xtype: 'fieldcontainer',
                fieldLabel: 'Modfied Range',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                items: [
                    {
                        xtype: 'datefield',
                        name: 'modifiedFrom',
                        altFormats: "c",
                        flex: 1
                    }, {
                        xtype: 'component',
                        html: 'to',
                        margin: '0 10'
                    }, {
                        xtype: 'datefield',
                        name: 'modifiedTo',
                        altFormats: "c",
                        flex: 1
                    }
                ]
            }
        ];

        this.callParent(arguments);
    },

    createStaticCombobox: function(name, label, data, marginRight) {
        return {
            xtype: 'combobox',
            name: name,
            fieldLabel: label,
            margin: { right: marginRight },
            width: '100%',
            valueField: 'id',
            displayField: 'name',
            queryMode: 'local',
            valueNotFoundText: 'not found',
            editable: false,
            forceSelection: true,
            trigger2Cls: 'x-form-clear-trigger',
            onTrigger2Click: function () {
                this.clearValue();
            },
            store: Ext.create('Ext.data.Store', {
                fields: ['id', 'name'],
                data: data
            })
        };
    },

    handleShow: function () {
        var val =this.productPickerField.getValue(),
            productStore,
            record;
        if (!val) {
            return;
        }
        productStore = this.productPickerField.getStore();
        record = productStore.findRecord('productCode', val);
        if (!record) {
            return;
        }
        this.productPickerField.inputMask.show(record.get('productName') + ' ' + record.get('productCode'));
        this.productPickerField.setValue(record);

    },

    // after product is selected in the productPickerfield but before the combo is closed;
    onBeforeProductSelect: function (combo, record) {
        combo.collapse();
        combo.inputMask.show(record.get('productName') + ' ' + record.get('productCode'));
        combo.setValue(record);
        // cancel the selection so that the same product can be reselected again;
        return false;
    }
});