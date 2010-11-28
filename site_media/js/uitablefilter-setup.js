$(function() {
  var popup_menu = $('table.filter_table');

  $("#filter").keyup(function() {
    $.uiTableFilter( popup_menu, this.value );
    var invite = $('#invite');

    // Only show the invitation link when no table body rows are left
    if ( $($("#filter_table tbody").attr('rows')).filter(':visible').length == 0 ) {
      invite.show()
    } else {
      invite.hide();
    }
    // Make the invitation link shiney and auto-update
    if ( invite.filter(':visible').length > 0) {
      $('#replace_email').html(' ' + $(this).val() );
    }
  });

  $('#filter_form').submit(function() {
    popup_menu.find("tbody > tr:visible > td:eq(1)").mousedown();
    return false;
  });
});
