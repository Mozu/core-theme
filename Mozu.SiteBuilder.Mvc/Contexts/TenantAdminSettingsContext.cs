using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
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
        HttpContextBase _context;
        Lazy<JObject> _state;
        public TenantAdminSettingsContext(Lazy<Mozu.MZDB.Contracts.Clients.IEntityListsWebApiClient> entityListsWebApiClient, Lazy<Mozu.Core.Settings.ISettings> settings, HttpContextBase context)
        {
            _entityListsWebApiClient = entityListsWebApiClient;
            _settings = settings;
            _context = context;
            _state = new Lazy<JObject>(GetSettings);
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
                return System.Reflection.AssemblyName.GetAssemblyName(dllPath).Version.ToString();
            }
            catch
            {
                return  "";
            }

        }
        public string MapPath ( string virtualPath )
        {
            return _context.Server.MapPath("/admin/_mzAdminBetaControl/" + virtualPath);
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
        public bool EnableBetaAdmin
        {
            get
            {
                return ((bool?)_state.Value.GetValue("enableBetaAdmin")).GetValueOrDefault(false);
            }
        }

        public bool EntityManagerVisible
        {
            get
            {
                return ((bool?)_state.Value.GetValue("entityManagerVisible")).GetValueOrDefault(false);
            }
        }
        public bool SiteBuilderContentListsVisible
        {
            get
            {
                return ((bool?)_state.Value.GetValue("siteBuilderContentListsVisible")).GetValueOrDefault(false);
            }
        }
        public bool CustomRoutesVisible
        {
            get
            {
                return ((bool?)_state.Value.GetValue("customRoutesVisible")).GetValueOrDefault(false);
            }
        }


    }
}
