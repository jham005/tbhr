$(document).ready(function() {
  const t = $('#preregistered').DataTable({
    order: [[1, "asc"], [0, 'asc']],
    dom: '<f<t>p>',
    columnDefs: [
      {
	data: 'bib',
	width: '5em',
	targets: 0,
	render: function(bib, type) {
	  if (type == 'display')
	    return '<input type="number" class="bib" value="' + (bib || '') + '"/>';
	  return bib || '';
	}
      },
      {
	targets: 1,
	render: function(data, type, row) {
	  return row.forename + ' ' + row.surname + ' (' + row.club + '), ' + row.category;
	}
      },
      {
	data: 'early',
	width: '6em',
	targets: 2,
	render: function(early, type) {
	  if (type == 'display')
	    return '<input type="checkbox"' + (early ? " checked" : "") + '/>';
	  return early;
	}
      }
    ]
  });

  let token = '';
  $('#preregistered').on('change', 'input', function() {
    const tr = this.parentElement.parentElement;
    const row = t.row(tr).data();
    if (row.origBib == undefined)
      row.origBib = row.bib;
    if (row.origEarly == undefined)
      row.origEarly = row.early;
    
    if (this.type == 'number')
      row.bib = +this.value.replace(/-?\D/g, '');
    else
      row.early = !!this.checked;
    row.edited = row.origBib != row.bib || row.origEarly != row.early;
    if (row.edited)
      $(tr).addClass('edited');
    else
      $(tr).removeClass('edited');
    t.row(tr).data(row).invalidate().draw();
  });

  const bibFilter = $("input[name='bib-filter']");
  bibFilter.change(function() {
    t.column(0).search(bibFilter.filter(':checked').val(), true, false).draw();
  });

  $.get('results/registration.php', 'json')
    .done(function(data) {
      token = data.token;
      const start = data.start;
      const prereg = [];
      $.each(data.preregistered, function() {
	prereg.push({
	  surname: this[0],
	  forename: this[1],
	  club: this[2],
	  category: this[3],
	  bib: 0,
	  early: false });
      });
      t.rows.add(prereg).draw();

      const pendingUpdates = function() {
	const updates = [];
	t.rows().every(function() {
	  const row = this.data();
	  if (row.edited && row.bib != 0)
	    updates.push(['REGISTER', row.bib, row.surname, row.forename, row.club, row.category, row.early]);
	});
	return updates;
      };

      let lastId = 0;
      const updateServer = function() {
	$('#loading').show();
	$.post(
          'results/update.php',
          {
            token: token,
	    lastId: lastId,
	    checkpoint: start,
	    who: $('#who').val(),
            updates: JSON.stringify(pendingUpdates())
          },
          'json')
	  .always(function() { $('#loading').hide(); })
	  .fail(function() { alert('Update failed'); })
	  .done(function(result) {
            token = result.token;
	    lastId = result.lastId;
            $.each(result.updates, function(i, update) {
              if (update[0] == 'REGISTER') {
		const bib = update[1];
		const surname = update[2];
		const forename = update[3];
		const club = update[4];
		const category = update[5];
		const early = update[6];
		const p = prereg.findIndex(function(r) {
		  return r.surname == surname && r.forename == forename && r.club == club && r.category == category;
		});
		if (p != -1) {
		  prereg[p].bib = bib;
		  prereg[p].early = early;
		} else
		  prereg.push({
		    bib: bib,
		    surname: surname,
		    forename: forename,
		    club: club,
		    category: category,
		    early: early
		  });
	      }
	    });
            t.clear();
            t.rows.add(prereg).draw();
	  });
      };
      
      $('#update').click(updateServer);
      updateServer();

      $('#add-btn').click(function() {
	const surname = $('#surname').val();
	if (surname != '') {
	  const newRow = {
	    surname: surname,
	    forename: $('#forename').val(),
	    club: $('#club').val() || 'Unattached',
	    category: $('#category').val(),
	    bib: +$('#bib').val().replace(/-?\D/g, ''),
	    early: $('#early').prop('checked'),
	    origBib: 0,
	    origEarly: false,
	  };
	  prereg.push(newRow);

	  const row = t.row.add(newRow);
	  if (bib) {
	    row.edited = true;
	    $(row.node()).addClass('edited');
	  }
	  
	  row.draw();
	  $('#bib').val('');
	  $('#surname').val('');
	  $('#forename').val('');
	  $('#club').val('');
	  $('#early').prop('checked', false);
	  $('#signup-tab').click();
	}
      });
    });

  $('#registration-tab a').on('click', function (e) {
    e.preventDefault();
    $(this).tab('show');
  });
});
