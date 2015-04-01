/** 
 * @class Taco.core.ux.TooltipLabel
 * wrapper/decorator for adding tooltip support to field with fieldLabel or boxLabel.
 * */
Ext.define('Taco.core.ux.TooltipLabel', {
    singleton: true,

    //requires: [
    //    'Ext.Button',
    //    'Ext.tip.ToolTip',
    //    'Taco.store.TooltipHelp'
    //],

    constructor: function (config) {
        this.initConfig(config);
    },
    config: {
        test:false
    },

    wrapConfig: function (tooltipKey, scope, config) {
        var spanLabel = '<span id="' + tooltipKey + '" class="' + Taco.baseCSSPrefix + 'tooltip-help"></span>',
            tipContent,
            tooltipStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.TooltipHelp'),

            onClickAnywhereCloseTip = function (evt) {
                scope.mun(Ext.getBody(), 'click', onClickAnywhereCloseTip, this);
                if (!tipContent) {
                    return;
                }
                evt.stopEvent();
                tipContent.destroy();
                tipContent = null;
            },

            onTooltipClick = function (btn, evt) {
                if (!tipContent) {
                    tipContent = Ext.create('Ext.tip.ToolTip', {
                        target: btn.getEl(),
                        cls: Taco.baseCSSPrefix + 'tooltip-help-content',
                        html: tooltipStore.findRecord('key', tooltipKey).get('value'),
                        focusOnToFront: true,
                        autoHide: false,
                        closable: true,
                        listeners: {
                            hide: function () {
                                tipContent.destroy();
                                tipContent = null;
                            }
                        }
                    });
                }
                evt.stopEvent();
                tipContent.showBy(btn);
                scope.mon(Ext.getBody(), 'click', onClickAnywhereCloseTip, this);
            },

            tooltipRenderer = function (cmp, opts) {
                var renderLabel = Ext.get(tooltipKey),
                    tooltipBtn = Ext.create('Ext.Button', {
                        ui: 'link',
                        cls: Taco.baseCSSPrefix + 'icon-tooltip-help',
                        text: '',
                        handler: function (btn, evt) {
                            onTooltipClick(btn, evt);
                        },
                        itemId: tooltipKey + '.button',
                        tooltip: {
                            text: 'Click for info',
                            cls: Taco.baseCSSPrefix + 'tooltip',
                        },
                        renderTo: renderLabel
                    });
            };

        if (config.boxLabel) {
            config.afterBoxLabelTextTpl = new Ext.Template(
                spanLabel, { compiled: true }
            );
        } else {
            config.afterLabelTextTpl = new Ext.Template(
                spanLabel, { compiled: true }
            );
        }

        if (!config.listeners) {
            config.listeners = {};
        }
        
        if (!config.listeners.render) {
            config.listeners.render = tooltipRenderer;
        } else if (!config.listeners.afterrender) {
            config.listeners.afterrender = tooltipRenderer;
        } else {
            throw new Error('Tooltip label requires empty render or afterrender listener.');
        }

        return config;
    }


});