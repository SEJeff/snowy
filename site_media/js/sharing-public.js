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
$(document).ready(function() {
  // Public / Private note functionality is good for now.
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

  /* This is for clicking the share this note button */
  $(".share_link").click(function(e) {
    e.preventDefault();
    $("fieldset#share_link_menu").toggle();
    $(".share_link").toggleClass("menu-open");
    // Focus the input box when clicking the signin link
    $("#filter").focus();
  });

  $("fieldset#share_link_menu").mouseup(function() {
    return false
  });

  /* When clicking the invite new user link */
  // Hide the invite new user link by default
  $('#invite').hide();
  var input = $('#filter');
  // TODO: Fully flesh this out for clicking the invite link
  $('#invite_link').click(function() {
    var email = input.val();
    $.post(url, {email: email},
      function(data) {
        // TODO: Hide and reset the input
        alert("Invitation sent to " + email);
        return false;
      });
  });
});

$(document).mouseup(function(e) {
  if($(e.target).parent("a.share_link").length==0) {
    $(".share_link").removeClass("menu-open");
    $("fieldset#share_link_menu").hide();
  }
});
