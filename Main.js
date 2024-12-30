// ** VARIABLES ** //
var FICHAS_JUGADOR = 300;
var FICHAS_MAQUINA = 300;
var CIEGA = 25;
var RONDA = 0;
var MAZO = [];
var MAZO_PROV = [];
var MANO_JUGADOR = [];
var MANO_MAQUINA = [];
var MANO_MESA = [];
var TURNO = true;
var JUGAR = true;
var APUESTA = 0;
var RETIRO_JUGADOR = false;
var RETIRO_MAQUINA = false;

// ** CLASES ** //

class Carta
{
    constructor(nombre, palo, puntos, imagenFrontal, imagenTrasera)
    {
        this.nombre = nombre;
        this.palo = palo;
        this.puntos = puntos;
        this.imagenFrontal = imagenFrontal;
        this.imagenTrasera = imagenTrasera;
    }
}

// ** FUNCIONES ** //

/*
    Funcion que crea las cartas ordenadas y las agrega en el array MazoProv
*/
const CrearCartas = () =>
{
    for(let i=1; i<=4; i++)
    {
        for(let j=1; j<=13; j++)
        {
            let imagenTrasera = `<img src="./imagenes/cartaDetras.png" />`;
            let imagenFrontal = "";
            let nombre = "";
            let palo = "";
            let puntos = 0;
    
            // Palo de la carta
            if(i == 1)
            {
                palo = "Corazon";
            } 
            else if(i == 2)
            {
                palo = "Pica";
            }
            else if (i == 3)
            {
                palo = "Trebol";
            }
            else
            {
                palo = "Diamante";
            }
    
            //Nombre y puntos de la carta
            switch(j)
            {
                case 1: nombre = "As"; puntos = 14; break;
                case 2: nombre = "2"; puntos = 2; break;
                case 3: nombre = "3"; puntos = 3; break;
                case 4: nombre = "4"; puntos = 4; break;
                case 5: nombre = "5"; puntos = 5; break;
                case 6: nombre = "6"; puntos = 6; break;
                case 7: nombre = "7"; puntos = 7; break;
                case 8: nombre = "8"; puntos = 8; break;
                case 9: nombre = "9"; puntos = 9; break;
                case 10: nombre = "10"; puntos = 10; break;
                case 11: nombre = "J"; puntos = 11; break;
                case 12: nombre = "Q"; puntos = 12; break;
                case 13: nombre = "K"; puntos = 13; break;
            }
            imagenFrontal = `<img src="./imagenes/${nombre}${palo}.png" />`
            MAZO_PROV.push(new Carta(nombre, palo, puntos, imagenFrontal, imagenTrasera))
        }
    }
}

/*
    Funcion que desordena las cartas y las añade al array Mazo
*/
const DesordenarCartas = () =>
{
    const OriginalLength = MAZO_PROV.length;
    for(let i=0; i<OriginalLength; i++)
    {
        let random = Math.floor(Math.random() * MAZO_PROV.length);
        MAZO.push(MAZO_PROV[random]);
        MAZO_PROV.splice(random, 1);
    }
}

const RepartirCartas = () =>
{
    for(let i=0; i<=3; i++)
    {
        if(i%2==0 || i==0)
        {
            MANO_JUGADOR.push(MAZO[i]);
            MAZO.splice(i, 1);
        }
        else
        {
            MANO_MAQUINA.push(MAZO[i]);
            MAZO.splice(i, 1);
        }
    }
}

const LanzarCartasMesa = () => 
{
    if(RONDA == 1)
    {
        for(let i=0; i<3; i++)
        {
            MANO_MESA.push(MAZO[i]);
            MAZO.splice(i, 1);
        }
    }
    else if(RONDA == 2 || RONDA == 3)
    {
        MANO_MESA.push(MAZO[0]);
        MAZO.splice(0, 1);
    }
}

