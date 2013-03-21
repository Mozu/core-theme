Ext.define('Taco.core.ux.form.FullEditor', {
    extend: 'Taco.core.ux.content.Container',
    mixins: {
        editorwrapper: 'Taco.core.ux.form.EditorWrapper'
    },

    constructor: function (config) {
        this.callParent(arguments);
        this.mixins.editorwrapper.constructor.call(this, config);
    },

    initComponent: function () {

        
         
       
        

        this.initWrapper();

        this.body = {
            layout: 'fit',
            items: [this.form]
        };

        this.header = {
            actions: this.actions,
            title: this.title
        };

        this.callParent(arguments);
    },
   
});