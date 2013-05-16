using System;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Settings;
using Mozu.Tenant.Contracts.Clients;

namespace Mozu.SiteBuilder.Mvc
{
    public interface IUniversalSiteApiClient : ISitesWebApiClient
    {
    }


    /// <summary>
    /// TODO: what does this class do.
    /// </summary>
    public class UniversalSiteApiClient : SitesWebApiClient, IUniversalSiteApiClient
    {
        private readonly ISettings _setting;
        private const int VOLUSIONSITEID = 0;
        private const int VOLUSIONTENANTID = 0;

        public UniversalSiteApiClient(ISettings setting)
            : base(new ServiceClientMessageHandler(new ApiContext() { SiteId = VOLUSIONSITEID, TenantId = VOLUSIONTENANTID }, setting))
        {
            _setting = setting;
        }
    }

}
