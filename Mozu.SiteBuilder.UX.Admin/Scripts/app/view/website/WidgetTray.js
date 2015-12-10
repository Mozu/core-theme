/**
 * @class Taco.view.website.Tree
 * @author Jimmy Sanford
 */

Ext.define('Taco.view.website.WidgetTray', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.taco-widget-tray',
    itemId: 'taco-widget-tray',
    autoScroll: true,
    requires: [],
    initComponent: function () {
        this.setLoading(true);

        this.mon(this.controller, 'pageload', this.onPageLoad, this);

        this.items = [];
        this.callParent(arguments);
    },
    onPageLoad: function(editor) {
        this.editor = editor;
        this.removeAll(true);
        this.editor.controller().findWidgetTypeDefinitions(this.editor.windowContext, 'widgets', this.buildWidgets.bind(this, 'Content'));
        this.editor.controller().findWidgetTypeDefinitions(this.editor.windowContext, 'layoutWidgets', this.buildWidgets.bind(this, 'Layout'));
        this.setLoading(false);
    },
    buildWidgets: function(title, widgets) {
        var html = '<div id="taco-widget-holder">';

        this.editor.widgetIconDefinitions = this.editor.widgetIconDefinitions || {};

        widgets.forEach(function(cfg, i) {

            html+= ['<div class="mz-cms-widget mz-cms-draggable ui-draggable">',
                        '<div class="mz-cms-icon" style="background-image: url(' + window.location.origin + cfg.icon + ')" id="' + cfg.id + '" type="' + title.toLowerCase() +'">',
                        '</div>',
                        '<div class="mz-cms-label">' + cfg.name + '</div>',
                    '</div>'].join('');
            if (i === widgets.length) html+= '</div>';

            this.editor.widgetIconDefinitions[this.editor.idSanitizer(cfg.id)] = cfg.icon;

        }, this);

        this.panel = {
            xtype: 'panel',
            itemId: 'taco-widget-tray-' + title.toLowerCase(),
            layout: {
                align: 'middle'
            },
            margin: '10 0 0 0',
            hidden: title === 'Layout' ? true : false,
            listeners: {
                scope: this,
                afterlayout: this.makeDraggable
            },
            html: html
        };

        this.insert(this.panel);

        this['widgetTray_' + title.toLowerCase()]  = this.down('#' + 'taco-widget-tray-' + title.toLowerCase());

    },
    makeDraggable: function() {
        Array.prototype.forEach.call(document.querySelectorAll('.mz-cms-icon'), function(wdgt) {
            wdgt.setAttribute('draggable', 'true');
            wdgt.addEventListener('dragstart', this.dragEvents.start.bind(this, wdgt, wdgt.getAttribute('type')), false);
            wdgt.addEventListener('drag', this.dragEvents.drag.bind(this, wdgt.id), false);
            wdgt.addEventListener('drop', this.dragEvents.drop.bind(this, wdgt.id), false);
        }, this);
    },

    showContentWidgets: function(type) {
        if (this.widgetTray_content) this.widgetTray_content[type ? 'show' : 'hide']();
    },

    showLayoutWidgets: function(type) {
        if (this.widgetTray_layout) this.widgetTray_layout[type ? 'show' : 'hide']();
    },

    dragEvents: {
        start: function(cfg, type, e) {
            this.editor.initDragIcon(cfg.style.backgroundImage);
            e.dataTransfer.setDragImage(this.editor.dragIcon, -10, -10);
            e.dataTransfer.setData('text/plain', JSON.stringify({id: cfg.id, type: type}));
        },
        drag: function(cfg, e) {
            this.editor.updateDragIconPosition(e);
            e.preventDefault();
        },
        drop: function(cfg, e) {
            e.preventDefault();
        }
    }
});