# Email Extension API (Get/Set) – Technical Guide

## Purpose
Enable ArcJS (`embedded.commerce.email.render.before`) functions to read and mutate the email rendering pipeline (subject, template, model, content, user, suppression) in a controlled, testable manner.

## Core Type: EmailRenderContext
| Property | Description | ViewData Mapping |
|----------|-------------|------------------|
| Notification | Original EmailNotification payload | n/a |
| Model | Primary view model consumed by template | `ViewData.Model` |
| Content | CMS document/content for the template | `ViewData["content"]` |
| User | Shopper/user context | `ViewData["User"]` |
| Site | Current site object | `ViewData["site"]` |
| RmaLocation | Return / fulfillment location | `ViewData["rmaLocation"]` |
| DomainName | Storefront domain | `ViewData["domainName"]` |
| StoreFrontAttributes | Shopper order attributes | `ViewData["storefrontOrderAttributes"]` |
| OriginalTemplate | Template ID before any extension change | n/a |
| CurrentTemplate | Active template ID after modifications | n/a |
| Subject | Working subject (mutable) | `ViewData["subject"]` |
| IsSuppressed | Flag to suppress send | n/a |
| TemplateChanged | Indicates template swap occurred | n/a |
| Template | (Legacy / existing field) | n/a |

## Initialization Flow
1. `EmailController.Render` builds an `EmailRenderContext`.
2. `EmailExtensionContextBuilder.BuildContext` populates baseline values.
3. `EmailExtensionContextBuilder.CreateExtensionContext` creates a fresh `ApiActionExtensionFilterContext` (new `ViewDataDictionary`, no stale values) and calls `EmailExtensionApiBinding.ConfigureEmailApiExtensions`.
4. `EmailExtensionApiBinding.ConfigureEmailApiExtensions` registers Exec delegates and seeds snapshot getters.
5. Function runner executes ArcJS functions (topic: `embedded.commerce.email.render.before`).
6. Each setter triggers `RefreshDto` which syncs Items, ViewData, and the live context.
7. Controller uses mutated context to render / finalize subject, template, suppression.

## Read Surface (Getters)
Available via `context.Items` (snapshot after each mutation):
- `getSubject`
- `getModel`
- `getContent`
- `getUser`
- `getSite`
- `getRmaLocation`
- `getDomainName`
- `getStoreFrontAttributes`

Live reference:
- `emailRenderContext`

### ArcJS Access Patterns
```javascript
const subject = context.items.getSubject || context.items && context.items.emailRenderContext.subject;
const model = context.items.getModel;
```

## Write Surface (Exec Delegates)
| Delegate | ArcJS Invocation | Effect |
|----------|------------------|--------|
| setSubject | `context.exec.setSubject('New Subject')` | Updates Subject + `ViewData["subject"]` |
| suppressEmail | `context.exec.suppressEmail` | Sets `IsSuppressed = true` |
| setTemplate | `context.exec.setTemplate('alternate-template-id')` | Sets `CurrentTemplate`, `TemplateChanged = true` |
| setContent | `context.exec.setContent([contentObj])` | Updates `Content` + `ViewData["content"]` |
| setModel | `context.exec.setModel([modelObj])` | Updates `Model` + `ViewData.Model` |
| setUser | `context.exec.setUser([userObj])` | Replaces `User` + `ViewData["User"]` |

Notes:
- Most setters expect first argument inside a JSON array (ArcJS `['value']` => server `JArray[0]`).
- `suppressEmail` ignores arguments.
- `setUser` inspects raw object; still call `[userObj]` for consistency.

## Subject Resolution Order
1. `EmailRenderContext.Subject` (after `setSubject`).
2. CMS Document property `subject` (if present).
3. Template title.
4. `notification.Topic`.

## Template Switching
- Call `setTemplate` early (before content-dependent logic).
- If new template ID invalid, system logs a warning and reverts to original.
- After a successful switch, controller re-fetches CMS content once.
- Use `setContent` only if you need a custom content object beyond CMS.

## Suppression
Calling `suppressEmail` results in:
- `EmailResponse.SuppressedSend = true`
- Body returned as empty string
- Subject still populated (auditing / logging)

## setModel vs setContent
- `Model`: Business payload used by template logic / conditions.
- `Content`: CMS-managed document (static authored fields). Override only for dynamic composition / A/B or injected data not present in CMS.

## Multiple Mutations / Idempotency
- Last write wins.
- Every setter re-runs `RefreshDto` ensuring snapshot getters remain current.

## Error & Edge Handling
- Null / empty args => no-op.
- Malformed shapes => silent no-op.
- Unknown template => fallback to original, logs warning.
- Exceptions in Exec delegates are swallowed (pipeline continues with latest safe state).

## ArcJS Examples
### 1. Prefix Subject & Conditional Suppression
```javascript
exports.handler = function(context, callback) {
  try {
    const subject = context.items.getSubject;
    const model = context.items.getModel;

    if (subject === 'order.changed' && !model?.items?.length) {
      context.items.exec('suppressEmail');
      return callback();
    }

    context.exec.setSubject('MyBrand ' + subject]);
    callback();
  } catch { callback(); }
};
```

