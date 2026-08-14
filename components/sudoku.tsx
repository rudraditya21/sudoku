"use client"

import { useState } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"

type Grid = number[][]

const createEmptyGrid = (): Grid => Array.from({ length: 9 }, () => Array(9).fill(0))

type ValidationResult = {
  valid: boolean
  message?: string
}

function validateGrid(grid: Grid): ValidationResult {
  // Check rows
  for (let row = 0; row < 9; row++) {
    const seen = new Set<number>()

    for (let col = 0; col < 9; col++) {
      const value = grid[row][col]

      if (value === 0) continue

      if (seen.has(value)) {
        return {
          valid: false,
          message: `Invalid puzzle: ${value} appears more than once in row ${row + 1}.`,
        }
      }

      seen.add(value)
    }
  }

  // Check columns
  for (let col = 0; col < 9; col++) {
    const seen = new Set<number>()

    for (let row = 0; row < 9; row++) {
      const value = grid[row][col]

      if (value === 0) continue

      if (seen.has(value)) {
        return {
          valid: false,
          message: `Invalid puzzle: ${value} appears more than once in column ${col + 1}.`,
        }
      }

      seen.add(value)
    }
  }

  // Check 3x3 boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const seen = new Set<number>()

      for (let row = boxRow * 3; row < boxRow * 3 + 3; row++) {
        for (let col = boxCol * 3; col < boxCol * 3 + 3; col++) {
          const value = grid[row][col]

          if (value === 0) continue

          if (seen.has(value)) {
            return {
              valid: false,
              message: `Invalid puzzle: ${value} appears more than once in a 3×3 box.`,
            }
          }

          seen.add(value)
        }
      }
    }
  }

  return { valid: true }
}

function isValid(grid: Grid, row: number, col: number, num: number) {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num) return false
    if (grid[i][col] === num) return false
  }

  const startRow = row - (row % 3)
  const startCol = col - (col % 3)

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (grid[startRow + r][startCol + c] === num) {
        return false
      }
    }
  }

  return true
}

function solveSudoku(grid: Grid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num

            if (solveSudoku(grid)) {
              return true
            }

            grid[row][col] = 0
          }
        }

        return false
      }
    }
  }

  return true
}

export default function Sudoku() {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")

  function handleChange(row: number, col: number, value: string) {
    if (value !== "" && !/^[1-9]$/.test(value)) {
      return
    }

    setGrid((prev) => {
      const next = prev.map((r) => [...r])
      next[row][col] = value === "" ? 0 : Number(value)
      return next
    })

    // Clear previous message when user edits the puzzle
    setMessage("")
    setMessageType("")
  }

  function handleSolve() {
    // First check whether the entered numbers
    // already violate Sudoku rules.
    const validation = validateGrid(grid)

    if (!validation.valid) {
      setMessage(validation.message ?? "Invalid Sudoku.")
      setMessageType("error")
      return
    }

    // Create a copy so we don't modify the user's
    // puzzle unless a solution actually exists.
    const solvedGrid = grid.map((row) => [...row])

    const solved = solveSudoku(solvedGrid)

    if (!solved) {
      setMessage(
        "This Sudoku has no solution. The given numbers cannot form a valid completed Sudoku."
      )
      setMessageType("error")
      return
    }

    setGrid(solvedGrid)
    setMessage("Sudoku solved successfully!")
    setMessageType("success")
  }

  function handleReset() {
    setGrid(createEmptyGrid())
    setMessage("")
    setMessageType("")
  }

  return (
    <div className="flex w-full max-w-135 flex-col gap-4">
      {/* Sudoku Grid */}
      <div className="w-full overflow-hidden rounded-lg border-2 border-foreground">
        <div className="grid grid-cols-9">
          {Array.from({ length: 81 }, (_, index) => {
            const row = Math.floor(index / 9)
            const col = index % 9

            return (
              <div
                key={index}
                className={[
                  "aspect-square",
                  "flex items-center justify-center",
                  "border-r border-b border-border",

                  col === 2 || col === 5
                    ? "border-r-2 border-r-foreground"
                    : "",

                  row === 2 || row === 5
                    ? "border-b-2 border-b-foreground"
                    : "",

                  col === 8 ? "border-r-0" : "",
                  row === 8 ? "border-b-0" : "",
                ].join(" ")}
              >
                <Input type="text" inputMode="numeric" maxLength={1} value={grid[row][col] || ""} onChange={(e) => handleChange(row, col, e.target.value)}
                  className="h-full w-full rounded-none border-0 p-0 text-center text-lg font-semibold shadow-none focus-visible:ring-0" />
              </div>
            )
          })}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <Button type="button" onClick={handleSolve} className="flex-1 py-6 px-8">Solve</Button>
        <Button type="button" variant="outline" onClick={handleReset} className="flex-1 py-6 px-8">Reset</Button>
      </div>

      {/* Message */}
      {
        message && (
          <div
            className={[
              "rounded-md border px-4 py-3 text-sm",
              messageType === "error"
                ? "border-destructive/50 bg-destructive/10 text-destructive"
                : "border-green-500/50 bg-green-500/10 text-green-600",
            ].join(" ")}
          >
            {message}
          </div>
        )
      }
    </div >
  )
}
