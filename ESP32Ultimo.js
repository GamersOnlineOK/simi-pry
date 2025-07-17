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
#define MAX_RETRIES 3  // Intentos máximos para lecturas/transmisión
#define WIFI_TIMEOUT 10000 // 10 segundos para conexión WiFi

HardwareSerial pzemSerial(0);
PZEM004Tv30 pzem(pzemSerial, PZEM_RX_PIN, PZEM_TX_PIN);

// Variables de medición
float voltage, current, power, energy, frequency, pf;

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Iniciar comunicación con PZEM
  pzemSerial.begin(9600, SERIAL_8N1, PZEM_RX_PIN, PZEM_TX_PIN);
  Serial.println("Iniciando comunicación con PZEM004Tv30");
  
  // Verificar conexión con PZEM
  if(!pzem.resetEnergy()){
    Serial.println("Error: No se pudo comunicar con el PZEM004T");
    // Aquí podrías agregar un manejo más robusto como reinicio o LED de error
  }

  // Conectar a WiFi con manejo de errores mejorado
  connectToWiFi();
}

void loop() {
  // Leer mediciones del PZEM con manejo de errores
  if(!readPZEMValues()){
    Serial.println("Error al leer valores del PZEM, reintentando...");
    delay(1000);
    return; // Saltar este ciclo si hay error
  }

  // Mostrar en consola
  printMeasurements();

  // Enviar datos por POST con reintentos
  if(!sendDataToAPI()){
    Serial.println("Error al enviar datos a la API");
    // Podrías agregar aquí lógica para almacenar localmente los datos fallidos
  }

  delay(2000); // Esperar antes de la próxima lectura
}

// Función mejorada para conectar a WiFi
void connectToWiFi() {
  Serial.print("Conectando a WiFi...");
  WiFi.begin(ssid, password);
  
  unsigned long startAttemptTime = millis();
  
  while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < WIFI_TIMEOUT) {
    delay(500);
    Serial.print(".");
  }

  if(WiFi.status() != WL_CONNECTED) {
    Serial.println("\nFallo en la conexión WiFi!");
    Serial.println("Verifique credenciales y disponibilidad de la red");
    // Aquí podrías implementar un reinicio controlado después de varios intentos
    return;
  }
  
  Serial.println("\nConectado a WiFi!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

// Función para leer valores del PZEM con manejo de errores
bool readPZEMValues() {
  for(int i = 0; i < MAX_RETRIES; i++) {
    voltage = 25;//pzem.voltage();
    current = 25;//pzem.current();
    power = 25;//pzem.power();
    energy = 25;//pzem.energy();
    frequency = 25;//pzem.frequency();
    pf = 25;//pzem.pf();

    // Verificar si algún valor es NaN (no numérico)
    if(!isnan(voltage) && !isnan(current) && !isnan(power) && 
       !isnan(energy) && !isnan(frequency) && !isnan(pf)) {
      return true; // Lectura exitosa
    }
    
    delay(200); // Pequeña espera antes de reintentar
  }
  
  // Si llegamos aquí, fallaron todos los intentos
  voltage = current = power = energy = frequency = pf = 0;
  return false;
}

// Función para mostrar mediciones
void printMeasurements() {
  Serial.println("\n--- Medición PZEM ---");
  Serial.printf("Voltaje: %.2f V\n", voltage);
  Serial.printf("Corriente: %.2f A\n", current);
  Serial.printf("Potencia: %.2f W\n", power);
  Serial.printf("Energía: %.2f kWh\n", energy);
  Serial.printf("Frecuencia: %.2f Hz\n", frequency);
  Serial.printf("Factor Potencia: %.2f\n", pf);
}

// Función mejorada para enviar datos a la API
bool sendDataToAPI() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi desconectado, intentando reconectar...");
    connectToWiFi();
    return false;
  }

  HTTPClient http;
  bool success = false;
  
  for(int i = 0; i < MAX_RETRIES; i++) {
    http.begin(apiUrl);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(5000); // Timeout de 5 segundos

    // Crear JSON con los datos
    String postData = StringFormat(
      "{\"Voltage\":%.2f,\"Current\":%.2f,\"Power\":%.2f,\"Energy\":%.2f,\"Frequency\":%.2f,\"PowerFactor\":%.2f}",
      voltage, current, power, energy, frequency, pf
    );

    Serial.println("Enviando datos a la API:");
    Serial.println(postData);

    int httpResponseCode = http.POST(postData);

    if (httpResponseCode > 0) {
      Serial.printf("Código HTTP: %d\n", httpResponseCode);
      if(httpResponseCode == HTTP_CODE_OK) {
        String response = http.getString();
        Serial.println("Respuesta del servidor:");
        Serial.println(response);
        success = true;
        break; // Salir del bucle si fue exitoso
      }
    } else {
      Serial.printf("Intento %d fallido: %s\n", i+1, http.errorToString(httpResponseCode).c_str());
    }

    http.end();
    delay(1000); // Espera antes de reintentar
  }

  return success;
}

// Función auxiliar para formatear strings (evita concatenación costosa)
String StringFormat(const char* format, ...) {
  char buffer[256];
  va_list args;
  va_start(args, format);
  vsnprintf(buffer, sizeof(buffer), format, args);
  va_end(args);
  return String(buffer);
}