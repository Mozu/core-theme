/**
 * @class Taco.view.site.page.FacetRangeQueryForm
 */
Ext.define('Taco.view.site.page.FacetRangeQueryForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.view.site.page.FacetRangeQueryGroup'],
    xtype: 'taco.rangequeryform',
    header: false,
    hidden: true,
    items: [
        {
            xtype: 'radiogroup',
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
        },
        {
            xtype: 'selectfield',
            fieldLabel: 'Number of ranges',
            labelAlign: 'left',
            store: [
                3,
                4,
                5,
                6,
                7
            ],
            value: 5,
            itemId: 'numRanges'
        },
        {
            xtype: 'taco.rangequerygroup',
            itemId: 'rangeQueries'
        }
    ],
    initComponent: function () {
        this.callParent(arguments);
        var numRanges = this.down('#numRanges'),
            rangeQueries = this.down('#rangeQueries');
        rangeQueries.relayEvents(numRanges, ['select']);
        rangeQueries.fireEvent('select', numRanges);
    }
});