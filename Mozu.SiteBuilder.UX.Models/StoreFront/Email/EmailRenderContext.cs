using Mozu.Core.Messaging.Contracts.Notification;
using Mozu.SiteBuilder.UX.Models.Customers;
using Mozu.Tenant.Contracts;

namespace Mozu.SiteBuilder.UX.Models.StoreFront.Email
{
    public class EmailRenderContext
    {
        public EmailNotification Notification { get; set; }
        public object Model { get; set; }
        public User User { get; set; }
        public Site Site { get; set; }
        public object Content { get; set; }
        public Location.Contracts.Location RmaLocation { get; set; }
        public string DomainName { get; set; }
        public object StoreFrontAttributes { get; set; }
        public string OriginalTemplate { get; set; }
        public string CurrentTemplate { get; set; }
        public string Subject { get; set; }
        public bool IsSuppressed { get; set; }
        public bool TemplateChanged { get; set; }
        public string Template { get; set; }
    }
}
