using System;
using Mozu.Core;

namespace Mozu.SiteBuilder.Mvc
{
    public interface ISiteBuilderApiContext : IApiContext
    {
        string CmsDraftState { get; }
     
        void SetUser(LightweightUserClaims user);
    }
}
