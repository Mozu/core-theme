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
                var t = template[p]
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

    }
});