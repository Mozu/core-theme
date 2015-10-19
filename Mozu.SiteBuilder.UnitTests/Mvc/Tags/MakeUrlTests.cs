using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http.Routing;
using NUnit.Framework;
using Autofac;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using NSubstitute;
using UrlHelper = Mozu.SiteBuilder.Mvc.Helpers.UrlHelper;

namespace Mozu.SiteBuilder.UnitTests.Mvc.Tags
{
    [Category("Hypr")]
    [TestFixture]
    public class MakeUrlTests: TemplateTestBase
    {
        [Test, TestCaseSource("GetTests")]
        public void Run(TestDescriptor desc)
        {
            RunTemplate(desc);
        }

       

        private static List<TestDescriptor> GetTests()
        {
            var req = new System.Net.Http.HttpRequestMessage(HttpMethod.Get, "http://localhost/foo");
            req.SetRouteData(new HttpRouteData(new HttpRoute()));
            var sc = Substitute.For<ISiteContext>();
            sc.ThemeSettings = new SiteBuilder.Mvc.Themes.ThemeRuntimeSettingsCollection(new Dictionary<string, SiteBuilder.Mvc.Themes.ThemeRuntimeSetting>(), new byte[0] { }, DateTime.MaxValue);
            sc.CdnPrefix.Returns("//cdn/1-m2");
            sc.GeneralSettings = new UX.Models.Settings.GeneralSettings()
            {
                CdnCacheBustKey = "123"
            };
            var customRouteHandler = Substitute.For<ICustomRouteHandler>();
            customRouteHandler.GetCanonicalUrl(NSubstitute.Arg.Any<SiteSettings.General.Contracts.General.Routing.FancyRoute>()  , NSubstitute.Arg.Any<Func<IDictionary<string, object>>>(), NSubstitute.Arg.Any<bool>()).Returns(Task<string>.FromResult((string)null));
            var catTreeProvider = Substitute.For<ICategoryTreeProvider>();
            var catTree = new CategoryTree();
            catTree.AllCategories = new List<Category>() { new Category() { CategoryId = 66, CategoryCode = "steve" } };
            catTreeProvider.GetAllCategories().Returns(Task.FromResult(catTree));
            var pc = Substitute.For<IPageContext>();
            pc.Search = new SearchContext(req)
            {

            };
            var ac = Substitute.For<ISiteBuilderApiContext>();
            
            var urlHelper = new UrlHelper(sc, ac, pc, customRouteHandler, req,new Lazy<ICategoryTreeProvider>(()=> catTreeProvider));
            Action<ContainerBuilder> containerMods = cb =>
           {
               cb.Register(c => sc).As<ISiteContext>();
               cb.Register(c => pc).As<IPageContext>();
               cb.Register(c => urlHelper).As<UrlHelper>();

           };
            

           
            return new List<TestDescriptor>
            {
                new TestDescriptor
                {
                    Name = "cdn",
                    Template = @"{% make_url ""cdn"" ""/foo.png"" %}",
                    ContainerModifier = containerMods,
                    ExpectedFunc = TestDescriptor.CompareLiteral("//cdn/1-m2/foo.png?_mzcb=123")
                },
              
                new TestDescriptor
                {
                    Name = "image1",
                    Template = @"{% make_url ""image"" product.mainImage with max=50 as_paramater %}",
                    ContainerModifier = containerMods,
                    Context = new Dictionary<string, object>() { { "product", new Product() {
                       Content = new ProductContent() {
                        ProductImages =new ProductImageCollection { new ProductImage() {  ImageUrl="//cdn/1/foo.jpg"} } } }} },
                    ExpectedFunc = TestDescriptor.CompareLiteral("//cdn/1/foo.jpg?max=50&_mzcb=123")
                },
                 new TestDescriptor
                {
                    Name = "image2",
                    Template = @"{% make_url ""image"" product.mainImage with max=50 as_paramater %}",
                    ContainerModifier = containerMods,
                    Context = new Dictionary<string, object>() { { "product", new Product() {
                       Content = new ProductContent() {
                        ProductImages =new ProductImageCollection { new ProductImage() {  ImageUrl="/foo.jpg"} } } }} },
                    ExpectedFunc = TestDescriptor.CompareLiteral("//cdn/1-m2/foo.jpg?max=50&_mzcb=123")
                },
                   new TestDescriptor
                {
                    Name = "paging1",
                    Template = @"{% make_url ""paging"" productCol with page=""next"" as_paramater %}",
                    ContainerModifier = containerMods,
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
                    Name = "sortby_withParams",
                    Template = @"{% make_url ""sorting"" productCol with sortBy=""price:desc"" as_paramater %}",
                    ContainerModifier = containerMods,
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
                    ContainerModifier = containerMods,
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
                    Name = "categoryFacet",
                    Template = @"{% make_url ""facet"" facetValue %}",
                    ContainerModifier = containerMods,
                       Context = new Dictionary<string, object>() { { "facetValue", new Mozu.ProductRuntime.Contracts.FacetValue() {
                       ChildrenFacetValues = new List<ProductRuntime.Contracts.FacetValue>(),
                       Value = "66"
                       
                    } } },
                    ExpectedFunc = TestDescriptor.ContainsLiteral("/c/66")
                },
                  new TestDescriptor
                {
                    Name = "document",
                    Template = @"{% make_url ""document"" doc %}",
                    ContainerModifier = containerMods,
                    Context = new Dictionary<string, object>() { { "doc", new Mozu.Content.Contracts.Document() {Name="steve", ListFQN="food@fart" } } },
                    ExpectedFunc = TestDescriptor.ContainsLiteral("/steve")
                },
            };
        }
         
    }
}
