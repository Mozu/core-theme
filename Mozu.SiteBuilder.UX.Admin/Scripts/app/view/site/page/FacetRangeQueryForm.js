/**
 * @class Taco.view.site.page.FacetRangeQueryForm
 */
Ext.define('Taco.view.site.page.FacetRangeQueryForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.view.site.page.FacetRangeQueryGroup'],
    //cls: Taco.baseCSSPrefix + 'rangequeryform',
    xtype: 'taco.rangequeryform',
    header: false,
    hidden: true,
    initComponent: function () {
        var me = this;
        me.displayStyle = Ext.widget('radiogroup', {
            fieldLabel: 'Display Style',
            labelAlign: 'left',
            columns: 2,
            items: [
                {
                    boxLabel: 'Values',
                    name: 'facetType',
                    inputValue: 'Values'
                },
                {
                    boxLabel: 'Range',
                    name: 'facetType',
                    inputValue: 'RangeQuery',
                    checked: true
                }
            ]
        });
        me.numRanges = Ext.widget('selectfield', {
            forceSelection: true,
            fieldLabel: 'Number of ranges',
            labelAlign: 'left',
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
                var args = Array.prototype.slice.call(arguments, 1);
                args.unshift(!v || v < 3 ? 5 : v);
                this.self.prototype.setValue.apply(this, args);
            }
        });
        me.rangeQueries = Ext.widget('taco.rangequerygroup', {
            xtype: 'taco.rangequerygroup',
            name: 'ranges'
        });
        this.items = [
            me.displayStyle,
            me.numRanges,
            me.rangeQueries
        ];
        me.displayStyle.on('change', function (rg, newValue) {
            if (newValue.facetType == "RangeQuery") {
                me.numRanges.show();
                me.rangeQueries.show();
            } else {
                me.numRanges.hide();
                me.rangeQueries.hide();
            }
        });
        me.rangeQueries.relayEvents(me.numRanges, ['select']);
        me.rangeQueries.on('change', function (rqs, nV) {
            console.log('rq change', this, arguments);
            me.numRanges.setValue(nV && nV.length);
            me.savableStateCheck();
        });
        this.callParent(arguments);
        me.loadRecord(me.record);
        //me.displayStyle.fireEvent('change', me.displayStyle, me.displayStyle.getValue());
    }
});