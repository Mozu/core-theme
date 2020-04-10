using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;

namespace Mozu.SiteBuilder.UX.Areas.Misc.Controllers
{
    public class ScriptController : BaseApiController
	{
		public IActionResult Add(string scriptName)
		{
            var scripts = (HashSet<string>)this.HttpContext.Items["scripts"];
			if (scripts == null)
			{
                this.HttpContext.Items["scripts"] = scripts = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
			}
			scripts.Add(scriptName);
			return null;
		}

        [HttpGet]
		public IActionResult RenderScripts()
		{
            var scriptsArray = (HashSet<string>)this.HttpContext.Items["scripts"];
			if (scriptsArray == null)
				return null;


			object model = string.Join(",", scriptsArray.Select(x => "'" + x + "'").ToArray());

			return PartialView(model);
		}
        // this now does exactly the same thing as RenderScripts, where before it tried a different URL.
        // we now know to use requirejs's baseUrl to do this
        // so now these should probably be turned into a single method that selects its view based on whether "debug_all_scripts" or "load_all_scripts" was used

        [HttpGet]
        public IActionResult DebugScripts()
        {
            var scriptsArray = (HashSet<string>)this.HttpContext.Items["scripts"];
            if (scriptsArray == null)
                return null;


			object model = string.Join(",", scriptsArray.Select(x => "'" + x + "'").ToArray());

            return PartialView(model);
        }
	}
}