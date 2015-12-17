Ext.define('Taco.core.ux.PrevNextArrowButtons', {
    extend: 'Ext.Component',
    alias: 'widget.taco.prevnext',

    cls: 'taco-prev-next-arrows',

    initComponent: function () {

        this.tpl = '<div class="arrow prev">P</div><div class="arrow next">N</div>';

        this.data = {};

        this.addEvents('')
        this.html = 'howdy';
        this.callParent(arguments);
    }
});