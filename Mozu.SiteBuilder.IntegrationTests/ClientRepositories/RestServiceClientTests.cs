//using System;
//using System.Configuration;
//using System.Net.Http;
//using System.Reflection;
//using Autofac;
//using NUnit.Framework;
//using Should;
//using Mozu.Core.Configuration;
//using Mozu.Core.Logging;
//using Volusion.ProductService.DataContracts.Administration;
//using Mozu.SiteBuilder.ClientRepositories;
//using Mozu.SiteBuilder.ClientRepositories.Admin.ServiceClients;
//using Mozu.SiteBuilder.ClientRepositories.ServiceClient;
//using Mozu.SiteBuilder.Mvc;

//namespace Mozu.SiteBuilder.IntegrationTests.ClientRepositories
//{
//    [TestFixture]
//    public class RestServiceClientTests
//    {

//        /*[Test]
//        public void GetTest()
//        {
//            var handler = new WebRequestHandler
//            {
//                MaxRequestContentBufferSize = 4 * 1024 * 1024
//            };

//            // Create http client and set max response message size
//            var httpClient = new HttpClient(handler)
//            {
//                MaxResponseContentBufferSize = 4 * 1024 * 1024
//            };

//            /*ISiteBuilderContext siteContext = new SiteBuilderContext
//                                                {
//                                                    Id = 1,
//                                                    WebSiteId = 1
//                                                };#1#

//                var client = new CategoryRepository(f=> 
//                    new RestServiceClient<Category>(
//                        d=>d.CategoryId,
//                        new ResourceUriResolver(),
//                        httpClient, LoggingService.LoggerFor<RestServiceClientTests>()
//                        ));

//                var category = client.Get(140);
//                category.ShouldNotBeNull();
//        }

//        [Test]
//        public void GetAllTest()
//        {
//            var handler = new WebRequestHandler
//            {
//                MaxRequestContentBufferSize = 4 * 1024 * 1024
//            };

//            // Create http client and set max response message size
//            var httpClient = new HttpClient(handler)
//            {
//                MaxResponseContentBufferSize = 4 * 1024 * 1024
//            };

//            ISiteBuilderContext siteContext = new SiteBuilderContext
//            {
//                Id = 1,
//                WebSiteId = 1
//            };

//            var client = new CategoryRepository(f=> 
//                    new RestServiceClient<Category>(
//                        d=>d.CategoryId,
//                        new ResourceUriResolver(),
//                        httpClient, LoggingService.LoggerFor<RestServiceClientTests>()));
//                var category = client.List();
//                category.ShouldNotBeNull();
//        }*/
//    }


//    [TestFixture]
//    public class RestServiceClientWithAutofacTests
//    {

//        [Test]
//        public void GetTest()
//        {
//             /*var container = new AutofacContainerFactory()
//                        .UsingAssembly(Assembly.Load("Mozu.Core"))
//                        .UsingAssembly(Assembly.Load("Mozu.SiteBuilder.Mvc"))
//                        .UsingAssembly(Assembly.Load("Mozu.SiteBuilder.ClientRepositories"))
//                        .UsingAssembly(Assembly.GetExecutingAssembly())
//                        .UsingBuildAction(b => b.Register(c=> new SiteBuilderContext{Id = "1"}).As<ISiteBuilderContext>())
//                        .Build();

//            var restclientFactory = container.Resolve<Func<Func<Category, object>, IServiceClient<Category>>>();
//            var restclient = restclientFactory(d => d.CategoryId);
//            var category = restclient.Get(140);
//            category.ShouldNotBeNull();*/
//        }

//        [Test]
//        public void GetTest2()
//        {
//            var config = ConfigurationManager.AppSettings["ResourceUriList"];
//            var container = new AutofacContainerFactory()
//                      .UsingAssembly(Assembly.Load("Mozu.Core"))
//                      .UsingAssembly(Assembly.Load("Mozu.SiteBuilder.Mvc"))
//                      .UsingAssembly(Assembly.Load("Mozu.SiteBuilder.ClientRepositories"))
//                      .UsingBuildAction(b => b.Register(c => new SiteBuilderContext { Id = "1" }).As<ISiteBuilderContext>())
//                      .UsingAssembly(Assembly.GetExecutingAssembly())
//                      .Build();

//            using (var lifetimeScope = container.BeginLifetimeScope())
//            {
//                var client = lifetimeScope.Resolve<ICategoryServiceClient>();
//                var category = client.Get(140);
//                client.Get(141);
//                client.Get(142);
//                category.ShouldNotBeNull();
//            }
//        }

//        [Test]
//        public void GetTest3()
//        {
//            var config = ConfigurationManager.AppSettings["ResourceUriList"];
//            var container = new AutofacContainerFactory()
//                      .UsingAssembly(Assembly.Load("Mozu.Core"))
//                      .UsingAssembly(Assembly.Load("Mozu.SiteBuilder.Mvc"))
//                      .UsingAssembly(Assembly.Load("Mozu.SiteBuilder.ClientRepositories"))
//                      .UsingBuildAction(b => b.Register(c => new SiteBuilderContext { Id = "1" }).As<ISiteBuilderContext>())
//                      .UsingAssembly(Assembly.GetExecutingAssembly())
//                      .Build();

//            using (var lifetimeScope = container.BeginLifetimeScope())
//            {
//                var client = lifetimeScope.Resolve<ICategoryServiceClient>();
//                var category = client.Get(1204);
//                client.Get(1205);
//                client.Get(1278);
//                category.ShouldNotBeNull();
//            }
//        }
//    }
//}

