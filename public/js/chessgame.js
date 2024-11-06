const socket = io();
const chess = new Chess();
const boardElement =  document.querySelector(".chessboard");

let draggedpiece =  null;
let sourcesquare =  null;
playerRole = null;


const renderBoard = ()=>{
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach( (row,rowIndex) => {
       row.forEach((square, squareIndex)=>{
        const squareElement =  document.createElement("div");
        squareElement.classList.add("square",
            (squareIndex+rowIndex)%2==0 ?"light" :"dark"
        )
        squareElement.dataset.row = rowIndex;
        squareElement.dataset.col = squareIndex;
        if(square){
            const pieceElement = document.createElement("div");
            pieceElement.classList.add("piece",square.color ==="w" ? "white":"black");
            pieceElement.innerText = getunicodepiece(square);
            pieceElement.draggable = square.color === playerRole;
            pieceElement.addEventListener("dragstart",(e)=>{
                if (pieceElement.draggable){
                    draggedpiece = pieceElement;
                    sourcesquare = {row: rowIndex, col:squareIndex};
                    e.dataTransfer.setData("text/plain","");
                }
            })
            pieceElement.addEventListener("dragend",(e)=>{
                draggedpiece= null;
                sourcesquare = null;
            })
            squareElement.appendChild(pieceElement);
        }
        squareElement.addEventListener("dragover",(e)=>
        {
            e.preventDefault();
        })
        squareElement.addEventListener("drop",(e)=>{
            e.preventDefault();
            if (draggedpiece){
               const targetsquare = {
                row: parseInt( squareElement.dataset.row),
                col: parseInt(squareElement.dataset.col)
               };
               handleMove(sourcesquare,targetsquare);
            }
        })
        boardElement.append(squareElement)
       }) ;       
    });
    if(playerRole==='b'){
        boardElement.classList.add("flipped");
    }
    else{
        boardElement.classList.remove("flipped");
    }
    
} 
const handleMove= (sourcesquare,targetsquare)=>{
    const move = {
        from :`${String.fromCharCode(97+sourcesquare.col)}${8-sourcesquare.row}`,
        to :`${String.fromCharCode(97+targetsquare.col)}${8-targetsquare.row}`,
        

        promotion: "q",
    }
    console.log(move)
    socket.emit("move",move)
};
const getunicodepiece = (piece)=>{
    const unicodepieeces =
        {
          "k": "♚",  // king
          "q": "♛",  // queen
          "r": "♜",  // rook
          "b": "♝",  // bishop
          "n": "♞",  // knight
          "p": "♙"   // pawn
        }
    return unicodepieeces[piece.type] || ""  ;
      
}
socket.on("playerRole",(role)=>{
    playerRole = role;
    renderBoard();
})

socket.on("spectatorRole",()=>{
   playerRole = null;
   renderBoard(); 
})
socket.on("move",(move)=>{
    chess.move(move);
    renderBoard();
})
socket.on("boardState",(fen)=>{
    chess.load(fen);
    renderBoard();
})
renderBoard();