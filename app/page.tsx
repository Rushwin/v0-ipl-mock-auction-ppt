"use client"

import type React from "react"
import { useState } from "react"
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
} from "lucide-react"
import { players, type Player } from "@/lib/players-data"

export default function IPLAuction() {
  const [showIntro, setShowIntro] = useState(true)
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [remainingPlayers, setRemainingPlayers] = useState(players)
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

  const selectPlayerByNumber = () => {
    const number = Number.parseInt(selectedNumber)

    if (!number || number < 1 || number > 91) {
      alert("Please enter a valid number between 1 and 91")
      return
    }

    if (usedNumbers.has(number)) {
      alert(`Number ${number} has already been selected!`)
      return
    }

    setIsRevealing(true)
    setShowNumberInput(false)

    setTimeout(() => {
      const playerIndex = (number - 1) % players.length
      const selectedPlayer = players[playerIndex]

      setCurrentPlayer(selectedPlayer)
      setUsedNumbers((prev) => new Set([...prev, number]))
      setRemainingPlayers((prev) => prev.filter((p) => p.id !== selectedPlayer.id))
      setIsRevealing(false)
      setAuctionStarted(true)
      setSelectedNumber("")
    }, 1500)
  }

  const startNumberSelection = () => {
    setShowNumberInput(true)
  }

  const resetAuction = () => {
    setCurrentPlayer(null)
    setRemainingPlayers(players)
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

  const saveDetailsChange = () => {
    if (currentPlayer) {
      const updatedPlayer = {
        ...currentPlayer,
        ...editedPlayerData,
      }
      setCurrentPlayer(updatedPlayer)
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

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
        <div className="relative min-h-screen flex flex-col">
          {/* Hero Section */}
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="max-w-6xl mx-auto text-center">
              <div className="animate-fade-in-up">
                <h1 className="text-7xl md:text-9xl font-black text-blue-400 mb-6 tracking-tight">IPL</h1>
                <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-8 tracking-tight">
                  Mock Auction 2024
                </h2>
                <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                  Experience the thrill of building your dream cricket team.
                  <br className="hidden md:block" />
                  91 cards. Unlimited possibilities.
                </p>
              </div>

              <div className="animate-scale-in">
                <Button
                  onClick={() => setShowIntro(false)}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xl px-12 py-6 rounded-full shadow-2xl hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105"
                >
                  Enter Auction
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="border-border/50 hover:border-primary/50 transition-all duration-300 group bg-gray-800 shadow-xl">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/30 transition-colors">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">88 Players</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Carefully curated roster including 4 hidden gems waiting to be discovered
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 hover:border-primary/50 transition-all duration-300 group bg-gray-800 shadow-xl">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/30 transition-colors">
                      <Zap className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">3 Steal Cards</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Game-changing special cards that can steal any player from opponents
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 hover:border-primary/50 transition-all duration-300 group bg-gray-800 shadow-xl">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/30 transition-colors">
                      <Trophy className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Random Selection</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Lottery-style number selection creates suspense and fair play
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Player Categories */}
              <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">20</div>
                  <div className="text-blue-300 font-medium">Batsmen</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-red-400 mb-2">28</div>
                  <div className="text-red-300 font-medium">Bowlers</div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">11</div>
                  <div className="text-purple-300 font-medium">Keepers</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">29</div>
                  <div className="text-green-300 font-medium">All-rounders</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background p-2">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-orange-500 to-red-500 bg-clip-text text-transparent mb-3 drop-shadow-lg">
            IPL MOCK AUCTION 2024
          </h1>
          <div className="flex justify-center items-center gap-4 text-foreground text-lg glass-effect rounded-lg px-4 py-2 mx-auto w-fit border border-border">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span>Remaining: {91 - usedNumbers.size}</span>
            </div>
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-green-400" />
              <span>Numbers Used: {usedNumbers.size}/91</span>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        {showNumberInput ? (
          <div className="flex justify-center gap-4 mb-6">
            <div className="glass-effect rounded-lg p-4 shadow-2xl border border-border">
              <h3 className="text-xl font-bold text-foreground mb-3 text-center">Select Player Number</h3>
              <div className="flex gap-3 items-end">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Enter number (1-91):</label>
                  <Input
                    type="number"
                    min="1"
                    max="91"
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
                  Reveal Player
                </Button>
                <Button
                  onClick={() => setShowNumberInput(false)}
                  variant="outline"
                  size="lg"
                  className="bg-secondary text-secondary-foreground border-border hover:bg-secondary/80"
                >
                  Cancel
                </Button>
              </div>
              {usedNumbers.size > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground mb-2">Used numbers:</p>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                    {Array.from(usedNumbers)
                      .sort((a, b) => a - b)
                      .map((num) => (
                        <Badge key={num} variant="secondary" className="bg-destructive/20 text-destructive text-xs">
                          {num}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-center gap-4 mb-6">
            <Button
              onClick={startNumberSelection}
              disabled={usedNumbers.size >= 91 || isRevealing}
              size="lg"
              className="bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground text-lg px-6 py-3 h-auto shadow-lg border border-primary/50"
            >
              {isRevealing ? (
                <>
                  <Shuffle className="w-5 h-5 mr-2 animate-spin" />
                  Revealing Player...
                </>
              ) : (
                <>
                  <Hash className="w-5 h-5 mr-2" />
                  {auctionStarted ? "Select Next Number" : "Start Number Selection"}
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
              <h3 className="text-2xl font-bold text-white mb-4">Change Player Photo</h3>

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
              <h3 className="text-2xl font-bold text-white mb-4">Edit Player Details</h3>

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
                  <div className="w-40 h-40 bg-muted rounded-full mx-auto mb-4"></div>
                  <div className="h-8 bg-muted rounded mb-3"></div>
                  <div className="h-6 bg-muted rounded mb-3 w-1/2 mx-auto"></div>
                  <div className="h-12 bg-muted rounded"></div>
                </div>
                <p className="text-xl font-semibold text-muted-foreground mt-4">
                  🎲 Revealing Player Number {Number.parseInt(selectedNumber) || "..."}...
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
              <CardContent className="p-8">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    {getPlayerTypeIcon(currentPlayer)}
                    <Badge className="bg-primary text-primary-foreground text-xl px-4 py-1">
                      {currentPlayer.isStealCard ? "STEAL CARD" : `Player #${Array.from(usedNumbers).pop()}`}
                    </Badge>
                    {isPlayerHidden(currentPlayer) && (
                      <Badge className="bg-purple-600 text-white text-lg px-3 py-1">MYSTERY PLAYER</Badge>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 items-center">
                  {/* Player Image */}
                  <div className="text-center">
                    <div className="relative">
                      {isPlayerHidden(currentPlayer) ? (
                        <div className="w-48 h-48 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full mx-auto shadow-lg border-4 border-purple-500 flex items-center justify-center">
                          <EyeOff className="w-16 h-16 text-white/50" />
                        </div>
                      ) : (
                        <img
                          src={getCurrentPlayerImage() || "/placeholder.svg"}
                          alt={currentPlayer.name}
                          className={`w-48 h-48 object-cover rounded-full mx-auto shadow-lg border-4 ${
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
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      <Badge
                        className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 ${getRoleColor(currentPlayer.role)} text-base px-3 py-1`}
                      >
                        {currentPlayer.role}
                      </Badge>
                    </div>
                  </div>

                  {/* Player Details */}
                  <div className="space-y-4">
                    <div className="relative">
                      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        {isPlayerHidden(currentPlayer) ? "MYSTERY PLAYER" : currentPlayer.name}
                      </h2>
                      <p className="text-lg text-muted-foreground">
                        {isPlayerHidden(currentPlayer) ? "???" : currentPlayer.country}
                        {!isPlayerHidden(currentPlayer) && currentPlayer.age > 0 && ` • Age: ${currentPlayer.age}`}
                      </p>
                      {!currentPlayer.isStealCard && !isPlayerHidden(currentPlayer) && (
                        <Button
                          onClick={startEditingDetails}
                          size="sm"
                          className="absolute top-0 right-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {isPlayerHidden(currentPlayer) && (
                        <Button
                          onClick={() => setRevealedHiddenPlayers((prev) => new Set([...prev, currentPlayer.id]))}
                          className="mt-3 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-base"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Reveal Player Identity
                        </Button>
                      )}
                    </div>

                    <div
                      className={`rounded-lg p-4 text-white ${
                        currentPlayer.isStealCard
                          ? "bg-gradient-to-r from-yellow-600 to-orange-600"
                          : "bg-gradient-to-r from-green-600 to-emerald-600"
                      }`}
                    >
                      <p className="text-base font-medium mb-1">
                        {currentPlayer.isStealCard ? "SPECIAL POWER" : "BASE PRICE"}
                      </p>
                      <p className="text-2xl md:text-3xl font-bold">
                        {currentPlayer.isStealCard
                          ? "STEAL ANY PLAYER"
                          : isPlayerHidden(currentPlayer)
                            ? "MYSTERY PRICE"
                            : formatPrice(currentPlayer.basePrice)}
                      </p>
                    </div>

                    {!currentPlayer.isStealCard && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-700/50">
                          <p className="text-xs font-medium text-blue-300 mb-1">BATTING STYLE</p>
                          <p className="text-sm font-semibold text-blue-100">
                            {isPlayerHidden(currentPlayer) ? "???" : currentPlayer.battingStyle}
                          </p>
                        </div>
                        <div className="bg-red-900/30 rounded-lg p-3 border border-red-700/50">
                          <p className="text-xs font-medium text-red-300 mb-1">BOWLING STYLE</p>
                          <p className="text-sm font-semibold text-red-100">
                            {isPlayerHidden(currentPlayer) ? "???" : currentPlayer.bowlingStyle}
                          </p>
                        </div>
                      </div>
                    )}

                    {currentPlayer.specialSkills && (
                      <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-700/50">
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
        ) : (
          <div className="flex justify-center">
            <Card className="w-full max-w-4xl glass-effect shadow-2xl border border-border">
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4 p-3 bg-primary/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto border-2 border-primary/50">
                  <span className="filter drop-shadow-lg">🏏</span>
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-3">Welcome to IPL Mock Auction!</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Select numbers 1-91 to reveal players in your lottery-style auction
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-base text-muted-foreground mb-4">
                  <div className="bg-blue-900/20 rounded-lg p-2 border border-blue-700/50">
                    <div className="text-blue-300 font-semibold">Batsmen</div>
                    <div>20 players</div>
                  </div>
                  <div className="bg-red-900/20 rounded-lg p-2 border border-red-700/50">
                    <div className="text-red-300 font-semibold">Bowlers</div>
                    <div>28 players</div>
                  </div>
                  <div className="bg-purple-900/20 rounded-lg p-2 border border-purple-700/50">
                    <div className="text-purple-300 font-semibold">Keepers</div>
                    <div>11 players</div>
                  </div>
                  <div className="bg-green-900/20 rounded-lg p-2 border border-green-700/50">
                    <div className="text-green-300 font-semibold">All-rounders</div>
                    <div>29 players</div>
                  </div>
                </div>
                <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-purple-400" />
                    <span>5 Hidden Players</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span>3 Steal Cards</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {usedNumbers.size >= 91 && auctionStarted && (
          <div className="text-center mt-8">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-4xl font-bold text-foreground mb-4">Auction Complete!</h3>
            <p className="text-lg text-muted-foreground">All 91 numbers have been selected</p>
          </div>
        )}
      </div>
    </div>
  )
}
