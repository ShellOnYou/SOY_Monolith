$(function () {
    $("#submit").submit(function (e) {
        e.preventDefault()
        if (typeof FormData == "undefined") {
            throw new Error("FormData non supporté")
        }

        let formdata = new FormData($("#submit")[0])
 
        $.ajax({
            type: "POST",
            enctype: "multipart/form-data",
            url: "/API/ExerciseProduction",
            data: formdata,
            processData: false,
            contentType: false,
            cacher: false,
            timeout: 600000,
            /* callback en cas de succes */
            success: function (data) {
                var data = JSON.parse(data)
                var message = "<p></p><h3 style='color: magenta; font-weight: bold;'>Score: " + data.grade + "&#37;</h3>" +
                "<table><tr><th class='text-center' style='padding:10px'> Detail </th><th style='padding:10px'>Verification</th><th style='padding:10px'>Status</th><th  style='padding:10px'>Explanation</th></tr>" 
                for(let i=0 ; i< data.log.length ; i++){
                    message = message + 
                    "<tr>" +
                    "<td class='text-center' style='padding:10px'>" + data.log[i].numQ + "</td>" +
                    "<td style='padding:10px'>" + data.log[i].verif + "</td>" +
                    "<td class='text-center' style='padding:10px'>" + data.log[i].status + "</td>" +
                    "<td style='padding:10px'>" + data.log[i].expl + "</td>" +
                    "</tr>"
                }
                message = message + "</table>"
                $('#notif').html( message )
            },
            error: function (r, e, x) {
                $('#notif').html(JSON.parse(r.responseText).log)
            }
        })
    })
})