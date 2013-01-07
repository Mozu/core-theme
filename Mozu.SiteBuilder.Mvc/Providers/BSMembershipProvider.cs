//// -----------------------------------------------------------------------
//// <copyright file="BSMembershipProvider.cs" company="Microsoft">
//// TODO: Update copyright text.
//// </copyright>
//// -----------------------------------------------------------------------

//namespace Mozu.SiteBuilder.Mvc.Providers
//{
//    using System;
//    using System.Collections.Generic;
//    using System.Linq;
//    using System.Text;
//    using System.Web.Security;

//    /// <summary>
//    /// TODO: Update summary.
//    /// </summary>
//    public class BSMembershipProvider : MembershipProvider
//    {
//        public override string ApplicationName
//        {
//            get;
//            set;
//        }

//        public override bool ChangePassword(string username, string oldPassword, string newPassword)
//        {
//            throw new NotImplementedException();
//        }

//        public override bool ChangePasswordQuestionAndAnswer(string username, string password, string newPasswordQuestion, string newPasswordAnswer)
//        {
//            throw new NotImplementedException();
//        }

//        public override MembershipUser CreateUser(string username, string password, string email, string passwordQuestion, string passwordAnswer, bool isApproved, object providerUserKey, out MembershipCreateStatus status)
//        {
//            throw new NotImplementedException();
//        }

//        public override bool DeleteUser(string username, bool deleteAllRelatedData)
//        {
//            throw new NotImplementedException();
//        }

//        public override bool EnablePasswordReset
//        {
//            get { throw new NotImplementedException(); }
//        }

//        public override bool EnablePasswordRetrieval
//        {
//            get { throw new NotImplementedException(); }
//        }

//        public override MembershipUserCollection FindUsersByEmail(string emailToMatch, int pageIndex, int pageSize, out int totalRecords)
//        {
//            throw new NotImplementedException();
//        }

//        public override MembershipUserCollection FindUsersByName(string usernameToMatch, int pageIndex, int pageSize, out int totalRecords)
//        {
//            throw new NotImplementedException();
//        }

//        public override MembershipUserCollection GetAllUsers(int pageIndex, int pageSize, out int totalRecords)
//        {
//            throw new NotImplementedException();
//        }

//        public override int GetNumberOfUsersOnline()
//        {
//            throw new NotImplementedException();
//        }

//        public override string GetPassword(string username, string answer)
//        {
//            throw new NotImplementedException();
//        }

//        public override MembershipUser GetUser(string username, bool userIsOnline)
//        {
//            throw new NotImplementedException();
//        }

//        public override MembershipUser GetUser(object providerUserKey, bool userIsOnline)
//        {
//            throw new NotImplementedException();
//        }

//        public override string GetUserNameByEmail(string email)
//        {
//            throw new NotImplementedException();
//        }

//        public override int MaxInvalidPasswordAttempts
//        {
//            get { return 40; }
//        }

//        public override int MinRequiredNonAlphanumericCharacters
//        {
//            get { return 0; }
//        }

//        public override int MinRequiredPasswordLength
//        {
//            get { return 0; ; }
//        }

//        public override int PasswordAttemptWindow
//        {
//            get { return 0; }
//        }

//        public override MembershipPasswordFormat PasswordFormat
//        {
//            get { return MembershipPasswordFormat.Clear; }
//        }

//        public override string PasswordStrengthRegularExpression
//        {
//            get { return null; }
//        }

//        public override bool RequiresQuestionAndAnswer
//        {
//            get { return false; }
//        }

//        public override bool RequiresUniqueEmail
//        {
//            get { return false; }
//        }

//        public override string ResetPassword(string username, string answer)
//        {
//            throw new NotImplementedException();
//        }

//        public override bool UnlockUser(string userName)
//        {
//            throw new NotImplementedException();
//        }

//        public override void UpdateUser(MembershipUser user)
//        {
//            throw new NotImplementedException();
//        }

//        public override bool ValidateUser(string username, string password)
//        {
//            return BSProfileProvider.GetTenantId(username) != null;

//        }
//    }
//}
