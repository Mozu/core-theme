/**
 * @class Taco.view.website.Tree
 * @author Jimmy Sanford
 */

//@ sourceURL=widgettray.js

Ext.define('Taco.view.website.WidgetTray', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.taco-widget-tray',
    itemId: 'taco-widget-tray',
    cls: 'taco-widget-tray',
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

        var dragEvents = this.editor.getBrowserDragEvents();

        Array.prototype.forEach.call(document.querySelectorAll('.mz-cms-icon'), function(wdgt) {
            wdgt.setAttribute('draggable', 'true');
            wdgt.addEventListener(dragEvents.dragStart, this.dragEvents.start.bind(this, wdgt, wdgt.getAttribute('type')), false);
            wdgt.addEventListener(dragEvents.drag, this.dragEvents.drag.bind(this, wdgt.id), false);
            wdgt.addEventListener(dragEvents.drop, this.dragEvents.drop.bind(this, wdgt.id), false);
            wdgt.addEventListener(dragEvents.dragEnd, this.dragEvents.dragEnd.bind(this, wdgt.id), false);
        }, this);
    },

    isInternetExplorer: function() {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");

        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
            return true;
        }
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

            if (e.dataTransfer.setDragImage) {
                e.dataTransfer.setDragImage(this.editor.dragIcon, -10, -10);
                e.dataTransfer.setData('Text', JSON.stringify({id: cfg.id, type: type}));
            }

            else {
                this.editor.widgetData = JSON.stringify({id: cfg.id, type: type});
                e.dataTransfer.setData('Text', JSON.stringify({id: cfg.id, type: type}));
            }
            
        },
        drag: function(cfg, e) {
            if (e.dataTransfer.setDragImage) {
                this.editor.updateDragIconPosition(e);
            }

            // e.preventDefault(); ie breaks if you prevent default
        },
        drop: function(cfg, e) {
            e.preventDefault();
        },
        dragEnd: function(cfg, e) {
            e.preventDefault();
        }
    }
});