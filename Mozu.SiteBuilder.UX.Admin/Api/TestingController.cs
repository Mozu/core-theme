using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Mozu.Core;
using Mozu.Core.Api.Routing;
using Mozu.PaymentService.Contracts;
using Mozu.ShippingAdmin.Contracts;
using Mozu.ShippingAdmin.Contracts.Clients;
using Mozu.ShippingRuntime.Contracts;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteSettings.Order.Contracts;
using Mozu.SiteSettings.Order.Contracts.Clients;
using Mozu.SiteSettings.Shipping.Contracts;
using Mozu.SiteSettings.Shipping.Contracts.Clients;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using Newtonsoft.Json.Linq;
using Site = Mozu.SiteBuilder.UX.Admin.Api.Models.Testing.Site;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/testing", SuppressDescriptorGeneration = true)]
    public class TestingController : BaseController
    {
        private readonly IThemeRepository _themeRepository;
        private readonly IApiContext _apiContext;
        private readonly ISiteBuilderContext _siteBuilderContext;
        private readonly ICheckoutSettingsWebApiClient _checkoutSettingsWebApiClient;
        private readonly IShippingSettingsWebApiClient _shippingSettingsWebApiClient;
        //private readonly ICustomTableBasedRatesWebApiClient _customTableBasedRatesWebApiClient;


        static List<DGD> g_testData;

        static TestingController()
        {
        
        }

        private readonly IGeneralSettingWrapper _generalSettingsWebApiClient;

        public TestingController(ITenantsWebApiClient tenantClient, IGeneralSettingWrapper generalSettingsWebApiClient, IThemeRepository themeRepository, ISitesWebApiClient sitesWebApiClient, IApiContext apiContext, ISiteBuilderContext siteBuilderContext, Mozu.SiteSettings.Order.Contracts.Clients.ICheckoutSettingsWebApiClient checkoutSettingsWebApiClient, Mozu.SiteSettings.Shipping.Contracts.Clients.IShippingSettingsWebApiClient shippingSettingsWebApiClient )
        {
            _generalSettingsWebApiClient = generalSettingsWebApiClient;
            _tenantClient = tenantClient;
            _themeRepository = themeRepository;
            _apiContext = apiContext;
            _siteBuilderContext = siteBuilderContext;
            _checkoutSettingsWebApiClient = checkoutSettingsWebApiClient;
            _shippingSettingsWebApiClient = shippingSettingsWebApiClient;
            
        }

	





		[HttpGetRoute(UriTemplate = "Files?id={id}")]
        public Response<List<Node>> GetAllNode(string id)
        {
            if (id == null)
            {
                id = @"c:\";
            }
            var di = new System.IO.DirectoryInfo(id);

            var nodes = di.GetFileSystemInfos().Select(x => new Node()
            {
                Id = x.FullName,
                Name = x.Name,
                leaf = x is System.IO.DirectoryInfo,
                Parent = id
            }).ToList();

            return List2(nodes);
        }


        public class DGD
        {
            public int id { get; set; }
            public string name { get; set; }
            public string email { get; set; }
            public string words { get; set; }
        }
        
        [DataContract]
        public class Node
        {
            [DataMember(Name = "id")]
            public string Id { get; set; }

            [DataMember(Name = "name")]
            public string Name { get; set; }

            [DataMember(Name = "parent")]
            public string Parent { get; set; }

            [DataMember(Name = "image")]
            public string url { get; set; }
            
            [DataMember(Name = "leaf")]
            public bool leaf { get; set; }
        }

        [DataContract]
        public class ThemeDTO 
        {
            [DataMember(Name = "name")]
            public string Name { get; set; }

            [DataMember(Name = "id")]
            public string Id { get; set; }

            [DataMember(Name = "author")]
            public string Author { get; set; }

            [DataMember(Name = "isDesktop")]
            public bool? IsDesktop { get; set; }

            [DataMember(Name = "isMobile")]
            public bool? IsMobile { get; set; }

            [DataMember(Name = "isSelectedDesktop")]
            public bool? IsSelectedDesktop { get; set; }

            [DataMember(Name = "isSelectedMobile")]
            public bool? IsSelectedMobile { get; set; }

            public Thumbnail Thumbnail { get; set; }

            [DataMember(Name = "thumbnail")]
            public string ThumbnailAsDataUri
            {
                get
                {
                    return Thumbnail == null ? null : Thumbnail.AsDataUri;
                }
                set
                {
                    // a public setter is required by [DataMember].
                    // however, we don't want this field set, so this is a no-op.
                }
            }

            //constructor for jser.
            public ThemeDTO()
            {}

            /// <summary>
            /// Copy constructor
            /// </summary>
            public ThemeDTO(string desktopTheme, string mobileTheme, Theme theme, bool? isSelectedDesktop = null, bool? isSelectedMobile = null)
            {
                Name = theme.Name;
                Author = theme.Author;
                Thumbnail = theme.Thumbnail;
                IsDesktop = theme.IsDesktop;
                IsMobile = theme.IsMobile;
                Id = theme.Id;

                if (isSelectedDesktop.HasValue)
                    IsSelectedDesktop = isSelectedDesktop.Value;
                else if (String.Equals(Id, desktopTheme, StringComparison.InvariantCultureIgnoreCase))
                    IsSelectedDesktop = true;
                else
                    IsSelectedDesktop = false;

                if (isSelectedMobile.HasValue)
                    IsSelectedMobile = isSelectedMobile.Value;
                else if ( !string.IsNullOrEmpty( mobileTheme ) && String.Equals(Name, mobileTheme, StringComparison.InvariantCultureIgnoreCase))
                    IsSelectedMobile = true;
                else
                    IsSelectedMobile = false;
            }

            /// <summary>
            /// Checks for equality by comparing theme names.
            /// </summary>
            public bool Equals(Theme otherTheme)
            {
                return otherTheme != null && this.Id  == otherTheme.Id ;
            }
        }

		[HttpGetRoute(UriTemplate = "theme/list")]
        public async Task<Response<List<ThemeDTO>>> GetListThemes()
        {
            var localThemeDir =   _themeRepository.GetLocalThemePath();
		    var genSettings = await _generalSettingsWebApiClient.ReadSettings();
            //var localThemes = Directory.GetDirectories(localThemeDir);
            var entitlements = (await _tenantClient.GetSiteEntitlements(_apiContext.TenantId, _apiContext.SiteId)).ReadAsSync();

             
            var localThemes = entitlements.Items.Where(x => x.ApplicationType == "Theme")
                .Select(x => x.ApplicationVersionId.ToString() )
                .Union(Directory.GetDirectories(localThemeDir)
                .Select( x=>Path.GetFileName(x)));


            var themes = localThemes
                .Select(x =>
                    {
                        try
                        {
                            return _themeRepository.GetTheme(x);
                        }
                        catch(Exception ex)
                        {
                            System.Diagnostics.Debug.Write(ex);
                            return null;
                        }
                        
                    })
                    .Where( x=> x!= null)
                .Select<Theme, ThemeDTO>(t => new ThemeDTO(genSettings.DesktopTheme , genSettings.MobileTheme , t)).ToList();
           // List<ThemeDTO> themes = _themeRepository.GetAll().Select<ITheme, ThemeDTO>(t => new ThemeDTO(t)).ToList();
            return List2(themes);
         //   throw new NotImplementedException();
           
        }

		[HttpPostRoute(UriTemplate = "theme/update")]
        public async Task<Response<List<ThemeDTO>>> UpdateTheme( HttpRequestMessage msg )
        {
            List<ThemeDTO> themes = await msg.Content.ReadAsAsync<List<ThemeDTO>>();
            ThemeDTO newDesktop = themes.LastOrDefault(t => t.IsSelectedDesktop.Value);
            ThemeDTO newMobile = themes.LastOrDefault(t => t.IsSelectedMobile.Value );

            // TODO: need async settingsClient
            var settings = await _generalSettingsWebApiClient.ReadSettings();

            if (newDesktop != null)
            {
                // intent to set a desktop theme.
                settings.DesktopTheme = newDesktop.Id;
            }
            else if (themes.Any(t => t.Id == settings.DesktopTheme ))
            {
                // intent to un-set the desktop theme.
                // having NO desktop theme is not a legal state, so we will set the theme to the default.
                newDesktop = new ThemeDTO(settings.DesktopTheme, settings.MobileTheme , _themeRepository.GetDefaultTheme(), true);
                if (!themes.Any(t => t.Equals(newDesktop)))
                    themes.Add(newDesktop);
                settings.DesktopTheme = newDesktop.Id ;
            }

            if (newMobile != null)
            {
                settings.MobileTheme = newMobile.Id;
            }
            else if (themes.Any(t => t.Id == settings.MobileTheme))
            {
                // intent to un-set the mobile theme.
                settings.MobileTheme = null;
            }

            _generalSettingsWebApiClient.UpdateGeneralSettings(settings);

            // the UI returns the ThemeDTO without a thumbnail (to minimize the payload). But if we pass the same ThemeDTO without
            // a thumbnail back to them, the UI will update to have no thumbnail. So we have to loop over the provided ThemeDTO objects
            // and construct a new one to return to them.

            IEnumerable<ThemeDTO> returnedThemesList =
                from t in themes
                let isSelectedDesktop = (newDesktop != null && newDesktop.Equals(t)) || (newDesktop == null &&      t.Id.Equals(settings.DesktopTheme))
                let isSelectedMobile = (newMobile != null && newMobile.Equals(t)) || (newMobile == null && t.Equals(settings.MobileTheme))
                let fullTheme = _themeRepository.GetTheme(t.Id )
                select new ThemeDTO(settings.DesktopTheme, settings.MobileTheme ,fullTheme, isSelectedDesktop, isSelectedMobile);

            return List2(returnedThemesList.ToList());
        }

        

        ITenantsWebApiClient _tenantClient;
		



    }
}
