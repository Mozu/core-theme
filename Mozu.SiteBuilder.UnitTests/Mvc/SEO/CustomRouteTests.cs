using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.Mvc.SEO.Constraints;
using Mozu.SiteBuilder.Mvc.SEO.Mappings;
using NSubstitute;
using Mozu.MZDB.Contracts.Clients;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Should;
using Mozu.Core.Api.Contracts.Client;
using Mozu.MZDB.Contracts;
using System.Net.Http;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.Core;
using Mozu.Content.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.Core.Logging;
using System.Runtime.Caching;
using Mozu.Content.Contracts;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using Mozu.Core.Extensions;
using Mozu.ProductRuntime.Contracts;
using Mozu.ProductRuntime.Contracts.Clients;
using AutoMapper;
using Mozu.Core.Api.Contracts;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.UX.Configuration;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using NSubstitute.Core;
using Mozu.SiteBuilder.Mvc.Caching;
using System.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Mozu.Core.Api.Contracts.Caching;
using Mozu.Core.Configuration;
using Mozu.Core.Test;
using Mozu.SiteBuilder.Mvc.Context;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UnitTests.Utils;
using Route = Mozu.SiteSettings.General.Contracts.General.Routing.Route;

namespace Mozu.SiteBuilder.UnitTests.Mvc.SEO
{
    class TestHandler : IServiceClientMessageHandler
    {
        public TestHandler()
        {
            this.MozuApiContext = new ApiContext();
        }
        public object MozuApiContext
        {
            get; private set;
        }

        public IServiceClientMessageHandler CloneWithNewApiContext(object apiContext)
        {
            return new TestHandler() { MozuApiContext = apiContext ?? new ApiContext() };
        }

        public string GetBaseUrlById(string serviceId, string environment = null, string scaleUnit = null)
        {
            throw new NotImplementedException();
        }

        public string GetBaseUrlById(string serviceId, string environment = null, string scaleUnit = null, string mozuInstanceId = null)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<T>> SendAsync<T>(string verb, string relpath, string serviceId, ConfigOptions options)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<T>> SendAsync<T>(string verb, string relpath, string serviceId, ConfigOptions options, IGeneratedClientPerformanceCounters clientPerformanceCounters)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<T>> SendAsync<T>(string verb, string relpath, string serviceId, ConfigOptions options, ClientCacheOptions cacheOptions)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<T>> SendAsync<T>(string verb, string relpath, string serviceId, ConfigOptions options, TargetContextLevelType targetContextLevel)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<T>> SendAsync<T>(string verb, string relpath, string serviceId, ConfigOptions options, ClientCacheOptions cacheOptions, IGeneratedClientPerformanceCounters clientPerformanceCounters)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<T>> SendAsync<T>(string verb, string relpath, string serviceId, ConfigOptions options, TargetContextLevelType targetContextLevel, IGeneratedClientPerformanceCounters clientPerformanceCounters)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<T>> SendAsync<T>(string verb, string relpath, string serviceId, ConfigOptions options, TargetContextLevelType targetContextLevel, ClientCacheOptions cacheOptions)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<T>> SendAsync<T>(string verb, string relpath, string serviceId, ConfigOptions options, TargetContextLevelType targetContextLevel, ClientCacheOptions cacheOptions, IGeneratedClientPerformanceCounters clientPerformanceCounters)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<T>> SendAsync<T, S>(string verb, string relpath, S sval, string serviceId, ConfigOptions options)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<T>> SendAsync<T, S>(string verb, string relpath, S sval, string serviceId, ConfigOptions options, IGeneratedClientPerformanceCounters clientPerformanceCounters)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<T>> SendAsync<T, S>(string verb, string relpath, S sval, string serviceId, ConfigOptions options, ClientCacheOptions cacheOptions)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<T>> SendAsync<T, S>(string verb, string relpath, S sval, string serviceId, ConfigOptions options, TargetContextLevelType targetContextLevel)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<T>> SendAsync<T, S>(string verb, string relpath, S sval, string serviceId, ConfigOptions options, ClientCacheOptions cacheOptions, IGeneratedClientPerformanceCounters clientPerformanceCounters)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<T>> SendAsync<T, S>(string verb, string relpath, S sval, string serviceId, ConfigOptions options, TargetContextLevelType targetContextLevel, IGeneratedClientPerformanceCounters clientPerformanceCounters)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<T>> SendAsync<T, S>(string verb, string relpath, S sval, string serviceId, ConfigOptions options, TargetContextLevelType targetContextLevel, ClientCacheOptions cacheOptions)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<T>> SendAsync<T, S>(string verb, string relpath, S sval, string serviceId, ConfigOptions options, TargetContextLevelType targetContextLevel, ClientCacheOptions cacheOptions, IGeneratedClientPerformanceCounters clientPerformanceCounters)
        {
            throw new NotImplementedException();
        }
    }

