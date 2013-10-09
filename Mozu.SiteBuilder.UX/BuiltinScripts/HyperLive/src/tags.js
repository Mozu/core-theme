//function NullTags() {
//    this.tags = ['require_script', 'json_attribute', 'data_attributes', 'dump'];

//    this.parse = function () {
//        return null;
//    }
//}

//HyperLive.addExtension('NullTags', new NullTags());


var nullParse = function () { return true; },
    nullCompile = function() {return ''};

var nullTags = ['require_script', 'json_attribute', 'data_attributes', 'dump'];
for (var t = 0; t < nullTags.length; t++) {
    HyperLive.engine.setTag(nullTags[t], nullParse, nullCompile, false, true);
}