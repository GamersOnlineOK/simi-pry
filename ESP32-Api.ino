#include <WiFi.h>
#include <HTTPClient.h>

// Configuración WiFi
const char* ssid = "TeleCentro-3c41";
const char* password = "EGZATKFMN5EW";

// Configuración API
const char* apiUrl = "http://simi-pry.com.ar:3000/api/datos";
const unsigned long apiTimeout = 5000; // 5 segundos timeout

// Configuración general
#define DELAY_BETWEEN_SENDS 3000 // 3 segundos entre envíos

// Valores fijos para demostración
const float VOLTAGE_FIXED = 220.5;    // 220.5V
const float CURRENT_FIXED = 15.3;     // 15.3A
const float POWER_FIXED = 3350.2;     // 3350.2W
const float ENERGY_FIXED = 42.7;      // 42.7kWh
const float POWER_FACTOR_FIXED = 0.95; // 0.95

void setup() {
  Serial.begin(115200);
  delay(1000); // Espera inicial para estabilización

  Serial.println("\nSistema de Monitoreo Energético - ESP32");
  Serial.println("Modo de demostración con valores fijos");
  
  // Conectar WiFi
  connectToWiFi();
}

void loop() {
  static unsigned long lastSendTime = 0;
  
  if(millis() - lastSendTime >= DELAY_BETWEEN_SENDS) {
    lastSendTime = millis();
    
    // Mostrar valores por serial
    printFixedValues();
    
    // Enviar a API
    if(!sendToAPI()) {
      handleAPIFailure();
    }
  }
  
  // Mantener conexión WiFi
  if(WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi desconectado, reconectando...");
    connectToWiFi();
  }
}

// Función para conexión WiFi
void connectToWiFi() {
  if(WiFi.status() == WL_CONNECTED) return;
  
  Serial.print("Conectando a WiFi");
  WiFi.disconnect(true);
  delay(100);
  WiFi.begin(ssid, password);
  
  unsigned long startTime = millis();
  while(WiFi.status() != WL_CONNECTED && millis() - startTime < 15000) {
    delay(500);
    Serial.print(".");
  }
  
  if(WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi conectado");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nFallo en conexión WiFi");
  }
}

// Mostrar valores fijos en el monitor serial
void printFixedValues() {
  Serial.println("\n--- Valores Fijos de Demostración ---");
  Serial.printf("Voltage: %.2f V\n", VOLTAGE_FIXED);
  Serial.printf("Corriente: %.2f A\n", CURRENT_FIXED);
  Serial.printf("Potencia: %.2f W\n", POWER_FIXED);
  Serial.printf("Energia: %.2f kWh\n", ENERGY_FIXED);
  Serial.printf("Factor Potencia: %.2f\n", POWER_FACTOR_FIXED);
}

// Enviar datos fijos a la API
bool sendToAPI() {
  if(WiFi.status() != WL_CONNECTED) {
    Serial.println("Error: Sin conexión WiFi");
    return false;
  }

  HTTPClient http;
  http.begin(apiUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(apiTimeout);

  // Crear JSON con los valores fijos
  String jsonData = "{";
  jsonData += "\"Voltage\":" + String(VOLTAGE_FIXED, 2) + ",";
  jsonData += "\"Corriente\":" + String(CURRENT_FIXED, 2) + ",";
  jsonData += "\"Potencia\":" + String(POWER_FIXED, 2) + ",";
  jsonData += "\"Energia\":" + String(ENERGY_FIXED, 2) + ",";
  jsonData += "\"FPotencia\":" + String(POWER_FACTOR_FIXED, 2);
  jsonData += "}";

  Serial.println("Enviando datos a API:");
  Serial.println(jsonData);

  int httpCode = http.POST(jsonData);
  bool success = false;

  if(httpCode > 0) {
    Serial.printf("Código HTTP: %d\n", httpCode);
    if(httpCode == HTTP_CODE_OK) {
      String response = http.getString();
      Serial.println("Respuesta del servidor:");
      Serial.println(response);
      success = true;
    }
  } else {
    Serial.printf("Error en HTTP: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
  return success;
}

// Manejo de fallos en la API
void handleAPIFailure() {
  Serial.println("Error al enviar datos a la API");
  // Podrías agregar aquí:
  // - Reintentos automáticos
  // - Almacenamiento local de los datos fallidos
  // - Notificación por LED
}