    [TestFixture, Category("CustomRoutes")]
    public class CustomRouteTests
    {
        [TestCaseSource("GoodCases")]
        public void FactoryCanMakeMappings(Mapping mapping, Type expectedType)
        {
            var entityListClient = Substitute.For<ISiteBuilderContextProvider>();
            var factory = new RouteMappingFactory(entityListClient);
            var made = factory.BuildMapping(null, mapping);
            made.GetType().ShouldEqual(expectedType);
        }
        static IEnumerable<object[]> GoodCases()
        {
            var mapping1 = new Mapping { type = Mapping.TypeConst.facet, mapTo = "bar", facetId = "facet@mozu" };
            yield return new object[] { mapping1, typeof(FacetValueFilterMapping) };

            var mapping2 = new Mapping { type = Mapping.TypeConst.direct, mappings = new Dictionary<string, object> { { "butts", "lol" } } };
            yield return new object[] { mapping2, typeof(SiteBuilder.Mvc.SEO.Mappings.DirectMapping) };

            var mapping3 = new Mapping { type = Mapping.TypeConst.mzdb, docId = "blah@foo", listFqn = "sigh" };
            yield return new object[] { mapping3, typeof(MZDBMap) };
        }

        //[TestCaseSource("MalformedCases")]
        //public void MalformedMappingsBreak(MappingTest test)
        //{
        //    var entityListClient = Substitute.For<ISiteBuilderContextProvider>();
        //    var factory = new RouteMappingFactory(entityListClient);
        //    Assert.Throws<ArgumentException>(() => factory.BuildMapping(null,test.Mapping));

        //}
        public class MappingTest
        {
            public Mapping Mapping;
            public string Name;
            public override string ToString()
            {
                return Name;
            }
        }

        static IEnumerable<MappingTest> MalformedCases()
        {
            int i = 0;
            return MalformedCasesRaw().Select(x => new MappingTest { Mapping = x, Name = "MapTest " + ++i }).ToList();

        }
        static IEnumerable<Mapping> MalformedCasesRaw()
        {
            var mapping1 = new Mapping { type = Mapping.TypeConst.facet, mapTo = "bar" };
            yield return mapping1;

            var mapping2 = new Mapping { type = Mapping.TypeConst.direct };
            yield return mapping2;

            var mapping3 = new Mapping { type = Mapping.TypeConst.mzdb, listFqn = "sigh" };
            yield return mapping3;
        }

        [TestCaseSource("HappyPathMappings")]
        [TestCaseSource("NoOpPathMappings")]
        public Task MappersWork(MappersWorkTest test)
        {
            test.mapping.Initialize();
            var ctx = new DefaultHttpContext();
            ctx.Request.Path = "/foo";
            ctx.Request.Method = "GET";
            ctx.Request.Scheme = "http";
            var outputs = test.mapping.Map(ctx, test.inputs, "foo");
            outputs.SequenceEqual(test.expectedOutput).ShouldBeTrue();
            return Task.CompletedTask;
        }
        public class MappersWorkTest
        {
            string _name;

            public MappersWorkTest( string name , object[] stuff)
            {
                _name = name;
                this.mapping = (IRouteDataMapping)stuff[0];
                this.inputs =(Dictionary<string, object>)stuff[1];
                this.expectedOutput = (Dictionary<string, object>)stuff[2];
            }
            public override string ToString()
            {
                return _name;
            }
            
