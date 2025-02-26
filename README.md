# Minor-Project_backend

// #include <WiFi.h>
#include <HTTPClient.h>
#include "MQ135.h"
#include <LiquidCrystal_I2C.h>
#include <WiFiClientSecure.h>

// Wi-Fi credentials
const char *ssid = "OnePlus 8"; // Replace with your WiFi SSID
const char *password = "12345678"; // Replace with your WiFi Password
const char \*serverUrl = "https://minor-project-backend-bom7.onrender.com"; // Backend endpoint

WiFiClientSecure client;
// LCD settings
int lcdColumns = 16;
int lcdRows = 2;
LiquidCrystal_I2C lcd(0x27, lcdColumns, lcdRows); // Initialize LCD with address 0x27

boolean connectToWiFi()
{
lcd.init();
lcd.backlight();

    // Connect to Wi-Fi
    lcd.setCursor(0, 0);
    lcd.print("Connecting...");
    Serial.print("Connecting to WiFi...");
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(1000);
        Serial.print(".");
    }
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Connected");
    delay(2000); // Display connection status for 2 seconds
    lcd.clear();
    return true;
    Serial.println("Connected!");

}

void fetchAndSendAirQualityData()
{
MQ135 gasSensor = MQ135(34);
float air_quality = gasSensor.getPPM();

    // Display AQI on LCD
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Air Quality:");
    lcd.setCursor(0, 1);
    lcd.print(air_quality);
    lcd.print(" PPM");
    delay(400);
    lcd.print("sending data to the server")
        client.setInsecure(); // Disables certificate validation

    if (client.connect(server, 443))
    { // HTTPS port
        String url = "GET /api/put-data?airQuality=" + String(air_quality, 2) + " HTTP/1.1";
        client.println(url);
        client.println("Host: pv-monitoring-system.onrender.com");
        client.println("Connection: close");
        lcd.print("data successfully sent to the server")
            client.println();

        while (client.connected())
        {
            String line = client.readStringUntil('\n');
            if (line == "\r")
            {
                break;
            }
        }

        while (client.available())
        {
            char c = client.read();
            Serial.write(c);
        }

        client.stop();
    }
    else
    {
        Serial.println("Connection to server failed!");
    }

    lcd.clear()

}

void setup()
{
Serial.begin(115200);
// Initialize LCD
if (connectToWiFi())
Serial.println("\nConnected to WiFi!");
}

void loop()
{

    fetchAndSendAirQualityData()
        delay(5000); // Wait for 15 seconds before sending the next reading

}
