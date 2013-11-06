using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.AppManagement
{
    public class Application
    {
        public string AppId { get; set; }

        public string UIConfigurationUrl { get; set; }

        public List<Capability> Crapabilities { get; set; }

       // public Entitlement Entitlement { get; set; }

        public bool? Initialized { get; set; }

        public bool? Enabled { get; set; }



        public int EntitlementId { get; set; }
        public int EntitlementApplicationVersionId { get; set; }
        //public AuditInfo AuditInfo { get; set; }
    }

    //public enum CapabilityMode
    //{
    //    SinglePerSite,
    //    SinglePerMasterCatalog,
    //    SinglePerSitePerShippingCountry,
    //    SinglePerSitePerShoppingCountry,
    //    SinglePerSitePerCreditType,
    //    SinglePerShoppingCountry,
    //}

    public class Capability
    {
        public string Id { get; set; }
        public string AppId { get; set; }
        public string UIConfigurationUrl { get; set; }




        public string CapabilityType { get; set; }
       
        public string CapabilityMode { get; set; }

        public string ScopeType { get; set; }

        public int? ScopeId { get; set; }

        public bool? Initialized { get; set; }

        public bool? Enabled { get; set; }

        //public List<OperationUrl> OperationUrls { get; set; }

        //public List<InitializablePropertyValue> SupportedShoppingCountries { get; set; }

        //public List<string> ActiveShoppingCountries { get; set; }

        //public List<InitializableShippingCountryPropertyValue> SupportedShippingCountries { get; set; }

        //public List<ActiveShippingCountry> ActiveShippingCountries { get; set; }

        //public List<InitializablePropertyValue> SupportedCreditTypes { get; set; }

        //public List<string> ActiveCreditTypes { get; set; }

        public string uiSupportUrl { get; set; }
        public int EntitlementId { get; set; }
        public int EntitlementApplicationVersionId { get; set; }
        public string ApplicationName { get; set; }
        public string LicenseType { get; set; }
        public string DeveloperAccountName { get; set; }
        public DateTime? EffectivesStartDate { get; set; }
        public DateTime? EffectiveEndDate { get; set; }
        //public AuditInfo AuditInfo { get; set; }
    }

    //public class InitializableShippingCountryPropertyValue : Core.ThirdParty.Contracts.InitializablePropertyValueHierarchy<List<Core.ThirdParty.Contracts.InitializablePropertyValue>>
    //{
    //}
    //public class InitializablePropertyValue
    //{
    //    public string Value { get; set; }

    //    public bool Initialized { get; set; }
    //}
    //public class InitializablePropertyValueHierarchy<T> : InitializablePropertyValue
    //{
    //    public T Child { get; set; }
    //}

    //public class ActiveShippingCountry
    //{
    //    public string CountryCode { get; set; }

    //    public List<string> ActiveCarriers { get; set; }
    //}


    //public class OperationUrl
    //{
    //    public string Name { get; set; }

    //    public string Url { get; set; }
    //}
    //public class Entitlement
    //{
    //    [DataMember]
    //    public int Id { get; set; }

    //    [DataMember]
    //    public int TenantId { get; set; }

    //    [DataMember]
    //    public int? SiteId { get; set; }

    //    [DataMember]
    //    public int ApplicationVersionId { get; set; }

    //    [DataMember]
    //    public string ApplicationType { get; set; }

    //    [DataMember]
    //    public string ApplicationName { get; set; }

    //    [DataMember]
    //    public string ApplicationVersion { get; set; }

    //    [DataMember]
    //    public string AppId { get; set; }

    //    [DataMember]
    //    public string AppConfigUrl { get; set; }

    //    [DataMember]
    //    public string Status { get; set; }

    //    [DataMember]
    //    public string HeroImage { get; set; }

    //    [DataMember]
    //    public string ApplicationAssetPath { get; set; }

    //    [DataMember]
    //    public string DeveloperAccountName { get; set; }

    //    [DataMember]
    //    public DateTime PublishedDate { get; set; }

    //    [DataMember]
    //    public string LicenseType { get; set; }

    //    [DataMember]
    //    public DateTime? EffectivesStartDate { get; set; }

    //    [DataMember]
    //    public DateTime? EffectiveEndDate { get; set; }

    //    [DataMember]
    //    public DateTime CreateDate { get; set; }

    //    [DataMember]
    //    public DateTime UpdateDate { get; set; }
    //}
}