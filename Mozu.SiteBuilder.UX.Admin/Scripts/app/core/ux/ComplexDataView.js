/**
 * @author Travis Johnson
 *
 */

    Ext.define('Taco.core.ux.ComplexDataView', {
        extend: 'Ext.view.View',
        alias: 'widget.complexdataview',

        customEvents: [],

        initComponent: function() {
            this.on({
                itemadd: {
                    fn: this.onItemAdd,
                    scope: this
                },
                itemremove: {
                    fn: this.onItemRemove,
                    scope: this
                },
                itemupdate: {
                    fn: this.onItemUpdate,
                    scope: this
                },
                refresh: {
                    fn: this.onRefresh,
                    scope: this
                },
                viewready: {
                    fn: this.onViewReady,
                    scope: this
                }
            });

            this.callParent(arguments);
        },

        onItemAdd: function(records, index, nodes) {
            var me = this;

            Ext.each(records, function(record, i) {
                this.onItemUpdate(record, index + i, nodes[i]);
            }, this);
        },

        onItemRemove: function() {
            //this.bindCustomEvents();
        },

        onItemUpdate: function(record, index, node) {
            this.bindEventToRow(new Ext.dom.Element(node), record, index);
        },

        onRefresh: function() {
            this.bindCustomEvents();
        },

        onViewReady: function() {

        },

        bindEventToRow: function(itemEl, record, index) {

            Ext.each(this.customEvents, function(e) {
                var el, keyGlobal;

                if (e.selector === 'this') {
                    el = itemEl;
                } else {
                    el = itemEl.down(e.selector);
                }

                if (!el) {
                    return;
                }
                
                el.removeAllListeners();

                for (keyGlobal in e) {
                    if (!e.hasOwnProperty(keyGlobal) || keyGlobal === 'selector') {
                        continue;
                    }

                    (function(key) {
                        var eventName = key,
                            eventObject = e[key],
                            fn = eventObject.fn,
                            scope = eventObject.scope;
                        
                        el.addListener(eventName, function (eObj, htmlEl) {
                            var el = new Ext.dom.Element(htmlEl);
                            fn.apply(scope, [el, record, index, eObj]);
                        }, scope);
                        
                    }(keyGlobal));
                }
            });
        },

        update: function (htmlOrData) {
             if (!this.fireEvent('beforeupdate', this, htmlOrData)) {
                return;
             }

             this.callParent(arguments);

             Ext.defer(function () {
                this.fireEvent('afterupdate', this, htmlOrData);
             }, 1, this);
        },

        onUpdate: function(ds, record) {
    
            // allow event to stop an update from occurring
            if (!this.fireEvent('beforeupdate', record, this.store.indexOf(record))) {
                return;
            }

            this.callParent(arguments);
        },

        bindCustomEvents: function() {
            var me = this,
                dataViewEl = this.getEl(),
                rows;


            if (!dataViewEl) {
                return;
            }

            rows = dataViewEl.query(this.itemSelector);

            this.store.each(function(record, index) {
                var itemEl = new Ext.dom.Element(rows[index]);
                me.bindEventToRow(itemEl, record, index);
            });
        }
    });
