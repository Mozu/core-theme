describe('Mozu SDK', function () {

    it("should expose a Mozu object", function () {
        expect(Mozu).toBeDefined();
    });

    describe("the root object", function () {

        it("should have a Tenant function and a Site function", function () {
            expect(typeof Mozu.Tenant).toBe("function");
            expect(typeof Mozu.Site).toBe("function");
        });

        it("should return an ApiContext from the Tenant function and Site functions", function () {
            expect(Mozu.Tenant(1)).toBeDefined();
            expect(Mozu.Site(22)).toBeDefined();
        });
    });

    describe("the ApiContext object", function() {
        var tenant = Mozu.Tenant(1);
        
        it("should have a tenantId property matching its argument", function() {
            expect(tenant.tenantId).toBe(1);
        });

        it("should have a Site function", function () {
            expect(typeof tenant.Site).toBe("function");
        });

        var site;
        it("should set the siteid with the site function", function () {
            site = tenant.Site(2);
            expect(site.siteId).toBe(2);
        });

        it("should persiste tenantId after siteId is set", function () {
            expect(site.tenantId).toBe(1);
        });
    });
});