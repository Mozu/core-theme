using NSubstitute;
using NUnit.Framework;
using Mozu.Content.Contracts.Clients;
using Mozu.Core;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;

namespace Mozu.SiteBuilder.IntegrationTests.Mvc.CMS
{
    [TestFixture]
    public class CmsServiceWrapperTests
    {
        private IDocumentWebApiClient _documentWebApiClient;
        private IApiContext _apiContext;
        private ICmsTypeHelper _cmsTypeHelper;
        private IFolderWebApiClient _folderWebApiClient;
        private IFacetsWebApiClient _facetsWebApiClient;

        [SetUp]
        public void SetUp()
        {
            _documentWebApiClient = Substitute.For<IDocumentWebApiClient>();
            _apiContext = Substitute.For<IApiContext>();
            _cmsTypeHelper = Substitute.For<ICmsTypeHelper>();
            _folderWebApiClient = Substitute.For<IFolderWebApiClient>();
            _facetsWebApiClient = Substitute.For<IFacetsWebApiClient>();
        }

        [Test, Ignore("TODO: Write tests for this fixture")]
        public void TEST()
        {
            GetWrapper();
        }

        private CmsServiceWrapper GetWrapper()
        {
            return new CmsServiceWrapper(_documentWebApiClient, _apiContext, _cmsTypeHelper, _folderWebApiClient, _facetsWebApiClient);
        }
    }
}
