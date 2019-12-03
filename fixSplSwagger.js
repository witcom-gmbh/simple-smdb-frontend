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
      let modelDefinition = null;
      let superType=false;

      if (definition.hasOwnProperty('allOf')){
        modelDefinition = definition.allOf[1];
        superType=true;
/*
        if (defKey == "ProviderExternalServiceDto"){
          console.log(modelDefinition);
          console.log("break");
          console.log(definition);
        }
*/
      } else {
        modelDefinition = definition;
      }
      if (modelDefinition.hasOwnProperty('discriminator')){
        discriminator=modelDefinition.discriminator;
      }
      if(discriminator!==null){
            if(modelDefinition.properties.hasOwnProperty(discriminator)){
                if (modelDefinition.properties[discriminator].hasOwnProperty('enum')){
                    console.log('Found discriminator attribute %s with ENUM in Model %s - remove ENUM',discriminator,defKey);
                    if (superType){
                      delete definition.allOf[1].properties[discriminator].enum;
                    } else {
                      delete definition.properties[discriminator].enum;
                      definition.properties[discriminator].default=defKey;
                    }
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
