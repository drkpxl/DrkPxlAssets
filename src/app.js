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
          <style>
              /* Reset some basic styles */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f9f9f9;
            padding: 20px;
        }

        h1 {
            text-align: center;
            margin-bottom: 30px;
            color: #333;
        }

        ul {
            list-style-type: none;
            padding: 0;
            max-width: 900px;
            margin: 0 auto;
        }

        li {
            background: #fff;
            margin: 10px 0;
            padding: 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
        }

        li:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }

        a {
            text-decoration: none;
            color: black;
            font-size: 1.2em;
            transition: color 0.2s;
        }

        a:hover {
            color: #0056b3;
            text-decoration: underline;
        }

        /* Consistent sizing for thumbnails and icons */
        .media-container {
            width: 60px;
            height: 60px;
            margin-right: 20px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f1f1f1;
            border-radius: 8px;
            border: 1px solid #ddd;
        }

        img.thumbnail {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 8px;
        }

        .icon-container i {
            font-size: 2em;
            color: #555;
        }

        @media (max-width: 600px) {
            li {
                flex-direction: column;
                align-items: flex-start;
            }

            .media-container {
                margin-right: 0;
                margin-bottom: 10px;
            }

            a {
                font-size: 1em;
            }
        }
          </style>
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