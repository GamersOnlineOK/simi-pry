#include <WiFi.h>
#include <HTTPClient.h>
#include <PZEM004Tv30.h>
#include <HardwareSerial.h>

// Configuración WiFi
const char* ssid = "TU_SSID";       // Nombre de tu red WiFi
const char* password = "TU_PASSWORD"; // Contraseña WiFi

// URL de la API
const char* apiUrl = "http://simi-pry.com.ar:3000/api/datos";

// Configuración PZEM
#define PZEM_RX_PIN 3  // RX0
#define PZEM_TX_PIN 1  // TX0

HardwareSerial pzemSerial(0);
PZEM004Tv30 pzem(pzemSerial, PZEM_RX_PIN, PZEM_TX_PIN);

// Variables de medición
float voltage, current, power, energy, frequency, pf;

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Iniciar comunicación con PZEM
  pzemSerial.begin(9600, SERIAL_8N1, PZEM_RX_PIN, PZEM_TX_PIN);
  Serial.println("Iniciando lectura del PZEM004Tv30");

  // Conectar a WiFi
  WiFi.begin(ssid, password);
  Serial.print("Conectando a WiFi...");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nConectado a WiFi!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Leer mediciones del PZEM
  voltage = isnan(pzem.voltage()) ? 0 : pzem.voltage();
  current = isnan(pzem.current()) ? 0 : pzem.current();
  power = isnan(pzem.power()) ? 0 : pzem.power();
  energy = isnan(pzem.energy()) ? 0 : pzem.energy();
  frequency = isnan(pzem.frequency()) ? 0 : pzem.frequency();
  pf = isnan(pzem.pf()) ? 0 : pzem.pf();

  // Mostrar en consola
  Serial.println("--- Medición PZEM ---");
  Serial.print("Voltaje: "); Serial.print(voltage); Serial.println(" V");
  Serial.print("Corriente: "); Serial.print(current); Serial.println(" A");
  Serial.print("Potencia: "); Serial.print(power); Serial.println(" W");
  Serial.print("Energía: "); Serial.print(energy); Serial.println(" kWh");
  Serial.print("Frecuencia: "); Serial.print(frequency); Serial.println(" Hz");
  Serial.print("Factor Potencia: "); Serial.println(pf);

  // Enviar datos por POST
  enviarPostRequest();

  delay(2000); // Esperar antes de la próxima lectura
}

void enviarPostRequest() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    http.begin(apiUrl);
    http.addHeader("Content-Type", "application/json");

    // Crear string JSON con tus variables medidas
    String postData = "{";
    postData += "\"Voltage\":" + String(voltage,2) + ",";
    postData += "\"Current\":" + String(current,2) + ",";
    postData += "\"Power\":" + String(power,2) + ",";
    postData += "\"Energy\":" + String(energy,2) + ",";
    postData += "\"Frequency\":" + String(frequency,2) + ",";
    postData += "\"PowerFactor\":" + String(pf,2);
    postData += "}";

    // Imprimir JSON para verificación
    Serial.println("Enviando JSON:");
    Serial.println(postData);

    int httpResponseCode = http.POST(postData);

    if (httpResponseCode > 0) {
      Serial.print("Código de respuesta HTTP: ");
      Serial.println(httpResponseCode);
      String response = http.getString();
      Serial.println("Respuesta del servidor:");
      Serial.println(response);
    } else {
      Serial.print("Error en la solicitud: ");
      Serial.println(httpResponseCode);
      Serial.println(http.errorToString(httpResponseCode).c_str());
    }

    http.end();
  } else {
    Serial.println("WiFi desconectado");
  }
}