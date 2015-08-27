/**
 * @class Taco.core.ux.form.field.MultiSelect
 * @author Jimmy Sanford
 * Extends Ext.ux.form.MultiSelect.
 */
Ext.define('Taco.core.ux.form.field.PageTemplate', {
    extend: 'Taco.core.ux.form.SelectField',
    alias: [
        'widget.taco.field.pagetemplate',
        'widget.taco-field-pagetypes'
    ],
    requires: ['Taco.store.PageTypeDefinitions', 'Taco.model.PageTypeDefinition'],
    queryMode: 'local',
    displayField: 'title',
    valueField: 'id',
    forceSelection: true,
    allowBlank:true,
    growToLongestValue:true,
    initComponent: function () {
        
        this.store = Taco.core.data.StoreManager.getOrCreate('Taco.store.PageTypeDefinitions');
        this.store.clearFilter(true);
        if (this.entityType) {
            this.store.filter({ property: "entityType", value: this.entityType, root: 'data' });
        }
        this.callParent(arguments);
    },
    setValue:function() {
        this.callParent(arguments);
    }

   
});