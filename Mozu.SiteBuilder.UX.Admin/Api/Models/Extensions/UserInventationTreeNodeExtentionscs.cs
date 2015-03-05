using System.Collections.Generic;
using System.Web;
using Mozu.AppDev.Contracts.External;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Account;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Extensions
{
    public static class UserInventationTreeNodeExtentionscs
    {
        public static List<AccountUserTreeNode> ToTreeNode(this List<AccountUser> accountUsers)
        {
            var accountUserTreeNodeList = new List<AccountUserTreeNode>();
            foreach (var accountUser in accountUsers)
            {
                List<AccountUserTreeNode> roles = new List<AccountUserTreeNode>();// = ToLeafNode(accountUser, accountUser.Roles);
                var roleText = "None";

                if (!accountUser.Roles.IsNullOrEmpty())
                {
                    roles = ToLeafNode(accountUser);
                }
                if (!roles.IsNullOrEmpty() && roles.Count < 2)
                {
                    roleText = roles[0].Role;
                    roles = new List<AccountUserTreeNode>();
                }
                else
                {
                    roleText = "Multiple";
                }
                var accountUserTreeNode = new AccountUserTreeNode()
                {
                    NodeId = "user-" + accountUser.Id,
                    ParentId = "",
                    Id = accountUser.Id,
                    Email = accountUser.Email,
                    Role = roleText,
                    Activity = accountUser.Activity,
                    Leaf = false,
                    Type = accountUser.Type,
                    Items = roles
                };

                accountUserTreeNodeList.Add(accountUserTreeNode);
            }
            return accountUserTreeNodeList;
        }

        public static List<AccountUserTreeNode> ToLeafNode(this AccountUser user)
        {
            List<AccountUserTreeNode> accountRoleLeafNodeList = new List<AccountUserTreeNode>();
            List<AccountUserRole> accountRoles = user.Roles;

            foreach (var accountRole in accountRoles)
            {
                var accountRoleLeafNode = new AccountUserTreeNode()
                {
                    NodeId = "user-" + user.Id + "role-"+accountRole.RoleId,
                    ParentId = user.Id,
                    Id = accountRole.RoleId.ToString(),
                    Email = "",
                    Role = accountRole.RoleName,
                    Activity = "",
                    Leaf = true,
                    Type = "Roll",
                    Items = new List<AccountUserTreeNode>()
                };

                accountRoleLeafNodeList.Add(accountRoleLeafNode);
            }
            return accountRoleLeafNodeList;
        }

    }
}
