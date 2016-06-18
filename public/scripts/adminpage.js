var appl = new Application();

function Application(){

	var self = this;
    self.venues = [];
    self.races = [];
    self.selectedEditRace = null;
    
    self.getRaces = function(){
        $.ajax({
            url: '/races?format=json',
            beforeSend: function(xhr){xhr.setRequestHeader('Auth', 'admin');},
            method: 'get',
            success: function successmethod(data) {
                self.races = data.races;
                self.fillRacesList();},
            failure: function failuremethod(data) {console.log(data)},
        });
    }
    
    self.getVenues = function(){
        $.ajax({
            url: '/venues?format=json',
            beforeSend: function(xhr){xhr.setRequestHeader('Auth', 'admin');},
            method: 'get',
            success: function successmethod(data) {self.venues = data.venues},
            failure: function failuremethod(data) {console.log(data)},
        });
    }
    
    self.addVenue = function(){
        var name = $('#newVenueName').val();
        var category = $('#newVenueCategory').val();
        if(name == ""){
            alert("name is empty");
        }else if(category == ""){
            alert("category is empty");
        } else {
            var venue = {
                name: name,
                category: category
            };
            
            $.ajax({
                url: '/venues?format=json',
                beforeSend: function(xhr){xhr.setRequestHeader('Auth', 'admin');},
                method: 'post',
                data: venue,
                success: function successmethod(data) {
                    $('#newRaceName').val("");
                    console.log(data)},
                failure: function failuremethod(data) {console.log(data)},
            });
        }
    }
    
    self.addRace = function(){
        var name = $('#newRaceName').val();
        if(name == ""){
            alert("name is empty");
        } else {
            var race = {
                name: name
            };
            
            $.ajax({
                url: '/races?format=json',
                beforeSend: function(xhr){xhr.setRequestHeader('Auth', 'admin');},
                method: 'post',
                data: race,
                success: function successmethod(data) {
                    $('#newRaceName').val("");
                    console.log(data)
                },
                failure: function failuremethod(data) {console.log(data)},
            });
        }
    }
    
    self.editRace = function(){
        var name = $('#editRaceName').val();
        var venue = $('#editRaceVenue').val();
        
        if(self.selectedEditRace == null){
            alert("no race selected");
        } else if(name == ""){
            alert("name is empty");
        } else {
            
            if(venue == ""){
                venue = null;
            }
            
            var newRace = {
                name: name,
                venue: venue
            }
            
            $.ajax({
                url: '/races/'+self.selectedEditRace+'?format=json',
                beforeSend: function(xhr){xhr.setRequestHeader('Auth', 'admin');},
                method: 'post',
                data: newRace,
                success: function successmethod(data) {
                    self.selectedEditRace = null;
                    $('#editRaceName').val("");
                    $('#editRaceVenue').val("");
                    self.races = data.races;
                    self.fillRacesList();
                },
                failure: function failuremethod(data) {console.log(data)},
            });
        }
    }
    
    self.onclickRacesButtons = function(){
        $('#editRaceList .list-group-item').on('click', function(e){
            var name = e.target.innerHTML;
            var venue = self.getRaceByName(name).venue;
            self.selectedEditRace = name;
            $('#editRaceName').val(name);
            $('#editRaceVenue').val(venue);
            //document.getElementById("editRace").value = this.innerHTML
        });
    }
    
    self.connectButtons = function(){
        //$('#editbutton').on('click', self.addVenue);
        $('#addRaceButton').on('click', function(e){
            e.preventDefault();
            self.addRace();
        });
        
        $('#addVenueButton').on('click', function(e){
           e.preventDefault();
           self.addVenue(); 
        });
        
        $('#editRaceButton').on('click', function(e){
            e.preventDefault();
            self.editRace();
        });
        
        self.onclickRacesButtons();
    }
    
    self.getRaceByName = function(name){
        for(race in self.races){
            if(self.races[race].name == name){
                return self.races[race];
            }
        }
        console.log("not found");
        return null;
    }
    
    self.fillVenuesList = function(){
        
    }
    
    self.fillRacesList = function(){
        $('#editRaceList').empty();
        for(race in self.races){
            $('#editRaceList').append('<a href="#" class="list-group-item">'+self.races[race].name+'</a>').on('click', function(e){
                var name = e.target.innerHTML;
                var venue = self.getRaceByName(name).venue;
                self.selectedEditRace = name;
                $('#editRaceName').val(name);
                $('#editRaceVenue').val(venue);
            });
        }
    }
    
    self.initApp = function(){
        self.getRaces();
        self.getVenues();
        self.connectButtons();
    }
    $(document).ready(self.initApp);
}