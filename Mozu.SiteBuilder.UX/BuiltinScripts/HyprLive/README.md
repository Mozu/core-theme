# Notes on HyprLive

This should ultimately become either a fork or a rework of SwigJS, the library we used as a starting point. Currently we have a very suboptimal thing going on where we just modify the browserified build of Swig instead of modifying the source. This originally happened because we can't build Swig: Swig has a *NIX-bound build process with a Makefile, instead of something cross-platform like Grunt that we could build on Windows.

Eventually we will make our own build process, get rid of the browserify jive (browserify is cool but doesn't fit in with our module system) and have our own heavily modified fork of Swig. Ideally we will maintain the tag and filter interface, so we can still poach new innovations from Swig as they appear.