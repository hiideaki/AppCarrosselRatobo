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
  private dir: number[];

  constructor(public navCtrl: NavController, public bluetoothSerial: BluetoothSerial) {
    this.speed = 0;
    this.ledc = [3, 3, 3];
    this.dir = [1, 1];
    this.macAddress = "00:21:13:00:4F:0D";
    this.byte = new Uint8Array(1);
    this.bluetoothSerial.enable();
  }

  public sendByte() {
    this.bluetoothSerial.write(this.byte).then((sucess)=>{},
      (err)=>{});
  }

  public mudaVelocidade(i: number) {
    if(i == 1) {
      this.dir[0] = 0;
      this.dir[1] = 1;
    } else if(i == 2) {
      this.dir[0] = 1;
      this.dir[1] = 0;
    } else if(i == 3) {
      this.dir[0] = 1;
      this.dir[1] = 1;
    }
    this.byte[0] = 2 * 64 + (1 + this.speed * this.dir[0]) * 8 + (1 + this.speed * this.dir[1]) * 1;
    this.sendByte();
  }

  public connectModule(){
    this.bluetoothSerial.list().then((con)=>{
      this.bluetoothSerial.connect(this.macAddress).subscribe();
    });
  }


  //Altera e envia a cor do LED
  public mudaLed(i: number) {
    //(10) + (R) + (G) + (B)
    this.byte[0] = 1 * 64 + this.ledc[0] * 16 + this.ledc[1] * 4 + this.ledc[2];
    this.sendByte();
  }
}