const evaluarMano = (mano) => {
    
    let manoFinal = mano.concat(MANO_MESA); // Concatenamos la mano del jugador con las cartas de la mesa

    // Comprobamos si tiene color (todas las cartas de un mismo palo)
    let conteoPalos = {}; // Objeto que contará cuántas cartas de cada palo tiene
    for (let carta of manoFinal) {
        conteoPalos[carta.palo] = (conteoPalos[carta.palo] || 0) + 1; // Aumentamos el conteo por palo
    }
    let tieneColor = Object.values(conteoPalos).some(count => count >= 5); // Si tiene 5 o más cartas de un mismo palo, tiene color

    // Comprobamos si tiene escalera (5 cartas consecutivas de valores)
    let tieneEscalera = false;
    let valores = manoFinal.map(carta => carta.puntos); // Sacamos los valores de las cartas de la mano
    if (valores.includes(14) && !valores.includes(1)) valores.push(1); // Si hay un "AS" (14), lo agregamos como 1 para una escalera baja
    let valoresOrdenados = [...new Set(valores)].sort((a, b) => a - b); // Eliminamos duplicados y ordenamos los valores de las cartas

    let contaNumConsecutivos = 1;
    let cartasEscalera = []; // Almacenaremos las cartas que forman la escalera
    for (let i = 1; i < valoresOrdenados.length && !tieneEscalera; i++) {
        // Recorremos los valores ordenados buscando una secuencia consecutiva
        if (valoresOrdenados[i] == valoresOrdenados[i - 1] + 1) {
            contaNumConsecutivos++;
            cartasEscalera.push(valoresOrdenados[i - 1]); // Añadimos la carta a la secuencia
            if (contaNumConsecutivos >= 5) {
                tieneEscalera = true; // Si encontramos 5 cartas consecutivas, tenemos escalera
                cartasEscalera.push(valoresOrdenados[i]); // Añadimos la última carta de la escalera
            }
        } else {
            contaNumConsecutivos = 1; // Si no son consecutivas, reiniciamos la secuencia
            cartasEscalera = []; // Reiniciamos las cartas de la escalera
        }
    }

    // Comprobamos escalera de color y escalera real (escalera de color con 5 cartas del mismo palo)
    if (tieneColor) {
        let paloDominante = Object.keys(conteoPalos).find(palo => conteoPalos[palo] >= 5); // Encontramos el palo con más de 5 cartas
        let valoresMismoPalo = manoFinal
            .filter(carta => carta.palo === paloDominante) // Filtramos solo las cartas del mismo palo
            .map(carta => carta.puntos); // Sacamos los valores de esas cartas
        if (valores.includes(14) && !valores.includes(1)) valores.push(1); // Añadimos el "AS" (1) para que cuente como carta baja si es necesario
        let valoresOrdenadosPalo = [...new Set(valoresMismoPalo)].sort((a, b) => a - b); // Ordenamos los valores de ese palo sin duplicados

        let tieneEscaleraDeColor = false;
        let cartasEscaleraDeColor = []; // Almacenaremos las cartas de la escalera de color
        contaNumConsecutivos = 1;
        for (let i = 1; i < valoresOrdenadosPalo.length && !tieneEscaleraDeColor; i++) {
            // Buscamos la secuencia de cartas consecutivas dentro del mismo palo
            if (valoresOrdenadosPalo[i] === valoresOrdenadosPalo[i - 1] + 1) {
                contaNumConsecutivos++;
                cartasEscaleraDeColor.push(valoresOrdenadosPalo[i - 1]); // Añadimos la carta a la secuencia
                if (contaNumConsecutivos >= 5) {
                    tieneEscaleraDeColor = true; // Si encontramos 5 cartas consecutivas, tenemos escalera de color
                    cartasEscaleraDeColor.push(valoresOrdenadosPalo[i]); // Añadimos la última carta de la escalera de color
                }
            } else {
                contaNumConsecutivos = 1; // Reiniciamos la secuencia si no son consecutivas
                cartasEscaleraDeColor = []; // Reiniciamos las cartas de la escalera de color
            }
        }

        // Comprobamos si es una escalera real (escala de color con 10, J, Q, K, A)
        if (tieneEscaleraDeColor) {
            if ([10, 11, 12, 13, 14].every(valor => valoresMismoPalo.includes(valor))) {
                // Si las cartas del palo incluyen 10, J, Q, K, A, es escalera real
                let sumaPuntos = cartasEscaleraDeColor.reduce((acc, valor) => acc + valor, 0); // Sumamos los puntos de las cartas de la escalera real
                return { tipo: "Escalera Real", puntos: 100, sumaPuntos }; // Devolvemos el tipo de mano y la suma de los puntos
            }
            let sumaPuntos = cartasEscaleraDeColor.reduce((acc, valor) => acc + valor, 0); // Sumamos los puntos de la escalera de color
            return { tipo: "Escalera de Color", puntos: 75, sumaPuntos }; // Devolvemos el tipo de mano y la suma de los puntos
        }
    }

    // Comprobamos Poker, Full, Trio y Pareja (combinaciones de cartas con el mismo valor)
    let contadores = {};
    for (let i = 0; i < valores.length; i++) {
        contadores[valores[i]] = (contadores[valores[i]] || 0) + 1; // Contamos cuántas veces aparece cada valor
    }
    let frecuencias = Object.values(contadores); // Obtenemos las frecuencias de las cartas
    
    let tieneRepoker = frecuencias.includes(5); // Si hay 5 cartas del mismo valor, tenemos un repoker
    let tienePoker = frecuencias.includes(4); // Si hay 4 cartas del mismo valor, tenemos un poker
    let tieneFull = frecuencias.includes(3) && frecuencias.includes(2); // Si hay un trío y una pareja, tenemos un full
    let tieneTrio = frecuencias.includes(3); // Si hay 3 cartas del mismo valor, tenemos un trío
    let tienePareja = frecuencias.includes(2); // Si hay 2 cartas del mismo valor, tenemos una pareja

    if (tieneRepoker) {
        let sumaPuntos = Object.keys(contadores).reduce(
            (acc, valor) => contadores[valor] === 5 ? acc + Number(valor) * 5 : acc,
            0
        ); // Sumamos los puntos del poker (multiplicamos el valor por 4)
        return { tipo: "REPOKER", puntos: 60, sumaPuntos }; // Devolvemos el tipo de mano y la suma de los puntos
    }

    if (tienePoker) {
        let sumaPuntos = Object.keys(contadores).reduce(
            (acc, valor) => contadores[valor] === 4 ? acc + Number(valor) * 4 : acc,
            0
        ); // Sumamos los puntos del poker (multiplicamos el valor por 4)
        return { tipo: "POKER", puntos: 50, sumaPuntos }; // Devolvemos el tipo de mano y la suma de los puntos
    }

    if (tieneFull) {
        let sumaPuntos = Object.keys(contadores).reduce(
            (acc, valor) => contadores[valor] >= 2 ? acc + Number(valor) * contadores[valor] : acc,
            0
        ); // Sumamos los puntos del full (multiplicamos el valor por la frecuencia de cada carta)

        let puntosTrio = Object.keys(contadores).reduce(
            (acc, valor) => contadores[valor] === 3 ? acc + Number(valor) * 3 : acc,
            0
        ); // Sumamos únicamente los puntos del trío (valor multiplicado por 3)
        return { tipo: "FULL", puntos: 25, sumaPuntos, puntosTrio }; // Devolvemos el tipo de mano y la suma de los puntos
    }

    if (tieneColor) {
        let paloDominante = Object.keys(conteoPalos).find(palo => conteoPalos[palo] >= 5); // Buscamos el palo dominante
        let cartasColor = manoFinal.filter(carta => carta.palo === paloDominante); // Filtramos las cartas del palo dominante
        let sumaPuntos = cartasColor.reduce((acc, carta) => acc + carta.puntos, 0); // Sumamos los puntos de las cartas del color
        return { tipo: "COLOR", puntos: 20, sumaPuntos }; // Devolvemos el tipo de mano y la suma de los puntos
    }

    if (tieneEscalera) {
        let cartasJugadoras = manoFinal.filter(carta => cartasEscalera.includes(carta.puntos)); // Filtramos las cartas que forman la escalera
        let sumaPuntos = cartasJugadoras.reduce((acc, carta) => acc + carta.puntos, 0); // Sumamos los puntos de las cartas que forman la escalera
        return { tipo: "ESCALERA", puntos: 15, sumaPuntos }; // Devolvemos el tipo de mano y la suma de los puntos
    }

    if (tieneTrio) {
        let sumaPuntos = Object.keys(contadores).reduce(
            (acc, valor) => contadores[valor] === 3 ? acc + Number(valor) * 3 : acc, 0
        ); // Sumamos los puntos del trío (multiplicamos el valor por 3)
        return { tipo: "TRÍO", puntos: 10, sumaPuntos }; // Devolvemos el tipo de mano y la suma de los puntos
    }

    if (tienePareja) {
        let sumaPuntos = Object.keys(contadores).reduce(
            (acc, valor) => contadores[valor] === 2 ? acc + Number(valor) * 2 : acc, 0
        ); // Sumamos los puntos de la pareja (multiplicamos el valor por 2)
        let cartaAlta = mano.map(carta => carta.puntos);
        cartaAlta = Math.max(...cartaAlta); //Encontramos la carta alta dentro de la mano en caso de empate
        return { tipo: "PAREJA", puntos: 5, sumaPuntos, cartaAlta }; // Devolvemos el tipo de mano y la suma de los puntos
    }

    // Si no tiene ninguna de las combinaciones anteriores, es "Carta Alta"
    let cartaAlta = Math.max(...valores); // La carta más alta es la que tiene más valor
    let sumaPuntos = cartaAlta; // La suma de puntos es solo la carta más alta
    return { tipo: "CARTA ALTA", puntos: 1, sumaPuntos }; // Devolvemos el tipo de mano y la suma de los puntos
};


