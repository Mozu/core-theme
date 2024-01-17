using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using NUnit.Framework;
using Autofac;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Mozu.Core.Configuration;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using NSubstitute;
using UrlHelper = Mozu.SiteBuilder.Mvc.Helpers.UrlHelper;

namespace Mozu.SiteBuilder.UnitTests.Mvc.Tags
{
    [Category("Hypr")]
    [Category("MakeUrl")]
    [TestFixture]
    public class MakeUrlTests: TemplateTestBase
    {
        [Test, TestCaseSource("GetTests")]
        public void MakeUrl(TestDescriptor desc)
        {
            RunTemplate(desc);
        }

        [Test, TestCaseSource("GetSearchPageTests")]
        public void MakeUrlSearchPage(TestDescriptor desc)
        {
            RunTemplate(desc);
        }
        private static List<TestDescriptor> GetTests()
        {
            var ctx = new DefaultHttpContext();
            ctx.Request.Path = "/foo";
            ctx.Request.Host = new HostString("localhost");
            ctx.Request.Method = "GET";
            ctx.Request.Scheme = "http";

            var sc = Substitute.For<ISiteContext>();
            sc.ThemeSettings = new SiteBuilder.Mvc.Themes.ThemeRuntimeSettingsCollection(new Dictionary<string, object>(), new byte[0] { }, DateTime.MaxValue);
            sc.CdnPrefix.Returns("//cdn/1-m2");
            sc.GeneralSettings = new UX.Models.Settings.GeneralSettings()
            {
                CdnCacheBustKey = "123"
            };
            var customRouteHandler = Substitute.For<ICustomRouteHandler>();
            customRouteHandler.GetCanonicalUrl(NSubstitute.Arg.Any<SiteSettings.General.Contracts.General.Routing.FancyRoute>()  , NSubstitute.Arg.Any<Func<IDictionary<string, object>>>(), NSubstitute.Arg.Any<bool>()).Returns((string)null);
            var catTreeProvider = Substitute.For<ICategoryTreeProvider>();
            var catTree = new CategoryTree
            {
                AllCategories = new List<Category>() {new Category() {CategoryId = 66, CategoryCode = "steve"}}
            };
            catTreeProvider.GetAllCategories().Returns(catTree);
            var pc = Substitute.For<IPageContext>();
            pc.Search = new SearchContext(ctx);
            pc.Url = ctx.GetRequestUri().ToString();

            var ac = Substitute.For<ISiteBuilderApiContext>();
            
            var urlHelper = new UrlHelper(sc, ac, pc, customRouteHandler, ctx, new Lazy<ICategoryTreeProvider>(()=> catTreeProvider));

            void ContainerMods(IServiceCollection cb)
            {
                cb.AddScoped(c => sc);
                cb.AddScoped(c => pc);
                cb.AddScoped(c => urlHelper);
            }

            return new List<TestDescriptor>
            {
                new TestDescriptor
                {
                    Name = "cdn",
                    Template = @"{% make_url ""cdn"" ""/foo.png"" %}",
                    ContainerModifier = ContainerMods,
                    ExpectedFunc = TestDescriptor.CompareLiteral("//cdn/1-m2/foo.png?_mzcb=123")
                },
              
                new TestDescriptor
                {
                    Name = "image1",
                    Template = @"{% make_url ""image"" product.mainImage with max=50 as_paramater %}",
                    ContainerModifier = ContainerMods,
                    Context = new Dictionary<string, object>() { { "product", new Product() {
                       Content = new ProductContent() {
                        ProductImages =new ProductImageCollection { new ProductImage() {  ImageUrl="//cdn/1/foo.jpg"} } } }} },
                    ExpectedFunc = TestDescriptor.CompareLiteral("//cdn/1/foo.jpg?max=50&_mzcb=123")
                },
                 new TestDescriptor
                {
                    Name = "image2",
                    Template = @"{% make_url ""image"" product.mainImage with max=50 as_paramater %}",
                    ContainerModifier = ContainerMods,
                    Context = new Dictionary<string, object>() { { "product", new Product() {
                       Content = new ProductContent() {
                        ProductImages =new ProductImageCollection { new ProductImage() {  ImageUrl="/foo.jpg"} } } }} },
                    ExpectedFunc = TestDescriptor.CompareLiteral("//cdn/1-m2/foo.jpg?max=50&_mzcb=123")
                },
                   new TestDescriptor
                {
                    Name = "paging1",
                    Template = @"{% make_url ""paging"" productCol with page=""next"" as_paramater %}",
                    ContainerModifier = ContainerMods,
                    Context = new Dictionary<string, object>() { { "productCol", new ProductCollection() {
                        StartIndex=50,
                        PageSize = 10,
                        PageCount = 10,
                        TotalCount =100
                    } } },
                    ExpectedFunc = TestDescriptor.CompareLiteral("?startIndex=60")
                },
                       new TestDescriptor
                {
                    Name = "paging previous",
                    Template = @"{% make_url ""paging"" productCol with page=""previous"" as_paramater %}",
                    ContainerModifier = ContainerMods,
                    Context = new Dictionary<string, object>() { { "productCol", new ProductCollection() {
                        StartIndex=10,
                        PageSize = 10,
                        PageCount = 10,
                        TotalCount =100
                    } } },
                    ExpectedFunc = TestDescriptor.CompareLiteral("?")
                },
                new TestDescriptor
                {
                    Name = "sortby_withParams",
                    Template = @"{% make_url ""sorting"" productCol with sortBy=""price:desc"" as_paramater %}",
                    ContainerModifier = ContainerMods,
                       Context = new Dictionary<string, object>() { { "productCol", new ProductCollection() {
                        StartIndex=50,
                        PageSize = 10,
                        PageCount = 10,
                        TotalCount =100
                    } } },
                    ExpectedFunc = TestDescriptor.ContainsLiteral("sortBy=price%3adesc")
                },
                 new TestDescriptor
                {
                    Name = "sortby_without_Params",
                    Template = @"{% make_url ""sorting"" ""price:desc""  %}",
                    ContainerModifier = ContainerMods,
                       Context = new Dictionary<string, object>() { { "productCol", new ProductCollection() {
                        StartIndex=50,
                        PageSize = 10,
                        PageCount = 10,
                        TotalCount =100
                    } } },
                    ExpectedFunc = TestDescriptor.ContainsLiteral("sortBy=price%3adesc")
                },
                 new TestDescriptor
                {
                    Name = "categoryFacet clears faceting",
                    Template = @"{% make_url ""facet"" facetValue %}",
                    ContainerModifier = builder => {
                        ContainerMods(builder);
                        builder.AddScoped(
                            bctx => {
                                var hctx = new DefaultHttpContext();
                                hctx.Request.Path = "/foo";
                                hctx.Request.QueryString = new QueryString("?startIndex=100");
                                hctx.Request.Scheme = "http";
                                hctx.Request.Method = "GET";

                                bctx.Resolve<PageContext>().Search = new SearchContext(hctx);
                                return bctx.Resolve<PageContext>();
                            }
                        );
                    },
                       Context = new Dictionary<string, object>() { { "facetValue", new Mozu.ProductRuntime.Contracts.FacetValue() {
                       ChildrenFacetValues = new List<ProductRuntime.Contracts.FacetValue>(),
                       Value = "66"

                    } } },
                    ExpectedFunc = actual =>
                    {
                        if(actual.Contains("/c/66") && !actual.Contains("startIndex")) {return Tuple.Create(true, string.Empty); } else {return Tuple.Create(false, "the expected value either contained the wrong category url or contained a startindex query param, which was unexpected."); }
                    }
                },
                  new TestDescriptor
                {
                    Name = "categoryFacet",
                    Template = @"{% make_url ""facet"" facetValue %}",
                    ContainerModifier = ContainerMods,
                    Context = new Dictionary<string, object>() { { "facetValue", new Mozu.ProductRuntime.Contracts.FacetValue() {
                        ChildrenFacetValues = new List<ProductRuntime.Contracts.FacetValue>(),
                        Value = "66"
                    }}},
                    ExpectedFunc = TestDescriptor.ContainsLiteral("c/66")
                },
                 new TestDescriptor
                {
                    Name = "categoryFacet",
                    Template = @"{% make_url ""facet"" facetValue %}",
                    ContainerModifier = ContainerMods,
                    Context = new Dictionary<string, object>() { { "facetValue", new Mozu.ProductRuntime.Contracts.FacetValue() {
                        ChildrenFacetValues = new List<ProductRuntime.Contracts.FacetValue>(),
                        Value = "12/16/2020 18:30:00",
                        FilterValue = "tenant~date:12/16/2020 18:30:00"
                    }}},
                    ExpectedFunc = TestDescriptor.ContainsLiteral("?facetValueFilter=tenant%7edate%3a12%2f16%2f2020+18%3a30%3a00")
                },
                 new TestDescriptor
                {
                    Name = "categoryFacet",
                    Template = @"{% make_url ""facet"" facetValue %}",
                    ContainerModifier = ContainerMods,
                    Context = new Dictionary<string, object>() { { "facetValue", new Mozu.ProductRuntime.Contracts.FacetValue() {
                        ChildrenFacetValues = new List<ProductRuntime.Contracts.FacetValue>(),
                        Value = "12/16/2020 18:30:00",
                        FilterValue = "tenant~date"
                    }}},
                    ExpectedFunc = TestDescriptor.ContainsLiteral("#")
                },
                 new TestDescriptor
                {
                    Name = "categoryFacet",
                    Template = @"{% make_url ""facet"" facetValue %}",
                    ContainerModifier = ContainerMods,
                    Context = new Dictionary<string, object>() { { "facetValue", new Mozu.ProductRuntime.Contracts.FacetValue() {
                        ChildrenFacetValues = new List<ProductRuntime.Contracts.FacetValue>(),
                        Value = "2.0",
                        FilterValue = "price:2.0"
                    }}},
                    ExpectedFunc = TestDescriptor.ContainsLiteral("?facetValueFilter=price%3a2.0")
                },
                 new TestDescriptor
                {
                    Name = "categoryFacet",
                    Template = @"{% make_url ""facet"" facetValue %}",
                    ContainerModifier = ContainerMods,
                    Context = new Dictionary<string, object>() { { "facetValue", new Mozu.ProductRuntime.Contracts.FacetValue() {
                        ChildrenFacetValues = new List<ProductRuntime.Contracts.FacetValue>(),
                        Value = "2.0",
                        FilterValue = ""
                    }}},
                    ExpectedFunc = TestDescriptor.ContainsLiteral("#")
                },
                  new TestDescriptor
                {
                    Name = "document",
                    Template = @"{% make_url ""document"" doc %}",
                    ContainerModifier = ContainerMods,
                    Context = new Dictionary<string, object>() { { "doc", new Mozu.Content.Contracts.Document() {Name="steve", ListFQN="food@fart" } } },
                    ExpectedFunc = TestDescriptor.ContainsLiteral("/steve")
                },
                    new TestDescriptor
                {
                    Name = "product",
                    Template = @"{% make_url ""product"" productCode %}",
                    ContainerModifier = ContainerMods,
                    Context = new Dictionary<string, object>() { { "productCode", "abcd" }},
                    ExpectedFunc = TestDescriptor.ContainsLiteral("p/abcd")
                },
                    new TestDescriptor
                {
                    Name = "productStringCode",
                    Template = @"{% make_url ""product"" ""abcd"" %}",
                    ContainerModifier = ContainerMods,
                    Context = new Dictionary<string, object>(),
                    ExpectedFunc = TestDescriptor.ContainsLiteral("p/abcd")
                },
                new TestDescriptor
                {
                    Name = "productCodeWithQuerystring",
                    Template = @"{% make_url ""product"" ""abcd"" with test=""true"" %}",
                    ContainerModifier = ContainerMods,
                    Context = new Dictionary<string, object>(),
                    ExpectedFunc = TestDescriptor.CompareLiteral("/p/abcd?test=true")
                },
                    new TestDescriptor
                {
                    Name = "productVariant",
                    Template = @"{% make_url ""product"" productCode with variant=""purple-small"" as_paramater %}",
                    ContainerModifier = ContainerMods,
                    Context = new Dictionary<string, object>() { { "productCode", "abcd" }},
                    ExpectedFunc = TestDescriptor.ContainsLiteral("p/abcd?vpc=purple-small")
                },
                    new TestDescriptor
                {
                    Name = "productVariantObject",
                    Template = @"{% make_url ""product"" product with variant=""purple-small"" as_paramater %}",
                    ContainerModifier = ContainerMods,
                    Context = new Dictionary<string, object>() { { "product", new Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Product
                    {
                        ProductCode = "abcd"
                    } }},
                    ExpectedFunc = TestDescriptor.ContainsLiteral("p/abcd?vpc=purple-small")
                },
                   new TestDescriptor
                {
                    Name = "productVariantObjectWithVpcParam",
                    Template = @"{% make_url ""product"" product with vpc=""purple-small"" as_paramater %}",
                    ContainerModifier = ContainerMods,
                    Context = new Dictionary<string, object>() { { "product", new Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Product
                    {
                        ProductCode = "abcd"
                    } }},
                    ExpectedFunc = TestDescriptor.ContainsLiteral("p/abcd?vpc=purple-small")
                },
                    new TestDescriptor
                {
                    Name = "productVariantObjectWithMultipleParameters",
                    Template = @"{% make_url ""product"" product with variant=""purple-small"" test=""true"" as_paramater %}",
                    ContainerModifier = ContainerMods,
                    Context = new Dictionary<string, object>() { { "product", new Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Product
                    {
                        ProductCode = "abcd"
                    } }},
                    ExpectedFunc = TestDescriptor.CompareLiteral("/p/abcd?vpc=purple-small&test=true")
                },
                    new TestDescriptor
                    {
                        Name = "productSliceValue",
                        Template = @"{% make_url ""product"" product with slicevalue=""purple"" as_parameter %}",
                        ContainerModifier = ContainerMods,
                        Context = new Dictionary<string, object>() { { "product", new Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Product
                        {
                            ProductCode = "abcd"
                        } }},
                        ExpectedFunc = TestDescriptor.CompareLiteral("/p/abcd?slicevalue=purple")
                    }
            };
        }
         
