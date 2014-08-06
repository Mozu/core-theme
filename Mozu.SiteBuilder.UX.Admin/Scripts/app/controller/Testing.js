/**
 * @class Taco.controller.Testing
 * @author Jason Cochran
 * The Testing controller. All kinds of craziness that requires a controller action to test. **TODO: Move this all into Siesta.**
 */

Ext.define('Taco.controller.Testing', {
        extend: 'Taco.core.Controller',
        requires: ['Taco.core.data.StoreManager', 'Taco.model.ProductType', 'Taco.model.Order', 'Taco.model.OrderItem', 'Taco.model.Product', 'Taco.store.Products', 'Taco.store.Orders', 'Taco.store.CmsDocumentDrafts'],

        statics: {
            returnString: function (str) {
                return function () {
                    return str;
                };
            },

            newSequentialEditingId: (function () {
                var editingIds = 0;
                return function () {
                    return 'editing-' + editingIds++;
                };
            }())
        },

        producttypes: function () {

            var pts = Ext.create('Ext.data.Store', {
                model: 'Taco.model.ProductType'

            });

            window.pts = pts;

            pts.load({
                scope: this,
                callback: function (records) {
                    // the operation object
                    // contains all of the details of the load operation
                    console.log(records);
                    var pt = pts.getAt(0);
                    pt.getOptions().add({
                        attributeId: 666
                    });
                    pts.sync({
                        callback: function () {
                            pts.sync();
                            pt.getOptions().getAt(0).set('hidden', true);
                            pts.sync();
                        }
                    });
                }
            });

            this.createContentView('Taco.core.ux.content.Container', {

                header: {
                    title: 'Product Types'
                },

                body: {
                    layout: 'auto',
                    items: [
                        {
                            xtype: 'button',
                            text: 'Click to create a PT',
                            handler: function () {
                                var randomInteger = Math.round(1 + Math.random() * 1000),
                                    p = Ext.create('Taco.model.ProductType', {
                                        name: 'foster ' + randomInteger
                                    });

                                p.save({
                                    success: function (record) {
                                        alert('successfully created ' + record.getId());

                                        var o = record.getOptions();
                                        o.add({
                                            attributeId: 666
                                        });
                                        record.save();
                                        // pts.sync();
                                    },
                                    failure: function () {
                                        alert('fail');
                                    }
                                });

                                /*
                        p.getOptions().add({ attributeId: 666 });
                        p.save();
                        p.getExtras().add({ attributeId: 667 });
                        p.getProperties().add({ attributeId: 668 });
                        */

                            }
                },
                        {
                            xtype: 'box',
                            autoEl: 'hr'
                }]
                }
            });

        },

        foster: function () {

            var productStore = Ext.data.StoreManager.lookup('Taco.store.Products');
            productStore.load();

            this.createContentView('Taco.core.ux.content.Container', {

                header: {
                    title: 'Foster'
                },

                body: {
                    layout: 'auto',
                    items: [{
                            xtype: 'button',
                            text: 'Click to create a Foster',
                            handler: function () {
                                var randomInteger = Math.round(1 + Math.random() * 1000),
                                    p = Ext.create('Taco.model.Product', {
                                        productCode: 'foster' + randomInteger,
                                        productName: 'foster' + '(' + randomInteger + ')',
                                        price: 10
                                    });


                                p.phantom = true;
                                p.save({
                                    success: function (record) {
                                        alert('successfully created ' + record.getId());
                                        var siteId = prompt('Site id?');

                                        var pisi = Ext.create('Taco.model.ProductInCatalogInfo', {
                                            productCode: p.get('productCode'),
                                            siteId: siteId
                                        });

                                        pisi.phantom = true;

                                        pisi.save({
                                            success: function (record) {
                                                alert('successfully created PISI: ' + record.getId());

                                                // true means to not not not load data automatically
                                                productStore.clearFilter(true);
                                                productStore.load();
                                            },
                                            failure: function () {
                                                alert('fail');
                                            }
                                        });
                                    },
                                    failure: function () {
                                        alert('fail');
                                    }
                                });
                            }
                },
                        {
                            xtype: 'box',
                            autoEl: 'hr'
                },
                        {
                            xtype: 'button',
                            text: 'Click to get a Foster',
                            handler: function () {
                                var productCode = window.prompt('Enter foster code', 'foster123');

                                Taco.model.Product.load(productCode, {
                                    success: function (record) {
                                        alert('successfully got ' + record.getId());
                                    },
                                    failure: function () {
                                        alert('fail');
                                    }
                                });

                            }
                },
                        {
                            xtype: 'box',
                            autoEl: 'hr'
                },
                        {
                            xtype: 'button',
                            text: 'Click to filter your Fosters',
                            handler: function () {
                                var filterString = window.prompt('Enter a foster name to search for.', '123');

                                // true means to not not not load data automatically
                                productStore.clearFilter(true);
                                productStore.filter([
                                    {
                                        property: 'productName',
                                        value: filterString
                                }
                        ]);

                                // onLoad handled by grid.
                            }
                },
                        {
                            xtype: 'box',
                            autoEl: 'hr'
                },
                        {
                            xtype: 'button',
                            text: 'Click to clear your Foster filters',
                            handler: function () {
                                // false means to reload data automatically
                                productStore.clearFilter(false);
                                // onLoad handled by grid.
                            }
                },
                        {
                            xtype: 'box',
                            autoEl: 'hr'
                },
                        {
                            xtype: 'gridpanel',
                            store: productStore,
                            columns: [
                                {
                                    xtype: 'gridcolumn',
                                    dataIndex: 'productCode',
                                    text: 'Product Code'
                        },
                                {
                                    xtype: 'gridcolumn',
                                    dataIndex: 'productName',
                                    text: 'Product Name'
                        },
                                {
                                    xtype: 'gridcolumn',
                                    dataIndex: 'productInCatalogs',
                                    text: 'Catalogs',
                                    renderer: function (pisis) {
                                        var mapped = Ext.Array.map(pisis, function (pisi) {
                                            return pisi.siteId;
                                        });
                                        return mapped.join(',');
                                    }
                        }
                    ]
                }]
                }
            });
        },

        productExtras: function () {

            /*var store = Ext.data.StoreManager.lookup('Taco.store.Products'),
            product = store.getById('23423423');

        console.log(product);*/

            this.createContentView('Taco.core.ux.content.Container', {
                header: {
                    title: 'Extras for Product 23423423'
                },

                body: {
                    layout: 'auto',
                    items: [{
                        xtype: 'button',
                        text: 'Click to create Extra',
                        handler: function () {
                            var randomInteger = Math.round(1 + Math.random() * 1000),
                                p = Ext.create('Taco.model.ProductExtra', {
                                    attributeFQN: 'Extra ' + randomInteger,
                                    product: '23423423',
                                    values: [1, 2, 3]
                                });

                            p.phantom = true;

                            console.log(p);

                            p.save({
                                success: function (record) {
                                    alert('successfully created ' + record.getId());
                                },
                                failure: function () {
                                    alert('fail');
                                }
                            });
                        }
                }]
                }
            });
        },

        foscount: function () {

            this.createContentView('Taco.core.ux.content.Container', {

                header: {
                    title: 'Discounts'
                },

                body: {
                    layout: 'auto',
                    items: [{
                        xtype: 'button',
                        text: 'Click to create a Discount',
                        handler: function () {
                            var randomInteger = Math.round(1 + Math.random() * 1000),
                                p = Ext.create('Taco.model.Discount', {
                                    name: 'foster special ' + randomInteger,
                                    amount: 10,
                                    amountType: 'Amount'
                                });


                            p.phantom = true;
                            p.save({
                                success: function (record) {
                                    alert('successfully created ' + record.getId());
                                },
                                failure: function () {
                                    alert('fail');
                                }
                            });
                        }
                }]
                }
            });
        },

        order: function () {
            var order, orderItemStore, itemArray = [];

            orderItemStore = Ext.create('Ext.data.Store', {
                model: 'Taco.model.OrderItem'
            });
            order = Ext.create('Taco.model.Order', {

            });

            orderItemStore.add({
                quantity: 1,
                product: {
                    productCode: 'jersy1',
                    price: {
                        price: 60
                    }
                }
            });

            orderItemStore.add({
                quantity: 1,
                product: {
                    productCode: 'tshirt2',
                    price: {
                        price: 15
                    }
                }
            });

            orderItemStore.add({
                quantity: 1,
                product: {
                    productCode: 'shirt4',
                    price: {
                        price: 20
                    }
                }
            });

            orderItemStore.each(function (i) {
                itemArray.push(i.getData());
            });
            order.set('items', itemArray);


            //getData
        },


        myAccount: function () {
            window.location = '/admin/account';
        },

        editAddress: function () {
            this.createContentView('Taco.view.testing.EditAddressTest');
        },

        changeSite: function () {
            this.createContentView('Taco.view.user.changeSiteTest');

        },
        useMocks: function () {
            var useMocks = Ext.state.Manager.get('useMocks');
            if (useMocks) {
                Ext.state.Manager.set('useMocks', false);
            } else {
                Ext.state.Manager.set('useMocks', true);
            }

            alert('useMocks=' + Ext.state.Manager.get('useMocks'));

        },
        changeTheme: function () {
            var store = Ext.create('Ext.data.Store', {
                fields: [{
                    name: 'name',
                    type: 'string'
            }, {
                    name: 'value',
                    type: 'string'
            }],
                proxy: {
                    type: 'ajaxproxy',
                    api: {
                        read: '/admin/app/testing/theme/list'
                    },
                    reader: {
                        type: 'json',
                        root: 'items',
                        successProperty: 'success',
                        messageProperty: 'message'
                    },
                    writer: {
                        allowSingle: false
                    }
                },
                autoLoad: true
            });

            var reload = function ()) {
            Ext.Msg.alert('Change Theme', 'Theme changed successfully.', function () {
                window.location.href = window.location.href;
            });
        };

        var setThemeHandler = function (theme, button) {
            if (button !== 'yes')
                return;
            Ext.Ajax.request({
                url: '/admin/app/testing/setTheme',
                method: 'POST',
                success: reload,
                jsonData: theme
            });
        };

        var grid = Ext.widget('grid', {
            store: store,
            width: 250,
            columns: [{
                dataIndex: 'name',
                header: 'Name',
                width: 248
            }],
            listeners: {
                select: function (rowModel, record, index, eOpts) {
                    var theme = record.data;
                    Ext.Msg.show({
                        title: 'Change Theme',
                        msg: 'Are you sure you want to change the theme to '
                        ' + record.data.name + '
                        '?',
                        buttons: Ext.Msg.YESNO,
                        fn: function (btn) {
                            setThemeHandler(theme, btn);
                        },
                        icon: Ext.MessageBox.QUESTION
                    });
                }
            }
        });
        this.createContentView('Taco.core.ux.content.Container', {

            header: {
                title: 'Themes'
            },

            body: {
                layout: 'auto',
                items: [{
                        xtype: 'container',
                        html: 'The currently selected theme will be shown at the top of the list<br /><br />'
                },
                    grid]
            }
        });
    },
    tenants: function () {
        var store = Ext.create('Ext.data.Store', {
            fields: [{
                name: 'Name',
                type: 'string'
            }, {
                name: 'Id',
                type: 'int'
            }],
            proxy: {
                type: 'ajaxproxy',
                api: {
                    read: '/admin/app/testing/tenant/list'
                },
                reader: {
                    type: 'json',
                    root: 'items',
                    successProperty: 'success',
                    messageProperty: 'message'
                },
                writer: {
                    allowSingle: false
                }
            },
            autoLoad: true
        });


        var grid = Ext.widget('grid', {
            store: store,
            dockedItems: [{
                    xtype: 'textfield',
                    flex: 1,
                    emptyText: 'Search...',
                    enableKeyEvents: true,
                    listeners: {
                        'keyup': {
                            fn: function (field) {

                                store.currentPage = 1;
                                if (field.value.length === 0) {
                                    store.filters.removeAtKey(this.id);
                                    store.load();
                                    return;
                                }
                                if (field.value.length >= 3) {
                                    store.filters.add(this.id, Ext.create('Ext.util.Filter', {
                                        anyMatch: true,
                                        property: 'Name',
                                        value: field.getValue(),
                                        root: 'data'
                                    }));
                                    store.load();
                                    return;
                                }
                            },
                            scope: this
                        }
                    }
            }
            ],

            columns: [{
                dataIndex: 'Name',
                header: 'Name',
                flex: 1
            }, {
                dataIndex: 'Id',
                header: 'Id'
            }],
            listeners: {
                select: function (rowModel, record, index, eOpts) {
                    Ext.Ajax.request({
                        url: '/admin/app/testing/setSiteContextFromTenant',
                        method: 'POST',
                        success: function (response, opts) {
                            window.location.href = document.head.baseURI;
                        },
                        jsonData: record.data
                    });
                }
            }

        });
        this.createContentView('Taco.core.ux.content.Container', {

            header: {
                title: 'tenants'
            },

            body: {
                layout: 'fit',
                items: [grid]
            }
        });

    },
    teststore: function () {
        var myStore = Ext.create('Ext.data.Store', {
            fields: [{
                name: 'name',
                type: 'string'
            }, {
                name: 'email',
                type: 'string'
            }, {
                name: 'id',
                type: 'int'
            }, {
                name: 'words',
                type: 'string'
            }],
            proxy: {
                type: 'ajaxproxy',
                api: {
                    read: '/admin/app/testing/list'
                },
                reader: {
                    type: 'json',
                    root: 'items',
                    successProperty: 'success',
                    messageProperty: 'message'
                },
                writer: {
                    allowSingle: false
                }
            },
            autoLoad: true
        });
        myStore.load({
            scope: this,
            callback: function (records, operation, success) {
                // the operation object
                // contains all of the details of the load operation
                console.log(records);

            }
        });

    },


    widgetDefinition: function () {
        window.twd = Ext.create('Taco.store.WidgetDefinitions');
    },


    siteEditor: function () {
        this.createContentView('Taco.view.site.page.Edit');
    },

    mutliFileAssociator: function () {
        Ext.create('Taco.view.fileManager.Associator');
    },


    inventoryControlGrid: function (args) {
        var me = this,
            productId = args ? args.id : 113,
            chain = Ext.create('Taco.core.EventChain');

        chain.state.optionsStore = Ext.create('Taco.store.Options');

        chain.add({
            key: '1',
            fn: function (chain) {
                Ext.ModelManager.getModel('Taco.model.Product').load(productId, {
                    success: function (data) {
                        chain.state.product = data;
                        chain.callback();
                    }
                });
            }
        });

        chain.add({
            key: '2',
            depends: ['1'],
            fn: function (chain) {
                chain.state.product.productVariations().on('metachange', function (meta, eOpts) {
                    console.log('meta', arguments);

                });
                chain.state.product.productVariations().load(function () {
                    chain.callback();
                });
            }
        });

        chain.doWork({
            shouldLog: true,

            finalCallback: {
                fn: function () {
                    me.createContentView('Taco.core.ux.content.Container', {

                        header: {
                            title: 'Inventory Control Griddles',
                            height: 50
                        },

                        body: {
                            items: [Ext.create('Taco.view.option.InventoryControlGrid', {
                                store: chain.state.product.productVariations()
                            })]
                        }


                    });
                }
            }
        });

    },

    blurg: function (args) {

        var me = this,
            productId = args.id || 113,
            chain = Ext.create('Taco.core.EventChain');

        chain.state.optionsStore = Ext.create('Taco.store.Options');

        chain.add({
            key: '1',
            fn: function (chain) {
                Ext.ModelManager.getModel('Taco.model.Product').load(productId, {
                    success: function (data) {
                        chain.state.product = data;
                        chain.callback();
                    }
                });
            }
        });

        chain.add({
            key: '2',
            depends: ['1'],
            fn: function (chain) {
                chain.state.product.productVariations().on('metachange', function (meta, eOpts) {
                    console.log('meta', arguments);

                });
                chain.state.product.productVariations().load(function () {
                    chain.callback();
                });
            }
        });


        chain.add({
            key: '3',
            depends: ['1'],
            fn: function (chain) {
                chain.state.optionsStore.load(function () {
                    var cnt = 0;
                    chain.state.optionsStore.filterBy(function (item) {
                        return item.get('inputType') == 'Radio' || item.get('inputType') == 'Dropdown';
                    });

                    chain.state.optionsStore.each(function (option) {
                        if (cnt == 3) {
                            return false;
                        }
                        cnt++;
                        chain.add({
                            key: 'optionValues' + option.getId(),
                            fn: function (cn) {
                                option.optionValues().load(

                                    function () {

                                        cn.callback();

                                    });
                            }

                        });
                    });


                    chain.callback();
                });
            }
        });
        var blurp = chain;
        chain.doWork({
            shouldLog: true,

            finalCallback: {
                fn: function () {

                    console.log('pvs', chain.state.product.productVariations());
                    if (chain.state.product.productVariations().getCount() === 0) {
                        var store = Ext.create('Taco.store.ProductOptionValues');

                        for (idx = 0; idx < 3 && idx < chain.state.optionsStore.getCount(); idx++) {
                            var option = chain.state.optionsStore.getAt(idx);
                            var values = option.optionValues();
                            if (values.getCount() == 0) {
                                console.log(option.getId());
                            }
                            for (vIdx = 0; vIdx < 5 && vIdx < values.getCount(); vIdx++) {

                                var value = values.getAt(vIdx);
                                var mdm = Ext.create('Taco.model.ProductOptionValue');
                                mdm.set('productId', chain.state.product.getId());
                                mdm.set('option_id', option.getId());
                                mdm.set('intention', 'configuration');
                                mdm.set('id', value.getId());
                                store.add(mdm);
                            }
                        }

                        store.sync();
                    } else {

                    }
                }
            }
        });

    },

    dateTime: function () {
        this.createContentView('Taco.core.ux.content.Container', {
            header: {
                title: 'Date Time Test'
            },

            body: {
                items: [{
                    xtype: 'container',
                    layout: 'hbox',
                    defaults: {
                        labelAlign: 'top'
                    },
                    items: [
                    Ext.create('Ext.form.field.Date', {
                            fieldLabel: 'Date'
                        }), Ext.create('Taco.core.ux.form.DateTime', {
                            fieldLabel: 'DateTime'
                        })]
                }]
            }
        });
    },

    index: function () {

        var links = [];
        for (var i in this.__proto__) {
            if (this.__proto__.hasOwnProperty(i) && i !== 'self' && i !== 'index' && typeof this.__proto__[i] === 'function') {
                links.push(i);
            }
        }

        this.createContentView('Taco.core.ux.content.Container', {

            header: {
                title: 'White Sands Nuclear Test Grounds',
                height: 50
            },

            body: {
                items: [{
                    xtype: 'component',
                    tpl: new Ext.XTemplate(['<ul>', '<tpl for='.
                        '>', '<li><a href='. / testing / {.
                        }
                        '>{.}</a></li>', '</tpl>', '</ul>']),
                    data: links
                }]
            }


        });

    }
});