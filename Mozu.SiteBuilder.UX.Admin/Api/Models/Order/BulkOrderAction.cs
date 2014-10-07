using System;
using System.Collections;
using System.Collections.Generic;
using System.Net;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    public class BulkOrderAction
    {
        public string ActionName { get; set; }
        public List<OrderContext> OrderContexts { get; set; }
    }

    public class OrderContext
    {
        public string OrderId { get; set; }
        public int MasterCatalogId { get; set; }
    }

    public class BulkOrderActionResult
    {
        public bool ContainsErrors { get; set; }
        public List<OrderActionResult> OrderActionResults { get; set; }
    }

    public class OrderActionResult
    {
        public string OrderId { get; set; }

        public bool Successful { get; set; }

        public HttpStatusCode StatusCode { get; set; }
        public string ErrorMessage { get; set; }
//        public Exception Exception { get; set; } //todo: Stewart Noll on 2014-10-02 want this???
    }
}