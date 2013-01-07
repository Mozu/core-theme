/*

Siesta 1.1.4
Copyright(c) 2009-2012 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Role('Siesta.Role.StorableIdent', {
    
    does        : KiokuJS.Feature.Class.OwnID,
    
    
    methods : {
        
        acquireId : function() {
            return this.id
        }
    }
})
