/**
* @class Taco.controller.Testing
* @author Jason Cochran
* The Testing controller. All kinds of craziness that requires a controller action to test. **TODO: Move this all into Siesta.**
*/

Ext.define('Taco.controller.Testing', {
    extend: 'Taco.core.Controller',

    statics: {
        returnString: function (str) {
            return function () {
                return str;
            };
        },

        newSequentialEditingId: (function(){
            var editingIds = 0;
            return function () {
                return 'editing-' + editingIds++;
            }
        }())
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

        var reload = function (response, opts) {
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
                        msg: 'Are you sure you want to change the theme to "' + record.data.name + '"?',
                        buttons: Ext.Msg.YESNO,
                        fn: function (btn) { setThemeHandler(theme, btn); },
                        icon: Ext.MessageBox.QUESTION
                    });
                }
            }
        });
        this.createContentView('Taco.core.ux.content.Container', {

            header: {
                title: "Themes"
            },

            body: {
                layout: 'auto',
                items: [{
                    xtype: 'container',
                    html: "The currently selected theme will be shown at the top of the list<br /><br />"
                }, grid]
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
                    messageProperty: "message"
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
            },
            Ext.create('Taco.core.ux.GridPager', {
                store: store
            })],

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
                title: "tenants"
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
                    messageProperty: "message"
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

    htmlEditor: function () {
        this.createContentView('Taco.core.ux.content.Container', {

            header: {
                title: "TinyMCE Toons",
                height: 50
            },

            body: {
                items: [Ext.create('Ext.form.Panel', {
                    width: 600,
                    height: 500,
                    items: [{
                        xtype: 'tinymcefield',
                        name: 'bio',
                        labelAlign: 'top',
                        height: 500,
                        width: 600
                        // ,
                        //                                tinymceConfig: {
                        //                                    plugins: "safari,advlink,imagemanager",
                        //                                    theme_advanced_buttons1: 'insertimage,|,undo,redo,|,formatselect,fontselect,|,bold,italic,underline,strikethrough,|,forecolor,backcolor,|,justifyleft,justifycenter,justifyright,|,link,unlink,|,numlist,bullist,|,code',
                        //                                    theme_advanced_buttons2: '',
                        //                                    theme_advanced_buttons3: '',
                        //                                    theme_advanced_buttons4: '',
                        //                                    theme_advanced_toolbar_location: "external",
                        //                                    theme_advanced_statusbar_location: "none",
                        //                                    skin: 'default'
                        //                                }
                    }]
                })]
            }


        });
    },

    widgetDefinition: function () {
        window.twd = Ext.create('Taco.store.WidgetDefinitions');
    },

    inlineFieldTest: function () {
        var me = this;
        me.createContentView('Taco.view.site.page.EditSurface', {
            pageSrc: '/CmsPages/test'
        });
    },

    siteEditor: function () {
        this.createContentView('Taco.view.site.page.Edit');
    },

    mutliFileAssociator: function () {
        Ext.create('Taco.view.fileManagement.MultiFileAssociator');
    },
    standAloneOptions: function (args) {
        var me = this;
        productId = args.id || 113;
        Ext.ModelManager.getModel('Taco.model.Product').load(productId, {
            success: function (data) {
                me.createContentView('Taco.view.testing.standAloneOptions', {
                    data: data,
                    productOptions: data.productOptions()
                });

            },

            failure: function () {
                console.log(this, arguments);
                Ext.Msg.alert('Failed Product load', arguments);
            }
        });

    },

    inventoryControlGrid: function (args) {
        var me = this,
            productId = args ? args.id : 113,
            chain = Ext.create('Taco.core.EventChain');

        chain.state.optionsStore = Ext.create('Taco.store.Options');

        chain.add({
            key: "1",
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
            key: "2",
            depends: ["1"],
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
                            title: "Inventory Control Griddles",
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
            key: "1",
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
            key: "2",
            depends: ["1"],
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
            key: "3",
            depends: ["1"],
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
                            key: "optionValues" + option.getId(),
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
            if (this.__proto__.hasOwnProperty(i) && i !== "self" && i !== "index" && typeof this.__proto__[i] === "function") {
                links.push(i);
            }
        }

        this.createContentView('Taco.core.ux.content.Container', {

            header: {
                title: "White Sands Nuclear Test Grounds",
                height: 50
            },

            body: {
                items: [{
                    xtype: 'component',
                    tpl: new Ext.XTemplate(['<ul>', '<tpl for=".">', '<li><a href="./testing/{.}">{.}</a></li>', '</tpl>', '</ul>']),
                    data: links
                }]
            }


        });

    }
});