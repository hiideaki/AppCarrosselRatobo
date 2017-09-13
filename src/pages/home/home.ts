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

  constructor(public navCtrl: NavController, public bluetoothSerial: BluetoothSerial) {
    this.speed = 0;
    this.ledc = [3, 3, 3];
    this.macAddress = "00:00:00:00:00:00";
    this.bluetoothSerial.enable();
  }

  public sendByte() {
    var byte = new Uint8Array(1);

  }



}
