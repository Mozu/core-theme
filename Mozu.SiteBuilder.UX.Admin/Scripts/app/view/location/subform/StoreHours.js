/**
 * @class Taco.view.location.subform.StoreHours
 */
Ext.define('Taco.view.location.subform.StoreHours', {    
    extend: 'Taco.core.ux.EditContainer',
    requires: [
    
    ],
    
    title: 'Hours of Operation',

    margin: "0 0 20 0",

    width: '100%',

    tools: null,

    config: {
        record: null,
        itemId:"hours"
    },
    
    initComponent: function (eOpts) {
        var me = this;

        this.cls = [this.cls, Taco.baseCSSPrefix + 'locationform-storehours'].join(' ');
        
        this.defaults = {
            xtype: "textfield",
            width: '200',
            allowBlank: true
        };

        var hoursData = this.record.get("hours");
        
        // note we are only using the openTime member for each day.
        // this weill end up getting refactored to allow for more complex data structures.
        this.items = [
            {
                name: "sunday",
                fieldLabel: 'Sunday',
                value: hoursData.sunday.openTime
            },
            {
                name: "moneday",
                fieldLabel: 'Monday',
                value: hoursData.monday.openTime
            }, {
                name: "tuesday",
                fieldLabel: 'Tuesday',
                value: hoursData.tuesday.openTime
            }, {
                name: "wednesday",
                fieldLabel: 'Wednesday',
                value: hoursData.wednesday.openTime
            }, {
                name: "thursday",
                fieldLabel: 'Thursday',
                value: hoursData.thursday.openTime
            }, {
                name: "friday",
                fieldLabel: 'Friday',
                value: hoursData.friday.openTime
            }, {
                name: "saturday",
                fieldLabel: 'Saturday',
                value: hoursData.saturday.openTime
            }
        ];

        
        this.callParent(arguments);
    }
});
