Ext.define('Taco.core.context.Site', {
    //extend: 'Ext.util.Observable',
    id: -1,
    name:'',
    stagingHost: '',
    defaultHost: '',
    siteCollection: null
    ,
    constructor: function (config) {
        var me = this;
        config = Ext.apply({}, config);
        Ext.apply(me, config);
        me.callParent([config]);
    }

});