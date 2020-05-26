
Ext.define('Taco.view.attribute.GenericAttributeSelect', {
    extend: 'Ext.ux.form.field.BoxSelect',
    xtype: 'genericattributeselect',
    requires: [
        'Taco.store.AttributesGrid'
    ],
    growToLongestValue: false,
    forceSelection: true,
    minChars: 3,
    multiSelect: false,
    triggerOnClick: false,
    typeAhead: true,
    excludeBase: false,
    displayField: 'name',
    fieldLabel: '',
    queryMode: 'remote',
    valueField: 'id',
    pageSize: 25,
    initComponent: function () {
        var storeCfg = {
            type: 'Taco.store.AttributesGrid',
            extraParams: {
                advancedSearch: Ext.JSON.encodeValue({ "type": "isvaluemappingattribute" }),
                responseGroups: "Min,Price"
            }
        };

        this.store = Taco.core.data.StoreManager.getOrCreate(storeCfg);

        this.store.on('load', function (store, records, successful, eOpts) {
            store.filterBy(function (rec) {
                return rec.get('isValueMappingAttribute') === true;
            });
        });

        //for good measure if the storemanagerconfig changes, we'll do the same thing after store creation
        Ext.apply(this.store.getProxy().extraParams, storeCfg.extraParams);

        this.callParent(arguments);
    },
    listConfig: {
        loadingText: 'Searching...',
        cls: "product-picker-menu",
        emptyText: 'No matching attributes found.',
        // Custom rendering template for each item
        getInnerTpl: function () {
            return "<span class='product-name'>{name}</span>"
        },

        // this is an override that hides the paging toolbar when the list only contains a single page of results;
        refresh: function () {
            var me = this,
                toolbar = me.pagingToolbar;

            Ext.view.View.prototype.refresh.call(me);

            if (me.rendered && toolbar && toolbar.rendered && !me.preserveScrollOnRefresh) {
                me.el.appendChild(toolbar.el);
                var store = me.getStore();
                if (store.getTotalCount() <= store.pageSize) {
                    me.el.last().hide();
                }
                else {
                    me.el.last().show();
                }
            }
        }
    },


    getMultiSelectItemMarkup: function () {
        var me = this;

        if (!me.multiSelectItemTpl) {
            if (!me.labelTpl) {
                me.labelTpl = Ext.create('Ext.XTemplate',
                    '{[values.' + me.displayField + ']}'
                );
            } else if (Ext.isString(me.labelTpl) || Ext.isArray(me.labelTpl)) {
                me.labelTpl = Ext.create('Ext.XTemplate', me.labelTpl);
            }

            me.multiSelectItemTpl = [
                '<tpl for=".">',
                '<li class="x-tab-default x-boxselect-item" style="border:none"',
                '<tpl if="this.isSelected(values.' + me.valueField + ')">',
                ' selected',
                '</tpl>',
                '<tpl if="values.' + me.hoverField + '">',
                ' title="{[values.' + me.hoverField + ']}"',
                '</tpl>',
                '>',
                '<div class="x-boxselect-item-text">{[typeof values === "string" ? values : this.getItemLabel(values)]}</div>',
                '</li>',
                '</tpl>',
                {
                    compile: true,
                    disableFormats: true,
                    isSelected: function (value) {
                        var i = me.valueStore.findExact(me.valueField, value);
                        if (i >= 0) {
                            return me.selectionModel.isSelected(me.valueStore.getAt(i));
                        }
                        return false;
                    },
                    getItemLabel: function (values) {
                        return me.getTpl('labelTpl').apply(values);
                    }
                }];
        }

        return this.getTpl('multiSelectItemTpl').apply(Ext.Array.pluck(this.valueStore.getRange(), 'data'));
    },



});
