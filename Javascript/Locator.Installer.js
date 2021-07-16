Locator.Installer = (function (){
    let AllInstallers = {
        type: "FeatureCollection",
        features: [],
    };

    let FilteredInstallers = {
        type: "FeatureCollection",
        features: [],
    };

    //All installers within a specified radius. If it's not specified with a filter, the value is standard AllInstallers.features
    let RadiusFilteredInstallers = [];

    //All installers of a specified specialisation. If it's not specified with a filter, the value is standard AllInstallers.features
    let SpecialisationFilteredInstallers = [];

    //returns a list of installers filtered on the selected specialties
    const FilterOnSpecialty = function (value){
        SpecialisationFilteredInstallers = [];
        FilteredInstallers.features = []
        let helpArray = [];
        if (value == "Onderhoud"){
            for (i = 0; i < AllInstallers.features.length; i++){
                if (AllInstallers.features[i].properties.maintenance == 1){
                    SpecialisationFilteredInstallers.push(AllInstallers.features[i]);
                }
            }
        }

        if (value == "Nieuw product"){
            for (i = 0; i < AllInstallers.features.length; i++){
                if (AllInstallers.features[i].properties.newProduct == 1){
                    SpecialisationFilteredInstallers.push(AllInstallers.features[i]);
                }
            }
        }

        if (value == "Storing"){
            for (i = 0; i < AllInstallers.features.length; i++){
                if (AllInstallers.features[i].properties.malfunction == 1){
                    SpecialisationFilteredInstallers.push(AllInstallers.features[i]);
                }
            }
        }

        if (value == "Alle specialisaties"){
            for(i = 0; i < AllInstallers.features.length; i++){
                SpecialisationFilteredInstallers.push(AllInstallers.features[i]);
            }
        }
        //Makes sure the other filters will not be overwritten
        for (i = 0; i < SpecialisationFilteredInstallers.length; i++){
            if(RadiusFilteredInstallers.includes(SpecialisationFilteredInstallers[i])){
                helpArray.push(SpecialisationFilteredInstallers[i]);
            }
        }

        //Fills the filtered installers with new data
        FilteredInstallers.features = [];
        for(i = 0; i < helpArray.length; i++){
            FilteredInstallers.features.push(helpArray[i]);
        }
    }

    //returns a full list of installers
    const GetInstallers = function (){
        FilteredInstallers.features = [];
        AllInstallers.features = [];

        return new Promise(function(resolve, reject){
            fetch('https://dit3456.github.io/instshowrm-locator/CSV_Files/Installers_Database.csv')
                .then(response => response.text())
                .then(data => {
                    parsedData = Papa.parse(data, {
                        header: true,
                        worker: true,
                        delimiter: "",
                        newline: "",
                        step: function(row) {
                            ConvertArrayToJson(row.data);
                        },
                        complete: function (){
                            resolve();
                        }
                    });
                });
        });
    }

    const FilterOnRadius = function (inputCoords, radius){
        FilteredInstallers.features = [];
        RadiusFilteredInstallers = [];
        let helpArray = [];

        //The coordinates of the location from the searchbar
        let origin = inputCoords;

        if(radius != "Afstand") {
            for (i = 0; i < AllInstallers.features.length; i++) {
                //location of an installer
                let destination = {
                    lat: AllInstallers.features[i].geometry.coordinates[1],
                    lng: AllInstallers.features[i].geometry.coordinates[0]
                };

                //calculates the distance between the user input and all installers(Haversine formula)
                let R = 6378137; // Earth’s mean radius in meter
                var dLat = rad(destination.lat - origin.lat);
                var dLong = rad(destination.lng - origin.lng);
                var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(rad(origin.lat)) * Math.cos(rad(destination.lat)) *
                    Math.sin(dLong / 2) * Math.sin(dLong / 2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                var d = R * c;// The distance in meter

                if (d <= (radius * 1000)) {
                    // FilteredInstallers.features.push(AllInstallers.features[i]);
                    RadiusFilteredInstallers.push(AllInstallers.features[i]);
                }
            }
        }

        //If the user wants to discard the radius filter
        else {
            for(i = 0; i < AllInstallers.features.length; i++){
                RadiusFilteredInstallers.push(AllInstallers.features[i]);
            }
        }

        //Makes sure the other filters will not be overwritten
        for (i = 0; i < RadiusFilteredInstallers.length; i++) {
            if (SpecialisationFilteredInstallers.includes(RadiusFilteredInstallers[i])) {
                helpArray.push(RadiusFilteredInstallers[i]);
            }
        }

        //Fills the filtered installers with new data
        FilteredInstallers.features = [];
        for(i = 0; i < helpArray.length; i++){
            FilteredInstallers.features.push(helpArray[i]);
        }

        return FilteredInstallers;
    }

    const rad = function(x) {
        return x * Math.PI / 180;
    };

    //Converts the data from the csv file into a json element
    const ConvertArrayToJson = function (jsonData) {
        if (jsonData["SAP ID"] !== "") {

            //turns the coordinates into a string
            let latString = jsonData["Latitude"].toString();
            //Places a dot so the coordinates are correct
            let lat = latString.substring(0, 2) + "." + latString.substring(2, latString.length);
            //Parses the string back to a float
            lat = parseFloat(lat);

            let lngString = jsonData["Longitude"].toString();
            let lng = lngString.substring(0, 1) + "." + lngString.substring(1, lngString.length);
            lng = parseFloat(lng);

            //turns a string into a stringarray by '/'
            let str = jsonData["Address"];
            let res = str.split(" / ");

            //get mail addresses
            let email;
            if (jsonData["E-Mail"] == "#") {
                email = "Geen mailadres beschikbaar";
            }
            else {
                email = jsonData["E-Mail"];
            }

            let installer = {
                geometry: {type: "point", coordinates: [lng, lat]},
                type: "Feature",
                properties: {
                    name: jsonData["Name"],
                    address: res[0],
                    zipcode: res[1],
                    email: email,
                    website: jsonData["Web Site"],
                    phone: jsonData["Phone"],
                    storeid: jsonData["SAP ID"],
                    maintenance: jsonData["ZNL_5000"],
                    newProduct: jsonData["ZNL_5410"],
                    malfunction: jsonData["ZNL_5413"],
                }
            };
            FilteredInstallers.features.push(installer);
            AllInstallers.features.push(installer);
            RadiusFilteredInstallers.push(installer);
            SpecialisationFilteredInstallers.push(installer);
        }
    }

    return{
        FilterOnSpecialty: FilterOnSpecialty,
        FilterOnRadius: FilterOnRadius,
        GetInstallers: GetInstallers,
        FilteredInstallers: FilteredInstallers,
        AllInstallers: AllInstallers,
        RadiusFilteredInstallers: RadiusFilteredInstallers,
        SpecialisationFilteredInstallers: SpecialisationFilteredInstallers
    }


})();
