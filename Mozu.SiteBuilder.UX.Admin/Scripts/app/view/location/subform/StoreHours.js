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
        
        
        this.items = [
            {
                name: "hours.sunday",
                fieldLabel: 'Sunday',
                value: hoursData.sunday
            },
            {
                name: "moneday",
                fieldLabel: 'Monday',
                value: hoursData.monday
            }, {
                name: "tuesday",
                fieldLabel: 'Tuesday',
                value: hoursData.tuesday
            }, {
                name: "wednesday",
                fieldLabel: 'Wednesday',
                value: hoursData.wednesday
            }, {
                name: "thursday",
                fieldLabel: 'Thursday',
                value: hoursData.thursday
            }, {
                name: "friday",
                fieldLabel: 'Friday',
                value: hoursData.friday
            }, {
                name: "saturday",
                fieldLabel: 'Saturday',
                value: hoursData.saturday
            }
        
        ];

        
        this.callParent(arguments);
    }
});
