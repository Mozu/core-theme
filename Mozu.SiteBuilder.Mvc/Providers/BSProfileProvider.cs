//// -----------------------------------------------------------------------
//// <copyright file="BSProfileProvider.cs" company="Microsoft">
//// TODO: Update copyright text.
//// </copyright>
//// -----------------------------------------------------------------------

//namespace Mozu.SiteBuilder.Mvc.Providers
//{
//    using System;
//    using System.Collections.Generic;
//    using System.Linq;
//    using System.Text;
//    using System.Web.Profile;
//    using System.Configuration;

//    /// <summary>
//    /// TODO: Update summary.
//    /// </summary>
//    public class BSProfileProvider : ProfileProvider
//    {
//        public override int DeleteInactiveProfiles(ProfileAuthenticationOption authenticationOption, DateTime userInactiveSinceDate)
//        {
//            throw new NotImplementedException();
//        }

//        public override int DeleteProfiles(string[] usernames)
//        {
//            throw new NotImplementedException();
//        }

//        public override int DeleteProfiles(ProfileInfoCollection profiles)
//        {
//            throw new NotImplementedException();
//        }

//        public override ProfileInfoCollection FindInactiveProfilesByUserName(ProfileAuthenticationOption authenticationOption, string usernameToMatch, DateTime userInactiveSinceDate, int pageIndex, int pageSize, out int totalRecords)
//        {
//            throw new NotImplementedException();
//        }

//        public override ProfileInfoCollection FindProfilesByUserName(ProfileAuthenticationOption authenticationOption, string usernameToMatch, int pageIndex, int pageSize, out int totalRecords)
//        {
//            throw new NotImplementedException();
//        }

//        public override ProfileInfoCollection GetAllInactiveProfiles(ProfileAuthenticationOption authenticationOption, DateTime userInactiveSinceDate, int pageIndex, int pageSize, out int totalRecords)
//        {
//            throw new NotImplementedException();
//        }

//        public override ProfileInfoCollection GetAllProfiles(ProfileAuthenticationOption authenticationOption, int pageIndex, int pageSize, out int totalRecords)
//        {
//            throw new NotImplementedException();
//        }

//        public override int GetNumberOfInactiveProfiles(ProfileAuthenticationOption authenticationOption, DateTime userInactiveSinceDate)
//        {
//            throw new NotImplementedException();
//        }

//        public override string ApplicationName
//        {
//            get
//            {
//                throw new NotImplementedException();
//            }
//            set
//            {
//                throw new NotImplementedException();
//            }
//        }

//        static System.Text.RegularExpressions.Regex g_numPart = new System.Text.RegularExpressions.Regex(@"[\d]+");
//        public static int? GetTenantId(string userId)
//        {
//            string val = g_numPart.Match(userId).Value;
//            int ret;
//            if (int.TryParse(val, out ret))
//            {
//                return ret;
//            }
//            return null;

//        }



//        public override System.Configuration.SettingsPropertyValueCollection GetPropertyValues(System.Configuration.SettingsContext context, System.Configuration.SettingsPropertyCollection collection)
//        {
//            SettingsPropertyValueCollection settingsPropertyValueCollection = new SettingsPropertyValueCollection();

//            foreach (SettingsProperty settingsProperty in collection)
//            {

//                SettingsPropertyValue settingsPropertyValue = new SettingsPropertyValue(settingsProperty);
//                if (settingsProperty.Name == "TenantId")
//                {

//                    var userName = (string)context["UserName"] ?? "1";
//                    var tenant = GetTenantId(userName);
//                    settingsPropertyValue.IsDirty = false;
//                    settingsPropertyValue.Deserialized = true;
//                    settingsPropertyValue.PropertyValue = tenant;

//                }

//                settingsPropertyValueCollection.Add(settingsPropertyValue);
//            }

//            return settingsPropertyValueCollection;

//        }

//        public override void SetPropertyValues(System.Configuration.SettingsContext context, System.Configuration.SettingsPropertyValueCollection collection)
//        {
            
//        }
//    }
//}
