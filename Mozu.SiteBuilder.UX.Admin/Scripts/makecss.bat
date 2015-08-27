REM   attrib -r build/*.*
REM   robocopy \\aus02bptfs003.corp.volusion.com\d$\software\ext\ext-4.1.3\extjs-4.1.3 ext /e /xd docs examples resources locale welcome builds /xf ext-all*.js

REM   equivalent OSX command below (first mount tfs-build01.ads.volusion.com/software and then execute the below line)
REM   rsync -CPDrlptvzb --modify-window=1 --exclude docs --exclude examples --exclude resources --exclude locale --exclude welcome --exclude builds --exclude ext-all*.js /Volumes/software/ext/ext-4.1.3/extjs-4.1.3 ext

REM sencha compile -classpath=ext\src,app,ext\ux,js page  -yui -in index.html -out build/index.html

if exist .sencha\workspace (
    attrib -r build/*.* /S
	sencha ant sass
) else (
    cd ..
	sencha --sdk ext-4.2.1.883 generate workspace Scripts
    cd Scripts
    attrib -r build/*.* /S
	sencha ant sass
)