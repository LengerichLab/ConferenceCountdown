// Database of conferences and deadlines.
var conferences_csv = `venue,area,deadline,website,approx
ML4H,Healthcare,2022-09-01 23:59:00 +0000,https://ml4health.github.io/2022/index.html,1
MLHC,Healthcare,2023-04-12 17:59:00 -0500,https://www.mlforhc.org,0
CHIL,Healthcare,2023-02-03 23:59:00,https://www.chilconference.org,1
PSB,CompBio,2023-08-01 23:59:00 +0000, http://psb.stanford.edu,0
ISMB,CompBio,2023-01-19 23:59:00 +0000,https://www.iscb.org/ismbeccb2023-submissions/proceedings,1
RECOMB,CompBio,2022-10-07 17:00:00 -0400,http://recomb2023.bilkent.edu.tr/keydates_and_deadlines.html,1
KDD,AI,2023-02-23 23:59:00 -0800,https://www.kdd.org/kdd2023,1
AAAI,AI,2022-08-08 23:59:00 -1000,https://aaai.org/Conferences/AAAI-23/,1
IJCAI,AI,2023-01-16 23:59:00 -1200,https://www.ijcai-23.org,1
ICLR,ML,2022-09-21 8:00:00 -0700,http://www.iclr.cc,1
AISTATS,ML,2022-10-06 23:59:00 +0000, http://www.aistats.org,1
NeurIPS,ML,2023-05-11 13:00:00,http://nips.cc,0
UAI,ML,2023-02-17 23:59:00 +0100,http://auai.org/uai2023,1
MLSys,ML,2022-10-28 23:59:00 +0000,https://mlsys.org,1
ICML,ML,2023-01-26 23:59:00 +0000,http://icml.cc,1
`
var processCSVData = function(data) {
        ar = $.csv.toObjects(data);
        for (let i=0; i < ar.length; i++) {
            ar[i].deadline = moment(ar[i].deadline, "YYYY-MM-DD HH:mm:ss Z")
            ar[i].approx = parseInt(ar[i].approx);
        }
        return ar;
};
var conferences = processCSVData(conferences_csv);
console.log(conferences);

var shouldDisplay = {
    "ML": true,
    "AI": true,
    "CompBio": true,
    "Healthcare": true,
    "Linguistics": false
};

// HELPER FUNCTIONS
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

// Display function, called every second or so
function refreshDisplay() {
  var d = moment();
  $("#currtime").text("Current time: " + timeDescription(d));

  // calculate and display deadlines
  for(var i=0; i<conferences.length; i++) {
    var conf = conferences[i];
    var checkBox = document.getElementById(conf.area);
    if (checkBox.checked === true) {
      var timeLeft= conf.deadline - d;
      console.log(conf, timeLeft);
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

$(document).ready(function() {
  $("input").each(function() {
      var mycookie = $.cookie($(this).attr('name'));
      if (mycookie !== null) {
        if (mycookie == 'true') {
          $(this)[0].checked = true;
        } else {
          $(this)[0].checked = false;
        }
      }
  });
  $("input").change(function() {
      $.cookie($(this).attr("name"), $(this).prop('checked'), {
          path: '/',
          expires: 365
      });
  });

  for (var i=0; i<conferences.length; i++) {
    var d = moment();
    var conf = conferences[i];
    if (conf.deadline - d <= 0) {
      conf.deadline.add(1, 'year');
      conf.approx = 1;
    }
  }
  conferences.sort(function(a, b) {
    return a.deadline - b.deadline;
  });
  // create divs for all deadlines and insert into DOM
  for(var i=0; i<conferences.length; i++) {
    $("<div class=dd id=deadline" + i + "></div>").appendTo("div#deadlinesdiv");
    var divid = "#deadline" + i;

    $(divid).hide();
    $(divid).fadeIn(100*(i+1), function() { }); // create a nice fade in effect
  }

  // set up deadline timer to redraw
  setInterval(
    function(){ refreshDisplay(); },
    1000
  );
  refreshDisplay();
});