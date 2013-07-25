Ext.define('Taco.model.ProductOptionValue', {
    extend: 'Ext.data.Model'
})

Ext.define('Taco.view.order.widget.ProductConfigurator', {
    extend: 'Taco.core.ux.form.Form',
    layout: 'hbox',
    width: 800,
    //extend: 'Ext.panel.Panel',

    cls: 'taco-product-configurator',

    requires: [
        'Taco.core.ux.form.SelectField'
    ],

    statics: {
        updates: {
            'List': function (option, field) {
                var store = Ext.create('Ext.data.Store', {
                    fields: ['Value', 'StringValue', 'IsSelected', 'IsEnabled'],
                    data: option.Values
                });

                field.bindStore(store);
            }
        },


        builds: {
            'List': function (option) {
                var store,
                    selectedValue,
                    model;

                store = Ext.create('Ext.data.Store', {
                    fields: ['Value', 'StringValue', 'IsSelected', 'IsEnabled'],
                    data: option.Values
                });

                return {
                    xtype: 'selectfield',
                    fieldLabel: option.AttributeDetail.Name,
                    name: option.AttributeFQN,
                    optionInputType: 'List',
                    store: store,
                    value: option.Value,
                    allowBlank: !option.isRequired,
                    valueField: 'Value',
                    displayField: 'StringValue',
                    listConfig: {
                        tpl: [
                            '<ul class="taco-product-option-value-list">',
                                '<tpl for=".">',
                                    '<li role="option" class="x-boundlist-item<tpl if="!IsEnabled"> disabled</tpl>">',
                                        '~{StringValue}~',
                                    '</li>',
                                '</tpl>',
                            '</ul>'
                        ]
                    }
                };
            },

            'Date': function (option) {
                return {
                    xtype: 'datefield',
                    fieldLabel: option.AttributeDetail.Name,
                    name: option.AttributeFQN,
                    optionInputType: 'Date',
                    allowBlank: !option.isRequired,
                    value: option.Value
                };
            },

            'YesNo': function (option) {
                return {
                    xtype: 'checkbox',
                    fieldLabel: option.AttributeDetail.Name,
                    name: option.AttributeFQN,
                    optionInputType: 'YesNo',
                    allowBlank: !option.isRequired,
                    checked: !!option.Value
                };
            },

            'TextBox': function (option) {
                return {
                    xtype: 'textfield',
                    fieldLabel: option.AttributeDetail.Name,
                    name: option.AttributeFQN,
                    optionInputType: 'TextBox',
                    allowBlank: !option.isRequired,
                    value: option.Value
                };
            }
        },

        saves: {
            'Date': function (value) {
                if (!value) {
                    return value;
                }

                return Ext.Date.format(value, 'c');
            }
        }
    },

    initComponent: function () {
        this.addEvents([
            'savablestatechange'
        ]);

        this.imageContainer = Ext.widget({
            xtype: 'container',
            autoEl: {
                tag: 'ul',
                cls: 'images'
            }
        });

        this.optionsContainer = Ext.widget({
            xtype: 'container',
            cls: 'options'
        });

        this.description = Ext.widget({
            xtype: 'component'
        });

        this.price = Ext.widget({
            xtype: 'component',
            tpl: 'Price {SalePrice:currency}'
        });

        this.quantity = Ext.widget({
            xtype: 'numberfield',
            labelPosition: 'top',
            fieldLabel: 'Quantity',
            allowBlank: false,
            minValue: 1,
            allowDecimals: false,
            value: 1
        });

        this.items = [
            this.imageContainer, {
                xtype: 'container',
                items: [
                    this.description,
                    this.price,
                    this.optionsContainer,
                    this.quantity
                ]
            }
        ];

        this.loadProduct();

        this.callParent(arguments);
    },

    isDirty: function () {
        return true;
    },

    isValid: function () {
        return this.runtimeData && this.runtimeData.PurchasableState.IsPurchasable;
    },

    getData: function () {
        if (this.runtimeData) this.runtimeData.Quantity = this.quantity.getValue() || 1;
        return this.runtimeData;
    },

    loadProduct: function (record) {
        if (record) this.record = record;

        if (!this.record) {
            Taco.model.Product.load(this.productCode, {
                success: function (record) {
                    this.loadProduct(record);
                },
                scope: this
            });
            return;
        }

        this.record.loadRuntimeProduct({
            success: function (data) {
                this.loadRuntimeProduct(JSON.parse(data.responseText));
            },
            scope: this
        });

        this.description.update(this.record.get('productFullDescription'));

        this.buildImages();
    },

    loadRuntimeProduct: function (data) {
        if (data) this.runtimeData = data.items;
        console.log('RUNTIME DATA', this.runtimeData);
        this.buildOptions(this.runtimeData.Options);
    },

    buildImages: function () {
        var items = [];

        Ext.each(this.record.get('productImages'), function (image) {
            items.push({
                xtype: 'component',
                autoEl: 'li',
                style: {
                    backgroundImage: 'url(' + image.url + '?size=150)'
                }
            });
        }, this);

        this.imageContainer.removeAll();
        this.imageContainer.add(items);
    },

    buildOptions: function (options) {
        var items = [];

        Ext.each(options, function (option) {
            items.push(this.buildOption(option));
        }, this);

        this.optionsContainer.removeAll();
        this.optionsContainer.add(items);

        this.savableStateCheck();
        debugger;
        this.price.update(this.runtimeData.Price);
    },

    buildOption: function (option) {
        var builds = this.statics().builds,
            inputType = option.AttributeDetail.InputType,
            saves = this.statics().saves;


        if (!builds[inputType]) return;

        Ext.each(option.Values, function (value) {
            if (!value.StringValue) value.StringValue = value.Value;
            if (value.IsSelected) option.Value = value.Value;
        });

        return Ext.apply(builds[inputType](option), {
            listeners: {
                change: function (field, value) {
                    Ext.each(this.runtimeData.Options, function (option) {
                        if (option.AttributeFQN !== field.name) return;
                        option.Value = saves[inputType] ? saves[inputType](value) : value;
                        console.log('Change', inputType, option.Value, value);
                    });
                    this.postOptions();
                },
                scope: this
            }
        });
    },

    updateOption: function (option) {
        var field = this.findField(option.AttributeFQN),
            updates = this.statics().updates;

        if (!field) return;

        field.suspendCheckChange++;

        Ext.each(option.Values, function (value) {
            if (!value.StringValue) value.StringValue = value.Value;
            if (value.IsSelected) option.Value = value.Value;
        });

        if (updates[field.optionInputType]) updates[field.optionInputType](option, field);

        field.setValue(option.Value);

        field.suspendCheckChange--;
    },

    postOptions: function () {
        var request = { Options: [] };

        Ext.each(this.runtimeData.Options, function (option) {
            if (option.Value === undefined) return;

            delete option.Values;
            
            request.Options.push(option);
        });

        this.record.configureRuntimeProduct({
            jsonData: request,
            success: function (response) {
                this.runtimeData = JSON.parse(response.responseText).items;

                Ext.each(this.runtimeData.Options, function (option) {
                    this.updateOption(option);
                }, this);

                this.savableStateCheck();
            },
            scope: this
        });
    }
});