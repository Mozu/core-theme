using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Theme;
using Mozu.SiteBuilder.Mvc.Theme.Repositories;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using Site = Mozu.SiteBuilder.UX.Admin.Api.Models.Testing.Site;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class TestingController : BaseController
    {
        private readonly IThemeRepository _themeRepository;

        
        static List<DGD> g_testData;

        static TestingController()
        {
            g_testData = new List<DGD>();
            var streamName = typeof(TestingController).Assembly.GetManifestResourceNames().First(x => x.IndexOf("datagen.txt", System.StringComparison.InvariantCultureIgnoreCase) > -1);
            var stream = typeof(TestingController).Assembly.GetManifestResourceStream(streamName);
            using (var sr = new System.IO.StreamReader(stream))
            {
                while (sr.Peek() != -1)
                {
                    var parts = sr.ReadLine().Split(',');
                    g_testData.Add(new DGD()
                        {
                            id = int.Parse(parts[0]),
                            name = parts[1],
                            email = parts[2],
                            words = parts[3]
                        });
                  
                }
            }
        }

        private readonly IGeneralSettingWrapper _generalSettingsWebApiClient;

        public TestingController(ITenantsWebApiClient tenantClient, IGeneralSettingWrapper generalSettingsWebApiClient, IThemeRepository themeRepository)
        {
            _generalSettingsWebApiClient = generalSettingsWebApiClient;
            _tenantClient = tenantClient;
            _themeRepository = themeRepository;
        }

        [WebGet(UriTemplate = "list")]
        public Task<Response<List<DGD>>> GetTestList(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            var items = g_testData.Skip(pagingParams.pageIndex.GetValueOrDefault(0)).Take(pagingParams.pageSize.GetValueOrDefault(1000)).ToList();

            return List(items, g_testData.Count);
        }


        [WebGet(UriTemplate = "Files?id={id}")]
        public Task<Response<List<Node>>> GetAllNode(string id)
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

            return List(nodes);
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
        public class ThemeDTO : IThemeBasicInfo
        {
            [DataMember(Name = "name")]
            public string Name { get; set; }

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
            public ThemeDTO(IThemeBasicInfo theme, bool? isSelectedDesktop = null, bool? isSelectedMobile = null)
            {
                Name = theme.Name;
                Author = theme.Author;
                Thumbnail = theme.Thumbnail;
                IsDesktop = theme.IsDesktop;
                IsMobile = theme.IsMobile;

                if (isSelectedDesktop.HasValue)
                    IsSelectedDesktop = isSelectedDesktop.Value;
                else if (String.Equals(Name, SiteBuilderContext.Current.DesktopTheme.Name, StringComparison.InvariantCultureIgnoreCase))
                    IsSelectedDesktop = true;
                else
                    IsSelectedDesktop = false;

                if (isSelectedMobile.HasValue)
                    IsSelectedMobile = isSelectedMobile.Value;
                else if (SiteBuilderContext.Current.MobileTheme != null && String.Equals(Name, SiteBuilderContext.Current.MobileTheme.Name, StringComparison.InvariantCultureIgnoreCase))
                    IsSelectedMobile = true;
                else
                    IsSelectedMobile = false;
            }

            /// <summary>
            /// Checks for equality by comparing theme names.
            /// </summary>
            public bool Equals(IThemeBasicInfo otherTheme)
            {
                return otherTheme != null && this.Name == otherTheme.Name;
            }
        }

        [WebGet(UriTemplate = "theme/list")]
        public Task<Response<List<ThemeDTO>>> GetListThemes()
        {
            List<ThemeDTO> themes = _themeRepository.GetAll().Select<ITheme, ThemeDTO>(t => new ThemeDTO(t)).ToList();

            return List(themes);
        }

        [WebInvoke(UriTemplate = "theme/update" , Method="POST")]
        public Task<Response<List<ThemeDTO>>> UpdateTheme( HttpRequestMessage msg )
        {
            List<ThemeDTO> themes = msg.Content.ReadAsAsync<List<ThemeDTO>>().Result;
            ThemeDTO newDesktop = themes.LastOrDefault(t => t.IsSelectedDesktop.Value);
            ThemeDTO newMobile = themes.LastOrDefault(t => t.IsSelectedMobile.Value );

            var settings = _generalSettingsWebApiClient.ReadSettings();

            if (newDesktop != null)
            {
                // intent to set a desktop theme.
                settings.DesktopTheme = newDesktop.Name;
            }
            else if (themes.Any(t => t.Equals(SiteBuilderContext.Current.DesktopTheme)))
            {
                // intent to un-set the desktop theme.
                // having NO desktop theme is not a legal state, so we will set the theme to the default.
                newDesktop = new ThemeDTO(_themeRepository.GetDefaultTheme(), true);
                if (!themes.Any(t => t.Equals(newDesktop)))
                    themes.Add(newDesktop);
                settings.DesktopTheme = newDesktop.Name;
            }

            if (newMobile != null)
            {
                settings.MobileTheme = newMobile.Name;
            }
            else if (themes.Any(t => t.Equals(SiteBuilderContext.Current.MobileTheme)))
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
                let isSelectedDesktop = (newDesktop != null && newDesktop.Equals(t)) || (newDesktop == null && t.Equals(SiteBuilderContext.Current.DesktopTheme))
                let isSelectedMobile = (newMobile != null && newMobile.Equals(t)) || (newMobile == null && t.Equals(SiteBuilderContext.Current.MobileTheme))
                let fullTheme = _themeRepository.GetTheme(t.Name)
                select new ThemeDTO(fullTheme, isSelectedDesktop, isSelectedMobile);

            return this.List(returnedThemesList.ToList());
        }

        [WebGet(UriTemplate = "tenant/list")]
        public Task<Response<List<Tenant.Contracts.Tenant >>> GetTenantList(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            string filter = null;
            TenantCollection tenants = null;
            
            foreach (var f in extFilter)
            {
                int tenantId;
                if (int.TryParse(f.value.ToString (), out tenantId))
                {
                    var tantant =_tenantClient.GetTenant(tenantId).Result.ReadAsSync();
                    tenants = new TenantCollection()
                    {
                        TotalCount = 1,
                        Items = new List<Mozu.Tenant.Contracts.Tenant>()
                        {
                            tantant 
                        }
                    };
                    filter = "Id eq " + tenantId;
                }
                else
                {
                    filter = string.Format("Name cont \"{0}\"", f.value);
                }
            }
            if (tenants == null)
            {

                tenants = _tenantClient.GetTenants(pagingParams.startIndex, pagingParams.pageSize, "CreateDate desc", filter).Result.ReadAsSync();

            }

            return List(tenants.Items, (int) tenants.TotalCount);
        }


        ITenantsWebApiClient _tenantClient;
        [WebInvoke(UriTemplate = "changeSiteList")]
        public Task<Response<List<Site>>> GetChangeSiteList(Site site)
        {
            int? tenantId = site.tenantId;
            var res = _tenantClient.GetSites(tenantId).Result.ReadAsSync();
            var sites = new List<Site>(res.Items.Select(x => new Site() {id = x.Id, tenantId = tenantId, name = x.Name}));
            return List(sites);
        }



        [WebInvoke(UriTemplate = "setSiteContextFromTenant")]
        public Task<Response<List<Site>>> SetSiteContextFromTenant(Mozu.Tenant.Contracts.Tenant tenant)
        {
            var sites = _tenantClient.GetSites(tenant.Id).Result.ReadAsSync();
            var site = sites.Items.First();
            var ctx  = SiteBuilderContext.Current;

            ctx.TenantId = tenant.Id;
            ctx.SiteId = site.Id;
         
            ctx.Save();

            return EmptyList<Site>();
            //ctx.SiteName = site.name;
        }

        [WebInvoke(UriTemplate = "setSiteContext")]
        public Task<Response<List<Site>>> SetSiteContext(Site site)
        {
            var ctx  = SiteBuilderContext.Current;

            ctx.TenantId = site.tenantId.Value;
            ctx.SiteId = site.id.Value;
         
            ctx.Save();

            return EmptyList<Site>();
            //ctx.SiteName = site.name;
        }
    }
}