            public IRouteDataMapping mapping;
            public Dictionary<string, object> inputs;
            public Dictionary<string, object> expectedOutput;
        }
        static IEnumerable<MappersWorkTest> HappyPathMappings()
        {
            int i = 0;
            return HappyPathMappingsRaw().Select(x => new MappersWorkTest("HappyPathMappings " + i++, x)).ToList();
        }
        static IEnumerable<object[]> HappyPathMappingsRaw()
        {
            yield return new object[] {
                new SiteBuilder.Mvc.SEO.Mappings.DirectMapping(new Mapping(){ mappings =new Dictionary<string, object> { { "red", "green" } }}),
                new Dictionary<string, object> { { "foo", "red" } },
                new Dictionary<string, object> { { "foo", "green" } }

            };
            var ctxData = new SiteBuilderContextData();
            ctxData.RouteMapperData = new Dictionary<string, Dictionary<string, object>>();
            ctxData.RouteMapperData["xxx"] = new Dictionary<string, object> { { "red", "green" }, { "foo1", "red" }, { "foo", "green" } };
            var contextProvider = Substitute.For<ISiteBuilderContextProvider>();
            contextProvider.GetContextData().Returns(ctxData);

            //yield return new object[] {
            //    new FacetValueFilterMapping(new Mapping(){ facetId="foo"} ),
            //    new Dictionary<string, object> { { "foo", "mauve"}, },
            //    new Dictionary<string, object> { { "foo", "mauve" }, { "facetValueFilter", "mauve" } }};

            //var entityClientMock = Substitute.For<IEntityListsWebApiClient, ICloneable>();
            //(entityClientMock as ICloneable).Clone().Returns(entityClientMock);
            //entityClientMock.Handler.ReturnsForAnyArgs(new TestHandler());

           // entityClientMock.GetEntity(Arg.Any<string>(), Arg.Any<string>()).Returns(ctx => Task.FromResult(new ServiceClientResponse<JObject>() { ReadAsSync = () => JObject.Parse("{\"red\":\"green\"}") }));
            yield return new object[] {
                new MZDBMap( "xxx" , new Mapping (){ listFqn = "list", docId ="doc"},contextProvider ),
                 new Dictionary<string, object> { { "foo", "red" } },
                new Dictionary<string, object> { { "foo", "green" } }

            };
        }




        static IEnumerable<MappersWorkTest> NoOpPathMappings()
        {
            int i = 0;
            return HappyPathMappingsRaw().Select(x => new MappersWorkTest("NoOpPathMappingsRaw " + i++, x)).ToList();
        }
        /// <summary>
        /// Tests that verify that a mapper does not make modifications to the route data if none of its configuration matches the data in the route data.
        /// </summary>
        /// <returns></returns>
        static IEnumerable<object[]> NoOpPathMappingsRaw()
        {
            yield return new object[] {
                new SiteBuilder.Mvc.SEO.Mappings.DirectMapping(new Mapping(){ mappings =new Dictionary<string, object> { { "foo", "bar" } }}),
                new Dictionary<string, object> { { "bar", 1234 } },
                new Dictionary<string, object> { { "bar", 1234 } }
            };

            yield return new object[] {
                new FacetValueFilterMapping(new Mapping(){ facetId ="color"}),
                new Dictionary<string, object> { { "foo", 1234 } },
                new Dictionary<string, object> { { "foo", 1234 } }
            };

            var entityClientMock = Substitute.For<IEntityListsWebApiClient, ICloneable>();
            (entityClientMock as ICloneable).Clone().Returns(entityClientMock);
           entityClientMock .Handler.ReturnsForAnyArgs(new TestHandler());
            var obj = new JObject();
            obj["blah"] = "foo";

            entityClientMock.GetEntity(Arg.Any<string>(), Arg.Any<string>()).Returns(ctx => Task.FromResult(Response(obj)));

            var ctxData = new SiteBuilderContextData();
            ctxData.RouteMapperData = new Dictionary<string, Dictionary<string, object>>();
            ctxData.RouteMapperData["xxx"] = new Dictionary<string, object> { { "blah", "foo" } };
            var contextProvider = Substitute.For<ISiteBuilderContextProvider>();
            contextProvider.GetContextData().Returns(ctxData);

            yield return new object[] {
                new MZDBMap("xxx",  new Mapping(){ listFqn = "list", docId ="doc"}, contextProvider),
                new Dictionary<string, object> { { "butts", "lol" } },
                new Dictionary<string, object> { { "butts", "lol" } }
            };
        }


        [TestCaseSource("ConstraintTests")]
        public async Task ConstraintsWork(ConstraintTest test )
        {
            var httpRoute = Substitute.For<IRouter>();
            test.constraint.Initialize();
            test.constraint.DoMatch(new DefaultHttpContext(), httpRoute, test.parameterName, test.inputs, RouteDirection.UrlGeneration).ShouldEqual(test.routeShouldMatch);
        }

        public class ConstraintTest
        {
            string _name;
            public ConstraintTest(string name, object[] parts)
            {
                _name = "Constraint "+ name;
                parameterName = parts[0] as string;
                constraint = parts[1] as ICustomRouteConstraint;
                inputs = parts[2] as RouteValueDictionary;
                routeShouldMatch = (bool)parts[3];
            }
            public string parameterName;
            public ICustomRouteConstraint constraint;
            public RouteValueDictionary inputs;
            public bool routeShouldMatch;
            public override string ToString()
            {
                return _name;
            }
        }
        
