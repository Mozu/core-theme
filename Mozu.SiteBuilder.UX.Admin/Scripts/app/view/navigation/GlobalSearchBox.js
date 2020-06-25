/**
 * @class Taco.view.navigation.PrimaryMenu
 * @author Jimmy Sanford
 *
 */
Ext.define('Taco.view.navigation.GlobalSearchBox', {
    alias: 'widget.global-search-box',
    extend: 'Ext.form.ComboBox',
    requires: [],

    displayField: 'asdf',
    typeAhead: false,
    hideLabel: true,
    hideTrigger: true,
    matchFieldWidth: false,
    minChars: 3,
    //anchor: '100%',
    cls: 'global-search-box',
    listConfig: {
        loadingText: Localizer.langResources.DASHBOARD.SYSTEM.loading_text,
        emptyText: '<ul class="x-list-plain"><li class="x-boundlist-item"><div>' + Localizer.langResources.DASHBOARD.SYSTEM.search_text + '</div></li></ul>',
        width: 270,
        // Custom rendering template for each item
        //removing count because of service optimization it doesnt return.
        getInnerTpl: function () {
            return '<tpl if="isHeader">' +
                '<h3>{name}&nbsp;&nbsp;&nbsp;<i><a>see all</a></i></h3>' +
                '<tpl else>' +
                '<div>&nbsp;&nbsp;&nbsp;{itemId}- {name}</div>' +
                '</tpl>';
        }
    },
    //pageSize: 10,

    initComponent: function () {
        var me = this;


        //me.mon(me.productStore, 'load', me.innerStoreLoad, me);
        //me.mon(me.ordersStore, 'load', me.innerStoreLoad, me);
        //me.mon(me.customerStore, 'load', me.innerStoreLoad, me);
        me.on('select', me.onSelect, me);
        me.on('beforeselect', me.onBeforeselect, me);


        me.store = Ext.create('Ext.data.Store', {
            pageSize: 10,
            fields: [
                {
                    name: 'itemId'
                },
                {
                    name: 'name'
                },
                {
                    name: 'type'
                },
                {
                    name: 'ctx'
                },
                {
                    name: 'count',
                    type: 'int'
                },
                {
                    name: 'controller'
                },
                {
                    name: 'sourceRecord',
                    type: 'any'
                },
                {
                    name: 'isHeader',
                    type: 'boolean',
                    defaultValue: false
                }
            ],
            load: function (config) {
                if (!config.params.query) {
                    return;
                }
                me.store.loading = true;

                var ctx = Taco.app.context.getCurrent(),
                    options = {
                        filters: [
                            new Ext.util.Filter({
                                property: 'all',
                                value: config.params.query
                            })],
                        params: {
                            searchType: 'global'
                        },
                        callback: me.innerStoreLoad,
                        scope: me
                    },
                    ordersStore = Taco.core.data.StoreManager.getOrCreate({
                        type: 'Taco.store.Orders',
                        createOnly: 'true',
                        pageSize: 5,
                        autoLoad: false
                    }),
                    customerStore = Taco.core.data.StoreManager.getOrCreate({
                        type: 'Taco.store.Customers',
                        createOnly: 'true',
                        pageSize: 5,
                        autoLoad: false
                    }),
                    tmpStore;


                ordersStore.load(options);
                customerStore.load(options);

                if (ctx.contextType == 's' || ctx.contextType == 'm' || ctx.contextType == 'c') {


                    tmpStore = Taco.core.data.StoreManager.getOrCreate({
                        type: 'Taco.store.Products',
                        createOnly: 'true',
                        pageSize: 5,
                        autoLoad: false
                    }),
                        tmpStore.load(options);
                } else {

                    Ext.each(ctx.masterCatalogs, function (sc) {
                        var optCopy = Ext.apply({
                            headers: {
                                'x-vol-site-group': sc.id
                            }
                        }, options);
                        tmpStore = Taco.core.data.StoreManager.getOrCreate({
                            type: 'Taco.store.Products',
                            createOnly: 'true',
                            pageSize: 5,
                            autoLoad: false
                        }),
                            tmpStore.load(optCopy);

                    });


                }
            }
        });


        this.callParent(arguments);

        //me.picker.alignTo(me.inputEl, me.pickerAlign, me.pickerOffset);
    },
    innerStoreLoad: function (records, operation, successful) {

        var me = this,
            recsToRem = [],
            header = {},
            raw = [],
            append = !me.store.loading,
            siteGroupName = '',
            siteGroup;
        if (operation && operation.headers && operation.headers['x-vol-site-group']) {

            siteGroup = operation.headers['x-vol-site-group'];
            siteGroupName = Taco.app.context.findMasterCatalog(siteGroup).name;
        }

        me.store.loading = false;


        if (records) {

            Ext.each(records, function (record) {
                var data = {
                    sourceRecord: record,
                    type: record.modelName,
                    itemId: '',
                    name: '',
                    isHeader: false,
                    count: operation.resultSet.total,
                    ctx: siteGroup ? 'c-' + siteGroup : Taco.app.context.getCurrent().urlToken
                };
                if (header) {
                    Ext.apply(header, {
                        isHeader: true,
                        sourceRecord: null
                    }, data);
                }
                switch (record.modelName) {
                    case 'Taco.model.Product':
                        data.controller = 'products';
                        data.name = record.data.productName;
                        data.itemId = record.data.productCode;
                        if (header) {
                            header.name = 'PRODUCTS ' + siteGroupName;
                            header.controller = data.controller;
                        }
                        break;
                    case 'Taco.model.Order':
                        data.controller = 'orders';
                        data.name = Taco.app.context.findSite(record.data.siteId).name;
                        data.itemId = record.data.orderNumber;
                        if (header) {
                            header.name = 'ORDERS ';
                            header.controller = data.controller;
                        }
                        break;
                    case 'Taco.model.CustomerAccount':
                        data.controller = 'customers';
                        data.name = record.data.firstName + ' ' + record.data.lastName;
                        data.itemId = record.data.id;
                        if (header) {
                            header.name = 'CUSTOMERS';
                            header.controller = data.controller;
                        }
                        break;
                }
                if (header) {
                    raw.push(header);
                    header = null;
                }
                raw.push(data);
            });
            me.store.loadRawData(raw, append);
        } else if (!append) {
            me.store.removeAll();
        }


    },
    onSelect: function (combo, records, eOpts) {


    },
    onBeforeselect: function (combo, record, index, eOpts) {
        var sourceRecord = record.data.sourceRecord;
        if (sourceRecord) {
            if (record.data.controller == 'customers') {
                Taco.core.StateManager.attemptNavigate(record.data.ctx + '/' + record.data.controller + '/edit/' + sourceRecord.get('id'));
            } else {
                Taco.core.StateManager.attemptNavigate(record.data.ctx + '/' + record.data.controller + '/edit/' + sourceRecord.getId());
            }
        } else {
            Taco.core.StateManager.attemptNavigate(record.data.ctx + '/' + record.data.controller, {
                options: {
                    query: combo.getValue()
                }
            });
        }
    }
});