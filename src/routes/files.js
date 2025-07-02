const express = require('express');
const { route } = require('./auth');
const multer = require('../../utils/file').multer
const storage = require('../../utils/file').storage
const fileFilter = require('../../utils/file').fileFilter
const pool = require('../config/db')
const router = express.Router();


 const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});


router.post('/upload',upload.single('file'),(req,res)=>{
     try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }


//     let sqlStatement =  `update patient set filename=$1 where booking_id=$2 `


// await    pool.query(sqlStatement,[])

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        url: `http://localhost:${5000}/uploads/${req.file.filename}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  } 

})


router.get('/files', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir).map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      
      return {
        filename,
        size: stats.size,
        uploadDate: stats.mtime,
        url: `http://localhost:${5000}/uploads/${filename}`
      };
    });

    res.json({
      success: true,
      files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get files',
      error: error.message
    });
  }
});


router.post('/updatefile',async(req,res)=>{
    
    try {
        
        const {filename,booking_id} = req.body
        console.log(req.body);
        let sqlStatement = `update patient set filename =$1 where booking_id =$2`
      let result = await pool.query(sqlStatement,[filename,booking_id])
      console.log(result);
    } catch (error) {
        res.status(400).json({error:'cant update right now'})
    }

     

})
     
 
module.exports=router;