        static IEnumerable<ConstraintTest> ConstraintTests()
        {
            yield return new ConstraintTest( "test1", new object[]
            {
                "designer",
                new StringListRouteConstraint(new List<string> {"once", "never", "always" }),
                new Dictionary<string, object> { { "designer", "once" } },
                true
            });

            yield return new ConstraintTest("test2", new object[]
            {
                "designer",
                new StringListRouteConstraint(new List<string> {"once", "never", "always" }),
                new Dictionary<string, object> { { "haha", "once" } },
                false
            });

            var attrClient = Substitute.For<IAttributeWebApiClient, ICloneable>();
            (attrClient as ICloneable).Clone().Returns(attrClient);
            attrClient.Handler.Returns(new TestHandler());
            var vocabs = new List<ProductAdmin.Contracts.AttributeVocabularyValue>{
                Vocab("meh"),
                Vocab("whatevs")
            };

            var searchClient = Substitute.For<IProductSearchWebApiClient, ICloneable>();
            (searchClient as ICloneable).Clone().Returns(searchClient);
            searchClient.Handler.Returns(new TestHandler());


            attrClient.GetAttributeVocabularyValues(Arg.Any<string>()).Returns(Task.FromResult(Response(vocabs)));
            attrClient.Handler.Returns(new TestHandler());
            searchClient.Search().ReturnsForAnyArgs(Task.FromResult(Response(new ProductRuntime.Contracts.ProductSearchResult()
            {
                Facets =
                new List<ProductRuntime.Contracts.Facet>() {
                    new ProductRuntime.Contracts.Facet() {
                        Values =new List<FacetValue>() {
                            new FacetValue() { Value ="bing"},
                            new FacetValue(){ Value ="bong" }
                            }
                    }
                }
            })));

            var contextData = new SiteBuilderContextData();
            contextData.RouteValidatorData = new Dictionary<string, Dictionary<string, object>>
            {
                ["test3"] = new Dictionary<string, object> { { "meh", "meh" } },
                ["test4"] = new Dictionary<string, object> { { "bing", "bing" } },
                ["mzdb"] = new Dictionary<string, object> { { "value!", "value!" } }
            };
            var contextProvider = Substitute.For<ISiteBuilderContextProvider>();
            contextProvider.GetContextData().Returns(contextData);
            var context = Substitute.For<IApiContext>();
            context.LocaleCode.Returns("en-US");

            yield return new ConstraintTest("test3", new object[]
            {
                "param",
                new ProductAttributeRouteConstraint(context, "butts") { ContextProvider = contextProvider , Key= "test3"},
                new Dictionary<string, object> { { "param", "meh" } },
                true
            });
            yield return new ConstraintTest("test4", new object[]
            {
                "param",
                new ProductAttributeRouteConstraint(context, "butts"){ ContextProvider = contextProvider , Key= "test4"},
                new Dictionary<string, object> { { "param", "bing" } },
                true
            });
            yield return new ConstraintTest("test5", new object[]
            {
                "param",
                new ProductAttributeRouteConstraint(context, "butts"){ ContextProvider = contextProvider , Key= "test5"},
                new Dictionary<string, object> { { "param", "sure" } },
                false
            });
            yield return new ConstraintTest("test6", new object[]
            {
                "param",
                new ProductAttributeRouteConstraint(context, "butts"){ ContextProvider = contextProvider , Key= "test6"},
                new Dictionary<string, object> { },
                false
            });

           
           // MakeEntityListsWebApiClient();

            
            yield return new ConstraintTest("test7", new object[]
            {
                "param",
                new MzdbRouteConstraint(){ ContextProvider = contextProvider , Key= "mzdb"},
                new Dictionary<string, object> { {"param", "value!" } },
                true
            });

            yield return new ConstraintTest("test8", new object[]
            {
                "param",
                new MzdbRouteConstraint(){ ContextProvider = contextProvider , Key= "mzdb"},
                new Dictionary<string, object> { {"param", "sigh" } },
                false
            });
            yield return new ConstraintTest("test9", new object[]
            {
                "param",
                new MzdbRouteConstraint(){ ContextProvider = contextProvider , Key= "mzdb"},
                new Dictionary<string, object> { },
                false
            });
        }

        private static IEntityListsWebApiClient MakeEntityListsWebApiClient()
        {
            var mzdbClient = Substitute.For<IEntityListsWebApiClient, ICloneable>();
            (mzdbClient as ICloneable).Clone().Returns(mzdbClient);

            var  mozuApiContext = (object) new ApiContext();
            mzdbClient.Handler.Returns(new TestHandler());

            var doc = new JObject();
            doc["myfield"] = "value!";
            var coll = new EntityCollection() { Items = new List<JObject> { doc }, TotalCount = 1, PageCount = 1, PageSize = 50, StartIndex = 0 };
            mzdbClient.GetEntities(Arg.Any<string>(), pageSize: Arg.Any<int?>(), startIndex: Arg.Any<int?>()).Returns(Task.FromResult(Response(coll)));


            return mzdbClient;
        }

