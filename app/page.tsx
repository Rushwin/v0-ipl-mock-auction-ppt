"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Shuffle,
  Play,
  RotateCcw,
  Users,
  Hash,
  Edit,
  Save,
  X,
  Upload,
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  Trophy,
  ArrowLeft,
} from "lucide-react"
import { createRoundBasedPlayers, type Player } from "@/lib/players-data"
import { createClient } from "@/lib/supabase/client"

export default function IPLAuction() {
  const [showIntro, setShowIntro] = useState(true)
  const [currentRound, setCurrentRound] = useState<1 | 2 | 3 | null>(null)
  const [showRoundSelection, setShowRoundSelection] = useState(false)
  const [roundPlayers] = useState(() => createRoundBasedPlayers())
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [usedNumbers, setUsedNumbers] = useState(new Set<number>())
  const [selectedNumber, setSelectedNumber] = useState("")
  const [isRevealing, setIsRevealing] = useState(false)
  const [auctionStarted, setAuctionStarted] = useState(false)
  const [showNumberInput, setShowNumberInput] = useState(false)
  const [isEditingPhoto, setIsEditingPhoto] = useState(false)
  const [isEditingDetails, setIsEditingDetails] = useState(false)
  const [newPhotoUrl, setNewPhotoUrl] = useState("")
  const [playerPhotos, setPlayerPhotos] = useState<Record<string, string>>({})
  const [editedPlayerData, setEditedPlayerData] = useState<Partial<Player>>({})
  const [revealedHiddenPlayers, setRevealedHiddenPlayers] = useState(new Set<number>())

  const supabase = createClient()

  const savePlayerEditToCloud = async (playerId: number, edits: Partial<Player>) => {
    try {
      const { error } = await supabase.from("player_edits").upsert({
        player_id: playerId,
        name: edits.name,
        age: edits.age,
        base_price: edits.basePrice,
        batting_style: edits.battingStyle,
        bowling_style: edits.bowlingStyle,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        if (error.message.includes("table") || error.message.includes("schema cache")) {
          console.log("Database table not ready yet - changes saved locally only")
        } else {
          console.error("Error saving to cloud:", error)
        }
      } else {
        console.log("Player edit saved to cloud successfully")
      }
    } catch (error) {
      console.log("Could not save to cloud - changes saved locally only")
    }
  }

  useEffect(() => {
    const loadPlayerEdits = async () => {
      try {
        const { data, error } = await supabase.from("player_edits").select("*").limit(1)

        if (error) {
          if (!error.message.includes("table") && !error.message.includes("schema cache")) {
            console.error("Error loading from cloud:", error)
          } else {
            console.log("Player edits table not yet created - this is normal on first run")
          }
        } else if (data) {
          console.log("Loaded player edits from cloud:", data)
          // This would be implemented when we have actual edit data to apply
        }
      } catch (error) {
        console.log("Could not connect to database - running in offline mode")
      }
    }

    loadPlayerEdits()
  }, [supabase])

  const selectPlayerByNumber = () => {
    const number = Number.parseInt(selectedNumber)

    if (!number || number < 1 || number > allPlayers.length) {
      alert(`Please enter a valid number between 1 and ${allPlayers.length}`)
      return
    }

    if (usedNumbers.has(number)) {
      alert(`Number ${number} has already been selected!`)
      return
    }

    setIsRevealing(true)
    setShowNumberInput(false)

    setTimeout(() => {
      const selectedPlayer = allPlayers[number - 1] // Use mixed player array

      setCurrentPlayer(selectedPlayer)
      setUsedNumbers((prev) => new Set([...prev, number]))
      setIsRevealing(false)
      setAuctionStarted(true)
      setSelectedNumber("")
    }, 1500)
  }

  const startNumberSelection = () => {
    setShowNumberInput(true)
  }

  const selectRound = (round: 1 | 2 | 3) => {
    setCurrentRound(round)
    setAllPlayers(roundPlayers[`round${round}` as keyof typeof roundPlayers])
    setShowRoundSelection(false)
    setAuctionStarted(false)
    setCurrentPlayer(null)
    setUsedNumbers(new Set())
    setSelectedNumber("")
    setShowNumberInput(false)
  }

  const goBackToRoundSelection = () => {
    setCurrentRound(null)
    setAllPlayers([])
    setShowRoundSelection(true)
    setAuctionStarted(false)
    setCurrentPlayer(null)
    setUsedNumbers(new Set())
    setSelectedNumber("")
    setShowNumberInput(false)
  }

  const goBack = () => {
    if (showNumberInput) {
      setShowNumberInput(false)
    } else if (currentPlayer) {
      setCurrentPlayer(null)
    } else if (auctionStarted) {
      setAuctionStarted(false)
    } else if (currentRound) {
      goBackToRoundSelection()
    }
  }

  const resetAuction = () => {
    setCurrentPlayer(null)
    setUsedNumbers(new Set())
    setSelectedNumber("")
    setAuctionStarted(false)
    setIsRevealing(false)
    setShowNumberInput(false)
    setIsEditingPhoto(false)
    setIsEditingDetails(false)
    setNewPhotoUrl("")
    setEditedPlayerData({})
    setRevealedHiddenPlayers(new Set())
  }

  const startEditingPhoto = () => {
    setIsEditingPhoto(true)
    setNewPhotoUrl(playerPhotos[currentPlayer?.name || ""] || currentPlayer?.image || "")
  }

  const savePhotoChange = () => {
    if (newPhotoUrl.trim() && currentPlayer) {
      setPlayerPhotos((prev) => ({
        ...prev,
        [currentPlayer.name]: newPhotoUrl.trim(),
      }))
    }
    setIsEditingPhoto(false)
    setNewPhotoUrl("")
  }

  const cancelPhotoEdit = () => {
    setIsEditingPhoto(false)
    setNewPhotoUrl("")
  }

  const startEditingDetails = () => {
    setIsEditingDetails(true)
    setEditedPlayerData({
      name: currentPlayer?.name || "",
      age: currentPlayer?.age || 0,
      basePrice: currentPlayer?.basePrice || 0,
      battingStyle: currentPlayer?.battingStyle || "",
      bowlingStyle: currentPlayer?.bowlingStyle || "",
    })
  }

  const saveDetailsChange = async () => {
    if (currentPlayer) {
      const updatedPlayer = {
        ...currentPlayer,
        ...editedPlayerData,
      }
      setCurrentPlayer(updatedPlayer)

      // Save to cloud
      await savePlayerEditToCloud(currentPlayer.id, editedPlayerData)
    }
    setIsEditingDetails(false)
    setEditedPlayerData({})
  }

  const cancelDetailsEdit = () => {
    setIsEditingDetails(false)
    setEditedPlayerData({})
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setNewPhotoUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getCurrentPlayerImage = () => {
    return playerPhotos[currentPlayer?.name || ""] || currentPlayer?.image || "/placeholder.svg"
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "batsman":
        return "bg-blue-600 text-white"
      case "bowler":
        return "bg-red-600 text-white"
      case "all-rounder":
        return "bg-green-600 text-white"
      case "wicket-keeper":
        return "bg-purple-600 text-white"
      case "special":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-black animate-pulse"
      default:
        return "bg-gray-600 text-white"
    }
  }

  const formatPrice = (price: number) => {
    if (price === 0) return "PRICELESS"
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`
    return `₹${price.toLocaleString()}`
  }

  const getPlayerTypeIcon = (player: Player) => {
    if (player.isStealCard) return <Zap className="w-5 h-5 text-yellow-400" />
    if (player.isHidden && !revealedHiddenPlayers.has(player.id)) return <EyeOff className="w-5 h-5 text-purple-400" />
    return <Eye className="w-5 h-5 text-gray-400" />
  }

  const isPlayerHidden = (player: Player) => {
    return player.isHidden && !revealedHiddenPlayers.has(player.id)
  }

  const revealHiddenPlayer = () => {
    if (currentPlayer) {
      setRevealedHiddenPlayers((prev) => new Set([...prev, currentPlayer.id]))
    }
  }

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
        <div className="relative min-h-screen flex flex-col">
          {/* Hero Section */}
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="max-w-6xl mx-auto text-center">
              <div className="animate-fade-in-up">
                <h1 className="text-6xl md:text-8xl font-black text-blue-400 mb-6 tracking-tight">IPL</h1>
                <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-8 tracking-tight">Auction 2025</h2>
                <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                  Experience the thrill of building your dream cricket team across 3 exciting rounds.
                  <br className="hidden md:block" />
                  88 players. 3 rounds. Unlimited possibilities.
                </p>
              </div>

              <div className="animate-scale-in">
                <Button
                  onClick={() => {
                    setShowIntro(false)
                    setShowRoundSelection(true)
                  }}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-10 py-5 rounded-full shadow-2xl hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105"
                >
                  Enter Auction
                  <ArrowRight className="w-5 h-5 ml-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <Card className="border-border/50 hover:border-primary/50 transition-all duration-300 group bg-gray-800 shadow-xl">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/30 transition-colors">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">88 Players</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Carefully curated roster including 4 hidden gems waiting to be discovered
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 hover:border-primary/50 transition-all duration-300 group bg-gray-800 shadow-xl">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/30 transition-colors">
                      <Trophy className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">3 Rounds</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Round 1: 30 players, Round 2: 30 players, Round 3: 28 players
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 hover:border-primary/50 transition-all duration-300 group bg-gray-800 shadow-xl">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/30 transition-colors">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">3 Steal Cards</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      One game-changing steal card in each round to steal any player
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Round Distribution */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-2">Round 1</div>
                  <div className="text-blue-300 text-sm">30 Players + 1 Steal Card</div>
                  <div className="text-xs text-blue-200 mt-1">7 Batsmen • 10 Bowlers • 4 Keepers • 9 All-rounders</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-2">Round 2</div>
                  <div className="text-green-300 text-sm">30 Players + 1 Steal Card</div>
                  <div className="text-xs text-green-200 mt-1">7 Batsmen • 10 Bowlers • 4 Keepers • 9 All-rounders</div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-2">Round 3</div>
                  <div className="text-purple-300 text-sm">28 Players + 1 Steal Card</div>
                  <div className="text-xs text-purple-200 mt-1">
                    6 Batsmen • 8 Bowlers • 3 Keepers • 11 All-rounders
                  </div>
                </div>
              </div>

              {/* Player Categories */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">20</div>
                  <div className="text-blue-300 text-sm font-medium">Batsmen</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-400 mb-1">28</div>
                  <div className="text-red-300 text-sm font-medium">Bowlers</div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">11</div>
                  <div className="text-purple-300 text-sm font-medium">Keepers</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">29</div>
                  <div className="text-green-300 text-sm font-medium">All-rounders</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showRoundSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Button
              onClick={() => setShowIntro(true)}
              variant="outline"
              size="sm"
              className="absolute left-4 top-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-4xl md:text-5xl font-bold text-blue-400 mb-4">Select Auction Round</h1>
            <p className="text-lg text-muted-foreground">Choose which round you want to conduct</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card
              className="cursor-pointer hover:scale-105 transition-all duration-300 border-blue-500/50 hover:border-blue-500 bg-blue-500/10"
              onClick={() => selectRound(1)}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-400">1</span>
                </div>
                <h3 className="text-2xl font-bold text-blue-400 mb-3">Round 1</h3>
                <div className="space-y-2 text-sm text-blue-300">
                  <div className="font-semibold">31 Cards Total</div>
                  <div>30 Players + 1 Steal Card</div>
                  <div className="text-xs text-blue-200 mt-2">
                    7 Batsmen • 10 Bowlers
                    <br />4 Keepers • 9 All-rounders
                  </div>
                </div>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">Start Round 1</Button>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:scale-105 transition-all duration-300 border-green-500/50 hover:border-green-500 bg-green-500/10"
              onClick={() => selectRound(2)}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-400">2</span>
                </div>
                <h3 className="text-2xl font-bold text-green-400 mb-3">Round 2</h3>
                <div className="space-y-2 text-sm text-green-300">
                  <div className="font-semibold">31 Cards Total</div>
                  <div>30 Players + 1 Steal Card</div>
                  <div className="text-xs text-green-200 mt-2">
                    7 Batsmen • 10 Bowlers
                    <br />4 Keepers • 9 All-rounders
                  </div>
                </div>
                <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white">Start Round 2</Button>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:scale-105 transition-all duration-300 border-purple-500/50 hover:border-purple-500 bg-purple-500/10"
              onClick={() => selectRound(3)}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-400">3</span>
                </div>
                <h3 className="text-2xl font-bold text-purple-400 mb-3">Round 3</h3>
                <div className="space-y-2 text-sm text-purple-300">
                  <div className="font-semibold">29 Cards Total</div>
                  <div>28 Players + 1 Steal Card</div>
                  <div className="text-xs text-purple-200 mt-2">
                    6 Batsmen • 8 Bowlers
                    <br />3 Keepers • 11 All-rounders
                  </div>
                </div>
                <Button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white">Start Round 3</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background p-2">
      <div className="max-w-5xl mx-auto">
        {/* Header with Back Button */}
        <div className="text-center mb-4 relative">
          {(showNumberInput || currentPlayer || auctionStarted || currentRound) && (
            <Button
              onClick={goBack}
              variant="outline"
              size="sm"
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-blue-400 mb-2 drop-shadow-lg">
            IPL AUCTION 2025 {currentRound && `- ROUND ${currentRound}`}
          </h1>
          <div className="flex justify-center items-center gap-3 text-foreground text-sm glass-effect rounded-lg px-3 py-2 mx-auto w-fit border border-border">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Cards: {allPlayers.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-purple-400" />
              <span>Hidden Players</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>1 Steal Card</span>
            </div>
          </div>
        </div>

        {/* Number Input */}
        {showNumberInput && (
          <div className="flex justify-center gap-4 mb-6">
            <div className="glass-effect rounded-lg p-6 shadow-2xl border border-border">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-foreground mb-2">Select Player Number</h3>
                <p className="text-sm text-muted-foreground">
                  Enter number 1-{allPlayers.length} (Mixed deck with steal cards)
                </p>
              </div>
              <div className="flex gap-3 items-end">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Enter number:</label>
                  <Input
                    type="number"
                    min="1"
                    max={allPlayers.length}
                    value={selectedNumber}
                    onChange={(e) => setSelectedNumber(e.target.value)}
                    placeholder="Enter number..."
                    className="w-32 text-lg text-center bg-input border-border text-foreground"
                    onKeyPress={(e) => e.key === "Enter" && selectPlayerByNumber()}
                  />
                </div>
                <Button
                  onClick={selectPlayerByNumber}
                  disabled={!selectedNumber || isRevealing}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-6 py-2"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Reveal Card
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        {!showNumberInput && (
          <div className="flex justify-center gap-4 mb-6">
            <Button
              onClick={startNumberSelection}
              disabled={isRevealing}
              size="lg"
              className="bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground text-lg px-6 py-3 h-auto shadow-lg border border-primary/50"
            >
              {isRevealing ? (
                <>
                  <Shuffle className="w-5 h-5 mr-2 animate-spin" />
                  Revealing Card...
                </>
              ) : (
                <>
                  <Hash className="w-5 h-5 mr-2" />
                  {auctionStarted ? "Select Another Card" : "Start Card Selection"}
                </>
              )}
            </Button>

            <Button
              onClick={resetAuction}
              variant="outline"
              size="lg"
              className="bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border text-lg px-6 py-3 h-auto shadow-lg"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset Auction
            </Button>
          </div>
        )}

        {/* Photo Editing Modal */}
        {isEditingPhoto && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-2xl border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-white">Change Player Photo</h3>
                <Button onClick={cancelPhotoEdit} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Photo URL:</label>
                  <Input
                    type="url"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="Enter image URL..."
                    className="w-full bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Or upload a file:</p>
                  <label className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer text-gray-300">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                {newPhotoUrl && (
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-2">Preview:</p>
                    <img
                      src={newPhotoUrl || "/placeholder.svg"}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-full mx-auto border-2 border-gray-600"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button onClick={savePhotoChange} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    onClick={cancelPhotoEdit}
                    variant="outline"
                    className="flex-1 bg-gray-700 border-gray-600 text-gray-300"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Details Editing Modal */}
        {isEditingDetails && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-2xl border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-white">Edit Player Details</h3>
                <Button
                  onClick={cancelDetailsEdit}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300">Name</Label>
                  <Input
                    value={editedPlayerData.name || ""}
                    onChange={(e) => setEditedPlayerData((prev) => ({ ...prev, name: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Age</Label>
                  <Input
                    type="number"
                    value={editedPlayerData.age || ""}
                    onChange={(e) => setEditedPlayerData((prev) => ({ ...prev, age: Number(e.target.value) }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Base Price (₹)</Label>
                  <Input
                    type="number"
                    value={editedPlayerData.basePrice || ""}
                    onChange={(e) => setEditedPlayerData((prev) => ({ ...prev, basePrice: Number(e.target.value) }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Batting Style</Label>
                  <Input
                    value={editedPlayerData.battingStyle || ""}
                    onChange={(e) => setEditedPlayerData((prev) => ({ ...prev, battingStyle: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Bowling Style</Label>
                  <Input
                    value={editedPlayerData.bowlingStyle || ""}
                    onChange={(e) => setEditedPlayerData((prev) => ({ ...prev, bowlingStyle: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={saveDetailsChange} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    onClick={cancelDetailsEdit}
                    variant="outline"
                    className="flex-1 bg-gray-700 border-gray-600 text-gray-300"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Player Display */}
        {isRevealing ? (
          <div className="flex justify-center">
            <Card className="w-full max-w-4xl glass-effect shadow-2xl border border-border">
              <CardContent className="p-8 text-center">
                <div className="animate-pulse">
                  <div className="w-32 h-32 bg-muted rounded-full mx-auto mb-4"></div>
                  <div className="h-6 bg-muted rounded mb-3"></div>
                  <div className="h-4 bg-muted rounded mb-3 w-1/2 mx-auto"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
                <p className="text-lg font-semibold text-muted-foreground mt-4">
                  🎲 Revealing Card #{selectedNumber}...
                </p>
              </CardContent>
            </Card>
          </div>
        ) : currentPlayer ? (
          <div className="flex justify-center">
            <Card
              className={`w-full max-w-4xl glass-effect shadow-2xl transform hover:scale-105 transition-transform duration-300 border ${
                currentPlayer.isStealCard
                  ? "bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/50"
                  : isPlayerHidden(currentPlayer)
                    ? "bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/50"
                    : "border-border"
              }`}
            >
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    {getPlayerTypeIcon(currentPlayer)}
                    <Badge className="bg-primary text-primary-foreground text-lg px-3 py-1">
                      {currentPlayer.isStealCard ? "STEAL CARD" : `Card #${usedNumbers.size}`}
                    </Badge>
                    {isPlayerHidden(currentPlayer) && (
                      <Badge className="bg-purple-600 text-white text-sm px-2 py-1">MYSTERY PLAYER</Badge>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 items-center">
                  {/* Player Image */}
                  <div className="text-center">
                    <div className="relative">
                      {isPlayerHidden(currentPlayer) ? (
                        <div className="w-40 h-40 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full mx-auto shadow-lg border-4 border-purple-500 flex items-center justify-center">
                          <EyeOff className="w-12 h-12 text-white/50" />
                        </div>
                      ) : (
                        <img
                          src={getCurrentPlayerImage() || "/placeholder.svg"}
                          alt={currentPlayer.name}
                          className={`w-40 h-40 object-cover rounded-full mx-auto shadow-lg border-4 ${
                            currentPlayer.isStealCard ? "border-yellow-500" : "border-primary"
                          }`}
                        />
                      )}
                      {!currentPlayer.isStealCard && !isPlayerHidden(currentPlayer) && (
                        <Button
                          onClick={startEditingPhoto}
                          size="sm"
                          className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 shadow-lg"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      )}
                      <Badge
                        className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 ${getRoleColor(currentPlayer.role)} text-sm px-2 py-1`}
                      >
                        {currentPlayer.role}
                      </Badge>
                    </div>
                  </div>

                  {/* Player Details */}
                  <div className="space-y-3">
                    <div className="relative">
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                        {isPlayerHidden(currentPlayer) ? "MYSTERY PLAYER" : currentPlayer.name}
                      </h2>
                      <p className="text-base text-muted-foreground">
                        {isPlayerHidden(currentPlayer) ? "???" : currentPlayer.country}
                        {!isPlayerHidden(currentPlayer) && currentPlayer.age > 0 && ` • Age: ${currentPlayer.age}`}
                      </p>
                      {!currentPlayer.isStealCard && !isPlayerHidden(currentPlayer) && (
                        <Button
                          onClick={startEditingDetails}
                          size="sm"
                          className="absolute top-0 right-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      )}
                      {isPlayerHidden(currentPlayer) && (
                        <Button
                          onClick={revealHiddenPlayer}
                          className="mt-3 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Reveal Player Identity
                        </Button>
                      )}
                    </div>

                    <div
                      className={`rounded-lg p-3 text-white ${
                        currentPlayer.isStealCard
                          ? "bg-gradient-to-r from-yellow-600 to-orange-600"
                          : "bg-gradient-to-r from-green-600 to-emerald-600"
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">
                        {currentPlayer.isStealCard ? "SPECIAL POWER" : "BASE PRICE"}
                      </p>
                      <p className="text-xl md:text-2xl font-bold">
                        {currentPlayer.isStealCard
                          ? "STEAL ANY PLAYER"
                          : isPlayerHidden(currentPlayer)
                            ? "MYSTERY PRICE"
                            : formatPrice(currentPlayer.basePrice)}
                      </p>
                    </div>

                    {!currentPlayer.isStealCard && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-blue-900/30 rounded-lg p-2 border border-blue-700/50">
                          <p className="text-xs font-medium text-blue-300 mb-1">BATTING STYLE</p>
                          <p className="text-xs font-semibold text-blue-100">
                            {isPlayerHidden(currentPlayer) ? "???" : currentPlayer.battingStyle}
                          </p>
                        </div>
                        <div className="bg-red-900/30 rounded-lg p-2 border border-red-700/50">
                          <p className="text-xs font-medium text-red-300 mb-1">BOWLING STYLE</p>
                          <p className="text-xs font-semibold text-red-100">
                            {isPlayerHidden(currentPlayer) ? "???" : currentPlayer.bowlingStyle}
                          </p>
                        </div>
                      </div>
                    )}

                    {currentPlayer.specialSkills && (
                      <div className="bg-purple-900/30 rounded-lg p-2 border border-purple-700/50">
                        <p className="text-xs font-medium text-purple-300 mb-2">
                          {currentPlayer.isStealCard ? "ABILITIES" : "SPECIAL SKILLS"}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(isPlayerHidden(currentPlayer) && !currentPlayer.isStealCard
                            ? ["???", "???", "???"]
                            : currentPlayer.specialSkills
                          ).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="bg-purple-800/50 text-purple-200 text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : currentRound ? (
          <div className="flex justify-center">
            <Card className="w-full max-w-4xl glass-effect shadow-2xl border border-border">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4 p-3 bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto border-2 border-primary/50">
                  <span className="filter drop-shadow-lg">🏏</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Round {currentRound} Ready!</h2>
                <p className="text-base text-muted-foreground mb-6">
                  {allPlayers.length} cards available • Select a number to reveal your card
                </p>
                <div className="text-sm text-muted-foreground mb-4">
                  <div className="inline-flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <EyeOff className="w-3 h-3 text-purple-400" />
                      <span>Hidden Players</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-yellow-400" />
                      <span>1 Steal Card</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* ... existing modals and other components ... */}
      </div>
    </div>
  )
}
