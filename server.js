require("dotenv").config();
const express = require("express");
const fs = require("fs");
const xlsx = require("xlsx");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const session = require("express-session");
const QUESTIONS_FILE = path.join(
  __dirname,
  "public",
  "quiz app",
  "questions.json"
);

app.use(express.json()); // To parse JSON payloads
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded payloads
app.use(
  session({
    secret: "secureSecretKey", // Replace with your own secret
    resave: false,
    saveUninitialized: true,
  })
);
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

// Serve the  add new question file
app.get("/admin/addnewque.html", (req, res) => {
  if (req.session.isAuthenticated) {
    res.sendFile(path.join(__dirname, "admin", "addnewque.html"));
  } else {
    res
      .status(403)
      .send("<h1>Access Denied</h1><p>Please Admin log in first.</p>");
  }
});

// Serve the admin panel file
// app.get("/admin", (req, res) => {
//   res.sendFile(path.join(__dirname, "admin", "admin.html"));
// });

// Serve the main HTML file at the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Serve the student form file at the
app.get("/admin/student.html", (req, res) => {
  if (req.session.isAuthenticated) {
    res.sendFile(path.join(__dirname, "admin", "student.html"));
    // res.sendFile(path.join(__dirname, "public", "student.html"));
  } else {
    res
      .status(403)
      .send("<h1>Access Denied</h1><p>Please Admin log in first.</p>");
  }
});

// login
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "api", "login.html"));
});

// Route to generate and download Excel file
app.get("/download-excel", (req, res) => {
  try {
    // Securely read the JSON file
    const jsonFilePath = path.join(__dirname, "admin", "students.json");
    // console.log("JSON File Path:", jsonFilePath);

    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));
    console.log("JSON Data Read Successfully:");

    // Convert JSON to a worksheet
    const worksheet = xlsx.utils.json_to_sheet(jsonData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Write the workbook to a temporary file
    const outputFilePath = path.join(__dirname, "admin", "students.xlsx");
    // console.log("Output File Path:", outputFilePath);

    xlsx.writeFile(workbook, outputFilePath);
    console.log("Excel File Written Successfully");

    // Send the file for download
    res.download(outputFilePath, "students.xlsx", (err) => {
      if (err) {
        console.error("Error Sending File:", err);
        res.status(500).send("Error generating Excel file.");
      } else {
        // Delete the temporary file
        fs.unlinkSync(outputFilePath);
        console.log("Temporary File Deleted");
      }
    });
  } catch (error) {
    console.error("Error in /download-excel Route:", error);
    res.status(500).send("Failed to generate Excel file.");
  }
});

// Load admin credentials from JSON file
const adminCredentialsPath = path.join(
  __dirname,
  "admin",
  "adminCredentials.json"
);
let adminCredentials;

try {
  const data = fs.readFileSync(adminCredentialsPath, "utf8");
  adminCredentials = JSON.parse(data);
} catch (err) {
  console.error("Error reading admin credentials file:", err);
  process.exit(1); // Exit the application if credentials cannot be loaded
}

// console.log("Admin credentials loaded:", adminCredentials);

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(
  session({
    secret: "secureSecretKey", // Replace with your own secure key
    resave: false,
    saveUninitialized: true,
  })
);

// Store data to student_data.json file
app.post("/submit", (req, res) => {
  const studentData = req.body;
  const filePath = path.join(__dirname, "admin", "students.json");

  // Ensure the file exists or create it if it doesn't
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
  }

  // Read existing data, append new student, and save to file
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).send("Error reading file");
    }

    let students = [];
    try {
      if (data) {
        students = JSON.parse(data);
      }
    } catch (parseErr) {
      console.error("Error parsing JSON:", parseErr);
      return res.status(500).send("Error parsing JSON data");
    }

    students.push(studentData);

    fs.writeFile(filePath, JSON.stringify(students, null, 2), (err) => {
      if (err) {
        console.error("Error writing file:", err);
        return res.status(500).send("Error writing file");
      }
      res.status(200).send("Student data saved successfully");
    });
  });
});

// Store data to questions.json file
app.post("/add-question", (req, res) => {
  const { question, options, answer } = req.body;

  if (
    !question ||
    !options ||
    options.length !== 4 ||
    !answer ||
    answer < 1 ||
    answer > 4
  ) {
    return res.status(400).send("Invalid data format.");
  }

  const newQuestion = { question, options, answer };

  fs.readFile(QUESTIONS_FILE, "utf8", (err, data) => {
    if (err && err.code !== "ENOENT") {
      console.error("Error reading file:", err);
      return res.status(500).send("Internal server error.");
    }

    const questions = data ? JSON.parse(data) : [];
    questions.push(newQuestion);

    fs.writeFile(
      QUESTIONS_FILE,
      JSON.stringify(questions, null, 2),
      "utf8",
      (err) => {
        if (err) {
          console.error("Error writing file:", err);
          return res.status(500).send("Internal server error.");
        }

        res.status(200).send("Question added successfully.");
      }
    );
  });
});
// Login API
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === adminCredentials.username &&
    password === adminCredentials.password
  ) {
    req.session.isAuthenticated = true;
    return res.json({ success: true, message: "Login successful" });
  }

  res
    .status(401)
    .json({ success: false, message: "Invalid username or password" });
});

// Admin Dashboard Route
app.get("/admin/dashboard", (req, res) => {
  if (req.session.isAuthenticated) {
    // res.send(
    //   "<h1>Welcome to the Admin Dashboard</h1><p>You are logged in.</p>"
    // );
    res.sendFile(path.join(__dirname, "admin", "admin.html"));
  } else {
    res
      .status(403)
      .send("<h1>Access Denied</h1><p>Please Admin log in first.</p>");
  }
});

app.get("/changeCredentials", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "api", "changeCredentials.html"));
});

// Logout API
app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to log out." });
    }
    res.json({ success: true, message: "Logged out successfully." });
  });
});

// change admin password
app.post("/admin/update-credentials", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  const newCredentials = { username, password };

  fs.writeFile(
    adminCredentialsPath,
    JSON.stringify(newCredentials, null, 2),
    (err) => {
      if (err) {
        console.error("Error writing to credentials file:", err);
        return res
          .status(500)
          .json({ message: "Failed to update credentials." });
      }

      res.status(200).json({ message: "Credentials updated successfully." });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
