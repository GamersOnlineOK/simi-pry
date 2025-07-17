#include <WiFi.h>
#include <HTTPClient.h>

// Configuración WiFi
const char* ssid = "TU_SSID";       // Nombre de tu red WiFi
const char* password = "TU_PASSWORD"; // Contraseña WiFi

// URL de la API
const char* apiUrl = "http://simi-pry.com.ar:3000/api/datos";

void setup() {
  Serial.begin(115200);
  delay(1000);

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

  // Llamar a la función para enviar POST
  enviarPostRequest();
}

void loop() {
  // No hacemos nada en el loop
}

void enviarPostRequest() {
  // Verificar conexión WiFi
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    // Iniciar conexión HTTP
    http.begin(apiUrl);  // Especificar URL
    http.addHeader("Content-Type", "application/json");  // Cabecera para JSON

    // Datos a enviar (formato JSON)
    String postData = "{\"Voltage\":220,\"Energia\":10}"; //aca tienen que poner las Variables que corresponden a los datos en van a enviar 

    // Enviar solicitud POST
    int httpResponseCode = http.POST(postData);

    // Verificar respuesta
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

    // Liberar recursos
    http.end();
  } else {
    Serial.println("WiFi desconectado");
  }
}