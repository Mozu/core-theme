/**
 * @class Taco.core.ux.form.field.MultiSelect
 * @author Jimmy Sanford
 * Extends Ext.ux.form.MultiSelect.
 */
Ext.define('Taco.core.ux.form.field.PageTemplate', {
    extend: 'Taco.core.ux.form.SelectField',
    alias: 'widget.taco.field.pagetemplate',
    requires: ['Taco.store.PageTypeDefinitions', 'Taco.model.PageTypeDefinition'],
    queryMode: 'local',
    displayField: 'displayName',
    valueField: 'id',
    forceSelection: true,
    growToLongestValue:true,
    initComponent: function () {
        
        this.store = Taco.core.data.StoreManager.getOrCreate('Taco.store.PageTypeDefinitions');
        this.store.clearFilter(true);
        if (this.entityType) {
            this.store.filter({ property: "entityType", value: this.entityType, root: 'data' });
        }
        this.callParent(arguments);
    }

   
});