using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Mozu.MZDB.Contracts.Clients;
using Mozu.Core.Api.Client;
using Mozu.Core.Settings;
using Newtonsoft.Json.Linq;


namespace Mozu.SiteBuilder.Mvc.Contexts
{
    public interface ITenantAdminSettingsContext
    {
        bool EnableBetaAdmin { get; }

        bool EntityManagerVisible { get; }

        bool SiteBuilderContentListsVisible { get; }
        

        bool CustomRoutesVisible { get; }
        string BetaControlVersion { get; }
        Task<ITenantAdminSettingsContext> AsyncGet();
        string MapPath(string virtualPath);

    }
    public class TenantAdminSettingsContext : ITenantAdminSettingsContext
    {
        private readonly Lazy<IEntityListsWebApiClient> _entityListsWebApiClient;
        private readonly Lazy<ISettings> _settings;
        readonly HttpContext _context;
        Lazy<JObject> _state;
        private readonly IWebHostEnvironment _env;
        public TenantAdminSettingsContext(Lazy<Mozu.MZDB.Contracts.Clients.IEntityListsWebApiClient> entityListsWebApiClient, Lazy<Mozu.Core.Settings.ISettings> settings, HttpContext context, IWebHostEnvironment env)
        {
            _entityListsWebApiClient = entityListsWebApiClient;
            _settings = settings;
            _context = context;
            _state = new Lazy<JObject>(GetSettings);
            _env = env;
        }

        JObject GetSettings()
        {
            var res = _entityListsWebApiClient.Value.CloneWithoutUserClaims().GetEntity(entityListFullName: "tenantAdminSettings@mozu", id: "Global").Result;
            return res.ResponseMessage.IsSuccessStatusCode ? res.ReadAsSync() : new JObject();
        }
        string _bcv = null;
        static System.Collections.Concurrent.ConcurrentDictionary<string, string> _bcvLookup = new System.Collections.Concurrent.ConcurrentDictionary<string, string>();
        public string BetaControlVersion
        {
            get
            {
                if ( _bcv == null)
                {
                    var dllPath =this.MapPath("/bin/Mozu.SiteBuilder.Mvc.dll");
                    _bcv = _bcvLookup.GetOrAdd(dllPath, GetAssemblyVersionStringByPath);
                }
                return _bcv;  // _settings.Value.AppSettings("sitebuilder.betaControlVersion");
            }
        }
        static string GetAssemblyVersionStringByPath ( string dllPath)
        {
            try
            {
                return System.Diagnostics.FileVersionInfo.GetVersionInfo(dllPath).FileVersion;
            }
            catch
            {
                return  "";
            }

        }
        public string MapPath (string virtualPath)
        {
            return Path.Combine(_env.ContentRootPath, "/admin/_mzAdminBetaControl/", virtualPath);
        }
        public async Task<ITenantAdminSettingsContext> AsyncGet()
        {
            if (_state.IsValueCreated)
            {
                return this;
            }
            
            var res = (await _entityListsWebApiClient.Value.CloneWithoutUserClaims().GetEntity(entityListFullName: "tenantAdminSettings@mozu", id: "Global").ConfigureAwait(false));
            var val = res.ResponseMessage.IsSuccessStatusCode ? res.ReadAsSync() : new JObject();
            _state = new Lazy<JObject>(() => val);
            return this;
        }
        public bool EnableBetaAdmin => true;

        public bool EntityManagerVisible => ((bool?)_state.Value.GetValue("entityManagerVisible")).GetValueOrDefault(false);

        public bool SiteBuilderContentListsVisible => ((bool?)_state.Value.GetValue("siteBuilderContentListsVisible")).GetValueOrDefault(false);

        public bool CustomRoutesVisible => ((bool?)_state.Value.GetValue("customRoutesVisible")).GetValueOrDefault(false);

        public bool EnableOrderEditInStorefront => ((bool?)_state.Value.GetValue("enableOrderEditInStorefront")).GetValueOrDefault(false);

        public bool IsSavePromptEnabled => ((bool?)_state.Value.GetValue("isSavePromptEnabled")).GetValueOrDefault(false);
    }
}
