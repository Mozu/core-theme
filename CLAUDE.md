# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mozu.SiteBuilder.Storefront is a .NET 6 ASP.NET Core web application that serves as the storefront and site building platform for Kibo Commerce. It's a multi-project solution that provides both customer-facing e-commerce functionality and administrative tools for content management.

## Build and Development Commands

### Building the Solution
```bash
# Build entire solution
dotnet build

# Build with specific configuration
dotnet build -c Release
dotnet build -c Debug

# Build specific project
dotnet build Mozu.SiteBuilder.UX/Mozu.SiteBuilder.UX.csproj
```

### Running the Application
```bash
# Run the main UX project
dotnet run --project Mozu.SiteBuilder.UX

# Run with specific environment
dotnet run --project Mozu.SiteBuilder.UX --environment Development
```

### Testing
```bash
# Run all unit tests
dotnet test

# Run specific test project
dotnet test Mozu.SiteBuilder.UnitTests/Mozu.SiteBuilder.UnitTests.csproj

# Run tests with coverage
dotnet test --collect:"XPlat Code Coverage"
```

### Docker Operations
```bash
# Build Docker image
docker build -t mozu-sitebuilder .

# The Dockerfile handles both build and runtime setup, including:
# - .NET 6 runtime and build environments
# - Node.js for CoreTheme build process
# - Unit test execution during build
```

### Theme Development
The project includes a git submodule for the CoreTheme at `Mozu.CoreTheme/`:
```bash
# Initialize and update submodule
git submodule update --init --recursive

# Update submodule to latest
git submodule update --remote
```

## Solution Architecture

### Project Structure
- **Mozu.SiteBuilder.UX** - Main web application, entry point with controllers and views
- **Mozu.SiteBuilder.Mvc** - Core MVC framework layer with view engines, filters, and middleware
- **Mozu.SiteBuilder.UX.Models** - Data models and DTOs for the UX layer
- **Mozu.SiteBuilder.UnitTests** - Unit test project covering all components

### Technology Stack
- **.NET 6** - Runtime platform
- **ASP.NET Core MVC** - Web framework with custom view engine
- **Hypr Template Engine** - Custom templating system for themes
- **MongoDB GridFS** - Theme and content storage
- **Redis** - Caching layer
- **Autofac** - Dependency injection container
- **Docker** - Containerization

### Key Architectural Components

#### View Engine (Hypr)
- Custom view engine in `Mozu.SiteBuilder.Mvc.ViewEngine/`
- Supports both file-based and MongoDB-stored templates
- Template resolution follows patterns: `templates/pages/{name}`, `templates/modules/{name}`, `widgets/{name}`
- Handles theme inheritance and hierarchical template loading

#### Middleware Pipeline
Critical middleware components in order:
- `SessionMiddleware` - Session management
- `SiteContextInitializationMiddleware` - Site context setup
- `MzUnderscoreRequestCleanerMiddleware` - Request URL cleanup
- `EnforceSiteWideSsLMiddleware` - SSL enforcement
- `UrlRewritingMiddleware` - URL rewriting and routing

#### Caching Strategy
- `StorefrontCache` - Main caching abstraction
- `LiveModeOnlyCache` - Environment-specific caching
- Redis-backed distributed caching for scalability
- Partial output caching with configurable duration

#### Theme System
- Theme metadata and configuration in `Mozu.SiteBuilder.Mvc/Themes/`
- Supports theme inheritance and hierarchical loading
- Theme files can be stored in filesystem or MongoDB GridFS
- Build process handles theme compilation and optimization

### Configuration Environments
The solution supports multiple deployment environments:
- **Debug/Development** - Local development
- **CI** - Continuous integration builds
- **Demo** - Demo environment deployments
- **QA** - Quality assurance testing
- **Prod** - Production deployments
- **SI** - System integration testing

### Content Management
- CMS functionality in `Mozu.SiteBuilder.Mvc/CMS/`
- Document-based content management with MongoDB storage
- Page templates and content rules engine
- Widget system for modular content composition

### Security Features
- Custom authorization attributes and filters
- SSL enforcement middleware
- CSRF protection
- Input validation and sanitization
- Role-based access control

### API Integration
The application integrates with multiple Kibo Commerce APIs:
- Commerce Runtime API (cart, checkout, orders)
- Product Runtime API (catalog, products)
- Customer Management API
- Content Management API
- Location/Inventory API
- Admin User API

## Development Guidelines

### Adding New Controllers
Controllers should inherit from `BaseApiController` and use appropriate action filters:
```csharp
[ContextInitialization]
[DataViewModeEnforcement]
public class MyController : BaseApiController
```

### Custom Template Tags
Template tags are located in `Mozu.SiteBuilder.Mvc/Tags/` and should inherit from appropriate base classes like `SimpleTagBase` or `DynamicTagBase`.

### Middleware Development
Custom middleware should be added to the `SbStartupFilter` or main pipeline in `Startup.cs` and follow the established patterns for error handling and context management.

### Theme Development
- Theme files use Hypr templating syntax
- JavaScript modules use AMD/RequireJS pattern
- Core theme is managed as a git submodule
- Build process includes Grunt tasks for optimization

### Testing Patterns
- Unit tests use dependency injection mocking
- Test data is stored in `Mozu.SiteBuilder.UnitTests/TestData/`
- Controller tests should test both success and error scenarios
- Integration tests cover middleware pipeline behavior

## Key File Locations

- **Main Entry Point**: `Mozu.SiteBuilder.UX/Startup.cs`
- **Routing Configuration**: `Mozu.SiteBuilder.UX/Configuration/RouteConfig.cs`
- **View Engine**: `Mozu.SiteBuilder.Mvc/ViewEngine/HyprViewEngine.cs`
- **Caching**: `Mozu.SiteBuilder.Mvc/Caching/StorefrontCache.cs`
- **Theme Management**: `Mozu.SiteBuilder.Mvc/Themes/ThemeRepository.cs`
- **Built-in Scripts**: `Mozu.SiteBuilder.UX/BuiltinScripts/` (SDK, RequireJS, HyprLive)

## Environment-Specific Notes

This codebase is designed for multi-tenant e-commerce deployment with environment-specific configuration through Spring Cloud Config. The application handles tenant context initialization, site routing, and scalable content delivery.