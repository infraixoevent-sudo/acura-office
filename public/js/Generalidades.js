window.id_url = function () {
    var url = window.location.pathname;
    if (url == "/DashBoard") {
        var elemento = document.getElementById("boleto");
        elemento.className += " tab--active ";
    }
    if (url == "/CreateEvent") {
        var elemento = document.getElementById("evento");
        elemento.className += " tab--active ";
    }
    if (url == "/EditEvent") {
        var elemento = document.getElementById("Editevento");
        elemento.className += " tab--active ";
    }

}

//MAPA DE CREAR EVENTO
async function initMap(dotNetObjRef) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {

                var pos = [parseFloat(position.coords.latitude), parseFloat(position.coords.longitude)];
                map = new google.maps.Map(document.getElementById("map"), {
                    center: { lat: pos[0], lng: pos[1] },
                    zoom: 9,
                });
                marker = new google.maps.Marker({
                    map,
                    draggable: true,
                    animation: google.maps.Animation.DROP,
                    position: { lat: pos[0], lng: pos[1] },
                });
                marker.addListener("dragend", function (marker) {
                    var latLng = marker.latLng;
                    currentLatitude = latLng.lat();
                    currentLongitude = latLng.lng();
                    
                    dotNetObjRef.invokeMethodAsync("UpdateCoordinates",
                        currentLatitude.toString(),
                        currentLongitude.toString()
                    );
                } );

            },
            () => {

        });
    }
}

async function initEditableMap(dotNetObjRef, latitude, longitude) {
    console.log(latitude, longitude)
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
        zoom: 9,
    });
    marker = new google.maps.Marker({
        map,
        draggable: true,
        animation: google.maps.Animation.DROP,
        position: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
    });
    marker.addListener("dragend", function (marker) {
        var latLng = marker.latLng;
        currentLatitude = latLng.lat();
        currentLongitude = latLng.lng();

        dotNetObjRef.invokeMethodAsync("UpdateEditedCoordinates",
            currentLatitude.toString(),
            currentLongitude.toString()
        );
    });
}


async function initMapWithCoordinates(latitude, longitude) {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
        zoom: 9,
    });
    marker = new google.maps.Marker({
        map,
        draggable: false,
        animation: google.maps.Animation.DROP,
        position: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
    });
}

function toggleBounce() {
    if (this.getAnimation() != null) {
        this.setAnimation(null);
    } else {
        this.setAnimation(google.maps.Animation.BOUNCE);
    }
}


function cargaCategorias() {
    url = "https://acura-events.vantis.team/GetEventCategory";
    $.getJSON(url, function (data) {
        select = document.getElementById('categorias');
        let i = 0;
        for (var item of data.eventCategoriesList) {
            i = i + 1;
            var opt = document.createElement('option');
            opt.innerHTML = item.description;
            select.appendChild(opt);
        }
    });
}

function cargaCP() {
    url = "https://acura-events.vantis.team/GetNeighborhoodsByZipCode";
    zipCode = $("#codigoPostal").val();
    $.ajax({
        type: "POST",
        url: url,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({ zipCode: zipCode }),
    })
        .done(function (data) {
            document.getElementById("estado").value = data.dataZipCode.state;
            document.getElementById("cargaMunicipio").value = data.dataZipCode.municipality;
            selectCol = document.getElementById('colonias');
            let i = 0;
            for (var item of data.dataZipCode.neighborhoodList) {
                i = i + 1;
                var opt = document.createElement('option');
                opt.innerHTML = item.description;
                selectCol.appendChild(opt);
            }


        });
}


function identifyURL(url) {
    if (url == "/DashBoard") {
        var elemento = document.getElementById("boleto");
        elemento.className += " tab--active ";
    }
    if (url == "/CreateEvent") {
        var elemento = document.getElementById("evento");
        elemento.className += " tab--active ";
    }
    if (url == "") {
        window.location.href = "/Dashboard";
    }

}

function cargaEditTicket() {
    var ano = "2023";
    var mes = "05";
    var dia = "21";
//    document.getElementById('datefirst').value = ano + "/" + mes + "/" + dia;
    document.getElementById('datefirst').innerHTML = dia + "/" + mes + "/" + ano;
}

function redirect() {
    window.location.assign("/CreateTicket");
}

function urlCreateTickets() {
    window.location.assign("/CreateTicket");
}
function urlEvents() {
    window.location.assign("/Events");
}
function TicketingFolio() {
    window.location.assign("/Cashier/TicketingFolio");
}
function _inputReadonly() {
    document.getElementById("estado").readOnly;
    document.getElementById("cargaMunicipio").readOnly;
}


