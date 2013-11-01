Ext.define('Taco.overrides.panel.Header', {
    override: 'Ext.panel.Header'

    // onRender: function () {
    //     this.callParent(arguments);

    //     if (this.titleCmp && this.titleCmp.isComponent) {
    //         this.titleCmp.flex = 0;

    //         this.move(this.titleCmp, this.titlePosition);

    //         Ext.defer(function (isRendered) {
    //             if (isRendered) {
    //                 this.doComponentLayout();
    //             }
    //         }, 100, this, [this.rendered]);
    //     }
    // }
});
