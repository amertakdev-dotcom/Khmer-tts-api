import express from "express";
import cors from "cors";
import { exec } from "child_process";
import { promisify } from "util";
import { v4 as uuid } from "uuid";
import fs from "fs";

const execAsync = promisify(exec);

const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req,res)=>{
    res.json({
        status:"online",
        service:"Khmer TTS API",
        voices:[
            "km-KH-PisethNeural",
            "km-KH-SreymomNeural"
        ]
    });
});


app.post("/tts", async(req,res)=>{

    try{

        const {
            text,
            voice="km-KH-PisethNeural"
        } = req.body;


        if(!text){
            return res.status(400).json({
                error:"Text required"
            });
        }


        const file=`${uuid()}.mp3`;


        await execAsync(
        `edge-tts --voice ${voice} --text "${text}" --write-media ${file}`
        );


        res.setHeader(
            "Content-Type",
            "audio/mpeg"
        );


        const stream=fs.createReadStream(file);


        stream.pipe(res);


        stream.on("close",()=>{

            fs.unlinkSync(file);

        });


    }catch(err){

        console.log(err);

        res.status(500).json({
            error:"TTS failed"
        });

    }

});


const PORT=process.env.PORT || 3000;

app.listen(PORT,()=>{

console.log(
`Server running on ${PORT}`
);

});