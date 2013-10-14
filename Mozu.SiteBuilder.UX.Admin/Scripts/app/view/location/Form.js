/**
 * @class Taco.view.location.Form
 */
Ext.define('Taco.view.location.Form', {
    extend: 'Taco.core.ux.form.NavForm2',

    topOffset: 38,

    requires: [
        'Taco.view.location.subform.Location',
        'Taco.view.location.subform.StoreHours'
    ],

    model: 'Taco.model.Location',

    config: {
        customer: null
    },

    editTitle: [
        'Order No. {number}',
        '<span class="taco-order-status {status}">',
            '{status}',
        '</span>'
    ],

    createTitle: [
        'Create Order No. {number}',
        '<span class="taco-order-status">',
            '{status}',
        '</span>'
    ],

    initComponent: function () {
        var me = this;

        this.buildForm();
        
        this.callParent(arguments);
        
        this.loadNavItems();
        

        // need to load the record again since the navForm2 clears the items and adds the content after the loadRecord is called
        //this.loadRecord(this.record);
    },
    
    

    buildForm: function () {
        
        var subformCfg = {
                record: this.record,
                orderForm: this
            },
            items = [];
        
        items.push(Ext.create('Taco.view.location.subform.Location', subformCfg));
        items.push(Ext.create('Taco.view.location.subform.StoreHours', subformCfg));
        // this loads the subform panels and hooks up the link nav on the left;

        this.items = items;

        
    },
    
    addSaveTasks: function(tasks) {
        var me = this;

        tasks.add({ 
            key: 'submitorder',
            fn: function () {
                
                return
                Ext.Ajax.request({
                    url: '/admin/app/location/edit',
                    method: 'POST',
                    jsonData: {

                    },
                    success: function() {
                        //alert("Your location was created! Yay! You should probably close this window now.");
                       // debugger
                        // tasks.callback();
                    },
                    failure: function () {
                      //  debugger
                        tasks.callback(true);
                    }
                });
            }
        });
        return tasks;
    }
})
