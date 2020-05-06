using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Mozu.AdminUser.Contracts;
using Mozu.Core.Api.Contracts;
using Mozu.MZDB.Contracts;
using Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Account;
using Mozu.SiteBuilder.UX.Models.Admin;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.User
{
    public class UserIdentity
    {
        public Models.Account.User CTUser;
        public List<UserRole> CTUserRoles;
        public Tenant.Contracts.Tenant CTTenant;
        public List<ProductAdmin.Contracts.MasterCatalog> CTMasterCatalogs;
        public List<JObject> CTEntities;
        public List<JObject> CustomSchema;
        public List<Mozu.Core.Api.Contracts.User> CTSiteUsers;
        public TaContext CTTaContext;
        public List<KeyValuePair<string, string>> LocalizationValues;
        public string UseGoogleAnalytics;
        public string GoogleAnalyticsAccount;
        public string ShowBristReport;
        public string LoginUri { get; set; }
    }
}