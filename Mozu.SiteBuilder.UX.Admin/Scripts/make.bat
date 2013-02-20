attrib -r build/*.*
robocopy \\tfs-build01.ads.volusion.com\software\ext\ext-4.1.3\extjs-4.1.3 ext /e /xd docs examples resources locale welcome builds /xf ext-all*.js

// equivalent OSX command below (first mount tfs-build01.ads.volusion.com/software and then execute the below line)
//rsync -CPDrlptvzb --modify-window=1 --exclude docs --exclude examples --exclude resources --exclude locale --exclude welcome --exclude builds --exclude ext-all*.js /Volumes/software/ext/ext-4.1.3/extjs-4.1.3 ext

sencha compile -classpath=ext\src,app,ext\ux,js page  -yui -in index.html -out build/index.html