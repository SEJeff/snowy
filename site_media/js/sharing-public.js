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

  $(".share_link").click(function(e) {
    e.preventDefault();
    $("fieldset#share_link_menu").toggle();
    $(".share_link").toggleClass("menu-open");
  });

  $("fieldset#share_link_menu").mouseup(function() {
    return false
  });
$(document).mouseup(function(e) {
  if($(e.target).parent("a.share_link").length==0) {
    $(".share_link").removeClass("menu-open");
    $("fieldset#share_link_menu").hide();
  }
});



});
