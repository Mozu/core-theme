<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage" %>

<!DOCTYPE html>

<html>
<head runat="server">
    <meta name="viewport" content="width=device-width" />
    <title>TestingController - Authentication Ticket</title>
</head>
<body>
    <form method="post" action="/admin/auth/ticket">
        <p>
            <label for="ticket">Auth token:</label>
            <textarea name="ticket"></textarea>
        </p>
        <p>
            <label for="tenantId">Tenant id (required):</label>
            <input type="number" name="tenantId" />
        </p>
        <p>
            <label for="redirectUrl">Redirect Url (optional):</label>
            <input type="text" name="redirectUrl" />
        </p>
        <p>
            <input type="submit" />
        </p>
    </form>
</body>
</html>
