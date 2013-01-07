Ext.define('Taco.core.ux.form.EditorLayout', {

    actions: null,
    form: null,
    title: '',

    type: 'page',

    constructor: function (config) {

        if (!(this.actions instanceof Array)) {
            this.actions = [];
        }
    }
});