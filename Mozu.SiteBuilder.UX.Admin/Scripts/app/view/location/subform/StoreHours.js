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
            hoursData = me.record.get("hours");
        
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
                value: hoursData.sunday.label
            }, {
                name: "moneday",
                fieldLabel: 'Monday',
                value: hoursData.monday.label
            }, {
                name: "tuesday",
                fieldLabel: 'Tuesday',
                value: hoursData.tuesday.label
            }, {
                name: "wednesday",
                fieldLabel: 'Wednesday',
                value: hoursData.wednesday.label
            }, {
                name: "thursday",
                fieldLabel: 'Thursday',
                value: hoursData.thursday.label
            }, {
                name: "friday",
                fieldLabel: 'Friday',
                value: hoursData.friday.label
            }, {
                name: "saturday",
                fieldLabel: 'Saturday',
                value: hoursData.saturday.label
            }
        ];
        
        me.callParent(arguments);
    },

    getHours : function() {
        return this.getForm().getFieldValues();
    },

    // this is optional. Do some additional save tasks after the automatic update-record task executes. This allows you to extract complext data from the form and write it to the record
    addSaveTasks: function (tasks) {
        var me = this;
        console.log("subForm level save task ")
        tasks.add({
            // the name of your task
            key: 'update-storeHours',
            // the name of the task you want to follow
            dependencies: this.tasksKeyPrefix + "update-record",
            // executes when the task exectutes
            fn: function () {
                // manually update the record
                var hours = me.getHours();
                me.record.set("hours", hours);
            }
        });
        return tasks;
    }
});
