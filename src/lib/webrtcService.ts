import { toast } from "react-hot-toast";

export interface PeerConnection {
  peer: any; // Using any to avoid SSR issues
  userId: number;
  stream?: MediaStream | null;
  screenStream?: MediaStream | null;
}

export interface MediaConstraints {
  audio: boolean;
  video: boolean;
}

export class WebRTCService {
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private peers: Map<number, PeerConnection> = new Map();
  private socket: WebSocket | null = null;
  private sessionId: number | null = null;
  private userId: number | null = null;
  private isScreenSharing = false;
  private Peer: any = null; // Will be loaded dynamically

  // Callbacks
  private onUserJoined?: (userId: number, userName: string) => void;
  private onUserLeft?: (userId: number) => void;
  private onStreamReceived?: (userId: number, stream: MediaStream) => void;
  private onScreenShareReceived?: (userId: number, stream: MediaStream) => void;
  private onChatMessage?: (
    userId: number,
    userName: string,
    message: string
  ) => void;
  private onParticipantStateUpdate?: (
    userId: number,
    audioEnabled: boolean,
    videoEnabled: boolean
  ) => void;
  private onHandRaiseUpdate?: (userId: number, handRaised: boolean) => void;

  // Helper function to get local media stream
  async getLocalStream(
    constraints: MediaConstraints
  ): Promise<MediaStream | null> {
    if (typeof window === "undefined" || !navigator.mediaDevices) {
      console.error("Media devices not available");
      toast.error("Media devices not available in this environment");
      return null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: constraints.audio
          ? {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }
          : false,
        video: constraints.video
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 30 },
            }
          : false,
      });

      console.log("Media stream obtained successfully:", {
        audioTracks: stream.getAudioTracks().length,
        videoTracks: stream.getVideoTracks().length,
      });

      return stream;
    } catch (error: any) {
      console.error("Failed to get media stream:", error);

      // Provide specific error messages based on the error type
      if (error.name === "NotAllowedError") {
        if (constraints.audio && constraints.video) {
          toast.error(
            "Please enable camera and microphone to join the session."
          );
        } else if (constraints.video) {
          toast.error("Camera access blocked. Please allow camera access.");
        } else if (constraints.audio) {
          toast.error(
            "Microphone access blocked. Please allow microphone access."
          );
        }
      } else if (error.name === "NotFoundError") {
        if (constraints.video) {
          toast.error(
            "No camera found. Please connect a camera and try again."
          );
        } else if (constraints.audio) {
          toast.error(
            "No microphone found. Please connect a microphone and try again."
          );
        }
      } else if (error.name === "NotReadableError") {
        toast.error(
          "Camera or microphone is already in use by another application."
        );
      } else {
        toast.error(
          "Failed to access media devices. Please check your permissions."
        );
      }

      return null;
    }
  }

  // Use arrow functions to avoid binding issues
  private handlePeerSignal = (data: any): void => {
    const { from_user_id, signal } = data;

    if (from_user_id === this.userId) {
      return; // Ignore our own signals
    }

    const peerConnection = this.peers.get(from_user_id);
    if (peerConnection) {
      peerConnection.peer.signal(signal);
    }
  };

  private handleSocketMessage = (event: MessageEvent): void => {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "user_joined":
          this.handleUserJoined(data.user_id, data.user_name);
          break;
        case "user_left":
          this.handleUserLeft(data.user_id);
          break;
        case "webrtc_signal":
          this.handleWebRTCSignal(data);
          break;
        case "chat_message":
          this.onChatMessage?.(data.user_id, data.user_name, data.message);
          break;
        case "participant_state_update":
          this.onParticipantStateUpdate?.(
            data.user_id,
            data.audio_enabled,
            data.video_enabled
          );
          break;
        case "hand_raise_update":
          this.onHandRaiseUpdate?.(data.user_id, data.hand_raised);
          break;
        case "screen_share_update":
          this.handleScreenShareUpdate(data.user_id, data.screen_sharing);
          break;
        default:
          console.log("Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  // Initialize WebRTC service
  async initialize(
    sessionId: number,
    userId: number,
    token: string
  ): Promise<void> {
    // Check if we're in the browser
    if (typeof window === "undefined") {
      throw new Error("WebRTC service can only be used in the browser");
    }

    this.sessionId = sessionId;
    this.userId = userId;

    // Dynamically import simple-peer
    try {
      const PeerModule = await import("simple-peer");
      this.Peer = PeerModule.default;
    } catch (error) {
      console.error("Failed to load simple-peer:", error);
      throw new Error("Failed to load WebRTC library");
    }

    // Connect to WebSocket
    await this.connectWebSocket(token);

    // Request initial media permissions
    await this.requestMediaPermissions();
  }

  // Connect to WebSocket server
  private async connectWebSocket(token: string): Promise<void> {
    if (typeof window === "undefined") {
      throw new Error("WebSocket can only be used in the browser");
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(`${wsUrl}/ws/sessions/${this.sessionId}/`);

      this.socket.onopen = () => {
        console.log("WebSocket connected");
        // Send authentication token
        this.socket?.send(
          JSON.stringify({
            type: "auth",
            token: token,
          })
        );
        resolve();
      };

      this.socket.onmessage = this.handleSocketMessage;

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      };

      this.socket.onclose = () => {
        console.log("WebSocket disconnected");
        this.cleanup();
      };
    });
  }

  // Request media permissions
  private async requestMediaPermissions(): Promise<void> {
    try {
      // Request basic media permissions
      this.localStream = await this.getLocalStream({
        audio: true,
        video: true,
      });

      if (!this.localStream) {
        throw new Error("Failed to get media permissions");
      }

      console.log("Media permissions granted");
    } catch (error) {
      console.error("Failed to get media permissions:", error);
      throw error;
    }
  }

  // Handle user joined
  private handleUserJoined(userId: number, userName: string): void {
    console.log(`User ${userName} (${userId}) joined`);
    this.onUserJoined?.(userId, userName);

    // Create peer connection for new user
    this.createPeerConnection(userId);
  }

  // Handle user left
  private handleUserLeft(userId: number): void {
    console.log(`User ${userId} left`);
    this.onUserLeft?.(userId);

    // Clean up peer connection
    this.removePeerConnection(userId);
  }

  // Handle WebRTC signaling
  private handleWebRTCSignal(data: any): void {
    const { from_user_id, signal } = data;

    if (from_user_id === this.userId) {
      return; // Ignore our own signals
    }

    let peerConnection = this.peers.get(from_user_id);

    // If we don't have a peer connection yet, create one (for incoming offers)
    if (!peerConnection) {
      console.log(
        `Creating peer connection for incoming signal from user ${from_user_id}`
      );
      this.createPeerConnection(from_user_id);
      peerConnection = this.peers.get(from_user_id);
    }

    if (peerConnection && peerConnection.peer) {
      try {
        peerConnection.peer.signal(signal);
        console.log(`Processed signal from user ${from_user_id}`);
      } catch (error) {
        console.error(
          `Error processing signal from user ${from_user_id}:`,
          error
        );
      }
    }
  }

  // Create peer connection
  private createPeerConnection(userId: number): void {
    if (!this.localStream || !this.Peer) {
      console.error("No local stream or Peer library available");
      return;
    }

    const peer = new this.Peer({
      initiator: true,
      trickle: false,
      stream: this.localStream,
    });

    // Add local tracks to the peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        try {
          peer.addTrack(track, this.localStream!);
          console.log(
            `Added ${track.kind} track to peer connection for user ${userId}`
          );
        } catch (error) {
          console.error(
            `Failed to add ${track.kind} track to peer connection:`,
            error
          );
        }
      });
    }

    peer.on("signal", (signal: any) => {
      this.sendWebRTCSignal(userId, signal);
    });

    peer.on("stream", (stream: MediaStream) => {
      console.log(`Received stream from user ${userId}`);
      this.onStreamReceived?.(userId, stream);
    });

    peer.on("track", (event: any) => {
      console.log(`Received track from user ${userId}:`, event.track.kind);
      // Handle individual track events if needed
    });

    peer.on("error", (error: any) => {
      console.error(`Peer error for user ${userId}:`, error);
      toast.error("Connection error with participant");
    });

    this.peers.set(userId, {
      peer,
      userId,
      stream: null,
    });
  }

  // Send WebRTC signal
  private sendWebRTCSignal(targetUserId: number, signal: any): void {
    if (!this.socket) return;

    this.socket.send(
      JSON.stringify({
        type: "webrtc_signal",
        target_user_id: targetUserId,
        signal: signal,
      })
    );
  }

  // Remove peer connection
  private removePeerConnection(userId: number): void {
    const peerConnection = this.peers.get(userId);
    if (peerConnection) {
      peerConnection.peer.destroy();
      this.peers.delete(userId);
    }
  }

  // Toggle audio
  async toggleAudio(enabled: boolean): Promise<void> {
    try {
      if (enabled) {
        // Request microphone access if not already available
        if (!this.localStream || !this.localStream.getAudioTracks().length) {
          const audioStream = await this.getLocalStream({
            audio: true,
            video: false,
          });
          if (!audioStream) {
            console.error("Failed to get audio stream");
            return;
          }

          // If we don't have a local stream yet, create one
          if (!this.localStream) {
            this.localStream = audioStream;
          } else {
            // Add audio track to existing stream
            const audioTrack = audioStream.getAudioTracks()[0];
            this.localStream.addTrack(audioTrack);
          }
        }

        // Enable audio track
        const audioTrack = this.localStream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = true;

          // Add track to all peer connections
          this.peers.forEach((peerConnection) => {
            if (peerConnection.peer && !peerConnection.peer.destroyed) {
              try {
                peerConnection.peer.addTrack(audioTrack, this.localStream!);
                console.log(
                  `Added audio track to peer connection for user ${peerConnection.userId}`
                );
              } catch (error) {
                console.error(
                  `Failed to add audio track to peer connection for user ${peerConnection.userId}:`,
                  error
                );
              }
            }
          });

          // Notify other participants
          this.sendParticipantStateUpdate(true, this.isVideoEnabled());
          toast.success("Microphone enabled");
        }
      } else {
        // Disable audio track
        const audioTrack = this.localStream?.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = false;

          // Remove track from all peer connections
          this.peers.forEach((peerConnection) => {
            if (peerConnection.peer && !peerConnection.peer.destroyed) {
              try {
                const senders = peerConnection.peer.getSenders();
                const audioSender = senders.find(
                  (sender: any) => sender.track?.kind === "audio"
                );
                if (audioSender) {
                  peerConnection.peer.removeTrack(audioSender);
                  console.log(
                    `Removed audio track from peer connection for user ${peerConnection.userId}`
                  );
                }
              } catch (error) {
                console.error(
                  `Failed to remove audio track from peer connection for user ${peerConnection.userId}:`,
                  error
                );
              }
            }
          });

          // Notify other participants
          this.sendParticipantStateUpdate(false, this.isVideoEnabled());
          toast.success("Microphone disabled");
        }
      }
    } catch (error) {
      console.error("WebRTC error:", error);
      toast.error("Failed to toggle microphone");
    }
  }

  // Toggle video
  async toggleVideo(enabled: boolean): Promise<void> {
    try {
      if (enabled) {
        // Request camera access if not already available
        if (!this.localStream || !this.localStream.getVideoTracks().length) {
          const videoStream = await this.getLocalStream({
            audio: false,
            video: true,
          });
          if (!videoStream) {
            console.error("Failed to get video stream");
            return;
          }

          // If we don't have a local stream yet, create one
          if (!this.localStream) {
            this.localStream = videoStream;
          } else {
            // Add video track to existing stream
            const videoTrack = videoStream.getVideoTracks()[0];
            this.localStream.addTrack(videoTrack);
          }
        }

        // Enable video track
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = true;

          // Add track to all peer connections
          this.peers.forEach((peerConnection) => {
            if (peerConnection.peer && !peerConnection.peer.destroyed) {
              try {
                peerConnection.peer.addTrack(videoTrack, this.localStream!);
                console.log(
                  `Added video track to peer connection for user ${peerConnection.userId}`
                );
              } catch (error) {
                console.error(
                  `Failed to add video track to peer connection for user ${peerConnection.userId}:`,
                  error
                );
              }
            }
          });

          // Notify other participants
          this.sendParticipantStateUpdate(this.isAudioEnabled(), true);
          toast.success("Camera enabled");
        }
      } else {
        // Disable video track
        const videoTrack = this.localStream?.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = false;

          // Remove track from all peer connections
          this.peers.forEach((peerConnection) => {
            if (peerConnection.peer && !peerConnection.peer.destroyed) {
              try {
                const senders = peerConnection.peer.getSenders();
                const videoSender = senders.find(
                  (sender: any) => sender.track?.kind === "video"
                );
                if (videoSender) {
                  peerConnection.peer.removeTrack(videoSender);
                  console.log(
                    `Removed video track from peer connection for user ${peerConnection.userId}`
                  );
                }
              } catch (error) {
                console.error(
                  `Failed to remove video track from peer connection for user ${peerConnection.userId}:`,
                  error
                );
              }
            }
          });

          // Notify other participants
          this.sendParticipantStateUpdate(this.isAudioEnabled(), false);
          toast.success("Camera disabled");
        }
      }
    } catch (error) {
      console.error("WebRTC error:", error);
      toast.error("Failed to toggle camera");
    }
  }

  // Start screen sharing
  async startScreenSharing(): Promise<void> {
    if (typeof window === "undefined" || !navigator.mediaDevices) {
      throw new Error("Screen sharing not available");
    }

    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      this.isScreenSharing = true;

      // Replace video track in all peer connections
      this.peers.forEach((peerConnection) => {
        const videoTrack = this.screenStream!.getVideoTracks()[0];
        const sender = peerConnection.peer
          .getSenders()
          .find((s: any) => s.track?.kind === "video");
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      // Notify other participants
      this.sendScreenShareUpdate(true);

      // Handle screen share stop
      this.screenStream.getVideoTracks()[0].onended = () => {
        this.stopScreenSharing();
      };

      toast.success("Screen sharing started");
    } catch (error) {
      console.error("Failed to start screen sharing:", error);
      toast.error("Failed to start screen sharing");
    }
  }

  // Stop screen sharing
  async stopScreenSharing(): Promise<void> {
    if (!this.screenStream) return;

    this.screenStream.getTracks().forEach((track) => track.stop());
    this.screenStream = null;
    this.isScreenSharing = false;

    // Restore video track in all peer connections
    if (this.localStream) {
      this.peers.forEach((peerConnection) => {
        const videoTrack = this.localStream!.getVideoTracks()[0];
        const sender = peerConnection.peer
          .getSenders()
          .find((s: any) => s.track?.kind === "video");
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });
    }

    // Notify other participants
    this.sendScreenShareUpdate(false);

    toast.success("Screen sharing stopped");
  }

  // Send chat message
  sendChatMessage(message: string): void {
    if (!this.socket) return;

    this.socket.send(
      JSON.stringify({
        type: "chat_message",
        message: message,
      })
    );
  }

  // Send hand raise update
  sendHandRaiseUpdate(handRaised: boolean): void {
    if (!this.socket) return;

    this.socket.send(
      JSON.stringify({
        type: "hand_raise",
        hand_raised: handRaised,
      })
    );
  }

  // Send participant state update
  sendParticipantStateUpdate(
    audioEnabled: boolean,
    videoEnabled: boolean
  ): void {
    if (!this.socket) return;

    this.socket.send(
      JSON.stringify({
        type: "participant_state",
        audio_enabled: audioEnabled,
        video_enabled: videoEnabled,
      })
    );
  }

  // Send screen share update
  sendScreenShareUpdate(screenSharing: boolean): void {
    if (!this.socket) return;

    this.socket.send(
      JSON.stringify({
        type: "screen_share",
        screen_sharing: screenSharing,
      })
    );
  }

  // Handle screen share update from other users
  private handleScreenShareUpdate(
    userId: number,
    screenSharing: boolean
  ): void {
    if (screenSharing) {
      // Handle incoming screen share stream
      const peerConnection = this.peers.get(userId);
      if (peerConnection) {
        // The screen share stream will come through the normal stream event
        // We can differentiate it by checking if it's a screen share
        this.onScreenShareReceived?.(userId, peerConnection.stream!);
      }
    } else {
      // Handle screen share stop
      this.onScreenShareReceived?.(userId, null!);
    }
  }

  // Get current local stream
  getCurrentLocalStream(): MediaStream | null {
    return this.localStream;
  }

  // Get screen stream
  getScreenStream(): MediaStream | null {
    return this.screenStream;
  }

  // Check if audio is enabled
  isAudioEnabled(): boolean {
    if (!this.localStream) return false;
    const audioTrack = this.localStream.getAudioTracks()[0];
    return audioTrack ? audioTrack.enabled : false;
  }

  // Check if video is enabled
  isVideoEnabled(): boolean {
    if (!this.localStream) return false;
    const videoTrack = this.localStream.getVideoTracks()[0];
    return videoTrack ? videoTrack.enabled : false;
  }

  // Check if screen sharing is active
  isScreenSharingActive(): boolean {
    return this.isScreenSharing;
  }

  // Set callbacks
  setCallbacks(callbacks: {
    onUserJoined?: (userId: number, userName: string) => void;
    onUserLeft?: (userId: number) => void;
    onStreamReceived?: (userId: number, stream: MediaStream) => void;
    onScreenShareReceived?: (userId: number, stream: MediaStream) => void;
    onChatMessage?: (userId: number, userName: string, message: string) => void;
    onParticipantStateUpdate?: (
      userId: number,
      audioEnabled: boolean,
      videoEnabled: boolean
    ) => void;
    onHandRaiseUpdate?: (userId: number, handRaised: boolean) => void;
  }): void {
    this.onUserJoined = callbacks.onUserJoined;
    this.onUserLeft = callbacks.onUserLeft;
    this.onStreamReceived = callbacks.onStreamReceived;
    this.onScreenShareReceived = callbacks.onScreenShareReceived;
    this.onChatMessage = callbacks.onChatMessage;
    this.onParticipantStateUpdate = callbacks.onParticipantStateUpdate;
    this.onHandRaiseUpdate = callbacks.onHandRaiseUpdate;
  }

  // Cleanup resources
  cleanup(): void {
    // Stop all media streams
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop());
      this.screenStream = null;
    }

    // Destroy all peer connections
    this.peers.forEach((peerConnection) => {
      peerConnection.peer.destroy();
    });
    this.peers.clear();

    // Close WebSocket connection
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.isScreenSharing = false;
    this.sessionId = null;
    this.userId = null;
  }
}

// Export a function that creates the service only on the client side
export const createWebRTCService = (): WebRTCService | null => {
  if (typeof window !== "undefined") {
    return new WebRTCService();
  }
  return null;
};

// Export a singleton instance that's only created on the client side
let webrtcServiceInstance: WebRTCService | null = null;

export const webrtcService = {
  get instance(): WebRTCService | null {
    if (typeof window !== "undefined" && !webrtcServiceInstance) {
      webrtcServiceInstance = new WebRTCService();
    }
    return webrtcServiceInstance;
  },

  // Helper method to ensure we have an instance
  getInstance(): WebRTCService {
    if (!this.instance) {
      throw new Error("WebRTC service is not available on the server side");
    }
    return this.instance;
  },
};
