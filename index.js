//server base domain url 
const domainUrl = 'http://127.0.0.1:3000';  // if local test, pls use this 


//==================================index.html==================================//


var debug = true;
var authenticated = false;


$(document).ready(function () {
	
/**
----------------------login js----------------------
**/
   
	$('#loginButton').click(function () {

		localStorage.removeItem("inputData")

		$("#loginForm").submit();

		if (localStorage.inputData != null) {

			var inputData = JSON.parse(localStorage.getItem("inputData"));

			$.post("http://localhost:3000/verifyUser", inputData,  function(data, status){
					if (debug) alert("Data received: " + JSON.stringify(data));
					if (debug) alert("\nStatus: " + status);
				
				if (data.length > 0) {
					alert("Login success");
					authenticated = true;
					localStorage.setItem("userInfo", JSON.stringify(data[0]));	
					$.mobile.changePage("#homePage");
				} 
				else {
					alert("Login failed");
				}

				$("#loginForm").trigger('reset');	
			})
		}
		
	})


	$("#loginForm").validate({ // JQuery validation plugin
		focusInvalid: false,  
		onkeyup: false,
		submitHandler: function (form) {   
			authenticated = false;
			
			var formData =$(form).serializeArray();
			var inputData = {};
			formData.forEach(function(data){
				inputData[data.name] = data.value;
			})

			localStorage.setItem("inputData", JSON.stringify(inputData));		

		},
		/* Validation rules */
		rules: {
			email: {
				required: true,
				email: true
			},
			password: {
				required: true,
				rangelength: [3, 10]
			}
		},
		/* Validation message */
		messages: {
			email: {
				required: "please enter your email",
				email: "The email format is incorrect  "
			},
			password: {
				required: "It cannot be empty",
				rangelength: $.validator.format("Minimum Password Length:{0}, Maximum Password Length:{1}。")

			}
		},
	});
	/**
	--------------------------end--------------------------
	**/	


/**
----------------------rego js----------------------
**/

    // Function to handle user registration
    $('#submitSignup').click(function () {
        // Extract user input from the registration form
        var email = $('input[name="newemail"]').val();
        var password = $('input[name="newpassword"]').val();
        var firstName = $('input[name="firstName"]').val();
        var lastName = $('input[name="lastName"]').val();
        var state = $('select[name="state"]').val();
        var phoneNumber = $('input[name="phoneNumber"]').val();
        var address = $('input[name="address"]').val();
        var postcode = $('input[name="postcode"]').val();

        // Create an object to hold the user data
        var userData = {
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName,
            state: state,
            phoneNumber: phoneNumber,
            address: address,
            postcode: postcode
        };

           // Send the user data to the server for registration
		   $.post('http://localhost:3000/registerUser', userData)
		   .done(function (response) {
			   // Handle success response from the server
			   var userDataString = JSON.stringify(response);
        		alert('User Data: ' + userDataString);
			   alert('User registration successful!');
			   // Optionally, redirect the user to another page
			   // window.location.href = 'registration_success.html';
		   })
		   .fail(function (xhr, status, error) {
			   // Handle error response from the server
			   console.error('Error registering user:', error);
			   alert('An error occurred while registering the user. Please try again later.');
		   });
   });

/**
	--------------------------end--------------------------
	**/	
/**
	--------------------------orders page event--------------------------
	**/	

	$(document).on("pagebeforeshow", "#orderListPage", function() {
		// Make an AJAX GET request to retrieve the user's previous orders
		var orderid=100;
		var userInfo = JSON.parse(localStorage.getItem("userInfo"));
    	var customerfName  = userInfo.firstName; //identifier
		alert("Previous placed orders for: " + customerfName);
		$.get('http://localhost:3000/getOrderData', { customerfName: customerfName }, function(data) {
    if (data.length > 0) {
        $('#pastOrdersList').empty(); // Clear previous orders list
        data.forEach(function(order) {
            console.log('Order:', order); // Log the entire order object
            var orderHTML = '<li>';
            orderHTML += '<p>Order Number: <span class=\"fcolor\"> ' + (orderid++) + '</span></p>';
            orderHTML += '<p>Customer: <span class=\"fcolor\">' + order.customerfName + ' ' + order.customerlName + '</p>';
            orderHTML += '<p>Item: <span class=\"fcolor\">' + order.itemName + '</p>';
            orderHTML += '<p>Price: <span class=\"fcolor\">' + order.itemPrice + '</p>';
            orderHTML += '<p>Recipient: <span class=\"fcolor\">' + order.firstName + '</p>';
            orderHTML += '<p>Phone Number: <span class=\"fcolor\">' + order.phoneNumber + '</p>';
            orderHTML += '<p>Address: <span class=\"fcolor\">' + order.address + '</p>';
            orderHTML += '<p>Date: <span class=\"fcolor\">' + order.date + '</p>';
            orderHTML += '</li>';
            $('#pastOrdersList').append(orderHTML);
        });
        $('#pastOrdersList').listview('refresh'); // Refresh listview
    } else {
        $('#pastOrdersList').html('<li>No previous orders found.</li>');
    }
}).fail(function() {
    console.error('Failed to retrieve previous orders.');
    $('#pastOrdersList').html('<li>Failed to retrieve previous orders.</li>');
});
	});

/**
	--------------------------end--------------------------
	**/	







	/**
	--------------------------delete orders--------------------------
	**/	
	$(document).on("pagebeforeshow", "#deleteorders", function () {
		var userInfo = JSON.parse(localStorage.getItem("userInfo"));
    	var customerfName  = userInfo.firstName; //identifier
		alert("Deleting orders of: " + customerfName);
		$.post("http://localhost:3000/deleteUserOrders", { customerfName: customerfName }, function(data) {
			if (data.deletedCount !== undefined) {
				$("#deleteuserorders").html(`<li>${data.deletedCount} orders deleted</li>`);// Display the number of orders deleted
			} else {
				$("#deleteuserorders").html(`<li>Error: An error occurred while deleting orders</li>`); // Display a message if deletion fails
			}
		});
	});	



	/**
	--------------------------end--------------------------
	**/	
	











	/**
	----------------------select gift category and save to localStorage js----------------------
	**/
	$('#itemList li').click(function () {
		
		var itemName = $('#itemName').text();
		var itemPrice = $('#itemPrice').text();
		var itemImage = $('#itemImage').attr('src');
		
		localStorage.setItem("itemName", itemName);
		localStorage.setItem("itemPrice", itemPrice);
		localStorage.setItem("itemImage", itemImage);

	}) 

	/**
	--------------------------end--------------------------
	**/	


	$('#confirmOrderButton').on('click', function () {
		
		localStorage.removeItem("orderInfo");

		$("#orderForm").submit();

		if (localStorage.orderInfo != null) {
		
			var orderInfo = JSON.parse(localStorage.getItem("orderInfo"));

			$.post("http://localhost:3000/postOrderData", orderInfo, function(data, status){
				if (debug) alert("Data sent: " + JSON.stringify(data));
				if (debug) alert("\nStatus: " + status);
			
				//clear form data 
				$("#orderForm").trigger('reset');
				
				$.mobile.changePage("#confirmPage");
	
			});		
		}

	})


	$("#orderForm").validate({  
		focusInvalid: false, 
		onkeyup: false,
		submitHandler: function (form) {   
			
			var formData =$(form).serializeArray();
			var orderInfo = {};

			formData.forEach(function(data){
				orderInfo[data.name] = data.value;
			});
			
			orderInfo.itemName = localStorage.getItem("itemName")
			orderInfo.itemPrice = localStorage.getItem("itemPrice")
			orderInfo.itemImage = localStorage.getItem("itemImage")
			
			var userInfo = JSON.parse(localStorage.getItem("userInfo"));
			
			if (debug) alert("Customer: " + JSON.stringify(userInfo));

			orderInfo.customerfName = userInfo.firstName;
			orderInfo.customerlName = userInfo.lastName;
			
			if (debug) alert(JSON.stringify(orderInfo));

			localStorage.setItem("orderInfo", JSON.stringify(orderInfo));
					
		},
		
		/* validation rules */
		
		rules: {
			firstName: {
				required: true,
				rangelength: [1, 15],
				validateName: true
			},
			lastName: {
				required: true,
				rangelength: [1, 15],
				validateName: true
			},
			phoneNumber: {
				required: true,
				mobiletxt: true
			},
			address: {
				required: true,
				rangelength: [1, 25]
			},
			postcode: {
				required: true,
				posttxt: true
			},/*
			oDate: {
				required: true,
				datetime: true
			},*/
		},
		/* Validation Message */

		messages: {
			firstName: {
				required: "Please enter your firstname",
				rangelength: $.validator.format("Contains a maximum of{1}characters"),

			},
			lastName: {
				required: "Please enter your lastname",
				rangelength: $.validator.format("Contains a maximum of{1}characters"),
			},
			phoneNumber: {
				required: "Phone number required",
			},
			address: {
				required: "Delivery address required",
				rangelength: $.validator.format("Contains a maximum of{1}characters"),
			},
			postcode: {
				required: "Postcode required",

			},/*
			date2: {
				required: "required",
			},*/
		}
	});

	/**
	--------------------------end--------------------------
	**/

	/**
	--------------------Event handler to perform initialisation before login page is displayed--------------------
	**/

	$(document).on("pagebeforeshow", "#loginPage", function() {
	
		localStorage.removeItem("userInfo");
		
		authenticated = false;
	
	});  
	
	/**
	--------------------------end--------------------------
	**/	


	/**
	--------------------Event handler to populate the fill order page before it is displayed---------------------
	**/

	
	$(document).on("pagecreate", "#fillOrderPage", function() {
		
		$("#itemSelected").text(localStorage.getItem("itemName"));
		$("#priceSelected").text(localStorage.getItem("itemPrice"));
		$("#imageSelected").attr('src', localStorage.getItem("itemImage"));
	
	});  
	
	/**
	--------------------------end--------------------------
	**/	

	/**
	--------------------Event handler to populate the confirm Page before it is displayed---------------------
	**/
	 
	$(document).on("pagebeforeshow", "#confirmPage", function() {
		
		$('#orderConfirmation').html("");

		if (localStorage.orderInfo != null) {
	
			var orderInfo = JSON.parse(localStorage.getItem("orderInfo"));
	
			$('#orderConfirmation').append('<br><table><tbody>');
			$('#orderConfirmation').append('<tr><td>Customer: </td><td><span class=\"fcolor\">' + orderInfo.customerfName + ' ' + orderInfo.customerlName + '</span></td></tr>');	
			$('#orderConfirmation').append('<tr><td>Item: </td><td><span class=\"fcolor\">' + orderInfo.itemName + '</span></td></tr>');	
			$('#orderConfirmation').append('<tr><td>Price: </td><td><span class=\"fcolor\">' + orderInfo.itemPrice + '</span></td></tr>');
			$('#orderConfirmation').append('<tr><td>Recipient: </td><td><span class=\"fcolor\">' + orderInfo.firstName + ' ' + orderInfo.lastName + '</span></td></tr>');
			$('#orderConfirmation').append('<tr><td>Address: </td><td><span class=\"fcolor\">' + orderInfo.address + ' ' + orderInfo.postcode + '</span></td></tr>');
			$('#orderConfirmation').append('<tr><td>Dispatch date: </td><td><span class=\"fcolor\">' + orderInfo.date + '</span></td></tr>');
			$('#orderConfirmation').append('</tbody></table><br>');
		}
		else {
			$('#orderConfirmation').append('<h4>There is no order to display<h4>');
		}
	});  

	/**
	--------------------------end--------------------------
	**/	

});



