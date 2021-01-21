function onSignIn(googleUser) {
    // Useful data for your client-side scripts:
    var profile = googleUser.getBasicProfile();
    console.log("ID: " + profile.getId()); // Don't send this directly to your server!
    console.log('Full Name: ' + profile.getName());
    console.log('Given Name: ' + profile.getGivenName());
    console.log('Family Name: ' + profile.getFamilyName());
    console.log("Image URL: " + profile.getImageUrl());
    console.log("Email: " + profile.getEmail());
    // The ID token you need to pass to your backend:
    var id_token = googleUser.getAuthResponse().id_token;
    console.log("ID Token: " + id_token);

    document.getElementById('idtoken').value = id_token;
    document.loginform.submit();


    //post('/login/', [{idtoken : id_token}] );

    /*var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:3000/tokensignin');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function() {
      console.log('Signed in as: ' + xhr.responseText);
    };
    xhr.send('idtoken=' + id_token);*/
}

// Called when Google Javascript API Javascript is loaded
function HandleGoogleApiLibrary($) {
  console.log('Inside HandleGoogleApiLibrary');

  $.getJSON('/getLoginConfiguration',function(loginconfig){
    console.log('Inside HandleGoogleApiLibrary 1', loginconfig);

    // Load "client" & "auth2" libraries
	  gapi.load('client:auth2',  {
      callback: function() {
        console.log('Inside HandleGoogleApiLibrary 2');

        // Initialize client & auth libraries
        gapi.client.init({
            clientId: loginconfig.googlesigninclientid,
            scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/plus.me'
        }).then(
          function(success) {
            console.log('Inside HandleGoogleApiLibrary Success');

              // Libraries are initialized successfully
              // You can now make API calls
          }, 
          function(error) {
            console.log('Inside HandleGoogleApiLibrary 3', error);

            // Error occurred
            // console.log(error) to find the reason
            }
        );
      },
      onerror: function() {
        // Failed to load libraries
      }
	  });
  });
}

function initializeLoginAction($) {
  // Call login API on a click event
  $("#google-login-button").on('click', function() {
      // API call for Google login
      gapi.auth2.getAuthInstance().signIn().then(
          function(success) {
      //var googleUser = JSON.parse(success);
      //console.log(googleUser);
      onSignIn(success);
          },
          function(error) {
              // Error occurred
              // console.log(error) to find the reason
          }
  );
  
  return false;
  });
}
