/**
 * @class Taco.view.location.subform.StoreHours
 */
Ext.define('Taco.view.location.subform.StoreHours', {
    // this is the secret sauce. Your subform panel must extend Taco.core.ux.form.Form in order to participate in the automated saveTasks behavior of the parent form
    extend: 'Taco.core.ux.form.Form',
    // gives the form the correct ux
    ui: 'subform',

    requires: [
        'Ext.form.field.Text'
    ],
    title: 'Hours of Operation',
    //margin: "0 0 20 0",
    tools: null,
    config: {
        record: null,
        itemId: "hours"
    },
    initComponent: function () {
        var me = this,
            hoursData = me.record.get("regularHours");
        
        me.cls = [me.cls, Taco.baseCSSPrefix + 'locationform-storehours'].join(' ');

        //set the default params for the fields defined below
        this.defaults = {
            xtype: "textfield",
            width: '200',
            selectOnFocus:true,
            allowBlank: true
        };
        
        
        me.items = [
            {
                name: "sunday",
                fieldLabel: 'Sunday',
                value: (hoursData.sunday) ? hoursData.sunday.label: ""
            }, {
                name: "monday",
                fieldLabel: 'Monday',
                value: (hoursData.monday) ? hoursData.monday.label: ""
            }, {
                name: "tuesday",
                fieldLabel: 'Tuesday',
                value: (hoursData.tuesday) ? hoursData.tuesday.label: ""
            }, {
                name: "wednesday",
                fieldLabel: 'Wednesday',
                value: (hoursData.wednesday) ? hoursData.wednesday.label: ""
            }, {
                name: "thursday",
                fieldLabel: 'Thursday',
                value: (hoursData.thursday) ? hoursData.thursday.label: ""
            }, {
                name: "friday",
                fieldLabel: 'Friday',
                value: (hoursData.friday) ? hoursData.friday.label : ""
            }, {
                name: "saturday",
                fieldLabel: 'Saturday',
                value: (hoursData.saturday) ? hoursData.saturday.label: ""
            }
        ];
        
        me.callParent(arguments);
    },

    getHours: function () {
        var me=this,
            hours = me.record.get("regularHours");
        
        for (var i = 0; i < me.items.items.length; i++) {
            var field = me.items.items[i];
            // some data in the app is missing some of the days of the week. not sure why. hardening the code to allow for this condition;
            
            if (!hours[field.name] || !hours[field.name].label) {
                //data object missing days of the week; adding them back here to allow for persistance;
                hours[field.name] = { label : "" }
            }
            hours[field.name].label = field.getValue();
        }
        
        // need to manually mark dirty since the setValue with complex data doesn't trigger the dirty state on the model
        me.record.setDirty();

        return hours;
    },
    
    beforeSave: function () {
        var me = this;
        // do any form validation. return false if the form is not valid for save;
        
        // do any manual record updates from the form;
        var hours = me.getHours();
        
        me.record.set("regularHours", hours);
        
        // return true to allow the save to proceed
        return true;
    }
});
