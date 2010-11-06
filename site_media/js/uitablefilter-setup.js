$(function() {
  var theTable = $('table.filter_table')

  theTable.find("tbody > tr").find("td:eq(1)").mousedown(function(){
    $(this).prev().find(":checkbox").click()
  });

  $("#filter").keyup(function() {
    $.uiTableFilter( theTable, this.value );
    // Figure out how to show the invite row then
    if ( $($("#filter_table").attr('rows')).filter(':visible').length == 0 ) {
      $('#invite').show();
    }
    else {
      $('#invite').hide();
    }
  })

  $('#filter-form').submit(function(){
    theTable.find("tbody > tr:visible > td:eq(1)").mousedown();
    return false;
  }).focus(); //Give focus to input field
});