        static ProductAdmin.Contracts.AttributeVocabularyValue Vocab(string value) {
            var content = new ProductAdmin.Contracts.AttributeVocabularyValueLocalizedContent() { LocaleCode = "en-US", StringValue = value };
            return new ProductAdmin.Contracts.AttributeVocabularyValue
            {
                Content = content,
                LocalizedContent = new List<ProductAdmin.Contracts.AttributeVocabularyValueLocalizedContent> { content },
                Value = value
            };
        }

        [TestCaseSource("ConstraintFactory")]
        public void FactoryCanMakeConstraints(Validator validator, Type expectedType)
        {
            var entityClient = Substitute.For<IEntityListsWebApiClient, ICloneable>();
            ((ICloneable)entityClient).Clone().Returns(entityClient);
            entityClient.Handler.Returns(new TestHandler());
            
            var fact = new ConstraintFactory(Substitute.For<ISiteBuilderContextProvider>(), Substitute.For<IApiContext>());
            fact.BuildConstraint(null, validator).GetType().ShouldEqual(expectedType);
        }

        static IEnumerable<object[]> ConstraintFactory()
        {
            var attrConstraint = new Validator { type = Validator.TypeConst.attribute, attributeFQN = "attr" };
            yield return new object[] { attrConstraint, typeof(ProductAttributeRouteConstraint) };

            var mzdbConstraint = new Validator { type = Validator.TypeConst.mzdb, listFqn = "lol", field = "meh" };
            yield return new object[] { mzdbConstraint, typeof(MzdbRouteConstraint) };

            var listConstraint = new Validator { type = Validator.TypeConst.list, values = new List<string> { "one", "two", "three" } };
            yield return new object[] { listConstraint, typeof(StringListRouteConstraint) };
        }

        [Test]
        public async Task CanGetRouteCollectionFromSettingsDoc()
        {
            const int numRoutes = 1;
            var gensettings = new SiteSettings.General.Contracts.GeneralSettings
            {
                CustomRoutes = new CustomRouteSettings
                {
                    Routes = new List<Route>
                    {
                        new Route
                        {
                            Template = "a/{documentName}",
                            Defaults = new Dictionary<string, object>
                            {
                                { "documentList", "pages@Mozu" }
                            },
                            InternalRoute = FancyRoute.CmsPage.ToStringQuickly()
                        }
                    }
                },
                AuditInfo = new Core.Api.Contracts.AuditInfo()
                {
                    UpdateDate = DateTime.MinValue
                }
            };

            var sbapiContext = Substitute.For<ISiteBuilderApiContext>();
            var logger = Substitute.For<ILogger>();
          


            var contextProvider = Substitute.For<ISiteBuilderContextProvider>();
            var apiContext = Substitute.For<ISiteBuilderApiContext>();

            var sbcd = new SiteBuilderContextData()
            {
                GeneralSettings = gensettings
            };

            contextProvider.GetContextData().Returns(sbcd);
            var constraintFactory = new ConstraintFactory(contextProvider, apiContext);
            var mappingFactory = new RouteMappingFactory(contextProvider);
            var repo = new CustomRouteRepository(apiContext, logger, contextProvider, constraintFactory, mappingFactory, new DefaultHttpContext());

            var collection =  ((ICustomRouteCollectionRepository) repo).GetRouteCollection();
            collection.Count.ShouldEqual(numRoutes);
        }

        class DummyStorefrontCache : SiteBuilder.Mvc.Caching.IStorefrontCache
        {
            public static DummyStorefrontCache Default = new DummyStorefrontCache();
            public T Get<T>(string key, CacheScope scope = CacheScope.Site, StorefrontCacheTypes cacheType = StorefrontCacheTypes.Default)
            {
                return default(T);
            }

            public void Set(string key, object value, CacheScope scope = CacheScope.Site, StorefrontCacheTypes cacheType = StorefrontCacheTypes.Default, Func<object, object> updateCallback = null, IList<string> filePaths= null)
            {

            }
        }
        static ServiceClientResponse<T> Response<T>(T obj)
        {
            return new ServiceClientResponse<T>
            {
                HasException = false,
                ReadAsAsync = () => Task.FromResult(obj),
                ReadAsSync = () => obj,
                ReadException = () => null,
                ResponseMessage = new System.Net.Http.HttpResponseMessage(System.Net.HttpStatusCode.OK)
            };
        }
    }

