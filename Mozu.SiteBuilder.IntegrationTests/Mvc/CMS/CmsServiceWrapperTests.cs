//using System;
//using Mozu.Content.Contracts.Clients;
//using Mozu.SiteBuilder.Mvc;
//using Mozu.SiteBuilder.Mvc.CMS;
//using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;
//using NSubstitute;
//using NUnit.Framework;

//namespace Mozu.SiteBuilder.IntegrationTests.Mvc.CMS
//{
//    [TestFixture]
//    public class CmsServiceWrapperTests
//    {
//        private IDocumentListWebApiClient _documentWebApiClient;
//        private ISiteBuilderApiContext _apiContext;
//        private ICmsTypeHelper _cmsTypeHelper;


//        [SetUp]
//        public void SetUp()
//        {
//            _documentWebApiClient = Substitute.For<IDocumentListWebApiClient>();
//            _apiContext = Substitute.For<ISiteBuilderApiContext>();
//            _cmsTypeHelper = Substitute.For<ICmsTypeHelper>();

//        }

//        [Test, Ignore("TODO: Write tests for this fixture")]
//        public void TEST()
//        {
//            GetWrapper();
//        }

//        private CmsServiceWrappe2r GetWrapper()
//        {
//            return new CmsServiceWrapper(_documentWebApiClient, _apiContext, _cmsTypeHelper, null);
//        }
//    }
//}

