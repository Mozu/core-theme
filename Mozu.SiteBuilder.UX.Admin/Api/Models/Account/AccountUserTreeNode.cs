using System.Collections.Generic;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Account
{
    public class AccountUserTreeNode
    {
        public string NodeId { get; set; }
        public string ParentId { get; set; }
        public string Id { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public string Role { get; set; }
        public string Activity { get; set; }
        public bool Leaf { get; set; }
        public string Type { get; set; }
        public List<AccountUserTreeNode> Items { get; set; }
    }
}
