Ext.define('Taco.view.productType.AttributeForm', {
    extend: 'Taco.core.ux.form.Form',
    xtype: 'widget.taco.producttype.attributeform',
    requires: ['Taco.core.ux.form.FlexBox'],
    ignoreParentFormTracking: true,

    layout: 'formflexbox',

    initComponent: function () {
        this.attributeStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.Attributes', {
            remoteFilter: false
        });
        // TODO: This is bad, the config above should work but doesn't. Tell Thom
        this.attributeStore.remoteFilter = false;
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