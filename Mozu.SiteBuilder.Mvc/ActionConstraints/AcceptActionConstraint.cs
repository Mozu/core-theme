using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.ActionConstraints;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using MediaTypeHeaderValue = Microsoft.Net.Http.Headers.MediaTypeHeaderValue;

namespace Mozu.SiteBuilder.Mvc.ActionConstraints
{
    public class AcceptActionConstraint : IActionConstraint
    {
        private readonly bool _match;
        private readonly MediaTypeHeaderValue _mediaType;

        public AcceptActionConstraint(MediaTypeHeaderValue contentType, bool match = true)
        {
            _match = match;
            _mediaType = contentType;
        }

        public int Order => 0;

        public bool Accept(ActionConstraintContext context)
        {
            var ret = context.RouteContext.HttpContext.Request.GetTypedHeaders().Accept.Contains(_mediaType);
            return (_match == ret);
        }
    }

    public class AcceptHeaderAttribute : Attribute
    {
        public MediaTypeHeaderValue MediaType { get; set; }
        public bool AMatch { get; set; }
        public AcceptHeaderAttribute(string contentType, bool match = true)
        {
            AMatch = match;
            MediaType = new MediaTypeHeaderValue(contentType);
        }
    }

    public class AcceptHeaderConvention : IActionModelConvention
    {
        public void Apply(ActionModel action)
        {
            var acceptHeader = action.Attributes.OfType<AcceptHeaderAttribute>().FirstOrDefault();
            if (acceptHeader == null) return;
            foreach (var selector in action.Selectors)
            {
                selector.ActionConstraints.Add(new AcceptActionConstraint(acceptHeader.MediaType, acceptHeader.AMatch));
            }
        }
    }
}
