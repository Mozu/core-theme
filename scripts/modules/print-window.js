
var printLabelHandler = function() {
    window.print();
};

var cancelHandler = function() {
    window.close();
};

var beforePrint = function() {
};

var afterPrint = function() {
    window.close();
};
    
(function() {
    //Adds multi-broswer Watch support for before and after print window.
    if (window.matchMedia) {
        var mediaQueryList = window.matchMedia('print');
        mediaQueryList.addListener(function(mql) {
            if (mql.matches) {
                beforePrint();
            } else {
                afterPrint();
            }
        }); 
    }

    window.onbeforeprint = beforePrint;
    window.onafterprint = afterPrint;
  
}());