        private static List<TestDescriptor> GetSearchPageTests()
        {
            var ctx = new DefaultHttpContext();
            ctx.Request.Path = "/search";
            ctx.Request.Host = new HostString("localhost");
            ctx.Request.QueryString = new QueryString("?facetTemplate=categoryId:2&facetHierValue=categoryCode:_root&facetHierDepth=categoryCode:2&facetValueFilter=tenant~brand-name-attribute:3m&pageSize=30");
            ctx.Request.Scheme = "http";
            ctx.Request.Method = "GET";
            
            var sc = Substitute.For<ISiteContext>();
            sc.ThemeSettings = new SiteBuilder.Mvc.Themes.ThemeRuntimeSettingsCollection(new Dictionary<string, object>(), new byte[0] { }, DateTime.MaxValue);
            sc.CdnPrefix.Returns("//cdn/1-m2");
            sc.GeneralSettings = new UX.Models.Settings.GeneralSettings()
            {
                CdnCacheBustKey = "123"
            };
            var customRouteHandler = Substitute.For<ICustomRouteHandler>();
            customRouteHandler.GetCanonicalUrl(NSubstitute.Arg.Any<SiteSettings.General.Contracts.General.Routing.FancyRoute>()  , NSubstitute.Arg.Any<Func<IDictionary<string, object>>>(), NSubstitute.Arg.Any<bool>()).Returns((string)null);
            var catTreeProvider = Substitute.For<ICategoryTreeProvider>();
            var catTree = new CategoryTree
            {
                AllCategories = new List<Category>() { new Category() { CategoryId = 66, CategoryCode = "steve"}}
            };
            catTreeProvider.GetAllCategories().Returns(catTree);
            var pc = Substitute.For<IPageContext>();
            pc.PageType = "search";
            pc.Search = new SearchContext(ctx);
            pc.Url = ctx.GetRequestUri().ToString();

            var ac = Substitute.For<ISiteBuilderApiContext>();
            
            var urlHelper = new UrlHelper(sc, ac, pc, customRouteHandler, ctx, new Lazy<ICategoryTreeProvider>(()=> catTreeProvider));

            void ContainerMods(IServiceCollection cb)
            {
                cb.AddScoped(c => sc);
                cb.AddScoped(c => pc);
                cb.AddScoped(c => urlHelper);
            }
            /* Search Context LN 399 */
            return new List<TestDescriptor>
            {
                new TestDescriptor
                {
                    Name = "categoryFacet_on_search_page_no_query_parameter",
                    Template = @"{% make_url ""facet"" facetValue %}",
                    ContainerModifier = builder =>
                    {
                        ContainerMods(builder);
                        builder.AddScoped(
                            bctx =>
                            {
                                var hctx = new DefaultHttpContext();
                                hctx.Request.Path = "/search";
                                ctx.Request.QueryString = new QueryString("?facetTemplate=categoryId:2&facetHierValue=categoryCode:_root&facetHierDepth=categoryCode:2&facetValueFilter=tenant~brand-name-attribute:3m&pageSize=30");
                                hctx.Request.Scheme = "http";
                                hctx.Request.Method = "GET";

                                bctx.Resolve<PageContext>().Search = new SearchContext(hctx);
                                return bctx.Resolve<PageContext>();
                            }
                        );
                    },
                    Context = new Dictionary<string, object>()
                    {
                        {
                            "facetValue", new Mozu.ProductRuntime.Contracts.FacetValue()
                            {
                                ChildrenFacetValues = new List<ProductRuntime.Contracts.FacetValue>(),
                                Value = "66",
                                FilterValue = "categoryId:66"

                            }
                        }
                    },
                    ExpectedFunc = actual =>
                    {
                        Console.WriteLine(actual);
                        if (actual.Contains("categoryId=66"))
                        {
                            return Tuple.Create(true, string.Empty);
                        }
                        else
                        {
                            return Tuple.Create(false, "the expected value either contained the wrong category id or the category id is missing");
                            // return Tuple.Create(false, ".");
                        }
                    }
                }
            };
        }
    }
}
