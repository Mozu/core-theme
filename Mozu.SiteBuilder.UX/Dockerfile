#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/core/aspnet:3.1-buster-slim AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/core/sdk:3.1-buster AS build
WORKDIR /src
COPY ["Mozu.SiteBuilder.UX/Mozu.SiteBuilder.UX.csproj", "Mozu.SiteBuilder.UX/"]
COPY ["Mozu.SiteBuilder.UX.Models/Mozu.SiteBuilder.UX.Models.csproj", "Mozu.SiteBuilder.UX.Models/"]
COPY ["Mozu.SiteBuilder.Mvc/Mozu.SiteBuilder.Mvc.csproj", "Mozu.SiteBuilder.Mvc/"]
RUN dotnet restore "Mozu.SiteBuilder.UX/Mozu.SiteBuilder.UX.csproj"
COPY . .
WORKDIR "/src/Mozu.SiteBuilder.UX"
RUN dotnet build "Mozu.SiteBuilder.UX.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Mozu.SiteBuilder.UX.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Mozu.SiteBuilder.UX.dll"]