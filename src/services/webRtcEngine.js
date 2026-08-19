import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ]
};

// ─── WebRTC Broadcaster (Admin Teacher Side) ──────────────────────────────────
export class WebRtcBroadcaster {
  constructor(localStream) {
    this.localStream = localStream;
    this.peerConnections = new Map(); // studentId -> RTMPeerConnection
    this.channel = null;
    this.initChannel();
  }

  updateStream(newStream) {
    this.localStream = newStream;
    this.peerConnections.forEach((pc) => {
      const senders = pc.getSenders();
      newStream.getTracks().forEach((track) => {
        const sender = senders.find((s) => s.track && s.track.kind === track.kind);
        if (sender) {
          sender.replaceTrack(track);
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
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
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
          // Announce broadcast available to all waiting students
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

    // Add local tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream);
      });
    }

    // ICE Candidate handler
    pc.onicecandidate = (event) => {
      if (event.candidate && this.channel) {
        this.channel.send({
          type: 'broadcast',
          event: 'broadcaster_ice_candidate',
          payload: { studentId, candidate: event.candidate }
        });
      }
    };

    // Create and send WebRTC Offer to student
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

  destroy() {
    this.peerConnections.forEach((pc) => pc.close());
    this.peerConnections.clear();
    if (this.channel && supabase) {
      try { supabase.removeChannel(this.channel); } catch (e) {}
    }
  }
}

// ─── WebRTC Subscriber (Student Receiver Side) ──────────────────────────────
export class WebRtcSubscriber {
  constructor(onRemoteStream, studentId = `student_${Math.random().toString(36).substring(2, 9)}`) {
    this.onRemoteStream = onRemoteStream;
    this.studentId = studentId;
    this.pc = null;
    this.channel = null;
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

    this.pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.onRemoteStream(event.streams[0]);
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
  }

  destroy() {
    if (this.pc) {
      try { this.pc.close(); } catch (e) {}
    }
    if (this.channel && supabase) {
      try { supabase.removeChannel(this.channel); } catch (e) {}
    }
  }
}
