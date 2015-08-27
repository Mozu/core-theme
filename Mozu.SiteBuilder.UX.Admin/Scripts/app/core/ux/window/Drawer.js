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

    constrain: false,

    minHeight: 600,
    minWidth: 800,
    y: 0,

    bodyPadding: '11 20 0',
    scale: 'large',

    layout: {
        type: 'card'
    },

    resizable: {
        dynamic: true,
        handles: 'sw s se',
        heightIncrement: 1,
        minHeight: 600,
        minWidth: 800,
        preserveRatio: true,
        widthIncrement: 1
    },

    constructor: function (config) {
        this.cls = 'taco-drawer ' + this.cls;
        this.callParent(arguments);
    },

    initComponent: function () {
        if (!Ext.isEmpty(this.resizable)) {
            this.constrainResizer();
        }

        this.callParent(arguments);

        this.on({
            boxready: {
                scope: this,
                fn: 'attachResizerListeners'
            }
        });
    },

    attachResizerListeners: function () {
        this.mon(this.resizer, {
            resize: {
                scope: this,
                fn: 'handleResize'
            },
            resizedrag: {
                scope: this,
                fn: 'handleResize'
            }
        });
    },

    constrainResizer: function () {
        var cfg = {},
            region = Ext.getBody().getRegion().adjust(0, 0, -100, 0);

        Ext.apply(cfg, this.resizable, {
            constrainTo: region
        });

        this.resizable = cfg;
    },

    handleResize: function (resizer, width, height, e) {
        var region = Ext.getBody().getRegion(),
            nextLeft = Math.floor((region.right - width) * 0.5);

        this.setX(nextLeft, false);
    },

    onDestroy: function () {
        this.mun(this.resizer, {
            resizedrag: {
                scope: this,
                fn: 'handleResize'
            }
        });

        this.callParent(arguments);
    }
});
