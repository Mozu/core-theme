FROM mcr.microsoft.com/dotnet/core/aspnet:3.1-buster-slim AS base
RUN apt-get update && \
    apt-get install -y gnupg  &&\
    curl -sL https://deb.nodesource.com/setup_13.x | bash - && \
    apt-get install -y nodejs 

WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/core/sdk:3.1-buster AS build
RUN apt-get update && \
    apt-get install -y gnupg  &&\
    curl -sL https://deb.nodesource.com/setup_13.x | bash - && \
    apt-get install -y nodejs &&\
    dotnet tool install -g dotnet-gcdump &&\
    dotnet tool install -g dotnet-dump &&\
    dotnet tool install -g dotnet-trace &&\
    dotnet tool install -g dotnet-counters
 


WORKDIR /src

COPY ["./**/*.csproj", "./Mozu.SiteBuilder.sln",   "./"]


RUN node -e "var fs=require('fs');fs.readdir(__dirname,function(err,files){files.filter((file)=>{return file.endsWith('.csproj')}).forEach((file)=>{var dir=file.substr(0,file.length-'.csproj'.length);var dest=dir+'/'+dir+'.csproj';if(!fs.existsSync(dir)){fs.mkdirSync(dir)}fs.rename(file,dest,console.log)})});"
RUN dotnet restore  --source https://api.nuget.org/v3/index.json --source http://ng-repo.dev.kibocommerce.com:8081/repository/nuget-localbuild/  
ARG BUILD_VER=0.0.0-alphagit 
ENV BUILD_VER=$BUILD_VER
COPY . .
RUN dotnet build /p:Version=${BUILD_VER}   -c Release && \
	dotnet publish /src/Mozu.SiteBuilder.UX/Mozu.SiteBuilder.UX.csproj -c Release -o /app --no-build --no-restore
RUN dotnet test /src/Mozu.SiteBuilder.UnitTests/Mozu.SiteBuilder.UnitTests.csproj -r /buildoutput/testoutput/UnitTests -l kibo-junit --no-build -c Release --collect:"XPlat Code Coverage" || true 	
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
COPY --from=build /root/.dotnet/tools/ /root/.dotnet/tools

ENTRYPOINT ["dotnet"]
CMD [ "Mozu.SiteBuilder.UX.dll"]

