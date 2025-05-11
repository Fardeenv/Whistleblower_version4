import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaStop, FaPlay, FaTrash } from 'react-icons/fa';

const VoiceRecorder = ({ onVoiceNote = () => {} }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(new Audio());
  
  useEffect(() => {
    console.log('VoiceRecorder mounted, onVoiceNote:', typeof onVoiceNote);
    return () => {
      console.log('VoiceRecorder unmounting');
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        console.log('Recording stopped, calling onVoiceNote');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        if (typeof onVoiceNote === 'function') {
          onVoiceNote(audioBlob);
        } else {
          console.warn('onVoiceNote is not a function:', onVoiceNote);
        }
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please ensure permissions are granted.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };
  
  const playRecording = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      audioRef.current.src = url;
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
      
      setIsPlaying(true);
      audioRef.current.play();
    }
  };
  
  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };
  
  const deleteRecording = () => {
    setAudioBlob(null);
    if (typeof onVoiceNote === 'function') {
      onVoiceNote(null);
    } else {
      console.warn('onVoiceNote is not a function:', onVoiceNote);
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    
    setIsPlaying(false);
  };
  
  return (
    <div className="voice-recorder">
      {!audioBlob ? (
        <div className="recorder-controls">
          <button 
            type="button"
            className={`record-button ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? <FaStop /> : <FaMicrophone />}
          </button>
          
          {isRecording && (
            <div className="recording-time">
              <span className="recording-indicator"></span>
              {formatTime(recordingTime)}
            </div>
          )}
        </div>
      ) : (
        <div className="recording-playback">
          <div className="recording-info">
            <span className="recording-duration">
              Voice note recorded ({formatTime(recordingTime)})
            </span>
            
            <div className="playback-controls">
              <button 
                type="button"
                className="playback-button"
                onClick={isPlaying ? stopPlayback : playRecording}
              >
                {isPlaying ? <FaStop /> : <FaPlay />}
              </button>
              
              <button 
                type="button"
                className="delete-button"
                onClick={deleteRecording}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;