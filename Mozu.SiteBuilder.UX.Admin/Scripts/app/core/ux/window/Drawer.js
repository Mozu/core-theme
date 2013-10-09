/**
 * @class Taco.core.ux.window.Drawer
 * @author Jimmy Sanford
 *
 * The base class for a drawer-style dialog window.
 * 
 * Drawers are used when a modal dialog includes an oversized view or complex workflow.
 *
 * This class extends the base class for modal dialogs, {@link Taco.core.ux.window.Modal}.
 */

Ext.define('Taco.core.ux.window.Drawer', {
    extend: 'Taco.core.ux.window.Modal',
    alias: 'widget.taco-drawer',

    /**
     * @cfg {Ext.util.MixedCollection} selected
     * The collection of selected records.
     */
    selected: null,

    constrain: false,

    y: 0,

    bodyPadding: '11 20 0',
    scale: 'large',

    constructor: function (config) {
        config.cls = ['taco-drawer', config.cls].join(' ');

        this.callParent([config]);
    },

    initComponent: function () {
        this.callParent(arguments);
    },

    // onHide: function () {
    //     var me = this;

    //     this.animate({
    //         duration: 1000,
    //         easing: 'ease',
    //         to: {
    //             y: -600
    //         },
    //         scope: this,
    //         callback: function () { console.log('anim complete'); }
    //     });
    // },

    // onShow: function () {
    //     this.callParent(arguments);

    //     this.animate({
    //         duration: 400,
    //         easing: 'ease',
    //         to: {
    //             y: 0
    //         }
    //     });
    // },

    /**
     * @cfg primaryHandler
     * The function to execute when the primary action is clicked.
     */
    primaryHandler: function () {
        if (this.fireEvent('beforesave', this) !== false) {
            this.fireEvent('select', this, this.selected);
            this.close();
            this.fireEvent('save', this);
        }
    }
});
