window.onload = function () {
    if (localStorage.hasOwnProperty('userEmail') && localStorage.hasOwnProperty('userPass')) {
        document.getElementById("email").value = localStorage.getItem("userEmail");
        document.getElementById("password").value = localStorage.getItem("userPass");
        document.getElementById("RememberUser").checked = true;
    }
}

document.getElementById("RememberUser").addEventListener('change', e => {
    if (e.target.checked === false) {
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userPass");
    }
});

//<!--Mostrar pasword 1-->
function mostrarPassword() {
    var cambio = document.getElementById("password");
    if (cambio.type == "password") {
        cambio.type = "text";
        $('.icon').removeClass('bi bi-eye-slash').addClass('bi bi-eye');
    } else {
        cambio.type = "password";
        $('.icon').removeClass('bi bi-eye').addClass('bi bi-eye-slash');
    }
}

function mostrarPasswordNew() {
    var cambio = document.getElementById("passwordnew");
    if (cambio.type == "password") {
        cambio.type = "text";
        $('.icon').removeClass('bi bi-eye-slash').addClass('bi bi-eye');
    } else {
        cambio.type = "password";
        $('.icon').removeClass('bi bi-eye').addClass('bi bi-eye-slash');
    }
}


$(document).ready(function () {
    //CheckBox mostrar contraseña
    $('#ShowPassword').click(function () {
        $('#Password').attr('type', $(this).is(':checked') ? 'text' : 'password');
    });
});


$(document).ready(function () {
    //CheckBox mostrar contraseña
    $('#ShowPassword').click(function () {
        $('#Password').attr('type', $(this).is(':checked') ? 'text' : 'password');
    });
});


$(document).ready(function () {
    //CheckBox mostrar contraseña
    $('#ShowPassword').click(function () {
        $('#Password').attr('type', $(this).is(':checked') ? 'text' : 'password');
    });
});
