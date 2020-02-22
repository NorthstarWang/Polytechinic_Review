
!function($) {
    "use strict";

    var SweetAlert = function() {};

    //examples 
    SweetAlert.prototype.init = function() {
        
    //Basic
    $('#sa-basic').click(function(){
        swal("Here's a message!");
    });

    $('#butAddReview').click(function(){
        swal("Review submitted, redirecting...");
    });
    /*$("[name='deletebuttonS1']").click(function(){
        swal("Review deleted!");
    });*/

    $("#butAddReview").click(function(){
        swal({   
           title: "Review Created!",   
           text: "You will be redirected in 2 seconds",   
           showConfirmButton: false,
           type: 'success'
       });
   });

   $("#butRecoverSchool").click(function(){
    swal({   
       title: "We are trying to recover your school!",   
       text: "This may take a few seconds.",   
       showConfirmButton: false,
       type: 'info'
   });
});

$("#butAddModule").click(function(){
    swal({   
       title: "Module Created!",   
       text: "You will be redirected in 2 seconds",   
       showConfirmButton: false,
       type: 'success'
   });
});
   

   $("#butAddReview2").click(function(){
    swal({   
       title: "Review Edited!",   
       text: "You will be redirected in 2 seconds",   
       showConfirmButton: false,
       type: 'success'
   });
});

$("#butEditSchool").click(function(){
    swal({   
       title: "School Information Edited!",   
       text: "You will be redirected in 2 seconds",   
       showConfirmButton: false,
       type: 'success'
   });
});

$("#butAddSchool").click(function(){
    swal({   
       title: "School has been added to database!",   
       text: "You will be redirected in 2 seconds",   
       showConfirmButton: false,
       type: 'success'
   });
});

    $("[name='deletebuttonS1']").click(function(){
        swal({   
           title: "Review deleted!",   
           text: "You will be redirected in 2 seconds",   
           showConfirmButton: false,
           type: 'success',
           imageUrl: 'https://media2.giphy.com/media/p39qWGHTpfY0o/giphy.gif',
           imageWidth: 344,
           imageHeight: 245,
       });
   });

   $("[name='deleteSchoolButton']").click(function(){
    swal({   
       title: "School deleted!",   
       text: "You can still recover this school by using the school admin recovery tool. The page will be refreshed in a few moments",   
       showConfirmButton: false,
       type: 'success',
   });
});
   

    //A title with a text under
    $('#sa-title').click(function(){
        swal("Here's a message!", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed lorem erat eleifend ex semper, lobortis purus sed.")
    });

    //Success Message
    $('#sa-success').click(function(){
        swal("Good job!", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed lorem erat eleifend ex semper, lobortis purus sed.", "success")
    });

    //Warning Message
    $('#sa-warning').click(function(){
        swal({   
            title: "Are you sure?",   
            text: "You will not be able to recover this imaginary file!",   
            type: "warning",   
            showCancelButton: true,   
            confirmButtonColor: "#DD6B55",   
            confirmButtonText: "Yes, delete it!",   
            closeOnConfirm: false 
        }, function(){   
            swal("Deleted!", "Your imaginary file has been deleted.", "success"); 
        });
    });

    //Parameter
    $('#sa-params').click(function(){
        swal({   
            title: "Are you sure?",   
            text: "You will not be able to recover this imaginary file!",   
            type: "warning",   
            showCancelButton: true,   
            confirmButtonColor: "#DD6B55",   
            confirmButtonText: "Yes, delete it!",   
            cancelButtonText: "No, cancel plx!",   
            closeOnConfirm: false,   
            closeOnCancel: false 
        }, function(isConfirm){   
            if (isConfirm) {     
                swal("Deleted!", "Your imaginary file has been deleted.", "success");   
            } else {     
                swal("Cancelled", "Your imaginary file is safe :)", "error");   
            } 
        });
    });

    //Custom Image
    $('#sa-image').click(function(){
        swal({   
            title: "Govinda!",   
            text: "Recently joined twitter",   
            imageUrl: "../assets/images/users/profile.png" 
        });
    });

    //Auto Close Timer
    $('#sa-close').click(function(){
         swal({   
            title: "Auto close alert!",   
            text: "I will close in 2 seconds.",   
            timer: 2000,   
            showConfirmButton: false 
        });
    });


    },
    //init
    $.SweetAlert = new SweetAlert, $.SweetAlert.Constructor = SweetAlert
}(window.jQuery),

//initializing 
function($) {
    "use strict";
    $.SweetAlert.init()
}(window.jQuery);