$('#profilepicUpload').on('change', function () {

    let image = $("#profilepicUpload")[0].files[0];
    let formdata = new FormData();

    formdata.append('profilepicUpload', image);

    $.ajax({
        url: '/profileStudent/upload',
        type: 'POST',
        data: formdata,
        contentType: false,
        processData: false,
        'success': (data) => {
            
            $('#profilepic').attr('src', data.file);
            $('#profilepicURL').attr('value', data.file); // sets posterURL hidden field

            if (data.err) {

                $('#posterErr').show();
                $('#posterErr').text(data.err.message);

            } else {

                $('#posterErr').hide();
            }
        }
    });
});

$('#uploadScreenShot').on('change', function(){
 let image = $("#uploadScreenShot")[0].files[0];
 let formdata = new FormData();
 formdata.append('uploadScreenShot', image);
 $.ajax({
 url: '/report/uploadScreenShot',
 type: 'POST',
 data: formdata,
 contentType: false,
 processData: false,
 'success':(data) => {
 $('#ScreenShot').attr('src', data.file);
 $('#ScreenShotURL').attr('value', data.file);
 if(data.err){
 $('#ScreenShotErr').show();
 $('#ScreenShotErr').text(data.err.message);
 } else{
 $('#ScreenShotErr').hide();
 }
 }
 });
});

$('#schImgUpload').on('change', function () {
    let image = $("#schImgUpload")[0].files[0];
    console.log(image);
    let formdata = new FormData();
    formdata.append('schImgUpload', image);
    $.ajax({
        url: '/directory/upload',
        type: 'POST',
        data: formdata,
        contentType: false,
        processData: false,
        'success': (data) => {
            console.log(data.name);
            $('#imgurl').attr('value', data.file);
            setTimeout(function () {
                $('#schimgdisplay').attr('src', data.file);
			}, 500);
            if (data.err) {
                // put error if got time
            } else {
            }
        }
    });
});

$('#schImgUploadImgur').on('change', function () {

    var $files = $(this).get(0).files;

    if ($files.length) {

    // Reject big files
    if ($files[0].size > $(this).data("max-size") * 1024) {
        console.log("Please select a smaller file");
        return false;
    }

    // Begin file upload
    console.log("Uploading file to Imgur..");

    // Replace ctrlq with your own API key
    var apiUrl = 'https://api.imgur.com/3/image';
    //var apiKey = '86457fe7e77682163387d7f4e96f7cd82564f06f';
    var settings = {
        async: false,
        crossDomain: true,
        processData: false,
        contentType: false,
        type: 'POST',
        url: apiUrl,
        headers: {
        Authorization: 'Client-ID 5757b9bf576bdbc ',
        Accept: 'application/json'
        },
        mimeType: 'multipart/form-data'
    };

    var formData = new FormData();
    formData.append("image", $files[0]);
    settings.data = formData;

    // Response contains stringified JSON
    // Image URL available at response.data.link
    $.ajax(settings).done(function(response) {
        console.log(response);
        var imgurObject = JSON.parse(response);
        $('#imgurl').attr('value', imgurObject.data.link);
        setTimeout(function () {
            $('#schimgdisplay').attr('src', imgurObject.data.link);
        }, 500);
    });

    }
});