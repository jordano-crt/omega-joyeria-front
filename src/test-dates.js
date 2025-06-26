// Script de prueba para verificar el manejo de fechas
import { formatearFecha } from "./services/disponibilidadService";
import { getTodayDateString } from "./utils/dateUtils";

console.log("=== PRUEBA DE MANEJO DE FECHAS ===");

const today = new Date();
console.log("Fecha actual (objeto Date):", today);
console.log("Fecha actual (toString):", today.toString());

const todayString = getTodayDateString();
console.log("getTodayDateString():", todayString);

// Probar formatearFecha con diferentes inputs
const testDates = [
  "2025-06-24",
  "2025-06-25", 
  "2025-06-26",
  new Date("2025-06-24"),
  new Date("2025-06-25T00:00:00"),
  new Date("2025-06-25T10:00:00")
];

console.log("\n=== PRUEBA DE FORMATEAR FECHA ===");
testDates.forEach((date, index) => {
  console.log(`Test ${index + 1}:`, date, "=>", formatearFecha(date));
});

// Probar creación de fechas para input date
console.log("\n=== PRUEBA DE INPUT DATE ===");
const inputDate = new Date();
const inputValue = inputDate.toISOString().split('T')[0];
console.log("Valor para input date:", inputValue);
console.log("Comparar con getTodayDateString:", todayString);
console.log("¿Son iguales?", inputValue === todayString);
