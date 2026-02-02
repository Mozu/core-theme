# Vendor Created Email Template Implementation Plan

## Overview
This document outlines the plan to create a new email template for the `vendor.created` event, following the pattern established in PR #468 (COM-8823: Email template for auto substitutions).

## Source Reference
**PR #468 Analysis:** The order items substituted email template introduced:
- New email template file: `order-items-substituted.hypr`
- New CSS styles in `email.less` for table styling
- New label entries in language files (`en-US.json`, `de-DE.json`)
- Registration in `theme.json` for email template configuration
- Optional: Custom included template for item summary details

## Vendor Object Structure
The `vendor.created` event will provide the following VendorObject with these fields being used:
```json
{
    "vendorCode": "System.String",
    "name": "System.String",
    "contactInfo": {
        "email": "System.String"
    }
}
```

## Implementation Plan

### Phase 1: Label Strings (Language Files)
**Files to modify:**
- `labels/en-US.json`
- `labels/de-DE.json`

**Changes:**
Add the following label keys for messages only:

#### English (en-US.json)
```json
"vendorCreatedEmailGreeting": "Congratulations!",
"vendorCreatedEmailIntro": "A new vendor account has been successfully created with the following details:",
"vendorCreatedEmailVendorName": "Vendor Name",
"vendorCreatedEmailVendorCode": "Vendor Code",
"vendorCreatedEmailVendorEmail": "Email Address",
"vendorCreatedEmailLoginInstructions": "To access your vendor portal and start managing your products and orders, please log in using the link below:",
"vendorCreatedEmailLoginLink": "Login to Vendor Portal",
"vendorCreatedEmailSupport": "If you have any questions or need assistance, please contact our vendor support team."
```

#### German (de-DE.json)
```json
"vendorCreatedEmailGreeting": "Glückwunsch!",
"vendorCreatedEmailIntro": "Ein neues Vendorkonto wurde erfolgreich mit den folgenden Details erstellt:",
"vendorCreatedEmailVendorName": "Vendor-Name",
"vendorCreatedEmailVendorCode": "Vendor-Code",
"vendorCreatedEmailVendorEmail": "E-Mail-Adresse",
"vendorCreatedEmailLoginInstructions": "Um auf Ihr Vendor-Portal zuzugreifen und Ihre Produkte und Bestellungen zu verwalten, melden Sie sich bitte über den folgenden Link an:",
"vendorCreatedEmailLoginLink": "Login zum Vendor-Portal",
"vendorCreatedEmailSupport": "Wenn Sie Fragen haben oder Hilfe benötigen, wenden Sie sich bitte an unser Vendor-Support-Team."
```

#### French (fr-FR.json) - New
```json
"vendorCreatedEmailGreeting": "Félicitations !",
"vendorCreatedEmailIntro": "Un nouveau compte vendeur a été créé avec succès avec les détails suivants :",
"vendorCreatedEmailVendorName": "Nom du fournisseur",
"vendorCreatedEmailVendorCode": "Code du fournisseur",
"vendorCreatedEmailVendorEmail": "Adresse e-mail",
"vendorCreatedEmailLoginInstructions": "Pour accéder à votre portail fournisseur et commencer à gérer vos produits et commandes, veuillez vous connecter en utilisant le lien ci-dessous :",
"vendorCreatedEmailLoginLink": "Connexion au portail fournisseur",
"vendorCreatedEmailSupport": "Si vous avez des questions ou besoin d'aide, veuillez contacter notre équipe d'assistance aux fournisseurs."
```

#### Spanish (es-ES.json) - New
```json
"vendorCreatedEmailGreeting": "¡Felicidades!",
"vendorCreatedEmailIntro": "Se ha creado exitosamente una nueva cuenta de vendedor con los siguientes detalles:",
"vendorCreatedEmailVendorName": "Nombre del Vendedor",
"vendorCreatedEmailVendorCode": "Código del Vendedor",
"vendorCreatedEmailVendorEmail": "Dirección de Correo Electrónico",
"vendorCreatedEmailLoginInstructions": "Para acceder a su portal de vendedor y comenzar a gestionar sus productos y pedidos, inicie sesión utilizando el siguiente enlace:",
"vendorCreatedEmailLoginLink": "Iniciar sesión en el portal del vendedor",
"vendorCreatedEmailSupport": "Si tiene preguntas o necesita asistencia, póngase en contacto con nuestro equipo de soporte para vendedores."
```

### Phase 2: Email Styling (LESS)
**File to modify:**
- `stylesheets/email.less`

**Changes:**
Add the following CSS classes:

```less
// Vendor created email styles
.vendor-email-body {
  line-height: 1.6;
  color: #333333;
  font-family: Arial, sans-serif;
}

.vendor-info-box {
  background-color: #f5f5f5;
  padding: 15px;
  margin: 20px 0;
  border-left: 4px solid #666666;
  border-radius: 3px;
}

.vendor-info-row {
  margin: 10px 0;
  display: block;
}

.vendor-info-label {
  font-weight: bold;
  display: inline-block;
  width: 140px;
  color: #666666;
}

.vendor-info-value {
  display: inline-block;
  color: #333333;
}

.vendor-portal-link {
  display: inline-block;
  background-color: #666666;
  color: #ffffff;
  padding: 12px 30px;
  text-decoration: none;
  border-radius: 4px;
  margin-top: 15px;
  font-weight: bold;
}

.vendor-portal-link:hover {
  background-color: #555555;
}
```

