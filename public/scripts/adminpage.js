var appl = new Application();

function Application(){

	var self = this;
    
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
                success: function successmethod(data) {console.log(data)},
                failure: function failuremethod(data) {console.log(data)},
            });
        }
    }
    
    self.connectButtons = function(){
        //$('#editbutton').on('click', self.addVenue);
        $('#editRaceButton').on('click', function(e){
            e.preventDefault();
            //var id = e.target.parentElement.id;
            // if(id != "load"){
            //     self.selectedPokemon = self.getNewPokemon(id);
            //     $.mobile.changePage('#detail-page');
            // }
            alert("editing race");
        });
        
        $('#addVenueButton').on('click', function(e){
           e.preventDefault();
           self.addVenue(); 
        });
    }
    $(document).ready(self.connectButtons);
}