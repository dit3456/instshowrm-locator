Locator.Showroom = (function (){

    let AllShowrooms = {
        type: "FeatureCollection",
        features: [],
    };

    let FilteredShowrooms = {
        type: "FeatureCollection",
        features: [],
    };
    //All showrooms of a specified category. If it's not specified with a filter, the value is standard allShowrooms.features
    let helpArrayCategory = [];
    //All showrooms of a specified product. If it's not specified with a filter, the value is standard allShowrooms.features
    let helpArrayProduct = [];
    //All showrooms within a specified radius. If it's not specified with a filter, the value is standard allShowrooms.features
    let helpArrayRadius = [];
    //Makes sure that the color filter only shows the colors that are in the selected category
    let HelpArrayProductFilter = [];

    //returns a list of showrooms filtered on the selected products
    const FilterOnProduct = function (value){
        helpArrayProduct = [];
        let helpArray = [];
        if(value != "Alle kleuren") {
            for (let i = 0; i < Locator.Showroom.AllShowrooms.features.length; i++) {
                if (Locator.Showroom.AllShowrooms.features[i].properties.product == value) {
                    helpArrayProduct.push(Locator.Showroom.AllShowrooms.features[i]);
                }
            }
        }
        else{
            for (i = 0; i < AllShowrooms.features.length; i++){
                helpArrayProduct.push(AllShowrooms.features[i]);
            }
        }

        //Makes sure the other filters will not be overwritten
        for (i = 0; i < helpArrayProduct.length; i++){
            if(helpArrayRadius.includes(helpArrayProduct[i]) && helpArrayCategory.includes(helpArrayProduct[i])){
                helpArray.push(helpArrayProduct[i]);
            }
        }
        //FIlls filteredShowrooms with new data
        FilteredShowrooms.features = [];
        for (i = 0; i < helpArray.length; i++){
            FilteredShowrooms.features.push(helpArray[i]);
        }
    }

    const FilterOnCategory = function (value){
        helpArrayCategory = [];
        this.HelpArrayProductFilter = [];
        let helpArray = [];
        if(value != "") {
            for (let i = 0; i < Locator.Showroom.AllShowrooms.features.length; i++) {
                if (Locator.Showroom.AllShowrooms.features[i].properties.category == value) {
                    helpArrayCategory.push(Locator.Showroom.AllShowrooms.features[i]);
                }
            }
        }
        else{
            for (i = 0; i < AllShowrooms.features.length; i++){
                helpArrayCategory.push(AllShowrooms.features[i]);
            }
        }
        //Makes sure the other filters will not be overwritten
        for (i = 0; i < helpArrayCategory.length; i++){
            if(helpArrayRadius.includes(helpArrayCategory[i]) && helpArrayProduct.includes(helpArrayCategory[i])){
                helpArray.push(helpArrayCategory[i]);
            }
        }
        //FIlls filteredShowrooms with new data
        FilteredShowrooms.features = [];
        for (i = 0; i < helpArray.length; i++){
            FilteredShowrooms.features.push(helpArray[i]);
            this.HelpArrayProductFilter.push(helpArray[i]);
        }
    }

    //returns a full list of showrooms
    const GetShowrooms = function () {
        FilteredShowrooms.features = [];
        AllShowrooms.features = [];
        return new Promise(function(resolve, reject){
            fetch('../CSV_Files/Showrooms_Database.csv')
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


    const ConvertArrayToJson = function (jsonData) {

        if (jsonData["ID"] !== "") {
            //turns the coordinates into a string
            let latString = jsonData["Latitude"].toString();
            //Places a dot so the coordinates are correct
            let lat = latString.substring(0, 2) + "." + latString.substring(2, latString.length);
            //Parses the string back to a float
            lat = parseFloat(lat);

            let lngString = jsonData["Longtitude"].toString();
            let lng = lngString.substring(0, 1) + "." + lngString.substring(1, lngString.length);
            lng = parseFloat(lng);

            let showroom = {
                geometry: {type: "point", coordinates: [lng, lat]},
                type: "Feature",
                properties: {
                    name: jsonData["Naam"],
                    address: jsonData["Adres"],
                    zipcode: jsonData["Postcode"],
                    email: jsonData["Email"],
                    website: jsonData["Website"],
                    phone: jsonData["Tel"],
                    storeid: jsonData["ID"],
                    category: jsonData["Type"],
                    product: jsonData["Kleur"]
                }
            };
            FilteredShowrooms.features.push(showroom);
            AllShowrooms.features.push(showroom);
            helpArrayCategory.push(showroom);
            helpArrayProduct.push(showroom);
            helpArrayRadius.push(showroom);
            HelpArrayProductFilter.push(showroom);
        }
    }

    const FilterOnRadius = function (inputCoords, radius){
        FilteredShowrooms.features = [];
        helpArrayRadius = [];
        //All showrooms that we want, gets pushed into helpArray
        let helpArray = [];

        //The coordinates of the location from the searchbar
        let origin = inputCoords;

        if(radius != "Afstand") {
            for (i = 0; i < AllShowrooms.features.length; i++) {
                //location of an installer
                let destination = {
                    lat: AllShowrooms.features[i].geometry.coordinates[1],
                    lng: AllShowrooms.features[i].geometry.coordinates[0]
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
                    helpArrayRadius.push(AllShowrooms.features[i]);
                }
            }

        }

        //If the user wants to discard the radius filter
        else {
            for(i = 0; i < AllShowrooms.features.length; i++){
                helpArrayRadius.push(AllShowrooms.features[i]);
            }
        }

        //Makes sure the other filters will not be overwritten
        for (i = 0; i < helpArrayRadius.length; i++) {
            if (helpArrayCategory.includes(helpArrayRadius[i]) && helpArrayProduct.includes(helpArrayRadius[i])) {
                helpArray.push(helpArrayRadius[i]);
            }
        }

        //Fills the filtered installers with new data
        FilteredShowrooms.features = [];
        for(i = 0; i < helpArray.length; i++){
            FilteredShowrooms.features.push(helpArray[i]);
        }

    }

    const rad = function(x) {
        return x * Math.PI / 180;
    };

    return{
        FilterOnProduct: FilterOnProduct,
        FilterOnCategory: FilterOnCategory,
        GetShowrooms: GetShowrooms,
        FilterOnRadius: FilterOnRadius,
        FilteredShowrooms: FilteredShowrooms,
        AllShowrooms: AllShowrooms,
        HelpArrayProduct: helpArrayProduct,
        HelpArrayCategory: helpArrayCategory,
        HelpArrayProductFilter: HelpArrayProductFilter
    }

})();