$(document).ready(function() {
  const fmtTime = function (time) {
    const pad2 = function(n) { return n < 10 ? ('0' + n) : ('' + n); };
    const date = new Date(time * 1000);
    return pad2(date.getHours()) + ":" + pad2(date.getMinutes()) + ':' + pad2(date.getSeconds());
  };
  
  const runners = [];
  const t = $('#tracking-table').DataTable( {
    order: [[4, "desc"], [5, 'asc'], [0, 'asc']],
    dom: '<f<t>p>',
    columnDefs: [
      {
        data: 'bib',
        targets: 0
      },
      {
        data: 'name',
        targets: 1
      },
      {
        data: 'club',
        targets: 2
      },
      {
        data: 'category',
        targets: 3
      },
      {
        data: 'checkpoint',
        targets: 4
      },
      {
        data: 'time',
	render: function (time, type, row) {
	  if (type == 'display') {
	    if (row.retired)
	      return 'RETIRED ' + row.checkpoint;
	    return time == 0 ? '' : fmtTime(time);
	  }
	  
	  return time;
	},
        targets: 5
      }
    ]
  });

  const searchRegex = {'Open': '', 'F': 'F', 'M40+': 'M[45678]0', 'F40+': 'F[45678]0', 'M50+': 'M[5678]0', 'F50+': 'F[5678]0', 'M60+': 'M[678]0', 'F60+': 'F[678]0' };
  $('#filter button').click(function (e) {
    t.columns(2).search(searchRegex[$(this).text()], true, false, false).draw();
  });
  
  const source = new EventSource("results/tracking.php");

  const update = function() {
    const data = [];
    $.each(runners, function(i, runner) {
      if (runner) data.push(runner);
    });
    t.clear();
    t.rows.add(data).draw();
  };
  
  source.addEventListener("REGISTER", function (event) {
    $.each(JSON.parse(event.data), function(i, row) {
      row.checkpoint = '';
      row.time = 0;
      runners[row.bib] = row;
    });
    update();
  });

  source.addEventListener("TIME", function (event) {
    const times = JSON.parse(event.data);
    $.each(times, function(i, time) {
      runners[time.bib].time = time.time;
      runners[time.bib].checkpoint = time.checkpoint;
    });
    update();
  });

  source.addEventListener("DELETE", function (event) {
    console.log("DELETE " + event.data);
  });
});
