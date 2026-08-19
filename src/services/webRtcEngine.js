import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' }
  ],
  iceCandidatePoolSize: 10
};

// WeakMap cache to calculate per-second delta metrics per peer connection
const pcStatsCache = new WeakMap();

// ─── WebRTC Diagnostics Collector Function ──────────────────────────────────
export async function collectRtcStats(pc) {
  if (!pc) return null;
  try {
    const statsMap = await pc.getStats();
    const nowTime = performance.now();
    const prev = pcStatsCache.get(pc);
    const timeDeltaSec = prev ? Math.max(0.1, (nowTime - prev.timestamp) / 1000) : 1;

    const metrics = {
      timestamp: Date.now(),
      connectionState: pc.connectionState,
      iceConnectionState: pc.iceConnectionState,
      signalingState: pc.signalingState,
      rtt: 0,
      availableIncomingBitrate: 0,
      availableOutgoingBitrate: 0,
      candidatePairState: 'unknown',
      audio: {
        codec: 'Opus',
        packetsReceived: 0,
        packetsLost: 0,
        jitter: 0,
        jitterBufferDelay: 0,
        jitterBufferTargetDelay: 0,
        concealedSamples: 0,
        audioLevel: 0
      },
      video: {
        codec: 'H.264 / VP8',
        decoderImplementation: 'hardware',
        packetsReceived: 0,
        packetsLost: 0,
        packetsDiscarded: 0,
        bytesReceived: 0,
        jitter: 0,
        framesReceived: 0,
        framesDecoded: 0,
        framesDropped: 0,
        keyFramesDecoded: 0,
        nackCount: 0,
        pliCount: 0,
        firCount: 0,
        qpSum: 0,
        fps: 0,
        deltaDecoded: 0,
        deltaDropped: 0,
        deltaReceived: 0,
        frameDropRate: 0,
        width: 0,
        height: 0,
        bitrateKbps: 0
      },
      outbound: {
        packetsSent: 0,
        bytesSent: 0,
        framesEncoded: 0,
        framesSent: 0,
        retransmittedPacketsSent: 0,
        qualityLimitationReason: 'none',
        bitrateKbps: 0
      }
    };

    let rawVideoInbound = {
      framesDecoded: 0,
      framesDropped: 0,
      framesReceived: 0,
      bytesReceived: 0
    };

    statsMap.forEach(report => {
      // Candidate Pair & RTT
      if (report.type === 'candidate-pair' && (report.state === 'succeeded' || report.nominated)) {
        metrics.candidatePairState = report.state || 'active';
        if (report.currentRoundTripTime !== undefined) {
          metrics.rtt = Math.round(report.currentRoundTripTime * 1000); // ms
        }
        if (report.availableIncomingBitrate !== undefined) {
          metrics.availableIncomingBitrate = Math.round(report.availableIncomingBitrate / 1000); // kbps
        }
        if (report.availableOutgoingBitrate !== undefined) {
          metrics.availableOutgoingBitrate = Math.round(report.availableOutgoingBitrate / 1000); // kbps
        }
      }

      // Inbound Audio Track
      if (report.type === 'inbound-rtp' && report.kind === 'audio') {
        metrics.audio.packetsReceived = report.packetsReceived || 0;
        metrics.audio.packetsLost = report.packetsLost || 0;
        metrics.audio.jitter = report.jitter ? Math.round(report.jitter * 1000) : 0; // ms
        if (report.jitterBufferDelay !== undefined && report.jitterBufferEmittedCount) {
          metrics.audio.jitterBufferDelay = Math.round((report.jitterBufferDelay / report.jitterBufferEmittedCount) * 1000);
        }
        if (report.jitterBufferTargetDelay !== undefined) {
          metrics.audio.jitterBufferTargetDelay = Math.round(report.jitterBufferTargetDelay * 1000);
        }
        metrics.audio.concealedSamples = report.concealedSamples || 0;
        metrics.audio.audioLevel = report.audioLevel ? Math.round(report.audioLevel * 100) : 0;
      }

      // Inbound Video Track
      if (report.type === 'inbound-rtp' && report.kind === 'video') {
        metrics.video.packetsReceived = report.packetsReceived || 0;
        metrics.video.packetsLost = report.packetsLost || 0;
        metrics.video.packetsDiscarded = report.packetsDiscarded || 0;
        metrics.video.bytesReceived = report.bytesReceived || 0;
        metrics.video.jitter = report.jitter ? Math.round(report.jitter * 1000) : 0;
        metrics.video.framesReceived = report.framesReceived || 0;
        metrics.video.framesDecoded = report.framesDecoded || 0;
        metrics.video.framesDropped = report.framesDropped || 0;
        metrics.video.keyFramesDecoded = report.keyFramesDecoded || 0;
        metrics.video.nackCount = report.nackCount || 0;
        metrics.video.pliCount = report.pliCount || 0;
        metrics.video.firCount = report.firCount || 0;
        metrics.video.qpSum = report.qpSum || 0;
        metrics.video.fps = report.framesPerSecond ? Math.round(report.framesPerSecond) : 0;
        metrics.video.width = report.frameWidth || 0;
        metrics.video.height = report.frameHeight || 0;
        if (report.decoderImplementation) {
          metrics.video.decoderImplementation = report.decoderImplementation;
        }

        rawVideoInbound = {
          framesDecoded: report.framesDecoded || 0,
          framesDropped: report.framesDropped || 0,
          framesReceived: report.framesReceived || 0,
          bytesReceived: report.bytesReceived || 0
        };
      }

      // Outbound Track
      if (report.type === 'outbound-rtp') {
        metrics.outbound.packetsSent += report.packetsSent || 0;
        metrics.outbound.bytesSent += report.bytesSent || 0;
        metrics.outbound.framesEncoded += report.framesEncoded || 0;
        metrics.outbound.framesSent += report.framesSent || 0;
        metrics.outbound.retransmittedPacketsSent += report.retransmittedPacketsSent || 0;
        if (report.qualityLimitationReason) {
          metrics.outbound.qualityLimitationReason = report.qualityLimitationReason;
        }
      }

      // Codecs
      if (report.type === 'codec') {
        if (report.mimeType && report.mimeType.includes('audio')) {
          metrics.audio.codec = report.mimeType.split('/')[1] || 'Opus';
        }
        if (report.mimeType && report.mimeType.includes('video')) {
          metrics.video.codec = report.mimeType.split('/')[1] || 'H264';
        }
      }
    });

    // Calculate per-second deltas & frame drop rate percentage
    if (prev && prev.rawVideo) {
      const dDecoded = Math.max(0, rawVideoInbound.framesDecoded - prev.rawVideo.framesDecoded);
      const dDropped = Math.max(0, rawVideoInbound.framesDropped - prev.rawVideo.framesDropped);
      const dReceived = Math.max(0, rawVideoInbound.framesReceived - prev.rawVideo.framesReceived);
      const dBytes = Math.max(0, rawVideoInbound.bytesReceived - prev.rawVideo.bytesReceived);

      metrics.video.deltaDecoded = dDecoded;
      metrics.video.deltaDropped = dDropped;
      metrics.video.deltaReceived = dReceived;
      metrics.video.bitrateKbps = Math.round((dBytes * 8) / (timeDeltaSec * 1000));

      const totalFrames = dDecoded + dDropped;
      metrics.video.frameDropRate = totalFrames > 0
        ? parseFloat(((dDropped / totalFrames) * 100).toFixed(1))
        : 0;
    }

    // Save cache for next snapshot
    pcStatsCache.set(pc, {
      timestamp: nowTime,
      rawVideo: rawVideoInbound
    });

    return metrics;
  } catch (err) {
    return null;
  }
}

