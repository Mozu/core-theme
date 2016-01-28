Ext.define('Taco.core.ux.grid.CheckColumnEx', {

    extend: 'Ext.grid.column.Column',
    alias: 'widget.taco.checkcolumn',

    disableColumn: false,
    disableFunction: null,
    disabledColumnDataIndex: null,
    columnHeaderCheckbox: false,

    constructor: function (config) {

        var me = this;
        if (config.columnHeaderCheckbox) {
            var store = config.store;
            store.on("datachanged", function () {
                me.updateColumnHeaderCheckbox(me);
            });
            store.on("update", function () {
                me.updateColumnHeaderCheckbox(me);
            });
            config.text = me.getHeaderCheckboxImage(store, config.dataIndex);
        }

        me.addEvents(
            /**
             * @event checkchange
             * Fires when the checked state of a row changes
             * @param {Ext.ux.CheckColumn} this
             * @param {Number} rowIndex The row index
             * @param {Boolean} checked True if the box is checked
             */
            'beforecheckchange',
            /**
             * @event checkchange
             * Fires when the checked state of a row changes
             * @param {Ext.ux.CheckColumn} this
             * @param {Number} rowIndex The row index
             * @param {Boolean} checked True if the box is checked
             */
            'checkchange'
        );

        me.callParent(arguments);
    },

    updateColumnHeaderCheckbox: function (column) {
        var image = column.getHeaderCheckboxImage(column.store, column.dataIndex);
        column.setText(image);
    },

    toggleSortState: function () {
        var me = this;
        if (me.columnHeaderCheckbox) {
            var store = me.up('tablepanel').store;
            var isAllChecked = me.getStoreIsAllChecked(store, me.dataIndex);
            store.each(function (record) {
                record.set(me.dataIndex, !isAllChecked);
                record.commit();
            });
        }
        else
            me.callParent(arguments);
    },

    getStoreIsAllChecked: function (store, dataIndex) {
        var allTrue = true;
        store.each(function (record) {
            if (!record.get(dataIndex))
                allTrue = false;
        });
        return allTrue;
    },

    getHeaderCheckboxImage: function (store, dataIndex) {

        var allTrue = this.getStoreIsAllChecked(store, dataIndex);

        var cssPrefix = Ext.baseCSSPrefix,
            cls = [cssPrefix + 'grid-checkheader'];

        if (allTrue) {
            cls.push(cssPrefix + 'grid-checkheader-checked');
        }
        return '<div class="' + cls.join(' ') + '">&#160;</div>'
    },

    /**
     * @private
     * Process and refire events routed from the GridView's processEvent method.
     */
    processEvent: function (type, view, cell, recordIndex, cellIndex, e) {
        if (type == 'mousedown' || (type == 'keydown' && (e.getKey() == e.ENTER || e.getKey() == e.SPACE))) {
            var record = view.panel.store.getAt(recordIndex),
                dataIndex = this.dataIndex,
                checked = !record.get(dataIndex),
                column = view.panel.columns[cellIndex];
            if (!(column.disableColumn || record.get(column.disabledColumnDataIndex) || (column.disableFunction && column.disableFunction(checked, record)))) {
                if (this.fireEvent('beforecheckchange', this, recordIndex, checked, record)) {
                    record.set(dataIndex, checked);
                    this.fireEvent('checkchange', this, recordIndex, checked, record);
                }
            }
            // cancel selection.
            return false;
        } else {
            return this.callParent(arguments);
        }
    },

    // Note: class names are not placed on the prototype bc renderer scope
    // is not in the header.
    renderer: function (value, metaData, record, rowIndex, colIndex, store, view) {
        var disabled = "",
            column = view.panel.columns[colIndex];
        if (column.disableColumn || column.disabledColumnDataIndex || (column.disableFunction && column.disableFunction(value, record)))
            disabled = "-disabled";
        var cssPrefix = Ext.baseCSSPrefix,
            cls = [cssPrefix + 'grid-checkheader' + disabled];

        if (value) {
            cls.push(cssPrefix + 'grid-checkheader-checked' + disabled);
        }

        metaData.tdCls = metaData.tdCls + ' ' + cssPrefix + 'grid-checkheader-cell';

        return '<div class="' + cls.join(' ') + '">&#160;</div>';
    }

});
