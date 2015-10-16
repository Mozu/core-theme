/** 
 * @class Taco.util.Common
 * common utility methods 
 * 
 */
Ext.define('Taco.core.util.Common', {
    singleton:true,
    /*  a utility method to compare two jsons to see if they are the same;
     *  expects a config object with two members, template and data
     * example:
     * 
            var isEqual = Taco.util.Common.isEqual({
                template: {
                    fleens:"brigade"
                },
                data: {
                    fleens:"brigade"
                }
            })
     * 
     * 
    */
    isEqual : function(config) {
        var template = config.template;
        var data = config.data;
        if (template && data) {
            for (var p in data) {
                var t = template[p];
                var d = data[p];
                if ('object' === typeof d) {
                    if (!Taco.core.util.Common.isEqual({ template: t, data: d })) {
                        return false
                    } // if recursize fails
                } else {
                    if (template[p] != data[p]) {
                        return false
                    }
                }
            }
            return true
        }
        return false;

    },
    
    /**
         * Filter out null values from Array and maps in place.
         * @param l the array/Object to filter
         * @return the original item with null elements removed
         */
    filterNulls: function (l) {
        if (typeof l == "object") {
            if (l.constructor == Array) {
                var i = j = 0;
                for (i = 0; i < l.length; i++)
                    if (l[i])
                        l[j++] = l[i];
                l.length = j;
            }
            else {
                for (var k in l)
                    if (l.hasOwnProperty(k) && !l[k])
                        delete l[k];
            }
        }
        return l;
    },
    camelToSpace: (function(re, cache, decamelLower, decamelUpper) {
        return function(s, lower) {
            return cache[s] || (cache[s] = s.replace(re, lower ? decamelLower : decamelUpper))
        };
    })(/([a-z])([A-Z])/g, {}, function decamelLower(match, p1, p2) {
        return p1 + ' ' + p2.toLowerCase();
    },
    function decamelUpper(match, p1, p2) {
        return p1 + ' ' + p2;
    }),

    /**
     * Gets user firstName lastName for given field id.
     * @sample
     * {
     *   name: "lastModifiedByUser",
     *   type: "string",
     *   convert: Taco.core.util.Common.getLastModifiedByUser
     * }
     * @param v
     * @param record
     * @returns {user} or null
     */
    getLastModifiedByUser: function (v, record) {
        return Taco.core.util.Common.getUserByUserIdField(record, 'lastModifiedBy');
    },

    getCreateByUser: function (v, record) {
        return Taco.core.util.Common.getUserByUserIdField(record, 'createBy');
    },

    getUserByUserIdField: function (record, fieldName) {
        if (!record) {
            return null;
        }

        // look up user id in magical site users global object.
        var id = record.get(fieldName);
        var user = Ext.Array.findBy(window.Taco.siteUsersRaw, function (u) {
            return u.id === id;
        });
        return (user) ? user.firstName + ' ' + user.lastName : null;
    }
});