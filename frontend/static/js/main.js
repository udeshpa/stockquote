var titleDictionary = {
    'ticker' : 'Ticker',
    'day200movingavg' : '200 day moving average',
    'day50movingavg' : '50 day moving average',
    'ttmdivrate' : 'ttm dividend rate',
    'ttmeps' : 'ttm earnings per share',
    'sharesoutstanding' : 'outstanding shares',
    'year5changepercent' : '5 year stock price change percent',
    'year2changepercent' : '2 year stock price change percent',
    'yearchangepercent' : '1 year stock price change percent',
    'ytdchangepercent' : 'YTD stock price change percent',
    'peratio' : 'p/e',
    'beta' : 'beta',
    'totalcash' : 'cash',
    'currentdebt' : 'current debt',
    'revenue' : 'revenue',
    'grossprofit' : 'gross profit',
    'totalrevenue' : 'total revenue',
    'ebitda' : 'ebitda',
    'revenuepershare' : 'revenue per share',
    'revenueperemployee' : 'revenue per employee',
    'debttoequity' : 'debt to equity',
    'profitmargin' : 'profit margin',
    'enterprisevalue' : 'enterprise value',
    'evtorevenue' : 'ev/revenue',
    'marketcap' : 'market capitalization',
    'pricetosales' : 'price/sales',
    'pricetobook' : 'price/book',
    'forwardpe' : 'forward p/e',
    'peg' : 'pegratio',
    'pelow' : 'p/e low',
    'dividendyield' : 'dividend yield',
    'nextearningdate' : 'next earning date',
    'avg10vol' : '10 day avg volume',
    'avg30vol' : '30 day avg volume',
    'gendate' : 'date of this data',
    'companyname' : 'company name',
    'previousclose' : 'previous close',
    'high52' : '52 week high',
    'low52' : '52 week low'
  }

  var tableDictionary = {};

  // populate the data table with JSON data
  function populateDataTable(obj, tableid) {
    console.log("populating data table... " + tableid);
    console.log("populating data table... " , obj.stocks[0]);

    if(!obj || !obj.stocks || (obj.stocks.constructor === Array && obj.stocks.length === 0)) {
      tableDictionary[tableid].clear().draw();
      return;
    }

    var adColumns = [];
    Object.keys(obj.stocks[0]).forEach(key => {
        var col = {
              data: key,
              title: titleDictionary[key] ? titleDictionary[key]  : key
        };

        adColumns.push(col);
    });

    if(!tableDictionary[tableid]){
          console.log('New table...');
          var table = $('#'+tableid).DataTable( {
          scrollY:        true,
          scrollX:        true,
          scrollCollapse: true,
          paging:         true,
          fixedColumns:   true,
          bInfo :         false,
          data: obj.stocks,
          columns: adColumns,
          columnDefs: [
              { width: 100, targets: 0 }
          ],
          colReorder: {
            order: [ 0, 36, 9, 3, 2, 5, 6, 7, 8, 4, 10, 11, 12 ,13 ,14 ,15 , 16,
              17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33,
            34, 35, 1, 37, 38, 39 ]
          },
          className: "dt-center", "targets": "_all",
          dom: 'Blfrtip',
          buttons: ['colvis' ]
        });
        tableDictionary[tableid] = table;
        table.columns.adjust();
    }
    else {
      console.log('Clearing...');
      tableDictionary[tableid].clear().draw();
      tableDictionary[tableid].rows.add(obj.stocks).draw();
    }
  }

  function setAllFilters(conjunction, group) {
    $(':text').filter(function() {
      console.log($(this).attr('name'));
      return $(this).attr('name').match(new RegExp(group + '$')); 
    }).each(function(){
      var fieldname = $(this).attr('name');
      var conjname = fieldname.substring(0, fieldname.length-1);
      var valueToSet = conjunction[conjname] ? conjunction[conjname] : '';
      var input = $(this); // This is the jquery object of the input, do what you will
      input.val(valueToSet);
    }); 
  }

  function clearAllFilters() {
    $(':text').filter(function() {
      console.log($(this).attr('name'));
      return $(this).attr('name').match(/[0-9]$/); 
    }).each(function() {
      var input = $(this);
      input.val('');
    });
  }

  function postfiltersort(postbody, action) {
      // Http Request

      if (window.XMLHttpRequest) {
        // code for modern browsers
        request = new XMLHttpRequest();
      } else {
        // code for old IE browsers
        request = new ActiveXObject("Microsoft.XMLHTTP");
      }

      request.open('POST', action, true);
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

      request.send(postbody);

      request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          const obj = JSON.parse(request.response);
          setupResult(obj);
        }
      };
  
      request.onload = function() {
      };
  }

  function filtersort(reqid) {
    console.log('requestid ', reqid);
    var postbody = ''; var first = true;

    $(':text').filter(function() {
      console.log($(this).attr('name'));
      return $(this).attr('name').match(/[0-9]$/);
    }).each(function(){
      console.log('matched' + $(this).attr('name'));
      var input = $(this); // This is the jquery object of the input, do what you will
      if(input.val()) {
        if(first) {
          first = false;
        } else {
          postbody += '&';
        }
        postbody += (input.attr('name') + '=' + input.val());
      }
    });

    if(first) {
      alert('Please choose a filter.');
      return;
    }
    postbody += ((first ? '' : '&') + 'requestid=' + reqid);
    console.log(postbody);
    postfiltersort(postbody, "/filtersort");
  }

  function deleteFilters(reqid) {
    console.log('requestid ', reqid);
    var postbody = '';

    postbody += 'requestid=' + reqid;
    console.log(postbody);
    postfiltersort(postbody, "/deletefilters");

  }



  function doDeleteRequest(reqid) {

        console.log('requestid ', reqid);

        // Http Request

        if (window.XMLHttpRequest) {
          // code for modern browsers
          request = new XMLHttpRequest();
        } else {
          // code for old IE browsers
          request = new ActiveXObject("Microsoft.XMLHTTP");
        }

        request.open('POST', "/deleteRequest", true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
        request.send('requestid=' + reqid);

        request.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            console.log(request.response);
            //console.log(request.response.byteLength);
            console.log($('#requests-nav li.active'));
            $('.nav-tabs li a.active').parent().remove();
            console.log($('.tab-pane.active'));
            $('.tab-pane.active').remove();
            $('#hometab').addClass('active');
            $('#homeli a').addClass('active');
            $('#homeli').tab('show');
          }
        };

        request.onload = function() {
        };
  }

  function addIndex(indexid, indexname) {
    var template = $.templates("#indexddtemplate");
    var htmlOutput = template.render({ "indexid" : indexid, "indexname" : indexname});
    $('#indexdd').append(htmlOutput);
  }

  function addFilter(panelno, filtername, filterdisplay) {
    var template = $.templates("#filtertemplate");
    var htmlOutput = template.render({ "panelno" : panelno, "filtername" : filtername, "filterdisplay": filterdisplay});
    $('#panel'+ panelno).append(htmlOutput);
  }

  function addTab(reqid) {        
    nextTab = nextTab + 1;
    console.log(nextTab);
    console.log(reqid);

//    if (nextTab < 6) {
      //console.log('This is tab' + nextTab);
      // create the tab
      $('<li class="nav-item"><a id="tablbl' + reqid + '" class="nav-link" data-url="' + reqid + '" href="#tab'+ reqid + '" data-toggle="tab" aria-controls="tab"' + reqid +'>' + reqid +'</a></li>').appendTo('#requests-nav');
  //  }
      var template = $.templates("#tabPaneTemplate");

      var htmlOutput = template.render({ "requestid" : reqid });
      console.log(htmlOutput);
      $('#requests-nav-content').append(htmlOutput);
      $('#delete-'+reqid).click(event, function() {
        console.log(event.srcElement.attributes['reqid'].value);
        var reqToDelete = event.srcElement.attributes['reqid'].value;
        doDeleteRequest(reqToDelete);
      });
      $('#filtersort-'+reqid).click(event, function() {
        console.log(event.srcElement.attributes['reqid'].value);
        var reqToFilter = event.srcElement.attributes['reqid'].value;
        filtersort(reqToFilter);
      });

      $('#removefilter-' + reqid).click(event, function() {
        console.log(event.srcElement.attributes['reqid'].value);
        var reqToFilterRemove = event.srcElement.attributes['reqid'].value;
        deleteFilters(reqToFilterRemove);
      });

  }

  function postTickersForm(formData, action) {
    // Http Request
    var request = new XMLHttpRequest();
    request.open('POST', action);
    request.send(formData);
    request.onload = function() {
        console.log(request.response);
        const obj = JSON.parse(request.response);
        addTab(obj.requestid);
        $('#requests-nav a:last').tab('show');
        tableDictionary['stockdetails' + obj.requestid] = $('#stockdetails-' + obj.requestid);
        //console.log(request.response.byteLength);
        populateDataTable(obj, 'stockdetails-' + obj.requestid);
    };
  }

  function submitIndex(indexid) {
    var formData = new FormData();
    formData.set('indexid', indexid);
    postTickersForm(formData, '/uploadtickers');
  }

  function doUpload(){
        // Form Data
        var formData = new FormData();

        $("form#filterform :input").each(function(){
          var input = $(this); // This is the jquery object of the input, do what you will
          if(input.val()) {
            formData.set(input.attr('name'), input.val());
          }
        });

        var fileSelect = document.getElementById("inputGroupFile02");
        if(fileSelect.files && fileSelect.files.length == 1){
          var file = fileSelect.files[0]
          formData.set("file", file , file.name);
        }

        postTickersForm(formData, '/uploadtickers');
  }

  function doSubmit() {
    // Form Data
    var formData = new FormData();

    $("form#filterform :input").each(function(){
      var input = $(this); // This is the jquery object of the input, do what you will
      if(input.val()) {
        formData.set(input.attr('name'), input.val());
      }
    });

    var tickers = $("#stockTickers").val();
    formData.set('tickers', tickers);
    alert(tickers);
    postTickersForm(formData, '/uploadtickers');
  }

  function setupResult(result) {

    console.log('Inside click processing 3', result);
    populateDataTable(result, 'stockdetails-' + result.requestid);

    if(result.filterclause) {
      $('#filtertext-' + result.requestid).text('Filters: ' + result.filterclause);
    } else {
      $('#filtertext-' + result.requestid).text('Filters: ' + '');
    }

    if(result.conjunctions && result.conjunctions.length > 0) {
      for (index = 0; index < result.conjunctions.length; index++) {
        setAllFilters(result.conjunctions[index], index+1);
      }
    } else {
      clearAllFilters();
    }

  }


  var nextTab = 1;

        (function($) {

            $("#up-btn").click(function() {
              doUpload();
            });

            $("#submit-btn").click(function() {
              doSubmit();
            });

            $('a[data-toggle="tab"]').on('shown.bs.tab', function(e){
                $($.fn.dataTable.tables(true)).DataTable()
                   .columns.adjust()
                   .fixedColumns().relayout();
            });

            $.getJSON('/getRequests',function(result){
              //const obj = JSON.parse(result);
              $.each(result, function(i, item) {
                addTab(item.requestid);
              });
            });

            $.getJSON('/getAllFilters',function(result){
              //const obj = JSON.parse(result);
              $.each(result, function(i, item) {
                addFilter(1, item.filtername, item.display);
                addFilter(2, item.filtername, item.display);
                addFilter(3, item.filtername, item.display);
              });
            });

            $.getJSON('/getIndexes',function(result){
              //const obj = JSON.parse(result);
              $.each(result, function(i, item) {
                addIndex(item.id, item.name);
              });
            });

            $.getJSON('/getLoginConfiguration',function(loginconfig){
              $('head').append('<meta name="google-signin-scope" content="profile email">');
              $('head').append('<meta name="google-signin-client_id" content="' + loginconfig.googlesigninclientid + '">');
            });


        })(jQuery);


        $('#inputGroupFile02').on('change',function(){
                //get the file name
                var fileName = $(this).val();
                //replace the "Choose a file" label
                $(this).next('.custom-file-label').html(fileName);
        });

        $('#tabs').on('click', '.tablink,#requests-nav a', function(e) {
          console.log('Inside click processing');
          e.preventDefault();
          var url = $(this).attr("data-url");
          if (typeof url !== "undefined") {
              console.log('Inside click processing 1' + url);
              var pane = $(this),
                  href = this.hash;
              console.log('Inside click processing 2', href);
              // ajax load from data-url
              $.getJSON('/filtersort?requestid=' + url, function(result) {
                setupResult(result);
                pane.tab('show');

              });
          } else {
              $(this).tab('show');
          }
        });
  

