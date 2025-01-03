const fs = require("fs");
const xlsx = require("xlsx");

// Read the JSON file
const jsonData = JSON.parse(fs.readFileSync("students.json", "utf8"));

// Convert JSON to a worksheet
const worksheet = xlsx.utils.json_to_sheet(jsonData);

// Create a new workbook and append the worksheet
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");

// Write the workbook to a file
const outputFilePath = "output.xlsx";
xlsx.writeFile(workbook, outputFilePath);

console.log(`Excel file generated successfully at ${outputFilePath}`);
