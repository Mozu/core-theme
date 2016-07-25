using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Reports
{
    public class Report
    {
        public int ReportId { get; set; }
        public int ChartioId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int Ordinality { get; set; }
    }
}