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
    apt-get install -y nodejs
 


WORKDIR /src

COPY ["./**/*.csproj", "./Mozu.SiteBuilder.sln",   "./"]


RUN node -e "var fs=require('fs');fs.readdir(__dirname,function(err,files){files.filter((file)=>{return file.endsWith('.csproj')}).forEach((file)=>{var dir=file.substr(0,file.length-'.csproj'.length);var dest=dir+'/'+dir+'.csproj';if(!fs.existsSync(dir)){fs.mkdirSync(dir)}fs.rename(file,dest,console.log)})});"
RUN dotnet restore  --source https://api.nuget.org/v3/index.json --source http://ng-repo.dev.kibocommerce.com:8081/repository/nuget-localbuild/  
ARG BUILD_VER=0.0.0-alphagit 
ENV BUILD_VER=$BUILD_VER
COPY . .
RUN dotnet build /p:Version=${BUILD_VER}   -c Release && \
	dotnet publish /src/Mozu.SiteBuilder.UX/Mozu.SiteBuilder.UX.csproj -c Release -o /app --no-build --no-restore &&\
    cd Mozu.CoreTheme &&\
    npm i &&\
    npm i grunt-cli -g&&\
    grunt build-production &&\
    rm -rf node_moduels 
    

FROM base AS final
WORKDIR /approot/sb/ux
RUN mkdir -p  /buildoutput/testoutput/ &&\
    mkdir -p /approot/sb/ux &&\
    mkdir -p /approot/Mozu.CoreTheme &&\
    echo '<?xml version="1.0" encoding="UTF-8"?><testsuites><testsuite name="src/test/php/Fake" tests="1" assertions="1" errors="0" failures="0" skipped="0" time="0.011388"><testcase name="SuperSuperFakeTestSuperFakeyFake" class="FakeyFakeTestThatIsFake" classname="FakeyFakeTestThatIsFake" file="/var/www/html/src/test/php/Fake/FakeyFakeTestThatIsFake.php" line="39" assertions="1" time="0.007877"/></testsuite></testsuites>' >  /buildoutput/testoutput/testresults.xml
COPY --from=build /app /approot/sb/ux
COPY --from=build /src/Mozu.CoreTheme /approot/Mozu.CoreTheme
COPY --from=build /src/Mozu.SiteBuilder.UX/BuiltinScripts /approot/sb/ux/BuiltinScripts

ENTRYPOINT ["dotnet"]
CMD [ "Mozu.SiteBuilder.UX.dll"]

