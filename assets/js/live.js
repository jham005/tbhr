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
  $.post('results/login.php', 'text')
    .done(function(data) {
      token = data;
      const pad2 = function(n) { return n < 10 ? ('0' + n) : ('' + n); };

      const t = $('#log').DataTable( {
        order: [[2, "desc"]],
        dom: '<f<t>p>',
        columnDefs: [
          {
            data: 'bib',
            render: function (bib, type, row, meta) {
	      if (type == 'display' && t.row(meta.row).node() == selectedRow)
		return '<input type="number" name="bib" value="' + (bib || '') + '" />';
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
                  return '<span><button class="btn btn-outline-secondary py-3 edit-save">&check;</button><button class="btn btn-outline-secondary py-3 edit-cancel">&cross;</btn><button class="btn btn-outline-secondary py-3 edit-delete">&#x1F5D1;</button></span>';
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
      
      $('#log tbody').on('click', '.edit-save', function () {
	selectRow(null);
      });
      
      $('#log tbody').on('click', '.edit-cancel', function () {
	if (!selectedRow) return;
	t.row(selectedRow).data($(selectedRow).data('orig'));
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

      // TODO: Button to display remaining runners?
      // TODO: save local changes to local storage periodically (every change?), and restore on page reload

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
              updates.push(['TIME', data.bib, toTimestamp(data.time), editedAt]);
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
		case 'CHECKPOINT':
		  if (checkpoints.find("[value='" + update[1] + "']").length == 0)
		    checkpoints.append(
		      $('<option>', {
			text: update[2] + ' (' + update[1] + ')',
			value: update[1]
		      }));
		  if (currentPosition) {
		    const dist = distance(currentPosition, update[3], update[4]);
		    if (!closestCheckpointDistance || dist < closestCheckpointDistance) {
		      closestCheckpointDistance = dist;
		      checkpoints.val(update[1]);
		      $('#info').show().text('You are ' + dist + ' from this checkpoint');
		    }
		  }
		  
		  break;
                case 'REGISTER':
                  runnerNames[update[1]] = update[2];
                  break;
                case 'DELETE':
                  delete rows[update[1]];
                  break;
                case 'TIME':
                  rows[update[4]] =
                    {
                      bib: update[1],
                      time: new Date(update[2] * 1000),
                      editedAt: new Date(update[3] * 1000),
		      id: update[4]
                    };
                  break;
                }
              });

	      $('#info')
		.show()
		.text(
		  'There are ' + Object.keys(runnerNames).length + ' runners, ' +
		    Object.keys(rows).length + ' passed this checkpoint');
	      
              const data = [];
              $.each(rows, function(i, row) {
                data.push(row);
              });
	      selectRow(null);
              t.clear();
              t.rows.add(data).draw();
            });
      };

      checkpoints.change(function() {
	lastId = 0;
	runnerNames = { };
	closestCheckpointDistance = null;
	t.clear();
	updateServer();
      });
      
      $('#update').click(updateServer);
      updateServer();

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
          const row = t.row.add({ bib: +bib.data('bib'), time: new Date(), edited: true }).draw();
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
