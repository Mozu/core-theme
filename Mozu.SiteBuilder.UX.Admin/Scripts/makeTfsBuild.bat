REM   attrib -r build/*.*
REM   robocopy \\aus02bptfs003.corp.volusion.com\d$\software\ext\ext-4.1.3\extjs-4.1.3 ext /e /xd docs examples resources locale welcome builds /xf ext-all*.js

REM   equivalent OSX command below (first mount tfs-build01.ads.volusion.com/software and then execute the below line)
REM   rsync -CPDrlptvzb --modify-window=1 --exclude docs --exclude examples --exclude resources --exclude locale --exclude welcome --exclude builds --exclude ext-all*.js /Volumes/software/ext/ext-4.1.3/extjs-4.1.3 ext

REM sencha compile -classpath=ext\src,app,ext\ux,js page  -yui -in index.html -out build/index.html

if exist .sencha\workspace (
    attrib -r build/*.* /S
	attrib -r bootstrap.js
	attrib -r bootstrap.json
	sencha app build -c
	sencha ant testing js
	cd ..\Tests
	admintests.bat
) else (
	attrib -r bootstrap.js
	attrib -r bootstrap.json
    cd ..
    if exist d:\software\ext\ext-4.2.2.1144 (
		sencha --sdk d:\software\ext\ext-4.2.2.1144 generate workspace Scripts
	)
	else (
		if not exist %~dp0..\..\lib\ext-4.2.2.1144 (
			echo "missing ExtJS, downloading from \\aus01cpfs102.corp.volusion.com\Departments_F\Product\Software\ExtJS\ext-4.2.2.1144"
			mkdir ..\..\lib
			xcopy \\aus01cpfs102.corp.volusion.com\Departments_F\Product\Software\ExtJS\ext-4.2.2.1144 ..\..\lib\ext-4.2.2.1144 /i /y /s
		)
		sencha --sdk %~dp0..\..\lib\ext-4.2.2.1144 generate workspace Scripts
	)
    cd Scripts
	attrib -r build/*.* /S
	attrib -r bootstrap.js
	attrib -r bootstrap.json

	sencha app build -c
	sencha ant testing js
	cd ..\Tests
	admintests.bat

)