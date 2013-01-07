/**
 * @author Travis Johnson
 * @class Taco.core.ux.Hint
 */

    Ext.define('Taco.core.ux.Hint', {
        extend: 'Ext.container.Container',
        alias: 'widget.hint',
        componentCls: 'taco-hint',
        width: 300,
        target: null,
        autoShow: true,
        alignment: 'tl-tr',
        shadow: false,
        offset: [0, 0],

        mixins: {
            floating: 'Ext.util.Floating'
        },
        items: [],

        floating: true,

        initComponent: function() {
            var fnAlign;
            
            if (this.itemTpl) {
                this.items.push({
                    xtype: 'component',
                    tpl: this.itemTpl,
                    data: this.itemData
                });
            }
            
            this.ignoreLayoutUpdates = -1;

            this.callParent(arguments);
            
            fnAlign = function () {
                this.alignToTarget();
            };
            
            this.on({
                afterlayout:{ 
                    fn: fnAlign,
                    scope: this
                },
                afterrender: {
                    fn: fnAlign,
                    scope: this
                }
            });
        },
        
        updateTarget: function(config) {
            if (!config.items) {
                config.items = []
            }
            
            if (config.itemTpl) {   
                config.items.push({
                    xtype: 'component',
                    tpl: config.itemTpl,
                    data: config.itemData
                });
            }
            this.alignToTarget(config.target, true, config.items);
        },

        alignToTarget: function(target, animate, items) {
            if (this.isHidden()) {
                return;
            }

            if (target) {
                this.target = target;
            }
            if (!this.target) {
                Ext.Error.raise({
                    msg: 'No target set. Need target for Hint alignment'
                });
            }

            if (this.target.isComponent) {
                return this.alignToComponent(this.target, animate, items);
            } else {
                return this.alignToElement(this.target, animate, items);
            }
        },

        alignToComponent: function(component, animate, items) {
            var el = component.getEl();

            if (!el) {
                Ext.Error.raise({
                    msg: 'Hint cannot be aligned to component because the component is not yet rendered'
                });
            }

            this.alignToElement(el, animate, items);
        },

        alignToElement: function(el, animate, items) {
          
            if (!el.dom) {
                Ext.Error.raise({
                    msg: 'Not a valid Ext.Element object'
                });
            }
            
            if (!this.incompleteAnimation) {
                this.oldPosition = this.getPosition();
                this.oldSize = this.getSize();
            }

            this.getEl().alignTo(el, this.alignment, this.offset);

            if (animate) {
                this.finishAnimation(el, items);
            }
        },

        finishAnimation: function(el, items) {
            var newSize, newPosition;
            
            this.incompleteAnimation = true;

            if (items) {
                //this.update(html);
                //this.ignoreLayoutUpdates = 3;
                this.update('');
                this.removeAll(true);
                this.add(items);
            }

            newPosition = this.getPosition();
            //newSize = this.getSize();

            this.setPosition(this.oldPosition);
            //this.setSize(this.oldSize.width, this.oldSize.height);

            this.getEl().animate({
                to: {
                    x: newPosition[0],
                    y: newPosition[1]
                },
                duration: 300
            });
            
            this.incompleteAnimation = false;
        },

        show: function() {
            this.callParent(arguments);

            this.alignToTarget();
        }

    });
