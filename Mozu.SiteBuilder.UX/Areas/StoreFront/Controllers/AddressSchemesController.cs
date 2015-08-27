using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using Mozu.Core.Api.Contracts;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models;

using User = Mozu.SiteBuilder.UX.Models.Customers.User;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{

    public class AddressSchemesController : BaseApiController
    {
     
        private readonly ICookieProvider _cookieProvider;


        public AddressSchemesController(ICookieProvider cookieProvider)
        {

         
            _cookieProvider = cookieProvider;

        }

        //
        // GET: /StoreFront/Auth/
        [System.Web.Http.HttpGet]
        public object Index()
        {
            return new
                       {
                           US = new
                                    {
                                        stateprovLabel = "State",
                                        stateprovList = new object[]
                                                            {
                                                                new
                                                                    {
                                                                        label = "Alabama",
                                                                        code = "AL"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Alaska",
                                                                        code = "AK"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "American Samoa",
                                                                        code = "AS"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Arizona",
                                                                        code = "AZ"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Arkansas",
                                                                        code = "AR"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Armed Forces Europe",
                                                                        code = "AE"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Armed Forces Pacific",
                                                                        code = "AP"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Armed Forces the Americas",
                                                                        code = "AA"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "California",
                                                                        code = "CA"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Colorado",
                                                                        code = "CO"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Connecticut",
                                                                        code = "CT"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Delaware",
                                                                        code = "DE"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "District of Columbia",
                                                                        code = "DC"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Federated States of Micronesia",
                                                                        code = "FM"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Florida",
                                                                        code = "FL"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Georgia",
                                                                        code = "GA"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Guam",
                                                                        code = "GU"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Hawaii",
                                                                        code = "HI"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Idaho",
                                                                        code = "ID"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Illinois",
                                                                        code = "IL"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Indiana",
                                                                        code = "IN"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Iowa",
                                                                        code = "IA"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Kansas",
                                                                        code = "KS"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Kentucky",
                                                                        code = "KY"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Louisiana",
                                                                        code = "LA"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Maine",
                                                                        code = "ME"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Marshall Islands",
                                                                        code = "MH"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Maryland",
                                                                        code = "MD"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Massachusetts",
                                                                        code = "MA"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Michigan",
                                                                        code = "MI"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Minnesota",
                                                                        code = "MN"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Mississippi",
                                                                        code = "MS"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Missouri",
                                                                        code = "MO"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Montana",
                                                                        code = "MT"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Nebraska",
                                                                        code = "NE"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Nevada",
                                                                        code = "NV"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "New Hampshire",
                                                                        code = "NH"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "New Jersey",
                                                                        code = "NJ"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "New Mexico",
                                                                        code = "NM"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "New York",
                                                                        code = "NY"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "North Carolina",
                                                                        code = "NC"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "North Dakota",
                                                                        code = "ND"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Northern Mariana Islands",
                                                                        code = "MP"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Ohio",
                                                                        code = "OH"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Oklahoma",
                                                                        code = "OK"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Oregon",
                                                                        code = "OR"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Pennsylvania",
                                                                        code = "PA"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Puerto Rico",
                                                                        code = "PR"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Rhode Island",
                                                                        code = "RI"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "South Carolina",
                                                                        code = "SC"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "South Dakota",
                                                                        code = "SD"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Tennessee",
                                                                        code = "TN"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Texas",
                                                                        code = "TX"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Utah",
                                                                        code = "UT"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Vermont",
                                                                        code = "VT"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Virgin Islands, U.S.",
                                                                        code = "VI"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Virginia",
                                                                        code = "VA"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Washington",
                                                                        code = "WA"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "West Virginia",
                                                                        code = "WV"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Wisconsin",
                                                                        code = "WI"
                                                                    },
                                                                new
                                                                    {
                                                                        label = "Wyoming",
                                                                        code = "WY"
                                                                    }
                                                            }
                                    },
                           UK = new
                                    {
                                        stateprovLabel = "County",
                                        stateprovList = new object[]
                                                            {
                                                                new
                                                                    {
                                                                        code = "NHM",
                                                                        label = "Nottinghamshire"
                                                                    },
                                                                new
                                                                    {
                                                                        code = "GLS",
                                                                        label = "Gloucestershirestershireest"
                                                                    }
                                                            }
                                    },
                           CAN = new
                                     {
                                         stateprovLabel = "Province",
                                         stateprovList = new object[]
                                                             {
                                                                 new
                                                                     {
                                                                         code = "QB",
                                                                         label = "Quebec"
                                                                     },
                                                                 new
                                                                     {
                                                                         code = "PI",
                                                                         label = "Prince Edward Island"
                                                                     },
                                                                 new
                                                                     {
                                                                         code = "SK",
                                                                         label = "Sasketchewatchewinnibagechalkbaunch"
                                                                     }
                                                             }
                                     }
                       };
        }
    }
}