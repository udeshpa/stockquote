(function($) {
    $.ajaxSetup({
        cache: true
    });

    $.getJSON('/getLoginConfiguration',function(loginconfig){
      $('head').append('<meta name="google-signin-scope" content="profile email">');
      $('head').append('<meta name="google-signin-client_id" content="' + loginconfig.googlesigninclientid + '">');
      $.getScript('https://www.paypal.com/sdk/js?client-id=' + loginconfig.paypalclientid + '&vault=true',
        function() {
            $.getJSON('/getPaymentPlans',function(plans){
                $.each(plans, function(i, item) {
                    console.log('plans are ', item);
                    var template = $.templates("#plantemplate");
                    var htmlOutput = template.render({ "planname" : item.planname, "planid" : item.paypalplanid});
                    $('#paymentplans').append(htmlOutput);

                    paypal.Buttons({
                        createSubscription: function(data, actions) {
                            return actions.subscription.create({
                                'plan_id': item.paypalplanid
                            });
                        },
                        onApprove: function(data, actions) {
                            alert('You have successfully created subscription ' + data.subscriptionID);
                            document.getElementById('subscriptionid').value = data.subscriptionID;
                            document.subscriptionform.submit();
                        }
                    }).render('#' + item.paypalplanid);
                });
            });
        }
      )
    });

})(jQuery);
