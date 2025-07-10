"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type React from "react"
import { useState, useEffect } from "react"
import {
  ArrowRight,
  FileText,
  Eye,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ShoppingCart,
  Upload,
  ImageIcon,
  Video,
  Download,
  Star,
  Grid3X3,
  List,
  Heart,
  Share2,
  AlertCircle,
  Music,
  FileImage,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { InteractiveCard } from "@/components/custom/interactive-card"
import { Balancer } from "react-wrap-balancer"
import { toast } from "sonner"
import { useUserContext, fetchEmployerDisplayName, fetchWithAuth } from "@/context/UserContext"
import { ethers } from "ethers"
import STANDARD_LICENSE_1155 from "@/lib/contracts/StandardLicense1155.json"
import EXCLUSIVE_LICENSE_721 from "@/lib/contracts/ExclusiveLicense721.json"

const fadeIn = (delay = 0, duration = 0.5) => ({
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay, duration, ease: "easeOut" } },
})

const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
})

const slideIn = (direction = "left", delay = 0) => ({
  hidden: {
    x: direction === "left" ? -100 : direction === "right" ? 100 : 0,
    y: direction === "up" ? 100 : direction === "down" ? -100 : 0,
    opacity: 0,
  },
  visible: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: { delay, duration: 0.6, ease: "easeOut" },
  },
})

const scaleIn = (delay = 0) => ({
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      delay,
      duration: 0.4,
      ease: "easeOut",
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
})

const SectionWrapper = ({
  children,
  className,
  id,
  padding = "py-16 md:py-20 lg:py-24",
}: {
  children: React.ReactNode
  className?: string
  id?: string
  padding?: string
}) => (
  <section id={id} className={`w-full relative ${padding} ${className}`}>
    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-background/3 dark:via-black/5 to-transparent opacity-20" />
    <div className="container px-4 md:px-6 relative z-10">{children}</div>
  </section>
)

interface Asset {
  _id: string
  id: string
  title: string
  description: string
  type: "image" | "video" | "audio" | "3d" | "template"
  category: string
  tags: string[]
  price: string
  currency: "KAS"
  creatorAddress: string
  creatorName?: string
  thumbnailUrl: string
  mimeType: string
  assetUrl: string
  fileSize: string
  fileCid: string
  dimensions?: string
  duration?: string
  downloads: number
  rating: number
  reviewCount: number
  createdAt: string
  featured: boolean
  license: "standard" | "exclusive"
  status: "active" | "pending" | "sold"
}

interface MyAsset {
  purchaseDate: string
  licenseType: string
  price: string
  asset: Asset
}

interface Purchase {
  // _id: string
  // asset: Asset
  // buyerAddress: string
  // price: string
  // purchaseDate: string
  // licenseType: string
  // transactionHash: string
  purchaseDate: string
  licenseType: string
  price: string
  asset: Asset
}

const ASSET_CATEGORIES = [
  "Photography",
  "Illustrations",
  "Videos",
  "Audio",
  "Templates",
  "Graphics",
  "Icons",
  "Textures",
  "Animations",
]

const ASSET_TYPES = [
  { value: "image", label: "Images", icon: ImageIcon },
  { value: "video", label: "Videos", icon: Video },
  { value: "audio", label: "Audio", icon: Music },
  { value: "template", label: "Templates", icon: FileText },
]

const LICENSE_TYPES = [
  { value: "standard", label: "Standard License", description: "Personal and commercial use" },
  { value: "exclusive", label: "Exclusive License", description: "Exclusive rights to the asset" },
]

