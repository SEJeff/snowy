/*
 * Copyright (c) 2010 Jeff Schroeder <jeffschroeder@computer.org>
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option) any
 * later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// Based on the rules from: http://www.w3schools.com/tags/att_standard_id.asp
function safe_id(value) {
  var id = "";
  // Start with a letter
  if ( ! value[0].match(/^[A-Za-z]/) ) {
    id = "a";
  }
  else {
    id += value[0];
  }
  // Nothing other than alnum, dashes, underscores, colons, or periods allowed.
  for (i = 1; i < value.length; i++) {
    var char = value[i];
    if (! char.match(/^[A-Za-z-_:\.]+$/)) {
        char = "_";
    }
    id += char;
  }
  return id
}

$(document).ready(function() {
  // Public / Private note functionality is good for now.
  /************** This is for clicking the lock image ***************/
  var img = $("input[type='image']");
  img.click(function() {
    // Use the opposite of the current status to toggle
    var status = ! $(this).hasClass("public");
    $(this).toggleClass("public");
    $.ajax({
      url: url,
      type: 'PUT',
      data: {'public': status},
      success: function(value, textStatus) {
                 if (status == true) {
                   img.attr("src", media_url + "img/public.png");
                   // TODO: Translate this
                   img.attr("title", "This note is public for anyone to see");
                 }
                 else {
                   img.attr("src", media_url + "img/private.png");
                   img.attr("title", "This note is private");
                 }
               },
      error: function() {
                 alert("Error updating note permissions");
               },
    });
  });

  /******** This is for clicking the share this note button *********/
  var input = $('#filter');
  $(".share_link").click(function(e) {
    e.preventDefault();
    $("fieldset#share_link_menu").toggle();
    $(".share_link").toggleClass("menu-open");
    // Focus the input box when clicking the signin link
    input.focus();
  });

  $("fieldset#share_link_menu").mouseup(function() {
    return false
  });

  /************* When clicking the invite new user link *************/
  // Hide the invite new user link by default
  $('#invite_link').click(function() {
    var email = input.val();
    $.post(url, {email: email},
      function(data) {
        // Add the newly sent invitation to the sharing box
        var id  = safe_id(email);
        var row = '<tr style="display: table-row;"><td class="center"><input type="checkbox" value="' + email + '" id="' + id + '" checked></td><td><label for="' + id + '">' + email + '</label></td></tr>';
        $("fieldset#share_link_menu").toggle(function() {
          $(".share_link").toggleClass("menu-open");
          $("#filter_table:tbody").append(row);
          // Reset the table
          input.val('');
          $('#invite').hide();
          $.uiTableFilter($('table.filter_table'), '');
          alert("Invitation sent to " + email);
        });
        return false;
      });
  });

  var table_rows = $("#filter_table tbody tr").slice(1);
  //alert("hi");
  //var new_id = table_rows.find("input:checkbox")[0].id;
  //alert("new_id=" + new_id);

  // Attach click handler to checkboxes
  table_rows.find("input:checkbox").click(function(element) {
    alert("id=" + $(this).attr("value") + "; checked=" + $(this).attr("checked") );
    /*
    var checked = $(this).attr("checked");
    var email = 
    $.ajax({
      url: url,
      type: 'PUT',
      data: {'public': status},
      success: function(value, textStatus) {
               }
      error: function(value, textStatus) {
             }
    });
    */
  });

});

/*********** When clicking off the sharing menu, hide it ************/
$(document).mouseup(function(e) {
  if($(e.target).parent("a.share_link").length==0) {
    $(".share_link").removeClass("menu-open");
    $("fieldset#share_link_menu").hide();
  }
});