// ─── WebRTC Broadcaster (Admin Teacher Side) ──────────────────────────────────
export class WebRtcBroadcaster {
  constructor(localStream) {
    this.localStream = localStream;
    this.peerConnections = new Map(); // studentId -> RTCPeerConnection
    this.channel = null;
    this.adaptationTimer = null;
    this.initChannel();
    this.startAdaptationLoop();
  }

  updateStream(newStream) {
    this.localStream = newStream;
    this.peerConnections.forEach((pc) => {
      const senders = pc.getSenders();
      newStream.getTracks().forEach((track) => {
        const sender = senders.find((s) => s.track && s.track.kind === track.kind);
        if (sender) {
          sender.replaceTrack(track).catch(() => {});
        } else {
          pc.addTrack(track, newStream);
        }
      });
    });
  }

  initChannel() {
    if (!isSupabaseConfigured || !supabase) return;

    this.channel = supabase.channel('th3ory_webrtc_signaling');

    this.channel
      .on('broadcast', { event: 'student_join' }, async ({ payload }) => {
        const { studentId } = payload;
        if (!studentId || !this.localStream) return;
        await this.createPeerConnection(studentId);
      })
      .on('broadcast', { event: 'student_answer' }, async ({ payload }) => {
        const { studentId, answer } = payload;
        const pc = this.peerConnections.get(studentId);
        if (pc && answer) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
          } catch (e) {}
        }
      })
      .on('broadcast', { event: 'student_ice_candidate' }, async ({ payload }) => {
        const { studentId, candidate } = payload;
        const pc = this.peerConnections.get(studentId);
        if (pc && candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {}
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.channel.send({
            type: 'broadcast',
            event: 'broadcaster_online',
            payload: { timestamp: Date.now() }
          });
        }
      });
  }

  async createPeerConnection(studentId) {
    if (this.peerConnections.has(studentId)) {
      try {
        this.peerConnections.get(studentId).close();
      } catch (e) {}
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    this.peerConnections.set(studentId, pc);

    // Add local tracks (720p Video + 48kHz Mono Opus Audio)
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream);
      });
    }

    // Set initial conservative video parameters (720p @ 30fps max, 1.8 Mbps)
    const senders = pc.getSenders();
    senders.forEach(sender => {
      if (sender.track && sender.track.kind === 'video') {
        const parameters = sender.getParameters();
        if (!parameters.encodings) parameters.encodings = [{}];
        parameters.encodings[0].maxBitrate = 1800000; // 1.8 Mbps starting target
        parameters.encodings[0].maxFramerate = 30;
        sender.setParameters(parameters).catch(() => {});
      }
    });

    // Handle connection state changes & native ICE restart
    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'failed') {
        try {
          pc.restartIce();
        } catch (e) {}
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && this.channel) {
        this.channel.send({
          type: 'broadcast',
          event: 'broadcaster_ice_candidate',
          payload: { studentId, candidate: event.candidate }
        });
      }
    };

    const offer = await pc.createOffer({
      offerToReceiveAudio: false,
      offerToReceiveVideo: false
    });
    await pc.setLocalDescription(offer);

    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'broadcaster_offer',
        payload: { studentId, offer }
      });
    }
  }

  // Automatic Network Adaptation Loop (Hysteresis control)
  startAdaptationLoop() {
    if (this.adaptationTimer) clearInterval(this.adaptationTimer);

    this.adaptationTimer = setInterval(async () => {
      this.peerConnections.forEach(async (pc) => {
        if (pc.connectionState !== 'connected') return;

        const stats = await collectRtcStats(pc);
        if (!stats) return;

        const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
        if (!sender) return;

        const params = sender.getParameters();
        if (!params.encodings || !params.encodings[0]) return;

        let currentMaxBitrate = params.encodings[0].maxBitrate || 1800000;

        // Conservative Adaptation: Lower video bitrate if high RTT or packet loss
        if (stats.rtt > 250 || stats.outbound.qualityLimitationReason === 'bandwidth') {
          // Degrade video quality to protect audio stability
          const newBitrate = Math.max(400000, Math.floor(currentMaxBitrate * 0.75));
          params.encodings[0].maxBitrate = newBitrate;
          params.encodings[0].maxFramerate = 24;
          sender.setParameters(params).catch(() => {});
        } else if (stats.rtt < 100 && currentMaxBitrate < 1800000) {
          // Gradual recovery when network improves
          const newBitrate = Math.min(1800000, Math.floor(currentMaxBitrate * 1.2));
          params.encodings[0].maxBitrate = newBitrate;
          params.encodings[0].maxFramerate = 30;
          sender.setParameters(params).catch(() => {});
        }
      });
    }, 2000);
  }

  destroy() {
    if (this.adaptationTimer) clearInterval(this.adaptationTimer);
    this.peerConnections.forEach((pc) => pc.close());
    this.peerConnections.clear();
    if (this.channel && supabase) {
      try { supabase.removeChannel(this.channel); } catch (e) {}
    }
  }
}

