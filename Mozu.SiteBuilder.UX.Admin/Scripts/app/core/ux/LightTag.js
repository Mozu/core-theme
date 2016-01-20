
Ext.define('Taco.core.ux.LightTag', {
    extend: 'Ext.Component',
    alias: 'widget.taco.lighttag',

    tpl: '<div class="taco-light-tag">{text}</div>',

    cls: '',

    text: '',

    initComponent: function () {

        this.data = {
            text: this.text
        };

        this.callParent(arguments);
    }

});