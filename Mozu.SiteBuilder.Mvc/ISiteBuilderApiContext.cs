using System;
using Mozu.Core;

namespace Mozu.SiteBuilder.Mvc
{
    public interface ISiteBuilderApiContext : IApiContext
    {
        bool IsEditMode { get; set; }
        bool IsAdminMode { get; }
        bool IsDebugMode { get; set; }
        string VariationId { get; set; }

        DebugModeFlagValues DebugFlags { get; set; }
        void SetUser(LightweightUserClaims user);
        void SetDataMode(Mozu.Core.DataViewModeType dataViewMode);
        void SetPriceListCode(string plCode);
        string CurrencyCodeOverride { get; }
        LightweightUserClaims AdminUserClaim { get; set; }
        public bool IsSalesRep();
        public void SetUserClaim(LightweightUserClaims user);
    }
}
