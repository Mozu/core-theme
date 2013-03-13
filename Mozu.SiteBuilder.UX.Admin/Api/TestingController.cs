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
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.Mvc.Themes.Repositories;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using Newtonsoft.Json.Linq;
using Site = Mozu.SiteBuilder.UX.Admin.Api.Models.Testing.Site;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class TestingController : BaseController
    {
        private readonly IThemeRepository _themeRepository;
        private readonly IApiContext _apiContext;
        private readonly ISiteBuilderContext _siteBuilderContext;


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

        public TestingController(ITenantsWebApiClient tenantClient, IGeneralSettingWrapper generalSettingsWebApiClient, IThemeRepository themeRepository, ISitesWebApiClient sitesWebApiClient, IApiContext apiContext, ISiteBuilderContext siteBuilderContext)
        {
            _generalSettingsWebApiClient = generalSettingsWebApiClient;
            _tenantClient = tenantClient;
            _themeRepository = themeRepository;
            _apiContext = apiContext;
            _siteBuilderContext = siteBuilderContext;
        }

        [WebGet(UriTemplate = "list")]
        public Response<List<DGD>> GetTestList([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            var items = g_testData.Skip(pagingParams.pageIndex.GetValueOrDefault(0)).Take(pagingParams.pageSize.GetValueOrDefault(1000)).ToList();

            return List2(items, g_testData.Count);
        }

        [WebInvoke(UriTemplate = "testCreate")]
        public JContainer TestCreate(JContainer ret)
        {
            return ret;
        }
        [WebInvoke(UriTemplate = "testDestroy")]
        public JContainer TestDestroy(JContainer ret)
        {
            return ret;
        }
        [WebInvoke(UriTemplate = "testUpdate")]
        public JContainer TestUpdate(JContainer ret)
        {
            return ret;
        }
        [WebGet(UriTemplate = "Files?id={id}")]
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
            public ThemeDTO(ISiteBuilderContext sbContext, Theme theme, bool? isSelectedDesktop = null, bool? isSelectedMobile = null)
            {
                Name = theme.Name;
                Author = theme.Author;
                Thumbnail = theme.Thumbnail;
                IsDesktop = theme.IsDesktop;
                IsMobile = theme.IsMobile;
                Id = theme.Id;

                if (isSelectedDesktop.HasValue)
                    IsSelectedDesktop = isSelectedDesktop.Value;
                else if (String.Equals(Id , sbContext.DesktopTheme.Id , StringComparison.InvariantCultureIgnoreCase))
                    IsSelectedDesktop = true;
                else
                    IsSelectedDesktop = false;

                if (isSelectedMobile.HasValue)
                    IsSelectedMobile = isSelectedMobile.Value;
                else if (sbContext.MobileTheme != null && String.Equals(Name, sbContext.MobileTheme.Id , StringComparison.InvariantCultureIgnoreCase))
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

        [WebGet(UriTemplate = "theme/list")]
        public async Task<Response<List<ThemeDTO>>> GetListThemes()
        {
            var localThemeDir =   new DirectoryInfo(HttpRuntime.AppDomainAppPath).Parent.FullName + "/Mozu.SiteBuilder.UX.Themes/themes/";
            //var localThemes = Directory.GetDirectories(localThemeDir);
            var entitlements = await _tenantClient.GetSiteEntitlements(_apiContext.TenantId, _apiContext.SiteId);
            var localThemes = entitlements.ReadAsSync().Items.Where(x => x.ApplicationType == "Theme").Select(x => x.ApplicationVersionId.ToString() ).Union(Directory.GetDirectories(localThemeDir).Select( x=>Path.GetFileName(x)));


            var themes = localThemes
                .Select(x =>
                    {
                        try
                        {
                            return _themeRepository.GetTheme(x);
                        }
                        catch
                        {
                            return null;
                        }
                        
                    })
                    .Where( x=> x!= null)
                .Select<Theme, ThemeDTO>(t => new ThemeDTO(_siteBuilderContext,t)).ToList();
           // List<ThemeDTO> themes = _themeRepository.GetAll().Select<ITheme, ThemeDTO>(t => new ThemeDTO(t)).ToList();
            return List2(themes);
         //   throw new NotImplementedException();
           
        }

        [WebInvoke(UriTemplate = "theme/update" , Method="POST")]
        public async Task<Response<List<ThemeDTO>>> UpdateTheme( HttpRequestMessage msg )
        {
            List<ThemeDTO> themes = await msg.Content.ReadAsAsync<List<ThemeDTO>>();
            ThemeDTO newDesktop = themes.LastOrDefault(t => t.IsSelectedDesktop.Value);
            ThemeDTO newMobile = themes.LastOrDefault(t => t.IsSelectedMobile.Value );

            // TODO: need async settingsClient
            var settings = _generalSettingsWebApiClient.ReadSettings();

            if (newDesktop != null)
            {
                // intent to set a desktop theme.
                settings.DesktopTheme = newDesktop.Id;
            }
            else if (themes.Any(t => t.Equals(_siteBuilderContext.DesktopTheme)))
            {
                // intent to un-set the desktop theme.
                // having NO desktop theme is not a legal state, so we will set the theme to the default.
                newDesktop = new ThemeDTO(_siteBuilderContext,_themeRepository.GetDefaultTheme(), true);
                if (!themes.Any(t => t.Equals(newDesktop)))
                    themes.Add(newDesktop);
                settings.DesktopTheme = newDesktop.Id ;
            }

            if (newMobile != null)
            {
                settings.MobileTheme = newMobile.Id;
            }
            else if (themes.Any(t => t.Equals(_siteBuilderContext.MobileTheme)))
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
                let isSelectedDesktop = (newDesktop != null && newDesktop.Equals(t)) || (newDesktop == null && t.Equals(_siteBuilderContext.DesktopTheme))
                let isSelectedMobile = (newMobile != null && newMobile.Equals(t)) || (newMobile == null && t.Equals(_siteBuilderContext.MobileTheme))
                let fullTheme = _themeRepository.GetTheme(t.Id )
                select new ThemeDTO(_siteBuilderContext,fullTheme, isSelectedDesktop, isSelectedMobile);

            return List2(returnedThemesList.ToList());
        }

        [WebGet(UriTemplate = "tenant/list")]
        public async Task<Response<List<Tenant.Contracts.Tenant>>> GetTenantList([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            string filter = null;
            TenantCollection tenants = null;
            
            foreach (var f in extFilter)
            {
                int tenantId;
                if (int.TryParse(f.value.ToString (), out tenantId))
                {
                    var tentant = (await _tenantClient.GetTenant(tenantId)).ReadAsSync();
                    tenants = new TenantCollection()
                    {
                        TotalCount = 1,
                        Items = new List<Mozu.Tenant.Contracts.Tenant>()
                        {
                            tentant 
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

            return List2(tenants.Items, (int) tenants.TotalCount);
        }


        ITenantsWebApiClient _tenantClient;
        [WebInvoke(UriTemplate = "changeSiteList")]
        public async Task<Response<List<Site>>> GetChangeSiteList(Site site)
        {
            int? tenantId = site.tenantId;
            var res = (await _tenantClient.GetSites(tenantId)).ReadAsSync();
            var sites = new List<Site>(res.Items.Select(x => new Site() {id = x.Id, tenantId = tenantId, name = x.Name}));
            return List2(sites);
        }



        [WebInvoke(UriTemplate = "setSiteContextFromTenant")]
        public async Task<Response<List<Site>>> SetSiteContextFromTenant(Mozu.Tenant.Contracts.Tenant tenant)
        {
            var sites = (await _tenantClient.GetSites(tenant.Id)).ReadAsSync();
            var site = sites.Items.First();
            var ctx = _siteBuilderContext;

            ctx.TenantId = tenant.Id;
            ctx.SiteId = site.Id;
         
            ctx.Save();

            return EmptyList2<Site>();
            //ctx.SiteName = site.name;
        }

        [WebInvoke(UriTemplate = "setSiteContext")]
        public Response<List<Site>> SetSiteContext(Site site)
        {
            var ctx = _siteBuilderContext;

            ctx.TenantId = site.tenantId.Value;
            ctx.SiteId = site.id.Value;
         
            ctx.Save();

            return EmptyList2<Site>();
            //ctx.SiteName = site.name;
        }
    }
}
