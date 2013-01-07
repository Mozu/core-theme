Ext.define('Chalupa.Core', {
    singleton: true,
    constructor:function () {
        this.callParent(arguments);
    },
    showViewPort:function ()
    {
        Taco.app.initViewPort();
    }
});