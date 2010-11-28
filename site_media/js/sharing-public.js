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
  });

  $("fieldset#share_link_menu").mouseup(function() {
    return false
  });
  /* End code for clicking the share this note button */



  /* When clicking the invite new user link */
  // Hide the invite new user link by default
  $('#invite').hide();
  var input = $('#filter');
  // The current url + /sharing
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
