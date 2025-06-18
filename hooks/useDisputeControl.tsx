import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";

export function useDisputeControl(disputeId?: number) {
  const [messages, setMessages] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<{ id: number; [key: string]: any }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socket = io(process.env.NEXT_PUBLIC_API);

  // Fetch existing disputes
  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API}/disputes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
      });
      setDisputes(data);
    } catch (err) {
      setError("Failed to fetch disputes.");
    } finally {
      setLoading(false);
    }
  };

  // Create a new dispute
  const createDispute = async (jobId: string, reason: string) => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/disputes`,
        { jobId, reason },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
        }
      );
      setDisputes((prev) => [...prev, data]);
      return data;
    } catch (err) {
      setError("Failed to create dispute.");
    } finally {
      setLoading(false);
    }
  };

  // Delete a dispute
  const deleteDispute = async (disputeId: number) => {
    try {
      setLoading(true);
      await axios.delete(`${process.env.NEXT_PUBLIC_API}/disputes/${disputeId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
      });
      setDisputes((prev) => prev.filter((dispute) => dispute.id !== disputeId));
    } catch (err) {
      setError("Failed to delete dispute.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a specific dispute
  const fetchMessages = async () => {
    if (!disputeId) return;
    try {
      setLoading(true);
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API}/messages/${disputeId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
      });
      setMessages(data);
    } catch (err) {
      setError("Failed to fetch messages.");
    } finally {
      setLoading(false);
    }
  };

  // Send a new message
  const sendMessage = async (content: string) => {
    if (!disputeId) return;
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/messages`,
        { disputeId, content },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
        }
      );
      setMessages((prev) => [...prev, data]);
    } catch (err) {
      setError("Failed to send message.");
    }
  };

  // WebSocket integration for real-time updates
  useEffect(() => {
    if (!disputeId) return;

    // Join the dispute room
    socket.emit("joinRoom", disputeId);

    // Listen for new messages
    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("newMessage");
      socket.disconnect();
    };
  }, [disputeId]);

  useEffect(() => {
    fetchDisputes();
  }, []);

  return {
    disputes,
    messages,
    loading,
    error,
    createDispute,
    deleteDispute,
    fetchMessages,
    sendMessage,
  };
}