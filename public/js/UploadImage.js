

//var defaultfile = '@Model.userInfo.ProfilePicture'
var image = "";

const file = document.getElementById('downImagen');
const img = document.getElementById('img');
file.addEventListener('change', e => {
    if (e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            img.src = e.target.result;
            image = e.target.result;
        }
        reader.readAsDataURL(e.target.files[0])
    } else {
        img.src = defaultfile;
    }
});


function LimpiarFirmaCancelar() {
    let canvas = document.getElementById('paint');
    let contex = canvas.getContext('2d');
    contex.clearRect(0, 0, canvas.width, canvas.height)
    window.location.href = "/Home/MyPerfil"
}
function LimpiarFirmaCancelar2() {
    let canvas = document.getElementById('paint');
    let contex = canvas.getContext('2d');
    contex.clearRect(0, 0, canvas.width, canvas.height)

}
function LimpiarFirmaCancelar3() {
    let canvas = document.getElementById('paint2');
    let contex = canvas.getContext('2d');
    contex.clearRect(0, 0, canvas.width, canvas.height)

}
function saveIMG() {
    $.ajax({
        url: '../Home/SaveProfilePicture',
        type: 'POST',
        data: {
            image: image
        }
    }).done((response) => {

        if (response.code) {
            // mostrarMensajeGlobal("Exitoso", "Debes reiniciar tu cuenta para vesualizar los cambios","success");
            $('#modalEditarperfil').click();
            window.location.href = "/Home/MyPerfil"
            // timeout = setTimeout(alertFunc, 4000);

        }
        else {
            mostrarMensajeGlobal("Error", "La imagen no pudo subirse, verifique su señal de internet", "error");
        }


    }).fail((response) => {
        mostrarMensajeGlobal('Error', 'Ocurrio un error inesperado. Por favor reporte esto a la plataforma.', 'error');
    });
}

//TOOLTIP
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})

$(document).ready(function () {
    $('.NO-CACHE').attr('src', function () { return $(this).attr('src') + "?a=" + Math.random() });
});