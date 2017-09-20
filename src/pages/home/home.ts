import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private speed: number;
  private ledc: number[];
  private macAddress: string;
  private byte;

  constructor(public navCtrl: NavController, public bluetoothSerial: BluetoothSerial) {
    this.speed = 0;
    this.ledc = [3, 3, 3];
    this.macAddress = "00:00:00:00:00:00";
    this.byte = new Uint8Array(1);
    this.bluetoothSerial.enable();
  }

  public sendByte() {
    this.bluetoothSerial.write(this.byte).then((sucess)=>{},
      (err)=>{});
  }

  public mudaVelocidade() {
    console.log("VELOCIDADE = " +this.speed);
  }

  //Altera e envia a cor do LED
  public mudaLed(i: number) {
    console.log("LED[" + i + "] = " + this.ledc[i]);
    //(10) + (R) + (G) + (B)
    this.byte[0] = 2 * 64 + this.ledc[0] * 16 + this.ledc[1] * 4 + this.ledc[2];
    console.log(this.byte[0]);
    this.sendByte();
  }


}
