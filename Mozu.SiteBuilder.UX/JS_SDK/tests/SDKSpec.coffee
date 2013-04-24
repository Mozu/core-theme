describe "Mozu SDK", ->
  
  # current service URLs
  serviceUrls =
    ProductService: "http://aus01pdweb001.ads.volusion.com:9090/mozu.ProductRuntime.WebApi/commerce/catalog/storefront/products/"
    CartService: "http://aus01pdweb001.ads.volusion.com:9090/mozu.CommerceRuntime.WebApi/commerce/carts/"
    UserService: "http://aus01pdweb001.ads.volusion.com:9090/mozu.User.WebApi/platform/user/accounts/"
    OrderService: "http://aus01pdweb001.ads.volusion.com:9090/mozu.CommerceRuntime.WebApi/commerce/orders/"
    SearchService: "http://aus01pdweb001.ads.volusion.com:9090/mozu.ProductRuntime.WebApi/commerce/catalog/storefront/productsearch/"
    CmsService: "http://aus01pdweb001.ads.volusion.com:9090/mozu.Content.WebApi/content/documents/"
    ReferenceService: "http://aus01pdweb001.ads.volusion.com:9090/Mozu.reference.WebApi/platform/reference/"

  existingProductCode = "quux"
  Mozu.setServiceUrls serviceUrls
  it "should expose a Mozu object", ->
    expect(Mozu).toBeDefined()

  describe "the root object", ->
    it "should have a Tenant function, a SiteGroup function and a Site function", ->
      expect(typeof Mozu.Tenant).toBe "function"
      expect(typeof Mozu.Site).toBe "function"
      expect(typeof Mozu.SiteGroup).toBe "function"

    it "should return an ApiContext from the Tenant, SiteGroup, and Site functions", ->
      expect(Mozu.Tenant(1)).toBeDefined()
      expect(Mozu.Site(22)).toBeDefined()
      expect(Mozu.SiteGroup(22)).toBeDefined()

    it "should return an ApiContext from the single Store function", ->
      expect(Mozu.Store(
        tenant: 1
        site: 22
        "site-group": 23
      )).toBeDefined()


  describe "the ApiContext object", ->
    tenant = Mozu.Tenant(1)
    it "should have a tenantId property matching its argument", ->
      expect(tenant.tenant).toBe 1

    it "should have a Site and SiteGroup function", ->
      expect(typeof tenant.Site).toBe "function"
      expect(typeof tenant.SiteGroup).toBe "function"

    site = undefined
    it "should set the siteid with the site function", ->
      site = tenant.Site(2)
      expect(site.site).toBe 2

    it "should persist tenantId after siteId is set", ->
      expect(site.tenant).toBe 1

    it "should be able to initialize from a conf object as well", ->
      expect(Mozu.Store(
        tenant: 30001
        "site-group": 1
        site: 30002
      ).api()).toBeTruthy()


  describe "the ApiInterface object", ->
    completeContext = Mozu.Tenant(30001).SiteGroup(1).Site(30002)
    noTenantContext = Mozu.SiteGroup(1).Site(40000)
    noSiteContext = Mozu.Tenant(30000).SiteGroup(1)
    noSiteGroupContext = Mozu.Tenant(30000).Site(1)
    
    #var noHostContext = Mozu.Tenant(4000).SiteGroup(1).Site(2);
    it "should be returned by the 'api' method of a complete ApiContext", ->
      expect(completeContext.api()).toBeDefined()

    it "should error when any of tenant, site, or sitegroup are not supplied", ->
      expect(noTenantContext.api).toThrow()
      expect(noSiteContext.api).toThrow()
      expect(noSiteGroupContext.api).toThrow()

    api = completeContext.api()
    it "should have request, get, update, create, and delete methods", ->
      expect(typeof api.request).toBe "function"
      expect(typeof api.get).toBe "function"
      expect(typeof api.update).toBe "function"
      expect(typeof api.create).toBe "function"
      expect(typeof api.del).toBe "function"

    it "should have .on, .off, and .fire methods for event pub/sub", ->
      expect(typeof api.on).toBe "function"
      expect(typeof api.off).toBe "function"
      expect(typeof api.fire).toBe "function"

    describe "the api.request method", ->
      req = undefined
      it "should run an ajax request from the request method", ->
        spyOn(Mozu.Utils, "ajax").andCallThrough()
        req = api.request("GET", serviceUrls.ProductService)
        expect(Mozu.Utils.ajax).toHaveBeenCalled()

      it "should return a Promises/A compliant interface from the request method", ->
        expect(Mozu.Utils.when.isPromise(req)).toBeTruthy()

      it "should send the JSON response to the .then handler of the promise", ->
        req = undefined
        res = undefined
        runs ->
          req = api.request("GET", serviceUrls.ProductService)
          req.then ->
            console.log arguments_
            res = arguments_[0]


        waitsFor (->
          res
        ), "The api request has returnes a truthy response", 20000
        runs ->
          expect(JSON.stringify(res)).toBeTruthy()


      it "should cause a 'request' event from the api object when it is called, supplying an XHR, a promise, and the original configuration of the request", ->
        onRequest = (_xhr, _promise, _reqConf) ->
          xhr = _xhr
          promise = _promise
          reqConf = _reqConf
        xhr = undefined
        promise = undefined
        reqConf = undefined
        returnedPromise = undefined
        runs ->
          api.on "request", onRequest
          returnedPromise = api.get("products")

        waitsFor (->
          xhr
        ), 20000
        runs ->
          api.off "request", onRequest
          expect(xhr instanceof XMLHttpRequest).toBeTruthy()
          expect(promise.then).toBeDefined()
          expect(reqConf).toBeDefined()
          expect(promise.then).toBeDefined()



    describe "the api.get method", ->
      it "should work with shortcuts like 'products'", ->
        res = undefined
        runs ->
          api.get("products").then (products) ->
            res = products


        waitsFor (->
          res
        ), 20000
        runs ->
          expect(res instanceof Mozu.ApiReference.ApiObject).toBeTruthy()


      it "should work with simple url templates, like 'product'", ->
        res = undefined
        runs ->
          api.get("product",
            ProductCode: existingProductCode
          ).then (product) ->
            res = product


        waitsFor (->
          res
        ), 20000
        runs ->
          expect(res.data.ProductCode).toBe existingProductCode


      it "should work with a simple string argument to the most commonly-used param searched upon", ->
        res = undefined
        spyOn(Mozu.ApiReference, "getRequestConfig").andCallThrough()
        runs ->
          api.get("product", existingProductCode).then (product) ->
            res = product

          expect(Mozu.ApiReference.getRequestConfig).toHaveBeenCalledWith "get", "product", existingProductCode, api.context

        waitsFor (->
          res
        ), 20000
        runs ->
          expect(res.data.ProductCode).toBe existingProductCode



    describe "the cancel method on simple API requests", ->
      xhr = undefined
      onRequest = (_xhr, _promise) ->
        xhr = _xhr

      p = undefined
      api.on "request", onRequest
      p = api.get("products")
      it "should exist on simple, one-step promises", ->
        expect(typeof p.cancel).toBe "function"

      it "cannot exist, sadly, on promises that are the result of pipes", ->
        expect(typeof p.then(->
          true
        ).cancel).toBe "undefined"

      it "should cancel an outstanding XmlHttpRequest", ->
        expect(xhr.readyState).not.toBe 0
        p.cancel()
        expect(xhr.readyState).toBe 0

      api.off "request", onRequest

    describe "the error event from requests", ->
      it "should fire when an XHR errors", ->
        error = undefined
        xhr = undefined
        conf = undefined
        onError = (_error, _xhr, _conf) ->
          error = _error
          xhr = _xhr
          conf = _conf

        api.on "error", onError
        runs ->
          api.request "A_BAD_URL", {}

        waitsFor (->
          error
        ), 20000
        runs ->
          api.off "error", onError
          expect(error.Items[0]).toBeDefined()
          expect(xhr instanceof XMLHttpRequest).toBeTruthy()
          expect(conf).toBeDefined()



    describe "the .all method of the api interface", ->
      foo = undefined
      cart = undefined
      it "should make a bunch of API calls at once and return them all to a handler", ->
        runs ->
          api.all(api.get("product", existingProductCode), api.get("cart")).spread (f, c) ->
            foo = f
            cart = c


        waitsFor(->
          foo and cart
        )
        20000

        runs ->
          expect(foo.type).toBe "product"
          expect(cart.type).toBe "cart"



    describe "the ApiObject returned by the api interface", ->
      res = undefined
      product = undefined
      cart = undefined
      it "should have an actions method that peforms common actions for the object type", ->
        runs ->
          api.get("product", existingProductCode).then((foo) ->
            product = foo
            api.get "cart"
          ).then((c) ->
            cart = c
            cart.action "empty"
          ).then((emptyCart) ->
            cart = emptyCart
            expect(cart.data.Items.length).toBe 0
            cart.action "addProduct",
              Product: product.data
              Quantity: 1

          ).then((cartItem) ->
            cart.action "get"
          ).then (newCart) ->
            res = newCart


        waitsFor (->
          res
        ), 20000
        runs ->
          expect(res.data.Items.length).toBe 1
          expect(res.data.Items[0].Product.ProductCode).toBe existingProductCode


      it "should have a getAvailableActions method that returns all actions that can be performed on this resource", ->
        expect(res.getAvailableActions()).toContain "empty"

      it "should create dummy ApiObjects with no data if you set the third 'isRemote' argument to false", ->
        p = undefined
        dummyProduct = undefined
        m = undefined
        spyOn(Mozu.Utils, "ajax").andCallThrough()
        p = api.get("product", existingProductCode, false).then((product) ->
          m = "promise resolves immediately"
          dummyProduct = product
        )
        expect(m).toBe "promise resolves immediately"
        expect(Mozu.Utils.ajax).not.toHaveBeenCalled()
        expect(dummyProduct.action).toBeTruthy()

      it "should throw an 'action' event when you successfully run an action method and a 'sync' event if selfupdating", ->
        p = undefined
        actionName = undefined
        requestConf = undefined
        syncEventCalled = undefined
        api.get("product", existingProductCode, false).then (dummyProduct) ->
          p = dummyProduct

        p.on "action", (_a, _r) ->
          actionName = _a
          requestConf = _r

        p.on "sync", ->
          syncEventCalled = true

        p.get()
        waitsFor (->
          syncEventCalled
        ), 20000
        runs ->
          expect(actionName).toBe "get"
          expect(requestConf).not.toBeTruthy()
          expect(syncEventCalled).toBeTruthy()


      it "should return an API object of a different type for some actions and throw a 'spawn' event", ->
        res = undefined
        spawnEventThrown = undefined
        onSpawn = ->
          spawnEventThrown = true

        runs ->
          cart.on "spawn", onSpawn
          cart.action("addProduct",
            Product: product.data
            Quantity: 3
          ).then (cartItem) ->
            res = cartItem


        waitsFor (->
          res
        ), 20000
        runs ->
          cart.off "spawn", onSpawn
          expect(res.type).toBe "cartitem"



    describe "the .steps method of the api interface", ->
      product = undefined
      cart = undefined
      res = undefined
      it "should make calls in sequence, passing the arguments from the previous call to the next one", ->
        runs ->
          api.steps (->
            api.get "product", existingProductCode
          ), ((foo) ->
            product = foo
            api.get "cart"
          ), ((c) ->
            cart = c
            cart.action "empty"
          ), ((emptyCart) ->
            expect(cart.data.Items.length).toBe 0
            cart.action "addProduct",
              Product: product.data
              Quantity: 1

          ), ((cartItem) ->
            cart.get()
          ), (newCart) ->
            res = newCart


        waitsFor (->
          res
        ), 20000
        runs ->
          expect(res.data.Items.length).toBe 1
          expect(res.data.Items[0].Product.ProductCode).toBe existingProductCode




