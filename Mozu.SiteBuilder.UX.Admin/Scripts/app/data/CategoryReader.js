Ext.define('Taco.data.CategoryReader', {
    extend: 'Ext.data.reader.Json',
    alias: 'reader.taco.data.categoryreader',

    getResponseData: function (response) {
        var data = this.callParent([response]);

        this.getAncestry(data);

        return data;
    },

    getAncestry: function (data) {
        var branch;
        var currentData = data.records || data;
        var hash = {};

        var buildParentPath = function (record) {
            if (record.data.fullParentPath) {
                return record.data.fullParentPath;
            }
            var parent = hash[record.data.parentId];
            var fullPath = "";
            if (parent) {
                fullPath += buildParentPath(parent) + ' > ';
            }

            fullPath += record.data.name || '';

            record.data.fullPath = fullPath;
            return fullPath;
        };
        Ext.each(currentData, function (item) {
            hash[item.data.id] = item;
        }, this);

        Ext.each(currentData, function (item) {
            buildParentPath(item);
        }, this);
    }
});
