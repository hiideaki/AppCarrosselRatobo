import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { AlertController } from 'ionic-angular';
import * as nipplejs from 'nipplejs';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
    private speed: number;
    private ledc: number[];
    private macAddress: string;
    private dispCon;
    private byte;
    private joystick;
    private drive;
    private leftM;
    private rightM;

    constructor(public navCtrl: NavController, public bluetoothSerial: BluetoothSerial, private alertCtrl: AlertController) {
        this.speed = 0;
        this.ledc = [3, 3, 3];
        this.macAddress = "";
        this.byte = new Uint8Array(18);
        this.bluetoothSerial.enable();
    }

/*  Ao terminar de carregar a página cria o joystick e o associa com suas devidas funções   */
/*  A variável 'options' se refere aos parâmetros para a criação do joystic, que no caso será estático  */
    ionViewDidLoad() {
        var parent = this;
        var options = {
            zone: document.querySelector('.zone.static'),
            mode: 'static',
            position: {
                left: '50%',
                top: '50%'
            },
            color: 'blue',
            size: 200
        };
/*  Dá um delay na criação do joystick de fato para posicioná-lo corretamente na interface  */
        setTimeout(function() {
            parent.joystick = nipplejs.create(options);
            parent.bindNipple();    
        }, 500);
    }

/*  Funções associadas ao joystick  */
    public bindNipple() {
        var parent = this;
        this.joystick.on('end', function(evt, data) {
            parent.textAppend('Tentando parar motor!');
/*  Ao soltá-lo chama a função paraMotor()  */
            parent.paraMotor(); 
        }).on('move', function(evt, data) {             
            parent.textAppend('Mexendo!');
/*  Quando é movimentado, chama a função montaByte(), passando como parâmetros o ângulo e a distância do centro */
            parent.montaByte(data.angle.degree, data.distance);
        });
    }

/*  Função associada ao botão de conexão bluetooth  */
/*  Exibirá uma lista de dispositivos disponíveis e se conecta ao escolhido */
    presentConfirm() {
        var options = {
            title: 'Bluetooth',
            inputs: []
        }
        
        this.bluetoothSerial.list().then((devices)=>{
            for(var i = 0; i < devices.length; i++) {
                options.inputs.push({
                    name: 'options',
                    value: devices[i].id,
                    label: devices[i].name + ' [' + devices[i].id + ']',
                    type: 'radio',
                    checked: (devices[i].id == this.macAddress),
                    handler: dados => {
                        this.dispCon = dados.label;
                        this.macAddress = dados.value;
                        this.bluetoothSerial.connect(this.macAddress).subscribe();
                        alert.dismiss();
                    }
                });
            }
            
            var alert = this.alertCtrl.create(options);
            alert.present();
            
        }, (error)=>{this.alertCtrl.create({title:'Não há dispositivos pareados!'}).present()});
        
    }
    
    
/*  Monta o byte de acordo com o ângulo e distância do centro recebidas como parâmetro  */
/* Byte:
0 - reverse
1 - reverse
2 - park
3 - drive
4 - drive
5 - drive
6 - drive
7 - nothing
*/
    public montaByte(angle, speed) {
        this.drive = Math.ceil(speed * 2 / 100);
        switch(true) {
            case angle > 22.5 && angle <= 67.5:
                this.leftM = (1 + this.drive) * 2;
                this.rightM = 1 + this.drive;
                break;
            case angle > 67.5 && angle <= 112.5:
                this.leftM = (1 + this.drive) * 2;
                this.rightM = (1 + this.drive) * 2;
                break;
            case angle > 112.5 && angle <= 157.5:
                this.leftM = 1 + this.drive;
                this.rightM = (1 + this.drive) * 2;
                break;
            case angle > 157.5 && angle <= 202.5:
                this.leftM = 0;
                this.rightM = 4;
                break;
            case angle > 202.5 && angle <= 247.5:
                this.leftM = 1;
                this.rightM = 0;
                break;
            case angle > 247.5 && angle <= 292.5:
                this.leftM = 0;
                this.rightM = 0;
                break;
            case angle > 292.5 && angle <= 337.5:
                this.leftM = 0;
                this.rightM = 1;
                break;
            case angle > 337.5 || angle <= 22.5:
                this.leftM = 4;
                this.rightM = 0;
                break;
        }
        this.byte[0] = 0 * 64 + this.leftM * 8 + this.rightM * 1;
        this.sendByte();
    }
    
/*  Função com fins de depuração apenas. Adiciona ao console o texto passado como parâmetro */
    public textAppend(texto) {
        var txt = document.createTextNode(texto + '\n')
        document.getElementById('console').appendChild(txt);
        document.getElementById('console').scrollTop = 999999;
    }

/*  Função com fins de depuração apenas. Converte um número decimal para seu formato binário equivalente    */
    public dec2bin(dec){
        return (dec >>> 0).toString(2);
    }

/*  Envia o byte ao dispositivo conectado pelo bluetooth    */
    public sendByte() {
        let c: string = String.fromCharCode(this.byte[0]);
        this.bluetoothSerial.write(c).then((success)=>{this.textAppend(this.byte[0])},
           (err)=>{this.textAppend('Deu ruim')});
    }
    
/*  Envia um byte comandando a parada do motor  */
    public paraMotor() {
        this.byte[0] = 0 * 64 + 2 * 8 + 2 * 1; // 00 010 010
        this.sendByte();
    }

/*  Não foi implementado no Arduino */
/*  Envia um byte comandando a mudança de cores do LED  */
/*
    public mudaLed(i: number) {
        //(10) + (R) + (G) + (B)
        this.byte[0] = 1 * 64 + this.ledc[0] * 16 + this.ledc[1] * 4 + this.ledc[2];
        this.sendByte();
    }
*/
}