export default function MarketPage() {
  const { wallet, role, contracts, provider, displayName } = useUserContext()

  // Asset listing state
  const [listingState, setListingState] = useState<"idle" | "uploading" | "processing" | "success">("idle")
  const [assetFormData, setAssetFormData] = useState({
    title: "",
    description: "",
    type: "image" as Asset["type"],
    category: "",
    tags: [] as string[],
    price: "",
    license: "standard" as Asset["license"],
    file: null as File | null,
  })

  // Assets and purchases state
  const [assets, setAssets] = useState<Asset[]>([])
  const [myAssets, setMyAssets] = useState<Asset[]>([])
  const [myPurchases, setMyPurchases] = useState<Purchase[]>([])
  const [featuredAssets, setFeaturedAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)

  // UI state
  const [activeTab, setActiveTab] = useState("browse")
  const [myAssetsSubTab, setMyAssetsSubTab] = useState("listed")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all-categories")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [sortBy, setSortBy] = useState("newest")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [showListDialog, setShowListDialog] = useState(false)
  const [showAssetDialog, setShowAssetDialog] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)

  // Processing states
  const [processingStates, setProcessingStates] = useState<
    Record<string, { purchasing?: boolean; favoriting?: boolean }>
  >({})

  // Purchase dialog state
  const [purchaseDialogState, setPurchaseDialogState] = useState<
    "idle" | "processing" | "confirming" | "success" | "error"
  >("idle")

  // User data cache
  // const [userDisplayNames, setUserDisplayNames] = useState<Record<string, string>>({})
  const [favoriteAssets, setFavoriteAssets] = useState<string[]>([])

  const assetsPerPage = 12
  const API_BASE_URL = process.env.NEXT_PUBLIC_API

  // Load favorites from localStorage on component mount
  useEffect(() => {
    if (wallet) {
      const savedFavorites = localStorage.getItem(`favorites_${wallet}`)
      if (savedFavorites) {
        try {
          setFavoriteAssets(JSON.parse(savedFavorites))
        } catch (error) {
          console.error("Error loading favorites:", error)
        }
      }
    }
  }, [wallet])

  // Save favorites to localStorage whenever favoriteAssets changes
  useEffect(() => {
    if (wallet) {
      localStorage.setItem(`favorites_${wallet}`, JSON.stringify(favoriteAssets))
    }
  }, [favoriteAssets, wallet])

  // Fetch assets from the API
  const fetchAssets = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/assets`)
      if (!response.ok) {
        throw new Error("Failed to fetch assets")
      }
      const data = await response.json()

      // Transform the data to match the Asset interface exactly as in original
      const transformedAssets: Asset[] = await Promise.all(
        data.map(async (asset: any) => ({
          _id: asset._id,
          id: asset.tokenId,
          title: asset.title,
          description: asset.description,
          type: asset.type || "image", // Use actual type from data
          category: asset.category,
          tags: asset.tags || [],
          price: asset.price,
          currency: "KAS",
          creatorAddress: asset.creatorAddress,
          mimeType: asset.mimeType,
          creatorName: await fetchEmployerDisplayName(asset.creatorAddress),
          thumbnailUrl: `https://gateway.pinata.cloud/ipfs/${asset.fileCid}?height=300&width=400`,
          assetUrl: `https://gateway.pinata.cloud/ipfs/${asset.fileCid}`,
          fileSize: asset.fileSize || "Unknown",
          fileCid: asset.fileCid,
          dimensions: undefined,
          duration: undefined,
          downloads: asset.downloads || 0,
          rating: asset.rating || 0,
          reviewCount: asset.reviewCount || 0,
          createdAt: asset.createdAt,
          featured: false,
          license: asset.license,
          status: asset.status,
        })),
      )

      console.log("Transformed Assets", transformedAssets)
      setAssets(transformedAssets)

      // Set featured assets (top 3 by downloads)
      const featuredAssets = transformedAssets
      setFeaturedAssets(featuredAssets.sort((a: Asset, b: Asset) => b.downloads - a.downloads).slice(0, 3))

      // Filter user's assets if wallet is connected
      if (wallet) {
        setMyAssets(transformedAssets.filter((asset: Asset) => asset.creatorAddress === wallet))
        await fetchPurchases()
      }
    } catch (err) {
      console.error("Error fetching assets:", err)
      toast.error("Failed to fetch assets")
    } finally {
      setLoading(false)
    }
  }

  const fetchPurchases = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/purchases`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch purchases")
      }

      const data = await response.json()

      // Transform the data to match the Purchase interface exactly as in original
      const transformedPurchases: Purchase[] = await Promise.all(
        data.assets.map(async (asset_: any) => ({
          purchaseDate: asset_.purchaseDate,
          licenseType: asset_.licenseType,
          price: asset_.price,
          asset: {
            _id: asset_.asset._id,
            id: asset_.asset.tokenId,
            title: asset_.asset.title,
            description: asset_.asset.description,
            type: asset_.asset.type || "image", // Use the actual type from data
            category: asset_.asset.category,
            tags: asset_.asset.tags || [],
            price: asset_.asset.price,
            currency: "KAS",
            creatorAddress: asset_.asset.creatorAddress,
            mimeType: asset_.asset.mimeType,
            creatorName: await fetchEmployerDisplayName(asset_.asset.creatorAddress),
            thumbnailUrl: `https://gateway.pinata.cloud/ipfs/${asset_.asset.fileCid}?height=300&width=400`,
            assetUrl: `https://gateway.pinata.cloud/ipfs/${asset_.asset.fileCid}`,
            fileSize: asset_.asset.fileSize || "Unknown",
            fileCid: asset_.asset.fileCid,
            dimensions: undefined,
            duration: undefined,
            downloads: asset_.asset.downloads || 0,
            rating: asset_.asset.rating || 0,
            reviewCount: asset_.asset.reviewCount || 0,
            createdAt: asset_.asset.createdAt,
            featured: false,
            license: asset_.asset.license,
            status: asset_.asset.status,
          },
        })),
      )

      setMyPurchases(transformedPurchases)
    } catch (err) {
      console.error("Error fetching purchases:", err)
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [wallet])

  // Handle form inputs
  const handleAssetInputChange = (field: string, value: string | string[] | File | null) => {
    setAssetFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddTag = (tag: string) => {
    if (tag && !assetFormData.tags.includes(tag)) {
      setAssetFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
    }
  }

  const handleRemoveTag = (tag: string) => {
    setAssetFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const resetAssetForm = () => {
    setAssetFormData({
      title: "",
      description: "",
      type: "image",
      category: "",
      tags: [],
      price: "",
      license: "standard",
      file: null,
    })
  }

  // Handle asset listing
  const handleListAsset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!wallet) {
      toast.error("Please connect your wallet first", { duration: 3000 })
      return
    }

    const price = Number.parseFloat(assetFormData.price)
    if (price < 1) {
      toast.error("Minimum price is 1 KAS", { duration: 3000 })
      return
    }

    try {
      setListingState("uploading")

      // Simulate file upload
      // await new Promise((resolve) => setTimeout(resolve, 2000))
      // Step 1: Upload file to Pinata via backend
      const formData = new FormData()
      if (assetFormData.file) {
        formData.append("file", assetFormData.file)
      }

      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API}/upload`, {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("File upload failed")
      }

      const { cid: fileCid, url: fileUrl, size: fileSize, mimeType } = await uploadResponse.json()

      setListingState("processing")

      // Simulate blockchain transaction
      // await new Promise((resolve) => setTimeout(resolve, 3000))

      const metadata = {
        title: assetFormData.title,
        description: assetFormData.description,
        type: assetFormData.type,
        category: assetFormData.category,
        tags: assetFormData.tags,
        price: assetFormData.price,
        license: assetFormData.license,
        fileCid,
        fileUrl,
        fileSize,
        creatorAddress: wallet,
        mimeType,
      }

      const metadataResponse = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API}/metadata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(metadata),
      })

      if (!metadataResponse.ok) {
        throw new Error("Metadata upload failed")
      }

      const { metadataUri, metadataCid } = await metadataResponse.json()

      const signer = await provider?.getSigner()
      let tx

      if (assetFormData.license === "standard") {
        const standardContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_ERC1155_ADDRESS || "",
          STANDARD_LICENSE_1155,
          signer,
        )

        tx = await standardContract.registerStandardAsset(metadataUri, ethers.parseEther(assetFormData.price))
      } else if (assetFormData.license === "exclusive") {
        const exclusiveContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_ERC721_ADDRESS || "",
          EXCLUSIVE_LICENSE_721,
          signer,
        )

        tx = await exclusiveContract.registerExclusiveAsset(metadataUri, ethers.parseEther(assetFormData.price))
      }

      // Wait for the transaction to be mined
      const receipt = await tx.wait()

      console.log("Receipt", receipt)

      // Step 4: Save the asset in the database
      const saveResponse = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API}/assets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          ...metadata,
          metadataUri,
          metadataCid,
          transactionHash: receipt.hash,
        }),
      })

      if (!saveResponse.ok) {
        throw new Error("Failed to save asset in the database")
      }

      setListingState("success")
      toast.success("Asset listed successfully!")

      // Reset form and close dialog
      setTimeout(() => {
        resetAssetForm()
        setListingState("idle")
        setShowListDialog(false)
        fetchAssets()
      }, 2000)
    } catch (err: any) {
      console.error("Error listing asset:", err)
      setListingState("idle")
      toast.error(`Failed to list asset: ${err.message}`, { duration: 5000 })
    }
  }

  // Handle asset purchase
  const handlePurchaseAsset = async (asset: Asset) => {
    if (!wallet) {
      toast.error("Please connect your wallet first", { duration: 3000 })
      return
    }

    try {
      setPurchaseDialogState("processing")

      // Simulate blockchain transaction
      // await new Promise((resolve) => setTimeout(resolve, 3000))

      const signer = await provider?.getSigner()

      let tx
      if (asset.license === "standard") {
        // StandardLicense1155: Call purchaseStandard
        const standardContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_ERC1155_ADDRESS || "",
          STANDARD_LICENSE_1155,
          signer,
        )

        tx = await standardContract.purchaseStandard(asset.id, 1, {
          value: ethers.parseEther(asset.price), // Ensure price is in ETH
        })
      } else if (asset.license === "exclusive") {
        // ExclusiveLicense721: Call purchaseExclusive
        const exclusiveContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_ERC721_ADDRESS || "",
          EXCLUSIVE_LICENSE_721,
          signer,
        )

        tx = await exclusiveContract.purchaseExclusive(asset.id, {
          value: ethers.parseEther(asset.price), // Ensure price is in ETH
        })
      } else {
        throw new Error("Invalid license type")
      }

      // Wait for the transaction to be mined
      const receipt = await tx.wait()

      console.log("receipt", receipt)

      // Send the transaction hash to the backend for confirmation
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API}/mint-${asset.license}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          txHash: receipt.hash,
          assetId: asset.id,
          ...(asset.license === "standard" && { quantity: 1 }), // Include quantity for standard license
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to confirm purchase")
      }

      const data = await response.json()
      console.log("Purchase confirmed:", data)

      setPurchaseDialogState("success")
      toast.success("Asset purchased successfully!")

      // Close dialog after delay
      setTimeout(() => {
        setShowPurchaseDialog(false)
        setSelectedAsset(null)
        setPurchaseDialogState("idle")
        fetchPurchases()
      }, 2000)
    } catch (err: any) {
      console.error("Error purchasing asset:", err)
      setPurchaseDialogState("error")
      toast.error(`Failed to purchase asset: ${err.message}`, { duration: 5000 })

      setTimeout(() => {
        setPurchaseDialogState("idle")
      }, 3000)
    }
  }

  // Handle favorite toggle
  const handleToggleFavorite = async (assetId: string) => {
    if (!wallet) {
      toast.error("Please connect your wallet first", { duration: 3000 })
      return
    }

    try {
      setProcessingStates((prev) => ({
        ...prev,
        [assetId]: { ...prev[assetId], favoriting: true },
      }))

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setFavoriteAssets((prev) => (prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]))

      toast.success(favoriteAssets.includes(assetId) ? "Removed from favorites" : "Added to favorites")
    } catch (err: any) {
      console.error("Error toggling favorite:", err)
      toast.error("Failed to update favorites", { duration: 3000 })
    } finally {
      setProcessingStates((prev) => ({
        ...prev,
        [assetId]: { ...prev[assetId], favoriting: false },
      }))
    }
  }

  // Filter and sort assets
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all-categories" || asset.category === selectedCategory
    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => asset.tags.includes(tag))
    const matchesFavorites = !showFavoritesOnly || favoriteAssets.includes(asset._id)

    const price = Number.parseFloat(asset.price)
    const matchesPrice =
      (!priceRange.min || price >= Number.parseFloat(priceRange.min)) &&
      (!priceRange.max || price <= Number.parseFloat(priceRange.max))

    return matchesSearch && matchesCategory && matchesTags && matchesPrice && matchesFavorites
  })

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "price-low":
        return Number.parseFloat(a.price) - Number.parseFloat(b.price)
      case "price-high":
        return Number.parseFloat(b.price) - Number.parseFloat(a.price)
      case "popular":
        return b.downloads - a.downloads
      case "rating":
        return b.rating - a.rating
      case "name":
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  // Pagination
  const totalPages = Math.ceil(sortedAssets.length / assetsPerPage)
  const startIndex = (currentPage - 1) * assetsPerPage
  const endIndex = startIndex + assetsPerPage
  const currentAssets = sortedAssets.slice(startIndex, endIndex)

  // Get all unique tags
  const allTags = Array.from(new Set(assets.flatMap((asset) => asset.tags)))

  // Get asset type icon
  const getAssetTypeIcon = (type: Asset["type"]) => {
    const typeConfig = ASSET_TYPES.find((t) => t.value === type)
    return typeConfig ? typeConfig.icon : FileImage
  }

  const getAssetTypeText = (type: Asset["type"]) => {
    const typeConfig = ASSET_TYPES.find((t) => t.value === type)
    return typeConfig ? typeConfig.label : "File"
  }

  // Format file size
  const formatFileSize = (size: string) => {
    return size
  }

  // Format duration
  const formatDuration = (duration?: string) => {
    return duration || "N/A"
  }

  const getListingButtonContent = () => {
    switch (listingState) {
      case "uploading":
        return (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Uploading Asset...
          </>
        )
      case "processing":
        return (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        )
      case "success":
        return (
          <>
            <Check className="mr-2 h-5 w-5" />
            Asset Listed!
          </>
        )
      default:
        return (
          <>
            <Upload className="mr-2 h-5 w-5" />
            List Asset
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </>
        )
    }
  }

  const getPurchaseButtonContent = () => {
    switch (purchaseDialogState) {
      case "processing":
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Purchase...
          </>
        )
      case "success":
        return (
          <>
            <Check className="mr-2 h-4 w-4" />
            Purchased!
          </>
        )
      case "error":
        return (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            Failed to Purchase
          </>
        )
      default:
        return (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Purchase License
          </>
        )
    }
  }

  // Helper function to check if mimeType is an image
  const isImage = (mimeType: string) => {
    if (!mimeType) return false
    return mimeType.startsWith("image/")
  }

  // Helper function to check if mimeType is a video
  const isVideo = (mimeType: string) => {
    if (!mimeType) return false
    return mimeType.startsWith("video/")
  }

  // Alternative version with more specific checks (if you want to be more restrictive)
  const isImageSpecific = (mimeType: string) => {
    if (!mimeType) return false
    const imageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/bmp",
      "image/tiff",
    ]
    return imageTypes.includes(mimeType.toLowerCase())
  }

  const isVideoSpecific = (mimeType: string) => {
    if (!mimeType) return false
    const videoTypes = [
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/wmv",
      "video/flv",
      "video/webm",
      "video/mkv",
      "video/quicktime",
    ]
    return videoTypes.includes(mimeType.toLowerCase())
  }

  const isListing = listingState !== "idle"
  const isPurchasing = purchaseDialogState !== "idle"

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <motion.section
        className="w-full min-h-[50vh] flex flex-col justify-center items-center text-center relative overflow-hidden py-16"
        initial="hidden"
        animate="visible"
        variants={staggerContainer(0.1, 0.1)}
      >
        <div className="container px-4 md:px-6 relative z-10">
          <motion.h1
            variants={fadeIn(0.1)}
            className="font-varien text-[3rem] font-bold tracking-wider sm:text-[2rem] md:text-[3rem] lg:text-[4rem] text-foreground mb-6"
          >
            Asset <span className="text-accent">Marketplace</span>
          </motion.h1>
          <motion.p
            variants={fadeIn(0.2)}
            className="mt-6 max-w-3xl mx-auto text-muted-foreground md:text-lg lg:text-xl font-varela"
          >
            <Balancer>
              Discover, buy, and sell high-quality digital assets. From stunning photography to professional videos, 3D
              models, and audio tracks - find everything you need for your creative projects.
            </Balancer>
          </motion.p>

          {/* Featured Stats */}
          <motion.div variants={fadeIn(0.3)} className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-accent font-varien">10K+</div>
              <div className="text-sm text-muted-foreground font-varela">Assets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-accent font-varien">5K+</div>
              <div className="text-sm text-muted-foreground font-varela">Creators</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-accent font-varien">50K+</div>
              <div className="text-sm text-muted-foreground font-varela">Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-accent font-varien">4.8★</div>
              <div className="text-sm text-muted-foreground font-varela">Avg Rating</div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Featured Assets Section */}
      <SectionWrapper id="featured-assets" padding="py-12 md:py-16">
        <motion.div variants={fadeIn()} className="text-center mb-12">
          <h2 className="font-varien text-3xl font-bold tracking-wider sm:text-4xl text-foreground">
            Featured <span className="text-accent">Assets</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground font-varela">
            <Balancer>Handpicked premium assets from our top creators</Balancer>
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.1)}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {featuredAssets.slice(0, 6).map((asset, i) => {
            return (
              <motion.div key={asset._id} variants={fadeIn(i * 0.1)}>
                <InteractiveCard className="h-full group">
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    {asset.thumbnailUrl ? (
                      isImage(asset.mimeType) ? (
                        <img
                          src={asset.thumbnailUrl || "/placeholder.svg"}
                          alt="Asset"
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : isVideo(asset.mimeType) ? (
                        <video
                          src={asset.thumbnailUrl}
                          controls
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                          autoPlay
                        />
                      ) : (
                        <div className="w-full h-48 flex items-center justify-center bg-gray-200 text-gray-500">
                          Unsupported file type
                        </div>
                      )
                    ) : (
                      <img src="/placeholder.svg" alt="Placeholder" className="w-full h-48 object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-3 right-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-0"
                        onClick={() => handleToggleFavorite(asset._id)}
                        disabled={processingStates[asset._id]?.favoriting}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            favoriteAssets.includes(asset._id) ? "fill-red-500 text-red-500" : "text-white"
                          }`}
                        />
                      </Button>
                    </div>
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-0"
                          onClick={() => {
                            setSelectedAsset(asset)
                            setShowAssetDialog(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-0"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="font-varien text-lg font-semibold text-foreground mb-1 line-clamp-1">
                        {asset.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 font-varela">{asset.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={`https://effigy.im/a/${asset.creatorAddress}.svg`}
                          alt={asset.creatorName || asset.creatorAddress}
                        />
                        <AvatarFallback className="bg-accent/10 text-accent text-xs">
                          {asset.creatorAddress.charAt(2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground font-varela">
                        {asset.creatorName || `${asset.creatorAddress.slice(0, 6)}...${asset.creatorAddress.slice(-4)}`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{asset.rating}</span>
                        <span className="text-sm text-muted-foreground">({asset.reviewCount})</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{asset.downloads} downloads</div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {asset.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {asset.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{asset.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1">
                        <img
                          src="/kaslogo.webp"
                          alt="KAS"
                          className="h-4 w-4 filter-none"
                          style={{ filter: "none", imageRendering: "crisp-edges" }}
                        />
                        <span className="font-varien text-lg font-bold text-foreground">{asset.price} KAS</span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-accent hover:bg-accent-hover text-accent-foreground font-varien"
                        onClick={() => {
                          setSelectedAsset(asset)
                          setShowPurchaseDialog(true)
                        }}
                      >
                        <ShoppingCart className="mr-1 h-4 w-4" />
                        Buy Now
                      </Button>
                    </div>
                  </div>
                </InteractiveCard>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div variants={fadeIn()} className="text-center">
          <Button
            variant="outline"
            size="lg"
            className="border-accent/50 text-accent hover:bg-accent/10 bg-transparent font-varien"
            onClick={() => setActiveTab("browse")}
          >
            Browse All Assets
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </SectionWrapper>

      {/* Main Content */}
      <SectionWrapper id="main-content" padding="pt-0 md:pt-2 pb-12 md:pb-16">
        <motion.div variants={fadeIn()} className="w-full max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="browse" className="flex items-center gap-2 font-varien">
                <Search className="h-4 w-4" />
                Browse Assets
              </TabsTrigger>
              <TabsTrigger value="my-assets" className="flex items-center gap-2 font-varien">
                <FileText className="h-4 w-4" />
                My Assets
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2 font-varien">
                <Plus className="h-4 w-4" />
                List Asset
              </TabsTrigger>
            </TabsList>

            {/* Browse Assets Tab */}
            <TabsContent value="browse" className="space-y-6">
              {/* Search and Filters */}
              <motion.div variants={fadeIn(0.1)} className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search assets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-border focus:border-accent font-varela"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={showFavoritesOnly ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                      className={`border-accent/30 ${showFavoritesOnly ? "bg-accent text-accent-foreground" : "hover:bg-accent/10"}`}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${showFavoritesOnly ? "fill-current" : ""}`} />
                      Favorites
                    </Button>

                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full sm:w-48 border-border focus:border-accent">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-categories">All Categories</SelectItem>
                        {ASSET_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full sm:w-40 border-border focus:border-accent">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="name">Name A-Z</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                      <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setViewMode("grid")}
                        className="border-accent/30"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setViewMode("list")}
                        className="border-accent/30"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-varien">Price Range:</Label>
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
                      className="w-20 h-8 text-sm border-border focus:border-accent"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
                      className="w-20 h-8 text-sm border-border focus:border-accent"
                    />
                    <span className="text-sm text-muted-foreground">KAS</span>
                  </div>

                  {(priceRange.min || priceRange.max) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPriceRange({ min: "", max: "" })}
                      className="h-8 px-2 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                {/* Tag Filters */}
                <div className="flex flex-wrap gap-2">
                  {allTags.slice(0, 15).map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedTags.includes(tag) ? "bg-accent text-accent-foreground" : "hover:bg-accent/10"
                      }`}
                      onClick={() => {
                        setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                  {selectedTags.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTags([])} className="h-6 px-2 text-xs">
                      Clear All
                    </Button>
                  )}
                </div>
              </motion.div>

              {/* Assets Grid/List */}
              <motion.div
                variants={staggerContainer(0.05)}
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }
              >
                <AnimatePresence>
                  {currentAssets.map((asset, i) => {
                    return (
                      <motion.div
                        key={asset._id}
                        variants={fadeIn(i * 0.05)}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        layout
                      >
                        {viewMode === "grid" ? (
                          <InteractiveCard className="h-full group">
                            <div className="relative overflow-hidden rounded-lg mb-4">
                              {asset.thumbnailUrl ? (
                                isImage(asset.mimeType) ? (
                                  <img
                                    src={asset.thumbnailUrl || "/placeholder.svg"}
                                    alt="Asset"
                                    className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                ) : isVideo(asset.mimeType) ? (
                                  <video
                                    src={asset.thumbnailUrl}
                                    controls
                                    className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                                    autoPlay
                                  />
                                ) : (
                                  <div className="w-full h-40 flex items-center justify-center bg-gray-200 text-gray-500">
                                    Unsupported file type
                                  </div>
                                )
                              ) : (
                                <img src="/placeholder.svg" alt="Placeholder" className="w-full h-40 object-cover" />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <div className="absolute top-2 right-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 bg-black/50 hover:bg-black/70 text-white border-0"
                                  onClick={() => handleToggleFavorite(asset._id)}
                                  disabled={processingStates[asset._id]?.favoriting}
                                >
                                  <Heart
                                    className={`h-3 w-3 ${
                                      favoriteAssets.includes(asset._id) ? "fill-red-500 text-red-500" : "text-white"
                                    }`}
                                  />
                                </Button>
                              </div>
                              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 bg-black/50 hover:bg-black/70 text-white border-0"
                                    onClick={() => {
                                      setSelectedAsset(asset)
                                      setShowAssetDialog(true)
                                    }}
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 bg-black/50 hover:bg-black/70 text-white border-0"
                                  >
                                    <Share2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h3 className="font-varien text-sm font-semibold text-foreground line-clamp-1">
                                {asset.title}
                              </h3>
                              <p className="text-xs text-muted-foreground line-clamp-2 font-varela">
                                {asset.description}
                              </p>

                              <div className="flex items-center gap-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage
                                    src={`https://effigy.im/a/${asset.creatorAddress}.svg`}
                                    alt={asset.creatorName || asset.creatorAddress}
                                  />
                                  <AvatarFallback className="bg-accent/10 text-accent text-xs">
                                    {asset.creatorAddress.charAt(2)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground font-varela truncate">
                                  {asset.creatorName || `${asset.creatorAddress.slice(0, 6)}...`}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span>{asset.rating}</span>
                                  <span className="text-muted-foreground">({asset.reviewCount})</span>
                                </div>
                                <span className="text-muted-foreground">{asset.downloads} downloads</span>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                <div className="flex items-center gap-1">
                                  <img
                                    src="/kaslogo.webp"
                                    alt="KAS"
                                    className="h-3 w-3 filter-none"
                                    style={{ filter: "none", imageRendering: "crisp-edges" }}
                                  />
                                  <span className="font-varien text-sm font-bold text-foreground">{asset.price}</span>
                                </div>
                                <Button
                                  size="sm"
                                  className="bg-accent hover:bg-accent-hover text-accent-foreground font-varien h-7 px-2 text-xs"
                                  onClick={() => {
                                    setSelectedAsset(asset)
                                    setShowPurchaseDialog(true)
                                  }}
                                >
                                  <ShoppingCart className="mr-1 h-3 w-3" />
                                  Buy
                                </Button>
                              </div>
                            </div>
                          </InteractiveCard>
                        ) : (
                          <InteractiveCard className="p-4">
                            <div className="flex gap-4">
                              <div className="relative flex-shrink-0">
                                <img
                                  src={asset.thumbnailUrl || "/placeholder.svg"}
                                  alt={asset.title}
                                  className="w-24 h-24 object-cover rounded-lg"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-varien text-lg font-semibold text-foreground line-clamp-1">
                                    {asset.title}
                                  </h3>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 flex-shrink-0"
                                    onClick={() => handleToggleFavorite(asset._id)}
                                    disabled={processingStates[asset._id]?.favoriting}
                                  >
                                    <Heart
                                      className={`h-4 w-4 ${
                                        favoriteAssets.includes(asset._id)
                                          ? "fill-red-500 text-red-500"
                                          : "text-muted-foreground"
                                      }`}
                                    />
                                  </Button>
                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3 font-varela">
                                  {asset.description}
                                </p>

                                <div className="flex items-center gap-4 mb-3 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage
                                        src={`https://effigy.im/a/${asset.creatorAddress}.svg`}
                                        alt={asset.creatorName || asset.creatorAddress}
                                      />
                                      <AvatarFallback className="bg-accent/10 text-accent text-xs">
                                        {asset.creatorAddress.charAt(2)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-muted-foreground font-varela">
                                      {asset.creatorName ||
                                        `${asset.creatorAddress.slice(0, 6)}...${asset.creatorAddress.slice(-4)}`}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span>{asset.rating}</span>
                                    <span className="text-muted-foreground">({asset.reviewCount})</span>
                                  </div>

                                  <span className="text-muted-foreground">{asset.downloads} downloads</span>
                                </div>

                                <div className="flex flex-wrap gap-1 mb-3">
                                  {asset.tags.slice(0, 4).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {asset.tags.length > 4 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{asset.tags.length - 4}
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    <img
                                      src="/kaslogo.webp"
                                      alt="KAS"
                                      className="h-4 w-4 filter-none"
                                      style={{ filter: "none", imageRendering: "crisp-edges" }}
                                    />
                                    <span className="font-varien text-lg font-bold text-foreground">
                                      {asset.price} KAS
                                    </span>
                                  </div>

                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-accent/50 text-accent hover:bg-accent/10 bg-transparent font-varien"
                                      onClick={() => {
                                        setSelectedAsset(asset)
                                        setShowAssetDialog(true)
                                      }}
                                    >
                                      <Eye className="mr-1 h-4 w-4" />
                                      View
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="bg-accent hover:bg-accent-hover text-accent-foreground font-varien"
                                      onClick={() => {
                                        setSelectedAsset(asset)
                                        setShowPurchaseDialog(true)
                                      }}
                                    >
                                      <ShoppingCart className="mr-1 h-4 w-4" />
                                      Buy Now
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </InteractiveCard>
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  variants={fadeIn(0.3)}
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-6 bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5 rounded-xl border border-accent/20"
                >
                  <div className="text-sm text-muted-foreground font-varela">
                    Showing <span className="font-semibold text-accent">{startIndex + 1}</span> to{" "}
                    <span className="font-semibold text-accent">{Math.min(endIndex, sortedAssets.length)}</span> of{" "}
                    <span className="font-semibold text-accent">{sortedAssets.length}</span> assets
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="border-accent/30 hover:bg-accent/10"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="border-accent/30 hover:bg-accent/10"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + Math.max(1, currentPage - 2)
                      if (page > totalPages) return null
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-[2.5rem] ${
                            currentPage === page
                              ? "bg-accent text-accent-foreground"
                              : "border-accent/30 hover:bg-accent/10"
                          }`}
                        >
                          {page}
                        </Button>
                      )
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="border-accent/30 hover:bg-accent/10"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="border-accent/30 hover:bg-accent/10"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Empty State */}
              {sortedAssets.length === 0 && !loading && (
                <motion.div variants={fadeIn()} className="flex justify-center">
                  <InteractiveCard className="max-w-md w-full flex flex-col items-center justify-center text-center py-10">
                    <div className="flex justify-center mb-4">
                      <Search className="h-12 w-12 text-accent" />
                    </div>
                    <h3 className="font-varien text-lg font-semibold text-foreground mb-2">No Assets Found</h3>
                    <p className="text-sm text-muted-foreground font-varela">
                      {searchTerm ||
                      selectedTags.length > 0 ||
                      selectedCategory !== "all-categories" ||
                      showFavoritesOnly
                        ? "Try adjusting your search criteria"
                        : "Be the first to list an asset!"}
                    </p>
                  </InteractiveCard>
                </motion.div>
              )}
            </TabsContent>

            {/* My Assets Tab */}
            <TabsContent value="my-assets" className="space-y-6">
              <Tabs value={myAssetsSubTab} onValueChange={setMyAssetsSubTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="listed" className="flex items-center gap-2 font-varien">
                    <Upload className="h-4 w-4" />
                    My Listed Assets ({myAssets.length})
                  </TabsTrigger>
                  <TabsTrigger value="purchased" className="flex items-center gap-2 font-varien">
                    <Download className="h-4 w-4" />
                    My Purchases ({myPurchases.length})
                  </TabsTrigger>
                </TabsList>

                {/* My Listed Assets */}
                <TabsContent value="listed" className="space-y-6">
                  <motion.div
                    variants={staggerContainer(0.1)}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {myAssets.map((asset, i) => {
                      return (
                        <motion.div key={asset._id} variants={fadeIn(i * 0.1)}>
                          <InteractiveCard className="h-full">
                            <div className="relative overflow-hidden rounded-lg mb-4">
                              {asset.thumbnailUrl ? (
                                isImage(asset.mimeType) ? (
                                  <img
                                    src={asset.thumbnailUrl || "/placeholder.svg"}
                                    alt="Asset"
                                    className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                ) : isVideo(asset.mimeType) ? (
                                  <video
                                    src={asset.thumbnailUrl}
                                    controls
                                    className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                                    autoPlay
                                  />
                                ) : (
                                  <div className="w-full h-40 flex items-center justify-center bg-gray-200 text-gray-500">
                                    Unsupported file type
                                  </div>
                                )
                              ) : (
                                <img src="/placeholder.svg" alt="Placeholder" className="w-full h-40 object-cover" />
                              )}
                              <div className="absolute top-2 right-2 flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 bg-black/50 hover:bg-black/70 text-white border-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 bg-black/50 hover:bg-black/70 text-red-400 border-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <h3 className="font-varien text-lg font-semibold text-foreground mb-1 line-clamp-1">
                                  {asset.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 font-varela">
                                  {asset.description}
                                </p>
                              </div>

                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Status:</span>
                                  <Badge
                                    variant={
                                      asset.status === "active"
                                        ? "default"
                                        : asset.status === "pending"
                                          ? "secondary"
                                          : "outline"
                                    }
                                    className={
                                      asset.status === "active"
                                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                                        : asset.status === "pending"
                                          ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                                          : "bg-gray-500/10 text-gray-600 border-gray-500/20"
                                    }
                                  >
                                    {asset.status}
                                  </Badge>
                                </div>

                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Downloads:</span>
                                  <span className="font-medium text-foreground">{asset.downloads}</span>
                                </div>

                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Rating:</span>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span className="font-medium text-foreground">{asset.rating}</span>
                                    <span className="text-muted-foreground">({asset.reviewCount})</span>
                                  </div>
                                </div>

                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Price:</span>
                                  <div className="flex items-center gap-1">
                                    <img
                                      src="/kaslogo.webp"
                                      alt="KAS"
                                      className="h-3 w-3 filter-none"
                                      style={{ filter: "none", imageRendering: "crisp-edges" }}
                                    />
                                    <span className="font-medium text-foreground">{asset.price} KAS</span>
                                  </div>
                                </div>

                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Listed:</span>
                                  <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </InteractiveCard>
                        </motion.div>
                      )
                    })}

                    {myAssets.length === 0 && (
                      <motion.div variants={fadeIn()} className="flex justify-center">
                        <InteractiveCard className="max-w-md w-full flex flex-col items-center justify-center text-center py-10">
                          <div className="flex justify-center mb-4">
                            <FileText className="h-12 w-12 text-accent" />
                          </div>
                          <h3 className="font-varien text-lg font-semibold text-foreground mb-2">No Assets Listed</h3>
                          <p className="text-sm text-muted-foreground font-varela">
                            List your first asset to start selling!
                          </p>
                        </InteractiveCard>
                      </motion.div>
                    )}
                  </motion.div>
                </TabsContent>

                {/* My Purchased Assets */}
                <TabsContent value="purchased" className="space-y-6">
                  <motion.div
                    variants={staggerContainer(0.1)}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {myPurchases.map((purchase, i) => (
                      <motion.div key={purchase.asset._id} variants={fadeIn(i * 0.1)}>
                        <InteractiveCard className="h-full">
                          <div className="relative overflow-hidden rounded-lg mb-4">
                            {purchase.asset.thumbnailUrl ? (
                              isImage(purchase.asset.mimeType) ? (
                                <img
                                  src={purchase.asset.thumbnailUrl || "/placeholder.svg"}
                                  alt="Asset"
                                  className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : isVideo(purchase.asset.mimeType) ? (
                                <video
                                  src={purchase.asset.thumbnailUrl}
                                  controls
                                  className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                                  autoPlay
                                />
                              ) : (
                                <div className="w-full h-40 flex items-center justify-center bg-gray-200 text-gray-500">
                                  Unsupported file type
                                </div>
                              )
                            ) : (
                              <img src="/placeholder.svg" alt="Placeholder" className="w-full h-40 object-cover" />
                            )}
                          </div>

                          <div className="space-y-3">
                            <div>
                              <h3 className="font-varien text-lg font-semibold text-foreground mb-1 line-clamp-1">
                                {purchase.asset.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 font-varela">
                                {purchase.asset.description}
                              </p>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">License Type:</span>
                                <span className="font-medium text-foreground">{purchase.licenseType}</span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Purchase Date:</span>
                                <span className="font-medium text-foreground">
                                  {new Date(purchase.purchaseDate).toLocaleDateString()}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Price:</span>
                                <div className="flex items-center gap-1">
                                  <img
                                    src="/kaslogo.webp"
                                    alt="KAS"
                                    className="h-3 w-3 filter-none"
                                    style={{ filter: "none", imageRendering: "crisp-edges" }}
                                  />
                                  <span className="font-medium text-foreground">{purchase.price} KAS</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </InteractiveCard>
                      </motion.div>
                    ))}

                    {myPurchases.length === 0 && (
                      <motion.div variants={fadeIn()} className="flex justify-center">
                        <InteractiveCard className="max-w-md w-full flex flex-col items-center justify-center text-center py-10">
                          <div className="flex justify-center mb-4">
                            <ShoppingCart className="h-12 w-12 text-accent" />
                          </div>
                          <h3 className="font-varien text-lg font-semibold text-foreground mb-2">No Purchases Yet</h3>
                          <p className="text-sm text-muted-foreground font-varela">
                            Browse the marketplace and discover amazing assets!
                          </p>
                        </InteractiveCard>
                      </motion.div>
                    )}
                  </motion.div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* List Asset Tab */}
            <TabsContent value="list" className="space-y-6">
              <motion.div variants={fadeIn()} className="max-w-3xl mx-auto">
                <Dialog open={showListDialog} onOpenChange={setShowListDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full border-accent/50 text-accent hover:bg-accent/10 bg-transparent font-varien group"
                    >
                      {getListingButtonContent()}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="font-varien">List a New Asset</DialogTitle>
                      <DialogDescription className="font-varela">
                        Fill in the details below to list your asset on the marketplace.
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleListAsset} className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right font-varien">
                          Title
                        </Label>
                        <Input
                          type="text"
                          id="title"
                          value={assetFormData.title}
                          onChange={(e) => handleAssetInputChange("title", e.target.value)}
                          className="col-span-3 font-varela"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="description" className="text-right font-varien">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          value={assetFormData.description}
                          onChange={(e) => handleAssetInputChange("description", e.target.value)}
                          className="col-span-3 font-varela"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right font-varien">
                          Type
                        </Label>
                        <Select
                          value={assetFormData.type}
                          onValueChange={(value) => handleAssetInputChange("type", value)}
                        >
                          <SelectTrigger className="col-span-3 w-full border-border focus:border-accent">
                            <SelectValue placeholder="Select asset type" />
                          </SelectTrigger>
                          <SelectContent>
                            {ASSET_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right font-varien">
                          Category
                        </Label>
                        <Select
                          value={assetFormData.category}
                          onValueChange={(value) => handleAssetInputChange("category", value)}
                        >
                          <SelectTrigger className="col-span-3 w-full border-border focus:border-accent">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {ASSET_CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tags" className="text-right font-varien">
                          Tags
                        </Label>
                        <div className="col-span-3 flex items-center gap-2">
                          <Input
                            type="text"
                            id="tags"
                            placeholder="Add tags..."
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                handleAddTag(e.target.value)
                                e.currentTarget.value = "" // Clear the input after adding the tag
                              }
                            }}
                            className="font-varela"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-varien">Selected Tags</Label>
                        <div className="col-span-3 flex flex-wrap gap-2">
                          {assetFormData.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => handleRemoveTag(tag)}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right font-varien">
                          Price (KAS)
                        </Label>
                        <Input
                          type="number"
                          id="price"
                          value={assetFormData.price}
                          onChange={(e) => handleAssetInputChange("price", e.target.value)}
                          className="col-span-3 font-varela"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="license" className="text-right font-varien">
                          License
                        </Label>
                        <Select
                          value={assetFormData.license}
                          onValueChange={(value) => handleAssetInputChange("license", value)}
                        >
                          <SelectTrigger className="col-span-3 w-full border-border focus:border-accent">
                            <SelectValue placeholder="Select license type" />
                          </SelectTrigger>
                          <SelectContent>
                            {LICENSE_TYPES.map((license) => (
                              <SelectItem key={license.value} value={license.value}>
                                {license.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="file" className="text-right font-varien">
                          File
                        </Label>
                        <Input
                          type="file"
                          id="file"
                          onChange={(e) => handleAssetInputChange("file", e.target.files ? e.target.files[0] : null)}
                          className="col-span-3 font-varela"
                          required
                        />
                      </div>

                      <DialogFooter>
                        <Button type="submit" disabled={isListing}>
                          {getListingButtonContent()}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </SectionWrapper>

      {/* Asset Dialog */}
      <Dialog open={showAssetDialog} onOpenChange={setShowAssetDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="font-varien">Asset Details</DialogTitle>
            <DialogDescription className="font-varela">
              Learn more about this asset before making a purchase.
            </DialogDescription>
          </DialogHeader>

          {selectedAsset && (
            <div className="space-y-4 py-4">
              <div className="relative overflow-hidden rounded-lg">
                {selectedAsset.thumbnailUrl ? (
                  isImage(selectedAsset.mimeType) ? (
                    <img
                      src={selectedAsset.thumbnailUrl || "/placeholder.svg"}
                      alt="Asset"
                      className="w-full h-64 object-cover"
                    />
                  ) : isVideo(selectedAsset.mimeType) ? (
                    <video src={selectedAsset.thumbnailUrl} controls className="w-full h-64 object-cover" autoPlay />
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center bg-gray-200 text-gray-500">
                      Unsupported file type
                    </div>
                  )
                ) : (
                  <img src="/placeholder.svg" alt="Placeholder" className="w-full h-64 object-cover" />
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-varien text-2xl font-semibold text-foreground">{selectedAsset.title}</h3>
                <p className="text-muted-foreground font-varela">{selectedAsset.description}</p>
              </div>

              <div className="flex items-center gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`https://effigy.im/a/${selectedAsset.creatorAddress}.svg`}
                    alt={selectedAsset.creatorName || selectedAsset.creatorAddress}
                  />
                  <AvatarFallback className="bg-accent/10 text-accent text-xs">
                    {selectedAsset.creatorAddress.charAt(2)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground font-varela">
                  {selectedAsset.creatorName ||
                    `${selectedAsset.creatorAddress.slice(0, 6)}...${selectedAsset.creatorAddress.slice(-4)}`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium text-foreground"> {getAssetTypeText(selectedAsset.type)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium text-foreground"> {selectedAsset.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">File Size:</span>
                  <span className="font-medium text-foreground"> {formatFileSize(selectedAsset.fileSize)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Downloads:</span>
                  <span className="font-medium text-foreground"> {selectedAsset.downloads}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Rating:</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-foreground">{selectedAsset.rating}</span>
                    <span className="text-muted-foreground">({selectedAsset.reviewCount})</span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">License:</span>
                  <span className="font-medium text-foreground"> {selectedAsset.license}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedAsset.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <img
                    src="/kaslogo.webp"
                    alt="KAS"
                    className="h-5 w-5 filter-none"
                    style={{ filter: "none", imageRendering: "crisp-edges" }}
                  />
                  <span className="font-varien text-3xl font-bold text-foreground">{selectedAsset.price} KAS</span>
                </div>
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent-hover text-accent-foreground font-varien"
                  onClick={() => {
                    setShowAssetDialog(false)
                    setShowPurchaseDialog(true)
                  }}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Buy Now
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowAssetDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="font-varien">Confirm Purchase</DialogTitle>
            <DialogDescription className="font-varela">Are you sure you want to purchase this asset?</DialogDescription>
          </DialogHeader>

          {selectedAsset && (
            <div className="space-y-4 py-4">
              <div className="relative overflow-hidden rounded-lg">
                {selectedAsset.thumbnailUrl ? (
                  isImage(selectedAsset.mimeType) ? (
                    <img
                      src={selectedAsset.thumbnailUrl || "/placeholder.svg"}
                      alt="Asset"
                      className="w-full h-40 object-cover"
                    />
                  ) : isVideo(selectedAsset.mimeType) ? (
                    <video src={selectedAsset.thumbnailUrl} controls className="w-full h-40 object-cover" autoPlay />
                  ) : (
                    <div className="w-full h-40 flex items-center justify-center bg-gray-200 text-gray-500">
                      Unsupported file type
                    </div>
                  )
                ) : (
                  <img src="/placeholder.svg" alt="Placeholder" className="w-full h-40 object-cover" />
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-varien text-xl font-semibold text-foreground">{selectedAsset.title}</h3>
                <p className="text-muted-foreground font-varela">{selectedAsset.description}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <img
                    src="/kaslogo.webp"
                    alt="KAS"
                    className="h-4 w-4 filter-none"
                    style={{ filter: "none", imageRendering: "crisp-edges" }}
                  />
                  <span className="font-varien text-2xl font-bold text-foreground">{selectedAsset.price} KAS</span>
                </div>
                <Badge variant="secondary">{selectedAsset.license} License</Badge>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowPurchaseDialog(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => selectedAsset && handlePurchaseAsset(selectedAsset)}
              disabled={isPurchasing}
            >
              {getPurchaseButtonContent()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
