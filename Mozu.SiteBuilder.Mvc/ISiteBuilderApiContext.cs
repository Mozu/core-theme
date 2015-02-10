using System;
using Mozu.Core;

namespace Mozu.SiteBuilder.Mvc
{
    public interface ISiteBuilderApiContext : IApiContext
    {
        bool IsEditMode { get; set; }
        bool IsDebugMode { get; set; }
        void SetUser(LightweightUserClaims user);
        DateTime Now { get;  }
        void SetDataMode(Mozu.Core.DataViewModeType  dataViewMode);
    }
}
