<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage" %>

<!DOCTYPE html>

<html>
<head runat="server">
    <meta name="viewport" content="width=device-width" />
    <title>QA - Site list</title>
</head>
<body>
    <% foreach (var tenant in ((Mozu.Tenant.Contracts.TenantCollection)Model).Items) { %>
        <h2><%= String.Format("{0} - {1}", tenant.Id, tenant.Name) %></h2>
        <% foreach (var site in tenant.MasterCatalogs.SelectMany(sg => sg.Sites)) { %>
            <ul>
                <% string navUrl = ResolveUrl("~/_gosite/" + site.Id); %>
                <% string linkText = String.Format("{0}:{1} - {2}", site.TenantId, site.Id, site.Name); %>
                <li>                
                    <a href="<%= navUrl %>"><%= linkText %></a>
                </li>
            </ul>
        <% } %>
    <% } %>

</body>
</html>
