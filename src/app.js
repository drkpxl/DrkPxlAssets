// Directory listing and thumbnail generation functionality converted to Node.js
// Instructions provided for setting up the project

// Step 1: Initialize your Node.js project
// - Create a new directory for the project and navigate into it:
//     mkdir my-assets-server
//     cd my-assets-server
// - Initialize a new Node.js project:
//     npm init -y
// - Install required dependencies:
//     npm install express sharp font-awesome

// Step 2: Create a main JavaScript file for the server, e.g., "server.js":

const express = require('express');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const multer = require('multer');
const basicAuth = require('express-basic-auth');

const app = express();
const port = 4000;

// Directories for files and thumbnails
const filesDir = path.join(__dirname, 'uploads');
const thumbnailsDir = path.join(__dirname, 'thumbnails');

// Allowed image extensions
const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
// Allowed file extensions for display
const allowedExtensions = [...imageExtensions, 'zip'];

// Mapping of file extensions to Font Awesome icons
const iconMapping = {
  zip: 'fa-regular fa-file-archive',
  pdf: 'fa-regular fa-file-pdf',
  doc: 'fa-regular fa-file-word',
  docx: 'fa-regular fa-file-word',
  xls: 'fa-regular fa-file-excel',
  xlsx: 'fa-regular fa-file-excel',
  ppt: 'fa-regular fa-file-powerpoint',
  pptx: 'fa-regular fa-file-powerpoint',
  txt: 'fa-regular fa-file-lines',
  mp3: 'fa-regular fa-file-audio',
  mp4: 'fa-regular fa-file-video',
  csv: 'fa-regular fa-file-csv',
  json: 'fa-regular fa-file-code',
};

// Serve static files (uploads and thumbnails)
app.use('/uploads', express.static(filesDir));
app.use('/thumbnails', express.static(thumbnailsDir));
app.use('/assets', express.static(path.join(__dirname, 'assets'))); // For Font Awesome assets

// Homepage route
app.get('/', (req, res) => {
  fs.readdir(filesDir, (err, files) => {
    if (err) {
      return res.status(500).send('Error reading files directory');
    }

    // Filter files by allowed extensions
    const filteredFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase().slice(1);
      return allowedExtensions.includes(ext);
    });

    // Generate HTML content
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>DrkPxl Assets</title>
          <link rel="stylesheet" href="https://kit.fontawesome.com/b80313799d.css" crossorigin="anonymous">
          <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap"
        rel="stylesheet">
          <link rel="stylesheet" href="assets/style.css">
      </head>
      <body>
          <h1>DrkPxl Assets</h1>
          <ul>
    `;

    filteredFiles.forEach((file) => {
      const fileExt = path.extname(file).toLowerCase().slice(1);
      const filePath = `/uploads/${encodeURIComponent(file)}`;
      const thumbPath = `/thumbnails/${encodeURIComponent(file)}.png`;

      htmlContent += '<li>';

      if (imageExtensions.includes(fileExt)) {
        // Check if thumbnail exists, generate if it doesn't
        const thumbFullPath = path.join(thumbnailsDir, `${file}.png`);
        if (!fs.existsSync(thumbFullPath)) {
          sharp(path.join(filesDir, file))
            .resize(100, 100, { fit: 'inside' })
            .toFile(thumbFullPath, (err) => {
              if (err) {
                console.error('Error generating thumbnail:', err);
              }
            });
        }

        // Display thumbnail
        htmlContent += `
          <a href="${filePath}">
              <div class="media-container">
                  <img src="${thumbPath}" alt="${file}" class="thumbnail">
              </div>
          </a>
        `;
      } else {
        // Determine the appropriate Font Awesome icon
        const iconClass = iconMapping[fileExt] || 'fa-regular fa-file';

        // Display Font Awesome icon
        htmlContent += `
          <a href="${filePath}">
              <div class="media-container">
                  <i class="${iconClass}"></i>
              </div>
          </a>
        `;
      }

      // Display file name
      htmlContent += `<a href="${filePath}">${file}</a>`;
      htmlContent += '</li>';
    });

    htmlContent += `
          </ul>
      </body>
      </html>
    `;

    res.send(htmlContent);
  });
});

// Basic authentication for admin page
app.use('/admin', basicAuth({
    users: { 'admin': 'password' }, // Change 'password' to a secure password
    challenge: true,
    unauthorizedResponse: (req) => 'Unauthorized'
  }));
  
  // Multer setup for handling file uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, filesDir);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  });
  const upload = multer({ storage: storage });
  
  // Admin page route for uploading files
  app.get('/admin', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Admin Upload Page</title>
          <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap"
        rel="stylesheet">
          <link rel="stylesheet" href="assets/style.css">
      </head>
      <body>
          <h1>Upload Assets</h1>
          <form action="/admin/upload" method="post" enctype="multipart/form-data">
              <input type="file" name="file" multiple><br>
              <button type="submit">Upload</button>
          </form>
      </body>
      </html>
    `);
  });
  
  // Handle file upload
  app.post('/admin/upload', upload.array('file'), (req, res) => {
    req.files.forEach((file) => {
      const fileExt = path.extname(file.originalname).toLowerCase().slice(1);
      if (imageExtensions.includes(fileExt)) {
        const thumbFullPath = path.join(thumbnailsDir, `${file.originalname}.png`);
        sharp(file.path)
          .resize(100, 100, { fit: 'inside' })
          .toFile(thumbFullPath, (err) => {
            if (err) {
              console.error('Error generating thumbnail:', err);
            }
          });
      }
    });
    res.redirect('/admin');
  });


// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Step 3: Create the "uploads" and "thumbnails" directories in the project root:
//     mkdir uploads thumbnails
// Add some files to the "uploads" directory to test the server.

// Step 4: Run the server
// - To start the server, run the following command:
//     node server.js
// - Open a browser and navigate to http://localhost:3400 to view the file list.