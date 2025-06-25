FROM 542216209467.dkr.ecr.us-east-1.amazonaws.com/kibo/base-images:dotnet-6-run-1.2526.0-digicert-gs5-ca.7 AS base
RUN apt-get update && \
    apt-get install -y libgdiplus libc6-dev

WORKDIR /app
EXPOSE 80

FROM 542216209467.dkr.ecr.us-east-1.amazonaws.com/kibo/base-images:dotnet-6-build-1.2526.0-digicert-gs5-ca.7 AS build
WORKDIR /src
COPY ["./**/*.csproj", "./Mozu.SiteBuilder.sln",   "./"]
RUN /root/buildscripts/copyDotnetProjFiles.sh
RUN dotnet restore  --source https://api.nuget.org/v3/index.json --source http://ng-repo.dev.kibocommerce.com:8081/repository/nuget-localbuild/  
ARG BUILD_VER=0.0.0-alphagit 
ENV BUILD_VER=$BUILD_VER
COPY . .
RUN dotnet build /p:Version=${BUILD_VER}   -c Release && \
	dotnet publish /src/Mozu.SiteBuilder.UX/Mozu.SiteBuilder.UX.csproj -c Release -o /app --no-build --no-restore
RUN dotnet test /src/Mozu.SiteBuilder.UnitTests/Mozu.SiteBuilder.UnitTests.csproj -r /buildoutput/testoutput/UnitTests -l junit --no-build -c Release --collect:"XPlat Code Coverage" || true 	
RUN cd Mozu.CoreTheme &&\
    npm i &&\
    npm i grunt-cli -g&&\
    grunt build-production &&\
    rm -rf node_moduels     

FROM base AS final
WORKDIR /approot/sb/ux
RUN mkdir -p  /buildoutput/testoutput/ &&\
    mkdir -p /approot/sb/ux &&\
    mkdir -p /approot/Mozu.CoreTheme 
  
COPY --from=build /app /approot/sb/ux
COPY --from=build /src/Mozu.CoreTheme /approot/Mozu.CoreTheme
COPY --from=build /src/Mozu.SiteBuilder.UX/BuiltinScripts /approot/sb/ux/BuiltinScripts
COPY --from=build /buildoutput /buildoutput

ENTRYPOINT ["dotnet"]
CMD [ "Mozu.SiteBuilder.UX.dll"]