function redirectMisEventos() {
    window.location.assign("/Events");
}

function EditarEventos() {
    window.location.assign("/EditEvent");
}

function cerrar() {
    window.onbeforeunload = function (event) {
        return true;
    }
}

function Incremento(id) {
    $("#legendWarning_" + id).addClass("d-none");

    var inicio = $("#cantidad_" + id).val() == '' ? '0' : $("#cantidad_" + id).val();
    var total = $("#total").val();
    var totalTickets = 0;
    var priceTicket = $("#priceTicket_" + id).val();
    var ticketsDisponible = $("#quantity_" + id).val();

    if (parseInt(inicio) < parseInt(ticketsDisponible)) {
        var incrementado = ++inicio;
        var cantidad = document.getElementById('cantidad_' + id).value = incrementado;
        subtotal = priceTicket * cantidad;
        document.getElementById("total_" + id).value = subtotal;
        contabilidad();
    } else {
        $("#legendWarning_" + id).removeClass("d-none");
    }
}

function Decremento(id) {
    $("#legendWarning_" + id).addClass("d-none");

    var inicio = $("#cantidad_" + id).val();
    if (inicio > 0) {
        var total = $("#total").val();
        var totalTickets = 0;
        var priceTicket = $("#priceTicket_" + id).val();
        var incrementado = --inicio;
        var cantidad = document.getElementById('cantidad_' + id).value = incrementado;
        subtotal = priceTicket * cantidad;
        document.getElementById("total_" + id).value = subtotal;
        contabilidad();
  //      totalTickets = parseFloat(total) - parseFloat(priceTicket);
   //     document.getElementById("total").value = totalTickets;
    }
}

function putQuantity(id) {
    //cantidad
    $("#legendWarning_" + id).addClass("d-none");
    var inicio = $("#cantidad_" + id).val();
    //precio
    var priceTicket = $("#priceTicket_" + id).val();
    var ticketsDisponible = $("#quantity_" + id).val();
    if ((parseInt(inicio) >=0 && parseInt(inicio) <= parseInt(ticketsDisponible))) {
            subtotal = priceTicket * inicio;
            document.getElementById("total_" + id).value = subtotal;
            contabilidad();              
    } else {
        if (inicio > 0) {
            $("#legendWarning_" + id).removeClass("d-none");
        } else {
            $("#legendWarning_" + id).addClass("d-none");
        }
    }
}

function contabilidad() { 
    var numeroTickets = $("#noTickets").val();
    var totalTickets = 0;
    var totalTicket = 0;
    for (i = 1; i < numeroTickets; i++) {
        if (!$('#cantidad_' + i).prop('disabled')) {
            totalTicket = $("#total_" + i).val();
            totalTickets = parseFloat(totalTickets) + parseFloat(totalTicket);
        }
    }

    //Dar formato de moneda
    const locales = 'en-US'
    const options = {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }
    const formatterDolar = new Intl.NumberFormat(locales, options)
    const priceFormatter = formatterDolar.format(totalTickets)
    document.getElementById("total_Boletos").value = priceFormatter;

}


function validCategoria(x) {
    var flag = false;
    for (var i = 1; i <= x; i++) {
        var Entradas = $('#cantidad_' + i).val();
        if (Entradas != undefined && Entradas != '0') {
            flag = true;
        }
    }

    if (!flag) {
        Swal.fire({
            icon: "error",
            text: "selecciona una categoria",
        });
        return false;
    }
    return true;
}
function getTotalAmount() {
    return document.getElementById("total_Boletos").value;
}

function getSelectedQuantity(id) {
    return $("#cantidad_" + id).val();
}

function montosIniciales() {
    var numeroTickets = $("#noTickets").val();
    for (i = 1; i < numeroTickets; i++) {
        var cantidad = $("#cantidad_" + i).val();
        var priceTicket = $("#priceTicket_" + i).val();
        subtotal = priceTicket * cantidad;
        document.getElementById("total_" + i).value = subtotal;
    }
    contabilidad();
}
function alertcategori(){
    Swal.fire({
        icon: "error",
        text: "selecciona una categoria",
    });
}

function Download(url) {
    var elemento = document.createElement('a');
    elemento.style.display = 'none';
    document.body.appendChild(elemento);
    elemento.href = url;
    elemento.target = "_blank";
    elemento.download = 'boletos.pdf';
    elemento.click();
    document.body.removeChild(elemento);
}

function cerrar() {
    let navbar = document.querySelector(".navbar-toggler");
    navbar.click();
}