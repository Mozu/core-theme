//function NullTags() {
//    this.tags = ['require_script', 'json_attribute', 'data_attributes', 'dump'];

//    this.parse = function () {
//        return null;
//    }
//}

//HyprLive.addExtension('NullTags', new NullTags());


var nullParse = function () { return true; },
    nullCompile = function() {return ''};

var nullTags = ['require_script', 'json_attribute', 'data_attributes', 'dump'];
for (var t = 0; t < nullTags.length; t++) {
    HyprLive.engine.setTag(nullTags[t], nullParse, nullCompile, false, true);
}