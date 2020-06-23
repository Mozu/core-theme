Ext.define('Taco.view.order.widget.ProductConfigurator', {
    extend: 'Taco.core.ux.form.Form',
    cls: 'taco-product-configurator',
    requires: [
        'Taco.core.ux.form.SelectField',
        'Taco.shared.store.Files'
    ],
    thumbnailSize: 150,
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
            'Default': function (option) {
                return {
                    fieldLabel: Ext.String.capitalize(option.AttributeDetail.Name),
                    anchor: '100%',
                    labelAlign: 'left',
                    name: option.AttributeFQN,
                    value: option.Value,
                    allowBlank: !option.IsRequired,
                    optionInputType: option.AttributeDetail.InputType
                }
            },

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
                    store: store,
                    valueField: 'Value',
                    displayField: 'StringValue',
                    listConfig: {
                        tpl: [
                            '<ul class="taco-product-option-value-list">',
                            '<tpl for=".">',
                            '<li role="option" class="x-boundlist-item<tpl if="!IsEnabled"> ' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.disabled + '</tpl>">',
                            '{StringValue}',
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
                    format: 'm/d/Y',
                    altFormats: 'c'
                };
            },

            'YesNo': function (option) {
                return {
                    xtype: 'checkbox',
                    checked: !!option.Value
                };
            },

            'TextBox': function (option) {
                return {
                    xtype: 'textfield'
                };
            },
            'TextArea': function (option) {
                return {
                    xtype: 'textareafield'
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
        var me = this;

        me.addEvents([
            'loadFailure'
        ]);

        me.on('loadFailure', me.onLoadFailure, me);
        me.on('boxready', function () {
            this.setLoading(true);
            // Turn off after model loaded.
        }, me);

        this.images = Ext.create('Taco.shared.store.Files');

        this.imagesView = Ext.widget({
            xtype: 'dataview',
            autoEl: {
                tag: 'ul',
                cls: 'images'
            },
            store: this.images,
            tpl: [
                '<tpl foreach=".">',
                '<li class="image-item" style="background-image:url(\'{url}?size=' + this.thumbnailSize + '\')"></li>',
                '</tpl>'
            ],
            itemSelector: 'li.image-item'
        });

        this.optionsHeading = Ext.widget({
            xtype: 'component',
            cls: 'fieldSetHeading',
            hidden: true,
            html: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.choose_your_options
        });


        this.optionsContainer = Ext.widget({
            xtype: 'container',
            cls: 'options',
            width: '100%',
            layout: 'anchor',
            items: [{
                xtype: 'component',
                html: ''
            }]
        });

        this.productName = Ext.widget({
            xtype: 'component',
            cls: 'productName'
        });

        this.productCodeField = Ext.widget({
            xtype: 'component',
            cls: 'productCode',
            tpl: [
                '<span class="label">' + Localizer.langResources.ORDERS.Orders.OrderEdit.AuditLog.product_code + ':</span> <span class="value">{code}</span>'
            ]
        });

        this.description = Ext.widget({
            xtype: 'component',
            flex: 1,
            cls: 'description'
        });

        this.price = Ext.widget({
            xtype: 'component',
            cls: 'price',
            tpl: [
                '<tpl if="Price">',
                '<span class="label">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.price + '</span><span class="price-value',
                '<tpl if="Price.SalePrice">',
                ' onsale',
                '</tpl>',
                '">',
                '{Price.Price:currency}</span>',
                '<tpl if="Price.SalePrice">',
                '<span class="price-value">{Price.SalePrice:currency}</span>',
                '</tpl>',
                '</tpl>',

                '<tpl if="PriceRange">',

                '<span class="label">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.price + '</span><span class="price-value',
                '<tpl if="PriceRange.Lower.SalePrice">',
                ' onsale',
                '</tpl>',
                '">',
                '{PriceRange.Lower.Price:currency}</span>',
                '<tpl if="PriceRange.Lower.SalePrice">',
                '<span class="price-value">{PriceRange.Lower.SalePrice:currency}</span>',
                '</tpl>',

                ' - <span class="price-value',
                '<tpl if="PriceRange.Upper.SalePrice">',
                ' onsale',
                '</tpl>',
                '">',
                '{PriceRange.Upper.Price:currency}</span>',
                '<tpl if="PriceRange.Upper.SalePrice">',
                '<span class="price-value">{PriceRange.Upper.SalePrice:currency}</span>',
                '</tpl>',

                '</tpl>'
            ]
        });

        this.items = [
            {
                layout: 'hbox',
                padding: 20,
                items: [
                    {
                        xtype: 'container',
                        cls: 'left-column',
                        width: 170,
                        items: [
                            this.imagesView
                        ]
                    },
                    {
                        xtype: 'container',
                        flex: 1,
                        //layout:'hbox',
                        items: [
                            this.productName,
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                items: [
                                    {
                                        flex: 1,
                                        xtype: 'container',
                                        layout: 'anchor',
                                        items: [
                                            this.optionsHeading,
                                            this.optionsContainer
                                        ]
                                    },
                                    {
                                        flex: 1,
                                        xtype: 'container',
                                        padding: '0 0 0 20',
                                        items: [
                                            this.productCodeField,
                                            this.description,
                                            this.price
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ];

        this.loadProduct();
        this.callParent(arguments);
    },

    areAllFieldsStatisfied: function () {
        // Copied from Ext source
        var originalHasInvalidField = function () {
            return !!this.getFields().findBy(function (field) {
                var preventMark = field.preventMark,
                    isValid;
                field.preventMark = true;
                isValid = field.isValid();
                field.preventMark = preventMark;
                return !isValid;
            });
        }
        return Ext.bind(originalHasInvalidField, this.getForm())();
    },

    onLoadFailure: function () {
        this.removeAll();
        this.setLoading(false);
        this.add({
            xtype: 'component',
            flex: 1,
            cls: 'error-loading',
            html: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.error_loading_product_configuration
        });
    },

    isDirty: function () {
        return true;
    },

    isValid: function () {
        return this.runtimeData && this.runtimeData.PurchasableState.IsPurchasable;
    },

    getData: function () {
        return this.runtimeData;
    },

    loadProduct: function (record) {
        if (record) this.record = record;

        if (!this.record) {
            Taco.model.Product.load(this.productCode, {
                success: function (record) {
                    this.loadProduct(record);
                },
                failure: function (response) {
                    // error handling here
                    var json = Ext.decode(response.responseText, true),
                        msg = (json && json.message) ? json.message : Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.error_adding_coupon;
                    Taco.app.fireEvent('setmessage', msg, 'error');
                    this.fireEvent('loadFailure');
                },
                scope: this
            });
            return;
        }

        this.record.loadRuntimeProduct({
            success: function (response) {
                Ext.suspendLayouts();
                this.buildImages();
                this.loadRuntimeProduct(response);
                Ext.resumeLayouts(true);
                if (this.ownerCt) {
                    this.ownerCt.center();
                }
                this.fireEvent('viewReady', this);
            },

            failure: function (response) {
                // error handling here
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.load_product_information;
                Taco.app.fireEvent('setmessage', msg, 'error');
                this.fireEvent('loadFailure');
            },

            scope: this
        });

        this.productName.update(this.record.get('productName'));
        this.productCodeField.update({ code: this.record.get('productCode') });

        var description = '';
        var longDescription = this.record.get('productFullDescription');
        var shortDescription = this.record.get('productShortDescription');

        if (!longDescription || longDescription == '<br>') {
            // no long description. check for a short description
            if (shortDescription && shortDescription.length && shortDescription != '<br>') {
                description = shortDescription;
            }
        } else {
            description = longDescription;
        }

        // check to see if the product has a description.
        if (!description.length) {
            this.description.hide();
        } else {
            this.description.update(description);
        }
    },

    loadRuntimeProduct: function (data) {
        this.runtimeData = data;
        this.buildOptions(this.runtimeData.Options);
        this.setLoading(false);
        this.postOptions();
    },

    buildImages: function () {
        this.images.loadData(this.record.get('productImages'));
    },

    buildOptions: function (options) {
        var items = [];

        this.optionsHeading.show();
        this.optionsContainer.removeAll();
        if (options && options.length) {
            Ext.each(options, function (option) {
                items.push(this.buildOption(option));
            }, this);
            this.optionsContainer.add(items);
        }

        this.price.update({
            Price: this.runtimeData.Price,
            PriceRange: this.runtimeData.PriceRange
        });
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
        return Ext.apply(builds['Default'](option), builds[inputType](option), {
            listeners: {
                change: function (field, value) {
                    var self = this;
                    this.getForm().checkValidity();
                    var request = { Options: [] };

                    Ext.each(this.runtimeData.Options, function (option) {
                        if (option.AttributeFQN == field.name) {
                            option.Value = saves[inputType] ? saves[inputType](value) : value;

                            if (option.AttributeDetail.UsageType === 'Option') {
                                this.lastUpdatedOption = option;
                            }
                        }

                        if (option.Value === undefined || option.Value === ' ') return;
                        delete option.Values;

                        if (option.AttributeDetail.InputType !== 'List') {
                            option.ShopperEnteredValue = option.Value;
                        } else {
                            delete option.ShopperEnteredValue;
                        }

                        request.Options.push(option);
                    }, this);

                    this.setLoading(true);
                    this.isUpdating = true;
                    this.record.configureRuntimeProduct({
                        jsonData: request,
                        success: function (response) {
                            var self = this;
                            var responseData = JSON.parse(response.responseText).items;
                            Ext.each(responseData.Options, function (option) {
                                if (option.AttributeDetail.InputType == "List" && field.name !== option.AttributeFQN) {
                                    self.filterForEnabledValues(option);
                                }
                            });


                            self.setLoading(false);
                            self.isUpdating = false;
                            self.getForm().checkValidity();
                        },
                        failure: function (response) {
                            this.setLoading(false);
                            this.isUpdating = false;

                            var error = JSON.parse(response.responseText);
                            Taco.app.fireEvent('setmessage', error, 'error');
                            this.fireEvent('loadFailure');

                        },
                        scope: self
                    });
                },
                buffer: 400,
                scope: this
            }
        });
    },

    updateOption: function (option) {
        var field = this.findField(option.AttributeFQN),
            updates = this.statics().updates,
            currentValue,
            repostOptions;

        if (!field) return;

        currentValue = field.getValue();

        field.suspendCheckChange++;

        Ext.each(option.Values, function (value) {
            if (!value.StringValue) value.StringValue = value.Value;
            if (value.IsSelected) option.Value = value.ShopperEnteredValue || value.Value;
            if (value.IsSelected) option.ShopperEnteredValue = value.ShopperEnteredValue || value.Value;

            if (currentValue === value.Value && !value.IsEnabled) {
                if (this.lastUpdatedOption.AttributeFQN === option.AttributeFQN) {
                    repostOptions = true;
                } else {
                    delete option.Value;
                    delete option.ShopperEnteredValue;
                }
            }
        }, this);

        if (updates[field.optionInputType]) updates[field.optionInputType](option, field);

        if (option.Value !== undefined) {
            field.setValue(option.Value);
        }
        option.Values.unshift({ Value: ' ', StringValue: '\u00A0', IsSelected: false, IsEnabled: true })
        field.suspendCheckChange--;

        if (repostOptions) this.postOptions();
    },
    filterForEnabledValues: function (option) {
        this.updateOption(option);
        var field = this.findField(option.AttributeFQN);
        field.store.clearFilter(true);
        field.store.filter("IsEnabled", true);
        field.store.insert(0, { Value: ' ', StringValue: '\u00A0', IsSelected: false, IsEnabled: true });

    },
    postOptions: function (callback) {
        var me = this;
        var request = { Options: [] };

        this.setLoading(true);
        this.isUpdating = true;
        this.getForm().checkValidity();

        Ext.each(this.runtimeData.Options, function (option) {
            if (option.Value === undefined) return;

            delete option.Values;

            if (option.AttributeDetail.InputType !== 'List') {
                option.ShopperEnteredValue = option.Value;
            } else {
                delete option.ShopperEnteredValue;
            }

            request.Options.push(option);
        });

        function configureProduct(quantity) {
            me.record.configureRuntimeProduct({
                jsonData: request,
                success: function (response) {
                    this.runtimeData = JSON.parse(response.responseText).items;
                    var state = this.runtimeData.PurchasableState;
                    try {
                        if (!state.IsPurchasable && Ext.Array.findBy(state.Messages, function (msg) { return msg.ValidationType === 'MinQtyNotMet'; })) {
                            var minQty = Ext.Array.min(Ext.Array.pluck(this.runtimeData.VolumePriceBands, 'MinQty'));
                            configureProduct(minQty);
                            return;
                        }
                    } catch (e) { }

                    Ext.each(this.runtimeData.Options, function (option) {
                        this.updateOption(option);
                    }, this);

                    // update the price
                    this.price.update({
                        Price: this.runtimeData.Price,
                        PriceRange: this.runtimeData.PriceRange
                    });
                    this.setLoading(false);
                    this.isUpdating = false;
                    this.getForm().checkValidity();

                    if (callback) {
                        callback();
                    }
                },
                failure: function (response) {
                    this.setLoading(false);
                    this.isUpdating = false;

                    var error = JSON.parse(response.responseText);

                    if (callback) {
                        callback(error)
                    }
                },
                scope: me
            }, quantity || 1);
        };

        configureProduct();
    }
});