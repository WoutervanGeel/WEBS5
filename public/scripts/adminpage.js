console.log("test1");
$('.testClass').append("test");
console.log("test2");
$.ajax({
url: '/races?format=json',
beforeSend: function(xhr){xhr.setRequestHeader('Auth', 'admin');},
method: 'get' ,
success: function successmethod(data) {console.log(data)},
failure: function failuremethod() {},
});