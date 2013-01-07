using System.Web.Mvc;
using Mozu.Core.Configuration;
using Volusion.SiteBuilder.UX.Models;

namespace Mozu.SiteBuilder.UX.StartupTasks
{
	public class RegisterViewEnginesStartupTask : StartUpTask
	{
		private readonly IViewEngine _viewEngine;

		public RegisterViewEnginesStartupTask(IViewEngine viewEngine)
		{
			_viewEngine = viewEngine;
		}

		#region Implementation of IStartUpTask

		public override void Execute()
		{
		    ViewEngines.Engines.Clear();
			ViewEngines.Engines.Insert(0, _viewEngine);
		}

		#endregion
	}
}