const ManoGanadora = () => 
{
    let manoJugador = evaluarMano(MANO_JUGADOR);
    let manoMaquina = evaluarMano(MANO_MAQUINA);

    let ganador = document.createElement("h4");
    ganador.setAttribute("id", "textoGanador");
    

    console.log(manoJugador);
    console.log(manoMaquina);

    // Caso especial: Ambos tienen Full
    if (manoJugador.tipo === "FULL" && manoMaquina.tipo === "FULL") {
        if (manoJugador.puntosTrio > manoMaquina.puntosTrio) {
            ganador.textContent = "GANA JUGADOR CON "+manoJugador.tipo;
        } else if (manoJugador.puntosTrio < manoMaquina.puntosTrio) {
            ganador.textContent = "GANA LA MÁQUINA CON "+manoMaquina.tipo;
        } else {
            ganador.textContent = "EMPATE A "+manoJugador.tipo;
        }
        document.getElementById("ganador").appendChild(ganador);
        return;
    }

    // Caso general: Ambos tienen el mismo tipo de mano
    if (manoJugador.tipo === manoMaquina.tipo) {
        if (manoJugador.sumaPuntos > manoMaquina.sumaPuntos) {
            ganador.textContent = "GANA JUGADOR CON "+manoJugador.tipo;
        } else if (manoJugador.sumaPuntos < manoMaquina.sumaPuntos) {
            ganador.textContent = "GANA LA MÁQUINA CON "+manoMaquina.tipo;
        } else {
            ganador.textContent = "EMPATE A "+manoJugador.tipo;
        }
        document.getElementById("ganador").appendChild(ganador);
        return;
    }

    // Caso general: Diferentes tipos de manos
    if (manoJugador.puntos > manoMaquina.puntos) {
        ganador.textContent = "GANA JUGADOR CON "+manoJugador.tipo;
    } else if(manoJugador.puntos < manoMaquina.puntos) {
        ganador.textContent = "GANA LA MÁQUINA CON "+manoMaquina.tipo;
    } else {
        ganador.textContent = "EMPATE A "+manoJugador.tipo;
    }
    document.getElementById("ganador").appendChild(ganador);
}