### Phase 3: Email Template
**File to create:**
- `templates/email/vendor-created.hypr`

**Template Content:**
```hypr
{% extends "email/email" %}
{% block body-content %}

<div class="vendor-email-body">
  <h2>{{ labels.vendorCreatedEmailGreeting }}</h2>

  <p>{{ labels.vendorCreatedEmailIntro }}</p>

  <div class="vendor-info-box">
    <div class="vendor-info-row">
      <span class="vendor-info-label">{{ labels.vendorCreatedEmailVendorName }}:</span>
      <span class="vendor-info-value">{{ model.name }}</span>
    </div>
    <div class="vendor-info-row">
      <span class="vendor-info-label">{{ labels.vendorCreatedEmailVendorCode }}:</span>
      <span class="vendor-info-value">{{ model.vendorCode }}</span>
    </div>
    <div class="vendor-info-row">
      <span class="vendor-info-label">{{ labels.vendorCreatedEmailVendorEmail }}:</span>
      <span class="vendor-info-value">{{ model.contactInfo.email }}</span>
    </div>
  </div>

  <br>

  <p>{{ labels.vendorCreatedEmailLoginInstructions }}</p>

  <div style="text-align: center; margin: 20px 0;">
    <a href="https://www.figma.com/make/UewZqRQ0PhUtLsnzDDxZiY/E-commerce-Platform-Wireframe?p=f" class="vendor-portal-link">
      {{ labels.vendorCreatedEmailLoginLink }}
    </a>
  </div>

  <br>

  <p>{{ labels.vendorCreatedEmailSupport }}</p>

  <br>

  {{ labels.emailClosing|string_format(siteContext.generalSettings.websiteName)|safe }}
</div>

{% endblock body-content %}
```

### Phase 4: Theme Configuration
**File to modify:**
- `theme.json`

**Changes:**
Add the following entry to the `emailTemplates` array (maintain alphabetical ordering by ID where appropriate):

```json
{
  "id": "vendor.created",
  "properties": {},
  "template": "email/vendor-created",
  "title": "Vendor Account Created"
}
```

**Placement:** Insert after an appropriate existing email template entry (suggested: after order/shipment related emails, before subscription emails, or in the appropriate alphabetical location).

## Implementation Order
1. **Step 1:** Add label strings to language files (`en-US.json`, `de-DE.json`, `fr-FR.json`, `es-ES.json`)
2. **Step 2:** Add CSS styles to `stylesheets/email.less`
3. **Step 3:** Create the email template file `templates/email/vendor-created.hypr`
4. **Step 4:** Register the template in `theme.json`

## Testing Checklist
- [ ] Labels render correctly in all supported languages (English, German, French, Spanish)
- [ ] Email template displays vendor name, code, and email correctly
- [ ] Styling renders properly in email clients
- [ ] Email template extends base email layout properly
- [ ] Theme.json is valid JSON with no syntax errors
- [ ] Template can be selected in the CMS editor
- [ ] Email preview renders correctly in email client
- [ ] All three vendor details (name, code, email) are displayed correctly
- [ ] Login portal link is clickable and formatted correctly
- [ ] Email is responsive and looks good on mobile devices

## Optional Enhancements (Future)
1. Add vendor-specific branding/logo if available in model
2. Include vendor onboarding checklist or getting started guide
3. Add support contact information with phone/chat links
4. Support for conditional messaging based on vendor type
5. Add social media links to vendor portal community

## References
- **PR #468:** https://github.com/Mozu/core-theme/pull/468
- **Related Commit:** COM-8823 (Email template for auto substitutions)
- **Pattern:** Based on existing email templates (order-items-substituted.hypr, b2b-account-created.hypr)
- **Hypr Template Documentation:** Part of Kibo Commerce theming system

## Notes
- This implementation follows the same pattern as the order-items-substituted email template
- The template uses the standard email base layout for consistency
- All labels are internationalized for multiple language support: English, German, French, and Spanish
- CSS styling includes a professional info box to highlight vendor details
- The vendor login portal URL is set to: https://www.figma.com/make/UewZqRQ0PhUtLsnzDDxZiY/E-commerce-Platform-Wireframe?p=f
- The template displays all required information: vendor name, vendor code, and contact email
- A prominent call-to-action button is included for easy login access
- Uses contactInfo.email field for both recipient identification and display in template

---

## Answers to Clarification Questions

1. **Vendor Portal Login URL:** https://www.figma.com/make/UewZqRQ0PhUtLsnzDDxZiY/E-commerce-Platform-Wireframe?p=f

2. **Email Display:** Yes, vendor contact email is displayed in template body alongside name and code

3. **Vendor Code Presentation:** Creative approach implemented - template displays all vendor details (name, code, email) in a highlighted information box with congratulations greeting

4. **Additional Instructions:** Simple and clear - direct vendors to login using the URL above with a prominent call-to-action button

5. **Language Support:** Multi-language support added:
   - English (en-US)
   - German (de-DE)
   - French (fr-FR)
   - Spanish (es-ES)
