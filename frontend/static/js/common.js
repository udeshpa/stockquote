function signOut() {
    console.log("Insie signout");
    gapi.load("auth2", () => {
        gapi.auth2.init().then(() => {
                var auth2 = gapi.auth2.getAuthInstance();
                auth2.signOut().then(function () {
                    console.log('User signed out.');
                    post('/logout', {});
                });
        });
    });

}

function post(path, params, method='post') {

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    const form = document.createElement('form');
    form.method = method;
    form.action = path;
  
    for (const key in params) {
      console.log('key is' + key);
      if (params.hasOwnProperty(key)) {
        console.log('key is' + key);

        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.name = key;
        hiddenField.value = params[key];
  
        form.appendChild(hiddenField);
      }
    }
  
    document.body.appendChild(form);
    form.submit();
  }
