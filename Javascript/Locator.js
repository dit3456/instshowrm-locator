const Locator = (function (){
    //Checks if the filters are open or closed
    let open = true;
    let ShowInstallers = false;
    let ShowShowrooms = true;

    //saves the filters when refreshing the map
    let selectedShowroomOrInstaller = "Showrooms";
    let selectedRadiusIndex = 0;
    let selectedCategory = "";
    let selectedProduct = "Alle kleuren";
    let selectedSpecialisation = "Alle specialisaties";
    let searchbarInput = "";

    //Filters the map on showrooms or installers
    const FilterInstallerOrShowroom_onclick = function (value){
        // //Saving the selected index for the map refresh
        this.selectedShowroomOrInstaller = value;

        if(value == "Installateurs"){
            ShowInstallers = true;
            ShowShowrooms = false;
            //refreshing the map
            initMap();
        }

        if(value == "Showrooms"){
            ShowInstallers = false;
            ShowShowrooms = true;
            //refreshing the map
            initMap();
        }
    }

    const FilterCategory_onclick = function (value){
        //Saving the selected index for the map refresh
        this.selectedCategory = value;

        Locator.Showroom.FilterOnCategory(value);
        //refreshing the map
        initMap();
    }

    const FilterProduct_onclick = function (value){
        //Saving the selected index for the map refresh
        this.selectedProduct = value;
        
         Locator.Showroom.FilterOnProduct(value);
         //refreshing the map
         initMap();
    }

    const FilterSpecialisation_onclick = function (value){
        //Saving the selected index for the map refresh
        this.selectedSpecialisation = value;

        Locator.Installer.FilterOnSpecialty(value);

        //refreshing the map
        initMap();
    }

    const FillMap = function (){
        ShowroomsAndInstallers.features = [];

        if (ShowShowrooms) {
            // Adds the showrooms to the map
             let showrooms = Locator.Showroom.FilteredShowrooms;
             for (i = 0; i < showrooms.features.length; i++){
                 ShowroomsAndInstallers.features.push(showrooms.features[i]);
             }
        }
        if (ShowInstallers) {
            //Adds the installers to the map
            let installers = Locator.Installer.FilteredInstallers;
            for (i = 0; i < installers.features.length; i++) {
                ShowroomsAndInstallers.features.push(installers.features[i]);
            }
        }
    }

    const FilterRadius_onchange = function (radius, inputCoords, index){
        //Saving the selected index for the map refresh
        this.selectedRadiusIndex = index;
        if (inputCoords.lat == 52.2093661 && inputCoords.lng == 4.1585262){
            return;
        }
        Locator.Installer.FilterOnRadius(inputCoords, radius);
        Locator.Showroom.FilterOnRadius(inputCoords, radius);
        //refreshing the map
        initMap();
    }

    //resets the category and product filter
    const CategoryReset_onclick = function (){
        if (this.selectedCategory !== "") {
            this.selectedCategory = "";
            this.selectedProduct = "Alle kleuren";
            Locator.Showroom.FilterOnCategory(this.selectedCategory);
            Locator.Showroom.FilterOnProduct(this.selectedProduct);
            initMap();
        }
    }

    //Slides the filters
    const SlideFilters = function (){
        if (!open){
            OpenNav();
            open = true;
        }
        else {
            CloseNav();
            open = false;
        }
    }
    const OpenNav = function (){
        document.getElementById("pac-card").style.animation = "unfold 0.5s";
        document.getElementById("pac-card").style.width = "25%";
        document.getElementById("main").style.animation = "slideRight 0.5s";
        document.getElementById("main").style.marginLeft = "25%";
        document.getElementById("main").className = "arrow left";

    }

    const CloseNav = function (){
        document.getElementById("pac-card").style.animation = "fold 0.5s";
        document.getElementById("pac-card").style.width = "0";
        document.getElementById("main").style.animation = "slideLeft 0.5s";
        document.getElementById("main").style.marginLeft= "0";
        document.getElementById("main").className = "arrow right";
    }


    return{
        FilterInstallerOrShowroom_onclick: FilterInstallerOrShowroom_onclick,
        FilterCategory_onclick: FilterCategory_onclick,
        FilterProduct_onclick: FilterProduct_onclick,
        FilterSpecialisation_onclick: FilterSpecialisation_onclick,
        FilterRadius_onchange: FilterRadius_onchange,
        FillMap: FillMap,
        CategoryReset_onclick: CategoryReset_onclick,
        SlideFilters: SlideFilters,
        selectedCategory: selectedCategory,
        selectedProduct: selectedProduct,
        selectedSpecialisation: selectedSpecialisation,
        selectedRadiusIndex: selectedRadiusIndex,
        searchbarInput: searchbarInput,
        showShowrooms: ShowShowrooms,
        showInstallers: ShowInstallers,
        selectedShowroomOrInstaller: selectedShowroomOrInstaller
    }
})();