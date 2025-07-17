#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <PZEM004Tv30.h>

// 🔧 Reemplaza con tus credenciales WiFi
#define WIFI_SSID "TeleCentro-3c41"
#define WIFI_PASSWORD "EGZATKFMN5EW"

// 🔥 Reemplaza con tu configuración de Firebase
#define API_KEY "AIzaSyB6ez2tHn1EnZKm1rsZMVy17agEEi8DKS0"
#define DATABASE_URL "https://simi-base-default-rtdb.firebaseio.com/"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

PZEM004Tv30 pzem(&Serial2, 16, 17); // RX=16, TX=17

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi conectado");

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  float voltage = 25;//pzem.voltage();
  float current = 65;//pzem.current();
  float power = 45;//pzem.power();
  float energy = 10;//pzem.energy();
  float cost = energy * 150; // estimativo

  Firebase.RTDB.setFloat(&fbdo, "/Emmother/voltaje", isnan(voltage) ? 0 : voltage);
  Firebase.RTDB.setFloat(&fbdo, "/Emmother/corriente", isnan(current) ? 0 : current);
  Firebase.RTDB.setFloat(&fbdo, "/Emmother/potencia", isnan(power) ? 0 : power);
  Firebase.RTDB.setFloat(&fbdo, "/Emmother/energia", isnan(energy) ? 0 : energy);
  Firebase.RTDB.setFloat(&fbdo, "/Emmother/costo", cost);

  delay(3000); // cada 3 segundos
}