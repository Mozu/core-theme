/**
 * @class Taco.view.site.page.hint.Hint
 * This mixin enables classes to manage child Hints that are common 
 */
Ext.define('Taco.view.site.page.hint.Hint', {
    extend: 'Ext.container.Container',
    associatedEl: null,
    type: null,
    hintCls: null,
    activeCls: 'taco-hint-active',
    inactiveCls: 'taco-hint-inactive',
    
    statics: {
        /**
         * Determines the type of hint that is required
         * @param {Ext.dom.Element} associatedEl
         * @return {String} Hint Type
         * @static
         */
        determineType: function (associatedEl) {
            if (associatedEl.is('[data-editing-element]')) {
                return 'element';
            }
            if (associatedEl.is('[data-editing-widget]')) {
                return 'widget';
            }
            if (associatedEl.is('[data-editing-zone]')) {
                return 'zone';
            }
        },
        
        /**
         * Creates the appropriate Hint Type based on the node
         * data of the associated iframe element,
         * @param {Object} nodeData
         * @param {Taco.view.site.page.Shim} shim The shim where the Hint resides
         * @return {Taco.view.site.page.hint.Hint} New hint instance
         * @static
         */
        createHint: function (nodeData, shim) {
            var type = this.determineType(nodeData.node),
                hintCls = 'Taco.view.site.page.hint.' + type.charAt(0).toUpperCase() + type.slice(1);
            
            return Ext.create(hintCls, {
                nodeData: nodeData,
                shim: shim
            });
        }
    },
    
    initComponent: function () {
        this.associatedEl = this.nodeData.node;
        
        this.callParent(arguments);
        
        this.addEvents(
            /**
             * @event
             * Fired when the hint is activated.
             * @param {Taco.view.site.page.hint.Hint} this 
             */
            'activate',
            /**
             * @event
             * Fired when the hint is deactivated.
             * @param {Taco.view.site.page.hint.Hint} this 
             */
            'deactivate'
        );
        
        this.hints = Ext.create('Ext.container.Container', {
            cls: 'taco-hints-subcontainer'
        });
        this.add(this.hints);
        
        if (this.nodeData.branches) {
            Ext.each(this.nodeData.branches, function (branch) {
                this.hints.add(Taco.view.site.page.hint.Hint.createHint(branch, this.shim));
            }, this);
        }
        
        this.associatedEl.on('mouseenter', function () {
            this.shim.show();
        }, this);

        this.on({
            afterrender: {
                fn: function () {
                    this.getEl().addCls(this.hintCls);
                }
            },
            mouseleave: {
                fn: function () {
                    this.shim.hide(this);
                },
                scope: this,
                element: 'el'
            },
            mouseenter: {
                fn: function () {
                    this.shim.show(this);
                },
                scope: this,
                element: 'el'
            }
        });
        
    },
    
    /**
     * Aligns the hint to it's associated element within the IFrame
     * @param {Number} [offsetX]
     * @param {Number} [offsetY]
     * @param {Number} [extraWidth]
     * @param {Number} [extraHeight]
     * @param {Number} [widgetOffsetX]
     * @param {Number} [widgetOffsetY]
     */
    alignToEl: function (offsetX, offsetY, extraWidth, extraHeight, widgetOffsetX, widgetOffsetY) {
        var box = this.associatedEl.getBox(),
            width = box.width + (extraWidth || 0),
            height = box.height + (extraHeight || 0),
            x = box.x + 0 - (offsetX || 0),
            y = box.y - 1 - (offsetY || 0);
            
        this.getEl().setStyle({
            width: width + 'px',
            height: height + 'px',
            top: y + 'px',
            left: x + 'px'
        });

        this.hints.items.each(function (item) {
            item.alignToEl(
                x + (offsetX || 0) - (widgetOffsetX || 0),
                y + (offsetY || 0) - (widgetOffsetY || 0)
            );
        });
    },
    
    /**
     *  Prevents hints from deactivating when the mouseleaves the hint 
     */
    ignoreMouseleave: function () {
        this.ignoreDeactivate = true;
    },
    
    /**
     * Turns the hint on, making it visible. Fires the activate event.
     */
    activate: function () {
        this.removeCls(this.inactiveCls).addCls(this.activeCls);
        this.fireEvent('activate', this);
    },
    
    /**
     * Turns the hint off, making it disappear. Fires the deactivate event.
     */
    deactivate: function (force) {
        if (this.ignoreDeactivate && force !== true) {
            return;
        }
        this.removeCls(this.activeCls).addCls(this.inactiveCls);
        this.fireEvent('deactivate', this);
    },
    
    /**
     * Determines whether or not the hint is currently active
     * @return {Boolean} Active state 
     */
    isActive: function () {
        return this.hasCls(this.activeCls);
    }
});
