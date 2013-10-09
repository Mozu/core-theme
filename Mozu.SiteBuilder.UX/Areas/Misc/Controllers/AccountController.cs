//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Web;
//
//using Mozu.SiteBuilder.UX.Areas.Misc.Models;
//using System.Web.Security;
//using Mozu.SiteBuilder.ClientRepositories.Authentication;
//using DC=Mozu.User.Contracts;
//using AutoMapper;
//using Mozu.SiteBuilder.Mvc.Security;
//using System.Text;
//using Mozu.SiteBuilder.UX.Areas.Admin.Models.Account;


//namespace Mozu.SiteBuilder.UX.Areas.Misc.Controllers
//{
//    public class AccountController : Controller
//    {
//        //
//        // GET: /Misc/Account/

//        public AccountController(IRolesRepository rolesRepo,
//            IUserAuthTicketRepository userAuthTicketRepo,
//            IUserRepository userRepo)
//        {
//            RolesRepo = rolesRepo;
//            UserAuthTicketRepo = userAuthTicketRepo;
//            UserRepo = userRepo;
//        }


//        IRolesRepository RolesRepo;
//        IUserAuthTicketRepository UserAuthTicketRepo;
//        IUserRepository UserRepo;
      
//        public ActionResult LogOn ()
//        {
//            return View(new UserAuthInfo ());
//        }
//         [HttpPost]
//        public ActionResult LogOn(UserAuthInfo model, FormCollection col )
//        {
//            if (ModelState.IsValid)
//            {
//                var ticket = this.UserAuthTicketRepo.Create(new DC.UserAuthInfo() { EmailAddress = model.EmailAddress, Password = model.Password });
//                AuthenticationHelper helper = new AuthenticationHelper();
//                helper.SetCookie(ticket);
//                return RedirectToAction("index", "default", new { area = "" });
//            }
//            // If we got this far, something failed, redisplay form
//            return View(model);

//        }
//         public ActionResult LogOff()
//         {
//             AuthenticationHelper helper = new AuthenticationHelper();
//             helper.LogOut();
//             return RedirectToAction("index", "default", new { area = "" });
//         }

//        public ActionResult Register()
//        {
//            var model = new CreateUser();
//            return View(model);
//        }

//        [HttpPost]
//        public ActionResult Register(CreateUser model)
//        {
//            if ( ModelState.IsValid )
//            {
//                var dc = Mapper.Map<DC.User>( model );
//                var user = UserRepo.Create(dc);
//                var ticket = this.UserAuthTicketRepo.Create(new DC.UserAuthInfo() { EmailAddress = model.EmailAddress, Password = model.Password });
//                AuthenticationHelper helper = new AuthenticationHelper();
//                helper.SetCookie(ticket);
//                return  RedirectToAction("index", "default", new { area = "" });
//            }

//            // If we got this far, something failed, redisplay form
//            return View(model);
//        }
        
//        public ActionResult LogOnToSite (string domainName = null , int siteId = -1)
//        {
//            if (domainName == null)
//            {
//                var ticket = new AuthenticationHelper().GetTicketFromRequest();
               
//                StringBuilder sb = new StringBuilder();
//                sb.AppendFormat("<form id='theForm' action='http://{0}/admin/account/LogOnToSite' method='post'><input  type='hidden' name='token' value='{1}'  /><input type='submit' value='Submit' /></form><script>window.onload = function () { document.forms[0].submit(); }</script> ",
//                    domainName ,
//                    HttpUtility.HtmlAttributeEncode(ticket.AccessToken)
//                    );
//                return new ContentResult() { Content = sb.ToString() };
//            }
//            throw new InvalidOperationException("missing DomainName");
//        }
   
//        [HttpPost]
//        public ActionResult SSO (  string token , FormCollection col  )
//        {
//            var ticket = this.UserAuthTicketRepo.ConvertToSite(new DC.UserTokenInfo() { AccessToken = token });

       
//            AuthenticationHelper helper = new AuthenticationHelper();
//            helper.SetCookie(ticket);
//            return RedirectToAction("index", "default", new { area = "" });
//        }
//        public ActionResult ManageRoles()
//        {
//            return View(new UserRole());
//        }

//        [HttpPost]
//        public ActionResult ManageRoles(UserRole userRole, FormCollection col)
//        {
//            DC.User user = null ;
//            if ( userRole.UserId != null )
//            {
//                user = UserRepo.Get ( userRole.UserId );
//            }
//            if ( user == null && userRole.EmalAddress != null )
//            {
//                user = this.UserRepo.GetUserByEmal (userRole.EmalAddress  );
//            }

//            if ( user == null )
//            {
//                this.ModelState.AddModelError ( "", "can't find user");
//                return View ( userRole );
//            }
//            if (userRole.ForAdding)
//            {
//                this.UserRepo.AddUserRoleForSite(new DC.RoleInSite() { RoleId = userRole.RoleId }, user.Id);
//            }
//            else
//            {
//                this.UserRepo.DeleteUserRoleForSite (new DC.RoleInSite() { RoleId = userRole.RoleId }, user.Id);
//            }

//            return Redirect ( "/");
            
//        }




     
//    }
//}
