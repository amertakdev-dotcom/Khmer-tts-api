import express from "express";
import cors from "cors";
import { spawn } from "child_process";

const app = express();

app.use(cors());
app.use(express.json({ limit: "50kb" }));


app.get("/", (req, res) => {
    
    res.json({
        online: true,
        service: "Khmer TTS API",
        voices: [
            "km-KH-PisethNeural",
            "km-KH-SreymomNeural"
        ]
    });
    
});



app.post("/tts", async (req, res) => {
    
    try {
        
        const {
            text,
            voice = "km-KH-PisethNeural"
        } = req.body;
        
        
        if (!text) {
            
            return res.status(400).json({
                error: "Text required"
            });
            
        }
        
        
        // limit character
        if (text.length > 2000) {
            
            return res.status(400).json({
                error: "Maximum 2000 characters"
            });
            
        }
        
        
        res.setHeader(
            "Content-Type",
            "audio/mpeg"
        );
        
        
        res.setHeader(
            "Cache-Control",
            "no-cache"
        );
        
        
        const tts = spawn("edge-tts", [
            "--voice",
            voice,
            "--text",
            text,
            "--write-media",
            "-"
        ]);
        
        
        // Stream audio directly
        tts.stdout.pipe(res);
        
        
        
        tts.stderr.on("data", (data) => {
            
            console.log(
                data.toString()
            );
            
        });
        
        
        
        tts.on("close", () => {
            
            res.end();
            
        });
        
        
        
    } catch (error) {
        
        
        console.log(error);
        
        
        res.status(500).json({
            
            error: "TTS failed"
            
        });
        
        
    }
    
});



const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
    
    console.log(
        `Server running on ${PORT}`
    );
    
});
