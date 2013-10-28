using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.UX.Models.Settings
{
    public class SiteBuilderWeb
    {

        public Theme Theme { get; set; }

    }
    public class Theme
    {
        public string Desktop { get; set; }
        public string Mobile { get; set; }
        public List<string> DesktopAddons { get; set; }
        public List<string> MobileAddons { get; set; }
    }
}
