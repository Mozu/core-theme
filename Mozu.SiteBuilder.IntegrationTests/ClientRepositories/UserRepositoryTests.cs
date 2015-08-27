//using System;
//using System.Reflection;
//using Autofac;
//using NUnit.Framework;
//using Should;
//using Mozu.Core.Configuration;
//using Volusion.ProductService.DataContracts.Administration;
//using Mozu.SiteBuilder.ClientRepositories;
//using Mozu.SiteBuilder.ClientRepositories.ServiceClient;
//using Mozu.SiteBuilder.Mvc;
//using Mozu.User.Contracts;

//namespace Mozu.SiteBuilder.IntegrationTests.ClientRepositories
//{
//    [TestFixture]
//    public class UserRepositoryTests
//    {
//        [Test]
//        public void GetTest()
//        {
//            /*var container = new AutofacContainerFactory()
//                      .UsingAssembly(Assembly.Load("Mozu.Core"))
//                      .UsingAssembly(Assembly.Load("Mozu.SiteBuilder.Mvc"))
//                      .UsingAssembly(Assembly.Load("Mozu.SiteBuilder.ClientRepositories"))
//                      .UsingAssembly(Assembly.GetExecutingAssembly())
//                      .UsingBuildAction(b => b.Register(c => new SiteBuilderContext { SiteId = 1 }).As<ISiteBuilderContext>())
//                      .Build();

//            var restclientFactory = container.Resolve<Func<Func<Category, object>, IServiceClient<User>>>();
//            var restclient = restclientFactory(d => d.CategoryId);
//            var category = restclient.Get(140);
//            category.ShouldNotBeNull();*/
//        }
//    }
//}

