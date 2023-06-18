var timeDescription = function(x) {
  return x.format("MM/DD/YYYY h:mm:ss A");
};

var timeLeftDescription = function(t) {
  if(t<0) t=0;
  var tseconds = t / 1000;
  var seconds = Math.floor(tseconds) % 60;
  var tminutes = tseconds / 60;
  var minutes = Math.floor(tminutes) % 60;
  var thours = tminutes / 60;
  var hours = Math.floor(thours) % 24;
  var tdays = thours / 24;
  var days = Math.floor(tdays);
  return days + " days, " + hours + "h " + minutes + "m " + seconds + "s";
};


var conferences = [];
var areas = new Set();

var shouldDisplay = {
    "ML": true,
    "AI": true,
    "CompBio": true,
    "Healthcare": true,
    "Linguistics": false
};

// Display function, called every second or so
var refreshDisplay = function() {
  var cur_moment = moment();
  $("#currtime").text("Current time: " + timeDescription(cur_moment));

  // calculate and display deadlines
  for(var i=0; i<conferences.length; i++) {
    var conf = conferences[i];
    var checkBox = document.getElementById(conf.area);
    if (checkBox.checked === true) {
      var timeLeft= conf.deadline - cur_moment;
      warningString= "";
      if (conf.approx) { warningString= "based on previous year!"; }
      prefix = "";
      suffix = "";
      if ("website" in conf) {
        prefix = "<a class=\"sd\" href=\"" + conf.website + "\">";
        suffix = "</a>";
      }
      $("#deadline" + i).html(
        prefix + "<div class=\"tld\">" + timeLeftDescription(timeLeft) + "</div>"
               + "<div class=\"vd\">" + conf.venue + "</div>"
               + "<div class=\"ad\">" + conf.area + "</div>"
               + "<div class=\"td\">Deadline: " + timeDescription(conf.deadline) + "</div>"
               + "<div class=\"wd\">" + warningString + "</div>"
               + suffix
      );
      $("#deadline" + i).show();
    } else {
      $("#deadline" + i).hide();
    }
  }
}

var processCSVData = function(data) {
    ar = $.csv.toObjects(data);
    for (let i=0; i < ar.length; i++) {
        ar[i].deadline = moment(ar[i].deadline, "YYYY-MM-DD HH:mm:ss Z")
        ar[i].approx = parseInt(ar[i].approx);
    }
    return ar;
};

var parseDeadlines = function(conferences) {
    var cur_moment = moment();
    for (var i=0; i<conferences.length; i++) {
        var conf = conferences[i];
        if (conf.deadline - cur_moment <= 0) {
          conf.deadline.add(1, 'year');
          conf.approx = 1;
        }
    }
    conferences.sort(function(a, b) {
        return a.deadline - b.deadline;
    });
    return conferences;
};

var fetchConferences = function() {
    fetch('conferences.csv')
        .then(response => response.text())
        .then(text => {
            conferences = processCSVData(text);
            
            // create all area checkboxes.
            for (var i=0; i<conferences.length; i++) {
                var conf = conferences[i];
                var checkBox = document.getElementById(conf.area);
                if (checkBox !== null) {
                  // Checkbox for area has been created
                } else {
                  // Checkbox for area has not been created
                  $("<div>" + conf.area + ":<input type='checkbox' id='" + conf.area +"' name='" + conf.area + "' onclick= checked>&nbsp&nbsp&nbsp</div>").appendTo("div#checkboxesdiv");
                }
            }
            
            // set the state of the area checkboxes based on a cookie.
            $("input").each(function() {
              var mycookie = $.cookie($(this).attr('name'));
              if (mycookie !== null) {
                if (mycookie == 'true') {
                  $(this)[0].checked = true;
                } else {
                  $(this)[0].checked = false;
                }
              } else { // turn everything on the first visit.
                  $(this)[0].checked = true;
              }
            });
            $("input").change(function() {
              $.cookie($(this).attr("name"), $(this).prop('checked'), {
                  path: '/',
                  expires: 365
              });
            });
            
            conferences = parseDeadlines(conferences);
            
            // create divs for all deadlines and insert into DOM
            for(var i=0; i<conferences.length; i++) {
                $("<div class=dd id=deadline" + i + "></div>").appendTo("div#deadlinesdiv");
                var divid = "#deadline" + i;
                $(divid).hide();
                $(divid).fadeIn(100*(i+1), function() { }); // create a nice fade in effect
            }
            
            refreshDisplay();
            }
        );
};

$(document).ready(function() {
  fetchConferences();
  
  setTimeout(1000); // First redraw is called in fetchConferences.
  // set up deadline timer to redraw
  setInterval(
    function(){ refreshDisplay(); },
    1000
  );
});