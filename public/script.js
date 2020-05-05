document.addEventListener('DOMContentLoaded', () => {

    const socket = io.connect();

    const botaoLimpar = document.querySelector('#btnLimpar');

    const pincel = {
        ativo: false,
        movimento: false,
        pos: { x: 0, y: 0 },
        posAnterior: null
    }


    const tela = document.querySelector('#tela');
    const contexto = tela.getContext('2d');
    tela.width = 700;
    tela.height = 500;

    contexto.lineWidth = 5;
    contexto.strokeStyle = "red";

    const desenharLinha = (linha) => {

        contexto.beginPath();
        contexto.moveTo(linha.posAnterior.x, linha.posAnterior.y);
        contexto.lineTo(linha.pos.x, linha.pos.y);
        contexto.stroke();

    }

    tela.onmousedown = (evento) => { pincel.ativo = true };
    tela.onmouseup = (evento) => { pincel.ativo = false };

    tela.onmousemove = (evento) => {
        pincel.pos.x = evento.clientX;
        pincel.pos.y = evento.clientY;
        pincel.movimento = true;
    }

    socket.on('desenhar', (linha) => {
        desenharLinha(linha);
    })

    botaoLimpar.onclick = () => {
        socket.emit('limpar', { pos: 0, posAnterior: 0 });
        pincel.movimento = false;
    }

    socket.on('limpar',(linha)=>{
        contexto.clearRect(0, 0, tela.width , tela.height);
        pincel.ativo = false;
        pincel.movimento = false;
        pincel.pos = linha;
        pincel.posAnterior = null;
    })

    const ciclo = () => {
        if (pincel.ativo && pincel.movimento && pincel.posAnterior) {
            socket.emit('desenhar', { pos: pincel.pos, posAnterior: pincel.posAnterior })
            //desenharLinha({ pos: pincel.pos, posAnterior: pincel.posAnterior });
            pincel.movimento = false;
        }
        pincel.posAnterior = { x: pincel.pos.x, y: pincel.pos.y };

        setTimeout(ciclo, 10);
    }


    ciclo();

});