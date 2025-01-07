import React, { useState, useEffect } from 'react';
import startIcon from '../start-icon.png';

const workInterval = 25 * 60;
const breakInterval = 5 * 60;

const PomodoroTimer = () => {
  const [time, setTime] = useState(-workInterval);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkTime, setIsWorkTime] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Check for notification permissions on mount
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        setNotificationsEnabled(permission === "granted");
      });
    }
  }, []);

  // Timer logic
  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTime(prev => prev + 1);
        console.log("stuff");
      }, 1000);
      // TODO: set an 'original time' and set the timeout to the
      // amount of time until the next second, (not always 1000)
      // Over a long running timer, the current logic will drift
    }
    if (time === 0) {
      notifyUser();
    }
    return () => clearInterval(timer);
  }, [isRunning, time]);

  const formatTime = (seconds) => {
    const plus = seconds > 0 ? "+" : "";
    seconds = seconds > 0 ? seconds : -seconds;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${plus}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const notifyUser = () => {
    
    if (notificationsEnabled) {
      const mainNotification = new Notification(
        isWorkTime ? "Work Time Complete!" : "Break Time Complete!", 
        {
          body: isWorkTime ? 
            "Click here to start your break" : 
            "Click here to start working",
          tag: 'main-action',
          icon: startIcon,
        }
      );

      mainNotification.onclick = () => {
        switchMode();
        mainNotification.close();
        window.focus(); // TODO: do I really want to refocus the tab? Maybe only do this if isWorkTime?
      };
    }
  };

  const switchMode = () => {
    setIsWorkTime(prev => !prev);
    setTime(isWorkTime ? -breakInterval : -workInterval);
    setIsRunning(true);
  };

  const resetTimer = () => {
    // we always go to work mode when resetting
    setIsWorkTime(true);
    setTime(-workInterval);
    setIsRunning(false);
  };

  const handlePlayPause = () => {
    toggleTimer();
  }

  const handleReset = () => {
    resetTimer();
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  // const getNotificationPermissions = () => {
  //   Notification.requestPermission().then(permission => {
  //     setNotificationsEnabled(permission === "granted");
  //   });
  // }

  return (
      <div className="text-slate-600">
        {/* Timer and Controls Container */}
        <div className="flex gap-4">

          {/* Controls */}
          <span className="flex gap-2">

            {/* Play/Pause button */}
            <button
              className={`px-4 py-2 rounded-lg ${
                isRunning 
                ? "bg-red-500 hover:bg-red-600" 
                : "bg-green-500 hover:bg-green-600"
              } text-white`}
              onClick={handlePlayPause}
            >
              {isRunning ? "⏸" : "▶"}
            </button>

            {/* Reset button */}
            <button
              className="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white"
              onClick={handleReset}
            >
              ↺
            </button>
          </span>

          {/* Timer Display */}
          <span className="text-5xl font-mono font-bold">
            {formatTime(time)}
          </span>
        </div>
      </div>
  );
};

export default PomodoroTimer;