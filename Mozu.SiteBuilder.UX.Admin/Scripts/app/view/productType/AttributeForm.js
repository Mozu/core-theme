Ext.define('Taco.view.productType.AttributeForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco.producttype.attributeform',
    requires: ['Taco.store.Attributes'],
    flexLayout: true,

    ignoreParentFormTracking: true,

    initComponent: function () {
        this.attributeStore = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.Attributes',
            remoteFilter: false
        });
        
        this.attributeStore.load();

        this.callParent(arguments);
    },

    create: function () {
        this.addAttributes();
    },

    edit: function (attribute) {
        this.addAttributes(attribute);
    }
});