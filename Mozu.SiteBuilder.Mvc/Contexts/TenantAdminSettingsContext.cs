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
using Mozu.Tenant.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Extensions;

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
        private readonly ITenantsWebApiClient _tenantsWebApiClient;
        private readonly IApiContext _apiContext;

        HttpContextBase _context;
        Lazy<JObject> _state;
        public TenantAdminSettingsContext(Lazy<Mozu.MZDB.Contracts.Clients.IEntityListsWebApiClient> entityListsWebApiClient, Lazy<Mozu.Core.Settings.ISettings> settings, HttpContextBase context, ITenantsWebApiClient tenantsWebApiClient, IApiContext apiContext)
        {
            _entityListsWebApiClient = entityListsWebApiClient;
            _tenantsWebApiClient = tenantsWebApiClient.CloneWithoutUserClaims();
            _settings = settings;
            _context = context;
            _state = new Lazy<JObject>(GetSettings);
            _apiContext = apiContext;
        }

        JObject GetSettings()
        {
            var res = _entityListsWebApiClient.Value.CloneWithoutUserClaims().GetEntity(entityListFullName: "tenantAdminSettings@mozu", id: "Global").Result;

            var tenant = _tenantsWebApiClient.GetTenantInternal(_apiContext.TenantId, false).Result.ReadAsSync();


            var returnObject = res.ReadAsSync();

            var catalogDisabled = (tenant.Attributes.Find(x => x.Name == "CatalogDisabled").Value.ToString() == "true") ? true : false;
            returnObject.Add(new JProperty("catalogDisabled", catalogDisabled));

            var smsEnabled = (tenant.Attributes.Find(x => x.Name == "SmsEnabled").Value.ToString() == "true") ? true : false;
            returnObject.Add(new JProperty("smsEnabled", smsEnabled));

            return res.ResponseMessage.IsSuccessStatusCode ? res.ReadAsSync() : new JObject();
        }
        string _bcv = null;
        static System.Collections.Concurrent.ConcurrentDictionary<string, string> _bcvLookup = new System.Collections.Concurrent.ConcurrentDictionary<string, string>();
        public string BetaControlVersion
        {
            get
            {
                if (_bcv == null)
                {
                    var dllPath = this.MapPath("/bin/Mozu.SiteBuilder.Mvc.dll");
                    _bcv = _bcvLookup.GetOrAdd(dllPath, GetAssemblyVersionStringByPath);
                }
                return _bcv;  // _settings.Value.AppSettings("sitebuilder.betaControlVersion");
            }
        }
        static string GetAssemblyVersionStringByPath(string dllPath)
        {
            try
            {
                return System.Diagnostics.FileVersionInfo.GetVersionInfo(dllPath).FileVersion;
            }
            catch
            {
                return "";
            }

        }
        public string MapPath(string virtualPath)
        {
            return _context.Server.MapPath("/admin/_mzAdminBetaControl/" + virtualPath);
        }
        public async Task<ITenantAdminSettingsContext> AsyncGet()
        {
            if (_state.IsValueCreated)
            {
                return this;
            }

            var res = (await _entityListsWebApiClient.Value.CloneWithoutUserClaims().GetEntity("tenantAdminSettings@mozu", "Global").ConfigureAwait(false));
            var val = res.ResponseMessage.IsSuccessStatusCode ? res.ReadAsSync() : new JObject();

            var tenant = _tenantsWebApiClient.GetTenantInternal(_apiContext.TenantId, false).Result.ReadAsSync();

            var catalogDisabledValue = tenant.Attributes?.FirstOrDefault(x => x.Name.EqualsIgnoreCase("CatalogDisabled"))?.Value.ToString();
            var catalogDisabled = catalogDisabledValue.EqualsIgnoreCase("true");
            val.Add(new JProperty("catalogDisabled", catalogDisabled));

            var smsEnabledValue = tenant.Attributes?.FirstOrDefault(x => x.Name.EqualsIgnoreCase("SmsEnabled"))?.Value.ToString();
            var smsEnabled = smsEnabledValue.EqualsIgnoreCase("true");
            val.Add(new JProperty("smsEnabled", smsEnabled));

            _state = new Lazy<JObject>(() => val);
            return this;
        }
        public bool EnableBetaAdmin
        {
            get
            {
                return true;
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

        public bool EnableOrderEditInStorefront
        {
            get
            {
                return ((bool?)_state.Value.GetValue("enableOrderEditInStorefront")).GetValueOrDefault(false);
            }
        }

        public bool IsSavePromptEnabled
        {
            get
            {
                return ((bool?)_state.Value.GetValue("isSavePromptEnabled")).GetValueOrDefault(false);
            }
        }

        public bool CatalogDisabled
        {
            get
            {
                return ((bool?)_state.Value.GetValue("catalogDisabled")).GetValueOrDefault(false);
            }
        }

        public bool SmsEnabled
        {
            get
            {
                return ((bool?)_state.Value.GetValue("smsEnabled")).GetValueOrDefault(false);
            }
        }
    }
}
