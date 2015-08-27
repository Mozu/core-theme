using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;

using Autofac;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    public interface  IHyprController 
    {
        ILifetimeScope  LifetimeScope { get; set; }
    }
}
