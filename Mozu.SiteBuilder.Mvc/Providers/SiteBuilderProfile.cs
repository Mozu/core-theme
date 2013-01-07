//// -----------------------------------------------------------------------
//// <copyright file="SiteBuilderProfile.cs" company="Microsoft">
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
//    using System.Web;

//    public class SiteBuilderProfile : ProfileBase
//    {
//        public virtual int? TenantId
//        {
//            get
//            {
//                return ((int?)(this.GetPropertyValue("tenantId")));
//            }
//            set
//            {
//                this.SetPropertyValue("tenantId", value);
//            }
//        }
//        public virtual int? SiteId
//        {
//            get
//            {
//                return ((int?)(this.GetPropertyValue("tenantId")));
//            }
//            set
//            {
//                this.SetPropertyValue("tenantId", value);
//            }
//        }

//        public static SiteBuilderProfile Current
//        {
//            get
//            {
//                return HttpContext.Current.Profile
//                                      as SiteBuilderProfile;
//            }
//        }
//        //public static void Create(string username, string devId, bool isAuth)
//        //{
//        //    var prof = (VolusionProfile)ProfileBase.Create(username, isAuth);
//        //    prof.DeveloperId = devId;
//        //    prof.Save();
//        //}
//    }
//}