    [TestFixture, Category("CustomRoutes")]
    public class BfCustomRouteTests
    {
        public class TestCase
        {
            public override string ToString()
            {
                return Name ?? Url;
         }
            public string Name { get; set; }
            public string Url { get; set; }

            public Action<CustomRouteHandler> RouteAction { get; set; }
            public Action<HttpContext> ValidateRequest { get; set; }
            public Action<CustomRoute> ValidateRoute{ get; set; }
            public Action <CustomRouteHandler , CategoryTree , Mozu.SiteBuilder.Mvc.Helpers.UrlHelper> DoLinkStuff { get; set; }

        }
        public static IEnumerable<TestCase> GetTests()
        {
            yield return new TestCase()
            {
                Name = "prod variant",
                Url = "/pslug/p/pcode?vpc=pvarcode",
                ValidateRoute = route =>
                {
                   // Assert.AreEqual(route.InternalRoute, FancyRoute.ProductDetails );

                },
                ValidateRequest = req =>
                {
                   // Assert.AreEqual((string)req.GetRouteData().Values["variationProductCode"], "pvarcode");
                },
                DoLinkStuff = (handler, tree, urlhelper) =>
                {
                    var product = new Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Product()
                    {
                        ProductCode = "pcode",
                        Content = new UX.Models.StoreFront.Catalog.ProductContent()
                        {
                            SEOFriendlyUrl = "pslug"
                        }
                    };
                    
                    var link = urlhelper.MakeUrl(Mozu.SiteBuilder.Mvc.Helpers.UrlHelper.UrlType.Product, product, new Dictionary<string, object> { { "variant", "pvarcode" } });
                    Assert.AreEqual(link, "/pslug/p/pcode?vpc=pvarcode");
                }
            };


            yield return new TestCase()
            {
                Name = "sale sub cat",
                Url = "/sale/women",
                ValidateRoute = route =>
                {
                    Assert.AreEqual(route.InternalRoute, FancyRoute.Category);
                   
                },
                ValidateRequest= req =>
                {
                    Assert.AreEqual((string)req.GetRouteData().Values["categorySlug"], "women");
                },
                DoLinkStuff= (handler, tree, urlhelper) =>
                {
                    var otherCat = tree.FindById(32);
                    var catMap = Mapper.Map<IDictionary<string, object>>(otherCat);
                    var url = handler.GetCanonicalUrl(FancyRoute.Category, () => catMap, true);
                    Assert.AreEqual(url, "/sale/women/clothing/dresses");
                }
            };

            yield return new TestCase()
            {
                Name = "sale with filter clear",
                Url = "/sale/women/diesel",
                ValidateRoute = route =>
                {
                    Assert.AreEqual(route.InternalRoute, FancyRoute.Category);

                },
                ValidateRequest = req =>
                {
                    Assert.AreEqual((string)req.GetRouteData().Values["categorySlug"], "women");
                },
                DoLinkStuff = (handler, tree, urlhelper) =>
                {
                    var clearLinks = urlhelper.MakeUrl(SiteBuilder.Mvc.Helpers.UrlHelper.UrlType.Facet, "clear", null, false);
                    Assert.AreEqual(clearLinks, "/sale/women");

                }
            };



            yield return new TestCase()
            {
                Name = "search and validate categoryurl",
                Url = "/search?query=food&facetValueFilter=tenant~brand%3acitizens-of-humanity%2ctenant~brand%3adl1961-premium-denim",
               
                DoLinkStuff = (handler, tree, urlhelper) =>
                {
                    var otherCat = tree.FindById(32);
                    var clearLinks = urlhelper.MakeUrl(SiteBuilder.Mvc.Helpers.UrlHelper.UrlType.Category, otherCat, null, false);
                    Assert.AreEqual(clearLinks, "/women/clothing/dresses");

                }
            };



            yield return new TestCase()
            {
                Name = "cat with facet",
                Url = "/women?facetValueFilter=tenant~brand%3acitizens-of-humanity%2ctenant~brand%3adl1961-premium-denim",
                ValidateRoute = route =>
                {
                    Assert.AreEqual(route.InternalRoute, FancyRoute.Category);

                },
                ValidateRequest = req =>
                {
                    Assert.AreEqual((string)req.GetRouteData().Values["categorySlug"], "women");
                },
                DoLinkStuff = (handler, tree, urlhelper) =>
                {
                    var facet = new Mozu.ProductRuntime.Contracts.FacetValue()
                    {
                        ChildrenFacetValues = new List<ProductRuntime.Contracts.FacetValue>(),
                        Value = "32"
                    };
                  
                    var url = urlhelper.MakeUrl(SiteBuilder.Mvc.Helpers.UrlHelper.UrlType.Facet, facet, null);
                  
                    Assert.AreEqual(url, "/women/clothing/dresses?facetValueFilter=tenant%7ebrand%3acitizens-of-humanity%2ctenant%7ebrand%3adl1961-premium-denim");

                }
            };
        }

