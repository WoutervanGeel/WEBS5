var appl = new Application();

function Application(){

	var self = this;
    self.venues = [];
    self.races = [];
    self.selectedEditRace = null;
    self.selectedEditVenue = null;
    self.selectedEditRaceParticipants = [];
    self.page = 0;
    self.venueFilter = '';

    self.userdata = {
        headerkey: "Authorization",
        userId: "57668fa0758a5e643374e399",
        admin: "Basic YWRtaW5AYWNjb3VudC5ubDphZG1pbg==",
        user: "Basic dXNlckBhY2NvdW50Lm5sOnVzZXI="
    }
    self.datatype = {
        headerkey: "Content-Type",
        value: "application/json"
    }
    
    self.getRaces = function(){
        $.ajax({
            url: '/races',
            beforeSend: function(xhr){
                xhr.setRequestHeader(self.userdata.headerkey, self.userdata.admin);
                xhr.setRequestHeader(self.datatype.headerkey, self.datatype.value);
            },
            method: 'get',
            success: function successmethod(data) {
                self.races = data.races;
                self.fillRaceList();},
            failure: function failuremethod(data) {console.log(data)},
        });
    }
    
    self.getVenues = function(){
        if(self.venueFilter.length === 0){
            console.log("empty");
        } else {
            console.log("not empty");
            self.page = 0;
        }
        $.ajax({
            url: '/venues?page='+self.page+'&limit=10&name='+self.venueFilter,
            beforeSend: function(xhr){
                xhr.setRequestHeader(self.userdata.headerkey, self.userdata.admin);
                xhr.setRequestHeader(self.datatype.headerkey, self.datatype.value);
            },
            method: 'get',
            success: function successmethod(data) {
                self.venues = data.results;
                self.fillVenueList();},
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
                url: '/venues',
                beforeSend: function(xhr){
                    xhr.setRequestHeader(self.userdata.headerkey, self.userdata.admin);
                },
                method: 'post',
                data: venue,
                success: function successmethod(data) {$('#newRaceName').val("");},
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
                url: '/races',
                beforeSend: function(xhr){
                    xhr.setRequestHeader(self.userdata.headerkey, self.userdata.admin);
                },
                method: 'post',
                data: race,
                success: function successmethod(data) {
                    $('#newRaceName').val("");
                    self.getRaces();
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
                url: '/races/'+self.selectedEditRace,
                beforeSend: function(xhr){
                    xhr.setRequestHeader(self.userdata.headerkey, self.userdata.admin);
                },
                method: 'put',
                data: newRace,
                success: function successmethod(data) {
                    self.selectedEditRace = null;
                    $('#editRaceName').val("");
                    $('#editRaceVenue').val("");
                    self.getRaces();
                },
                failure: function failuremethod(data) {console.log(data)},
            });
        }
    }
    
    self.deleteRace = function(){
        if(self.selectedEditRace == null){
            alert("no race selected");
        } else {
            $.ajax({
                url: '/races/'+self.selectedEditRace,
                beforeSend: function(xhr){
                    xhr.setRequestHeader(self.userdata.headerkey, self.userdata.admin);
                },
                method: 'delete',
                success: function successmethod(data) {
                    self.selectedEditRace = null;
                    $('#editRaceName').val("");
                    $('#editRaceCategory').val("");
                    self.getRaces();
                },
                failure: function failuremethod(data) {console.log(data)},
            });
        }
    }
    
    self.editVenue = function(){
        var name = $('#editVenueName').val();
        var category = $('#editVenueCategory').val();
        
        if(self.selectedEditVenue == null){
            alert("no race selected");
        } else if(name == ""){
            alert("name is empty");
        } else if(category == ""){
            alert("category is empty");
        } else {
            
            var newVenue = {
                name: name,
                category: category
            }
            
            $.ajax({
                url: '/venues/'+self.selectedEditVenue,
                beforeSend: function(xhr){
                    xhr.setRequestHeader(self.userdata.headerkey, self.userdata.admin);
                },
                method: 'put',
                data: newVenue,
                success: function successmethod(data) {
                    self.selectedEditVenue = null;
                    $('#editVenueName').val("");
                    $('#editVenueCategory').val("");
                    self.getVenues();
                },
                failure: function failuremethod(data) {console.log(data)},
            });
        }
    }
    
    self.deleteVenue = function(){
        if(self.selectedEditVenue == null){
            alert("no venue selected");
        } else {
            $.ajax({
                url: '/venues/'+self.selectedEditVenue,
                beforeSend: function(xhr){
                    xhr.setRequestHeader(self.userdata.headerkey, self.userdata.admin);
                },
                method: 'delete',
                success: function successmethod(data) {
                    self.selectedEditVenue = null;
                    $('#editVenueName').val("");
                    $('#editVenueCategory').val("");
                    self.getVenues();
                },
                failure: function failuremethod(data) {console.log(data)},
            });
        }
    }
    
    self.joinRace = function(){
        if(self.selectedEditRace == null){
            alert("no race selected");
        } else {
            
            var sendData = {
                userId: self.userdata.userId
            }
            
            $.ajax({
                url: '/races/'+self.selectedEditRace+'/participants',
                beforeSend: function(xhr){
                    xhr.setRequestHeader(self.userdata.headerkey, self.userdata.admin);
                },
                method: 'post',
                data: sendData,
                success: function successmethod(data) {
                    self.getParticipants();
                },
                failure: function failuremethod(data) {
                    console.log(data);
                },
            });
        }
    }
    
    self.leaveRace = function(){
        if(self.selectedEditRace == null){
            alert("no race selected");
        } else {  
            $.ajax({
                url: '/races/'+self.selectedEditRace+'/participants/'+self.userdata.userId,
                beforeSend: function(xhr){
                    xhr.setRequestHeader(self.userdata.headerkey, self.userdata.admin);
                },
                method: 'delete',
                success: function successmethod(data) {
                    self.getParticipants();
                },
                failure: function failuremethod(data) {
                    console.log(data);
                },
            });
        }
    }
    
    self.getParticipants = function(){
        $.ajax({
            url: '/races/'+self.selectedEditRace,
            beforeSend: function(xhr){
                xhr.setRequestHeader(self.userdata.headerkey, self.userdata.admin);
                xhr.setRequestHeader(self.datatype.headerkey, self.datatype.value);
            },
            method: 'get',
            success: function successmethod(data) {
                self.selectedEditRaceParticipants = data.participants;
                self.fillRaceParticipantList();},
            failure: function failuremethod(data) {console.log(data)},
        });
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
    
    self.getVenueByName = function(name){
        for(venue in self.venues){
            if(self.venues[venue].name == name){
                return self.venues[venue];
            }
        }
        console.log("not found");
        return null;
    }
    
    self.onclickRacesButtons = function(){
        $('#editRaceList .list-group-item').on('click', function(e){
            var name = e.target.innerHTML;
            var venue = self.getRaceByName(name).venue;
            self.selectedEditRace = name;
            $('#editRaceName').val(name);
            $('#editRaceVenue').val(venue);
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
        
        $('#editVenueButton').on('click', function(e){
            e.preventDefault();
            self.editVenue();
        });
        
        $('#deleteRaceButton').on('click', function(e){
            e.preventDefault();
            self.deleteRace();
        });
        
        $('#deleteVenueButton').on('click', function(e){
            e.preventDefault();
            self.deleteVenue();
        });
        
        $('#joinRaceButton').on('click', function(e){
           e.preventDefault();
           self.joinRace(); 
        });
        
        $('#leaveRaceButton').on('click', function(e){
           e.preventDefault();
           self.leaveRace(); 
        });
        
        $('#leftEditVenueVenueButton').on('click', function(e){
           e.preventDefault();
           if(self.page > 0){
               self.page = self.page -1;
           }
           self.getVenues();
        });
        
        $('#rightEditVenueVenueButton').on('click', function(e){
           e.preventDefault();
           self.page = self.page + 1;
           self.getVenues();
        });
        
        $('#searchVenueButton').on('click', function(e){
           e.preventDefault();
           self.venueFilter = $('#venueFilter').val(); 
           self.getVenues();
        });

        self.onclickRacesButtons();
    }
    
    self.fillRaceList = function(){
        $('#editRaceList').empty();
        for(race in self.races){
            $('#editRaceList').append('<a href="#" class="list-group-item">'+self.races[race].name+'</a>').on('click', function(e){
                e.preventDefault();
                var name = e.target.innerHTML;
                var venue = self.getRaceByName(name).venue;
                self.selectedEditRace = name;
                self.getParticipants();
                $('#editRaceName').val(name);
                $('#editRaceVenue').val(venue);
            });
        }
    }
    
    self.fillRaceParticipantList = function(){
        $('#raceParticipantList').empty();
        for(participant in self.selectedEditRaceParticipants){
            $('#raceParticipantList').append('<a href="#" class="list-group-item">'+self.selectedEditRaceParticipants[participant]+'</a>');
        }
    }
    
    self.fillVenueList = function(){
        $('#editVenueList').empty();
        for(venue in self.venues){
            console.log(self.venues[venue]);
            if(self.venues[venue].local == null || self.venues[venue].local == undefined || self.venues[venue].local == false){
                $('#editVenueList').append('<a href="#" class="list-group-item">X - '+self.venues[venue].name+'</a>').on('click', function(e){
                    e.preventDefault();
                    var name = e.target.innerHTML;
                    alert("You can only change our venues");
                    self.selectedEditVenue = null;
                    $('#editVenueName').val("");
                    $('#editVenueCategory').val("");
                });
            } else {
                $('#editVenueList').append('<a href="#" class="list-group-item">'+self.venues[venue].name+'</a>').on('click', function(e){
                    e.preventDefault();
                    var name = e.target.innerHTML;
                    var category = self.getVenueByName(name).category;
                    self.selectedEditVenue = self.venues[venue].id;
                    $('#editVenueName').val(name);
                    $('#editVenueCategory').val(category);
                });
            }
        }
    }
    
    self.initApp = function(){
        self.getRaces();
        self.getVenues();
        self.connectButtons();
    }
    
    $(document).ready(self.initApp);
}