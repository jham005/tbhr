// TODO: save local changes to local storage periodically (every change?), and restore on page reload
// TODO: CP1 is special; need mass start time
// TODO: Handle early start

$(document).ready(function() {
  let currentPosition = null;
  $('#info').hide();
  if (navigator.geolocation)
    navigator
    .geolocation
    .getCurrentPosition(
      function(position) { currentPosition = position.coords; },
      function(error) { });

  const p = 0.017453292519943295; // Math.PI / 180
  const c = Math.cos;
  const distance = function(lat1, lon1, lat2, lon2) {
    const a = 0.5 - c((lat2 - lat1) * p) / 2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p)) / 2;
    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  };
  
  let lastId = 0;
  const checkpoints = $('#checkpoints');
  let closestCheckpointDistance = null;
  let runnerNames = { };
  let token = '';
  $.post('results/login.php', 'json')
    .done(function(data) {
      token = data.token;
      $.each(data.checkpoints, function() {
	checkpoints.append(
	  $('<option>', {
	    text: this[1] + ' (' + this[0] + ')',
	    value: this[0]
	  }));
	if (currentPosition) {
	  const dist = distance(currentPosition, this[2], this[3]);
	  if (!closestCheckpointDistance || dist < closestCheckpointDistance) {
	    closestCheckpointDistance = dist;
	    checkpoints.val(this[0]);
	    $('#info').show().text('You are ' + dist + ' from this checkpoint');
	  }
	}
      });

      const pad2 = function(n) { return n < 10 ? ('0' + n) : ('' + n); };

      const t = $('#log').DataTable( {
        order: [[2, "desc"]],
        dom: '<f<t>p>',
        columnDefs: [
          {
            data: 'bib',
            render: function (bib, type, row, meta) {
	      if (type == 'display' && t.row(meta.row).node() == selectedRow)
		return '<input type="number" min="1" max="999" name="bib" value="' + (bib || '') + '" />';
              return bib || '';
            },
            targets: 0
          },
          {
            data: 'bib',
            render: function (bib, type) {
              return bib == 0 ? '' : (runnerNames[bib] || '(Not registered)');
            },
            targets: 1
          },
          {
            data: 'time',
            render: function (time, type, row, meta) {
	      if (type == 'filter')
		return '';
              if (type == 'display') {
		if (row.retired != '-')
		  return row.retired;
		const hms = pad2(time.getHours()) + ":" + pad2(time.getMinutes()) + ':' + pad2(time.getSeconds());
		if (t.row(meta.row).node() == selectedRow)
		  return '<input type="time" name="time" step="1" value="' + hms + '" />';
                return hms;
	      }
	      
              return time;
            },
            targets: 2
          },
          {
            data: 'time',
            render: function(time, type, row, meta) {
              if (type == 'display') {
		if (t.row(meta.row).node() == selectedRow)
                  return '<span><button class="btn btn-outline-secondary py-3 edit-save">&check;</button><button class="btn btn-outline-secondary py-3 edit-cancel">&cross;</btn><button class="btn btn-outline-secondary py-3 edit-delete">&#x1F5D1;</button><button class="btn btn-outline-secondary py-3 edit-retire">RETIRE</button></span>';
                return '<span class="edit-row">&#x2710;</span>';
	      }
	      
              return time;
            },
            targets: 3
          }
        ]
      });
      
      $('#log tbody').on('click', '.edit-delete', function () {
	if (selectedRow) {
	  const row = $(selectedRow);
	  if (row.hasClass('deleted'))
	    row.removeClass('deleted');
	  else
	    row.addClass('deleted');
	}
	
	selectRow(null);
      });
      
      $('#log tbody').on('click', '.edit-row', function () {
	selectRow(this.parentElement.parentElement);
      });
      
      $('#log tbody').on('click', '.edit-row', function () {
	selectRow(this.parentElement.parentElement);
      });
      
      $('#log tbody').on('click', '.edit-retire', function () {
	if (!selectedRow) return;
	const orig = $(selectedRow).data('orig');
	orig.retired = 'RETIRED ' + checkpoints.val();
	orig.editedAt = new Date();
	t.row(selectedRow).data(orig);
	selectRow(null);
      });
      
      $('#log tbody').on('click', '.edit-cancel', function () {
	if (!selectedRow) return;
	const orig = $(selectedRow).data('orig');
	orig.retired = '-';
	t.row(selectedRow).data(orig);
	selectRow(null);
      });
      
      let selectedRow = null;
      const selectRow = function(row) {
	const formerlySelected = selectedRow;
        selectedRow = row;

        if (formerlySelected) {
	  $(formerlySelected).removeClass('selected');
	  t.row(formerlySelected).invalidate();
	}

	if (selectedRow) {
	  $(selectedRow).addClass('selected').data('orig', Object.assign({}, t.row(selectedRow).data()));
	  t.row(selectedRow).invalidate();
	}

	if (formerlySelected || selectedRow)
	  t.draw();
      };

      const toTimestamp = function(date) { return parseInt((date.getTime() / 1000).toFixed(0)); }
      
      const lastEdited = { };
      const pendingUpdates = function() {
        const updates = [];
        t.rows().every(
          function() {
            const data = this.data();
	    const isDeleted = $(this.node()).hasClass('deleted');
            if (isDeleted && data.id)
              updates.push(['DELETE', data.id, toTimestamp(data.editedAt)]);
            else if (!isDeleted && data.edited) {
	      const editedAt = toTimestamp(data.editedAt || data.time);
	      if (data.id)
		updates.push(['DELETE', data.id, editedAt]);
	      updates.push(['TIME', data.bib, toTimestamp(data.time), editedAt, data.retired]);
	    }
          });
        return updates;
      };

      const updateServer = function() {
	selectRow(null);
	$('#loading').show();
        $.post(
          'results/update.php',
          {
            token: token,
	    lastId: lastId,
	    checkpoint: checkpoints.val(),
	    who: $('#name').val(),
            updates: JSON.stringify(pendingUpdates())
          },
          'json')
	  .always(function() { $('#loading').hide(); })
	  .fail(function() { alert('Update failed'); })
          .done(
            function(result) {
              token = result.token;
	      lastId = result.lastId;
              const rows = { };
              t.rows().every(
                function() {
                  const row = this.data();
                  if (row.id && row.bib > 0)
                    rows[row.id] = row;
                });
              $.each(result.updates, function(i, update) {
                switch (update[0]) {
                case 'REGISTER':
                  runnerNames[update[1]] = update[3] + ' ' + update[2];
                  break;
                case 'DELETE':
                  delete rows[update[1]];
                  break;
                case 'TIME':
		  rows[update[5]] = {
                    bib: update[1],
                    time: new Date(update[2] * 1000),
                    editedAt: new Date(update[3] * 1000),
		    retired: update[4],
		    id: update[5]
                  };
                  break;
                }
              });

	      const bibCount = { };
              const data = [];
              $.each(rows, function(i, row) {
                data.push(row);
		bibCount[row.bib]++;
              });
              t.clear();
              t.rows.add(data);
	      t.columns.adjust().draw();

	      const duplicates = [];
	      $.each(bibCount, function(i, n) { if (n > 1) duplicates.push(i); });
	      const dupText = duplicates.join(',');
	      const text = 'There are ' + Object.keys(runnerNames).length + ' runners, ' +
		    Object.keys(bibCount).length + ' passed this checkpoint.' +
		    (dupText != '' ? ('Duplicate bib numbers: ' + dupText) : '');
	      $('#info').show().text(text);
            });
      };

      $('#update').click(function() {
	if (!checkpoints.val()) {
	  alert('Please first enter your checkpoint');
	  checkpoints.focus();
	  return;
	}
	
	if ($('#name').val() == '') {
	  alert('Please first enter your name');
	  $('#name').focus();
	}
	
	updateServer();
      });
      updateServer();
      checkpoints.change(function() {
	lastId = 0;
	t.clear();
	updateServer();
      });

      $('#log tbody').on('change', 'input', function () {
	const tr = this.parentElement.parentElement;
	$(tr).addClass('edited');
        const row = t.row(tr).data();
        const d = new Date();
        row.editedAt = d;
	row.edited = true;
        if (this.type == 'time') {
          const time = this.value.match(/(\d\d):(\d\d):(\d\d)/);
          if (time) {
            d.setHours(parseInt(time[1], 10));
            d.setMinutes(parseInt(time[2], 10));
            d.setSeconds(parseInt(time[3], 10));
            row.time = d;
          }
        } else
          row.bib = +this.value.replace(/-?\D/g, '');
        
        t.row(this.parentElement.parentElement).data(row).invalidate().draw();
      });

      const bib = $('#bib');
      bib.data('bib', '');
      $('#keypad button').click(function() {
	selectRow(null);
        const v = $(this).text();
        if (v == 'Ok') {
          const row = t.row.add({ bib: +bib.data('bib'), time: new Date(), edited: true, retired: '-' }).draw();
	  $(row.node()).addClass('edited');
          bib.data('bib', '');
        } else if (v == '<')
          bib.data('bib', bib.data('bib').slice(0, -1));
        else
          bib.data('bib', bib.data('bib') + v);

        const n = +bib.data('bib');
        if (n)
          bib.val(n + ' (' + (runnerNames[n] || 'Not registered') + ')');
        else
          bib.val('');
      });
      
      $("#bib").bind("keydown", function(event) {
        const keycode = event.keyCode ? event.keyCode : (event.which ? event.which : event.charCode);
        if (keycode == 13) {
          $('#ok').click();
          return false;
        } else
          return true;
      });
    });
});
