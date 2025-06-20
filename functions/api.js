const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const serverless = require('serverless-http');

const app = express();
const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// In-memory storage for mosaic projects
const projects = new Map();
let currentId = 1;

// Process image endpoint
router.post('/process-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const settings = JSON.parse(req.body.settings || '{}');
    
    // Process image with Sharp
    const image = sharp(req.file.buffer);
    const metadata = await image.metadata();
    
    // Resize image based on settings
    const maxDimension = Math.max(settings.canvasWidth || 8.5, settings.canvasHeight || 11) * 100;
    const processedImage = await image
      .resize(maxDimension, maxDimension, { fit: 'inside' })
      .png()
      .toBuffer();

    const imageData = `data:image/png;base64,${processedImage.toString('base64')}`;

    // Create project entry
    const project = {
      id: currentId++,
      name: req.file.originalname,
      imageData,
      settings,
      colorPalette: JSON.parse(req.body.colorPalette || '[]'),
      processedData: null,
      createdAt: new Date().toISOString()
    };

    projects.set(project.id, project);

    res.json({
      success: true,
      project,
      processedImage: {
        imageData,
        originalMetadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format
        },
        processedDimensions: {
          width: maxDimension,
          height: maxDimension
        },
        gridDimensions: {
          width: Math.floor(maxDimension / (settings.tileSize || 4)),
          height: Math.floor(maxDimension / (settings.tileSize || 4))
        }
      }
    });

  } catch (error) {
    console.error('Image processing error:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

// Get all projects
router.get('/projects', (req, res) => {
  res.json(Array.from(projects.values()));
});

// Get single project
router.get('/projects/:id', (req, res) => {
  const project = projects.get(parseInt(req.params.id));
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json(project);
});

// Update project
router.patch('/projects/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const project = projects.get(id);
  
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const updated = { ...project, ...req.body };
  projects.set(id, updated);
  res.json(updated);
});

// Delete project
router.delete('/projects/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const deleted = projects.delete(id);
  
  if (!deleted) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  res.json({ success: true });
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/.netlify/functions/api', router);

module.exports.handler = serverless(app);