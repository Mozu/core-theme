using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Reports
{
    public class ReportParams
    {
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public int ChartioId { get; set; }
        public int SiteId { get; set; }
    }
}