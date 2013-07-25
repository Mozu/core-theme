Ext.define('Taco.model.ProductOptionValue', {
    extend: 'Ext.data.Model',


})

Ext.define('Taco.view.order.widget.ProductConfigurator', {
    extend: 'Taco.core.ux.form.Form',

    cls: 'taco-product-configurator',

    requires: [
        'Taco.core.ux.form.SelectField'
    ],

    statics: {
        updates: {
            'List': function (option, field) {
                store = Ext.create('Ext.data.Store', {
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
                    name: option.AttributeFQN,
                    optionInputType: 'List',
                    store: store,
                    value: option.Value,
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
                    name: option.AttributeFQN,
                    optionInputType: 'Date',
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
        this.imageContainer = Ext.widget({
            xtype: 'container',
            autoEl: {
                tag: 'ul',
                cls: 'images'
            },
            items: [{
                xtype: 'textfield',
                labelPosition: 'top',
                fieldLabel: 'Engravement...'
            }]
        });

        this.optionsContainer = Ext.widget({
            xtype: 'container',
            cls: 'options',
            items: [{
                xtype: 'textfield',
                labelPosition: 'top',
                fieldLabel: 'Engravement...'
            }]
        });

        this.description = Ext.widget({
            xtype: 'component'
        });

        this.price = Ext.widget({
            xtype: 'component',
            tpl: 'Price {salePrice:currency}'
        });

        this.quantity = Ext.widget({
            xtype: 'numberfield',
            labelPosition: 'top',
            fieldLabel: 'Quantity',
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

    isSavable: function () {
        return false;
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
                //console.log(arguments);
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

        window.p = this.record;
        window.d = this.runtimeData;

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
            },
            scope: this
        });
    }
});