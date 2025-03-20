"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

// Define piece types
type PieceType = "red" | "black" | "red-king" | "black-king" | null

// Define board position
interface Position {
  row: number
  col: number
}

// Define a move
interface Move {
  from: Position
  to: Position
  captures?: Position
}

export default function CheckersGame() {
  // Initialize the 8x8 board
  const [board, setBoard] = useState<PieceType[][]>(() => {
    const initialBoard: PieceType[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null))

    // Place the initial pieces
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        // Only place pieces on dark squares
        if ((row + col) % 2 === 1) {
          if (row < 3) {
            initialBoard[row][col] = "black"
          } else if (row > 4) {
            initialBoard[row][col] = "red"
          }
        }
      }
    }

    return initialBoard
  })

  const [currentPlayer, setCurrentPlayer] = useState<"red" | "black">("red")
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null)
  const [validMoves, setValidMoves] = useState<Move[]>([])
  const [gameStatus, setGameStatus] = useState<"playing" | "red-wins" | "black-wins">("playing")

  // Calculate valid moves for the selected piece
  useEffect(() => {
    if (!selectedPiece || gameStatus !== "playing") {
      setValidMoves([])
      return
    }

    const moves: Move[] = []
    const { row, col } = selectedPiece
    const piece = board[row][col]

    if (!piece || !isPieceOwnedByCurrentPlayer(piece, currentPlayer)) {
      setValidMoves([])
      return
    }

    // Check if there are any capture moves available
    const captureMoves = getAllCaptureMoves()

    if (captureMoves.length > 0) {
      // If the selected piece has capture moves, only show those
      const selectedPieceCaptures = captureMoves.filter((move) => move.from.row === row && move.from.col === col)

      if (selectedPieceCaptures.length > 0) {
        setValidMoves(selectedPieceCaptures)
      } else {
        // If this piece doesn't have captures but others do, don't allow moves
        setValidMoves([])
      }
      return
    }

    // Regular moves (only if no captures are available)
    const directions = getDirections(piece)

    for (const [rowDir, colDir] of directions) {
      const newRow = row + rowDir
      const newCol = col + colDir

      if (isValidPosition(newRow, newCol) && board[newRow][newCol] === null) {
        moves.push({
          from: { row, col },
          to: { row: newRow, col: newCol },
        })
      }
    }

    setValidMoves(moves)
  }, [selectedPiece, board, currentPlayer, gameStatus])

  // Check for game over conditions
  useEffect(() => {
    // Count pieces
    let redPieces = 0
    let blackPieces = 0

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col]
        if (piece === "red" || piece === "red-king") redPieces++
        if (piece === "black" || piece === "black-king") blackPieces++
      }
    }

    if (redPieces === 0) {
      setGameStatus("black-wins")
    } else if (blackPieces === 0) {
      setGameStatus("red-wins")
    } else {
      // Check if current player has any valid moves
      const hasValidMoves = checkForValidMoves()
      if (!hasValidMoves) {
        setGameStatus(currentPlayer === "red" ? "black-wins" : "red-wins")
      }
    }
  }, [board, currentPlayer])

  // Helper function to check if a position is valid
  const isValidPosition = (row: number, col: number): boolean => {
    return row >= 0 && row < 8 && col >= 0 && col < 8
  }

  // Helper function to check if a piece belongs to the current player
  const isPieceOwnedByCurrentPlayer = (piece: PieceType, player: "red" | "black"): boolean => {
    if (player === "red") {
      return piece === "red" || piece === "red-king"
    } else {
      return piece === "black" || piece === "black-king"
    }
  }

  // Get movement directions based on piece type
  const getDirections = (piece: PieceType): [number, number][] => {
    if (piece === "red") {
      return [
        [-1, -1],
        [-1, 1],
      ] // Red moves up
    } else if (piece === "black") {
      return [
        [1, -1],
        [1, 1],
      ] // Black moves down
    } else if (piece === "red-king" || piece === "black-king") {
      return [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ] // Kings move in all directions
    }
    return []
  }

  // Get all possible capture moves for the current player
  const getAllCaptureMoves = (): Move[] => {
    const captureMoves: Move[] = []

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col]

        if (piece && isPieceOwnedByCurrentPlayer(piece, currentPlayer)) {
          const pieceCapturesMoves = getCaptureMoves({ row, col }, piece)
          captureMoves.push(...pieceCapturesMoves)
        }
      }
    }

    return captureMoves
  }

  // Get capture moves for a specific piece
  const getCaptureMoves = (position: Position, piece: PieceType): Move[] => {
    const { row, col } = position
    const moves: Move[] = []
    const directions = getDirections(piece)

    for (const [rowDir, colDir] of directions) {
      const jumpRow = row + rowDir
      const jumpCol = col + colDir
      const landRow = row + 2 * rowDir
      const landCol = col + 2 * colDir

      if (
        isValidPosition(jumpRow, jumpCol) &&
        isValidPosition(landRow, landCol) &&
        board[landRow][landCol] === null &&
        board[jumpRow][jumpCol] !== null &&
        !isPieceOwnedByCurrentPlayer(board[jumpRow][jumpCol], currentPlayer)
      ) {
        moves.push({
          from: { row, col },
          to: { row: landRow, col: landCol },
          captures: { row: jumpRow, col: jumpCol },
        })
      }
    }

    return moves
  }

  // Check if the current player has any valid moves
  const checkForValidMoves = (): boolean => {
    // Check for capture moves first
    const captureMoves = getAllCaptureMoves()
    if (captureMoves.length > 0) return true

    // Check for regular moves
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col]

        if (piece && isPieceOwnedByCurrentPlayer(piece, currentPlayer)) {
          const directions = getDirections(piece)

          for (const [rowDir, colDir] of directions) {
            const newRow = row + rowDir
            const newCol = col + colDir

            if (isValidPosition(newRow, newCol) && board[newRow][newCol] === null) {
              return true
            }
          }
        }
      }
    }

    return false
  }

  // Handle piece selection
  const handleSquareClick = (row: number, col: number) => {
    if (gameStatus !== "playing") return

    const piece = board[row][col]

    // If clicking on one of the valid move destinations
    if (selectedPiece && validMoves.some((move) => move.to.row === row && move.to.col === col)) {
      const move = validMoves.find((m) => m.to.row === row && m.to.col === col)!
      makeMove(move)
      return
    }

    // If clicking on a piece that belongs to the current player
    if (piece && isPieceOwnedByCurrentPlayer(piece, currentPlayer)) {
      setSelectedPiece({ row, col })
    } else {
      setSelectedPiece(null)
    }
  }

  // Execute a move
  const makeMove = (move: Move) => {
    const { from, to, captures } = move
    const newBoard = [...board.map((row) => [...row])]

    // Move the piece
    const piece = newBoard[from.row][from.col]
    newBoard[from.row][from.col] = null

    // Check for promotion to king
    let movedPiece = piece
    if (piece === "red" && to.row === 0) {
      movedPiece = "red-king"
    } else if (piece === "black" && to.row === 7) {
      movedPiece = "black-king"
    }

    newBoard[to.row][to.col] = movedPiece

    // Remove captured piece if any
    if (captures) {
      newBoard[captures.row][captures.col] = null
    }

    setBoard(newBoard)

    // Check if there are additional captures available after this move
    if (captures) {
      const additionalCaptures = getCaptureMoves(to, movedPiece)

      if (additionalCaptures.length > 0) {
        // Continue with the same piece for multiple captures
        setSelectedPiece(to)
        return
      }
    }

    // Switch player
    setCurrentPlayer(currentPlayer === "red" ? "black" : "red")
    setSelectedPiece(null)
  }

  // Reset the game
  const resetGame = () => {
    const initialBoard: PieceType[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null))

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          if (row < 3) {
            initialBoard[row][col] = "black"
          } else if (row > 4) {
            initialBoard[row][col] = "red"
          }
        }
      }
    }

    setBoard(initialBoard)
    setCurrentPlayer("red")
    setSelectedPiece(null)
    setValidMoves([])
    setGameStatus("playing")
  }

  // Determine if a square is a valid move destination
  const isValidMoveDestination = (row: number, col: number): boolean => {
    return validMoves.some((move) => move.to.row === row && move.to.col === col)
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-4">
      <h1 className="text-2xl font-bold mb-2">Checkers</h1>

      <div className="mb-4 text-center">
        {gameStatus === "playing" ? (
          <div className="flex items-center gap-2">
            <span>Current Player:</span>
            <div className={`w-6 h-6 rounded-full ${currentPlayer === "red" ? "bg-red-600" : "bg-black"}`} />
          </div>
        ) : (
          <div className="text-xl font-bold">{gameStatus === "red-wins" ? "Red Wins!" : "Black Wins!"}</div>
        )}
      </div>

      <div className="border-4 border-amber-800 bg-amber-100">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((piece, colIndex) => {
              const isBlackSquare = (rowIndex + colIndex) % 2 === 1
              const isSelected = selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex
              const isValidMove = isValidMoveDestination(rowIndex, colIndex)

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center
                    ${isBlackSquare ? "bg-amber-800" : "bg-amber-200"}
                    ${isSelected ? "ring-4 ring-yellow-400" : ""}
                    ${isValidMove ? "ring-4 ring-green-500" : ""}
                  `}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                >
                  {piece && (
                    <div
                      className={`
                        w-8 h-8 sm:w-10 sm:h-10 rounded-full relative
                        ${piece.includes("red") ? "bg-red-600" : "bg-black"}
                        ${piece.includes("king") ? "border-2 border-yellow-400" : ""}
                      `}
                    >
                      {piece.includes("king") && (
                        <div className="absolute inset-0 flex items-center justify-center text-yellow-400 font-bold">
                          K
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <Button onClick={resetGame} className="mt-4">
        New Game
      </Button>
    </div>
  )
}

