/**
 * @class Taco.view.site.page.FacetRangeQueryForm
 */
Ext.define('Taco.view.website.settings.facets.FacetRangeQueryForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.view.website.settings.facets.FacetRangeQueryGroup'],
    //cls: Taco.baseCSSPrefix + 'rangequeryform',
    alias: 'taco.rangequeryform',

    header: false,
    hidden: true,
    manageHeight: true,
    padding: '0 4',
    trackResetOnLoad: true,

    initComponent: function () {
        var me = this;

        me.displayStyle = Ext.widget('radiogroup', {
            fieldLabel: 'Display Style',
            labelAlign: 'top',
            labelStyle: 'padding-top: 5px;',
            columns: 2,
            height: 50,
            items: [{
                boxLabel: 'Values',
                name: 'facetType',
                inputValue: 'Value'
            }, {
                boxLabel: 'Range',
                name: 'facetType',
                inputValue: 'RangeQuery'
            }]
        });

        me.numRanges = Ext.widget('selectfield', {
            forceSelection: true,
            height: 50,
            fieldLabel: 'Number of ranges',
            labelAlign: 'top',
            labelStyle: 'padding-top: 5px;',
            hidden: true,
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

        this.items = [
            me.displayStyle,
            me.numRanges,
            me.rangeQueries
        ];

        me.displayStyle.on('change', function (rg, newValue) {
            me.displayRangeQueryFields(newValue.facetType !== "Value");
        });

        me.rangeQueries.relayEvents(me.numRanges, ['select']);

        me.rangeQueries.on({
            change: function (rqs, nV) {
                me.numRanges.setValue(nV && Ext.isArray(nV) && nV.length);
            }
        });

        this.callParent(arguments);

        me.loadRecord(me.record);
        // me.resetSavableState();

        var displayStyleValue = me.displayStyle.getValue();

        if (!displayStyleValue || !displayStyleValue.facetType) {
            // the radiogroup appears to not be super amazing at keeping only one radio selected at a time
            // TODO: find a better way of getting a default value into a radiogroup
            me.displayStyle.setValue('RangeQuery');
        } else {
            me.displayRangeQueryFields(displayStyleValue.facetType !== "Value");
        }
    },

    displayRangeQueryFields: function(yes) {
        if (yes) {
            this.numRanges.show();
            this.rangeQueries.show();
            if (this.cachedRangeQueries) {
                this.rangeQueries.setValue(this.cachedRangeQueries);
                delete this.cachedRangeQueries;
            }
        } else {
            this.numRanges.hide();
            this.rangeQueries.hide();
            this.cachedRangeQueries = this.rangeQueries.getValue();
            this.rangeQueries.setValue([]);
        }
        this.fireEvent('heightchange');
    }
});