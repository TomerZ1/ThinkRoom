// src/pages/session/hooks/useVideo.js
import { useContext, useEffect, useRef, useState } from "react";
import SessionSocketContext from "../context/SessionSocketContext";
import { useAuth } from "../../auth/context/AuthContext";

const STUNS = [{ urls: "stun:stun.l.google.com:19302" }];

const AUDIO_CONSTRAINTS = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  video: false,
};

const VIDEO_CONSTRAINTS = {
  audio: false,
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30, max: 60 },
  },
};

const useVideo = (sessionId) => {
  const { socketRef, sendEvent, connected } = useContext(SessionSocketContext);
  const { token } = useAuth();

  // who am I?
  const myUserIdRef = useRef(null);
  useEffect(() => {
    try {
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        myUserIdRef.current = Number(payload?.sub ?? null);
      }
    } catch {
      myUserIdRef.current = null;
    }
  }, [token]);

  // who is the peer?
  const peerIdRef = useRef(null);
  const pendingNegotiateRef = useRef(false);

  // pc + streams
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  const audioSenderRef = useRef(null);
  const videoSenderRef = useRef(null);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // toggles
  const [micEnabled, setMicEnabled] = useState(false);
  const [camEnabled, setCamEnabled] = useState(false);

  // status
  const [pcState, setPcState] = useState("idle");
  const [error, setError] = useState(null);

  // ICE queue for *received* candidates before remoteDescription
  const pendingCandidatesRef = useRef([]);

  const ensureLocalStreamObj = () => {
    if (!localStreamRef.current) {
      localStreamRef.current = new MediaStream();
      setLocalStream(localStreamRef.current);
    }
    return localStreamRef.current;
  };

  const ensurePC = async () => {
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection({ iceServers: STUNS });
    pcRef.current = pc;

    pc.onicecandidate = (e) => {
      if (!e.candidate) return;
      // only send if we know who to send to
      const to = peerIdRef.current;
      if (!to) return;
      sendEvent("webrtc_ice", {
        to_user_id: to,
        from_user_id: myUserIdRef.current,
        candidate: e.candidate.toJSON ? e.candidate.toJSON() : e.candidate,
      });
    };

    pc.ontrack = (e) => {
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
        setRemoteStream(remoteStreamRef.current);
      }
      // add every incoming track
      e.streams[0].getTracks().forEach((t) => {
        if (!remoteStreamRef.current.getTracks().includes(t)) {
          remoteStreamRef.current.addTrack(t);
        }
      });
    };

    pc.oniceconnectionstatechange = () => setPcState(pc.iceConnectionState);

    // bind any pre-existing local tracks
    const ls = localStreamRef.current;
    if (ls) {
      const a = ls.getAudioTracks()[0];
      if (a && !audioSenderRef.current)
        audioSenderRef.current = pc.addTrack(a, ls);
      const v = ls.getVideoTracks()[0];
      if (v && !videoSenderRef.current)
        videoSenderRef.current = pc.addTrack(v, ls);
    }

    return pc;
  };

  const flushPendingCandidates = async () => {
    const pc = pcRef.current;
    if (!pc || !pc.remoteDescription) return;
    const q = pendingCandidatesRef.current;
    while (q.length) {
      const c = q.shift();
      try {
        await pc.addIceCandidate(c);
      } catch (e) {
        console.warn("addIceCandidate failed:", e);
      }
    }
  };

  const negotiate = async () => {
    const to = peerIdRef.current;
    if (!to) {
      // no peer yet; try later when we learn the peer id
      pendingNegotiateRef.current = true;
      return;
    }
    const pc = await ensurePC();
    // keep simple glare avoidance
    if (pc.signalingState !== "stable") return;
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendEvent("webrtc_offer", {
        to_user_id: to,
        from_user_id: myUserIdRef.current,
        sdp: pc.localDescription.sdp,
      });
    } catch (e) {
      console.error("negotiate error:", e);
    }
  };

  // WS signaling + presence
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket || !connected) return;

    const onMsg = async (event) => {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      try {
        switch (msg.type) {
          // === presence to discover peer ===
          case "presence": {
            const me = myUserIdRef.current;
            const others = Array.isArray(msg.users)
              ? msg.users.filter((u) => Number(u) !== Number(me))
              : [];
            if (others.length) {
              peerIdRef.current = Number(others[0]);
              // if we wanted to negotiate earlier, do it now
              if (pendingNegotiateRef.current && (micEnabled || camEnabled)) {
                pendingNegotiateRef.current = false;
                await negotiate();
              }
            }
            break;
          }
          case "presence_join": {
            const me = myUserIdRef.current;
            const joiner = Number(msg.user_id);
            if (joiner && joiner !== Number(me)) {
              peerIdRef.current = joiner;
              if (pendingNegotiateRef.current && (micEnabled || camEnabled)) {
                pendingNegotiateRef.current = false;
                await negotiate();
              }
            }
            break;
          }
          case "presence_leave": {
            const leaver = Number(msg.user_id);
            if (leaver && leaver === peerIdRef.current) {
              peerIdRef.current = null;
              // keep PC; user may come back. You can also hangUp() if desired.
            }
            break;
          }

          // === WebRTC signaling ===
          case "webrtc_offer": {
            const from = Number(msg.from_user_id);
            if (!peerIdRef.current) peerIdRef.current = from;
            const pc = await ensurePC();
            await pc.setRemoteDescription({ type: "offer", sdp: msg.sdp });
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            sendEvent("webrtc_answer", {
              to_user_id: peerIdRef.current,
              from_user_id: myUserIdRef.current,
              sdp: pc.localDescription.sdp,
            });
            await flushPendingCandidates();
            break;
          }
          case "webrtc_answer": {
            const pc = await ensurePC();
            await pc.setRemoteDescription({ type: "answer", sdp: msg.sdp });
            await flushPendingCandidates();
            break;
          }
          case "webrtc_ice": {
            const pc = await ensurePC();
            const cand = msg.candidate;
            if (!cand) return;
            if (pc.remoteDescription) {
              await pc.addIceCandidate(cand);
            } else {
              pendingCandidatesRef.current.push(cand);
            }
            break;
          }
          default:
            break;
        }
      } catch (e) {
        console.error("WS signal handling error:", e);
      }
    };

    socket.addEventListener("message", onMsg);

    // ask who is here so we can set peerId
    sendEvent("presence_get", {});

    return () => socket.removeEventListener("message", onMsg);
  }, [socketRef, connected, sendEvent, micEnabled, camEnabled]);

  // public actions
  const toggleMic = async () => {
    try {
      if (!micEnabled) {
        const stream = ensureLocalStreamObj();
        let track = stream.getAudioTracks()[0];
        if (!track) {
          const tmp =
            await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS);
          track = tmp.getAudioTracks()[0];
          if (!track) throw new Error("No audio track");
          stream.addTrack(track);
          setLocalStream(stream);
        }
        track.enabled = true;
        setMicEnabled(true);

        const pc = await ensurePC();
        if (!audioSenderRef.current) {
          audioSenderRef.current = pc.addTrack(track, stream);
          await negotiate();
        }
      } else {
        const t = localStreamRef.current?.getAudioTracks()?.[0];
        if (t) t.enabled = false;
        setMicEnabled(false);
      }
    } catch (e) {
      console.error("toggleMic error:", e);
      setError(e?.message || "Mic error");
    }
  };

  const toggleCam = async () => {
    try {
      if (!camEnabled) {
        const stream = ensureLocalStreamObj();
        let track = stream.getVideoTracks()[0];
        if (!track) {
          const tmp =
            await navigator.mediaDevices.getUserMedia(VIDEO_CONSTRAINTS);
          track = tmp.getVideoTracks()[0];
          if (!track) throw new Error("No video track");
          stream.addTrack(track);
          setLocalStream(stream);
        }
        track.enabled = true;
        setCamEnabled(true);

        const pc = await ensurePC();
        if (videoSenderRef.current) {
          await videoSenderRef.current.replaceTrack(track);
        } else {
          videoSenderRef.current = pc.addTrack(track, stream);
          await negotiate();
        }
      } else {
        const t = localStreamRef.current?.getVideoTracks()?.[0];
        if (t) t.enabled = false;
        setCamEnabled(false);
      }
    } catch (e) {
      console.error("toggleCam error:", e);
      setError(e?.message || "Camera error");
    }
  };

  const hangUp = () => {
    try {
      setMicEnabled(false);
      setCamEnabled(false);

      const ls = localStreamRef.current;
      if (ls) {
        ls.getTracks().forEach((t) => {
          try {
            t.stop();
          } catch {}
        });
      }

      if (pcRef.current) {
        try {
          pcRef.current.close();
        } catch {}
      }
    } finally {
      pcRef.current = null;
      audioSenderRef.current = null;
      videoSenderRef.current = null;
      pendingCandidatesRef.current = [];
    }
  };

  useEffect(() => () => hangUp(), []);

  return {
    localStream,
    remoteStream,
    micEnabled,
    camEnabled,
    pcState,
    error,
    toggleMic,
    toggleCam,
    hangUp,
  };
};

export default useVideo;
