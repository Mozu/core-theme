using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models.AppManagement;
using Mozu.Tenant.Contracts;
using DC = Mozu.SiteSettings.Application.Contracts;


namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class CapabilityMapping : Profile
    {
        public override string ProfileName
        {
            get { return GetType().FullName; }
        }

        protected override void Configure()
        {
            Mapper.CreateMap<DC.Application, Application>()
                .ForMember(x => x.Capabilities, opt => opt.Ignore())
                .ConstructUsing(app =>
                {
                    if (app.Entitlement == null)
                    {
                        app.Entitlement = new Entitlement()
                                              {
                                                  ApplicationName ="tbd",
                                                  DeveloperAccountName = "tbd",
                                                  EffectiveEndDate = DateTime.Now.AddYears( 2),
                                                  EffectiveStartDate = DateTime.Now.AddDays(-30),
                                                  ApplicationVersionId=22,
                                                  LicenseType = "blurg"
                                              };
                    }
                    //http://<env_specific_devcenter_server>/console/storeprofile/<appversionid>/<localecode>
                    var a = new Application ()
                    {
                        AppId = app.AppId,
                        Initialized = app.Initialized,
                        Enabled = app.Enabled ,
                        Capabilities = app.Capabilities.Select( cap => new Capability()
                                                                           {
                                                                               AppId = app.AppId ,
                                                                               Id = cap.Id,
                                                                               UIConfigurationUrl = app.UIConfigurationUrl,
                                                                               CapabilityType = cap.CapabilityType ,
                                                                               CapabilityMode = cap.CapabilityMode ,
                                                                               ScopeId = cap.ScopeId ,
                                                                               ScopeType = cap.ScopeType ,
                                                                               Initialized = cap.Initialized,
                                                                               LicenseType = app.Entitlement.LicenseType,
                                                                               Enabled = cap.Enabled,
                                                                               EntitlementId = app.Entitlement.Id,
                                                                               uiSupportUrl = Mozu.Core.Settings.MozuConfigurationManager.DevCenterPath + "/storeprofile/" + app.Entitlement.ApplicationVersionId +"/en-US",
                                                                               EntitlementApplicationVersionId  = app.Entitlement.ApplicationVersionId ,
                                                                               ApplicationName = app.Entitlement.ApplicationName ,
                                                                               DeveloperAccountName = app.Entitlement.DeveloperAccountName ,
                                                                               EffectiveEndDate = app.Entitlement.EffectiveEndDate,
                                                                               EffectiveStartDate = app.Entitlement.EffectiveStartDate ,
                                                                               CreateDate = app.Entitlement.CreateDate,
                                                                               PublishedDate = app.Entitlement.PublishedDate,
                                                                               ActiveShoppingCountries = cap.ActiveShoppingCountries ,
                                                                               SupportedShoppingCountries = cap.SupportedShoppingCountries
                                                                               

                                                                              
                                                                           }).ToList() 
                        
                    };
                    if (a.Capabilities.Count() == 0)
                    {
                        // It's an extension, so let's add it as a capability!
                        a.Capabilities.Add(new Capability()
                        {
                            AppId = app.AppId,
                            Id = app.AppId,
                            UIConfigurationUrl = app.UIConfigurationUrl,
                            CapabilityType = "Extensions",
                            //CapabilityMode = cap.CapabilityMode ,
                            //ScopeId = cap.ScopeId ,
                            //ScopeType = cap.ScopeType ,
                            //Initialized = cap.Initialized,
                            Initialized = app.Initialized,
                            LicenseType = app.Entitlement.LicenseType,
                            Enabled = app.Enabled,
                            EntitlementId = app.Entitlement.Id,
                            uiSupportUrl = Mozu.Core.Settings.MozuConfigurationManager.DevCenterPath + "/storeprofile/" + app.Entitlement.ApplicationVersionId +"/en-US",
                            EntitlementApplicationVersionId  = app.Entitlement.ApplicationVersionId ,
                            ApplicationName = app.Entitlement.ApplicationName ,
                            DeveloperAccountName = app.Entitlement.DeveloperAccountName ,
                            EffectiveEndDate = app.Entitlement.EffectiveEndDate,
                            EffectiveStartDate = app.Entitlement.EffectiveStartDate ,
                            CreateDate = app.Entitlement.CreateDate,
                            PublishedDate = app.Entitlement.PublishedDate,
                            //ActiveShoppingCountries = cap.ActiveShoppingCountries ,
                            //SupportedShoppingCountries = cap.SupportedShoppingCountries
                        });
                    }
                    return a;
                });

            Mapper.CreateMap<Capability, Mozu.Core.ThirdParty.Contracts.Capability>()
                  .ForMember(x => x.SupportedShoppingCountries, opt => opt.Ignore());

            // Mapper.CreateMap<Mozu.Core.ThirdParty.Contracts.Capability,Capability>();
        }
    }
}