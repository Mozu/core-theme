/**
 * @class Taco.view.publishing.Search.AdvancedSearchForm
 */
 
Ext.define('Taco.view.entityManager.AdvancedSearchForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Ext.form.FieldContainer'
    ],
    defaults: {
        width: 500,
        xtype: 'textfield'
    },
    initComponent: function () {
        this.items = this.buildForm();
        this.callParent(arguments);

        console.log(this);
    },

    buildForm: function(type) {
        var fields = {
            name: {
                name: 'name',
                fieldLabel: 'Name',
                valueField: 'name',
                displayField: 'name'
            }
        };

        return [fields.name];
    }
});