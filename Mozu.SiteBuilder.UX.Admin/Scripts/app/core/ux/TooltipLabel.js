/** 
 * @class Taco.core.ux.TooltipLabel
 * Wrapper/decorator for adding tooltip support to field with fieldLabel or boxLabel.
 * */
Ext.define('Taco.core.ux.TooltipLabel', {
    singleton: true,

    requires: [
        'Ext.Button',
        'Ext.tip.ToolTip',
        'Taco.store.TooltipHelp'
    ],

    constructor: function (config) {
        this.initConfig(config);
    },
    config: {

    },

    /**
    * Wraps field config to add tooltip support with info icon.
    *
    * Params:
    * ========
    * tooltipKey = key in Taco.store.TooltipHelp
    * scope = caller's this reference
    * config = field or fieldcontainer with label or checkbox with boxlabel
    * optId = optional id for cases where the same tooltipkey will be used by multiple components on the same page.
    *
    * Sample:
    * ========
    *   this.scopeTypeInput = Ext.create('Ext.form.field.ComboBox',
    *       Taco.core.ux.TooltipLabel.wrapConfig('discount.general.scope', me, {
    *        name: 'scope',
    *        fieldLabel: "Discount Applies To",
    *        labelAlign: 'top',
    *        ...
    *       })
    *   );
    *
    **/
    wrapConfig: function (tooltipKey, scope, config, optId) {
        var spanId = tooltipKey + optId || '',
            spanLabel = '<span id="' + spanId + '" class="' + Taco.baseCSSPrefix + 'tooltip-help"></span>',
            tooltipStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.TooltipHelp'),
            tipContent,

            attachAfterLabelTpl = function() {
                if (config.boxLabel) {
                    config.afterBoxLabelTextTpl = new Ext.Template(
                        spanLabel, { compiled: true }
                    );
                } else {
                    config.afterLabelTextTpl = new Ext.Template(
                        spanLabel, { compiled: true }
                    );
                }
            },

            tooltipButtonRenderer = function(cmp, opts) {
                var renderLabel = Ext.get(spanId),
                tooltipBtn = Ext.create('Ext.Button', {
                    ui: 'link',
                    cls: Taco.baseCSSPrefix + 'icon-tooltip-help',
                    text: '',
                    handler: function(btn, evt) {
                        onTooltipClick(btn, evt);
                    },
                    itemId: spanId + '.button',
                    tooltip: {
                        text: 'Click for info',
                        cls: Taco.baseCSSPrefix + 'tooltip',
                    },
                    renderTo: renderLabel
                });
            },

            attachRenderer = function(tooltipRenderer) {
                if (!config.listeners) {
                    config.listeners = {};
                }

                if (!config.listeners.render) {
                    config.listeners.render = tooltipRenderer;
                } else if (!config.listeners.afterrender) {
                    config.listeners.afterrender = tooltipRenderer;
                } else {
                    throw 'Tooltip label requires either empty render or afterrender listener.';
                }
            },

            onTooltipClick = function (btn, evt) {
                evt.stopEvent();
                Ext.tip.QuickTipManager.unregister(btn.getEl());
                if (tipContent) {
                    tipContent.destroy();
                    tipContent = null;
                }
                else {
                    tipContent = Ext.create('Ext.tip.ToolTip', {
                        target: btn.getEl(),
                        cls: Taco.baseCSSPrefix + 'tooltip-help-content',
                        html: tooltipStore.findRecord('key', tooltipKey).get('value'),
                        padding: '0',
                        focusOnToFront: true,
                        autoHide: false,
                        closable: false,
                        dockedItems: [{
                            xtype: 'toolbar',
                            dock: 'right',
                            defaultAlign: 't',
                            margin: '0 2 0 0',
                            height: 15,
                            items: [
                                {
                                    xtype: 'button',
                                    text: '',
                                    glyph: 'XE011@mozicons',
                                    overCls: ''
                                }
                            ]
                        }],
                        listeners: {
                            hide: function () {
                                // was being called BEFORE the click event fired a second time, preventing from detecting if the popup existed to close it if the icon was clicked again
                                //tipContent.destroy();
                                //tipContent = null;
                            }
                        }
                    });
                    tipContent.showBy(btn, 'bl-tr?', [0, -5]);
                    scope.mon(Ext.getBody(), 'click', onClickAnywhereCloseTip, this);
                }
            },

            onClickAnywhereCloseTip = function (evt) {
                var target = Ext.fly(evt.target);
                // need to allow the links to the help content to work;
                if (target && target.dom.tagName == "A" && target.hasCls("taco-help-link")) {
                    return;
                }

                scope.mun(Ext.getBody(), 'click', onClickAnywhereCloseTip, this);
                if (!tipContent) {
                    return;
                }
                evt.stopEvent();
                tipContent.destroy();
                tipContent = null;
            };

        attachAfterLabelTpl();
        attachRenderer(tooltipButtonRenderer);
        return config;
    }


});