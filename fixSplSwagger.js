var SwaggerParser = require('swagger-parser');
var fs = require("fs");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

SwaggerParser.bundle("https://smdb-dev.workspace.witcom.de/serviceplanet/remote/service/v1/docgen/swagger", function(err, api) {    
  if (err) {
    console.error(err);
  }
  else {
    console.log("API name: %s, Version: %s, Description %s", api.info.title, api.info.version,api.info.description);

    for (var defKey in api.definitions){
        var definition = api.definitions[defKey];
        var discriminator=null;
        if (definition.hasOwnProperty('discriminator')){
            discriminator=definition.discriminator;
        }
        if(discriminator!==null){
            if(definition.properties.hasOwnProperty(discriminator)){
                if (definition.properties[discriminator].hasOwnProperty('enum')){
                    console.log('Found discriminator attribute %s with ENUM in Model %s - remove ENUM',discriminator,defKey);
                    delete definition.properties[discriminator].enum;
                }
            }
        }
    }

    fs.writeFile("./swagger/smdb.json", JSON.stringify(api, null, 4), (err) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("File with fixed definitions has been created");
    });
    
    
  }
});
