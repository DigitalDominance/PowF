"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  Copy,
  Check,
  ExternalLink,
  Briefcase,
  User,
  MessageSquare,
  Send,
  Loader2,
  Wallet,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAppKit, useDisconnect } from "@reown/appkit/react";
import axios from "axios";
import { useUserContext } from "@/context/UserContext";
import { Badge } from "@/components/ui/badge";

function truncateAddress(address: string | undefined) {
  if (!address) return "No Address";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function ConnectWallet() {
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const {
    provider,
    address,
    isConnected,
    displayName,
    role,
    setUserData,
    sendP2PMessage,
    fetchP2PMessages,
    fetchConversations,
    isReAuthenticating,
    setIsReAuthenticating,
  } = useUserContext();

  const [isSigned, setIsSigned] = useState(false);
  const [displayName_, setDisplayName_] = useState("");
  const [challenge, setChallenge] = useState("");
  const [copied, setCopied] = useState(false);
  const [role_, setRole_] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const isSigningUpRef = useRef(false);
  const isReAuthenticatingRef = useRef(false);
  const [isDisconnected, setIsDisconnected] = useState(false);

  const [showMessagesPopup, setShowMessagesPopup] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    isSigningUpRef.current = isSigningUp;
    isReAuthenticatingRef.current = isReAuthenticating;
  }, [isSigningUp, isReAuthenticating]);

  // call reauthentication on wallet connect
  useEffect(() => {
    if (isConnected && address) {
      // only attempt if not already reauthenticating
      if (!isReAuthenticatingRef.current) {
        handleReAuthentication();
      }
    }
  }, [isConnected, address]);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Address copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getBlockExplorerUrl = () => {
    return address
      ? `https://frontend.kasplextest.xyz/address/${address}`
      : "#";
  };

  const handleConnectWallet = async () => {
    console.log("connect");
    await open();
  };

  const renderRoleIcon = () => {
    if (role === "employer") {
      return (
        <span className="flex items-center gap-1 text-green-500">
          <Briefcase className="h-4 w-4" /> Employer
        </span>
      );
    } else if (role === "worker") {
      return (
        <span className="flex items-center gap-1 text-blue-500">
          <User className="h-4 w-4" /> Worker
        </span>
      );
    }
    return null;
  };

  const handleDisconnect = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUserData({ wallet: "", displayName: "", role: "" });
    disconnect();
    setIsAuthenticating(false);
    setIsReAuthenticating(false);
    isReAuthenticatingRef.current = false;
    setIsDisconnected(true);
    toast.success("Disconnected successfully!");
  };

  const handleReAuthentication = async () => {
    if (
      !isConnected ||
      !address ||
      isSigningUpRef.current ||
      isReAuthenticatingRef.current ||
      isDisconnected
    ) {
      console.log("Skipping re-authentication.");
      return;
    }
    try {
      setIsReAuthenticating(true);
      isReAuthenticatingRef.current = true;
      toast.info("Re-authenticating...");
      const {
        data: { challenge },
      } = await axios.post(`${process.env.NEXT_PUBLIC_API}/auth/challenge`, { wallet: address });
      const signer = await provider?.getSigner();
      const {
        data: { accessToken, refreshToken },
      } = await axios.post(`${process.env.NEXT_PUBLIC_API}/auth/verify`, {
        wallet: address,
        signature: await signer?.signMessage(challenge),
        displayName: displayName_,
        role: role_,
      });
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      toast.success("Re-authentication successful!");
    } catch (error) {
      console.error("Re-authentication failed:", error);
      toast.error("Re-authentication failed. Please reconnect your wallet.");
      handleDisconnect();
    } finally {
      setIsReAuthenticating(false);
      isReAuthenticatingRef.current = false;
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsAuthenticating(true);
        const head = await axios.head(`${process.env.NEXT_PUBLIC_API}/users/${address}`);
        if (head.status === 200) {
          const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API}/users/${address}`);
          setUserData({ wallet: data.wallet, displayName: data.displayName, role: data.role });
          toast.success("User exists!");
        } else {
          toast.error("User not found!");
        }
      } catch {
        try {
          toast.info("Authenticating user...");
          const {
            data: { challenge },
          } = await axios.post(`${process.env.NEXT_PUBLIC_API}/auth/challenge`, { wallet: address });
          setChallenge(challenge);
          setIsSigningUp(true);
          setIsSigned(true);
        } catch {
          toast.error("Authentication failed!");
        }
      } finally {
        setIsAuthenticating(false);
      }
    };

    if (isConnected && address && provider && !isAuthenticating) {
      fetchUser();
    }
  }, [address, isConnected, provider]);

  axios.interceptors.response.use(
    (res) => res,
    async (err) => {
      if (err.response?.status === 401) {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!isConnected || !address || isSigningUpRef.current) {
          return Promise.reject(err);
        }
        if (refreshToken && !isReAuthenticatingRef.current) {
          setIsReAuthenticating(true);
          try {
            const {
              data: { accessToken },
            } = await axios.post(`${process.env.NEXT_PUBLIC_API}/auth/refresh`, { refreshToken });
            localStorage.setItem("accessToken", accessToken);
            err.config.headers["Authorization"] = `Bearer ${accessToken}`;
            setIsReAuthenticating(false);
            return axios(err.config);
          } catch {
            setIsReAuthenticating(false);
            handleDisconnect();
            toast.error("Session expired. Please reconnect your wallet.");
          }
        }
        if (!isReAuthenticatingRef.current) {
          await handleReAuthentication();
          return axios(err.config);
        }
      }
      return Promise.reject(err);
    }
  );

  const handleSubmitDisplayName = async () => {
    try {
      const signer = await provider?.getSigner();
      const {
        data: { accessToken, refreshToken },
      } = await axios.post(`${process.env.NEXT_PUBLIC_API}/auth/verify`, {
        wallet: address,
        signature: await signer?.signMessage(challenge),
        displayName: displayName_,
        role: role_,
      });
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setUserData({ wallet: address || "", displayName: displayName_, role: role_ });
      toast.success("Authentication successful!");
      setIsSigned(false);
    } catch {
      toast.error("Failed to submit display name!");
    }
  };

  const fetchConversationsFromContext = async () => {
    if (!address || isReAuthenticatingRef.current) return;
    setIsLoadingConversations(true);
    try {
      const convos = await fetchConversations();
      setConversations(convos);
    } catch {
      toast.error("Failed to load conversations");
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const fetchConversationMessages = async (otherParty: string) => {
    if (!address || isReAuthenticatingRef.current) return;
    setIsLoadingMessages(true);
    try {
      const msgs = await fetchP2PMessages(otherParty);
      setConversationMessages(msgs);
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (
      !newMessage.trim() ||
      !selectedConversation ||
      !address ||
      isReAuthenticatingRef.current
    )
      return;
    setIsSendingMessage(true);
    try {
      await sendP2PMessage(selectedConversation.otherPartyAddress, newMessage.trim());
      const optimistic = {
        sender: address,
        receiver: selectedConversation.otherPartyAddress,
        content: newMessage.trim(),
        createdAt: new Date().toISOString(),
      };
      setConversationMessages((prev) => [...prev, optimistic]);
      setNewMessage("");
      toast.success("Message sent successfully!");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const ChatMessageComponent = ({
    messages,
    currentUserAddress,
    otherPartyName,
    otherPartyAddress,
    isLoading,
  }: {
    messages: any[];
    currentUserAddress: string;
    otherPartyName: string;
    otherPartyAddress: string;
    isLoading: boolean;
  }) => (
    <div className="space-y-4 max-h-[400px] overflow-y-auto p-2">
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
          <span className="ml-2 text-sm text-muted-foreground font-varela">
            Loading messages...
          </span>
        </div>
      ) : messages.length > 0 ? (
        messages.map((m, i) => {
          const isFromMe =
            m.sender.toLowerCase() === currentUserAddress.toLowerCase();
          return (
            <div key={i} className={`flex gap-3 ${isFromMe ? "justify-end" : "justify-start"}`}>
              {!isFromMe && (
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`https://effigy.im/a/${m.sender}.svg`}
                    alt={m.sender}
                  />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  isFromMe
                    ? "bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700"
                    : "bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-sm font-varela">
                    {isFromMe ? "You" : otherPartyName}{" "}
                    <Badge
                      variant="outline"
                      className={`text-xs ml-1 font-varela ${
                        isFromMe
                          ? "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30"
                          : "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30"
                      }`}
                    >
                      {isFromMe ? "You" : "Contact"}
                    </Badge>
                  </span>
                  <span className="text-xs text-muted-foreground font-varela">
                    {new Date(m.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm font-varela">{m.content}</p>
              </div>
              {isFromMe && (
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`https://effigy.im/a/${currentUserAddress}.svg`}
                    alt={currentUserAddress}
                  />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })
      ) : (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground font-varela">
            No messages yet. Start the conversation!
          </p>
        </div>
      )}
    </div>
  );

  if (!isConnected || !address) {
    return (
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={handleConnectWallet}
          variant="outline"
          className="font-varien border-accent text-accent hover:bg-accent/10 hover:text-accent group tracking-wider"
        >
          <Wallet className="mr-2 h-4 w-4 group-hover:animate-pulse-glow" />
          Connect Wallet
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              className="font-varien flex items-center gap-2 border-accent/70 hover:border-accent"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={`https://effigy.im/a/${address}.svg`} alt={address} />
                <AvatarFallback>{address?.charAt(2) || "?"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span>{displayName || truncateAddress(address)}</span>
                {renderRoleIcon()}
              </div>
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="font-varien w-64 glass-effect">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://effigy.im/a/${address}.svg`} alt={address} />
              <AvatarFallback>{address?.charAt(2) || "?"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{truncateAddress(address)}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              if (!isReAuthenticatingRef.current) {
                setShowMessagesPopup(true);
                fetchConversationsFromContext();
              }
            }}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Messages
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyAddress}>
            {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={getBlockExplorerUrl()} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Explorer
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDisconnect}
            className="text-red-500 hover:!text-red-500 focus:!text-red-500 hover:!bg-red-500/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isSigned && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm h-[100vh] z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-md p-8 bg-gradient-to-br from-background via-background/95 to-accent/10 border border-accent/30 rounded-2xl shadow-2xl backdrop-blur-sm"
          >
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/40 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <User className="h-8 w-8 text-accent" />
              </motion.div>
              <h2 className="font-varien text-2xl font-bold mb-2 text-foreground tracking-wider">Welcome!</h2>
              <p className="font-varela text-muted-foreground">Set up your profile to get started</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="displayName" className="block text-sm font-medium text-foreground font-varien">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName_}
                  onChange={(e) => setDisplayName_(e.target.value)}
                  placeholder="Enter your display name"
                  className="w-full px-4 py-3 border border-accent/30 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-background/50 backdrop-blur-sm text-foreground font-varela transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="block text-sm font-medium text-foreground font-varien">
                  Role
                </label>
                <select
                  id="role"
                  value={role_}
                  onChange={(e) => setRole_(e.target.value)}
                  className="w-full px-4 py-3 border border-accent/30 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-background/50 backdrop-blur-sm text-foreground font-varela transition-all duration-200"
                >
                  <option value="" disabled>
                    Select your role
                  </option>
                  <option value="employer">Employer</option>
                  <option value="worker">Employee</option>
                </select>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmitDisplayName}
                disabled={!displayName_ || !role_}
                className={`w-full py-3 px-6 rounded-xl font-varien font-medium transition-all duration-200 ${
                  displayName_ && role_
                    ? "bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground shadow-lg hover:shadow-xl"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                Get Started
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {showMessagesPopup && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm h-[100vh] z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="min-w-[400px] w-[90vw] h-[85vh] md:w-full md:max-w-4xl md:h-[80vh] bg-gradient-to-br from-background via-background/95 to-accent/10 border border-accent/30 rounded-lg md:rounded-2xl shadow-2xl backdrop-blur-sm overflow-hidden md:mx-0 -ml-[150px]"
          >
            <div className="flex h-full">
              <div className="w-3/5 md:w-1/3 border-r border-accent/20 flex flex-col">
                <div className="p-4 md:p-6 border-b border-accent/20">
                  <div className="flex items-center justify-between">
                    <h2 className="font-varien text-lg md:text-xl font-bold text-foreground tracking-wider">
                      Messages
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowMessagesPopup(false);
                        setSelectedConversation(null);
                        setConversationMessages([]);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {isLoadingConversations ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-accent" />
                      <span className="ml-2 text-sm text-muted-foreground font-varela">
                        Loading conversations...
                      </span>
                    </div>
                  ) : conversations.length > 0 ? (
                    <div className="space-y-1 p-2">
                      {conversations.map((conversation, index) => (
                        <motion.div
                          key={conversation.otherPartyAddress}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => {
                            setSelectedConversation(conversation);
                            fetchConversationMessages(conversation.otherPartyAddress);
                          }}
                          className={`p-3 md:p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                            selectedConversation?.otherPartyAddress === conversation.otherPartyAddress
                              ? "bg-accent/20 border border-accent/30"
                              : "hover:bg-accent/10 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 md:h-10 md:w-10">
                              <AvatarImage
                                src={`https://effigy.im/a/${conversation.otherPartyAddress}.svg`}
                                alt={conversation.otherPartyAddress}
                              />
                              <AvatarFallback>
                                <User className="h-4 w-4 md:h-5 md:w-5" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground font-varela truncate text-sm md:text-base">
                                {conversation.otherPartyName}
                              </p>
                              <p className="text-xs md:text-sm text-muted-foreground font-varela truncate">
                                {conversation.lastMessage.content}
                              </p>
                              <p className="text-xs text-muted-foreground font-varela">
                                {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground font-varela">No conversations yet</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-2/5 md:flex-1 flex flex-col">
                {selectedConversation ? (
                  <>
                    <div className="p-4 md:p-6 border-b border-accent/20">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 md:h-10 md:w-10">
                          <AvatarImage
                            src={`https://effigy.im/a/${selectedConversation.otherPartyAddress}.svg`}
                            alt={selectedConversation.otherPartyAddress}
                          />
                          <AvatarFallback>
                            <User className="h-4 w-4 md:h-5 md:w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-varien text-base md:text-lg font-medium text-foreground">
                            {selectedConversation.otherPartyName}
                          </h3>
                          <p className="text-xs md:text-sm text-muted-foreground font-varela">
                            {selectedConversation.otherPartyAddress.slice(0, 6)}...
                            {selectedConversation.otherPartyAddress.slice(-4)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 md:p-4">
                      <ChatMessageComponent
                        messages={conversationMessages}
                        currentUserAddress={address || ""}
                        otherPartyName={selectedConversation.otherPartyName}
                        otherPartyAddress={selectedConversation.otherPartyAddress}
                        isLoading={isLoadingMessages}
                      />
                    </div>

                    <div className="p-3 md:p-4 border-t border-accent/20">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          className="flex-1 px-3 md:px-4 py-2 border border-accent/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-background/50 backdrop-blur-sm text-foreground font-varela text-sm md:text-base"
                          disabled={isSendingMessage}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || isSendingMessage}
                          className="bg-accent hover:bg-accent/80 text-accent-foreground font-varien"
                          size="sm"
                        >
                          {isSendingMessage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-varien text-base md:text-lg font-medium text-foreground mb-2">
                        Select a conversation
                      </h3>
                      <p className="text-muted-foreground font-varela text-sm md:text-base">
                        Choose a conversation from the left to start messaging
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

