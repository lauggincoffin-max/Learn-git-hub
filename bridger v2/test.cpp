// Pustaka untuk mengendalikan layar LCD 16x2 melalui komunikasi I2C
#include <Adafruit_LiquidCrystal.h>

// Pustaka untuk mengendalikan modul tampilan 7-segment tambahan
#include "Adafruit_LEDBackpack.h"

// Variabel untuk menyimpan nilai hasil pembacaan sensor gas
int gas_sensor = 0;

int unnamed = 0;

int i = 0;

// Membuat objek LCD dengan alamat I2C 0
Adafruit_LiquidCrystal lcd_1(0);

// Membuat objek untuk modul display 7-segment
Adafruit_7segment led_display1 = Adafruit_7segment();

void setup()
{
  // Pin A0 diatur sebagai input untuk membaca sinyal analog dari sensor gas
  pinMode(A0, INPUT);
  // Memulai komunikasi serial dengan baud rate 9600 untuk memantau nilai sensor
  Serial.begin(9600);
  // Menginisialisasi layar LCD berukuran 16 kolom x 2 baris
  lcd_1.begin(16, 2);
  // Pin 7 diatur sebagai output untuk LED status aman (hijau)
  pinMode(7, OUTPUT);
  // Pin 6 diatur sebagai output untuk LED status bahaya (merah)
  pinMode(6, OUTPUT);
  // Pin 5 diatur sebagai output untuk LED status waspada (oranye)
  pinMode(5, OUTPUT);
  // Pin 11 diatur sebagai output untuk buzzer
  pinMode(11, OUTPUT);
  pinMode(11, OUTPUT);
  pinMode(0, OUTPUT);
  // Menginisialisasi modul display 7-segment dengan alamat I2C 112 (0x70)
  led_display1.begin(112);
  pinMode(8, OUTPUT);
}

void loop()
{
  // Membaca nilai sensor gas dari pin A0 dan menyimpannya ke variabel gas_sensor
  gas_sensor = analogRead(A0);
  // Menampilkan nilai sensor pada Serial Monitor untuk keperluan pemantauan/kalibrasi
  Serial.println(gas_sensor);
  // Menampilkan nilai sensor pada layar LCD baris pertama
  lcd_1.setCursor(0, 0);
  lcd_1.print("Jarak gas: ");
  lcd_1.print(gas_sensor);
  // Kondisi WASPADA: nilai sensor berada di antara 350 (termasuk) hingga sebelum 600
  if (gas_sensor >= 350 && gas_sensor < 600) {
    digitalWrite(7, LOW);
    digitalWrite(6, LOW);
    // LED oranye (pin 5) dinyalakan sebagai indikator waspada
    digitalWrite(5, HIGH);
    // Buzzer (pin 11) diaktifkan
    digitalWrite(11, HIGH);
    tone(11, 294, 100); // bunyi nada D4 (294 Hz)
    tone(0, 523, 100); // bunyi nada C5 (523 Hz)
    tone(0, 932, 100); // bunyi nada A#5 (932 Hz)
    tone(0, 523, 100); // bunyi nada C5 (523 Hz)
    tone(0, 294, 100); // bunyi nada D4 (294 Hz)
    led_display1.clear();
    led_display1.writeDisplay();
    // LCD baris kedua menampilkan pesan peringatan tahap awal
    lcd_1.setCursor(0, 1);
    lcd_1.print("Gas Get Closer!!");
  }
  // Kondisi BAHAYA: nilai sensor 600 ke atas
  if (gas_sensor >= 600) {
    digitalWrite(7, LOW);
    // LED merah (pin 6) dinyalakan sebagai indikator bahaya
    digitalWrite(6, HIGH);
    digitalWrite(5, LOW);
    // Buzzer (pin 11) tetap diaktifkan dengan nada peringatan
    digitalWrite(11, HIGH);
    tone(11, 176967447100, 100); // nilai frekuensi tidak valid (di luar jangkauan nada yang wajar)
    tone(11, 1.992476322042289e+26, 100); // nilai frekuensi tidak valid (di luar jangkauan nada yang wajar)
    tone(11, 57079043007393, 100); // nilai frekuensi tidak valid (di luar jangkauan nada yang wajar)
    led_display1.clear();
    led_display1.writeDisplay();
    // LCD baris kedua menampilkan pesan bahwa asap telah terdeteksi
    lcd_1.setCursor(0, 1);
    lcd_1.print("Gas Is Detected!!");
    tone(11, 5938042169935402000, 100); // nilai frekuensi tidak valid (di luar jangkauan nada yang wajar)
    digitalWrite(8, LOW);
  }
  // Kondisi AMAN: nilai sensor di bawah 350
  if (gas_sensor < 350) {
    // LED hijau (pin 7) dinyalakan sebagai indikator aman
    digitalWrite(7, HIGH);
    digitalWrite(6, LOW);
    digitalWrite(5, LOW);
    // Buzzer dimatikan karena tidak ada indikasi bahaya
    digitalWrite(11, LOW);
    led_display1.clear();
    led_display1.writeDisplay();
    // LCD baris kedua menampilkan status aman
    lcd_1.setCursor(0, 1);
    lcd_1.print("Gas Isn't Detected");
  }
  // Jeda singkat sebelum pembacaan sensor diulang kembali
  delay(10); // jeda kecil untuk meningkatkan performa simulasi
}