// ─── WebRTC Subscriber (Student Receiver Side) ──────────────────────────────
export class WebRtcSubscriber {
  constructor(onRemoteStream, onStatsUpdate = null, studentId = `student_${Math.random().toString(36).substring(2, 9)}`) {
    this.onRemoteStream = onRemoteStream;
    this.onStatsUpdate = onStatsUpdate;
    this.studentId = studentId;
    this.pc = null;
    this.channel = null;
    this.statsTimer = null;
    this.remoteStream = new MediaStream();
    this.initChannel();
  }

  initChannel() {
    if (!isSupabaseConfigured || !supabase) return;

    this.channel = supabase.channel('th3ory_webrtc_signaling');

    this.channel
      .on('broadcast', { event: 'broadcaster_online' }, () => {
        this.requestStream();
      })
      .on('broadcast', { event: 'broadcaster_offer' }, async ({ payload }) => {
        if (payload.studentId !== this.studentId) return;
        await this.handleOffer(payload.offer);
      })
      .on('broadcast', { event: 'broadcaster_ice_candidate' }, async ({ payload }) => {
        if (payload.studentId !== this.studentId) return;
        if (this.pc && payload.candidate) {
          try {
            await this.pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
          } catch (e) {}
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.requestStream();
        }
      });
  }

