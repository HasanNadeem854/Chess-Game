import express from "express";
import { Server } from 'socket.io';
import { Chess } from "chess.js";
import { createServer } from 'http';
import path from "path";
import { fileURLToPath } from 'url';
import { channel } from "diagnostics_channel";
// Recreate __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

const chess = new Chess();
const player =  {};
let currentPlayer = "w";

app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));
app.get("/",(req,res)=>{
    res.render("index",{title: "chess game"});
});
io.on("connection",(socket)=>{
    console.log("socket is connected")
    if (!player.white){
        player.white = socket.id;
        socket.emit("playerRole","w");
    }
    else if (!player.black){
        player.black = socket.id;
        socket.emit("playerRole","b");
    }
    else{
        socket.emit("spectatorRole");
    }
    socket.on("disconnect",()=>{
        if(socket.id===player.white){
            delete player.white; 
        }
        else if(socket.id===player.black){
            delete player.black; 
        }
    })
    socket.on("move",(move)=>{
        try {
            if(chess.turn()=== "w" && socket.id !== player.white) return;
            if(chess.turn()=== "b" && socket.id !== player.black) return;
            const result = chess.move(move);
            if(result){
                currentPlayer = chess.turn();
                io.emit("move",move)
                io.emit("boardstate",chess.fen())
            }else{
                console.log("invalid move",move)
                socket.emit("Invalid move",move)
            }
        } catch (error) {
            console.log(error)
            socket.emit("Invalid move",move)
        }
    })
})


server.listen(3000,()=>{
    console.log("server is running on port 3000")
});