/**
 * @class Taco.view.site.page.FacetEditForm
 */
Ext.define('Taco.view.website.settings.facets.FacetEditForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.view.website.settings.facets.FacetRangeQueryGroup'],
    //cls: Taco.baseCSSPrefix + 'rangeeditform',
    alias: 'taco.rangeeditform',

    header: false,
    hidden: true,
    manageHeight: true,
    padding: '0 4',
    trackResetOnLoad: true,

    initComponent: function () {
        var me = this;

        me.inheritedVisible = Ext.widget({
            xtype: 'radio',
            name: 'isInheritedHidden',
            persistSelectedValueOnly: true,
            boxLabel: 'Show',
            inputValue: false,
            flex: 1,
            //disabled: me.record.isInherited(),
            checked: !me.record.get('isInheritedHidden')
        });

        me.inheritedHide = Ext.widget({
            xtype: 'radio',
            name: 'isInheritedHidden',
            persistSelectedValueOnly: true,
            boxLabel: 'Hide',
            inputValue: true,
            flex: 1,
            //disabled: this.record.isInherited(),
            checked: me.record.get('isInheritedHidden') === true
        });

        me.valueDisplayStyle = Ext.widget({
            xtype: 'radio',
            name: 'facetType',
            persistSelectedValueOnly: true,
            boxLabel: 'Values',
            inputValue: 'Value',
            flex: 1,
            disabled: this.record.isInherited(),
            checked: this.record.get('facetType') === 'Value'
        });

        me.rangeDisplayStyle = Ext.widget({
            xtype: 'radio',
            name: 'facetType',
            persistSelectedValueOnly: true,
            boxLabel: 'Range',
            inputValue: 'RangeQuery',
            flex: 1,
            disabled: this.record.isInherited(),
            checked: this.record.get('facetType') !== 'Value',
            listeners: {
                change: function (rg, newValue) {
                    me.displayRangeQueryFields(newValue);
                }
            }
        });

        me.numRanges = Ext.widget('selectfield', {
            forceSelection: true,
            height: 50,
            fieldLabel: 'Number of ranges',
            labelAlign: 'top',
            labelStyle: 'padding-top: 5px;',
            hidden: true,
            disabled: this.record.isInherited(),
            // isDirty: function() {
            //     return false;
            // },
            store: [
                3,
                4,
                5,
                6,
                7
            ],
            width: 160,
            value: 5,
            setValue: function (v) {
                
                if (Object.prototype.toString.call(v) === '[object Array]' || Number(v)) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    args.unshift(!v || v < 3 ? 5 : v);
                    this.self.prototype.setValue.apply(this, args);
                }
                
            }
        });

        me.rangeQueries = Ext.widget('taco.rangequerygroup', {
            xtype: 'taco.rangequerygroup',
            name: 'ranges',
            hidden: true,
            disabled: this.record.isInherited(),
            listeners: {
                show: {
                    scope: this,
                    fn: function () {
                        this.fireEvent('facetchange');
                    }
                },
                afterlayout: {
                    scope: this,
                    fn: function () {
                        this.fireEvent('facetchange');
                    }
                }
            }
        });

        me.valueSort = Ext.widget('combobox', {
            xtype: 'combobox',
            name: 'valueSortType',
            fieldLabel: 'Facet Order',
            width: 240,
            valueField: 'id',
            displayField: 'name',
            queryMode: 'local',
            valueNotFoundText: 'not found',
            editable: false,
            forceSelection: true,
            hidden: (me.record.get('facetType') === 'RangeQuery'),
            store: me.record.getFacetSortingStore()
        });

        this.items = [{
                xtype: 'fieldcontainer',
                fieldLabel: 'Inherited Display',
                labelAlign: 'top',
                labelStyle: 'padding-top: 5px;',
                layout: 'hbox',
                defaults: {
                    layout: '50%'
                },
                hidden: !me.record.isInherited(),
                items: [me.inheritedVisible, me.inheritedHide]
            },{
                xtype: 'fieldcontainer',
                fieldLabel: 'Display Style',
                labelAlign: 'top',
                labelStyle: 'padding-top: 5px;',
                layout: 'hbox',
                defaults: {
                    layout: '50%'
                },
                hidden: !me.record.get('allowsRangeQuery'),
                items: [me.valueDisplayStyle, me.rangeDisplayStyle]
            },
            //me.displayStyle,
            me.numRanges,
            me.rangeQueries,
            me.valueSort
        ];

        me.rangeQueries.relayEvents(me.numRanges, ['select']);

        me.rangeQueries.on({
            change: function (rqs, nV) {
                me.numRanges.setValue(nV && Ext.isArray(nV) && nV.length);
            }
        });

        this.callParent(arguments);

        me.loadRecord(me.record);
        // me.resetSavableState();

        if (me.record.get('facetType') === 'RangeQuery') {
            me.displayRangeQueryFields(true);
        }

        if (!me.record.get('isInheritedHidden')) {
            me.inheritedVisible.setValue(true);
        } else {
            me.inheritedHide.setValue(true);
        }

        //me.inheritedVisible.setValue(!me.record.get('isInheritedHidden'));

    },

    displayRangeQueryFields: function(yes) {
        if (yes) {
            this.numRanges.show();
            this.rangeQueries.show();
            if (this.cachedRangeQueries) {
                this.rangeQueries.setValue(this.cachedRangeQueries);
                delete this.cachedRangeQueries;
            }
            this.valueSort.hide();
            this.valueSort.setValue(null);
        } else {
            this.numRanges.hide();
            this.rangeQueries.hide();
            this.cachedRangeQueries = this.rangeQueries.getValue();
            this.rangeQueries.setValue([]);
            this.valueSort.setValue('CountDescending');
            this.valueSort.show();
        }
        this.fireEvent('heightchange');
    }
});