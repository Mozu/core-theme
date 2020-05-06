using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Mozu.Location.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.PhysicalLocation
{
    public class PhysicalLocation
    {
        public List<Country> Countries { get; set; }
    }

    public class Country
    {
        public string Name { get; set; }
        public string Code { get; set; }
        public List<State> States { get; set; }
    }

    public class State
    {
        public string Name { get; set; }
        public string Code { get; set; }

        public List<Mozu.Location.Contracts.Location> Locations { get;set; }
    }

}