Ext.define('Taco.view.order.widget.ProductConfigurator', {
    extend: 'Ext.container.Container',

    cls: 'taco-product-configurator',

    requires: [
        'Taco.core.ux.form.SelectField'
    ],

    statics: {
        builds: {
            'List': function (option) {
                return {
                    xtype: 'selectfield',
                    data: [
                        [1, 'One'],
                        [2, 'Two'],
                        [3, 'Three']
                    ]
                };
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
            inputType = option.AttributeDetail.InputType;

        if (builds[inputType]) return builds[inputType](option);
    }
});