        [Test]
        [TestCaseSource("GetTests")]
        public void Run(TestCase test )
        {
            //  CustomRouteHandler handler = new CustomRouteHandler();


            Mapper.Reset();
            Mapper.Initialize(x =>
           {
               x.AddProfile<UX.Areas.StoreFront.ModelMapping.ProductMapping>();
           });
            //Mapper.AddProfile<Mozu.SiteBuilder.UX.Areas.StoreFront.ModelMapping.ProductMapping>();
            var subber = new AutoSubstitute();
            subber.Provide<IRouteConfig>(new RouteConfig());
            var sbapiContext = subber.ResolveAndSubstituteFor<ISiteBuilderApiContext>();
            var pc = subber.ResolveAndSubstituteFor<IPageContext>();
         
            var logger = subber.ResolveAndSubstituteFor<ILogger>();
            var cache = new MemoryCache(new MemoryCacheOptions());
            subber.Provide(cache);
            var httpCtx = new DefaultHttpContext();
            subber.Provide<HttpContext>(httpCtx);
            httpCtx.Request.Path = test.Url;
            httpCtx.Request.Host = new HostString("localhost");
            httpCtx.Request.Scheme = "http";
            httpCtx.Request.Method = "GET";
            pc.Url.Returns(httpCtx.GetRequestUri().ToString());
         
            //reqMessage.SetRouteData(new HttpRouteData(new HttpRoute(), new HttpRouteValueDictionary()));
            var sc = new SearchContext(httpCtx);
            pc.Search = sc;
            //subber.Provide<HttpRequestMessage>(reqMessage);
            var scope = new LifetimeScopeProxy(subber.Container);

            var lt=scope;
            //var xx=lt.Resolve<HttpRequestMessage>();

            httpCtx.Items["MS_DependencyScope"] = scope;

            InitServices(subber);

            subber.Provide<ICustomRouteConstraintFactory>(subber.Resolve<ConstraintFactory>());
            subber.Provide<IRouteDataMappingFactory>(subber.Resolve<RouteMappingFactory>());

            var custRepo = subber.ResolveAndSubstituteFor<CustomRouteRepository>();
            var lazyRepo = new Lazy<ICustomRouteCollectionRepository>(() => custRepo);
            subber.Provide(lazyRepo);

            var catTreeProvider = subber.ResolveAndSubstituteFor<RuntimeCategoryTreeProvider>();
            subber.Provide<ICategoryTreeProvider>(catTreeProvider);
            var yyy = lt.Resolve<ICategoryTreeProvider>();

            var sbContextProvider = lt.Resolve<ISiteBuilderContextProvider>();
            var sbCtxData = sbContextProvider.GetContextDataAsync().Result;

            var catTree = catTreeProvider.GetAllCategories();
            var customRouteRepo = subber.ResolveAndSubstituteFor<CustomRouteHandler>();
            subber.Provide<ICustomRouteHandler>(customRouteRepo);
            var urlHelper = subber.ResolveAndSubstituteFor<Mozu.SiteBuilder.Mvc.Helpers.UrlHelper>();

            customRouteRepo.RouteIncomingRequest(new RouteContext(httpCtx));

            customRouteRepo.GetCanonicalUrl(FancyRoute.Category, () => new Dictionary<string, object>(), true);

            test.ValidateRequest?.Invoke(httpCtx);
            test.ValidateRoute?.Invoke(httpCtx.GetRouteData().Routers.OfType<CustomRoute>().FirstOrDefault());

            test.DoLinkStuff?.Invoke(customRouteRepo, catTree, urlHelper);
        }

        static T GetResource<T>(string name)
        {
            var ass = typeof(BfCustomRouteTests).Assembly;
            var rname = ass.GetManifestResourceNames().First(x => x.EndsWith(name+".json", StringComparison.OrdinalIgnoreCase));
            var str= ass.GetManifestResourceStream(rname);
            Newtonsoft.Json.JsonSerializer ser = new JsonSerializer();
            return ser.Deserialize<T>(new JsonTextReader(new StreamReader(str)));
        }

