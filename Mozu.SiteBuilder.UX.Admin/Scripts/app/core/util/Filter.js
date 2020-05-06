/** 
 * @class Taco.core.util.Filter
 * common Filter methods
 * */
Ext.define('Taco.core.util.Filter', {
    singleton: true,

    constructor: function(config) {
        this.initConfig(config);
    },
    config: {

    },

    /**
     * Converts filter string value to JSON object.
     * 
     * @param filterValue raw text value
     * @param advSearchFieldNames names of supported fields in advanced search form, otherwise pass []
     * @param keyValueDelimiter, defaults to ":" if null
     * @returns if passes Filter then returns true, else returns error string
     */
    toJSON : function(filterValue, advSearchFieldNames, keyValueDelimiter, defaultFieldName) {
        var jsonValue = {},
            values,
            lastKey,

            isFieldSupported = function(keyField) {
                var match;
                if (!keyField) {
                    return false;
                }

                match = Ext.Array.findBy(advSearchFieldNames, function(fld) {
                    return (fld.toLowerCase() === keyField.toLowerCase());
                });
                return match !== null;
            },

            addKeyValue = function(key, item, colonIndex) {
                jsonValue[key] = item.substr(colonIndex + keyValueDelimiter.length);
                lastKey = key;
            },

            addKeywordOrAppendToLastKey = function(item, index) {
                if (index === 0) {
                    lastKey = defaultFieldName || 'keyword';
                    jsonValue[lastKey] = item;
                } else if (!Ext.isEmpty(lastKey)) {
                    jsonValue[lastKey] = Ext.String.trim([jsonValue[lastKey], item].join(' '));
                }
            };

        if (Ext.isEmpty(filterValue)) {
            return {};
        }
        values = filterValue.split(' ');
        if (!keyValueDelimiter) {
            keyValueDelimiter = ':';
        }

        Ext.Array.each(values, function (item, index) {
            var colonIndex = item.indexOf(keyValueDelimiter),
                key = (colonIndex !== -1) ? Ext.String.createVarName(item.substr(0, colonIndex)) : 'keyword',
                isKeywordSearch = (colonIndex === -1 || !isFieldSupported(key));

            if (isKeywordSearch) {
                addKeywordOrAppendToLastKey(item, index);
            } else {
                addKeyValue(key, item, colonIndex);
            }
        }, this);

        return jsonValue;
    }

});