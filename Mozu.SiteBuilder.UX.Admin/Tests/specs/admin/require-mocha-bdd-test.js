var expect = chai.expect;

require(['../../Scripts/app/model/Attribute.js'],
    function (app) {
        console.log('start');
        
        
        //var ver = core.version;
        //console.log(ver);

        describe("Mocha", function () {

            describe("mocha 101", function () {
                it("A basic test", function () {
                    expect(true);
                    var value = "hello";
                    expect(value).to.equal("hello");
                });

                it("Another basic test", function () {
                    expect(true);
                    var value = "hi";
                    expect(value).to.equal("hi");
                });
            });

        });
    });




//var expect = chai.expect;

//describe("Mocha", function () {

//    describe("mocha 101", function () {
//        it("A basic test", function () {
//            expect(true);
//            var value = "hello";
//            expect(value).to.equal("hello");
//        });

//        it("Another basic test", function () {
//            expect(true);
//            var value = "hi";
//            expect(value).to.equal("hi");
//        });
//    });

//});

////describe("stringLib", function () {
////    it("will get vowel count", function () {
////        var count = stringLib.vowels("hello");
////        expect(count).to.equal(2);
////    });
////});

////describe("mathLib", function () {
////    it("will add 5 to number", function () {
////        var res = mathLib.add5(10);
////        expect(res).to.equal(15);
////    });

////    it("will multiply 5 to number", function () {
////        var res = mathLib.mult5(10);
////        expect(res).to.equal(55);
////    });
////});

//describe('Array', function () {
//    describe('#indexOf()', function () {
//        it('should return -1 when the value is not present', function () {
//            expect([1, 2, 3].indexOf(5)).to.equal(-1);
//            expect([1, 2, 3].indexOf(0)).to.equal(-1);
//        })
//    })
//})