        void InitServices(AutoSubstitute subber)
        {
            var attrClient = Substitute.For<IAttributeWebApiClient, ICloneable>();
            (attrClient as ICloneable).Clone().Returns(attrClient);
            attrClient.Handler.ReturnsForAnyArgs(new TestHandler());
            subber.Provide<IAttributeWebApiClient>(attrClient);

            attrClient.GetAttributeVocabularyValues(Arg.Any<string>()).ReturnsForAnyArgs(x =>
            {
                var att = (string)x.Args()[0];
                var res = Task.FromResult(Response(GetResource<List<ProductAdmin.Contracts.AttributeVocabularyValue>>("IAttributeWebApiClient.GetAttributeVocabularyValues." + att)));
                return res;
            });

            var searchClient = Substitute.For<IProductSearchWebApiClient, ICloneable>();
            (searchClient as ICloneable).Clone().Returns(searchClient);
            searchClient.Handler.ReturnsForAnyArgs(new TestHandler());
            subber.Provide<IProductSearchWebApiClient>(searchClient);
       
            searchClient.Search().ReturnsForAnyArgs(x =>
            {
                var att =(string)x.Args()[4];
                var searchResult = Task.FromResult(Response(GetResource<ProductRuntime.Contracts.ProductSearchResult>("IProductSearchWebApiClient.Search."+ att)));
                return searchResult;
            });

          //  GetResource<ProductRuntime.Contracts.ProductSearchResult>("IProductSearchWebApiClient.Search." + x.Arg<string>()));
           
            //searchClient.Search(facet:"tenant~brand").Returns(Task.FromResult(Response(searchResultBrand)));
           // searchClient.Search(facet: "tenant~colorgroup").Returns(Task.FromResult(Response(searchResultColorGruop)));

            var catClient = Substitute.For<IProductCategoryRuntimeWebApiClient, ICloneable>();
            (catClient as ICloneable).Clone().Returns(catClient);
            catClient.Handler.ReturnsForAnyArgs(new TestHandler());

            ((IServiceClientBase<IProductCategoryRuntimeWebApiClient>)catClient).Options = new ConfigOptions();

            subber.Provide<IProductCategoryRuntimeWebApiClient>(catClient);
            var catTree = GetResource<ProductRuntime.Contracts.CategoryCollection>("IProductCategoryRuntimeWebApiClient.GetCategoryTree");
            catClient.GetCategoryTree().ReturnsForAnyArgs(Task.FromResult(Response(catTree)));
            catClient.Handler.ReturnsForAnyArgs(new TestHandler());


            var docClient = Substitute.For<IDocumentListWebApiClient, ICloneable>();
            (docClient as ICloneable).Clone().Returns(docClient);
            docClient.Handler.ReturnsForAnyArgs(new TestHandler());
            subber.Provide<IDocumentListWebApiClient>(docClient);


            var genSettingsClient = Substitute.For<IGeneralSettingsWebApiClient, ICloneable>();
            (genSettingsClient as ICloneable).Clone().Returns(genSettingsClient);
            genSettingsClient.Handler.ReturnsForAnyArgs(new TestHandler());
            subber.Provide<IGeneralSettingsWebApiClient>(genSettingsClient);
            var genSettings = GetResource<SiteSettings.General.Contracts.GeneralSettings>("IGeneralSettingsWebApiClient.GetGeneralSettings");
            genSettingsClient.GetGeneralSettings(Arg.Any<string>(), Arg.Any<TargetContextLevelType>()).ReturnsForAnyArgs(Task.FromResult(Response(genSettings)));


            var mockSitebuilderContextCacheRepository = Substitute.For<ISitebuilderContextCacheRepository>();
            mockSitebuilderContextCacheRepository.GetAsync(Arg.Any<ISiteBuilderApiContext>()).Returns(Task.FromResult< ISiteBuilderContextData>(null));
            subber.Provide<ISitebuilderContextCacheRepository>(mockSitebuilderContextCacheRepository);
            subber.Provide<IContextServiceAggregator, ContextServiceAggregator>(); ;
            subber.Provide<Lazy<IContextServiceAggregator>>(new Lazy<IContextServiceAggregator>(() => subber.Resolve<ContextServiceAggregator>()));
            //subber.Provide < IContextServiceAggregator ,ContextServiceAggregator>();
            subber.Provide<ISiteBuilderContextDataRepository, SiteBuilderContextDataRepository>();

            subber.Provide<ISiteBuilderContextProvider, SiteBuilderContextProvider>();
        }

        static ServiceClientResponse<T> Response<T>(T obj)
        {
            return new ServiceClientResponse<T>
            {
                HasException = false,
                ReadAsAsync = () => Task.FromResult(obj),
                ReadAsSync = () => obj,
                ReadException = () => null,
                ResponseMessage = new System.Net.Http.HttpResponseMessage(System.Net.HttpStatusCode.OK)
            };
        }
    }
}