### 2. Dynamic Template Swap & Model Enrichment
```javascript
exports.handler = function(context, callback) {
  try {
    const subject = context.items.getSubject;
    const model = context.items.getModel;

    if (subject === 'order.changed' && model?.isCurbside) {
      context.exec.setTemplate('order.curbside.custom');
      context.exec.setSubject('Your curbside order is confirmed');
    }

    if (model?.items?.length) {
      model.highDuty = model.items.some(i => i.dutyAmount > 100);
      context.exec.setModel(model);
    }
    callback();
  } catch { callback(); }
};
```

### 3. Inject Footer Content
```javascript
exports.handler = function(context, callback) {
  try {
    const content = context.items.getContent || {};
    content.dynamicFooter = 'Thank you – Generated at ' + new Date().toISOString();
    context.exec.setContent(content);
    callback();
  } catch { callback(); }
};
```

### 4. Provide Fallback User
```javascript
exports.handler = function(context, callback) {
  try {
    const user = context.items.getUser;
    if (!user || !user.firstName) {
      context.exec.setUser([{
        userId: 'anonymous',
        firstName: 'Valued',
        lastName: 'Customer',
        email: 'no-reply@example.com',
        isAnonymous: true
      }]);
    }
    callback();
  } catch { callback(); }
};
```

### 5. Hard Suppression Rule
```javascript
exports.handler = function(context, callback) {
  try {
    const model = context.items.getModel;
    if (model?.status === 'INTERNAL_ONLY') {
      context.exec.suppressEmail();
    }
    callback();
  } catch { callback(); }
};
```

### 6. Complex Logic Example injectong dynamic contnet based on order attributes
```javascript
exports.handler = function (context, callback) {
    
    console.log('this is the test for changing the email content dynamically');
        
    // scenario: add custom content to order changed email

    var model = context.items.getModel;
    var user = context.items.getUser;
    var firstName = user.firstName;

    console.log('user first name is ' + firstName);
    console.log('order number is ' + model.orderNumber);
    console.log('email subject is ' + context.items.getSubject);

    var subject = context.items.getSubject;
    
    if (subject == "order.changed") {
        model.customContent = "This is custom content added dynamically through arc for user " + firstName + " for order " + model.orderNumber;
        context.exec.setModel(model);

        var newContent = context.items.getModel;
        console.log('new content is ' + JSON.stringify(newContent, null, 2));
        console.log('set new content successfully');
    }

    callback();
};
```

## Unit Test Pattern (C#)
```csharp
// Arrange
var ctx = TestHelpers.CreateConfiguredEmailExtensionFilterContext();
var emailCtx = (EmailRenderContext)ctx.Items["emailRenderContext"];

// Act
await ctx.ExecDelegates["setSubject"](new object[] { new JArray("Unit Test Subject") });
await ctx.ExecDelegates["setTemplate"](new object[] { new JArray("alt-template") });
await ctx.ExecDelegates["suppressEmail"](Array.Empty<object>());

// Assert
Assert.Equal("Unit Test Subject", emailCtx.Subject);
Assert.True(emailCtx.TemplateChanged);
Assert.True(emailCtx.IsSuppressed);
Assert.Equal("alt-template", emailCtx.CurrentTemplate);
Assert.Equal(emailCtx.Subject, ctx.Items["getSubject"]);
```
Helper:
```csharp
static object[] Arg(object value) => new object[] { new JArray(value) };
```

## Adding a New Setter (Pattern)
1. Add new property to `EmailRenderContext` if needed.
2. Register new `context.ExecDelegates["setX"]` in `EmailExtensionApiBinding.ConfigureEmailApiExtensions`.
3. Inside delegate: mutate context, adjust `ViewData`, call `RefreshDto`.
4. Add unit test to assert property + Items + ViewData updates.

## Diagnostics & Logging
- Each delegate logs before/after (Debug level).
- Template switches and suppression explicitly logged.
- Failures revert to safest state without aborting pipeline.

## Quick Reference Cheat Sheet
Read:
```
subject = context.items.getSubject
model = context.items.getModel
content = context.items.getContent
user = context.items.getUser
site = context.items.getSite
```
Write:
```
context.exec.setSubject('...')
context.exec.setTemplate('template-id')
context.exec.setModel(obj)
context.exec.setContent(obj)
context.exec.setUser(userObj)
context.exec.suppressEmail()
```
Suggested order:
1. setTemplate (if needed)
2. setModel / setContent / setUser
3. setSubject (after final data shaping)
4. suppressEmail (as soon as condition known)

## Change Log (Initial Introduction)
- Added ExecDelegates with setter functions
- Added dynamic refresh snapshots (get* keys)
- Enabled template swapping and suppression pre-render

Owner: <team>
Version: 1.0