// Función para mostrar las cartas en el HTML
const mostrarCartas = () => {
    // Limpiar las cartas actuales de los contenedores
    document.getElementById('Jugador').innerHTML = '';
    document.getElementById('Maquina').innerHTML = '';
    document.getElementById('Mesa').innerHTML = '';

    // Mostrar las cartas del Jugador
    MANO_JUGADOR.forEach(carta => {
        let cartaElemento = document.createElement('div');
        cartaElemento.classList.add('card');
        cartaElemento.innerHTML = carta.imagenFrontal;
        document.getElementById('Jugador').appendChild(cartaElemento);
    });

    // Mostrar las cartas de la Máquina
    MANO_MAQUINA.forEach((carta, i) => {
        let cartaElemento = document.createElement('div');
        cartaElemento.classList.add('card');
        cartaElemento.setAttribute("id", "maquina"+i.toString())
        cartaElemento.innerHTML = carta.imagenTrasera;
        document.getElementById('Maquina').appendChild(cartaElemento);
    });

    // Mostrar las cartas en la Mesa
    MANO_MESA.forEach(carta => {
        let cartaElemento = document.createElement('div');
        cartaElemento.classList.add('card');
        cartaElemento.innerHTML = carta.imagenFrontal;
        document.getElementById('Mesa').appendChild(cartaElemento);
    });
}