  requestStream() {
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'student_join',
        payload: { studentId: this.studentId }
      });
    }
  }

  async handleOffer(offer) {
    if (this.pc) {
      try { this.pc.close(); } catch (e) {}
    }

    this.pc = new RTCPeerConnection(ICE_SERVERS);
    this.remoteStream = new MediaStream();

    this.pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        event.streams[0].getTracks().forEach((track) => {
          if (!this.remoteStream.getTracks().some(t => t.id === track.id)) {
            this.remoteStream.addTrack(track);
          }
        });
      } else if (event.track) {
        if (!this.remoteStream.getTracks().some(t => t.id === event.track.id)) {
          this.remoteStream.addTrack(event.track);
        }
      }
      this.onRemoteStream(this.remoteStream);
    };

    // Configure Audio Receiver Jitter Buffer Target (120ms Feature-Detected)
    this.pc.addEventListener('track', () => {
      const audioReceiver = this.pc.getReceivers().find(r => r.track && r.track.kind === 'audio');
      if (audioReceiver && 'jitterBufferTarget' in audioReceiver) {
        try {
          audioReceiver.jitterBufferTarget = 120; // 120ms smooth playback buffer
        } catch (e) {}
      }
    });

    pc.oniceconnectionstatechange = () => {
      if (this.pc && this.pc.iceConnectionState === 'failed') {
        try {
          this.pc.restartIce();
        } catch (e) {}
      }
    };

    this.pc.onicecandidate = (event) => {
      if (event.candidate && this.channel) {
        this.channel.send({
          type: 'broadcast',
          event: 'student_ice_candidate',
          payload: { studentId: this.studentId, candidate: event.candidate }
        });
      }
    };

    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);

    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'student_answer',
        payload: { studentId: this.studentId, answer }
      });
    }

    // Start Real-Time Diagnostics Polling Loop (1s Interval)
    this.startDiagnostics();
  }

  startDiagnostics() {
    if (this.statsTimer) clearInterval(this.statsTimer);
    this.statsTimer = setInterval(async () => {
      if (this.pc && this.onStatsUpdate) {
        const stats = await collectRtcStats(this.pc);
        if (stats) this.onStatsUpdate(stats);
      }
    }, 1000);
  }

  destroy() {
    if (this.statsTimer) clearInterval(this.statsTimer);
    if (this.pc) {
      try { this.pc.close(); } catch (e) {}
    }
    if (this.channel && supabase) {
      try { supabase.removeChannel(this.channel); } catch (e) {}
    }
  }
}
