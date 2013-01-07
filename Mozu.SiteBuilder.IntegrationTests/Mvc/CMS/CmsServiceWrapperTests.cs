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
        private IProvisioningHelper _provisingHelper;
        private ICmsTypeHelper _cmsTypeHelper;
        private IFolderWebApiClient _folderWebApiClient;
        private IFacetsWebApiClient _facetsWebApiClient;

        [Test, Ignore("TODO: Write tests for this fixture")]
        public void TEST()
        {
            GetWrapper();
        }

        private CmsServiceWrapper GetWrapper()
        {
            return new CmsServiceWrapper(_documentWebApiClient, _apiContext, _provisingHelper, _cmsTypeHelper, _folderWebApiClient, _facetsWebApiClient);
        }
    }
}