const Apostar = () =>
{
    RONDA++;
    LanzarCartasMesa()
    mostrarCartas()
    if(RONDA > 3){
        FinDelJuego();
    }

}

const FinDelJuego = () =>
{
    ManoGanadora();

    //Cambiamos el dorsal de las cartas de la maquina a las cartas frontales visibles
    for(let i=0; i<=1; i++){
        document.getElementById('maquina'+i.toString()).remove();
    }

    //
    MANO_MAQUINA.forEach((carta, i) => {
        let cartaElemento = document.createElement('div');
        cartaElemento.classList.add('card');
        cartaElemento.setAttribute("id", "frontalMaquina"+i);
        cartaElemento.innerHTML = carta.imagenFrontal;
        document.getElementById('Maquina').appendChild(cartaElemento);
    });


    if(document.getElementById("apostar"))
    {
        document.getElementById("apostar").remove();
    }

    if(FICHAS_JUGADOR < 30)
    {
        //document.getElementById("textoGanador").innerHTML = "MAQUINA HA GANADO";
    }

    if(FICHAS_MAQUINA < 30)
    {
        //document.getElementById("textoGanador").innerHTML = "JUGADOR HA GANADO";
    }

    if(FICHAS_JUGADOR && FICHAS_MAQUINA > 30)
    {
        let BotonApostar = document.createElement('button');
            BotonApostar.setAttribute('id', 'Siguiente');
            BotonApostar.setAttribute('onclick', 'SiguienteRonda()');
            BotonApostar.innerHTML = "Siguiente Ronda"
            document.getElementById("botones").appendChild(BotonApostar);
    }

}

const SiguienteRonda = () => {
    alert("Pendiente de implementar...");
}

const jugar = () => {

    if(JUGAR){
        
        // Crear y desordenar cartas
        CrearCartas();
        DesordenarCartas();

        // Repartir cartas
        RepartirCartas();

        // Lanzar cartas en la mesa
        LanzarCartasMesa();

        // Mostrar las cartas en el HTML
        mostrarCartas();

        /* Gestion botones */

        document.getElementById("jugar").innerText = "Salir Partida"; // Boton jugar/salir

        // Crear boton de apostar
        let BotonApostar = document.createElement('button');
        BotonApostar.setAttribute('id', 'apostar');
        BotonApostar.setAttribute('onclick', 'Apostar()');
        BotonApostar.innerHTML = "Siguiente"; // Hasta añadir funcionalidad de apostar, lo llamaremos siguiente.
        document.getElementById("botones").appendChild(BotonApostar);
        
        JUGAR = false;

    } else {

        if(document.getElementById("Siguiente"))
        {
            document.getElementById("Siguiente").remove();
        } else {
            document.getElementById("apostar").remove();
        }

        if(document.getElementById("textoGanador")){
            document.getElementById("textoGanador").remove();
        }

        FICHAS_JUGADOR = 300;
        FICHAS_MAQUINA = 300;
        CIEGA = 25;
        RONDA = 0;
        MAZO = [];
        MAZO_PROV = [];
        MANO_JUGADOR = [];
        MANO_MAQUINA = [];
        MANO_MESA = [];
        TURNO = true;
        JUGAR = true;
        APUESTA = 0;
        RETIRO_JUGADOR = false;
        RETIRO_MAQUINA = false;
        document.getElementById("jugar").innerText = "Jugar"
        
    }
    
};




