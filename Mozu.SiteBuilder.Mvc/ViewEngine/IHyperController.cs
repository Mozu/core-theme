using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    public interface  IHyprController 
    {
        IServiceProvider  LifetimeScope { get; set; }
    }
}
